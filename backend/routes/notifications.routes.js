const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

// All notification routes require authentication
router.use(authenticate);

// List user notifications
router.get('/', notificationsController.listNotifications);

// Mark notification as sent/read
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
