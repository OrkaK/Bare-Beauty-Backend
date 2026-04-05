const rateLimit = require('express-rate-limit');

// Strict limiter for authentication-related routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window`
    message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// General limiter for other sensitive API routes (like AI)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter
};
