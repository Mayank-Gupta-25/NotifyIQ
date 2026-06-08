const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const { PRIORITY, SOCKET_EVENTS } = require('../../../shared/constants');

class DeliveryManager {
  async processAndDeliver(notificationData, finalPriority, score) {
    // 1. Save to Database
    const notification = new Notification({
      ...notificationData,
      priority: finalPriority,
      score: score
    });
    await notification.save();

    // 2. Real-time Delivery via WebSocket
    // We only push Critical and Important notifications to interrupt the user instantly.
    // Low and Noise will just wait in the DB for the Digest/Archive.
    if (finalPriority === PRIORITY.CRITICAL || finalPriority === PRIORITY.IMPORTANT) {
      try {
        const io = getIO();
        io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
        console.log(`🚀 Delivered real-time: [${finalPriority.toUpperCase()}] ${notification.title}`);
      } catch (err) {
        console.warn('⚠️ Could not deliver via WebSocket (client might not be connected yet)');
      }
    } else {
      console.log(`📦 Queued for later: [${finalPriority.toUpperCase()}] ${notification.title}`);
    }

    return notification;
  }
}

module.exports = new DeliveryManager();
