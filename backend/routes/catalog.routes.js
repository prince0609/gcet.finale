const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');
const { optionalAuth } = require('../middleware/auth');

// Public routes - optional auth for personalization
router.use(optionalAuth);

// GET /api/catalog/products - Browse published products
router.get('/products', catalogController.listProducts);

// GET /api/catalog/products/:id - Product details
router.get('/products/:id', catalogController.getProduct);

// GET /api/catalog/products/:id/availability - Check availability
router.get('/products/:id/availability', catalogController.checkAvailability);

module.exports = router;
