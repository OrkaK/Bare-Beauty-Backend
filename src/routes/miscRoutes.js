const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const Product = require('../models/Product');
const sendEmail = require('../utils/emailService');

// POST /subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(200).json({ message: 'Already subscribed' });
        }

        const subscription = new Newsletter({ email });
        await subscription.save();

        // Dispatch Welcome Email asynchronously
        try {
            await sendEmail({
                email,
                subject: 'Welcome to Bare Beauty! 🌿',
                message: 'Thank you for subscribing to the Bare Beauty newsletter. Enjoy 10% off your next purchase with code GLOW10.',
                html: '<h3>Welcome to Bare Beauty! 🌿</h3><p>Thank you for subscribing to our newsletter. Enjoy <strong>10% off</strong> your next purchase with code <b>GLOW10</b>.</p>'
            });
        } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
        }

        res.status(201).json({ message: 'Successfully subscribed to newsletter' });
    } catch (err) {
        if (err.code === 11000) {
            // Handle race condition for duplicate email
            return res.status(200).json({ message: 'Already subscribed' });
        }
        res.status(500).json({ message: err.message });
    }
});

// GET /recommendations
router.get('/recommendations', async (req, res) => {
    try {
        // Simple rule-based recommendations
        // 1. Popular products
        const popular = await Product.find({ isPopular: true }).limit(5);

        // 2. Random other products if not enough popular ones
        let recommendations = [...popular];

        if (recommendations.length < 5) {
            const others = await Product.find({
                _id: { $nin: recommendations.map(p => p._id) }
            }).limit(5 - recommendations.length);
            recommendations = [...recommendations, ...others];
        }

        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
