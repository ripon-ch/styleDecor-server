const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  getAllBookings,
  getAnalytics,
  approveDecorator
} = require('../controllers/admin.controller');
const { validateObjectId, validate } = require('../middleware/validation.middleware');

// All admin routes require authentication and admin role
router.use(authenticateJWT, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', validateObjectId, validate, updateUserRole);
router.patch('/users/:id/toggle-active', validateObjectId, validate, toggleUserActive);

// Booking management
router.get('/bookings', getAllBookings);

// Analytics
router.get('/analytics', getAnalytics);

// Decorator management
router.put('/decorators/:id/approve', validateObjectId, validate, approveDecorator);

module.exports = router;