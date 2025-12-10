// src/models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  service_name: { type: String, required: true, trim: true },
  service_category: { type: String, required: true, enum: ['home','wedding','office','event','outdoor'] },
  description: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  images: [{ url: String, publicId: String }],
  features: [String],
  coverageZones: [{
    label: String,
    center: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] },
    radiusKm: Number
  }],
  locations: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

serviceSchema.index({ service_category: 1, isActive: 1 });
serviceSchema.index({ cost: 1 });
serviceSchema.index({ 'coverageZones.center': '2dsphere' });

module.exports = mongoose.model('Service', serviceSchema);
