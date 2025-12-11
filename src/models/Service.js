const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['per sq-ft', 'per floor', 'per meter', 'package', 'hourly'],
      message: '{VALUE} is not a valid unit'
    }
  },
  service_category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: {
      values: ['home', 'wedding', 'office', 'seminar', 'meeting', 'event', 'outdoor'],
      message: '{VALUE} is not a valid category'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  images: [{
    type: String,
    required: true
  }],
  createdByEmail: {
    type: String,
    required: [true, 'Creator email is required'],
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance and search
serviceSchema.index({ service_category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ cost: 1 });
serviceSchema.index({ service_name: 'text', description: 'text' }); // Full-text search
serviceSchema.index({ createdByEmail: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;