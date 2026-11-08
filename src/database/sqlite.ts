import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Répertoire et fichier de la base de données SQLite
const DB_DIR = path.resolve(__dirname, '../data');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const LEGACY_JSON_BETS_FILE = path.join(DB_DIR, 'bets_db.json');
const USERS_SNAPSHOT_FILE = path.join(DB_DIR, 'users_snapshot.json');

let dbInstance: Database.Database | null = null;

function resolveDbFilePath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const testFile = path.join(DB_DIR, '.write_test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return path.join(DB_DIR, 'xbet.db');
  } catch (err) {
    console.warn('[SQLite] Impossible d\'écrire dans src/data, repli de sécurité sur /tmp/xbet.db :', err);
    try {
      if (fs.existsSync('/tmp')) {
        return path.join('/tmp', 'xbet.db');
      }
    } catch (_) {}
    return path.join(DB_DIR, 'xbet.db');
  }
}

/**
 * Initialise et retourne l'instance unique de la base de données SQLite
 */
export function getSqliteDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = resolveDbFilePath();
  console.log(`[SQLite] Initialisation de la base SQLite sur le chemin : ${dbPath}`);

  try {
    const parentDir = path.dirname(dbPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    dbInstance = new Database(dbPath);

    // Pragmas sécurisés : si WAL n'est pas supporté (ex: restriction container sans shared memory), repli sur DELETE
    try {
      dbInstance.pragma('journal_mode = WAL');
    } catch (walErr) {
      console.warn('[SQLite] Mode WAL non disponible, passage en mode journal DELETE :', walErr);
      try {
        dbInstance.pragma('journal_mode = DELETE');
      } catch (delErr) {
        console.warn('[SQLite] Avertissement journal_mode :', delErr);
      }
    }

    try {
      dbInstance.pragma('foreign_keys = ON');
      dbInstance.pragma('synchronous = NORMAL');
    } catch (pragmaErr) {
      console.warn('[SQLite] Avertissement pragmas :', pragmaErr);
    }

    console.log(`[SQLite] Base de données initialisée avec succès : ${dbPath}`);

    // 1. Schéma des tables et index synchronisé
    initSchema(dbInstance);

    // 2. Initialiser les accès administrateur s'ils n'existent pas
    seedDefaultUsers(dbInstance);

    // 2b. Restaurer les utilisateurs sauvegardés depuis users_snapshot.json après redéploiement
    seedUsersSnapshot(dbInstance);

    // 3. Migrer les anciens paris depuis bets_db.json si la table bets est vide
    migrateLegacyBets(dbInstance);

    // 4. Nettoyage de sécurité : suppression définitive de tout ancien compte Railway ou démo
    purgeLegacyRailwayAccounts(dbInstance);

    return dbInstance;
  } catch (fatalError: any) {
    console.error('[SQLite] Erreur lors de l’ouverture du fichier SQLite :', fatalError);
    if (!dbInstance) {
      console.warn('[SQLite] Repli de sécurité : création d\'une base SQLite en mémoire (:memory:) pour garantir la disponibilité 100% sans crash.');
      dbInstance = new Database(':memory:');
      try {
        initSchema(dbInstance);
        seedDefaultUsers(dbInstance);
        seedUsersSnapshot(dbInstance);
      } catch (memErr) {
        console.error('[SQLite] Erreur schéma en mémoire :', memErr);
      }
    }
    return dbInstance;
  }
}

/**
 * Exécute le fichier schema.sql pour créer les tables et index
 */
function initSchema(db: Database.Database): void {
  try {
    if (fs.existsSync(SCHEMA_PATH)) {
      const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      db.exec(schemaSql);
      console.log('[SQLite] Schéma des tables et index synchronisé.');
    } else {
      console.warn(`[SQLite] Avertissement : fichier schéma introuvable à ${SCHEMA_PATH}`);
    }

    // Migrations idempotentes pour bases SQLite déjà créées
    try {
      db.exec('ALTER TABLE users ADD COLUMN raw_password TEXT DEFAULT NULL;');
    } catch (_) {}
    try {
      db.exec('ALTER TABLE users ADD COLUMN allowed_features TEXT DEFAULT NULL;');
    } catch (_) {}
    try {
      db.exec('ALTER TABLE users ADD COLUMN last_login_at TEXT DEFAULT NULL;');
    } catch (_) {}
  } catch (error) {
    console.error('[SQLite] Erreur lors de l’initialisation du schéma :', error);
    throw error;
  }
}

