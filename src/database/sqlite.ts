import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Répertoire et fichier de la base de données SQLite
const DB_DIR = path.resolve(__dirname, '../data');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const LEGACY_JSON_BETS_FILE = path.join(DB_DIR, 'bets_db.json');

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

    // Exécuter le schéma SQL
    initSchema(dbInstance);

    // Initialiser les utilisateurs par défaut si la table est vide
    seedDefaultUsers(dbInstance);

    // Migrer les anciens paris depuis bets_db.json si la table bets est vide
    migrateLegacyBets(dbInstance);

    return dbInstance;
  } catch (fatalError: any) {
    console.error('[SQLite] Erreur lors de l’ouverture du fichier SQLite :', fatalError);
    if (!dbInstance) {
      console.warn('[SQLite] Repli de sécurité : création d\'une base SQLite en mémoire (:memory:) pour garantir la disponibilité 100% sans crash.');
      dbInstance = new Database(':memory:');
      try {
        initSchema(dbInstance);
        seedDefaultUsers(dbInstance);
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
  } catch (error) {
    console.error('[SQLite] Erreur lors de l’initialisation du schéma :', error);
    throw error;
  }
}

/**
 * Insère les comptes admin et utilisateur initiaux s'ils n'existent pas
 */
function seedDefaultUsers(db: Database.Database): void {
  try {
    const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCountRow && userCountRow.count > 0) {
      return; // Les utilisateurs existent déjà
    }

    console.log('[SQLite] Initialisation des comptes utilisateurs par défaut...');

    const insertUser = db.prepare(`
      INSERT INTO users (
        id, username, password_hash, role, balance, is_blocked, blocked_reason,
        bound_device_id, last_device_id, session_token, created_at, updated_at
      ) VALUES (
        @id, @username, @password_hash, @role, @balance, 0, NULL,
        NULL, NULL, NULL, datetime('now'), datetime('now')
      )
    `);

    const adminHash = bcrypt.hashSync('Bolingo2024##?', 10);
    const userHash = bcrypt.hashSync('user123', 10);

    const transaction = db.transaction(() => {
      // 1. Administrateur principal
      insertUser.run({
        id: 'admin-default',
        username: 'bookmekerstudio',
        password_hash: adminHash,
        role: 'ADMIN',
        balance: 0,
      });

      // 2. Utilisateur standard de démonstration
      insertUser.run({
        id: 'user-demo-1',
        username: 'user',
        password_hash: userHash,
        role: 'USER',
        balance: 50000,
      });
    });

    transaction();
    console.log('[SQLite] Comptes par défaut créés : "bookmekerstudio" (ADMIN) et "user" (USER).');
  } catch (error) {
    console.warn('[SQLite] Erreur lors du peuplement des utilisateurs par défaut :', error);
  }
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
