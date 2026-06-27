const { PRIORITY, PRIORITY_RANGES, CATEGORY } = require('../../../shared/constants');
const KEYWORDS = require('../utils/keywords');
const BehaviorLog = require('../models/BehaviorLog');
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
    const appRule = rules.find(r => r.type === 'app' && r.value.toLowerCase() === notification.sourceApp.toLowerCase() && r.isActive);
    if (appRule) return appRule.priority;

    const catRule = rules.find(r => r.type === 'category' && r.value === notification.category && r.isActive);
    if (catRule) return catRule.priority;

    const textToSearch = `${notification.title} ${notification.body}`.toLowerCase();
    const keywordRule = rules.find(r => r.type === 'keyword' && textToSearch.includes(r.value.toLowerCase()) && r.isActive);
    if (keywordRule) return keywordRule.priority;

    return null;
  }

  analyzeContent(notification) {
    const textToSearch = `${notification.title} ${notification.body}`.toLowerCase();
    
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

  /**
   * Layer 3: Adjust score based on user's past behavior with this app/category.
   * If engagement < 20 → user doesn't care → downgrade (-15 points)
   * If engagement > 70 → user cares a lot → upgrade (+15 points)
   */
  async applyBehavioralAdjustment(userId, sourceApp, category, currentScore) {
    const logs = await BehaviorLog.find({ userId, sourceApp }).limit(20).sort({ actionTimestamp: -1 });
    
    if (logs.length < 3) {
      return { adjusted: false }; // Not enough data yet
    }

    let weightedSum = 0;
    logs.forEach(log => { weightedSum += ACTION_WEIGHTS[log.action] || 0; });
    
    const maxPossible = logs.length * 3;
    const minPossible = logs.length * -2;
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
