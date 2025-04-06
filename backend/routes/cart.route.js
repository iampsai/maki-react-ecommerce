import express from "express";
import {addToCart, getCart, removeAllFromCart, updateCart, clearCart} from "../controllers/cart.controller.js";
import {protectedRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, getCart);
router.post("/", protectedRoute, addToCart);
router.delete("/", protectedRoute, removeAllFromCart);
router.delete("/clear", protectedRoute, clearCart);
router.put("/:id", protectedRoute, updateCart);

export default router;