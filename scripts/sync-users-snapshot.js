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
            const userList = Array.isArray(parsed?.users)
              ? parsed.users
              : Array.isArray(parsed?.data)
              ? parsed.data
              : null;
            const isOk =
              res.statusCode >= 200 &&
              res.statusCode < 300 &&
              parsed?.success !== false &&
              Array.isArray(userList);
            resolve({ ok: Boolean(isOk), users: isOk ? userList : [] });
          } catch (_) {
            resolve({ ok: false, users: [] });
          }
        });
      }
    );
    req.on('error', () => resolve({ ok: false, users: [] }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, users: [] });
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
  const DEFAULT_FEATURES = [
    'studio_match',
    'studio_tv',
    'studio_mk',
    'game_crash',
    'game_apple',
    'game_royal_feast',
    'game_kamikaze',
  ];

  let existing = [];
  const hasSnapshotFile = fs.existsSync(SNAPSHOT_PATH);
  try {
    if (hasSnapshotFile) {
      existing = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
      if (!Array.isArray(existing)) existing = [];
    }
  } catch (_) {
    existing = [];
  }

  const prevByUsername = new Map();
  for (const u of existing) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (uname && uname !== 'bookmekerstudio' && uname !== 'admin') {
      prevByUsername.set(uname, u);
    }
  }

  // Le serveur Render fait foi : refléter fidèlement ses comptes sans ressusciter les comptes supprimés
  const remote = await fetchRemoteUsers();
  if (!remote.ok) {
    if (hasSnapshotFile) {
      console.warn('[UsersSnapshot] Backend Render inaccessible. Snapshot existante conservée sans modification.');
      return;
    }

    const localDbUsers = getLocalSqliteUsers().filter((u) => {
      const uname = String(u.username || '').trim().toLowerCase();
      return uname && uname !== 'bookmekerstudio' && uname !== 'admin';
    });
    const dir = path.dirname(SNAPSHOT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(localDbUsers, null, 2), 'utf-8');
    console.log(`[UsersSnapshot] ${localDbUsers.length} compte(s) local(aux) exporté(s) dans src/data/users_snapshot.json.`);
    return;
  }

  const byUsername = new Map();
  for (const u of remote.users) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (!uname || uname === 'bookmekerstudio' || uname === 'admin' || u.role === 'ADMIN') {
      continue;
    }
    const prev = prevByUsername.get(uname) || {};
    const candidatePwd =
      u.rawPassword ||
      (u.password && !String(u.password).startsWith('$2') ? u.password : '') ||
      prev.raw_password ||
      '';
    const numericBalance = Number(u.balance);

    byUsername.set(uname, {
      id: String(u.id || u._id || prev.id || `usr_${Date.now()}`),
      username: uname,
      raw_password: candidatePwd,
      allowed_features: JSON.stringify(
        Array.isArray(u.allowedFeatures) ? u.allowedFeatures : DEFAULT_FEATURES
      ),
      role: 'USER',
      balance: Number.isFinite(numericBalance) ? numericBalance : 0,
      is_blocked: u.isBlocked ? 1 : 0,
      blocked_reason: u.blockedReason || null,
      bound_device_id: u.boundDeviceId || null,
      last_device_id: u.lastDeviceId || null,
      created_at: u.createdAt || prev.created_at || new Date().toISOString(),
    });
  }

  const synced = Array.from(byUsername.values());
  const dir = path.dirname(SNAPSHOT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(synced, null, 2), 'utf-8');
  console.log(`[UsersSnapshot] ${synced.length} compte(s) utilisateur synchronisé(s) depuis Render dans src/data/users_snapshot.json :`);
  for (const m of synced) {
    console.log(`  - ${m.username} (Solde: ${m.balance} F, Statut: ${m.is_blocked ? 'Bloqué' : 'Actif'})`);
  }
}

syncSnapshot();
