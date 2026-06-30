const { CATEGORY } = require('../../shared/constants');

class NotificationProcessor {
  constructor() {
    // Prevent duplicate processing of the same OS notification
    this.processedCache = new Map();
  }

  normalize(rawData) {
    const { appName, title, body, notifId, timestamp } = rawData;

    // Deduplication (Windows sometimes fires multiple rapid events for one notification)
    const now = Date.now();
    if (this.processedCache.has(notifId)) {
      if (now - this.processedCache.get(notifId) < 5000) {
        return null; // Ignore if seen within 5 seconds
      }
    }
    this.processedCache.set(notifId, now);

    // Clean cache periodically to prevent memory leaks
    if (this.processedCache.size > 100) {
      const cutoff = now - 10000;
      for (const [key, time] of this.processedCache.entries()) {
        if (time < cutoff) this.processedCache.delete(key);
      }
    }

    // Infer category
    const category = this._inferCategory(appName);

    return {
      sourceApp: appName || 'System',
      category: category,
      title: title || 'New Notification',
      body: body || '',
      icon: this._getIcon(appName),
      timestamp: timestamp,
      isReal: true,
      metadata: { windowsNotifId: notifId }
    };
  }

  _inferCategory(appName) {
    const name = (appName || '').toLowerCase();
    
    if (name.includes('chrome') || name.includes('edge') || name.includes('brave')) return CATEGORY.OTHER;
    if (name.includes('mail') || name.includes('outlook')) return CATEGORY.PRODUCTIVITY;
    if (name.includes('whatsapp') || name.includes('telegram') || name.includes('discord') || name.includes('teams') || name.includes('slack')) return CATEGORY.MESSAGING;
    if (name.includes('bank') || name.includes('pay')) return CATEGORY.FINANCE;
    
    return CATEGORY.OTHER; // Fallback
  }

  _getIcon(appName) {
    const name = (appName || '').toLowerCase();
    if (name.includes('whatsapp')) return '💬';
    if (name.includes('discord')) return '🎮';
    if (name.includes('mail') || name.includes('outlook')) return '📧';
    if (name.includes('chrome') || name.includes('edge')) return '🌐';
    return '🔔'; // Default
  }
}

module.exports = new NotificationProcessor();
