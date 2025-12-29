const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    index: true // Better for regex searching "Sofa Decor" -> "Sofa"
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
    enum: ['home', 'wedding', 'office', 'event', 'outdoor'],
    lowercase: true // Normalizes data for filters
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    imageUrl: String,
    altText: String,
    isPrimary: { type: Boolean, default: false }
  }],
  features: [String],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  createdByEmail: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, // Allows the primary image helper to show up
  toObject: { virtuals: true }
});

// For Search Functionality Requirement (Text index + regular index)
ServiceSchema.index({ serviceName: 'text', description: 'text' });
ServiceSchema.index({ serviceCategory: 1, cost: 1 }); // Optimized for "Filter by Category & Price"

// Virtual: Get the primary image easily
ServiceSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.imageUrl : (this.images[0]?.imageUrl || null);
});

module.exports = mongoose.model('Service', ServiceSchema);