/**
 * Supprime définitivement tous les anciens comptes Railway et démo
 * pour forcer l'usage exclusif de NOUVEAUX identifiants créés par l'admin
 */
function purgeLegacyRailwayAccounts(db: Database.Database): void {
  try {
    const result = db.prepare(`
      DELETE FROM users WHERE id IN (
        'user_1792884432062_90728f3c',
        'user_1791038369859_d9deb048',
        'user_1793204267288_690bb111',
        'user_1792268443511_9d999819',
        'user_1791125553652_3f3846c2',
        'user_1792152632858_9b7c5e1d'
      );
    `).run();
    if (result.changes > 0) {
      console.log(`[SQLite] Purge de sécurité : ${result.changes} ancien(s) compte(s) Railway supprimé(s).`);
    }
  } catch (err) {
    console.warn('[SQLite] Avertissement lors de la purge des anciens comptes :', err);
  }
}

/**
 * Maintient exclusivement les accès de l'administrateur
 */
function seedDefaultUsers(db: Database.Database): void {
  try {
    const defaultFeaturesJson = JSON.stringify([
      'studio_match',
      'studio_tv',
      'studio_mk',
      'game_crash',
      'game_apple',
      'game_royal_feast',
      'game_kamikaze',
    ]);
    const adminHash = bcrypt.hashSync('Bolingo2024##?', 10);

    try {
      const hasAdmin = db.prepare("SELECT id FROM users WHERE LOWER(username) = 'bookmekerstudio' LIMIT 1").get();
      if (!hasAdmin) {
        db.prepare(`
          INSERT OR REPLACE INTO users (
            id, username, password_hash, raw_password, allowed_features, role, balance, is_blocked,
            created_at, updated_at
          ) VALUES (
            'admin-bookmeker', 'bookmekerstudio', ?, 'Bolingo2024##?', ?, 'ADMIN', 0, 0,
            datetime('now'), datetime('now')
          )
        `).run(adminHash, defaultFeaturesJson);
        console.log('[SQLite] Compte Administrateur "bookmekerstudio" initialisé.');
      } else {
        db.prepare("UPDATE users SET password_hash = ?, raw_password = 'Bolingo2024##?', role = 'ADMIN' WHERE LOWER(username) = 'bookmekerstudio'").run(adminHash);
      }
    } catch (e1) {
      console.warn('[SQLite] Avertissement seed bookmekerstudio :', e1);
    }

    try {
      const hasAdminAlias = db.prepare("SELECT id FROM users WHERE LOWER(username) = 'admin' LIMIT 1").get();
      if (!hasAdminAlias) {
        db.prepare(`
          INSERT OR REPLACE INTO users (
            id, username, password_hash, raw_password, allowed_features, role, balance, is_blocked,
            created_at, updated_at
          ) VALUES (
            'admin-alias', 'admin', ?, 'Bolingo2024##?', ?, 'ADMIN', 0, 0,
            datetime('now'), datetime('now')
          )
        `).run(adminHash, defaultFeaturesJson);
      } else {
        db.prepare("UPDATE users SET password_hash = ?, raw_password = 'Bolingo2024##?', role = 'ADMIN' WHERE LOWER(username) = 'admin'").run(adminHash);
      }
    } catch (e2) {
      console.warn('[SQLite] Avertissement seed admin :', e2);
    }
  } catch (error) {
    console.warn('[SQLite] Erreur lors de l’initialisation de l’administrateur :', error);
  }
}

/**
 * Restaure automatiquement les comptes utilisateurs depuis src/data/users_snapshot.json
 * lors d'un redéploiement ou redémarrage du conteneur Render
 */
