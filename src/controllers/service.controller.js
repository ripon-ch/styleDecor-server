const Service = require('../models/Service');

// @desc    Get all services
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true });
    res.json({ success: true, services });
  } catch (error) { next(error); }
};

// @desc    Get recommended services
exports.getRecommendedServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).limit(6);
    res.json({ success: true, services });
  } catch (error) { next(error); }
};

// @desc    Get service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, service });
  } catch (error) { next(error); }
};

// @desc    Create service
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, service });
  } catch (error) { next(error); }
};

// @desc    Update service
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, service });
  } catch (error) { next(error); }
};

// @desc    Delete service
exports.deleteService = async (req, res, next) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};