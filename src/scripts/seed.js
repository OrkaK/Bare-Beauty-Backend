require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const categoriesData = [
    { name: 'Makeup', slug: 'makeup', description: 'Enhance your natural beauty', imageUrl: 'https://placehold.co/400x300?text=Makeup' },
    { name: 'Skincare', slug: 'skincare', description: 'Nourish your skin', imageUrl: 'https://placehold.co/400x300?text=Skincare' },
    { name: 'Tools', slug: 'tools', description: 'Essential beauty tools', imageUrl: 'https://placehold.co/400x300?text=Tools' }
];

const productsData = [
    {
        name: 'Hydrating Lipstick',
        price: 24.00,
        description: 'A creamy, moisturizing lipstick that lasts all day.',
        images: ['https://placehold.co/400x400?text=Lipstick+1', 'https://placehold.co/400x400?text=Lipstick+2'],
        category: 'Makeup',
        ingredients: ['Castor Oil', 'Beeswax', 'Vitamin E'],
        benefits: ['Hydrating', 'Long-lasting', 'Vibrant Color'],
        howToUse: { steps: ['Apply from center of lips outwards.'] },
        skinType: ['All'],
        rating: { average: 4.5, count: 120 },
        isPopular: true,
        variants: [
            { name: 'Shade', value: 'Ruby Red', inStock: true },
            { name: 'Shade', value: 'Nude', inStock: true }
        ]
    },
    {
        name: 'Glow Serum',
        price: 45.00,
        description: 'Vitamin C serum for radiant skin.',
        images: ['https://placehold.co/400x400?text=Serum+1'],
        category: 'Skincare',
        ingredients: ['Vitamin C', 'Hyaluronic Acid'],
        benefits: ['Brightening', 'Anti-aging'],
        howToUse: { steps: ['Apply 2-3 drops to clean face morning and night.'] },
        skinType: ['Normal', 'Dry', 'Oily'],
        rating: { average: 4.8, count: 85 },
        isPopular: true
    },
    {
        name: 'Jade Roller',
        price: 18.00,
        description: 'Facial massage tool for debuffing.',
        images: ['https://placehold.co/400x400?text=Jade+Roller'],
        category: 'Tools',
        ingredients: ['Jade Stone'],
        benefits: ['De-puffing', 'Relaxing'],
        howToUse: { steps: ['Roll upwards and outwards on face.'] },
        skinType: ['All'],
        rating: { average: 4.2, count: 40 }
    },
    {
        name: 'Matte Foundation',
        price: 32.00,
        description: 'Full coverage matte foundation.',
        images: ['https://placehold.co/400x400?text=Foundation'],
        category: 'Makeup',
        ingredients: ['Water', 'Silicone'],
        benefits: ['Full Coverage', 'Matte Finish'],
        howToUse: { steps: ['Blend with sponge or brush.'] },
        skinType: ['Oily', 'Combination'],
        rating: { average: 4.0, count: 200 },
        variants: [
            { name: 'Shade', value: 'Ivory' },
            { name: 'Shade', value: 'Beige' },
            { name: 'Shade', value: 'Mocha' }
        ]
    }
];

const usersData = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123',
        role: 'admin',
        isVerified: true
    },
    {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user',
        isVerified: true
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bare-beauty')
    .then(async () => {
        console.log('Connected to MongoDB');

        await Category.deleteMany({});
        await Category.insertMany(categoriesData);
        console.log('Categories seeded');

        await Product.deleteMany({});
        await Product.insertMany(productsData);
        console.log('Products seeded');

        await User.deleteMany({});
        for (const user of usersData) {
            await User.create(user);
        }
        console.log('Users seeded');

        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error seeding data:', err);
        mongoose.connection.close();
    });
