const mongoose = require('mongoose');
const { CATEGORY, PRIORITY, USER_ACTION } = require('../../../shared/constants');

const behaviorLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification', required: true },
  sourceApp: { type: String, required: true },
  category: { type: String, enum: Object.values(CATEGORY), required: true },
  originalPriority: { type: String, enum: Object.values(PRIORITY) },
  action: { type: String, enum: Object.values(USER_ACTION), required: true },
  actionTimestamp: { type: Date, default: Date.now },
  responseTimeMs: { type: Number }
});

module.exports = mongoose.model('BehaviorLog', behaviorLogSchema);
