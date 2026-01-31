const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { authenticate } = require('../middleware/auth');
const { isAdminOrVendor, isAuthenticated } = require('../middleware/roles');

// All order routes require authentication
router.use(authenticate);

// List orders (role-based)
router.get('/', ordersController.listOrders);

// Get order details
router.get('/:id', ordersController.getOrder);

// Update order status (vendor/admin only)
router.put('/:id/status', isAdminOrVendor, ordersController.updateOrderStatus);

module.exports = router;
