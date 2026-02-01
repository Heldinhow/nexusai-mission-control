const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'missions.db');

// Create database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
function initSchema() {
  console.log('🗄️  Initializing SQLite schema...');
  
  // Create missions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      user_message TEXT NOT NULL,
      source TEXT DEFAULT 'whatsapp',
      whatsapp_message_id TEXT,
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
    CREATE INDEX IF NOT EXISTS idx_missions_created ON missions(created_at);
  `);
  
  // Create mission_agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mission_agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      status TEXT,
      started_at DATETIME,
      completed_at DATETIME,
      task_description TEXT,
      duration_seconds INTEGER,
      FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_agents_mission ON mission_agents(mission_id);
  `);
  
  // Create artifacts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id TEXT NOT NULL,
      artifact_id TEXT,
      file_path TEXT NOT NULL,
      file_type TEXT,
      description TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_artifacts_mission ON artifacts(mission_id);
  `);
  
  // Create timeline_events table
  db.exec(`
    CREATE TABLE IF NOT EXISTS timeline_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id TEXT NOT NULL,
      event_id TEXT,
      event_type TEXT NOT NULL,
      agent TEXT,
      message TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_timeline_mission ON timeline_events(mission_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_created ON timeline_events(created_at);
  `);
  
  console.log('✅ Schema initialized');
}

// Initialize
initSchema();
console.log('🗄️  SQLite-only mode active');

module.exports = { db };
