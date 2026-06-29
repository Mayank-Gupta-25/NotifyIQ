const db = require('./db');

class NotificationRepo {
  static getAll(filters = {}) {
    let query = 'SELECT * FROM notifications WHERE 1=1';
    const params = [];

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY timestamp DESC';
    
    const stmt = db.prepare(query);
    const results = stmt.all(...params);
    
    // Parse JSON strings back into arrays/objects for the frontend
    return results.map(row => ({
      ...row,
      _id: row.id,
      sourceApp: row.source_app,
      isReal: Boolean(row.is_real),
      actionButtons: row.action_buttons ? JSON.parse(row.action_buttons) : []
    }));
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO notifications (
        source_app, category, title, body, icon, 
        timestamp, priority, score, explanation, is_real, action_buttons
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const actionButtonsStr = data.metadata?.actionButtons ? JSON.stringify(data.metadata.actionButtons) : '[]';

    const info = stmt.run(
      data.sourceApp || null, 
      data.category || null, 
      data.title || null, 
      data.body || null, 
      data.icon || null,
      data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(), 
      data.priority || null, 
      data.score || 0, 
      data.explanation || null, 
      data.isReal ? 1 : 0, 
      actionButtonsStr
    );

    return { ...data, _id: info.lastInsertRowid };
  }

  static updateStatus(id, status) {
    const stmt = db.prepare('UPDATE notifications SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return this.getById(id);
  }

  static updateManyStatus(ids, status) {
    if (!ids || ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    const stmt = db.prepare(`UPDATE notifications SET status = ? WHERE id IN (${placeholders})`);
    stmt.run(status, ...ids);
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      _id: row.id,
      sourceApp: row.source_app,
      isReal: Boolean(row.is_real),
      actionButtons: row.action_buttons ? JSON.parse(row.action_buttons) : []
    };
  }
}

module.exports = NotificationRepo;
