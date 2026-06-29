const db = require('./db');

class RuleRepo {
  static getAll(userId = 'user_001') {
    const stmt = db.prepare('SELECT * FROM rules WHERE user_id = ? AND is_active = 1');
    const results = stmt.all(userId);
    return results.map(row => ({ 
      ...row, 
      _id: row.id,
      isActive: Boolean(row.is_active)
    }));
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO rules (user_id, type, value, priority) 
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(data.userId || 'user_001', data.type, data.value, data.priority);
    return { ...data, _id: info.lastInsertRowid };
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM rules WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }
}

module.exports = RuleRepo;
