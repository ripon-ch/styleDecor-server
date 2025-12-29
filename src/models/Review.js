const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  decoratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Indexes for high-performance searching
ReviewSchema.index({ bookingId: 1 }, { unique: true });
ReviewSchema.index({ serviceId: 1, rating: -1 });
ReviewSchema.index({ decoratorId: 1 });

/**
 * Static method to calculate and update ratings
 * This is cleaner than keeping logic inside the post-save hook
 */
ReviewSchema.statics.calculateRatings = async function(serviceId, decoratorId) {
  const Service = mongoose.model('Service');
  const User = mongoose.model('User');

  // 1. Calculate for Service
  const serviceStats = await this.aggregate([
    { $match: { serviceId: serviceId } },
    {
      $group: {
        _id: '$serviceId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (serviceStats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      'rating.average': Math.round(serviceStats[0].avgRating * 10) / 10,
      'rating.count': serviceStats[0].count
    });
  }

  // 2. Calculate for Decorator (User model)
  const decoratorStats = await this.aggregate([
    { $match: { decoratorId: decoratorId } },
    {
      $group: {
        _id: '$decoratorId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (decoratorStats.length > 0) {
    await User.findByIdAndUpdate(decoratorId, {
      'rating.average': Math.round(decoratorStats[0].avgRating * 10) / 10,
      'rating.count': decoratorStats[0].count,
      totalJobs: decoratorStats[0].count
    });
  }
};

// Hook to trigger calculation after a review is saved
ReviewSchema.post('save', function() {
  // Use the static method defined above
  this.constructor.calculateRatings(this.serviceId, this.decoratorId);
});

// Also trigger if a review is removed/deleted
ReviewSchema.post('remove', function() {
  this.constructor.calculateRatings(this.serviceId, this.decoratorId);
});

module.exports = mongoose.model('Review', ReviewSchema);