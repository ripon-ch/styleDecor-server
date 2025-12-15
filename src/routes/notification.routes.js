const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validateObjectId, validate } = require('../middleware/validation.middleware');

router.use(authenticateJWT); // All routes require authentication

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      count: notifications.length
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
router.patch('/:id/read', validateObjectId, validate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', validateObjectId, validate, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;