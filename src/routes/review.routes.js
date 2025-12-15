const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validateReview, validateObjectId, validate } = require('../middleware/validation.middleware');

// @desc    Create review for completed booking
// @route   POST /api/reviews
// @access  Private
router.post('/', authenticateJWT, validateReview, validate, async (req, res, next) => {
  try {
    const { bookingId, rating, comment, images } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this booking'
      });
    }

    const review = await Review.create({
      bookingId,
      serviceId: booking.serviceId,
      customerId: req.user._id,
      decoratorId: booking.decoratorId,
      rating,
      comment,
      images: images || []
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'fullName avatarUrl')
      .populate('decoratorId', 'fullName');

    res.status(201).json({
      success: true,
      review: populatedReview
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get reviews by service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
router.get('/service/:serviceId', validateObjectId, validate, async (req, res, next) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('customerId', 'fullName avatarUrl')
      .populate('decoratorId', 'fullName')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      reviews,
      count: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get reviews by decorator
// @route   GET /api/reviews/decorator/:decoratorId
// @access  Public
router.get('/decorator/:decoratorId', validateObjectId, validate, async (req, res, next) => {
  try {
    const reviews = await Review.find({ decoratorId: req.params.decoratorId })
      .populate('customerId', 'fullName avatarUrl')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      reviews,
      count: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get customer's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
router.get('/my-reviews', authenticateJWT, async (req, res, next) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate('serviceId', 'serviceName')
      .populate('decoratorId', 'fullName')
      .populate('bookingId', 'bookingId eventDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
      count: reviews.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
