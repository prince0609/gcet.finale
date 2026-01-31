const express = require('express');
const router = express.Router();
const returnsController = require('../controllers/returns.controller');
const { authenticate } = require('../middleware/auth');
const { isAdminOrVendor } = require('../middleware/roles');

// All return routes require authentication and vendor/admin access
router.use(authenticate);
router.use(isAdminOrVendor);

// List return documents
router.get('/', returnsController.listReturns);

// Get return details
router.get('/:id', returnsController.getReturn);

// Update return status
router.put('/:id/status', returnsController.updateReturnStatus);

// Complete return (with late fee calculation)
router.post('/:id/complete', returnsController.completeReturn);

module.exports = router;
