const { PRIORITY, CATEGORY, SIMULATED_APPS } = require('../../../shared/constants');

const defaultRules = [
  // Critical Baseline
  { type: 'category', value: CATEGORY.SECURITY, priority: PRIORITY.CRITICAL },
  
  // Important Baseline
  { type: 'category', value: CATEGORY.MESSAGING, priority: PRIORITY.IMPORTANT },
  { type: 'category', value: CATEGORY.ORDERS, priority: PRIORITY.IMPORTANT },
  { type: 'app', value: SIMULATED_APPS.WORKMAIL.name, priority: PRIORITY.IMPORTANT },

  // Low (Digest material)
  { type: 'category', value: CATEGORY.MARKETING, priority: PRIORITY.LOW },
  { type: 'category', value: CATEGORY.SOCIAL, priority: PRIORITY.LOW },
  { type: 'category', value: CATEGORY.NEWS, priority: PRIORITY.LOW },
  { type: 'category', value: CATEGORY.ENTERTAINMENT, priority: PRIORITY.LOW },
  
  // Noise Baseline
  { type: 'keyword', value: 'we miss you', priority: PRIORITY.NOISE },
  { type: 'keyword', value: 'rate us', priority: PRIORITY.NOISE }
];

module.exports = { defaultRules };
