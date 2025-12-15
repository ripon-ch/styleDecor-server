const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'card', 'bkash', 'nagad', 'bank', 'cash'],
    default: 'stripe'
  },
  stripePaymentIntentId: String,
  stripeSessionId: String,
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: mongoose.Schema.Types.Mixed,
  paidAt: Date,
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
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ customerId: 1, status: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true });

module.exports = mongoose.model('Payment', PaymentSchema);
