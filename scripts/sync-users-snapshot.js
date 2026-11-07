const fs = require('fs');
const path = require('path');
const https = require('https');

const SNAPSHOT_PATH = path.resolve(__dirname, '../src/data/users_snapshot.json');
const REMOTE_URL = 'https://xbet-backend.onrender.com/api/admin/users';

function fetchRemoteUsers() {
  return new Promise((resolve) => {
    const req = https.get(
      REMOTE_URL,
      {
        headers: {
          'x-admin-bypass': 'bookmekerstudio',
          Accept: 'application/json',
        },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed && Array.isArray(parsed.data)) {
              resolve(parsed.data);
            } else {
              resolve([]);
            }
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

  const remoteUsers = await fetchRemoteUsers();
  const byUsername = new Map();

  for (const u of existing) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (uname && uname !== 'bookmekerstudio' && uname !== 'admin') {
      byUsername.set(uname, u);
    }
  }

  for (const u of remoteUsers) {
    const uname = String(u.username || '').trim().toLowerCase();
    if (uname && uname !== 'bookmekerstudio' && uname !== 'admin') {
      byUsername.set(uname, {
        id: u.id || u._id,
        username: uname,
        raw_password: u.rawPassword || u.password || '',
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
        balance: Number(u.balance) || 0,
        is_blocked: u.isBlocked ? 1 : 0,
        blocked_reason: u.blockedReason || null,
        bound_device_id: u.boundDeviceId || null,
        last_device_id: u.lastDeviceId || null,
        created_at: u.createdAt || new Date().toISOString(),
      });
    }
  }

  const merged = Array.from(byUsername.values());
  const dir = path.dirname(SNAPSHOT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`[UsersSnapshot] ${merged.length} compte(s) utilisateur synchronisé(s) dans src/data/users_snapshot.json`);
}

syncSnapshot();
