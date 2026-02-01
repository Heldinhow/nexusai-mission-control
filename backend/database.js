const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'missions.db');

// Create database connection
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema - NEW TASKS/SUBTASKS/ARTIFACTS FORMAT
function initSchema() {
  console.log('🗄️  Initializing SQLite schema...');
  
  // Create tasks table (was missions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_message TEXT NOT NULL,
      source TEXT DEFAULT 'whatsapp',
      whatsapp_message_id TEXT,
      status TEXT DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
  `);
  
  // Create subtasks table (was mission_agents)
  db.exec(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      stage TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      start_time DATETIME,
      end_time DATETIME,
      duration_seconds INTEGER,
      task_description TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
  `);
  
  // Create artifacts table (updated format)
  db.exec(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      subtask_id INTEGER,
      artifact_id TEXT,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      description TEXT,
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_artifacts_task ON artifacts(task_id);
    CREATE INDEX IF NOT EXISTS idx_artifacts_subtask ON artifacts(subtask_id);
  `);
  
  console.log('✅ Schema initialized');
}

// Initialize
initSchema();

module.exports = { db };
