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

// Indexes
ReviewSchema.index({ bookingId: 1 }, { unique: true });
ReviewSchema.index({ serviceId: 1, rating: -1 });
ReviewSchema.index({ decoratorId: 1 });

// Update service and decorator ratings after review is saved
ReviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Service = mongoose.model('Service');
  const User = mongoose.model('User');

  try {
    // Update service rating
    const serviceStats = await Review.aggregate([
      { $match: { serviceId: this.serviceId } },
      {
        $group: {
          _id: '$serviceId',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (serviceStats.length > 0) {
      await Service.findByIdAndUpdate(this.serviceId, {
        'rating.average': Math.round(serviceStats[0].averageRating * 10) / 10,
        'rating.count': serviceStats[0].count
      });
    }

    // Update decorator rating
    const decoratorStats = await Review.aggregate([
      { $match: { decoratorId: this.decoratorId } },
      {
        $group: {
          _id: '$decoratorId',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (decoratorStats.length > 0) {
      await User.findByIdAndUpdate(this.decoratorId, {
        'rating.average': Math.round(decoratorStats[0].averageRating * 10) / 10,
        'rating.count': decoratorStats[0].count,
        totalJobs: decoratorStats[0].count
      });
    }
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
