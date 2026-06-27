const BehaviorLog = require('../models/BehaviorLog');
const { ACTION_WEIGHTS } = require('../../../shared/constants');

class BehaviorTracker {

  /**
   * Log a user's interaction with a notification.
   */
  async logAction(userId, notification, action) {
    const log = new BehaviorLog({
      userId,
      notificationId: notification._id,
      sourceApp: notification.sourceApp,
      category: notification.category,
      originalPriority: notification.priority,
      action,
      actionTimestamp: new Date(),
      responseTimeMs: Date.now() - new Date(notification.timestamp).getTime()
    });
    await log.save();
    console.log(`📝 Behavior logged: [${action}] on "${notification.title}" from ${notification.sourceApp}`);
    return log;
  }

  /**
   * Calculate engagement score for a specific app.
   * Formula: (opens × 3 + clicks × 2 + snoozed × 1 - dismissed × 1 - ignored × 2) / total × 100
   * High engagement (>70) = user cares → upgrade priority
   * Low engagement (<20) = user doesn't care → downgrade priority
   */
  async getAppEngagement(userId, sourceApp) {
    const logs = await BehaviorLog.find({ userId, sourceApp });
    if (logs.length === 0) return { score: 50, total: 0 }; // Neutral default

    let weightedSum = 0;
    logs.forEach(log => {
      weightedSum += ACTION_WEIGHTS[log.action] || 0;
    });

    // Normalize to 0-100 range
    // Max possible per log = +3 (opened), min = -2 (ignored)
    const maxPossible = logs.length * 3;
    const minPossible = logs.length * -2;
    const range = maxPossible - minPossible;
    const score = range > 0
      ? Math.round(((weightedSum - minPossible) / range) * 100)
      : 50;

    return {
      score: Math.min(Math.max(score, 0), 100),
      total: logs.length,
      weightedSum
    };
  }

  /**
   * Calculate engagement score for a specific category.
   */
  async getCategoryEngagement(userId, category) {
    const logs = await BehaviorLog.find({ userId, category });
    if (logs.length === 0) return { score: 50, total: 0 };

    let weightedSum = 0;
    logs.forEach(log => {
      weightedSum += ACTION_WEIGHTS[log.action] || 0;
    });

    const maxPossible = logs.length * 3;
    const minPossible = logs.length * -2;
    const range = maxPossible - minPossible;
    const score = range > 0
      ? Math.round(((weightedSum - minPossible) / range) * 100)
      : 50;

    return {
      score: Math.min(Math.max(score, 0), 100),
      total: logs.length,
      weightedSum
    };
  }

  /**
   * Get a full engagement report for all apps the user has interacted with.
   */
  async getFullReport(userId) {
    const logs = await BehaviorLog.find({ userId });
    const appMap = {};
    const categoryMap = {};

    logs.forEach(log => {
      const w = ACTION_WEIGHTS[log.action] || 0;

      if (!appMap[log.sourceApp]) appMap[log.sourceApp] = { total: 0, weightedSum: 0 };
      appMap[log.sourceApp].total++;
      appMap[log.sourceApp].weightedSum += w;

      if (!categoryMap[log.category]) categoryMap[log.category] = { total: 0, weightedSum: 0 };
      categoryMap[log.category].total++;
      categoryMap[log.category].weightedSum += w;
    });

    // Convert to scores
    const normalize = (entry) => {
      const max = entry.total * 3;
      const min = entry.total * -2;
      const range = max - min;
      return range > 0 ? Math.round(((entry.weightedSum - min) / range) * 100) : 50;
    };

    const appScores = Object.entries(appMap).map(([app, data]) => ({
      app, score: normalize(data), interactions: data.total
    })).sort((a, b) => b.interactions - a.interactions);

    const categoryScores = Object.entries(categoryMap).map(([category, data]) => ({
      category, score: normalize(data), interactions: data.total
    })).sort((a, b) => b.interactions - a.interactions);

    return { appScores, categoryScores, totalInteractions: logs.length };
  }
}

module.exports = new BehaviorTracker();
