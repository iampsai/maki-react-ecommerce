import express from "express";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";
import { 
  getAdminOrders, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus,
  generateOrderReceipt
} from "../controllers/order.controller.js";

const router = express.Router();

// Admin routes
router.get("/admin", protectedRoute, adminRoute, getAdminOrders);
router.patch("/:orderId/status", protectedRoute, adminRoute, updateOrderStatus);
router.get("/:orderId/receipt", protectedRoute, generateOrderReceipt);

// User routes
router.get("/user", protectedRoute, getUserOrders);
router.get("/:orderId", protectedRoute, getOrderById);

export default router;
