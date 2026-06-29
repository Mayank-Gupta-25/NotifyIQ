const db = require('./db');
const { PRIORITY } = require('../../../shared/constants');

class AnalyticsRepo {
  static getSummary() {
    // 1. Total Notifications
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM notifications').get();
    const total = totalRow.count;

    // 2. Suppressed Count (Noise)
    const suppressedRow = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE priority = ?').get(PRIORITY.NOISE);
    const suppressedCount = suppressedRow.count;

    // 3. Time Saved (Assume 2 mins saved per noise notification)
    const timeSavedMins = suppressedCount * 2;
    const timeSaved = {
      formatted: timeSavedMins >= 60 
        ? `${Math.floor(timeSavedMins / 60)}h ${timeSavedMins % 60}m` 
        : `${timeSavedMins}m`
    };

    // 4. By Priority
    const priorityRows = db.prepare('SELECT priority, COUNT(*) as count FROM notifications GROUP BY priority').all();
    const byPriority = { critical: 0, important: 0, low: 0, noise: 0 };
    priorityRows.forEach(row => {
      if (row.priority && byPriority[row.priority] !== undefined) {
        byPriority[row.priority] = row.count;
      }
    });

    // 5. By App
    const appRows = db.prepare('SELECT source_app, COUNT(*) as count FROM notifications GROUP BY source_app ORDER BY count DESC LIMIT 5').all();
    const byApp = appRows.map(row => ({
      _id: row.source_app,
      count: row.count
    }));

    return {
      total,
      suppressedCount,
      timeSaved,
      byPriority,
      byApp
    };
  }

  static getTrends() {
    // We want the last 24 hours, grouped by hour, with counts for each priority
    // In SQLite, we can use strftime to group by hour
    
    // Initialize array for last 24 hours
    const trends = [];
    const now = new Date();
    
    // Pre-fill the last 24 hours with 0 to ensure the chart looks continuous
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      // Format hour as 'HH:00'
      const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
      trends.push({
        hour: hourStr,
        critical: 0,
        important: 0,
        low: 0,
        noise: 0
      });
    }

    // SQLite query to get counts grouped by hour and priority for the last 24 hours
    const query = `
      SELECT 
        strftime('%H:00', timestamp) as hour,
        priority,
        COUNT(*) as count
      FROM notifications
      WHERE timestamp >= datetime('now', '-24 hours')
      GROUP BY hour, priority
    `;
    
    const rows = db.prepare(query).all();

    // Map the database rows to our pre-filled array
    rows.forEach(row => {
      // Because SQLite timestamp is UTC, the strftime('%H:00') might be in UTC. 
      // It's a rough approximation for the demo.
      const trendItem = trends.find(t => t.hour === row.hour);
      if (trendItem && row.priority && trendItem[row.priority] !== undefined) {
        trendItem[row.priority] = row.count;
      }
    });

    return trends;
  }
}

module.exports = AnalyticsRepo;
