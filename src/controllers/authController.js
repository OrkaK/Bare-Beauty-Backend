const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/emailService');
const sendSMS = require('../utils/smsService');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_ChangeMe', {
        expiresIn: '30d'
    });
};

// Helper to send token in HTTP-only cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token 
        });
};

// @desc    Register new user
// @route   POST /auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        if (user) {
            sendTokenResponse(user, 201, res);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            sendTokenResponse(user, 200, res);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /auth/logout
// @access  Private
const logoutUser = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
};

// @desc    Get user data
// @route   GET /auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Send OTP
// @route   POST /auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        await OTP.create({
            userId: user._id,
            code,
            type: 'email'
        });

        // Send Email using helper
        await sendEmail({
            email: user.email,
            subject: 'Your Bare Beauty Verification Code',
            message: `Your verification code is: ${code}`, // Plain text fallback
            html: `<p>Your verification code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`
        });

        res.status(200).json({ success: true, message: 'OTP sent to email' });

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify OTP
// @route   POST /auth/verify
// @access  Public
const verifyOTP = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find valid OTP
        const validOTP = await OTP.findOne({
            userId: user._id,
            code,
            type: 'email'
        });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        // Mark user as verified
        user.isVerified = true;
        await user.save();

        // Delete used OTPs for this user
        await OTP.deleteMany({ userId: user._id });

        res.status(200).json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile (preferences & basics)
// @route   PUT /auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.body.preferences) {
                user.preferences = {
                    ...user.preferences,
                    ...req.body.preferences
                };
            }

            if (req.file) {
                user.avatar = req.file.path;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                preferences: updatedUser.preferences,
                avatar: updatedUser.avatar,
                isVerified: updatedUser.isVerified
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send Phone OTP
// @route   POST /auth/send-phone-otp
// @access  Public
const sendPhoneOTP = async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ message: 'User with this phone not found' });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB
        await OTP.create({
            userId: user._id,
            code,
            type: 'phone'
        });

        // Send SMS using mock helper
        await sendSMS({
            phone: user.phone,
            message: `Your Bare Beauty code is: ${code}`
        });

        res.status(200).json({ success: true, message: 'OTP sent to phone' });

    } catch (error) {
        console.error('Send SMS OTP Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify Phone OTP
// @route   POST /auth/verify-phone
// @access  Public
const verifyPhoneOTP = async (req, res) => {
    const { phone, code } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find valid OTP
        const validOTP = await OTP.findOne({
            userId: user._id,
            code,
            type: 'phone'
        });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        // Mark user phone as verified
        user.isPhoneVerified = true;
        await user.save();

        // Delete used OTPs for this user
        await OTP.deleteMany({ userId: user._id, type: 'phone' });

        res.status(200).json({ success: true, message: 'Phone verified successfully' });

    } catch (error) {
        console.error('Verify Phone OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    sendOTP,
    verifyOTP,
    updateProfile,
    sendPhoneOTP,
    verifyPhoneOTP
};
