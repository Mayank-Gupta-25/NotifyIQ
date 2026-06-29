const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure the database directory exists
const dbDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to a local file (creates it if it doesn't exist)
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

function initializeDatabase() {
  // Create Notifications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'user_001',
      source_app TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      icon TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      deep_link TEXT,
      action_buttons TEXT,  
      priority TEXT,
      score INTEGER,
      status TEXT DEFAULT 'unread',
      explanation TEXT,
      is_real INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Behavior Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS behavior_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'user_001',
      notification_id INTEGER NOT NULL,
      source_app TEXT NOT NULL,
      category TEXT NOT NULL,
      original_priority TEXT,
      action TEXT NOT NULL,
      action_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      response_time_ms INTEGER
    )
  `);

  // Create Rules Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'user_001',
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      priority TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT,
      focus_mode TEXT DEFAULT 'open',
      digest_time TEXT DEFAULT '17:00'
    )
  `);

  // Create Digests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS digests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      period_from DATETIME NOT NULL,
      period_to DATETIME NOT NULL,
      summary TEXT,
      sections TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default user if none exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    db.exec(`
      INSERT INTO users (user_id, username, email, focus_mode) 
      VALUES ('user_001', 'Demo User', 'demo@example.com', 'open')
    `);
  }

  console.log('✅ Local SQLite Database initialized successfully!');
}

// Run initialization immediately
initializeDatabase();

module.exports = db;
