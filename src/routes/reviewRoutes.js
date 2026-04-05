const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');

// GET /products/:id/reviews
router.get('/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /products/:id/reviews
router.post('/products/:id/reviews', async (req, res) => {
    try {
        const { rating, text, reviewerName, images } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = new Review({
            product: product._id,
            rating,
            text,
            reviewerName,
            images
        });

        const newReview = await review.save();

        // Update product rating
        const stats = await Review.aggregate([
            { $match: { product: product._id } },
            { $group: { _id: '$product', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            product.rating.average = Math.round(stats[0].averageRating * 10) / 10;
            product.rating.count = stats[0].count;
            await product.save();
        }

        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
