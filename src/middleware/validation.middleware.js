const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Registration validation
exports.validateRegister = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('fullName')
    .trim()
    .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('phone')
    .optional()
    .matches(/^[+]?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
  body('role')
    .optional()
    .isIn(['customer', 'decorator']).withMessage('Invalid role')
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Booking validation
exports.validateBooking = [
  body('serviceId')
    .isMongoId().withMessage('Invalid service ID'),
  body('eventDate')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  body('location.address')
    .notEmpty().withMessage('Address is required'),
  body('totalAmount')
    .isNumeric().withMessage('Total amount must be a number')
    .isFloat({ min: 0 }).withMessage('Total amount must be positive')
];

// Service validation
exports.validateService = [
  body('serviceName')
    .trim()
    .isLength({ min: 3 }).withMessage('Service name must be at least 3 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('cost')
    .isNumeric().withMessage('Cost must be a number')
    .isFloat({ min: 0 }).withMessage('Cost must be positive'),
  body('unit')
    .isIn(['package', 'per sq-ft', 'hourly', 'per item', 'per floor', 'per event'])
    .withMessage('Invalid unit'),
  body('serviceCategory')
    .isIn(['home', 'wedding', 'office', 'event', 'outdoor'])
    .withMessage('Invalid category')
];

// Review validation
exports.validateReview = [
  body('bookingId')
    .isMongoId().withMessage('Invalid booking ID'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
];

// ObjectId validation
exports.validateObjectId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

// Payment validation
exports.validatePayment = [
  body('bookingId')
    .isMongoId().withMessage('Invalid booking ID'),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0 }).withMessage('Amount must be positive')
];

// Query parameter validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be at least 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];