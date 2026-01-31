const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Authentication middleware - verifies JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from database to ensure they still exist and are active
            const result = await db.query(
                'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'User not found.' });
            }

            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(401).json({ error: 'Account is deactivated.' });
            }

            // Attach user to request object
            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired.' });
            }
            return res.status(401).json({ error: 'Invalid token.' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error.' });
    }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const result = await db.query(
                'SELECT id, name, email, role, is_active FROM users WHERE id = $1 AND is_active = true',
                [decoded.userId]
            );

            if (result.rows.length > 0) {
                const user = result.rows[0];
                req.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            } else {
                req.user = null;
            }
        } catch (jwtError) {
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = {
    authenticate,
    optionalAuth
};
