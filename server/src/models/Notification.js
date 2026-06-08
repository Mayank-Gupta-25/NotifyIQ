const mongoose = require('mongoose');
const { PRIORITY, CATEGORY, NOTIFICATION_STATUS } = require('../../../shared/constants');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceApp: { type: String, required: true },
  category: { 
    type: String, 
    enum: Object.values(CATEGORY),
    required: true 
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  icon: { type: String },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    deepLink: { type: String },
    actionButtons: [{ type: String }]
  },
  priority: { 
    type: String, 
    enum: Object.values(PRIORITY) 
    // Nullable initially until classified
  },
  score: { type: Number, min: 0, max: 100 },
  status: { 
    type: String, 
    enum: Object.values(NOTIFICATION_STATUS),
    default: NOTIFICATION_STATUS.UNREAD 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
