const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { validateObjectId, validate } = require('../middleware/validation.middleware');

// @desc    Get all decorators with ratings
// @route   GET /api/decorators
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { verified, minRating, district, page = 1, limit = 10 } = req.query;

    const query = { 
      role: 'decorator',
      isActive: true 
    };

    if (verified === 'true') {
      query.isVerified = true;
    }

    if (minRating) {
      query['rating.average'] = { $gte: Number(minRating) };
    }

    if (district) {
      query['address.district'] = district;
    }

    const decorators = await User.find(query)
      .select('fullName email phone avatarUrl bio experienceYears rating totalJobs isVerified address')
      .sort({ 'rating.average': -1, totalJobs: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await User.countDocuments(query);

    res.json({
      success: true,
      decorators,
      count: decorators.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get decorator profile by ID
// @route   GET /api/decorators/:id
// @access  Public
router.get('/:id', validateObjectId, validate, async (req, res, next) => {
  try {
    const decorator = await User.findOne({
      _id: req.params.id,
      role: 'decorator'
    }).select('-password -refreshToken');

    if (!decorator) {
      return res.status(404).json({
        success: false,
        message: 'Decorator not found'
      });
    }

    // Get recent reviews
    const reviews = await Review.find({ decoratorId: decorator._id })
      .populate('customerId', 'fullName avatarUrl')
      .populate('serviceId', 'serviceName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get completed bookings count
    const completedBookings = await Booking.countDocuments({
      decoratorId: decorator._id,
      status: 'completed'
    });

    res.json({
      success: true,
      decorator: {
        ...decorator.toObject(),
        completedBookings,
        recentReviews: reviews
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;