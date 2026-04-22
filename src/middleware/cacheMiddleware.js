const redis = require('redis');

// Create Redis Client (Wait to connect until invoked)
let redisClient;

/*
(async () => {
    redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (error) => console.error(`⚠️ Redis connection issue (Safely Bypassed): ${error.message}`));

    try {
        await redisClient.connect();
        console.log('✅ Redis connected successfully.');
    } catch (e) {
        console.error('Failed to immediately connect to Redis. Safe fallback activated. Operating fully with MongoDB.');
    }
})();
*/

const checkCache = async (req, res, next) => {
    // 1. Safety Feature: Route instantly if disconnected (e.g. no local dev container)
    if (!redisClient || !redisClient.isOpen) {
        return next();
    }

    const cacheKey = req.originalUrl;
    
    try {
        const cachedResult = await redisClient.get(cacheKey);
        
        if (cachedResult) {
            // Serve cache hit instantly
            return res.status(200).json(JSON.parse(cachedResult));
        } else {
            // Cache Miss logic: Intercept outbound response natively
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Determine if valid JSON success to prevent caching errors
                if (res.statusCode === 200) {
                    // Save to Redis synchronously with a 15 minute TTL expiration
                    redisClient.setEx(cacheKey, 900, JSON.stringify(body))
                        .catch(err => console.error('Redis cache insert failed:', err.message));
                }
                originalJson(body);
            };
            return next();
        }
    } catch (e) {
        console.error('Failed in caching middleware:', e.message);
        next();
    }
};

module.exports = { checkCache };
