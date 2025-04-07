import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { Package, Truck, CheckCircle, XCircle, Clock, CreditCard, PhilippinePeso, Store, FileText } from "lucide-react";

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/orders/admin?page=${currentPage}&limit=10&status=${filter}`);
      
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        setTotalPages(Math.ceil(response.data.total / 10) || 1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Update the order in the local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };
  
  const downloadReceipt = async (orderId) => {
    try {
      // Show loading state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, isGeneratingReceipt: true } : order
      ));
      
      // Make a GET request to download the receipt
      const response = await axios.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob' // Important for handling file downloads
      });
      
      // Create a blob URL for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Remove loading state
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          const { isGeneratingReceipt, ...rest } = order;
          return rest;
        }
        return order;
      }));
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
      
      // Remove loading state on error
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          const { isGeneratingReceipt, ...rest } = order;
          return rest;
        }
        return order;
      }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "paid":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "cod":
        return <PhilippinePeso className="h-5 w-5 text-green-500" />;
      case "pickup":
        return <Store className="h-5 w-5 text-purple-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "all" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "pending" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("processing")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "processing" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "paid" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter("shipped")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "shipped" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter("delivered")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "delivered" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === "cancelled" ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div
          className="bg-gray-800/60 rounded-lg p-8 shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-400">No orders found</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              className="bg-gray-800/60 rounded-lg p-4 shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">Order ID:</span>
                    <span className="text-sm font-mono text-white">{order._id}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">Date:</span>
                      <span className="text-sm text-white">{formatDate(order.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">Customer:</span>
                      <span className="text-sm text-white">{order.customerInfo?.fullName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">Total:</span>
                      <span className="text-sm font-semibold text-white">₱{order.totalAmount?.toLocaleString() || '0'}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">Payment:</span>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span className="text-sm text-white capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                           order.paymentMethod === 'pickup' ? 'In-store Pickup' : 'Credit Card'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Products:</span>
                    <div className="mt-1 grid grid-cols-1 gap-2">
                      {order.products?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-white">
                          <span className="bg-gray-700 px-2 py-1 rounded-md">{item.quantity}x</span>
                          <span>{item.product?.name || `Product ID: ${item.product}`}</span>
                          <span className="text-gray-400">₱{item.price?.toLocaleString() || '0'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">Status:</span>
                    <div className="flex items-center gap-1 bg-gray-700/50 px-3 py-1 rounded-full">
                      {getStatusIcon(order.status)}
                      <span className="text-sm text-white capitalize">{order.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <select
                      className="bg-gray-700 text-white text-sm rounded-md px-3 py-2 w-full"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <button
                      onClick={() => downloadReceipt(order._id)}
                      disabled={order.isGeneratingReceipt}
                      className={`flex items-center justify-center gap-1 text-sm rounded-md px-3 py-2 ${order.isGeneratingReceipt 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                      {order.isGeneratingReceipt ? (
                        <>
                          <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Receipt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1 ? "bg-gray-700 text-gray-500" : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex items-center px-3 py-1 bg-gray-700 rounded-md text-white">
                  {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages ? "bg-gray-700 text-gray-500" : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
