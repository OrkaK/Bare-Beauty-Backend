// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
    // If headers have already been sent to the client, delegate to the default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { errorHandler };
