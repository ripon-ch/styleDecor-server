const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware'); // Changed from authenticateJWT
const { validateReview, validateObjectId, validate } = require('../middleware/validation.middleware');

// Create a review
router.post('/', protect, validateReview, validate, reviewController.createReview);

// Get reviews for a service
router.get('/service/:serviceId', validateObjectId, validate, reviewController.getServiceReviews);

// Get reviews for a decorator
router.get('/decorator/:decoratorId', validateObjectId, validate, reviewController.getDecoratorReviews);

// Get current user's reviews
router.get('/my-reviews', protect, reviewController.getMyReviews);

module.exports = router;