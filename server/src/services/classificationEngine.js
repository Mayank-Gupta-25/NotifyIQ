const { PRIORITY, PRIORITY_RANGES, CATEGORY } = require('../../../shared/constants');
const KEYWORDS = require('../utils/keywords');

const { ACTION_WEIGHTS } = require('../../../shared/constants');

class ClassificationEngine {
  
  /**
   * Main entry point to classify a notification.
   * @param {Object} notification - The incoming normalized notification.
   * @param {Array} rules - Array of user-defined rules.
   * @param {String} userId - The user's ID for behavioral lookup.
   * @returns {Object} - { priority, score, explanation }
   */
  async classify(notification, rules = [], userId = null) {
    let finalPriority = null;
    let baseScore = 0;
    let explanation = [];

    // Layer 1: Static Rules (Highest Precedence)
    const rulePriority = this.checkStaticRules(notification, rules);
    if (rulePriority) {
      finalPriority = rulePriority;
      baseScore = this.getMedianScoreForPriority(rulePriority);
      explanation.push(`User rule matched → ${rulePriority}`);
    } else {
      // Layer 2: Keyword & Category Analysis
      const analysis = this.analyzeContent(notification);
      finalPriority = analysis.priority;
      baseScore = analysis.score;
      explanation.push(analysis.reason);
    }

    // Layer 3: Behavioral Heuristics (Learning!)
    if (userId) {
      const adjustment = await this.applyBehavioralAdjustment(
        userId, notification.sourceApp, notification.category, baseScore
      );
      if (adjustment.adjusted) {
        baseScore = adjustment.newScore;
        finalPriority = this.scoreToPriority(baseScore);
        explanation.push(adjustment.reason);
      }
    }

    const finalScore = Math.min(Math.max(baseScore, 0), 100);

    return {
      priority: finalPriority,
      score: finalScore,
      explanation: explanation.join(' | ')
    };
  }

  checkStaticRules(notification, rules) {
    const sourceApp = notification.sourceApp || '';
    const appRule = rules.find(r => r.type === 'app' && r.value.toLowerCase() === sourceApp.toLowerCase() && r.isActive);
    if (appRule) return appRule.priority;

    const catRule = rules.find(r => r.type === 'category' && r.value === notification.category && r.isActive);
    if (catRule) return catRule.priority;

    const title = notification.title || '';
    const body = notification.body || '';
    const textToSearch = `${title} ${body}`.toLowerCase();
    
    const keywordRule = rules.find(r => r.type === 'keyword' && textToSearch.includes(r.value.toLowerCase()) && r.isActive);
    if (keywordRule) return keywordRule.priority;

    return null;
  }

  analyzeContent(notification) {
    const title = notification.title || '';
    const body = notification.body || '';
    const textToSearch = `${title} ${body}`.toLowerCase();
    
    for (const priority of [PRIORITY.CRITICAL, PRIORITY.IMPORTANT, PRIORITY.NOISE, PRIORITY.LOW]) {
      const keywordsList = KEYWORDS[priority];
      if (keywordsList && keywordsList.some(kw => textToSearch.includes(kw))) {
        return {
          priority: priority,
          score: this.getMedianScoreForPriority(priority),
          reason: `Keyword match → ${priority}`
        };
      }
    }

    const fallback = this.fallbackCategoryMapping(notification.category);
    return { ...fallback, reason: `Category "${notification.category}" → ${fallback.priority}` };
  }

  async applyBehavioralAdjustment(userId, sourceApp, category, currentScore) {
    // Phase 12 Update: Use SQLite repo instead of MongoDB Mongoose
    const BehaviorRepo = require('../database/behaviorRepo');
    const stats = BehaviorRepo.getStatsByApp(userId, sourceApp);
    
    let totalLogs = 0;
    let weightedSum = 0;
    
    stats.forEach(stat => {
      totalLogs += stat.count;
      weightedSum += (ACTION_WEIGHTS[stat.action] || 0) * stat.count;
    });

    if (totalLogs < 3) {
      return { adjusted: false }; // Not enough data yet
    }
    
    const maxPossible = totalLogs * 3;
    const minPossible = totalLogs * -2;
    const range = maxPossible - minPossible;
    const engagementScore = range > 0
      ? Math.round(((weightedSum - minPossible) / range) * 100)
      : 50;

    if (engagementScore > 70) {
      return {
        adjusted: true,
        newScore: Math.min(currentScore + 15, 100),
        reason: `📈 Upgraded: You engage often with ${sourceApp} (${engagementScore}% engagement)`
      };
    } else if (engagementScore < 20) {
      return {
        adjusted: true,
        newScore: Math.max(currentScore - 15, 0),
        reason: `📉 Downgraded: You rarely interact with ${sourceApp} (${engagementScore}% engagement)`
      };
    }

    return { adjusted: false };
  }

  scoreToPriority(score) {
    if (score >= PRIORITY_RANGES[PRIORITY.CRITICAL].min) return PRIORITY.CRITICAL;
    if (score >= PRIORITY_RANGES[PRIORITY.IMPORTANT].min) return PRIORITY.IMPORTANT;
    if (score >= PRIORITY_RANGES[PRIORITY.LOW].min) return PRIORITY.LOW;
    return PRIORITY.NOISE;
  }

  fallbackCategoryMapping(category) {
    let priority = PRIORITY.LOW;
    
    if ([CATEGORY.SECURITY, CATEGORY.FINANCE].includes(category)) {
      priority = PRIORITY.IMPORTANT;
    } else if ([CATEGORY.MESSAGING, CATEGORY.ORDERS, CATEGORY.PRODUCTIVITY].includes(category)) {
      priority = PRIORITY.IMPORTANT;
    } else if ([CATEGORY.MARKETING, CATEGORY.SOCIAL, CATEGORY.NEWS, CATEGORY.ENTERTAINMENT, CATEGORY.FOOD].includes(category)) {
      priority = PRIORITY.LOW;
    }

    return {
      priority,
      score: this.getMedianScoreForPriority(priority)
    };
  }

  getMedianScoreForPriority(priority) {
    const range = PRIORITY_RANGES[priority];
    if (!range) return 0;
    return Math.floor((range.min + range.max) / 2);
  }
}

module.exports = new ClassificationEngine();
