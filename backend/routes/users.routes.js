const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth');
const { isAuthenticated } = require('../middleware/roles');

// All routes require authentication
router.use(authenticate);

// GET /api/users/profile - Get user profile
router.get('/profile', usersController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', usersController.updateProfile);

// PUT /api/users/change-password - Change password
router.put('/change-password', usersController.changePassword);

// Address routes
router.get('/addresses', usersController.getAddresses);
router.post('/addresses', usersController.createAddress);
router.put('/addresses/:id', usersController.updateAddress);
router.delete('/addresses/:id', usersController.deleteAddress);

module.exports = router;
