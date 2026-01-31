const express = require('express');
const router = express.Router();
const pickupsController = require('../controllers/pickups.controller');
const { authenticate } = require('../middleware/auth');
const { isAdminOrVendor } = require('../middleware/roles');

// All pickup routes require authentication and vendor/admin access
router.use(authenticate);
router.use(isAdminOrVendor);

// List pickup documents
router.get('/', pickupsController.listPickups);

// Get pickup details
router.get('/:id', pickupsController.getPickup);

// Update pickup status
router.put('/:id/status', pickupsController.updatePickupStatus);

// Complete pickup
router.post('/:id/complete', pickupsController.completePickup);

module.exports = router;
