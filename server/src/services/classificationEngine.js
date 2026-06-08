const { PRIORITY, PRIORITY_RANGES, CATEGORY } = require('../../../shared/constants');
const KEYWORDS = require('../utils/keywords');

class ClassificationEngine {
  
  /**
   * Main entry point to classify a notification.
   * @param {Object} notification - The incoming normalized notification.
   * @param {Array} rules - Array of user-defined rules.
   * @returns {Object} - { priority, score }
   */
  async classify(notification, rules = []) {
    let finalPriority = null;
    let baseScore = 0;

    // Layer 1: Static Rules (Highest Precedence)
    const rulePriority = this.checkStaticRules(notification, rules);
    if (rulePriority) {
      finalPriority = rulePriority;
      baseScore = this.getMedianScoreForPriority(rulePriority);
    } else {
      // Layer 2: Keyword & Category Analysis
      const analysis = this.analyzeContent(notification);
      finalPriority = analysis.priority;
      baseScore = analysis.score;
    }

    // Layer 3: Behavioral Heuristics (Placeholder for Version 2)
    // We will later adjust baseScore up or down based on user interaction history here.

    return {
      priority: finalPriority,
      score: Math.min(Math.max(baseScore, 0), 100) // Clamp between 0-100
    };
  }

  checkStaticRules(notification, rules) {
    // Exact app match
    const appRule = rules.find(r => r.type === 'app' && r.value.toLowerCase() === notification.sourceApp.toLowerCase() && r.isActive);
    if (appRule) return appRule.priority;

    // Category match
    const catRule = rules.find(r => r.type === 'category' && r.value === notification.category && r.isActive);
    if (catRule) return catRule.priority;

    // Keyword match in rules (user explicitly prioritized a word)
    const textToSearch = `${notification.title} ${notification.body}`.toLowerCase();
    const keywordRule = rules.find(r => r.type === 'keyword' && textToSearch.includes(r.value.toLowerCase()) && r.isActive);
    if (keywordRule) return keywordRule.priority;

    return null;
  }

  analyzeContent(notification) {
    const textToSearch = `${notification.title} ${notification.body}`.toLowerCase();
    
    // Check global keywords from highest to lowest priority
    for (const priority of [PRIORITY.CRITICAL, PRIORITY.IMPORTANT, PRIORITY.NOISE, PRIORITY.LOW]) {
      const keywordsList = KEYWORDS[priority];
      if (keywordsList && keywordsList.some(kw => textToSearch.includes(kw))) {
        return {
          priority: priority,
          score: this.getMedianScoreForPriority(priority)
        };
      }
    }

    // Fallback to basic category mapping if no keywords match
    return this.fallbackCategoryMapping(notification.category);
  }

  fallbackCategoryMapping(category) {
    let priority = PRIORITY.LOW; // Default fallback
    
    if ([CATEGORY.SECURITY, CATEGORY.FINANCE].includes(category)) {
      priority = PRIORITY.IMPORTANT; // Downgraded slightly from critical if no emergency keywords
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
    return Math.floor((range.min + range.max) / 2); // E.g., Important (50-79) returns 64
  }
}

module.exports = new ClassificationEngine();
