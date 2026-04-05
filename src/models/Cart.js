const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const cartSchema = new mongoose.Schema({
    cartToken: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true
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
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        priceAtAdd: { // Snapshot price at time of adding
            type: Number,
            required: true
        }
    }],
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for cart total
cartSchema.virtual('total').get(function () {
    if (!this.items) return 0;
    return this.items.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
});

module.exports = mongoose.model('Cart', cartSchema);
