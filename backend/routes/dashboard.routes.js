const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(authenticate);

// Admin dashboard
router.get('/admin', dashboardController.getAdminDashboard);

// Vendor dashboard
router.get('/vendor', dashboardController.getVendorDashboard);

// Customer dashboard
router.get('/customer', dashboardController.getCustomerDashboard);

module.exports = router;
