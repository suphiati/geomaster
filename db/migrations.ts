/**
 * Migration runner.
 * Versiyonlu, idempotent şema yükseltmelerini yönetir.
 *
 * Her migration `version` artan bir SQL bloğudur.
 * `user_version` PRAGMA ile mevcut sürüm takip edilir.
 */

import type { SQLiteDatabase } from 'expo-sqlite';

import { SCHEMA_DDL, SEED_PROFILE_DDL } from './schema';

interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    up: async (db) => {
      for (const stmt of SCHEMA_DDL) {
        await db.execAsync(stmt);
      }
      await db.execAsync(SEED_PROFILE_DDL);
    },
  },
];

/**
 * Veritabanını mevcut son sürüme yükseltir.
 * @param db Açık SQLite handle.
 */
export const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;
    await migration.up(db);
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
  }
};

export const LATEST_VERSION = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0;
