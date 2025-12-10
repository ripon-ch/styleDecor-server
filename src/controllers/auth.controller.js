// src/controllers/auth.controller.js
const User = require('../models/User');
const { verifyFirebase } = require('../middleware/auth.middleware');

exports.exchangeFirebaseForJwt = async (req, res) => {
  try {
    if (req.serverToken && req.user) {
      return res.json({ token: req.serverToken, user: { id: req.user._id, email: req.user.email, role: req.user.role } });
    }
    await verifyFirebase(req, res, () => {
      return res.json({ token: req.serverToken, user: { id: req.user._id, email: req.user.email, role: req.user.role } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.role;
    delete updates.approved;
    delete updates.firebaseUid;
    delete updates.email;
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates, updatedAt: new Date() }, { new: true });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
