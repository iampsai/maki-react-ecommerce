import {create} from "zustand";
import {toast} from "react-hot-toast";
import axios from "../lib/axios.js";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({products}),

  fetchAllProducts: async () => {
    set({loading: true});
    try {
      const response = await axios.get("/products");
      set({products: response.data.products, loading: false});
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  fetchProductsByCategory: async (category) => {
    set({loading: true});
    try {
      const response = await axios.get(`/products/category/${category}`);
      // console.log("Response:", response.data);
      set({products: response.data.products, loading: false});
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  createProduct: async (productData) => {
    set({loading: true});
    try {
      const response = await axios.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, response.data.product],
        loading: false
      }))
      toast.success("Product created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  deleteProduct: async (id) => {
    set({loading: true});
    try {
      await axios.delete(`/products/${id}`);
      set((prevState) => ({
        products: prevState.products.filter((product) => product._id !== id),
        loading: false
      }))
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({loading: true});
    try {
      const response = await axios.patch(`/products/${productId}`);
      // console.log("Response:", response.data);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === productId ? {...product, isFeatured: response.data.isFeatured} : product
        ),
        loading: false
      }))
      toast.success("Product updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products/featured");
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      console.log("Error fetching featured products:", error);
    }
  },
  
  updateProduct: async (productId, productData) => {
    set({loading: true});
    try {
      const response = await axios.put(`/products/${productId}`, productData);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === productId ? {...product, ...response.data.product} : product
        ),
        loading: false
      }))
      toast.success("Product updated successfully");
      return response.data.product;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
      throw error;
    }
  }
}));