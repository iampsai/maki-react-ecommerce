import {useEffect} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import {Toaster} from "react-hot-toast";

import {useUserStore} from "./stores/useUserStore.js";
import {useCartStore} from "./stores/useCartStore.js";

import Navbar from "./components/Navbar.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage.jsx";
import PurchaseCancelPage from "./pages/PurchaseCancelPage.jsx";

function App() {
  const {user, checkAuth, checkingAuth} = useUserStore();
  const {fetchCartItems} = useCartStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    fetchCartItems();
  }, [user, fetchCartItems]);

  if (checkingAuth) return <LoadingSpinner/>;

  return (
    <div className={"min-h-screen bg-gray-400 text-white overflow-hidden"}>
      <div className={"absolute inset-0 overflow-hidden"}>
        <div className={"absolute inset-0"}>
          <div className={"absolute top-0 left-1/2 -translate-x-1/2 w-full h-full" +
            " bg-radial-[ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0)_45%,rgba(0,0,0,0)_100%]"}></div>
        </div>
      </div>

      <div className={"relative z-50 pt-14"}>
        <Navbar/>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/signup" element={!user ? <SignUpPage/> : <Navigate to={"/"}/>}/>
          <Route path="/login" element={!user ? <LoginPage/> : <Navigate to={"/"}/>}/>
          <Route path="/admin-dashboard" element={user?.role === "admin" ? <AdminPage/> : <Navigate to={"/login"}/>}/>
          <Route path="/category/:category" element={<CategoryPage/>}/>
          <Route path="/cart" element={user ? <CartPage/> : <Navigate to={"/login"}/>}/>
          <Route path="/checkout" element={user ? <CheckoutPage/> : <Navigate to={"/login"}/>}/>
          <Route path="/purchase-success" element={user ? <PurchaseSuccessPage/> : <Navigate to={"/login"}/>}/>
          <Route path="/purchase-cancelled" element={user ? <PurchaseCancelPage/> : <Navigate to={"/login"}/>}/>
        </Routes>
      </div>
      <Toaster/>
    </div>
  )
}

export default App