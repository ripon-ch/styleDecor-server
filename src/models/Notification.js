// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  to: String,
  channel: { type: String, enum: ['sms','email','push'], default: 'sms' },
  template: String,
  message: String,
  meta: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ['queued','sent','failed'], default: 'queued' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
