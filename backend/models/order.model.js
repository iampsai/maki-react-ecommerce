import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'cod', 'pickup']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentSessionId: {
        type: String,
        unique: true,
        sparse: true
    },
    customerInfo: {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: function() {
                return this.paymentMethod === 'cod';
            }
        },
        city: {
            type: String,
            required: function() {
                return this.paymentMethod === 'cod';
            }
        },
        postalCode: {
            type: String,
            required: function() {
                return this.paymentMethod === 'cod';
            }
        },
        notes: {
            type: String,
            default: ''
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;