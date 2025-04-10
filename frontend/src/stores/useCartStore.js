import {create} from "zustand";
import axios from "../lib/axios.js";
import {toast} from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,
  isCouponApplied: false,
  loading: false,

  fetchCartItems: async () => {
    set({loading: true});
    try {
      const response = await axios.get("/cart");
      console.log("Data:", response.data);
      set({cart: response.data});

      get().calculateTotal();
      set({loading: false});
    } catch (error) {
      set({cart: []});
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", {productId: product._id});
      toast.success("Product added to cart");

      set((prevState) => {
        const existingItem = prevState.cart.find((item) => item._id === product._id);
        const newCart = existingItem
          ? prevState.cart.map((item) =>
            item._id === product._id ? {...item, quantity: item.quantity + 1} : item
          ) : [...prevState.cart, {...product, quantity: 1}];
        return {cart: newCart};
      });

      get().calculateTotal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/cart`, {data: {productId}});
      toast.success("Product removed from cart");
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId)
      }));
      get().calculateTotal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity === 0) return get().removeFromCart(productId);

    try {
      await axios.put(`/cart/${productId}`, {quantity});
      // toast.success("Product quantity updated");
      set((prevState) => ({cart: prevState.cart.map((item) => item._id === productId ? {...item, quantity} : item)
      }));
      get().calculateTotal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  clearCart: async () => {
    try {
      await axios.delete('/cart/clear');
      set({ cart: [], coupon: null, total: 0, subtotal: 0, isCouponApplied: false });
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(error.response?.data?.message || 'Failed to clear cart');
      // Still clear the local state even if the API call fails
      set({ cart: [], coupon: null, total: 0, subtotal: 0, isCouponApplied: false });
    }
  },

  calculateTotal: () => {
    const {cart, coupon} = get();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let total = subtotal;
    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({subtotal, total});
  },

  // Coupons
  getMyCoupon: async () => {
    try {
      const response = await axios.get("/coupons");
      set({ coupon: response.data });
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
  },
  applyCoupon: async (code) => {
    try {
      const response = await axios.post("/coupons/validate", { code });
      set({ coupon: response.data, isCouponApplied: true });
      get().calculateTotal();
      toast.success("Coupon applied successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },
  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calculateTotal();
    toast.success("Coupon removed");
  },
}));