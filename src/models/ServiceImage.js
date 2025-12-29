import mongoose from 'mongoose';

const serviceImageSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  imageUrl: { type: String, required: true },
  altText: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('ServiceImage', serviceImageSchema);
