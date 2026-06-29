const db = require('./db');

class DigestRepo {
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO digests (user_id, period_from, period_to, summary, sections) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      data.userId || 'user_001',
      data.period?.from || new Date().toISOString(),
      data.period?.to || new Date().toISOString(),
      JSON.stringify(data.summary || {}),
      JSON.stringify(data.sections || [])
    );
    return this.getById(info.lastInsertRowid);
  }

  static getLatest(userId = 'user_001') {
    const stmt = db.prepare('SELECT * FROM digests WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1');
    const row = stmt.get(userId);
    return row ? this._formatRow(row) : null;
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM digests WHERE id = ?');
    const row = stmt.get(id);
    return row ? this._formatRow(row) : null;
  }

  static _formatRow(row) {
    return {
      ...row,
      _id: row.id,
      summary: row.summary ? JSON.parse(row.summary) : {},
      sections: row.sections ? JSON.parse(row.sections) : []
    };
  }
}

module.exports = DigestRepo;
