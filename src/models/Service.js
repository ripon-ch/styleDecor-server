const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['package', 'per sq-ft', 'hourly', 'per item', 'per floor', 'per event']
  },
  serviceCategory: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['home', 'wedding', 'office', 'event', 'outdoor']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    imageUrl: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    publicId: String
  }],
  features: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
ServiceSchema.index({ serviceCategory: 1, isActive: 1 });
ServiceSchema.index({ cost: 1 });
ServiceSchema.index({ serviceName: 'text', description: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);
