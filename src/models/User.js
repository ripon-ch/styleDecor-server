const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Allows null for users not using Firebase (if any)
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Doesn't return password in queries by default
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    thana: String,
    postalCode: String
  },
  role: {
    type: String,
    enum: ['customer', 'decorator', 'admin'],
    default: 'customer'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Decorator Specific Fields
  bio: {
    type: String,
    maxlength: 1000
  },
  experienceYears: {
    type: Number,
    min: 0,
    default: 0
  },
  isVerified: { // Admin verification for decorators
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  // This automatically handles createdAt and updatedAt
  timestamps: true 
});

// Optimized Indexes for performance
UserSchema.index({ email: 1, role: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ 'address.district': 1 });

// Hash password before saving (Only if password exists and is modified)
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);