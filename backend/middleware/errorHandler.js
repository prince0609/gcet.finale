/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // PostgreSQL specific errors
    if (err.code) {
        switch (err.code) {
            case '23505': // Unique violation
                return res.status(409).json({
                    error: 'Duplicate entry. This record already exists.',
                    detail: err.detail
                });
            case '23503': // Foreign key violation
                return res.status(400).json({
                    error: 'Referenced record does not exist.',
                    detail: err.detail
                });
            case '23502': // Not null violation
                return res.status(400).json({
                    error: 'Required field is missing.',
                    detail: err.detail
                });
            case '22P02': // Invalid text representation
                return res.status(400).json({
                    error: 'Invalid input format.',
                    detail: err.message
                });
        }
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed.',
            details: err.details
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token.'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired.'
        });
    }

    // Stripe errors
    if (err.type && err.type.startsWith('Stripe')) {
        return res.status(400).json({
            error: 'Payment processing error.',
            message: err.message
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error.';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
