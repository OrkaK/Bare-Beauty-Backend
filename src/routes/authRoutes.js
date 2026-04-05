const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    sendOTP,
    verifyOTP,
    updateProfile,
    sendPhoneOTP,
    verifyPhoneOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication workflows mapped with rate limits
 */
 
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log into the system and receive a secure HTTP-Only cookie session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: 'user@barebeauty.com'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *     responses:
 *       200:
 *         description: Successfully authenticated. JWT placed in Secure Cookie.
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Exceeded authentication rate-limits (IP restricted for 15 mins)
 */
router.post('/signup', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp', authLimiter, sendOTP);
router.post('/verify', authLimiter, verifyOTP);
router.post('/send-phone-otp', authLimiter, sendPhoneOTP);
router.post('/verify-phone', authLimiter, verifyPhoneOTP);
router.get('/me', protect, getMe);
const upload = require('../middleware/uploadMiddleware');
router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
