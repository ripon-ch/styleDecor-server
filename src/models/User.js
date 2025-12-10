// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String },
  displayName: { type: String },
  phoneNumber: { type: String, sparse: true },
  photoURL: { type: String },
  role: { type: String, enum: ['user', 'decorator', 'admin'], default: 'user' },
  profile: {
    address: { type: String },
    district: { type: String },
    thana: { type: String },
    bio: { type: String }
  },
  specialties: { type: [String], default: [] },
  rating: { type: Number, default: 4.5 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: undefined }
  },
  currentLoad: { type: Number, default: 0 },
  approved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ location: '2dsphere' });

module.exports = require('mongoose').model('User', userSchema);
