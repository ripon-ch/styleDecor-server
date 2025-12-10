// src/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  paymentMethod: { type: String, enum: ['card','bkash','nagad','bank'], required: true },
  stripePaymentIntentId: String,
  status: { type: String, enum: ['pending','succeeded','failed','refunded'], default: 'pending' },
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

paymentSchema.index({ customer: 1, status: 1 });
module.exports = mongoose.model('Payment', paymentSchema);
