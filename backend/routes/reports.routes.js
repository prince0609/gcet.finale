const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth');
const { isAdminOrVendor } = require('../middleware/roles');

// All report routes require authentication
router.use(authenticate);
router.use(isAdminOrVendor);

// Vendor revenue report
router.get('/vendor-revenue', reportsController.getVendorRevenue);

// Most rented products
router.get('/most-rented', reportsController.getMostRented);

// Order trends
router.get('/order-trends', reportsController.getOrderTrends);

// Revenue by date range
router.get('/revenue', reportsController.getRevenueByDateRange);

// Export reports
router.get('/export', reportsController.exportReport);

module.exports = router;
