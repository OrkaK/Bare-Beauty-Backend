const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to get cart
const getCart = async (token) => {
    return await Cart.findOne({ cartToken: token }).populate('items.product');
};

// POST /cart - Create a new cart
router.post('/cart', async (req, res) => {
    try {
        const newCart = new Cart();
        await newCart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /cart/:cartToken - Get cart details
router.get('/cart/:token', async (req, res) => {
    try {
        const cart = await getCart(req.params.token);
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        // Update last active
        cart.lastActive = Date.now();
        await cart.save();

        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /cart/:token/items - Add item to cart
router.post('/cart/:token/items', async (req, res) => {
    try {
        const { productId, variant, quantity } = req.body;
        let cart = await Cart.findOne({ cartToken: req.params.token });

        if (!cart) {
            // Auto-create cart if token was passed but not found (or return 404 depending on rule)
            // For strictness, let's assume token must be valid or client creates new one.
            return res.status(404).json({ message: 'Cart not found' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let price = product.price;
        // Check variant price adjustment
        if (variant && product.variants) {
            const selectedVariant = product.variants.find(v => v.name === variant.name && v.value === variant.value);
            if (selectedVariant) {
                price += selectedVariant.priceAdjustment;
            }
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId &&
            JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += (quantity || 1);
        } else {
            cart.items.push({
                product: productId,
                variant,
                quantity: quantity || 1,
                priceAtAdd: price
            });
        }

        await cart.save();
        // Re-fetch to populate product details for response
        const updatedCart = await getCart(req.params.token);
        res.json(updatedCart);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /cart/:token/items/:itemId - Update item quantity
router.patch('/cart/:token/items/:itemId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ cartToken: req.params.token });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        if (quantity > 0) {
            item.quantity = quantity;
        } else {
            // Remove item if quantity is 0 or less
            item.remove();
        }

        await cart.save();
        const updatedCart = await getCart(req.params.token);
        res.json(updatedCart);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /cart/:token/items/:itemId - Remove item
router.delete('/cart/:token/items/:itemId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ cartToken: req.params.token });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items.pull(req.params.itemId);
        await cart.save();

        const updatedCart = await getCart(req.params.token);
        res.json(updatedCart);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
