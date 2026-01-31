const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');

const reportQueries = loadQueries('reports.sql');

/**
 * GET /api/reports/vendor-revenue
 * Get vendor revenue report
 */
const getVendorRevenue = async (req, res, next) => {
    try {
        let result;

        if (req.user.role === 'vendor') {
            result = await db.query(reportQueries.getVendorRevenueById, [req.user.id]);
        } else {
            result = await db.query(reportQueries.getVendorRevenue);
        }

        res.json({ vendorRevenue: result.rows });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/most-rented
 * Get most rented products
 */
const getMostRented = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        let result;

        if (req.user.role === 'vendor') {
            result = await db.query(reportQueries.getMostRentedProductsByVendor, [req.user.id, limit]);
        } else {
            result = await db.query(reportQueries.getMostRentedProducts, [limit]);
        }

        res.json({ mostRented: result.rows });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/order-trends
 * Get order trends over time
 */
const getOrderTrends = async (req, res, next) => {
    try {
        const startDate = req.query.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = req.query.endDate || new Date().toISOString();

        let result;

        if (req.user.role === 'vendor') {
            result = await db.query(reportQueries.getOrderTrendsByVendor, [req.user.id, startDate, endDate]);
        } else {
            result = await db.query(reportQueries.getOrderTrends, [startDate, endDate]);
        }

        res.json({ orderTrends: result.rows });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/revenue
 * Get revenue by date range
 */
const getRevenueByDateRange = async (req, res, next) => {
    try {
        const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const endDate = req.query.endDate || new Date().toISOString();

        let result;

        if (req.user.role === 'vendor') {
            result = await db.query(reportQueries.getRevenueByDateRangeForVendor, [req.user.id, startDate, endDate]);
        } else {
            result = await db.query(reportQueries.getRevenueByDateRange, [startDate, endDate]);
        }

        res.json({ revenue: result.rows });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/export
 * Export report as CSV
 */
const exportReport = async (req, res, next) => {
    try {
        const { type, startDate, endDate } = req.query;

        if (!type) {
            return res.status(400).json({ error: 'Report type is required' });
        }

        let data;
        const start = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const end = endDate || new Date().toISOString();

        switch (type) {
            case 'vendor-revenue':
                if (req.user.role === 'vendor') {
                    data = (await db.query(reportQueries.getVendorRevenueById, [req.user.id])).rows;
                } else {
                    data = (await db.query(reportQueries.getVendorRevenue)).rows;
                }
                break;
            case 'most-rented':
                if (req.user.role === 'vendor') {
                    data = (await db.query(reportQueries.getMostRentedProductsByVendor, [req.user.id, 100])).rows;
                } else {
                    data = (await db.query(reportQueries.getMostRentedProducts, [100])).rows;
                }
                break;
            case 'order-trends':
                if (req.user.role === 'vendor') {
                    data = (await db.query(reportQueries.getOrderTrendsByVendor, [req.user.id, start, end])).rows;
                } else {
                    data = (await db.query(reportQueries.getOrderTrends, [start, end])).rows;
                }
                break;
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }

        // Convert to CSV
        if (data.length === 0) {
            return res.status(404).json({ error: 'No data available' });
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h];
                if (val === null || val === undefined) return '';
                if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                return val;
            }).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendorRevenue,
    getMostRented,
    getOrderTrends,
    getRevenueByDateRange,
    exportReport
};
