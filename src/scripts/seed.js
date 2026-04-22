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
        description: 'A creamy, moisturizing lipstick that lasts all day without cracking.',
        images: ['https://placehold.co/400x400?text=Lipstick+1'],
        category: 'Makeup',
        ingredients: ['Castor Oil', 'Beeswax', 'Vitamin E'],
        benefits: ['Hydrating', 'Long-lasting', 'Vibrant Color'],
        howToUse: { steps: ['Apply from center of lips outwards.'] },
        skinType: ['All'],
        rating: { average: 4.5, count: 120 },
        isPopular: true
    },
    {
        name: 'Glow Serum',
        price: 45.00,
        description: 'Powerful Vitamin C serum for bright, radiant skin.',
        images: ['https://placehold.co/400x400?text=Glow+Serum'],
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
        description: 'Soothing facial massage tool for debuffing and lymphatic drainage.',
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
        description: 'Full coverage matte foundation for a flawless finish.',
        images: ['https://placehold.co/400x400?text=Foundation'],
        category: 'Makeup',
        ingredients: ['Water', 'Silicone'],
        benefits: ['Full Coverage', 'Matte Finish'],
        howToUse: { steps: ['Blend with sponge or brush.'] },
        skinType: ['Oily', 'Combination'],
        rating: { average: 4.0, count: 200 }
    },
    {
        name: 'Balancing Rose Toner',
        price: 28.00,
        description: 'Alcohol-free toner that restores skin pH and hydrates naturally.',
        images: ['https://placehold.co/400x400?text=Rose+Toner'],
        category: 'Skincare',
        ingredients: ['Rose Water', 'Glycerin', 'Aloe Vera'],
        benefits: ['Tightens Pores', 'Restores Balance'],
        howToUse: { steps: ['Apply to a cotton pad and wipe across face.'] },
        skinType: ['All', 'Sensitive'],
        rating: { average: 4.9, count: 320 },
        isPopular: true
    },
    {
        name: 'Heat Protectant Spray',
        price: 22.00,
        description: 'Shields hair from thermal styling up to 450 degrees.',
        images: ['https://placehold.co/400x400?text=Heat+Spray'],
        category: 'Hair',
        ingredients: ['Argan Oil', 'Keratin'],
        benefits: ['Thermal Protection', 'Reduces Frizz'],
        howToUse: { steps: ['Spritz evenly on damp hair before blow-drying.'] },
        skinType: ['All'],
        rating: { average: 4.6, count: 95 }
    },
    {
        name: 'Nourishing Cuticle Oil',
        price: 15.00,
        description: 'Strengthens nails and softens cuticles instantly.',
        images: ['https://placehold.co/400x400?text=Cuticle+Oil'],
        category: 'Nails',
        ingredients: ['Jojoba Oil', 'Vitamin E'],
        benefits: ['Promotes Nail Growth', 'Hydrating'],
        howToUse: { steps: ['Massage into cuticles nightly.'] },
        skinType: ['All'],
        rating: { average: 4.7, count: 150 }
    },
    {
        name: 'Plumping Lip Gloss',
        price: 19.50,
        description: 'High-shine gloss that creates naturally fuller-looking lips.',
        images: ['https://placehold.co/400x400?text=Lip+Gloss'],
        category: 'Makeup',
        ingredients: ['Peppermint Oil', 'Shea Butter'],
        benefits: ['Plumping', 'High Shine', 'Non-sticky'],
        howToUse: { steps: ['Apply over lips or lipstick.'] },
        skinType: ['All'],
        rating: { average: 4.4, count: 210 }
    },
    {
        name: 'Revitalizing Eye Cream',
        price: 42.00,
        description: 'Fights dark circles and puffiness under the eyes.',
        images: ['https://placehold.co/400x400?text=Eye+Cream'],
        category: 'Skincare',
        ingredients: ['Caffeine', 'Peptides'],
        benefits: ['Reduces Dark Circles', 'Firms Skin'],
        howToUse: { steps: ['Tap gently under eyes morning and night.'] },
        skinType: ['Dry', 'Normal', 'Mature'],
        rating: { average: 4.8, count: 430 }
    },
    {
        name: 'Volumizing Shampoo',
        price: 26.00,
        description: 'Lifts hair at the root for incredible bounce and volume.',
        images: ['https://placehold.co/400x400?text=Volume+Shampoo'],
        category: 'Hair',
        ingredients: ['Biotin', 'Rice Protein'],
        benefits: ['Adds Volume', 'Strengthens Hair'],
        howToUse: { steps: ['Massage into wet scalp and rinse.'] },
        skinType: ['All'],
        rating: { average: 4.1, count: 180 }
    },
    {
        name: 'SPF 30 Day Cream',
        price: 45.00,
        description: 'Daily moisturizer with broad spectrum sun protection.',
        images: ['https://placehold.co/400x400?text=SPF+Cream'],
        category: 'Skincare',
        ingredients: ['Zinc Oxide', 'Niacinamide'],
        benefits: ['Sun Protection', 'Hydrating'],
        howToUse: { steps: ['Apply generously 15 minutes before sun exposure.'] },
        skinType: ['Combination', 'Dry'],
        rating: { average: 4.6, count: 275 },
        isPopular: true
    },
    {
        name: 'Pro Blending Sponge',
        price: 12.00,
        description: 'Ultra-soft sponge for streak-free makeup application.',
        images: ['https://placehold.co/400x400?text=Sponge'],
        category: 'Tools',
        ingredients: ['Latex-free Foam'],
        benefits: ['Flawless Finish', 'Bouncy Texture'],
        howToUse: { steps: ['Wet sponge, squeeze out excess water, bounce on face.'] },
        skinType: ['All'],
        rating: { average: 4.9, count: 540 }
    },
    {
        name: 'Clarifying Witch Hazel Toner',
        price: 18.00,
        description: 'Deep-cleaning toner designed to control oily and acne-prone skin.',
        images: ['https://placehold.co/400x400?text=Witch+Hazel+Toner'],
        category: 'Skincare',
        ingredients: ['Witch Hazel', 'Salicylic Acid'],
        benefits: ['Oil Control', 'Reduces Acne'],
        howToUse: { steps: ['Apply gently using a cotton round.'] },
        skinType: ['Oily', 'Combination'],
        rating: { average: 4.5, count: 310 }
    },
    {
        name: 'Soothing Aloe Toner',
        price: 24.00,
        description: 'Ultra-gentle toner to soothe inflammation and hydrate sensitive skin.',
        images: ['https://placehold.co/400x400?text=Aloe+Toner'],
        category: 'Skincare',
        ingredients: ['Aloe Vera', 'Centella'],
        benefits: ['Calming', 'Reduces Redness'],
        howToUse: { steps: ['Pat into the skin with hands.'] },
        skinType: ['Sensitive', 'Dry'],
        rating: { average: 4.7, count: 420 },
        isPopular: true
    },
    {
        name: 'Silky Matte Lipstick (Crimson)',
        price: 26.00,
        description: 'A deep crimson red that commands attention without drying out lips.',
        images: ['https://placehold.co/400x400?text=Matte+Lipstick'],
        category: 'Makeup',
        ingredients: ['Shea Butter', 'Matte Pigments'],
        benefits: ['Matte Finish', 'Highly Pigmented'],
        howToUse: { steps: ['Swipe once for full coverage.'] },
        skinType: ['All'],
        rating: { average: 4.3, count: 180 }
    },
    {
        name: 'Intensive Night Repair Serum',
        price: 65.00,
        description: 'Overnight miracle worker that aggressively repairs damaged skin barriers.',
        images: ['https://placehold.co/400x400?text=Night+Serum'],
        category: 'Skincare',
        ingredients: ['Peptides', 'Ceramides', 'Retinol'],
        benefits: ['Anti-aging', 'Barrier Repair'],
        howToUse: { steps: ['Apply a pea-sized amount at bedtime.'] },
        skinType: ['Mature', 'Dry', 'Normal'],
        rating: { average: 4.9, count: 890 },
        isPopular: true
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
