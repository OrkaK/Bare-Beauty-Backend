const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    text: String,
    reviewerName: {
        type: String,
        default: 'Anonymous'
    },
    images: [String] // URLs for before/after images
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
