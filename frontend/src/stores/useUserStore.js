import {create} from "zustand";
import axios from "../lib/axios.js";
import {toast} from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({name, email, password, confirmPassword}) => {
    set({loading: true});

    if (password !== confirmPassword) {
      set({loading: false});
      return toast.error("Passwords do not match");
    }

    try {
      const response = await axios.post("/auth/signup", {name, email, password});
      set({user: response.data.user, loading: false});
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  login: async (email, password) => {
    set({loading: true});

    try {
      const response = await axios.post("/auth/login", {email, password});
      set({user: response.data.user, loading: false});
      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({user: null, loading: false});
      toast.success("Logout successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      set({loading: false});
    }
  },

  checkAuth: async () => {
    set({checkingAuth: true});

    try {
      const response = await axios.get("/auth/profile");
      // console.log("Data:",response.data.user);
      set({user: response.data.user, checkingAuth: false});
    } catch (error) {
      console.error("Auth check error:", error);

      // Don't show error toast for 401 unauthorized errors (user not logged in)
      // This is an expected case when checking auth status
      if (error.response?.status !== 401) {
        const errorMessage = error.response?.data?.message || "Authentication failed";
        toast.error(errorMessage);
      }
      
      set({user: null, checkingAuth: false});
    }
  }
}));
