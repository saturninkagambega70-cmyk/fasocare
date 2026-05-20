import * as SQLite from 'expo-sqlite';

const dbName = 'fasocare.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(dbName);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS pending_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cached_data (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
};

export const savePendingAction = async (db, actionType, payload) => {
  await db.runAsync(
    'INSERT INTO pending_actions (action_type, payload) VALUES (?, ?)',
    actionType,
    JSON.stringify(payload)
  );
};

export const getPendingActions = async (db) => {
  return await db.getAllAsync('SELECT * FROM pending_actions ORDER BY created_at ASC');
};

export const deletePendingAction = async (db, id) => {
  await db.runAsync('DELETE FROM pending_actions WHERE id = ?', id);
};

export const cacheData = async (db, key, value) => {
  await db.runAsync(
    'INSERT OR REPLACE INTO cached_data (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
    key,
    JSON.stringify(value)
  );
};

export const getCachedData = async (db, key) => {
  const result = await db.getFirstAsync('SELECT value FROM cached_data WHERE key = ?', key);
  return result ? JSON.parse(result.value) : null;
};
