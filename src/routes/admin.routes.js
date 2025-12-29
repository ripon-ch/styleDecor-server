const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validateObjectId, validate } = require('../middleware/validation.middleware');

// Controller imports
const {
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  getAllBookings,
  getAnalytics,
  approveDecorator
} = require('../controllers/admin.controller');

// Apply Global Admin Protection
router.use(protect, authorize('admin'));

// Routes
router.get('/users', getAllUsers);
router.put('/users/:id/role', validateObjectId, validate, updateUserRole);
router.patch('/users/:id/toggle-active', validateObjectId, validate, toggleUserActive);
router.get('/bookings', getAllBookings);
router.get('/analytics', getAnalytics);
router.put('/decorators/:id/approve', validateObjectId, validate, approveDecorator);

module.exports = router;