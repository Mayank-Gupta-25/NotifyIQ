const NotificationRepo = require('../database/notificationRepo');
const DigestRepo = require('../database/digestRepo');
const { PRIORITY, NOTIFICATION_STATUS } = require('../../../shared/constants');

class DigestGenerator {
  async generateDailyDigest(userId = 'user_001') {
    const now = new Date();
    
    // Fetch all unread "Low" priority notifications
    const notifications = NotificationRepo.getAll({
      status: NOTIFICATION_STATUS.UNREAD,
      priority: PRIORITY.LOW
    });

    if (notifications.length === 0) {
      console.log('📭 No low-priority notifications to bundle.');
      return null;
    }

    // 1. Group by category and count app frequencies
    const categoryMap = new Map();
    const appCounts = {};

    notifications.forEach(n => {
      categoryMap.set(n.category, (categoryMap.get(n.category) || 0) + 1);
      appCounts[n.sourceApp] = (appCounts[n.sourceApp] || 0) + 1;
    });

    // 2. Identify the top 3 apps spamming the user
    const topApps = Object.entries(appCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([app]) => app);

    // 3. Build organized sections
    const sections = [];
    categoryMap.forEach((count, category) => {
      const catNotifs = notifications.filter(n => n.category === category);
      
      // Grab 2 highlights (titles of the newest notifications in this category)
      const highlights = catNotifs.slice(-2).map(n => n.title);

      sections.push({
        category,
        icon: catNotifs[0].icon || '📌',
        count,
        highlights,
        notifications: catNotifs.map(n => n._id)
      });
    });

    // 4. Create and save the Digest
    const digest = DigestRepo.create({
      userId,
      period: {
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        to: now.toISOString()
      },
      summary: {
        totalNotifications: notifications.length,
        byCategory: Object.fromEntries(categoryMap),
        topApps,
        suppressedCount: 0 // Placeholder for Noise notifications
      },
      sections
    });

    // 5. Mark notifications as archived so they don't appear in tomorrow's digest
    NotificationRepo.updateManyStatus(
      notifications.map(n => n._id),
      NOTIFICATION_STATUS.ARCHIVED
    );

    console.log(`🗞️ Daily Digest Generated! Bundled ${notifications.length} notifications.`);
    return digest;
  }
}

module.exports = new DigestGenerator();
