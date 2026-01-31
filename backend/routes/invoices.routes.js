const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoices.controller');
const { authenticate } = require('../middleware/auth');
const { isAdminOrVendor, isAuthenticated } = require('../middleware/roles');

// All invoice routes require authentication
router.use(authenticate);

// List invoices (role-based)
router.get('/', invoicesController.listInvoices);

// Create invoice from order
router.post('/', isAdminOrVendor, invoicesController.createInvoice);

// Get invoice details
router.get('/:id', invoicesController.getInvoice);

// Post invoice (generate invoice number)
router.put('/:id/post', isAdminOrVendor, invoicesController.postInvoice);

module.exports = router;
