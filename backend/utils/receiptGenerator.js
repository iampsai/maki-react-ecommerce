import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceipt = async (order, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF to the output file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add company logo and header
      doc.fontSize(20).text('RECEIPT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text('Maki E-Commerce', { align: 'center' });
      doc.fontSize(10).text('123 Shopping Street, E-Commerce City', { align: 'center' });
      doc.fontSize(10).text('Phone: +1-234-567-8900 | Email: support@maki-ecommerce.com', { align: 'center' });
      
      // Add a horizontal line
      doc.moveDown();
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown();
      
      // Add order details
      doc.fontSize(12).text(`Receipt No: ${order._id}`);
      doc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
      doc.moveDown();
      
      // Add customer information
      doc.fontSize(12).text('Customer Information:');
      doc.fontSize(10).text(`Name: ${order.customerInfo.fullName}`);
      doc.fontSize(10).text(`Email: ${order.customerInfo.email}`);
      doc.fontSize(10).text(`Phone: ${order.customerInfo.phone}`);
      
      if (order.paymentMethod === 'cod') {
        doc.fontSize(10).text(`Address: ${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.postalCode}`);
      }
      
      if (order.customerInfo.notes) {
        doc.fontSize(10).text(`Notes: ${order.customerInfo.notes}`);
      }
      
      doc.moveDown();
      
      // Add payment information
      doc.fontSize(12).text('Payment Information:');
      doc.fontSize(10).text(`Payment Method: ${
        order.paymentMethod === 'card' ? 'Credit Card' : 
        order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
        'In-store Pickup'
      }`);
      doc.fontSize(10).text(`Payment Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`);
      doc.moveDown();
      
      // Add order items table
      doc.fontSize(12).text('Order Items:');
      doc.moveDown();
      
      // Table headers
      const tableTop = doc.y;
      const itemX = 50;
      const quantityX = 300;
      const priceX = 370;
      const amountX = 450;
      
      doc.fontSize(10)
         .text('Item', itemX, tableTop)
         .text('Quantity', quantityX, tableTop)
         .text('Price', priceX, tableTop)
         .text('Amount', amountX, tableTop);
      
      // Draw a line below the header
      doc.moveTo(50, tableTop + 15)
         .lineTo(doc.page.width - 50, tableTop + 15)
         .stroke();
      
      // Add table rows
      let tableRow = tableTop + 25;
      let subtotal = 0;
      
      order.products.forEach(item => {
        const productName = item.product.name || `Product ID: ${item.product}`;
        const quantity = item.quantity;
        const price = item.price;
        const amount = quantity * price;
        subtotal += amount;
        
        // Check if we need a new page
        if (tableRow + 15 > doc.page.height - 50) {
          doc.addPage();
          tableRow = 50;
        }
        
        doc.fontSize(10)
           .text(productName, itemX, tableRow)
           .text(quantity.toString(), quantityX, tableRow)
           .text(`₱${price.toLocaleString()}`, priceX, tableRow)
           .text(`₱${amount.toLocaleString()}`, amountX, tableRow);
        
        tableRow += 20;
      });
      
      // Draw a line below the items
      doc.moveTo(50, tableRow)
         .lineTo(doc.page.width - 50, tableRow)
         .stroke();
      
      // Add total
      tableRow += 15;
      doc.fontSize(10)
         .text('Subtotal:', 350, tableRow)
         .text(`₱${subtotal.toLocaleString()}`, amountX, tableRow);
      
      tableRow += 15;
      doc.fontSize(12)
         .text('Total:', 350, tableRow)
         .text(`₱${order.totalAmount.toLocaleString()}`, amountX, tableRow);
      
      // Add footer
      doc.fontSize(10);
      const bottomOfPage = doc.page.height - 50;
      doc.text('Thank you for your purchase!', 50, bottomOfPage - 30, { align: 'center' });
      doc.text('For questions or concerns, please contact our customer service.', 50, bottomOfPage - 15, { align: 'center' });
      
      // Finalize the PDF
      doc.end();
      
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};
