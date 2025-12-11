// src/controllers/admin.controller.js
const User = require('../models/User');
const Booking = require('../models/Booking');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('service customer decorator');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.assignDecorator = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { decorator: req.body.decoratorId, status: 'assigned' }, { new: true });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const PaymentModel = require('../models/Payment');

    const revenue = await PaymentModel.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const BookingModel = require('../models/Booking');
    const stats = await BookingModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ revenue, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
