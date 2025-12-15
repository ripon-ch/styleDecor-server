const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service ID is required']
  },
  decoratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bookingDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  duration: {
    type: Number,
    default: 1
  },
  location: {
    address: { 
      type: String, 
      required: [true, 'Address is required']
    },
    district: String,
    thana: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  specialRequirements: {
    type: String,
    maxlength: 1000
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  notes: String,
  cancellationReason: String,
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
BookingSchema.index({ customerId: 1, status: 1 });
BookingSchema.index({ decoratorId: 1, eventDate: 1 });
BookingSchema.index({ serviceId: 1 });
BookingSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
