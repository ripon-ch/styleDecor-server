const express = require('express');
const router = express.Router();

// Import the controller
const paymentController = require('../controllers/payment.controller');

// Import the middleware
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public route
router.post('/webhook', paymentController.handleWebhook);

// Protected routes
router.use(protect);

// Use paymentController dot notation to prevent "undefined" errors
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;