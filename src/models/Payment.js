const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking ID is required'],
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['stripe', 'cash', 'bank_transfer'],
      message: '{VALUE} is not a valid payment method'
    },
    default: 'stripe'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: '{VALUE} is not a valid payment status'
    },
    default: 'pending'
  },
  stripePaymentId: {
    type: String,
    default: null
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ bookingId: 1 }, { unique: true });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ stripePaymentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;