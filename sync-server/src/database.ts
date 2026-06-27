import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "openwhispr.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate();
  }
  return db;
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      cloud_id TEXT UNIQUE,
      name TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      cloud_id TEXT UNIQUE,
      title TEXT NOT NULL DEFAULT 'Untitled Note',
      content TEXT NOT NULL DEFAULT '',
      enhanced_content TEXT,
      enhancement_prompt TEXT,
      enhanced_at_content_hash TEXT,
      note_type TEXT NOT NULL DEFAULT 'personal',
      source_file TEXT,
      audio_duration_seconds REAL,
      folder_id INTEGER REFERENCES folders(id),
      transcript TEXT,
      participants TEXT,
      calendar_event_id TEXT,
      diarization_enabled INTEGER,
      expected_speaker_count INTEGER,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transcriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      cloud_id TEXT UNIQUE,
      text TEXT NOT NULL,
      raw_text TEXT,
      processed_text TEXT,
      is_processed INTEGER NOT NULL DEFAULT 0,
      processing_method TEXT DEFAULT 'none',
      agent_name TEXT,
      has_audio INTEGER NOT NULL DEFAULT 0,
      audio_duration_ms INTEGER,
      provider TEXT,
      model TEXT,
      error TEXT,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      cloud_id TEXT UNIQUE,
      title TEXT NOT NULL DEFAULT 'Untitled',
      note_id INTEGER,
      archived_at DATETIME,
      deleted_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec("CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(deleted_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_folders_deleted ON folders(deleted_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_transcriptions_deleted ON transcriptions(deleted_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_transcriptions_updated ON transcriptions(updated_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_agent_conversations_deleted ON agent_conversations(deleted_at)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON agent_messages(conversation_id)");

  const folderCount = db.prepare("SELECT COUNT(*) as count FROM folders").get() as { count: number };
  if (folderCount.count === 0) {
    db.prepare("INSERT INTO folders (name, is_default, sort_order) VALUES (?, 1, ?)").run("Personal", 0);
    db.prepare("INSERT INTO folders (name, is_default, sort_order) VALUES (?, 1, ?)").run("Meetings", 1);
  }
}
