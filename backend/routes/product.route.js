import express from "express";
import {adminRoute, protectedRoute} from "../middleware/auth.middleware.js";
import {
    createProduct,
    deleteProduct,
    featuredProducts,
    getAllProducts,
    getProductByCategory,
    recommendedProducts,
    toggleFeaturedProduct,
    updateProduct
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts);
router.get("/featured", featuredProducts);
router.get("/category/:category", getProductByCategory);
router.get("/recommendations", recommendedProducts);
router.post("/", protectedRoute, adminRoute, createProduct);
router.patch("/:id", protectedRoute, adminRoute, toggleFeaturedProduct);
router.put("/:id", protectedRoute, adminRoute, updateProduct);
router.delete("/:id", protectedRoute, adminRoute, deleteProduct);

export default router;