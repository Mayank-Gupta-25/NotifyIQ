const db = require('./db');

class UserRepo {
  static getPreferences(userId = 'user_001') {
    const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
    return stmt.get(userId) || null;
  }

  static updatePreferences(userId, prefs) {
    const updates = [];
    const params = [];

    if (prefs.digestTime) { updates.push('digest_time = ?'); params.push(prefs.digestTime); }
    if (prefs.focusMode) { updates.push('focus_mode = ?'); params.push(prefs.focusMode); }
    
    if (updates.length === 0) return this.getPreferences(userId);

    params.push(userId);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`;
    
    db.prepare(query).run(...params);
    return this.getPreferences(userId);
  }
}

module.exports = UserRepo;
