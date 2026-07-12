/**
 * Component'lerden DB handle'a ve user profile satırına reactive erişim sağlar.
 *
 * Tipik kullanım:
 *   const { db, ready, profile, refresh } = useDatabase();
 *   if (!ready) return <Skeleton />;
 */

import { useEffect, useState } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getDatabase } from '@/db';
import { fetchUserProfile, type UserProfileRow } from '@/db/queries';

export interface UseDatabaseResult {
  db: SQLiteDatabase | null;
  ready: boolean;
  profile: UserProfileRow | null;
  /** Hata oluştuysa Error nesnesi döner. */
  error: Error | null;
  /** Profili tekrar okur. */
  refresh: () => Promise<void>;
}

export const useDatabase = (): UseDatabaseResult => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const handle = await getDatabase();
        if (!mounted) return;
        const row = await fetchUserProfile(handle);
        if (!mounted) return;
        setDb(handle);
        setProfile(row);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = async (): Promise<void> => {
    if (!db) return;
    const row = await fetchUserProfile(db);
    setProfile(row);
  };

  return {
    db,
    ready: db !== null && error === null,
    profile,
    error,
    refresh,
  };
};
