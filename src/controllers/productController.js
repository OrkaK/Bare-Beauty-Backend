const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all products with filters and sorting
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, priceMin, priceMax, rating, skinType, keyword, sort } = req.query;
        let query = {};

        if (category) {
            query.category = new RegExp(`^${category}$`, 'i');
        }

        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin) query.price.$gte = Number(priceMin);
            if (priceMax) query.price.$lte = Number(priceMax);
        }

        if (rating) {
            query['rating.average'] = { $gte: Number(rating) };
        }

        if (skinType) {
            query.skinType = { $in: [new RegExp(`^${skinType}$`, 'i'), 'All'] };
        }

        if (keyword) {
            query.$text = { $search: keyword };
        }

        let sortOption = {};
        if (sort) {
            if (sort === 'price_asc') sortOption.price = 1;
            if (sort === 'price_desc') sortOption.price = -1;
            if (sort === 'rating') sortOption['rating.average'] = -1;
            if (sort === 'popularity') sortOption.isPopular = -1;
            if (sort === 'newest') sortOption.createdAt = -1;
        } else {
            sortOption.createdAt = -1;
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const products = await Product.find(query).sort(sortOption).skip(skip).limit(limit);
        const totalCount = await Product.countDocuments(query);

        res.json({
            products,
            page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        const productData = {
            ...req.body,
            images: imageUrls
        };

        const product = new Product(productData);
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let imageUrls = product.images;
        if (req.files && req.files.length > 0) {
            // Append new images or replace? 
            // For now appends, but usually this needs careful UI logic.
            // Let's assume replacement if duplicates or simplistic append.
            // Actually, usually in a simple PUT, might want to replace if provided.
            // But existing behavior in many apps is append. 
            // Let's go with: if files provided, add them.
            const newImages = req.files.map(file => file.path);
            imageUrls = [...imageUrls, ...newImages];
        }

        // Allow removing images via body if needed (not implemented yet without specific UI logic)

        const updatedData = {
            ...req.body,
            images: imageUrls
        };

        Object.assign(product, updatedData);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product recommendations based on user preferences
// @route   GET /api/products/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const user = req.user;

        // Base query: Products available in stock
        // Note: You might want to filter out of stock, but for now let's keep it simple
        let query = {};

        // 1. Skin Type Filtering
        // If user has a specific skin type (and it's not "Not Specified" or "All"),
        // filter products that match.
        // Product structure: skinType: ['Dry', 'Normal']
        if (user.preferences && user.preferences.skinType && user.preferences.skinType !== 'Not Specified') {
            query.skinType = { $in: [new RegExp(`^${user.preferences.skinType}$`, 'i'), 'All'] };
        }

        // Fetch products matching the hard filter (Skin Type)
        // We fetch more than we need to sort them in memory based on concerns
        let products = await Product.find(query);

        // 2. Concern Scoring
        // Advanced algorithmic scoring based on granular intersections mapping
        if (user.preferences && user.preferences.concerns && user.preferences.concerns.length > 0) {
            products = products.map(product => {
                let score = 0;
                const userConcerns = user.preferences.concerns.map(c => c.toLowerCase());
                const productBenefits = (product.attributes && product.attributes.benefits) ? product.attributes.benefits.map(b => b.toLowerCase()) : [];
                
                // +15 Points: Direct intersection of explicit arrays
                const intersection = userConcerns.filter(c => productBenefits.includes(c));
                score += intersection.length * 15;

                // +10 Points: Explicit Exact SkinType match
                if (user.preferences.skinType && product.attributes && product.attributes.skinType && product.attributes.skinType.includes(user.preferences.skinType)) {
                    score += 10;
                }

                // +5 Points: Broad Description matching parsing text
                const descMap = product.description ? product.description.toLowerCase() : '';
                userConcerns.forEach(concern => {
                    if (descMap.includes(concern)) score += 5;
                });

                // +2 Points: Popularity generic boost
                if (product.isPopular) score += 2;

                return { ...product.toObject(), score };
            });

            // Sort by score descending
            products.sort((a, b) => b.score - a.score);
        } else {
            // If no concerns, just return popular ones first
            products.sort((a, b) => (b.isPopular === true) - (a.isPopular === true));
        }

        // Return top 10 recommendations
        res.json(products.slice(0, 10));

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getRecommendations
};
