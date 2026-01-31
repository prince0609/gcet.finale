const express = require('express');
const router = express.Router();
const quotationsController = require('../controllers/quotations.controller');
const { authenticate } = require('../middleware/auth');
const { isCustomer, isAdminOrCustomer } = require('../middleware/roles');

// All quotation routes require authentication
router.use(authenticate);

// Quotation CRUD (Customer only creates, but admin can view all)
router.get('/', quotationsController.listQuotations);
router.post('/', isCustomer, quotationsController.createQuotation);
router.get('/:id', quotationsController.getQuotation);

// Quotation lines
router.post('/:id/lines', isCustomer, quotationsController.addLine);
router.put('/:id/lines/:lineId', isCustomer, quotationsController.updateLine);
router.delete('/:id/lines/:lineId', isCustomer, quotationsController.deleteLine);

// Confirm quotation to order
router.post('/:id/confirm', isCustomer, quotationsController.confirmQuotation);

module.exports = router;
