const mongoose = require('mongoose');
const { FOCUS_MODE } = require('../../../shared/constants');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    digestTime: { type: String, default: '08:00' }, // HH:mm format
    focusMode: { 
      type: String, 
      enum: Object.values(FOCUS_MODE),
      default: FOCUS_MODE.OPEN 
    },
    timezone: { type: String, default: 'UTC' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
