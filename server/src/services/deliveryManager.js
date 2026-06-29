const { PRIORITY } = require('../../../shared/constants');
const NotificationRepo = require('../database/notificationRepo');
const { BrowserWindow } = require('electron');

class DeliveryManager {
  static deliver(notification) {
    // 1. Save to SQLite database
    const savedNotification = NotificationRepo.create(notification);

    // 2. Decide how to deliver based on priority
    if (savedNotification.priority === PRIORITY.CRITICAL || savedNotification.priority === PRIORITY.IMPORTANT) {
      this.pushRealTime(savedNotification);
    } else {
      console.log(`[DeliveryManager] ${savedNotification.priority} notification queued for digest.`);
    }
  }

  static pushRealTime(notification) {
    // Find our main Electron window
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      // Send IPC message to the React frontend
      windows[0].webContents.send('notifications:new', notification);
    }
  }
}

module.exports = DeliveryManager;
