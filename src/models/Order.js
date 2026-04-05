const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String
        }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variant: {
            name: String,
            value: String
        },
        quantity: Number,
        priceAtPurchase: Number
    }],
    pricing: {
        subtotal: Number,
        shipping: Number,
        tax: Number,
        discount: Number,
        total: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    stripePaymentIntentId: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
