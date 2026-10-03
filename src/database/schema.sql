-- ============================================================================
-- SCHEMA BASE DE DONNÉES SQLITE : UTILISATEURS, PARIS SPORTIFS ET ÉVÉNEMENTS
-- ============================================================================

-- 1. Table des utilisateurs (Authentification, Sessions, Rôles & Soldes)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    balance REAL DEFAULT 0,
    is_blocked INTEGER DEFAULT 0,
    blocked_reason TEXT DEFAULT NULL,
    bound_device_id TEXT DEFAULT NULL,
    last_device_id TEXT DEFAULT NULL,
    session_token TEXT DEFAULT NULL,
    last_login_at TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);

-- 2. Table principale des paris / tickets (bets)
CREATE TABLE IF NOT EXISTS bets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ticket_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'Combiné',
    odds REAL NOT NULL,
    stake REAL NOT NULL,
    potential_gains REAL NOT NULL,
    actual_gains REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Accepté',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_ticket_number ON bets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- 3. Table des sélections / événements du coupon (bet_items)
CREATE TABLE IF NOT EXISTS bet_items (
    id TEXT PRIMARY KEY,
    bet_id TEXT NOT NULL,
    sport_category TEXT DEFAULT 'Football',
    tournament_name TEXT DEFAULT '',
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    prediction TEXT NOT NULL,
    odds REAL NOT NULL,
    status TEXT DEFAULT 'En cours',
    final_score TEXT DEFAULT NULL,
    event_date TEXT DEFAULT NULL,
    FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bet_items_bet_id ON bet_items(bet_id);
