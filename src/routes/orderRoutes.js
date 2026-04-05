const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { v4: uuidv4 } = require('uuid');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Initializes a secure Stripe Checkout Intent from an active Cart
 *     tags: [Checkout]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartToken:
 *                 type: string
 *                 example: 'cookie-cart-token-xyz'
 *               customer:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order staged in Pending state, returning a Stripe Client Secret.
 *       400:
 *         description: Cart missing or empty.
 */
// POST /checkout
router.post('/checkout', async (req, res) => {
    try {
        const { cartToken, customer, couponCode } = req.body;

        // Validate inputs
        if (!cartToken || !customer) {
            return res.status(400).json({ message: 'Missing cart token or customer info' });
        }

        // Get Cart
        const cart = await Cart.findOne({ cartToken }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty or invalid' });
        }

        // Calculate Totals
        let subtotal = 0;
        const orderItems = [];

        cart.items.forEach(item => {
            subtotal += item.priceAtAdd * item.quantity;
            orderItems.push({
                product: item.product._id,
                variant: item.variant,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtAdd
            });
        });

        // Simple business logic for additional costs
        const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        
        let discount = 0; 
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon && (!coupon.expirationDate || coupon.expirationDate > new Date())) {
                discount = subtotal * (coupon.discountPercentage / 100);
            }
        }
        
        const total = subtotal + shipping + tax - discount;
        const totalAmountCents = Math.round(total * 100);

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountCents,
            currency: 'usd',
            metadata: { cartToken }
        });

        // Create Order (stored in 'Pending' state)
        const order = new Order({
            orderNumber: `ORD-${uuidv4().split('-')[0].toUpperCase()}`,
            customer,
            items: orderItems,
            pricing: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                shipping: parseFloat(shipping.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                discount: parseFloat(discount.toFixed(2)),
                total: parseFloat(total.toFixed(2))
            },
            stripePaymentIntentId: paymentIntent.id
        });

        await order.save();

        res.status(201).json({
            message: 'Order created, awaiting payment',
            clientSecret: paymentIntent.client_secret,
            orderId: order._id,
            orderNumber: order.orderNumber,
            total: order.pricing.total
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /orders/:id
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
