const mongoose = require('mongoose');
const { PRIORITY } = require('../../../shared/constants');

const ruleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['app', 'category', 'keyword'], required: true },
  value: { type: String, required: true }, // e.g., "BankX", "marketing", "OTP"
  priority: { type: String, enum: Object.values(PRIORITY), required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Rule', ruleSchema);
