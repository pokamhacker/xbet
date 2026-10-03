import crypto from 'crypto';
import { getSqliteDb } from '../database/sqlite';

export type UserRole = 'ADMIN' | 'USER';

export interface IUser {
  id: string;
  _id: string; // Compatible avec les usages Mongoose existants
  username: string;
  passwordHash: string;
  role: UserRole;
  isBlocked: boolean;
  blockedReason: string | null;
  boundDeviceId: string | null;
  lastDeviceId: string | null;
  sessionToken: string | null;
  balance: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  save(): Promise<IUser>;
  toJSON(): Record<string, any>;
}

export class SQLiteUser implements IUser {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  isBlocked: boolean;
  blockedReason: string | null;
  boundDeviceId: string | null;
  lastDeviceId: string | null;
  sessionToken: string | null;
  balance: number;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(row: any) {
    this.id = String(row.id);
    this.username = String(row.username);
    this.passwordHash = String(row.password_hash || row.passwordHash || '');
    this.role = (row.role === 'ADMIN' ? 'ADMIN' : 'USER') as UserRole;
    this.isBlocked = Boolean(row.is_blocked || row.isBlocked);
    this.blockedReason = row.blocked_reason || row.blockedReason || null;
    this.boundDeviceId = row.bound_device_id || row.boundDeviceId || null;
    this.lastDeviceId = row.last_device_id || row.lastDeviceId || null;
    this.sessionToken = row.session_token || row.sessionToken || null;
    this.balance = Number(row.balance) || 0;
    this.lastLoginAt = row.last_login_at ? new Date(row.last_login_at) : (row.lastLoginAt ? new Date(row.lastLoginAt) : null);
    this.createdAt = row.created_at ? new Date(row.created_at) : (row.createdAt ? new Date(row.createdAt) : new Date());
    this.updatedAt = row.updated_at ? new Date(row.updated_at) : (row.updatedAt ? new Date(row.updatedAt) : new Date());
  }

  get _id(): string {
    return this.id;
  }

  set _id(val: any) {
    this.id = String(val);
  }

  async save(): Promise<IUser> {
    const db = getSqliteDb();
    const updateStmt = db.prepare(`
      UPDATE users SET
        username = @username,
        password_hash = @password_hash,
        role = @role,
        balance = @balance,
        is_blocked = @is_blocked,
        blocked_reason = @blocked_reason,
        bound_device_id = @bound_device_id,
        last_device_id = @last_device_id,
        session_token = @session_token,
        last_login_at = @last_login_at,
        updated_at = datetime('now')
      WHERE id = @id
    `);

    updateStmt.run({
      id: this.id,
      username: this.username.trim().toLowerCase(),
      password_hash: this.passwordHash,
      role: this.role,
      balance: this.balance,
      is_blocked: this.isBlocked ? 1 : 0,
      blocked_reason: this.blockedReason,
      bound_device_id: this.boundDeviceId,
      last_device_id: this.lastDeviceId,
      session_token: this.sessionToken,
      last_login_at: this.lastLoginAt ? this.lastLoginAt.toISOString() : null,
    });

    this.updatedAt = new Date();
    return this;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      _id: this.id,
      username: this.username,
      role: this.role,
      balance: this.balance,
      isBlocked: this.isBlocked,
      blockedReason: this.blockedReason,
      boundDeviceId: this.boundDeviceId,
      lastDeviceId: this.lastDeviceId,
      sessionToken: this.sessionToken,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Interface d'accès de données compatible Mongoose / ORM pour SQLite
 */
export const User = {
  async findById(id: string): Promise<IUser | null> {
    if (!id) return null;
    const db = getSqliteDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').get(String(id));
    if (!row) return null;
    return new SQLiteUser(row);
  },

  async findOne(query: Record<string, any>): Promise<IUser | null> {
    const db = getSqliteDb();
    let row: any = null;

    if (query.username) {
      row = db
        .prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1')
        .get(String(query.username).trim());
    } else if (query.sessionToken) {
      row = db
        .prepare('SELECT * FROM users WHERE session_token = ? LIMIT 1')
        .get(String(query.sessionToken));
    } else if (query._id || query.id) {
      row = db
        .prepare('SELECT * FROM users WHERE id = ? LIMIT 1')
        .get(String(query._id || query.id));
    } else {
      const keys = Object.keys(query);
      if (keys.length > 0) {
        const whereClause = keys.map((k) => `${k} = ?`).join(' AND ');
        const values = keys.map((k) => query[k]);
        row = db.prepare(`SELECT * FROM users WHERE ${whereClause} LIMIT 1`).get(...values);
      }
    }

    if (!row) return null;
    return new SQLiteUser(row);
  },

  find(filter: Record<string, any> = {}) {
    const execute = async (sortOrder: 'ASC' | 'DESC' = 'DESC'): Promise<IUser[]> => {
      const db = getSqliteDb();
      let queryStr = 'SELECT * FROM users';
      const params: any[] = [];

      if (Object.keys(filter).length > 0) {
        const conditions = Object.keys(filter).map((k) => `${k} = ?`).join(' AND ');
        queryStr += ` WHERE ${conditions}`;
        params.push(...Object.values(filter));
      }

      queryStr += ` ORDER BY created_at ${sortOrder}`;
      const rows = db.prepare(queryStr).all(...params);
      return rows.map((r: any) => new SQLiteUser(r));
    };

    // Retourne un objet Thenable compatible avec à la fois `await User.find()` et `await User.find().sort(...)`
    return {
      then: (resolve: (users: IUser[]) => any, reject: (err: any) => any) => {
        return execute('DESC').then(resolve).catch(reject);
      },
      sort: (_criteria?: any) => {
        return execute('DESC');
      },
    };
  },

  async create(data: {
    id?: string;
    username: string;
    passwordHash: string;
    role?: UserRole;
    balance?: number;
    isBlocked?: boolean;
    blockedReason?: string | null;
    boundDeviceId?: string | null;
    sessionToken?: string | null;
  }): Promise<IUser> {
    const db = getSqliteDb();
    const id = data.id || `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const username = data.username.trim().toLowerCase();
    const passwordHash = data.passwordHash;
    const role = data.role === 'ADMIN' ? 'ADMIN' : 'USER';
    const balance = Number(data.balance) || 0;
    const isBlocked = data.isBlocked ? 1 : 0;
    const blockedReason = data.blockedReason || null;
    const boundDeviceId = data.boundDeviceId || null;
    const sessionToken = data.sessionToken || null;

    const stmt = db.prepare(`
      INSERT INTO users (
        id, username, password_hash, role, balance, is_blocked,
        blocked_reason, bound_device_id, session_token, created_at, updated_at
      ) VALUES (
        @id, @username, @password_hash, @role, @balance, @is_blocked,
        @blocked_reason, @bound_device_id, @session_token, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id,
      username,
      password_hash: passwordHash,
      role,
      balance,
      is_blocked: isBlocked,
      blocked_reason: blockedReason,
      bound_device_id: boundDeviceId,
      session_token: sessionToken,
    });

    const user = await this.findById(id);
    if (!user) throw new Error("Erreur lors de la création de l'utilisateur dans SQLite.");
    return user;
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    const db = getSqliteDb();
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(String(id));
    return result.changes > 0;
  },

  async countDocuments(): Promise<number> {
    const db = getSqliteDb();
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    return row ? row.count : 0;
  },
};

export default User;
