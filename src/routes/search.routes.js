const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Global search across services and decorators
// @route   GET /api/search
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const results = {};

    // Search services
    if (type === 'all' || type === 'services') {
      results.services = await Service.find({
        $or: [
          { serviceName: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { serviceCategory: { $regex: q, $options: 'i' } }
        ],
        isActive: true
      }).limit(10);
    }

    // Search decorators
    if (type === 'all' || type === 'decorators') {
      results.decorators = await User.find({
        role: 'decorator',
        isActive: true,
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } },
          { 'address.district': { $regex: q, $options: 'i' } }
        ]
      })
      .select('fullName bio avatarUrl rating experienceYears')
      .limit(10);
    }

    res.json({
      success: true,
      query: q,
      results
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get filter options for services
// @route   GET /api/search/filters
// @access  Public
router.get('/filters', async (req, res, next) => {
  try {
    const [categories, priceRanges] = await Promise.all([
      Service.distinct('serviceCategory', { isActive: true }),
      Service.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$cost' },
            maxPrice: { $max: '$cost' }
          }
        }
      ])
    ]);

    const districts = await User.distinct('address.district', {
      role: 'decorator',
      isActive: true
    });

    res.json({
      success: true,
      filters: {
        categories: categories.filter(Boolean),
        priceRange: priceRanges[0] || { minPrice: 0, maxPrice: 100000 },
        districts: districts.filter(Boolean).sort()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
