import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import {stripe} from "../lib/stripe.js";
import mongoose from "mongoose";

export const createCheckoutSession = async (req, res) => {
  try {
    const {products, couponCode} = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({error: "Invalid product data"});
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "php",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({code: couponCode, userId: req.user._id, isActive: true});

      if (!coupon) {
        return res.status(400).json({error: "Invalid coupon code"});
      }

      // Apply the discount
      totalAmount -= Math.round(totalAmount * (coupon.discountPercentage / 100));
    }

    // const session = await createCheckoutSession(lineItems, totalAmount, couponCode);

    const session = await stripe.checkout.session.create({
      payment_method_types: ["card", "cash_on_delivery", "pickup_in_store"],
      line_items: lineItems,
      mode: "payment",
      success_url: `process.env.CLIENT_URL/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `process.env.CLIENT_URL/payment-cancelled`,
      discounts: coupon ? [{coupon: await createStripeCoupon(coupon.discountPercentage)}] : [],
      metadata: {
        userId: req.user._id.toString,
        products: JSON.stringify(
          products.map((product) => ({
            productId: product._id,
            quantity: product.quantity,
            price: product.price
          }))
        ),
        coupon: JSON.stringify(coupon)
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({id: session.id, totalAmount: totalAmount / 100});
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({message: "Server error", error: error.message});
  }
};

export const checkOutSuccess = async (req, res) => {
  try {
    const {session_id} = req.body;
    if (!session_id) {
      return res.status(400).json({message: "Session ID is required"});
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate({
          couponCode: session.metadata.couponCode,
          userId: req.user._id
        }, {isActive: false});
      }

      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        userId: session.metadata.userId,
        products: products.map((product) => ({
          product: product.productId,
          quantity: product.quantity,
          price: product.price
        })),
        totalAmount: session.amount_total / 100,
        paymentMethod: "card",
        status: "paid",
        paymentSessionId: session_id,
        customerInfo: {
          fullName: req.user.name || 'Customer',
          email: req.user.email,
          phone: req.user.phone || '',
          notes: ''
        }
      });

      await newOrder.save();

      // Clear the user's cart after successful payment
      if (req.user) {
        req.user.cartItems = [];
        await req.user.save();
      }

      res.status(200).json({
        success: true,
        message: "Payment successful and order created",
        orderId: newOrder._id
      });
    }
  } catch (error) {
    console.error("Error processing successful payment:", error);
    res.status(500).json({message: "Server error", error: error.message});
  }
}

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    duration: "once",
    percent_off: discountPercentage,
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  return new Coupon({
    code: "GIFT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId: userId,
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });
}

export const createAlternativeOrder = async (req, res) => {
  try {
    const { products, couponCode, paymentMethod, customerInfo } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid product data" });
    }

    if (!paymentMethod || (paymentMethod !== 'cod' && paymentMethod !== 'pickup')) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    // Calculate total amount
    let subtotal = 0;
    products.forEach(product => {
      subtotal += product.price * product.quantity;
    });

    let totalAmount = subtotal;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });

      if (appliedCoupon) {
        // Apply the discount
        totalAmount -= (totalAmount * (appliedCoupon.discountPercentage / 100));
        
        // Mark coupon as used
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { isActive: false });
      }
    }

    // Create new order
    const newOrder = new Order({
      userId: req.user._id,
      products: products.map(product => ({
        product: product._id,
        quantity: product.quantity,
        price: product.price
      })),
      totalAmount,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'processing',
      // Generate a unique ID for alternative payment methods
      paymentSessionId: `${paymentMethod}-${req.user._id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      customerInfo: {
        fullName: customerInfo.fullName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: paymentMethod === 'cod' ? customerInfo.address : null,
        city: paymentMethod === 'cod' ? customerInfo.city : null,
        postalCode: paymentMethod === 'cod' ? customerInfo.postalCode : null,
        notes: customerInfo.notes || ''
      }
    });

    await newOrder.save();
    
    // Clear the user's cart after successful order
    if (req.user) {
      req.user.cartItems = [];
      await req.user.save();
    }

    // Create a new coupon if order amount is high enough
    if (totalAmount >= 20000) {
      const newCoupon = await createNewCoupon(req.user._id);
      await newCoupon.save();
    }

    res.status(200).json({
      success: true,
      message: `Order placed successfully with ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'In-store Pickup'}`,
      orderId: newOrder._id
    });

  } catch (error) {
    console.error("Error creating alternative order:", error);
    res.status(500).json({ message: error.message });
  }
};