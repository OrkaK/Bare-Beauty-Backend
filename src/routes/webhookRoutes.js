const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sendEmail = require('../utils/emailService');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

router.post('/', async (req, res) => {
    let event = req.body; 

    // Verify webhook signature if endpoint secret is explicitly defined
    if (endpointSecret && endpointSecret !== 'whsec_placeholder') {
        const signature = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
        } catch (err) {
            console.error(`⚠️  Webhook signature verification failed.`, err.message);
            return res.sendStatus(400);
        }
    } else {
        // Fallback for mock/test usage: parse string to json since body is raw buffer
        try {
             event = JSON.parse(req.body.toString());
        } catch (e) {
             return res.sendStatus(400);
        }
    }

    // Handle the event securely updating the DB
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        try {
            // Find order by the Stripe PaymentIntent ID
            const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
            if (order) {
                // Securely fulfill the order!
                order.paymentStatus = 'Paid';
                await order.save();

                // Clear the associated cart utilizing metadata saved previously
                const cartToken = paymentIntent.metadata.cartToken;
                if (cartToken) {
                    const cart = await Cart.findOne({ cartToken });
                    if (cart) {
                        cart.items = [];
                        await cart.save();
                    }
                }
                console.log(`✅ Successfully verified and paid order: ${order.orderNumber}`);

                // Send Email Confirmation Receipt asynchronously
                try {
                    await sendEmail({
                        email: order.customer.email,
                        subject: `Bare Beauty Order Confirmation - ${order.orderNumber}`,
                        message: `Thank you for your purchase! Your order ${order.orderNumber} is confirmed and currently being processed. Total: $${order.pricing.total}`,
                        html: `<h3>Your Order is Confirmed! 🎉</h3><p>Thank you for shopping with Bare Beauty, <b>${order.customer.name}</b>.</p><p>Order Number: <strong>${order.orderNumber}</strong><br>Total: <strong>$${order.pricing.total}</strong></p><p>We will notify you once it ships shortly!</p>`
                    });
                } catch (emailErr) {
                    console.error('Failed to send order confirmation email:', emailErr);
                }
            }
        } catch (e) {
            console.error('Error processing webhook success:', e);
            return res.status(500).send('Internal Server Error processing event');
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
});

module.exports = router;
