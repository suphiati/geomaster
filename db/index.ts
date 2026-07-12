/**
 * SQLite bağlantı yöneticisi.
 * Tek bir paylaşılan handle açar, migration çalıştırır.
 */

import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrations';

const DB_NAME = 'geomaster.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Açık veritabanı bağlantısını döner. İlk çağrıda DB'yi açar ve migration'ları çalıştırır.
 * Tüm sonraki çağrılar aynı handle'ı paylaşır.
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await runMigrations(db);
      return db;
    })();
  }
  return dbPromise;
};

/**
 * Test ve dev senaryoları için bağlantıyı sıfırlar.
 * Production'da kullanılmamalıdır.
 */
export const _resetDatabaseHandle = (): void => {
  dbPromise = null;
};
