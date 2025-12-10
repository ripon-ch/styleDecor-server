// src/controllers/service.controller.js
const Service = require('../models/Service');

exports.list = async (req, res) => {
  try {
    const { q, category, min, max, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (q) filter.service_name = { $regex: q, $options: 'i' };
    if (category) filter.service_category = category;
    if (min || max) filter.cost = {};
    if (min) filter.cost.$gte = Number(min);
    if (max) filter.cost.$lte = Number(max);
    const skip = (page - 1) * limit;
    const services = await Service.find(filter).skip(skip).limit(Number(limit));
    const total = await Service.countDocuments(filter);
    res.json({ total, services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const srv = await Service.findById(req.params.id);
    if (!srv) return res.status(404).json({ message: 'Not found' });
    res.json(srv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;
    const srv = await Service.create(data);
    res.status(201).json(srv);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const srv = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(srv);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
