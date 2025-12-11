const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  decoratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Decorator ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
reviewSchema.index({ bookingId: 1 }, { unique: true });
reviewSchema.index({ decoratorId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ rating: 1 });

// Auto-update decorator profile rating after saving review
reviewSchema.post('save', async function() {
  const DecoratorProfile = require('./DecoratorProfile');
  const Review = this.constructor;
  
  try {
    // Calculate average rating for decorator
    const stats = await Review.aggregate([
      { $match: { decoratorId: this.decoratorId } },
      {
        $group: {
          _id: '$decoratorId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    
    // Update decorator profile
    if (stats.length > 0) {
      await DecoratorProfile.findOneAndUpdate(
        { userId: this.decoratorId },
        {
          rating: Math.round(stats[0].averageRating * 100) / 100,
          totalJobs: stats[0].totalReviews
        },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error updating decorator rating:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;