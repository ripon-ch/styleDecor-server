const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(authenticateJWT);

// @desc    Get customer dashboard stats
// @route   GET /api/stats/customer
// @access  Private (Customer)
router.get('/customer', authorize('customer'), async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const [
      totalBookings,
      activeBookings,
      completedBookings,
      totalSpent,
      upcomingBookings
    ] = await Promise.all([
      Booking.countDocuments({ customerId }),
      Booking.countDocuments({ 
        customerId, 
        status: { $in: ['pending', 'confirmed', 'assigned', 'in-progress'] } 
      }),
      Booking.countDocuments({ customerId, status: 'completed' }),
      Payment.aggregate([
        { $match: { customerId, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Booking.find({ 
        customerId, 
        eventDate: { $gte: new Date() },
        status: { $in: ['confirmed', 'assigned', 'in-progress'] }
      })
      .populate('serviceId', 'serviceName cost unit')
      .populate('decoratorId', 'fullName phone')
      .sort({ eventDate: 1 })
      .limit(5)
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings,
        activeBookings,
        completedBookings,
        totalSpent: totalSpent[0]?.total || 0,
        upcomingBookings
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get decorator dashboard stats
// @route   GET /api/stats/decorator
// @access  Private (Decorator)
router.get('/decorator', authorize('decorator'), async (req, res, next) => {
  try {
    const decoratorId = req.user._id;

    const [
      totalJobs,
      activeJobs,
      completedJobs,
      totalEarnings,
      avgRating,
      upcomingJobs,
      monthlyEarnings
    ] = await Promise.all([
      Booking.countDocuments({ decoratorId }),
      Booking.countDocuments({ 
        decoratorId, 
        status: { $in: ['assigned', 'in-progress'] } 
      }),
      Booking.countDocuments({ decoratorId, status: 'completed' }),
      Payment.aggregate([
        { 
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking'
          }
        },
        { $unwind: '$booking' },
        { 
          $match: { 
            'booking.decoratorId': decoratorId,
            status: 'paid' 
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Review.aggregate([
        { $match: { decoratorId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      Booking.find({
        decoratorId,
        eventDate: { $gte: new Date() },
        status: { $in: ['assigned', 'in-progress'] }
      })
      .populate('serviceId', 'serviceName')
      .populate('customerId', 'fullName phone')
      .sort({ eventDate: 1 })
      .limit(5),
      Payment.aggregate([
        { 
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking'
          }
        },
        { $unwind: '$booking' },
        { 
          $match: { 
            'booking.decoratorId': decoratorId,
            status: 'paid',
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            earnings: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs,
        activeJobs,
        completedJobs,
        totalEarnings: totalEarnings[0]?.total || 0,
        avgRating: avgRating[0]?.avgRating || 0,
        upcomingJobs,
        monthlyEarnings
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;