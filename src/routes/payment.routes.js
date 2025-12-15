const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  stripeWebhook
} = require('../controllers/payment.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validatePayment, validate } = require('../middleware/validation.middleware');

// Webhook route (must be before JSON parsing middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Protected routes
router.use(authenticateJWT);
router.post('/create-intent', validatePayment, validate, createPaymentIntent);
router.post('/confirm', confirmPayment);
router.get('/history', getPaymentHistory);

module.exports = router;