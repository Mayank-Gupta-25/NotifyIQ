const path = require('path');

let addon = null;
let isAvailable = false;

try {
  // Load the compiled C++ binary
  addon = require('../../native/build/Release/win_notification_listener');
  isAvailable = true;
  console.log('[Native] Successfully loaded win_notification_listener.node');
} catch (error) {
  console.warn('[Native] Addon not found or failed to load.');
  console.warn(error);
}

class WinNotificationListener {
  static isAvailable() {
    return isAvailable;
  }

  static start(onNotificationCallback) {
    if (!isAvailable) return false;
    try {
      addon.startListening(onNotificationCallback);
      return true;
    } catch (e) {
      console.error('[Native] Error starting listener:', e);
      return false;
    }
  }

  static stop() {
    if (!isAvailable) return false;
    try {
      addon.stopListening();
      return true;
    } catch (e) {
      console.error('[Native] Error stopping listener:', e);
      return false;
    }
  }
}

module.exports = WinNotificationListener;
