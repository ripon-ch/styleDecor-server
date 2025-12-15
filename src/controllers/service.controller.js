const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getAllServices = async (req, res, next) => {
  try {
    const { category, search, minCost, maxCost, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.serviceCategory = category;
    }

    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minCost || maxCost) {
      query.cost = {};
      if (minCost) query.cost.$gte = Number(minCost);
      if (maxCost) query.cost.$lte = Number(maxCost);
    }

    // Execute query with pagination
    const services = await Service.find(query)
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Service.countDocuments(query);

    res.json({
      success: true,
      services,
      count: services.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin/Decorator)
exports.createService = async (req, res, next) => {
  try {
    const { serviceName, description, cost, unit, serviceCategory, images, features } = req.body;

    const service = await Service.create({
      serviceName,
      description,
      cost,
      unit,
      serviceCategory,
      images,
      features,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin/Decorator)
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check ownership (admin or creator)
    if (req.user.role !== 'admin' && service.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      service: updatedService
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin only)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.deleteOne();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended services for user
// @route   GET /api/services/recommended
// @access  Private
exports.getRecommendedServices = async (req, res, next) => {
  try {
    const Booking = require('../models/Booking');
    const userId = req.user._id;

    // Get user's booking history
    const userBookings = await Booking.find({ customerId: userId })
      .populate('serviceId')
      .limit(10);

    // Get categories user has booked
    const bookedCategories = [...new Set(
      userBookings.map(b => b.serviceId?.serviceCategory).filter(Boolean)
    )];

    let recommendedServices;

    if (bookedCategories.length > 0) {
      // Recommend services from same categories
      recommendedServices = await Service.find({
        serviceCategory: { $in: bookedCategories },
        isActive: true,
        _id: { $nin: userBookings.map(b => b.serviceId?._id).filter(Boolean) }
      })
      .sort({ 'rating.average': -1 })
      .limit(6);
    } else {
      // No history - show popular services
      recommendedServices = await Service.find({ isActive: true })
        .sort({ 'rating.average': -1, 'rating.count': -1 })
        .limit(6);
    }

    res.json({
      success: true,
      services: recommendedServices,
      reason: bookedCategories.length > 0 
        ? 'Based on your booking history' 
        : 'Popular services'
    });
  } catch (error) {
    next(error);
  }
};