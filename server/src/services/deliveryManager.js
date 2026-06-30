const { PRIORITY } = require('../../../shared/constants');
const NotificationRepo = require('../database/notificationRepo');
const { BrowserWindow } = require('electron');
const ToastRenderer = require('../../../electron/services/toastRenderer');

class DeliveryManager {
  static deliver(notification) {
    const savedNotification = NotificationRepo.create(notification);

    if (savedNotification.priority === PRIORITY.CRITICAL || savedNotification.priority === PRIORITY.IMPORTANT) {
      this.pushRealTime(savedNotification);
      
      // SPAWN THE CUSTOM TOAST!
      ToastRenderer.spawnToast(savedNotification);
    } else {
      console.log(`[DeliveryManager] ${savedNotification.priority} notification queued for digest.`);
    }
  }

  static pushRealTime(notification) {
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      // Find the main app window (ignore the tiny toast windows)
      const mainWindow = windows.find(w => !w.webContents.getURL().includes('toast.html'));
      if (mainWindow) {
        mainWindow.webContents.send('notifications:new', notification);
      }
    }
  }
}

module.exports = DeliveryManager;
