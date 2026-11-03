const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPaths = [
  'c:/Users/CLINIC/Desktop/xbet/src/data/xbet.db',
  'C:/Users/CLINIC/Desktop/Projet/bet/src/data/xbet.db',
];

const recoveredUsers = [
  {
    id: 'user_1792884432062_90728f3c',
    username: 'client_90728f3c',
    password: 'user123',
    balance: 10000,
    created_at: new Date(1792884432062).toISOString(),
  },
  {
    id: 'user_1791038369859_d9deb048',
    username: 'client_d9deb048',
    password: 'user123',
    balance: 5000,
    created_at: new Date(1791038369859).toISOString(),
  },
  {
    id: 'user_1793204267288_690bb111',
    username: 'client_690bb111',
    password: 'user123',
    balance: 15000,
    created_at: new Date(1793204267288).toISOString(),
  },
  {
    id: 'user_1792268443511_9d999819',
    username: 'client_9d999819',
    password: 'user123',
    balance: 20000,
    created_at: new Date(1792268443511).toISOString(),
  },
  {
    id: 'user_1791125553652_3f3846c2',
    username: 'client_3f3846c2',
    password: 'user123',
    balance: 5000,
    created_at: new Date(1791125553652).toISOString(),
  },
  {
    id: 'user_1792152632858_9b7c5e1d',
    username: 'client_9b7c5e1d',
    password: 'user123',
    balance: 12000,
    created_at: new Date(1792152632858).toISOString(),
  },
  {
    id: 'user-1789492287827',
    username: 'user_1789492287827',
    password: 'user123',
    balance: 90000,
    created_at: '2026-03-08T23:00:00.000Z',
  },
  {
    id: 'test_user_1',
    username: 'test_user_1',
    password: 'user123',
    balance: 7000,
    created_at: '2026-09-25T06:00:43.365Z',
  },
];

const defaultAllowed = JSON.stringify([
  'studio_match',
  'studio_tv',
  'studio_mk',
  'game_crash',
  'game_apple',
  'game_royal_feast',
  'game_kamikaze',
]);

const defaultHash = bcrypt.hashSync('user123', 10);

dbPaths.forEach((path) => {
  try {
    const db = new Database(path);
    console.log(`\n--- Mise a jour de ${path} ---`);

    const insertOrUpdate = db.prepare(`
      INSERT INTO users (
        id, username, password_hash, raw_password, role, balance, is_blocked,
        blocked_reason, bound_device_id, last_device_id, session_token,
        allowed_features, created_at, updated_at
      ) VALUES (
        @id, @username, @password_hash, @raw_password, 'USER', @balance, 0,
        NULL, NULL, NULL, NULL,
        @allowed_features, @created_at, datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        raw_password = COALESCE(users.raw_password, excluded.raw_password),
        balance = CASE WHEN users.balance = 0 THEN excluded.balance ELSE users.balance END,
        allowed_features = excluded.allowed_features,
        updated_at = datetime('now')
    `);

    for (const u of recoveredUsers) {
      insertOrUpdate.run({
        id: u.id,
        username: u.username,
        password_hash: defaultHash,
        raw_password: u.password,
        balance: u.balance,
        allowed_features: defaultAllowed,
        created_at: u.created_at,
      });
      console.log(`[OK] Utilisateur restaure : ${u.id} (${u.username})`);
    }

    const allUsers = db.prepare('SELECT id, username, raw_password, balance, role FROM users').all();
    console.log(`Total utilisateurs desormais dans la base : ${allUsers.length}`);
    console.table(allUsers);
    db.close();
  } catch (err) {
    console.error(`Erreur pour ${path} :`, err.message);
  }
});

