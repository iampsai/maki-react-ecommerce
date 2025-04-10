import React, {useEffect, useState} from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MapPin, Truck, CreditCard, ShoppingBag } from "lucide-react";

import { useCartStore } from "../stores/useCartStore.js";
import axios from "../lib/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, total, subtotal, coupon, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedSavings = savings.toFixed(2);
  const formattedTotal = total.toFixed(2);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        // Handle Stripe payment
        // const response = await axios.post('/payment/create-checkout-session', {
        //   products: cart,
        //   couponCode: coupon ? coupon.code : null
        // });
        
        // For Stripe, we'll clear the cart after successful payment callback
        // Redirect to Stripe checkout
        // console.log('Redirecting to Stripe checkout...', response.data);

        // For mock payment, use create-alternative-order endpoint
        const response = await axios.post('/payment/create-alternative-order', {
          products: cart,
          couponCode: coupon ? coupon.code : null,
          paymentMethod,
          customerInfo: formData
        });

        console.log('Redirecting to Stripe checkout...', response.data);

        if (response.data.success) {
          // Clear the cart both in the backend and frontend
          await clearCart();
          navigate(`/purchase-success?session_id=${response.data.orderId}`);
          toast.success('Order placed successfully!');
        }
      } else {
        // Handle cash on delivery or in-store pickup
        const response = await axios.post('/payment/create-alternative-order', {
          products: cart,
          couponCode: coupon ? coupon.code : null,
          paymentMethod,
          customerInfo: formData
        });

        if (response.data.success) {
          // Clear the cart both in the backend and frontend
          await clearCart();
          navigate(`/purchase-success?session_id=${response.data.orderId}`);
          toast.success('Order placed successfully!');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong with your checkout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information - Only show for delivery options */}
              {paymentMethod !== 'pickup' && (
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-semibold text-emerald-400 mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required={paymentMethod === 'cod'}
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">City</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required={paymentMethod === 'cod'}
                          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-300 mb-1">Postal Code</label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          required={paymentMethod === 'cod'}
                          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    className={`p-4 rounded-lg border ${paymentMethod === 'card' ? 'border-emerald-500 bg-gray-700' : 'border-gray-600 bg-gray-800'} cursor-pointer`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePaymentMethodChange('card')}
                  >
                    <div className="flex items-center space-x-3">
                      <CreditCard className="text-emerald-400" size={24} />
                      <div>
                        <p className="font-medium text-white">Credit Card</p>
                        <p className="text-xs text-gray-400">Pay securely online</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg border ${paymentMethod === 'cod' ? 'border-emerald-500 bg-gray-700' : 'border-gray-600 bg-gray-800'} cursor-pointer`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePaymentMethodChange('cod')}
                  >
                    <div className="flex items-center space-x-3">
                      <Truck className="text-emerald-400" size={24} />
                      <div>
                        <p className="font-medium text-white">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay when you receive</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className={`p-4 rounded-lg border ${paymentMethod === 'pickup' ? 'border-emerald-500 bg-gray-700' : 'border-gray-600 bg-gray-800'} cursor-pointer`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePaymentMethodChange('pickup')}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-emerald-400" size={24} />
                      <div>
                        <p className="font-medium text-white">Store Pickup</p>
                        <p className="text-xs text-gray-400">Pick up at our store</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4">Additional Notes</h2>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Any special instructions for your order..."
                  ></textarea>
                </div>
              </div>
            </form>
          </div>

          {/* Right column - Order Summary */}
          <div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 sticky top-6">
              <h2 className="text-xl font-semibold text-emerald-400 mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3 pb-3 border-b border-gray-700">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-white">₱{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <p className="text-gray-300">Subtotal</p>
                    <p className="text-white">₱{formattedSubtotal}</p>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-300">Discount</p>
                      <p className="text-emerald-400">-₱{formattedSavings}</p>
                    </div>
                  )}
                  
                  {coupon && (
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-300">Coupon ({coupon.code})</p>
                      <p className="text-emerald-400">-{coupon.discountPercentage}%</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-700">
                    <p className="text-white">Total</p>
                    <p className="text-emerald-400">₱{formattedTotal}</p>
                  </div>
                </div>
              </div>
              
              <motion.button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
              >
                <ShoppingBag size={18} />
                <span>Complete Order</span>
              </motion.button>
              
              <p className="mt-4 text-xs text-gray-400 text-center">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
