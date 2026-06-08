const mongoose = require('mongoose');

const digestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  period: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  summary: {
    totalNotifications: { type: Number, default: 0 },
    byCategory: { type: Map, of: Number }, // Map of string -> numbers
    topApps: [{ type: String }],
    suppressedCount: { type: Number, default: 0 }
  },
  sections: [{
    category: { type: String },
    icon: { type: String },
    count: { type: Number },
    highlights: [{ type: String }],
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Digest', digestSchema);
