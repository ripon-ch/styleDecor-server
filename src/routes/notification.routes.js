const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateObjectId, validate } = require('../middleware/validation.middleware');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', validateObjectId, validate, notificationController.markAsRead);
router.delete('/:id', validateObjectId, validate, notificationController.deleteNotification);

module.exports = router;