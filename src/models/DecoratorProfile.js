import mongoose from 'mongoose';

const decoratorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String },
  experienceYears: { type: Number, default: 0 },
  rating: { type: Number, default: 0.0 },
  totalJobs: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('DecoratorProfile', decoratorProfileSchema);
