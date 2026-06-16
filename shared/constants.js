/**
 * Shared constants between client and server.
 * Import from here to ensure single source of truth.
 */

// Priority tiers
const PRIORITY = {
  CRITICAL: 'critical',
  IMPORTANT: 'important',
  LOW: 'low',
  NOISE: 'noise',
};

// Priority score ranges
const PRIORITY_RANGES = {
  [PRIORITY.CRITICAL]:  { min: 80, max: 100 },
  [PRIORITY.IMPORTANT]: { min: 50, max: 79 },
  [PRIORITY.LOW]:       { min: 20, max: 49 },
  [PRIORITY.NOISE]:     { min: 0,  max: 19 },
};

// Priority display config (for UI)
const PRIORITY_CONFIG = {
  [PRIORITY.CRITICAL]: {
    label: 'Critical',
    color: '#FF4757',
    icon: '🔴',
    description: 'Immediate attention required',
  },
  [PRIORITY.IMPORTANT]: {
    label: 'Important',
    color: '#FFA502',
    icon: '🟡',
    description: 'Worth checking soon',
  },
  [PRIORITY.LOW]: {
    label: 'Low',
    color: '#3742FA',
    icon: '🔵',
    description: 'Bundled into Daily Digest',
  },
  [PRIORITY.NOISE]: {
    label: 'Noise',
    color: '#747D8C',
    icon: '⚪',
    description: 'Auto-suppressed',
  },
};

// Notification categories
const CATEGORY = {
  SECURITY: 'security',
  FINANCE: 'finance',
  SOCIAL: 'social',
  MESSAGING: 'messaging',
  MARKETING: 'marketing',
  PRODUCTIVITY: 'productivity',
  HEALTH: 'health',
  NEWS: 'news',
  FOOD: 'food',
  ENTERTAINMENT: 'entertainment',
  ORDERS: 'orders',
  UPDATES: 'updates',
  OTHER: 'other',
};

// Focus modes
const FOCUS_MODE = {
  OPEN: 'open',
  WORK: 'work',
  PERSONAL: 'personal',
  DND: 'dnd',
};

// Focus mode delivery rules
const FOCUS_RULES = {
  [FOCUS_MODE.OPEN]: [PRIORITY.CRITICAL, PRIORITY.IMPORTANT, PRIORITY.LOW, PRIORITY.NOISE],
  [FOCUS_MODE.WORK]: [PRIORITY.CRITICAL],
  [FOCUS_MODE.PERSONAL]: [PRIORITY.CRITICAL, PRIORITY.IMPORTANT],
  [FOCUS_MODE.DND]: [],
};

// Notification statuses
const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  DISMISSED: 'dismissed',
  SNOOZED: 'snoozed',
  ARCHIVED: 'archived',
};

// User action types (for behavior tracking)
const USER_ACTION = {
  OPENED: 'opened',
  CLICKED_ACTION: 'clicked_action',
  DISMISSED: 'dismissed',
  IGNORED: 'ignored',
  SNOOZED: 'snoozed',
};

// Action weights for engagement scoring
const ACTION_WEIGHTS = {
  [USER_ACTION.OPENED]: 3,
  [USER_ACTION.CLICKED_ACTION]: 2,
  [USER_ACTION.SNOOZED]: 1,
  [USER_ACTION.DISMISSED]: -1,
  [USER_ACTION.IGNORED]: -2,
};

// Simulated apps
const SIMULATED_APPS = {
  BANKX: { name: 'BankX', icon: '🏦', categories: [CATEGORY.SECURITY, CATEGORY.FINANCE] },
  SHOPKART: { name: 'ShopKart', icon: '🛒', categories: [CATEGORY.MARKETING, CATEGORY.ORDERS] },
  CHATAPP: { name: 'ChatApp', icon: '💬', categories: [CATEGORY.SOCIAL, CATEGORY.MESSAGING] },
  WORKMAIL: { name: 'WorkMail', icon: '📧', categories: [CATEGORY.PRODUCTIVITY] },
  HEALTHFIT: { name: 'HealthFit', icon: '💪', categories: [CATEGORY.HEALTH] },
  NEWSFLASH: { name: 'NewsFlash', icon: '📰', categories: [CATEGORY.NEWS] },
  FOODDASH: { name: 'FoodDash', icon: '🍕', categories: [CATEGORY.FOOD, CATEGORY.ORDERS] },
  GAMEZONE: { name: 'GameZone', icon: '🎮', categories: [CATEGORY.ENTERTAINMENT] },
};

// WebSocket event names
const SOCKET_EVENTS = {
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_ACTION: 'notification:action',
  DIGEST_READY: 'digest:ready',
  FOCUS_CHANGED: 'focus:changed',
  FOCUS_CONFIRMED: 'focus:confirmed',
  STATS_UPDATE: 'stats:update',
};

module.exports = {
  PRIORITY,
  PRIORITY_RANGES,
  PRIORITY_CONFIG,
  CATEGORY,
  FOCUS_MODE,
  FOCUS_RULES,
  NOTIFICATION_STATUS,
  USER_ACTION,
  ACTION_WEIGHTS,
  SIMULATED_APPS,
  SOCKET_EVENTS,
};