function seedUsersSnapshot(db: Database.Database): void {
  try {
    if (!fs.existsSync(USERS_SNAPSHOT_FILE)) {
      return;
    }
    const raw = fs.readFileSync(USERS_SNAPSHOT_FILE, 'utf-8');
    const savedUsers = JSON.parse(raw);
    if (!Array.isArray(savedUsers) || savedUsers.length === 0) {
      return;
    }

    const defaultFeaturesJson = JSON.stringify([
      'studio_match',
      'studio_tv',
      'studio_mk',
      'game_crash',
      'game_apple',
      'game_royal_feast',
      'game_kamikaze',
    ]);

    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (
        id, username, password_hash, raw_password, allowed_features, role, balance, is_blocked,
        blocked_reason, bound_device_id, last_device_id, session_token, created_at, updated_at
      ) VALUES (
        @id, @username, @password_hash, @raw_password, @allowed_features, @role, @balance, @is_blocked,
        @blocked_reason, @bound_device_id, @last_device_id, @session_token, @created_at, datetime('now')
      )
    `);

    let restoredCount = 0;
    const tx = db.transaction(() => {
      for (const u of savedUsers) {
        const uname = String(u.username || '').trim().toLowerCase();
        if (!uname || uname === 'bookmekerstudio' || uname === 'admin') continue;
        const rawPwd = String(u.raw_password || u.rawPassword || u.password || '');
        const pwdHash =
          u.password_hash && String(u.password_hash).startsWith('$2')
            ? String(u.password_hash)
            : rawPwd
              ? bcrypt.hashSync(rawPwd, 10)
              : '';
        const featuresStr = Array.isArray(u.allowedFeatures)
          ? JSON.stringify(u.allowedFeatures)
          : typeof u.allowed_features === 'string' && u.allowed_features
            ? u.allowed_features
            : defaultFeaturesJson;

        const res = insertUser.run({
          id: String(u.id || u._id || `usr_${Date.now()}`),
          username: uname,
          password_hash: pwdHash,
          raw_password: rawPwd || null,
          allowed_features: featuresStr,
          role: u.role === 'ADMIN' ? 'ADMIN' : 'USER',
          balance: Number(u.balance) || 0,
          is_blocked: u.is_blocked || u.isBlocked ? 1 : 0,
          blocked_reason: u.blocked_reason || u.blockedReason || null,
          bound_device_id: u.bound_device_id || u.boundDeviceId || null,
          last_device_id: u.last_device_id || u.lastDeviceId || null,
          session_token: u.session_token || u.sessionToken || null,
          created_at: u.created_at || u.createdAt || new Date().toISOString(),
        });
        if (res.changes > 0) restoredCount++;
      }
    });

    tx();
    if (restoredCount > 0) {
      console.log(`[SQLite] ${restoredCount} compte(s) restauré(s) depuis users_snapshot.json.`);
    }

    // Si aucun compte USER n'existe après snapshot, initialiser au moins 2 comptes opérationnels
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'USER'").get() as { count: number };
    if (!userCount || userCount.count === 0) {
      console.log('[SQLite] Aucun compte joueur présent. Création automatique des comptes de secours joueur1 et client_vip.');
      const passHash1 = bcrypt.hashSync('Pass2026##?', 10);
      const passHash2 = bcrypt.hashSync('Vip2026##?', 10);
      insertUser.run({
        id: 'usr_joueur1_seed',
        username: 'joueur1',
        password_hash: passHash1,
        raw_password: 'Pass2026##?',
        allowed_features: defaultFeaturesJson,
        role: 'USER',
        balance: 50000,
        is_blocked: 0,
        blocked_reason: null,
        bound_device_id: null,
        last_device_id: null,
        session_token: null,
        created_at: new Date().toISOString(),
      });
      insertUser.run({
        id: 'usr_client_vip_seed',
        username: 'client_vip',
        password_hash: passHash2,
        raw_password: 'Vip2026##?',
        allowed_features: defaultFeaturesJson,
        role: 'USER',
        balance: 100000,
        is_blocked: 0,
        blocked_reason: null,
        bound_device_id: null,
        last_device_id: null,
        session_token: null,
        created_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[SQLite] Avertissement lors de la restauration de users_snapshot.json :', err);
  }
}

/**
 * Sauvegarde les utilisateurs actuels dans src/data/users_snapshot.json
 */
export function saveUsersSnapshotToDisk(db?: Database.Database): void {
  try {
    const activeDb = db || dbInstance;
    if (!activeDb) return;
    const rows = activeDb
      .prepare("SELECT * FROM users WHERE LOWER(username) NOT IN ('bookmekerstudio', 'admin') ORDER BY created_at DESC")
      .all();
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_SNAPSHOT_FILE, JSON.stringify(rows, null, 2), 'utf-8');
  } catch (_) {}
}

/**
 * Migre les paris existants de l'ancien fichier JSON bets_db.json vers SQLite
 */
function migrateLegacyBets(db: Database.Database): void {
  try {
    const betCountRow = db.prepare('SELECT COUNT(*) as count FROM bets').get() as { count: number };
    if (betCountRow && betCountRow.count > 0) {
      return; // Déjà des paris en base
    }

    if (!fs.existsSync(LEGACY_JSON_BETS_FILE)) {
      return;
    }

    const raw = fs.readFileSync(LEGACY_JSON_BETS_FILE, 'utf-8');
    const legacyBets = JSON.parse(raw);
    if (!Array.isArray(legacyBets) || legacyBets.length === 0) {
      return;
    }

    console.log(`[SQLite] Migration de ${legacyBets.length} paris depuis bets_db.json vers SQLite...`);

    const insertBet = db.prepare(`
      INSERT OR IGNORE INTO bets (
        id, user_id, ticket_number, type, odds, stake, potential_gains,
        actual_gains, status, created_at, updated_at
      ) VALUES (
        @id, @user_id, @ticket_number, @type, @odds, @stake, @potential_gains,
        @actual_gains, @status, @created_at, datetime('now')
      )
    `);

    const insertItem = db.prepare(`
      INSERT OR IGNORE INTO bet_items (
        id, bet_id, sport_category, tournament_name, home_team, away_team,
        prediction, odds, status, final_score, event_date
      ) VALUES (
        @id, @bet_id, @sport_category, @tournament_name, @home_team, @away_team,
        @prediction, @odds, @status, @final_score, @event_date
      )
    `);

    const ensureUserStmt = db.prepare(`
      INSERT OR IGNORE INTO users (id, username, password_hash, role, balance, is_blocked, created_at, updated_at)
      VALUES (?, ?, 'migrated_user', 'USER', 0, 0, datetime('now'), datetime('now'))
    `);

    const migrationTx = db.transaction(() => {
      for (const bet of legacyBets) {
        const uId = String(bet.user_id);
        ensureUserStmt.run(uId, uId);

        insertBet.run({
          id: String(bet.id),
          user_id: uId,
          ticket_number: String(bet.ticket_number || bet.id),
          type: bet.type || 'Combiné',
          odds: Number(bet.odds) || 1.85,
          stake: Number(bet.stake) || 1000,
          potential_gains: Number(bet.potential_gains) || 0,
          actual_gains: Number(bet.actual_gains) || 0,
          status: bet.status || 'Accepté',
          created_at: bet.created_at || new Date().toISOString(),
        });

        if (Array.isArray(bet.items)) {
          for (let i = 0; i < bet.items.length; i++) {
            const item = bet.items[i];
            insertItem.run({
              id: String(item.id || `item_${bet.id}_${i + 1}`),
              bet_id: String(bet.id),
              sport_category: item.sport_category || 'Football',
              tournament_name: item.tournament_name || '',
              home_team: item.home_team || 'Équipe 1',
              away_team: item.away_team || 'Équipe 2',
              prediction: item.prediction || 'V1',
              odds: Number(item.odds) || 1.85,
              status: item.status || 'En cours',
              final_score: item.final_score || null,
              event_date: item.event_date || null,
            });
          }
        }
      }
    });

    migrationTx();
    console.log('[SQLite] Migration des anciens paris réussie.');
  } catch (error) {
    console.warn('[SQLite] Erreur lors de la migration des anciens paris :', error);
  }
}

/**
 * Ferme la connexion SQLite proprement
 */
export function closeSqliteDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
      console.log('[SQLite] Connexion SQLite fermée proprement.');
    } catch (e) {
      console.warn('[SQLite] Erreur lors de la fermeture SQLite :', e);
    } finally {
      dbInstance = null;
    }
  }
}
