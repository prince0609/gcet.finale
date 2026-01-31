/**
 * Role-based access control middleware factory
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions.',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
const isAdmin = authorize('admin');

/**
 * Check if user is vendor
 */
const isVendor = authorize('vendor');

/**
 * Check if user is customer
 */
const isCustomer = authorize('customer');

/**
 * Check if user is admin or vendor
 */
const isAdminOrVendor = authorize('admin', 'vendor');

/**
 * Check if user is admin or customer
 */
const isAdminOrCustomer = authorize('admin', 'customer');

/**
 * Allow any authenticated user
 */
const isAuthenticated = authorize('admin', 'vendor', 'customer');

module.exports = {
    authorize,
    isAdmin,
    isVendor,
    isCustomer,
    isAdminOrVendor,
    isAdminOrCustomer,
    isAuthenticated
};
