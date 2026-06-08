const { notificationTemplates } = require('../data/sampleNotifications');

class NotificationSimulator {
  constructor() {
    this.intervalId = null;
  }

  generateOne() {
    const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
    return {
      ...template,
      timestamp: new Date(),
      body: template.category === 'marketing' ? `${template.body} Limited time offer!` : template.body
    };
  }

  start(intervalMs, callback) {
    if (this.intervalId) clearInterval(this.intervalId);
    
    console.log(`🧪 Simulator started: 1 notification every ${intervalMs}ms`);
    this.intervalId = setInterval(() => {
      callback(this.generateOne());
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🧪 Simulator stopped.');
    }
  }
}

module.exports = new NotificationSimulator();
