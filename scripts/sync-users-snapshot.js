const fs = require('fs');
const path = require('path');
const https = require('https');

const SNAPSHOT_PATH = path.resolve(__dirname, '../src/data/users_snapshot.json');
const LOCAL_DB_PATH = path.resolve(__dirname, '../src/data/xbet.db');
const REMOTE_URL = 'https://xbet-backend.onrender.com/api/admin/users?adminKey=Bolingo2024%23%23%3F';

function fetchRemoteUsers() {
  return new Promise((resolve) => {
    const req = https.get(
      REMOTE_URL,
      {
        headers: {
          'x-admin-key': 'Bolingo2024##?',
          Authorization: 'Bearer Bolingo2024##?',
          Accept: 'application/json',
        },
        timeout: 10000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const userList = Array.isArray(parsed.users)
              ? parsed.users
              : Array.isArray(parsed.data)
              ? parsed.data
              : [];
            resolve(userList);
          } catch (_) {
            resolve([]);
          }
        });
      }
    );
    req.on('error', () => resolve([]));
    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });
  });
}

function getLocalSqliteUsers() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) return [];
    const Database = require('better-sqlite3');
    const db = new Database(LOCAL_DB_PATH, { readonly: true });
    const rows = db.prepare('SELECT * FROM users WHERE role = "USER"').all();
    db.close();
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      raw_password: r.raw_password || '',
      password_hash: r.password_hash || '',
      allowed_features: r.allowed_features || '',
      role: r.role || 'USER',
      balance: Number(r.balance) || 0,
      is_blocked: r.is_blocked ? 1 : 0,
      blocked_reason: r.blocked_reason || null,
      bound_device_id: r.bound_device_id || null,
      last_device_id: r.last_device_id || null,
      created_at: r.created_at || new Date().toISOString(),
    }));
  } catch (_) {
    return [];
  }
}

async function syncSnapshot() {
  let existing = [];
  try {
    if (fs.existsSync(SNAPSHOT_PATH)) {
      existing = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
      if (!Array.isArray(existing)) existing = [];
    }
  } catch (_) {
    existing = [];
  }

  const byUsername = new Map();

  // 1. Comptes de secours indispensables (toujours garantis)
  const fallbackAccounts = [
    {
      id: 'usr_joueur1_seed',
      username: 'joueur1',
      raw_password: 'Pass2026##?',
      allowed_features: JSON.stringify([
        'studio_match',
        'studio_tv',
        'studio_mk',
        'game_crash',
        'game_apple',
        'game_royal_feast',
        'game_kamikaze',
      ]),
      role: 'USER',
      balance: 50000,
      is_blocked: 0,
      blocked_reason: null,
      bound_device_id: null,
      last_device_id: null,
      created_at: '2026-11-08T00:00:00.000Z',
    },
    {
      id: 'usr_client_vip_seed',
      username: 'client_vip',
      raw_password: 'Vip2026##?',
      allowed_features: JSON.stringify([
        'studio_match',
        'studio_tv',
        'studio_mk',
        'game_crash',
        'game_apple',
        'game_royal_feast',
        'game_kamikaze',
      ]),
      role: 'USER',
      balance: 100000,
      is_blocked: 0,
      blocked_reason: null,
      bound_device_id: null,
      last_device_id: null,
      created_at: '2026-11-08T00:00:00.000Z',
    },
  ];

  for (const fa of fallbackAccounts) {
    byUsername.set(fa.username.toLowerCase(), fa);
  }

  // 2. Intégrer les comptes déjà dans la snapshot
  for (const u of existing) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (uname && uname !== 'bookmekerstudio' && uname !== 'admin') {
      byUsername.set(uname, { ...byUsername.get(uname), ...u });
    }
  }

  // 3. Intégrer les comptes de la base SQLite locale
  const localDbUsers = getLocalSqliteUsers();
  for (const u of localDbUsers) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (uname && uname !== 'bookmekerstudio' && uname !== 'admin') {
      const prev = byUsername.get(uname) || {};
      byUsername.set(uname, { ...prev, ...u });
    }
  }

  // 4. Intégrer les comptes distants de Render
  const remoteUsers = await fetchRemoteUsers();
  for (const u of remoteUsers) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (uname && uname !== 'bookmekerstudio' && uname !== 'admin') {
      const prev = byUsername.get(uname) || {};
      const rawPwd = u.rawPassword || u.password || prev.raw_password || '';
      byUsername.set(uname, {
        id: u.id || u._id || prev.id || `usr_${Date.now()}`,
        username: uname,
        raw_password: rawPwd,
        allowed_features: JSON.stringify(
          Array.isArray(u.allowedFeatures)
            ? u.allowedFeatures
            : [
                'studio_match',
                'studio_tv',
                'studio_mk',
                'game_crash',
                'game_apple',
                'game_royal_feast',
                'game_kamikaze',
              ]
        ),
        role: u.role || 'USER',
        balance: Number(u.balance) || prev.balance || 0,
        is_blocked: u.isBlocked ? 1 : 0,
        blocked_reason: u.blockedReason || null,
        bound_device_id: u.boundDeviceId || null,
        last_device_id: u.lastDeviceId || null,
        created_at: u.createdAt || prev.created_at || new Date().toISOString(),
      });
    }
  }

  const merged = Array.from(byUsername.values());
  if (merged.length === 0) {
    console.warn('[UsersSnapshot] Aucun compte à enregistrer. Conservation de la snapshot existante.');
    return;
  }

  const dir = path.dirname(SNAPSHOT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`[UsersSnapshot] ${merged.length} compte(s) utilisateur synchronisé(s) dans src/data/users_snapshot.json :`);
  for (const m of merged) {
    console.log(`  - ${m.username} (Solde: ${m.balance} F, Mot de passe: ${m.raw_password})`);
  }
}

syncSnapshot();
