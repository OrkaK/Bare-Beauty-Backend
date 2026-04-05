const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true
    },
    description: String,
    imageUrl: String
}, {
    timestamps: true
});

// Middleware to create slug from name
categorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().split(' ').join('-');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
