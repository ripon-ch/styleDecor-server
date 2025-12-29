const User = require('../models/User');
const admin = require('../config/firebase');

exports.register = async (req, res) => {
  try {
    const { uid, email, fullName, phone, address, role } = req.body;
    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (user) return res.status(400).json({ success: false, message: "User already exists" });

    user = await User.create({
      firebaseUid: uid,
      email,
      fullName,
      phone,
      address,
      role: role || 'customer'
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        fullName: decodedToken.name || "User",
        role: 'customer'
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Auth failed" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  res.json({ success: true, message: "Avatar logic placeholder" });
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: "Logged out" });
};