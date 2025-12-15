const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, decoratorId, eventDate, location, specialRequirements, totalAmount, duration } = req.body;

    const booking = await Booking.create({
      customerId: req.user._id,
      serviceId,
      decoratorId,
      eventDate,
      location,
      specialRequirements,
      totalAmount,
      duration
    });

    // Create notification
    await Notification.create({
      userId: req.user._id,
      type: 'booking',
      title: 'Booking Created',
      message: `Your booking has been created successfully. Booking ID: ${booking.bookingId}`,
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('serviceId', 'serviceName cost unit')
      .populate('customerId', 'fullName email phone')
      .populate('decoratorId', 'fullName email phone');

    res.status(201).json({
      success: true,
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (filtered)
// @route   GET /api/bookings
// @access  Private
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, customerId, decoratorId, page = 1, limit = 10 } = req.query;

    // Build query based on user role
    const query = {};

    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'decorator') {
      query.decoratorId = req.user._id;
    }

    // Apply filters
    if (status) query.status = status;
    if (customerId && req.user.role === 'admin') query.customerId = customerId;
    if (decoratorId && req.user.role === 'admin') query.decoratorId = decoratorId;

    const bookings = await Booking.find(query)
      .populate('serviceId', 'serviceName cost unit serviceCategory images')
      .populate('customerId', 'fullName email phone')
      .populate('decoratorId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      count: bookings.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('customerId', 'fullName email phone address')
      .populate('decoratorId', 'fullName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check access rights
    if (req.user.role !== 'admin' &&
        booking.customerId._id.toString() !== req.user._id.toString() &&
        (!booking.decoratorId || booking.decoratorId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking summary before payment
// @route   GET /api/bookings/:id/summary
// @access  Private
exports.getBookingSummary = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId', 'serviceName cost unit description')
      .populate('decoratorId', 'fullName phone rating')
      .populate('customerId', 'fullName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.customerId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      booking: {
        ...booking.toObject(),
        subtotal: booking.totalAmount,
        tax: 0,
        total: booking.totalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check booking availability
// @route   POST /api/bookings/check-availability
// @access  Private
exports.checkAvailability = async (req, res, next) => {
  try {
    const { decoratorId, eventDate } = req.body;

    if (!decoratorId || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Decorator ID and event date are required'
      });
    }

    const requestedDate = new Date(eventDate);
    
    // Check if decorator has bookings on that date
    const existingBooking = await Booking.findOne({
      decoratorId,
      eventDate: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['confirmed', 'assigned', 'in-progress'] }
    });

    res.json({
      success: true,
      available: !existingBooking,
      message: existingBooking 
        ? 'Decorator is not available on this date' 
        : 'Decorator is available'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate status transition
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['assigned', 'in-progress', 'cancelled'],
      assigned: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!allowedTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    // Check permissions
    if (req.user.role === 'customer' && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Customers can only cancel bookings'
      });
    }

    booking.status = status;
    if (status === 'cancelled') {
      booking.cancellationReason = cancellationReason;
    }
    await booking.save();

    // Create notification
    await Notification.create({
      userId: booking.customerId,
      type: 'booking',
      title: 'Booking Status Updated',
      message: `Your booking status has been updated to ${status}`,
      relatedId: booking._id,
      relatedModel: 'Booking'
    });

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign decorator to booking
// @route   PATCH /api/bookings/:id/assign-decorator
// @access  Private (Admin only)
exports.assignDecorator = async (req, res, next) => {
  try {
    const { decoratorId } = req.body;
    
    // Verify decorator exists and has decorator role
    const decorator = await User.findById(decoratorId);
    if (!decorator || decorator.role !== 'decorator') {
      return res.status(400).json({
        success: false,
        message: 'Invalid decorator ID'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        decoratorId,
        status: 'assigned'
      },
      { new: true }
    ).populate('decoratorId', 'fullName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create notifications
    await Notification.create([
      {
        userId: booking.customerId,
        type: 'booking',
        title: 'Decorator Assigned',
        message: `A decorator has been assigned to your booking`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      },
      {
        userId: decoratorId,
        type: 'booking',
        title: 'New Booking Assignment',
        message: `You have been assigned to a new booking`,
        relatedId: booking._id,
        relatedModel: 'Booking'
      }
    ]);

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};
