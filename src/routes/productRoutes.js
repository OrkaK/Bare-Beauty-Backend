const express = require('express');
const router = express.Router();
const {
    getCategories,
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getRecommendations
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { checkCache } = require('../middleware/cacheMiddleware');

// Public Routes
router.get('/categories', checkCache, getCategories);
router.get('/products', checkCache, getProducts);
router.get('/products/:id', checkCache, getProductById);

// Protected Routes
router.get('/recommendations', protect, getRecommendations);

// Admin Routes
router.post('/products', protect, admin, upload.array('images', 5), createProduct);
router.put('/products/:id', protect, admin, upload.array('images', 5), updateProduct); // Allow adding more images
router.delete('/products/:id', protect, admin, deleteProduct);

module.exports = router;

