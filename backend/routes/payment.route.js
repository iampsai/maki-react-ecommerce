import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import {
  checkOutSuccess, 
  createCheckoutSession, 
  createAlternativeOrder
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectedRoute, createCheckoutSession);
router.post("/checkout-success", protectedRoute, checkOutSuccess);
router.post("/create-alternative-order", protectedRoute, createAlternativeOrder);

export default router;