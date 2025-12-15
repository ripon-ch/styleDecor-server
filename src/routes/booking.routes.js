const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingSummary,
  checkAvailability,
  updateBookingStatus,
  assignDecorator
} = require('../controllers/booking.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validateBooking, validateObjectId, validate } = require('../middleware/validation.middleware');

router.use(authenticateJWT); // All routes require authentication

router.post('/', validateBooking, validate, createBooking);
router.post('/check-availability', checkAvailability);
router.get('/', getAllBookings);
router.get('/:id', validateObjectId, validate, getBookingById);
router.get('/:id/summary', validateObjectId, validate, getBookingSummary);
router.patch('/:id/status', validateObjectId, validate, updateBookingStatus);
router.patch('/:id/assign-decorator', authorize('admin'), validateObjectId, validate, assignDecorator);

module.exports = router;