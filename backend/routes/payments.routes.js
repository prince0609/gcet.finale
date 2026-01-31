const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authenticate } = require('../middleware/auth');

// Stripe webhook (no auth required - uses Stripe signature verification)
router.post('/webhook', paymentsController.stripeWebhook);

// All other payment routes require authentication
router.use(authenticate);

// Create payment intent
router.post('/', paymentsController.createPayment);

// List payments
router.get('/', paymentsController.listPayments);

// Get payment details
router.get('/:id', paymentsController.getPayment);

module.exports = router;
