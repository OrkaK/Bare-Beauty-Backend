require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bare-beauty';

async function extractFrontendProducts() {
    try {
        const frontendMainJsPath = path.resolve(__dirname, '../../../bare-beauty-frontend/main.js');
        const content = fs.readFileSync(frontendMainJsPath, 'utf8');
        
        const startIndex = content.indexOf('const products = {');
        const endIndex = content.indexOf('// ===== CART FUNCTIONALITY =====');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Could not find products object in main.js');
        }
        
        let productsCode = content.substring(startIndex, endIndex);
        
        // Remove 'const products = ' to easily evaluate as an expression, or just append module.exports
        productsCode += '\nmodule.exports = products;';
        
        const tempFilePath = path.resolve(__dirname, './tempProducts.js');
        fs.writeFileSync(tempFilePath, productsCode);
        
        const productsMap = require('./tempProducts');
        
        // Clean up temp
        fs.unlinkSync(tempFilePath);
        
        return productsMap;
    } catch (error) {
        console.error('Error extracting products:', error);
        process.exit(1);
    }
}

async function seedFrontendProducts() {
    try {
        console.log('Connecting to MongoDB...', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');
        
        const productsMap = await extractFrontendProducts();
        const productsArray = Object.values(productsMap);
        console.log(`Found ${productsArray.length} products to seed.`);
        
        await Product.deleteMany({});
        console.log('Cleared existing products.');
        
        // Transform and insert
        const dbProducts = productsArray.map(p => {
            return {
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.categoryPage === 'shop-skincare.html' ? 'Skincare' : 
                          p.categoryPage === 'shop-makeup.html' ? 'Makeup' :
                          p.categoryPage === 'shop-hair.html' ? 'Hair' :
                          p.categoryPage === 'shop-nails.html' ? 'Nails' :
                          p.categoryPage === 'shop-tools.html' ? 'Tools' : 'Other',
                subCategory: p.category, // e.g. 'Cleanser'
                images: p.image ? [p.image] : [],
                ingredients: p.ingredients || [],
                skinType: p.skinType ? [p.skinType] : [],
                rating: {
                    average: p.rating || 0,
                    count: p.reviews || 0
                },
                variants: [],
                isPopular: p.rating >= 4.8
            };
        });
        
        await Product.insertMany(dbProducts);
        console.log('✅ Successfully seeded products from frontend! Count:', dbProducts.length);
        
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed:', err);
        process.exit(1);
    }
}

seedFrontendProducts();
