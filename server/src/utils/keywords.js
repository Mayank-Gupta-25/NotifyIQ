const { PRIORITY } = require('../../../shared/constants');

const KEYWORDS = {
    [PRIORITY.CRITICAL]: ["security", "fraud", "unauthorized", "emergency", "payment failed", "expiring in", "otp", "login detected", "urgent"],
    [PRIORITY.IMPORTANT]: ["message from", "reminder", "delivery", "appointment", "reply", "mentioned you", "schedule"],
    [PRIORITY.LOW]: ["sale", "discount", "new feature", "weekly update", "trending", "you might like", "offer", "deal"],
    [PRIORITY.NOISE]: ["we miss you", "rate us", "haven't opened", "complete your profile", "win cash"]
};

module.exports = KEYWORDS;
