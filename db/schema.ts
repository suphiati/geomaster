/**
 * SQLite şeması.
 * Migration sistemi tarafından kullanılan ham SQL DDL ifadeleri.
 *
 * Tasarım notu: ülke verisi runtime'da JSON olarak yüklenir,
 * SQLite yalnızca *kullanıcı durumu* için (profil, geçmiş, ilerleme, rozet) kullanılır.
 */

export const SCHEMA_DDL: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY DEFAULT 1,
    display_name TEXT DEFAULT 'Gezgin',
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_play_date TEXT,
    total_quizzes INTEGER DEFAULT 0,
    total_correct INTEGER DEFAULT 0,
    total_wrong INTEGER DEFAULT 0,
    preferred_language TEXT DEFAULT 'tr',
    theme TEXT DEFAULT 'dark',
    sound_enabled INTEGER DEFAULT 1,
    haptics_enabled INTEGER DEFAULT 1,
    is_premium INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS quiz_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL,
    category TEXT,
    continent TEXT,
    difficulty TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    total_time_ms INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL,
    best_streak INTEGER DEFAULT 0,
    played_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS country_progress (
    country_id TEXT PRIMARY KEY,
    times_asked INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    last_asked TEXT,
    mastered INTEGER DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS earned_badges (
    badge_id TEXT PRIMARY KEY,
    earned_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS daily_challenge_history (
    date TEXT PRIMARY KEY,
    country_id TEXT NOT NULL,
    hints_used INTEGER NOT NULL,
    guesses INTEGER NOT NULL,
    solved INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL
  )`,

  `CREATE INDEX IF NOT EXISTS idx_quiz_history_mode ON quiz_history(mode)`,
  `CREATE INDEX IF NOT EXISTS idx_quiz_history_date ON quiz_history(played_at)`,
  `CREATE INDEX IF NOT EXISTS idx_country_progress_mastered ON country_progress(mastered)`,
];

/** İlk kurulumda profil satırının var olduğunu garantileyen seed. */
export const SEED_PROFILE_DDL = `
  INSERT INTO user_profile (id) VALUES (1)
  ON CONFLICT(id) DO NOTHING
`;
