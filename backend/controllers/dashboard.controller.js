const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');

const reportQueries = loadQueries('reports.sql');

/**
 * GET /api/dashboard/admin
 * Get admin dashboard stats
 */
const getAdminDashboard = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await db.query(reportQueries.getAdminDashboardStats);
        const stats = result.rows[0];

        // Get recent data
        const [mostRented, orderTrends] = await Promise.all([
            db.query(reportQueries.getMostRentedProducts, [5]),
            db.query(reportQueries.getOrderTrends, [
                new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            ])
        ]);

        res.json({
            stats: {
                totalUsers: parseInt(stats.total_users),
                totalVendors: parseInt(stats.total_vendors),
                totalCustomers: parseInt(stats.total_customers),
                publishedProducts: parseInt(stats.published_products),
                totalOrders: parseInt(stats.total_orders),
                activeOrders: parseInt(stats.active_orders),
                totalRevenue: parseFloat(stats.total_revenue),
                pendingInvoices: parseInt(stats.pending_invoices)
            },
            topProducts: mostRented.rows,
            orderTrends: orderTrends.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/vendor
 * Get vendor dashboard stats
 */
const getVendorDashboard = async (req, res, next) => {
    try {
        if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const vendorId = req.user.role === 'admin' ? req.query.vendorId : req.user.id;

        if (!vendorId) {
            return res.status(400).json({ error: 'Vendor ID is required' });
        }

        const result = await db.query(reportQueries.getVendorDashboardStats, [vendorId]);
        const stats = result.rows[0];

        // Get recent data
        const [mostRented, orderTrends] = await Promise.all([
            db.query(reportQueries.getMostRentedProductsByVendor, [vendorId, 5]),
            db.query(reportQueries.getOrderTrendsByVendor, [
                vendorId,
                new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            ])
        ]);

        res.json({
            stats: {
                totalProducts: parseInt(stats.total_products),
                publishedProducts: parseInt(stats.published_products),
                totalOrders: parseInt(stats.total_orders),
                activeOrders: parseInt(stats.active_orders),
                totalRevenue: parseFloat(stats.total_revenue),
                pendingPickups: parseInt(stats.pending_pickups),
                pendingReturns: parseInt(stats.pending_returns)
            },
            topProducts: mostRented.rows,
            orderTrends: orderTrends.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/customer
 * Get customer dashboard stats
 */
const getCustomerDashboard = async (req, res, next) => {
    try {
        const customerId = req.user.role === 'admin' ? req.query.customerId : req.user.id;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const result = await db.query(reportQueries.getCustomerDashboardStats, [customerId]);
        const stats = result.rows[0];

        res.json({
            stats: {
                totalOrders: parseInt(stats.total_orders),
                activeOrders: parseInt(stats.active_orders),
                pendingPayments: parseInt(stats.pending_payments),
                totalSpent: parseFloat(stats.total_spent)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getVendorDashboard,
    getCustomerDashboard
};
