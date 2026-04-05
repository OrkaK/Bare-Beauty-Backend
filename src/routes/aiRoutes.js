const express = require('express');
const router = express.Router();
const { analyzeFace } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

// Protected Route: Upload and Analyze
router.post('/analyze', protect, apiLimiter, upload.single('image'), analyzeFace);

module.exports = router;
