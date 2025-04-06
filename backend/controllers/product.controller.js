import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";
import {redis} from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({products});
    } catch (error) {
        console.log("Error fetching products", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
}

export const featuredProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        featuredProducts = await Product.find({ isFeatured: true }).lean();
        if(!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" });
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.status(200).json(featuredProducts);
    } catch (error) {
        console.log("Error fetching products", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
}

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category, isFeatured} = req.body;

        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : "",
            category,
            isFeatured
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error creating product", error);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if(product.image) {
            const imageId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(imageId, { folder: "products" });
                console.log("Image deleted from cloudinary");
            } catch (error) {
                console.log("Error deleting image from cloudinary", error);
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error deleting product", error.message);
        res.status(500).json({ message: "Error deleting product", error });
    }
}

export const recommendedProducts = async (req, res) => {
    try {
        const product = await Product.aggregate([
            {$sample: {size: 2}},
            {$project: {_id: 1, name: 1, description: 1, image: 1, price: 1}}
        ])

        res.status(200).json(product);
    } catch (error) {
        console.log("Error fetching recommended products", error.message);
        res.status(500).json({ message: "Server error", error });
    }
}

export const getProductByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Product.find({ category });
        res.status(200).json({products});
    } catch (error) {
        console.log("Error fetching products by category", error.message);
        res.status(500).json({ message: "Server error", error });
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        await updateFeaturedProductsCache();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.log("Error toggling featured product", error.message);
        res.status(500).json({ message: "Server error", error });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, category, isFeatured } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Handle image update if a new image is provided
        let imageUrl = product.image;
        if (image && image !== product.image) {
            // If there's an existing image, delete it from cloudinary
            if (product.image) {
                try {
                    const publicId = product.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`products/${publicId}`);
                } catch (error) {
                    console.log("Error deleting old image from cloudinary", error);
                }
            }

            // Upload new image
            const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
            imageUrl = cloudinaryResponse?.secure_url || "";
        }

        // Update product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.image = imageUrl;
        product.category = category || product.category;
        product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;

        const updatedProduct = await product.save();

        // Update cache if the product is featured
        if (updatedProduct.isFeatured) {
            await updateFeaturedProductsCache();
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.log("Error updating product", error.message);
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
}

async function updateFeaturedProductsCache() {
    try {
        // Update cache
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("Error updating featured products cache", error.message);
    }
}