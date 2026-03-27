/**
 * Database Setup - SQLite with sql.js (pure JavaScript, no compilation needed)
 * Handles database initialization and schema management
 * Data persists to JSON file on disk for recovery
 */

import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GroupShare } from "~/types/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath =
  process.env.DATABASE_URL || path.join(__dirname, "../../data/ltfc.json");
const dataDir = path.dirname(dbPath);

let dbInstance: SqlJsDatabase | null = null;

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Initialize sql.js database
 * Must be called before using any db functions
 */
export async function initDb(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();

  // Try to load existing database from disk
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(buffer);
    console.log("✅ Loaded existing database from disk");
  } else {
    dbInstance = new SQL.Database();
    console.log("✅ Created new in-memory database");
  }

  return dbInstance;
}

/**
 * Get database instance (must call initDb first)
 */
export function getDb(): SqlJsDatabase {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return dbInstance;
}

/**
 * Persist database to disk
 */
export function persistDb(): void {
  if (!dbInstance) return;
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Alias for compatibility with existing code
export const db = { run: () => {}, prepare: () => {} };

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export function initializeDatabase() {
  const db = getDb();

  // Create group_shares table
  db.run(`
    CREATE TABLE IF NOT EXISTS group_shares (
      id TEXT PRIMARY KEY,
      share_id TEXT NOT NULL UNIQUE,
      creator_user_id TEXT,
      itinerary_data TEXT NOT NULL,
      itinerary_hash TEXT,
      group_size INTEGER,
      match_date TEXT,
      match_city TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      view_count INTEGER DEFAULT 0,
      unique_viewers INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      parent_share_id TEXT,
      
      FOREIGN KEY (parent_share_id) REFERENCES group_shares(id)
    );
    
    CREATE UNIQUE INDEX IF NOT EXISTS idx_share_id_active 
      ON group_shares(share_id) 
      WHERE is_active = 1;
    
    CREATE INDEX IF NOT EXISTS idx_creator_user_id 
      ON group_shares(creator_user_id);
    
    CREATE INDEX IF NOT EXISTS idx_expires_at 
      ON group_shares(expires_at) 
      WHERE is_active = 1;
    
    CREATE INDEX IF NOT EXISTS idx_match_date 
      ON group_shares(match_date) 
      WHERE is_active = 1;
  `);

  // Create share_views table for analytics (optional)
  db.run(`
    CREATE TABLE IF NOT EXISTS group_share_views (
      id TEXT PRIMARY KEY,
      share_id TEXT NOT NULL,
      viewer_user_id TEXT,
      viewer_ip_hash TEXT,
      viewed_at TEXT NOT NULL,
      device_type TEXT,
      
      FOREIGN KEY (share_id) REFERENCES group_shares(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_share_views 
      ON group_share_views(share_id);
  `);

  persistDb();
  console.log("✅ Database schema initialized successfully");
}

/**
 * Get a share by share_id
 */
export function getShareById(shareId: string): GroupShare | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      id, share_id, creator_user_id, itinerary_data, group_size, 
      match_date, match_city, created_at, expires_at, view_count, is_active
    FROM group_shares
    WHERE share_id = ?
  `);

  stmt.bind([shareId]);
  const found = stmt.step();

  if (!found) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject() as any;
  stmt.free();

  return {
    id: row.id,
    share_id: row.share_id,
    itinerary: JSON.parse(row.itinerary_data),
    creator_user_id: row.creator_user_id,
    group_size: row.group_size,
    created_at: row.created_at,
    expires_at: row.expires_at,
    view_count: row.view_count,
    is_active: Boolean(row.is_active),
  };
}

/**
 * Create a new share
 */
export function createShare(shareData: {
  id: string;
  share_id: string;
  creator_user_id?: string;
  itinerary_data: string;
  itinerary_hash?: string;
  group_size?: number;
  match_date?: string;
  match_city?: string;
  expires_at: string;
}): GroupShare {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO group_shares (
      id, share_id, creator_user_id, itinerary_data, itinerary_hash,
      group_size, match_date, match_city, created_at, updated_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  stmt.bind([
    shareData.id,
    shareData.share_id,
    shareData.creator_user_id || null,
    shareData.itinerary_data,
    shareData.itinerary_hash || null,
    shareData.group_size || null,
    shareData.match_date || null,
    shareData.match_city || null,
    now,
    now,
    shareData.expires_at,
  ]);

  stmt.step();
  stmt.free();

  persistDb();
  const share = getShareById(shareData.share_id);
  if (!share) throw new Error("Failed to create share");

  return share;
}

/**
 * Update share view count
 */
export function incrementShareViewCount(shareId: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE group_shares
    SET view_count = view_count + 1, updated_at = ?
    WHERE share_id = ?
  `);

  stmt.bind([new Date().toISOString(), shareId]);
  stmt.step();
  stmt.free();

  persistDb();
}

/**
 * Soft delete a share
 */
export function deleteShare(shareId: string): boolean {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE group_shares
    SET is_active = 0, updated_at = ?
    WHERE share_id = ?
  `);

  stmt.bind([new Date().toISOString(), shareId]);
  stmt.step();
  stmt.free();

  persistDb();
  return true;
}

/**
 * List shares for a creator
 */
export function getSharesByCreator(creatorUserId: string): GroupShare[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      id, share_id, creator_user_id, itinerary_data, group_size,
      match_date, match_city, created_at, expires_at, view_count, is_active
    FROM group_shares
    WHERE creator_user_id = ? AND is_active = 1
    ORDER BY created_at DESC
  `);

  stmt.bind([creatorUserId]);
  const rows: GroupShare[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    rows.push({
      id: row.id,
      share_id: row.share_id,
      itinerary: JSON.parse(row.itinerary_data),
      creator_user_id: row.creator_user_id,
      group_size: row.group_size,
      created_at: row.created_at,
      expires_at: row.expires_at,
      view_count: row.view_count,
      is_active: Boolean(row.is_active),
    });
  }

  stmt.free();
  return rows;
}

/**
 * Clean up expired shares
 * Should be called via scheduled job daily
 */
export function cleanupExpiredShares(): number {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE group_shares
    SET is_active = 0, updated_at = ?
    WHERE expires_at < ? AND is_active = 1
  `);

  const now = new Date().toISOString();
  stmt.bind([now, now]);
  stmt.step();
  stmt.free();

  persistDb();
  console.log(`✅ Cleaned up expired shares`);

  return 0;
}

/**
 * Check if share exists and is active
 */
export function shareExists(shareId: string): boolean {
  const share = getShareById(shareId);
  return share !== null && share.is_active !== false;
}

/**
 * Get database statistics
 */
export function getDbStats() {
  const db = getDb();

  const totalStmt = db.prepare("SELECT COUNT(*) as count FROM group_shares");
  totalStmt.step();
  const totalRow = totalStmt.getAsObject() as any;
  totalStmt.free();

  const activeStmt = db.prepare(
    "SELECT COUNT(*) as count FROM group_shares WHERE is_active = 1",
  );
  activeStmt.step();
  const activeRow = activeStmt.getAsObject() as any;
  activeStmt.free();

  const viewsStmt = db.prepare(
    "SELECT SUM(view_count) as total FROM group_shares",
  );
  viewsStmt.step();
  const viewsRow = viewsStmt.getAsObject() as any;
  viewsStmt.free();

  return {
    total_shares: totalRow.count || 0,
    active_shares: activeRow.count || 0,
    total_views: viewsRow.total || 0,
  };
}

export default db;
