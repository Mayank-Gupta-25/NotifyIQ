const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const { PRIORITY, SOCKET_EVENTS } = require('../../../shared/constants');

class DeliveryManager {
  async processAndDeliver(notificationData, finalPriority, score, explanation = '') {
    // 1. Save to Database
    const notification = new Notification({
      ...notificationData,
      priority: finalPriority,
      score: score
    });
    await notification.save();

    // Attach explanation (not persisted, but sent via socket)
    const notifObj = notification.toObject();
    notifObj.explanation = explanation;

    // 2. Real-time Delivery via WebSocket
    if (finalPriority === PRIORITY.CRITICAL || finalPriority === PRIORITY.IMPORTANT) {
      try {
        const io = getIO();
        io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, notifObj);
        console.log(`🚀 Delivered real-time: [${finalPriority.toUpperCase()}] ${notification.title}`);
      } catch (err) {
        console.warn('⚠️ Could not deliver via WebSocket (client might not be connected yet)');
      }
    } else {
      console.log(`📦 Queued for later: [${finalPriority.toUpperCase()}] ${notification.title}`);
    }

    return notifObj;
  }
}

module.exports = new DeliveryManager();
