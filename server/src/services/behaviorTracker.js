const BehaviorRepo = require('../database/behaviorRepo');
const { ACTION_WEIGHTS } = require('../../../shared/constants');

class BehaviorTracker {
  static logAction(notificationId, sourceApp, category, originalPriority, action, responseTimeMs) {
    return BehaviorRepo.logAction({
      notificationId,
      sourceApp,
      category,
      originalPriority,
      action,
      responseTimeMs
    });
  }

  static getEngagementScore(sourceApp) {
    const stats = BehaviorRepo.getStatsByApp('user_001', sourceApp);
    if (!stats || stats.length === 0) return 50; // Default score

    let totalScore = 0;
    let totalInteractions = 0;

    stats.forEach(stat => {
      const weight = ACTION_WEIGHTS[stat.action] || 0;
      totalScore += stat.count * weight;
      totalInteractions += stat.count;
    });

    if (totalInteractions === 0) return 50;

    // Normalize to 0-100 scale (approximate heuristic)
    const rawScore = totalScore / totalInteractions; 
    let finalScore = 50 + (rawScore * 15);
    
    return Math.max(0, Math.min(100, finalScore));
  }
}

module.exports = BehaviorTracker;
