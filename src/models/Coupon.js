// src/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, uppercase: true, unique: true },
  type: { type: String, enum: ['percent','fixed'], default: 'percent' },
  value: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 },
  startsAt: Date,
  expiresAt: Date,
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

couponSchema.methods.isValid = function(amount) {
  const now = new Date();
  if (this.startsAt && now < this.startsAt) return false;
  if (this.expiresAt && now > this.expiresAt) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  if (amount < (this.minAmount || 0)) return false;
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
