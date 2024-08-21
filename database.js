import * as SQLite from 'expo-sqlite';

export const openDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('todos.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title TEXT NOT NULL,
      date TEXT,
      notified INTEGER 
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      list_id INTEGER,
      text TEXT,
      done INTEGER,
      FOREIGN KEY(list_id) REFERENCES lists(id)
    );
  `);
  return db;
};

export const getAllLists = async (db) => {
  const result = await db.getAllAsync('SELECT * FROM lists');
  return result;
};

export const getAllItems = async (db) => {
  const result = await db.getAllAsync('SELECT * FROM items');
  return result;
};

export const getAllItemsForList = async (db, listId) => {
  const result = await db.getAllAsync('SELECT * FROM items WHERE list_id = ?', [listId]);
  return result;
};

export const deleteItem = async (db, id) => {
  await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
};

export const updateItemDone = async (db, id, done) => {
  await db.runAsync('UPDATE items SET done = ? WHERE id = ?', [done, id]);
};

export const getListsByDate = async (db, date) => {
    const result = await db.getAllAsync('SELECT * FROM lists WHERE date = ?', [date]);
    return result;
};

export const getItemsForList = async (db, listId) => {
  const result = await db.getAllAsync('SELECT * FROM items WHERE list_id = ?', [listId]);
  return result;
};