require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bare-beauty';

const products = [
    {
        name: 'Velvet Lipstick',
        description: 'A smooth, long-lasting lipstick with a velvet finish.',
        price: 24.99,
        category: 'Makeup',
        subCategory: 'Lips',
        ingredients: ['Castor Oil', 'Beeswax', 'Vitamin E'],
        benefits: ['Long-lasting', 'Moisturizing'],
        skinType: ['Normal', 'Dry', 'Oily'],
        variants: [
            { name: 'Shade', value: 'Ruby Red', inStock: true },
            { name: 'Shade', value: 'Nude', inStock: true }
        ],
        isPopular: true,
        images: ['https://placehold.co/600x400?text=Lipstick']
    },
    {
        name: 'Hydrating Face Serum',
        description: 'Deeply hydrating serum for glowing skin.',
        price: 45.00,
        category: 'Skincare',
        subCategory: 'Face',
        ingredients: ['Hyaluronic Acid', 'Glycerin', 'Aloe Vera'],
        benefits: ['Hydrating', 'Plumping'],
        skinType: ['Dry', 'Normal', 'Sensitive'],
        variants: [
            { name: 'Size', value: '30ml', inStock: true },
            { name: 'Size', value: '50ml', inStock: true, priceAdjustment: 10 }
        ],
        isPopular: true,
        images: ['https://placehold.co/600x400?text=Serum']
    },
    {
        name: 'Volumizing Mascara',
        description: 'Intense volume and length without clumping.',
        price: 18.50,
        category: 'Makeup',
        subCategory: 'Eyes',
        ingredients: ['Water', 'Iron Oxides', 'Carnauba Wax'],
        benefits: ['Volumizing', 'Lengthening'],
        skinType: ['Normal', 'Sensitive'],
        variants: [
            { name: 'Color', value: 'Black', inStock: true }
        ],
        isPopular: false,
        images: ['https://placehold.co/600x400?text=Mascara']
    }
];

const categories = [
    { name: 'Makeup', description: 'Enhance your natural beauty', slug: 'makeup' },
    { name: 'Skincare', description: 'Nourish your skin', slug: 'skincare' },
    { name: 'Body', description: 'Care for your body', slug: 'body' }
];

async function seedDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('Cleared existing products and categories.');

        if (Category) {
            await Category.insertMany(categories);
            console.log('Categories seeded.');
        }

        // Insert Products
        await Product.insertMany(products);
        console.log('Products seeded.');

        console.log('✅ Database seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seedDB();
