// src/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, default: () => `BK${Date.now()}` },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  decorator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookingDate: { type: Date, default: Date.now },
  eventDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  location: {
    address: { type: String, required: true },
    district: String,
    thana: String,
    coordinates: { lat: Number, lng: Number }
  },
  status: { type: String, enum: ['pending','confirmed','assigned','in-progress','completed','cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid','paid','refunded'], default: 'unpaid' },
  totalAmount: { type: Number, required: true },
  notes: String,
  cancellationReason: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ decorator: 1, bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
