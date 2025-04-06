import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateReceipt, ensureDirectoryExists } from "../utils/receiptGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all orders for admin with pagination and filtering
export const getAdminOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    // Build the filter
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    // Count total orders matching the filter
    const total = await Order.countDocuments(filter);

    // Get orders with pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .populate("products.product", "name image");

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      orders
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get orders for a specific user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("products.product", "name image");

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("products.product", "name image price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the user is authorized to view this order
    if (!req.user.isAdmin && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status value
    const validStatuses = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Generate and download receipt for an order
export const generateOrderReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("products.product", "name image price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create receipts directory if it doesn't exist
    const receiptsDir = path.join(__dirname, "../receipts");
    ensureDirectoryExists(receiptsDir);

    // Generate receipt filename
    const filename = `receipt-${order._id}-${Date.now()}.pdf`;
    const outputPath = path.join(receiptsDir, filename);

    // Generate the receipt PDF
    await generateReceipt(order, outputPath);

    // Send the file as a response
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error("Error sending receipt:", err);
        return res.status(500).json({ message: "Error sending receipt", error: err.message });
      }
      
      // Delete the file after sending
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting temporary receipt file:", unlinkErr);
        }
      });
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
