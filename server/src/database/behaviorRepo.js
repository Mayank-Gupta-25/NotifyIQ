const db = require('./db');

class BehaviorRepo {
  static logAction(data) {
    const stmt = db.prepare(`
      INSERT INTO behavior_logs (
        user_id, notification_id, source_app, category, 
        original_priority, action, response_time_ms
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      data.userId || 'user_001', 
      data.notificationId || null, 
      data.sourceApp || null, 
      data.category || null, 
      data.originalPriority || null, 
      data.action || null, 
      data.responseTimeMs || 0
    );
    return { _id: info.lastInsertRowid };
  }

  static getStatsByApp(userId = 'user_001', sourceApp) {
    const stmt = db.prepare(`
      SELECT action, COUNT(*) as count 
      FROM behavior_logs 
      WHERE user_id = ? AND source_app = ?
      GROUP BY action
    `);
    return stmt.all(userId, sourceApp);
  }
}

module.exports = BehaviorRepo;
