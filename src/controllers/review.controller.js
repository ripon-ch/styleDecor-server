const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Create review for completed booking
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, images } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Status check
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }

    // Ownership check (req.user is attached by auth.protect)
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) return res.status(400).json({ success: false, message: 'Review already exists' });

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

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews by service
const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('customerId', 'fullName avatarUrl')
      .populate('decoratorId', 'fullName')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.json({
      success: true,
      reviews,
      count: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews by decorator
const getDecoratorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ decoratorId: req.params.decoratorId })
      .populate('customerId', 'fullName avatarUrl')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    res.json({ success: true, reviews, count: reviews.length, averageRating: Math.round(avgRating * 10) / 10 });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's reviews
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate('serviceId', 'serviceName')
      .populate('decoratorId', 'fullName')
      .populate('bookingId', 'bookingId eventDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews, count: reviews.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getServiceReviews,
  getDecoratorReviews,
  getMyReviews
};