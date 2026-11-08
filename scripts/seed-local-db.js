const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../src/data/xbet.db');
const snapshotPath = path.resolve(__dirname, '../src/data/users_snapshot.json');

if (fs.existsSync(dbPath) && fs.existsSync(snapshotPath)) {
  const db = new Database(dbPath);
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (
      id, username, password_hash, raw_password, allowed_features, role, balance, is_blocked, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const u of snapshot) {
    const raw = u.raw_password || 'Pass2026##?';
    const hash = bcrypt.hashSync(raw, 10);
    stmt.run(
      u.id,
      u.username,
      hash,
      raw,
      u.allowed_features,
      u.role || 'USER',
      Number(u.balance) || 0,
      u.is_blocked ? 1 : 0,
      u.created_at || new Date().toISOString()
    );
  }

  const rows = db.prepare('SELECT username, role, raw_password, balance FROM users').all();
  console.log(`[SeedLocalDb] ${rows.length} compte(s) dans la base locale SQLite :`);
  rows.forEach((r) => console.log(`  - ${r.username} (${r.role}, Solde: ${r.balance} F, Pass: ${r.raw_password})`));
  db.close();
}

