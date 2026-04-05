const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: [String],
    category: {
        type: String,
        required: true,
        index: true
    },
    subCategory: String,
    ingredients: [String],
    benefits: [String],
    howToUse: {
        steps: [String],
        videoUrl: String
    },
    skinType: [String], // e.g., 'Normal', 'Dry', 'Oily', 'Sensitive'
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    variants: [{
        name: String, // e.g., 'Shade', 'Size'
        value: String, // e.g., 'Red', '50ml'
        priceAdjustment: {
            type: Number,
            default: 0
        },
        inStock: {
            type: Boolean,
            default: true
        }
    }],
    isPopular: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', benefits: 'text' });

module.exports = mongoose.model('Product', productSchema);
