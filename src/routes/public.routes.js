const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get featured services for homepage
// @route   GET /api/public/featured-services
// @access  Public
router.get('/featured-services', async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(6)
      .select('serviceName description cost unit serviceCategory images rating');

    res.json({
      success: true,
      services
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured decorators for homepage
// @route   GET /api/public/featured-decorators
// @access  Public
router.get('/featured-decorators', async (req, res, next) => {
  try {
    const decorators = await User.find({
      role: 'decorator',
      isActive: true,
      isVerified: true
    })
    .select('fullName avatarUrl bio rating experienceYears totalJobs address')
    .sort({ 'rating.average': -1, totalJobs: -1 })
    .limit(6);

    res.json({
      success: true,
      decorators
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get testimonials
// @route   GET /api/public/testimonials
// @access  Public
router.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await Review.find({ rating: { $gte: 4 } })
      .populate('customerId', 'fullName avatarUrl')
      .populate('serviceId', 'serviceName')
      .populate('decoratorId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      testimonials
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get service categories with counts
// @route   GET /api/public/service-categories
// @access  Public
router.get('/service-categories', async (req, res, next) => {
  try {
    const categories = await Service.aggregate([
      { $match: { isActive: true } },
      { 
        $group: { 
          _id: '$serviceCategory', 
          count: { $sum: 1 },
          avgCost: { $avg: '$cost' }
        } 
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get coverage areas (districts)
// @route   GET /api/public/coverage-areas
// @access  Public
router.get('/coverage-areas', async (req, res, next) => {
  try {
    const areas = await User.aggregate([
      { 
        $match: { 
          role: 'decorator', 
          isActive: true,
          'address.district': { $exists: true, $ne: null }
        } 
      },
      { 
        $group: { 
          _id: '$address.district',
          decoratorCount: { $sum: 1 }
        } 
      },
      { $sort: { decoratorCount: -1 } }
    ]);

    res.json({
      success: true,
      areas: areas.map(a => ({
        district: a._id,
        decoratorCount: a.decoratorCount
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;