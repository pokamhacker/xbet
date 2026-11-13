import { getSqliteDb } from '../database/sqlite';

function safeIsoDate(input: any, fallbackToNow = false): string | null {
  if (!input) return fallbackToNow ? new Date().toISOString() : null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? (fallbackToNow ? new Date().toISOString() : null) : input.toISOString();
  }
  const str = String(input).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }
  // Gérer les formats locaux fréquents (ex: "24.09.2026 (08:00)" ou "24/09/2026 08:00")
  const match = str.match(/(\d{2})[./-](\d{2})[./-](\d{4})(?:\s*\(?(\d{2}):(\d{2})\)?)?/);
  if (match) {
    const [, day, month, year, hour = '00', min = '00'] = match;
    const parsed = new Date(`${year}-${month}-${day}T${hour}:${min}:00.000Z`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return fallbackToNow ? new Date().toISOString() : null;
}

export interface BetInputItem {
  id?: string;
  bet_id?: string;
  sport_category?: string;
  tournament_name?: string;
  home_team: string;
  away_team: string;
  prediction: string;
  odds: number;
  status?: 'Gain' | 'Perdu' | 'En cours' | 'Accepté';
  final_score?: string | null;
  event_date?: string | Date | null;
}

export interface BetInput {
  id?: string;
  user_id: string;
  ticket_number?: string;
  type?: 'Simple' | 'Combiné';
  odds: number;
  stake: number;
  potential_gains: number;
  actual_gains?: number;
  status?: 'Accepté' | 'Payé' | 'Gagné' | 'Perdu';
  created_at?: string | Date;
  items?: BetInputItem[];
}

export interface FormattedBet {
  id: string;
  user_id: string;
  ticket_number: string;
  type: 'Simple' | 'Combiné';
  odds: number;
  stake: number;
  potential_gains: number;
  actual_gains: number;
  status: 'Accepté' | 'Payé' | 'Gagné' | 'Perdu';
  created_at: string;
  items: Array<{
    id: string;
    bet_id: string;
    sport_category: string;
    tournament_name: string;
    home_team: string;
    away_team: string;
    prediction: string;
    odds: number;
    status: 'Gain' | 'Perdu' | 'En cours' | 'Accepté';
    final_score: string | null;
    event_date: string | null;
  }>;
}

class BetDatabaseService {
  /**
   * Créer et persister un nouveau pari avec ses éléments dans SQLite
   */
  async createBet(data: BetInput): Promise<FormattedBet> {
    const db = getSqliteDb();
    const betId = data.id || `bet_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketNumber = data.ticket_number || data.id || '95' + Math.floor(100000000 + Math.random() * 900000000);
    const createdAt = safeIsoDate(data.created_at, true)!;

    const items = (data.items || []).map((it, idx) => {
      const fallbackId = `item_${betId}_${idx + 1}_${Math.random().toString(36).substring(2, 7)}`;
      const cleanId =
        it.id && !['1', '2', '3', '4', '5', 'item-01', 'item-1'].includes(String(it.id)) && String(it.id).includes(betId)
          ? String(it.id)
          : fallbackId;

      return {
        id: cleanId,
        bet_id: betId,
        sport_category: it.sport_category || 'Football',
        tournament_name: it.tournament_name || 'Matchs amicaux',
        home_team: it.home_team || 'Équipe 1',
        away_team: it.away_team || 'Équipe 2',
        prediction: it.prediction || 'V1',
        odds: Number(it.odds) || 1.85,
        status: (it.status || 'En cours') as 'Gain' | 'Perdu' | 'En cours' | 'Accepté',
        final_score: it.final_score || null,
        event_date: safeIsoDate(it.event_date, false),
      };
    });

    const formatted: FormattedBet = {
      id: betId,
      user_id: data.user_id,
      ticket_number: ticketNumber,
      type: (data.type || (items.length > 1 ? 'Combiné' : 'Simple')) as 'Simple' | 'Combiné',
      odds: Number(data.odds) || 1.85,
      stake: Number(data.stake) || 1000,
      potential_gains: Number(data.potential_gains) || Math.round((Number(data.stake) || 1000) * (Number(data.odds) || 1.85)),
      actual_gains: Number(data.actual_gains) || 0,
      status: (data.status || 'Accepté') as 'Accepté' | 'Payé' | 'Gagné' | 'Perdu',
      created_at: createdAt,
      items,
    };

    const insertBet = db.prepare(`
      INSERT INTO bets (
        id, user_id, ticket_number, type, odds, stake, potential_gains,
        actual_gains, status, created_at, updated_at
      ) VALUES (
        @id, @user_id, @ticket_number, @type, @odds, @stake, @potential_gains,
        @actual_gains, @status, @created_at, datetime('now')
      )
      ON CONFLICT(id) DO UPDATE SET
        user_id = excluded.user_id,
        ticket_number = excluded.ticket_number,
        type = excluded.type,
        odds = excluded.odds,
        stake = excluded.stake,
        potential_gains = excluded.potential_gains,
        actual_gains = excluded.actual_gains,
        status = excluded.status,
        updated_at = datetime('now')
    `);

    const deleteOldItems = db.prepare('DELETE FROM bet_items WHERE bet_id = ?');
    const insertItem = db.prepare(`
      INSERT INTO bet_items (
        id, bet_id, sport_category, tournament_name, home_team, away_team,
        prediction, odds, status, final_score, event_date
      ) VALUES (
        @id, @bet_id, @sport_category, @tournament_name, @home_team, @away_team,
        @prediction, @odds, @status, @final_score, @event_date
      )
      ON CONFLICT(id) DO UPDATE SET
        bet_id = excluded.bet_id,
        sport_category = excluded.sport_category,
        tournament_name = excluded.tournament_name,
        home_team = excluded.home_team,
        away_team = excluded.away_team,
        prediction = excluded.prediction,
        odds = excluded.odds,
        status = excluded.status,
        final_score = excluded.final_score,
        event_date = excluded.event_date
    `);

    const saveTransaction = db.transaction(() => {
      insertBet.run({
        id: formatted.id,
        user_id: formatted.user_id,
        ticket_number: formatted.ticket_number,
        type: formatted.type,
        odds: formatted.odds,
        stake: formatted.stake,
        potential_gains: formatted.potential_gains,
        actual_gains: formatted.actual_gains,
        status: formatted.status,
        created_at: formatted.created_at,
      });

      deleteOldItems.run(formatted.id);

      for (const item of items) {
        insertItem.run({
          id: item.id,
          bet_id: formatted.id,
          sport_category: item.sport_category,
          tournament_name: item.tournament_name,
          home_team: item.home_team,
          away_team: item.away_team,
          prediction: item.prediction,
          odds: item.odds,
          status: item.status,
          final_score: item.final_score,
          event_date: item.event_date,
        });
      }
    });

    saveTransaction();
    return formatted;
  }

  /**
   * Récupérer tous les paris d'un utilisateur donné depuis SQLite
   */
  async getBetsByUserId(userId: string): Promise<FormattedBet[]> {
    const db = getSqliteDb();
    const betsRows = db
      .prepare('SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC')
      .all(String(userId)) as any[];

    if (!betsRows || betsRows.length === 0) {
      return [];
    }

    const getItemsStmt = db.prepare('SELECT * FROM bet_items WHERE bet_id = ?');

    return betsRows.map((b) => {
      const itemRows = getItemsStmt.all(b.id) as any[];
      return {
        id: b.id,
        user_id: b.user_id,
        ticket_number: b.ticket_number,
        type: b.type,
        odds: Number(b.odds),
        stake: Number(b.stake),
        potential_gains: Number(b.potential_gains),
        actual_gains: Number(b.actual_gains) || 0,
        status: b.status,
        created_at: b.created_at,
        items: itemRows.map((it) => ({
          id: it.id,
          bet_id: it.bet_id,
          sport_category: it.sport_category || 'Football',
          tournament_name: it.tournament_name || '',
          home_team: it.home_team,
          away_team: it.away_team,
          prediction: it.prediction,
          odds: Number(it.odds),
          status: it.status,
          final_score: it.final_score || null,
          event_date: it.event_date || null,
        })),
      };
    });
  }

  /**
   * Récupérer un pari par son ID ou son numéro de ticket depuis SQLite
   */
  async getBetById(idOrTicketNumber: string): Promise<FormattedBet | null> {
    const db = getSqliteDb();
    const b = db
      .prepare('SELECT * FROM bets WHERE id = ? OR ticket_number = ? LIMIT 1')
      .get(String(idOrTicketNumber), String(idOrTicketNumber)) as any;

    if (!b) return null;

    const itemRows = db.prepare('SELECT * FROM bet_items WHERE bet_id = ?').all(b.id) as any[];

    return {
      id: b.id,
      user_id: b.user_id,
      ticket_number: b.ticket_number,
      type: b.type,
      odds: Number(b.odds),
      stake: Number(b.stake),
      potential_gains: Number(b.potential_gains),
      actual_gains: Number(b.actual_gains) || 0,
      status: b.status,
      created_at: b.created_at,
      items: itemRows.map((it) => ({
        id: it.id,
        bet_id: it.bet_id,
        sport_category: it.sport_category || 'Football',
        tournament_name: it.tournament_name || '',
        home_team: it.home_team,
        away_team: it.away_team,
        prediction: it.prediction,
        odds: Number(it.odds),
        status: it.status,
        final_score: it.final_score || null,
        event_date: it.event_date || null,
      })),
    };
  }

  /**
   * Mettre à jour le statut global d'un pari et ses gains réels
   */
  async updateBetStatus(
    betId: string,
    status: 'Accepté' | 'Payé' | 'Gagné' | 'Perdu',
    actualGains?: number
  ): Promise<FormattedBet | null> {
    const db = getSqliteDb();
    const existing = await this.getBetById(betId);
    if (!existing) return null;

    const newActualGains = actualGains !== undefined ? Number(actualGains) : existing.actual_gains;

    db.prepare(`
      UPDATE bets SET
        status = ?,
        actual_gains = ?,
        updated_at = datetime('now')
      WHERE id = ? OR ticket_number = ?
    `).run(status, newActualGains, betId, betId);

    return this.getBetById(betId);
  }

  /**
   * Mettre à jour le score et le statut d'un match (bet_item)
   */
  async updateBetItemScore(
    betId: string,
    itemId: string,
    finalScore: string,
    itemStatus: 'Gain' | 'Perdu' | 'En cours' | 'Accepté',
    newBetStatus?: 'Accepté' | 'Payé' | 'Gagné' | 'Perdu'
  ): Promise<FormattedBet | null> {
    const db = getSqliteDb();
    const bet = await this.getBetById(betId);
    if (!bet) return null;

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE bet_items SET
          final_score = ?,
          status = ?
        WHERE id = ? AND bet_id = ?
      `).run(finalScore, itemStatus, itemId, bet.id);

      if (newBetStatus) {
        const gains = newBetStatus === 'Payé' || newBetStatus === 'Gagné' ? bet.potential_gains : bet.actual_gains;
        db.prepare(`
          UPDATE bets SET
            status = ?,
            actual_gains = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(newBetStatus, gains, bet.id);
      }
    });

    updateTx();
    return this.getBetById(bet.id);
  }

  /**
   * Supprimer un ticket de pari de SQLite
   */
  async deleteBet(betId: string): Promise<boolean> {
    const db = getSqliteDb();
    const result = db.prepare('DELETE FROM bets WHERE id = ? OR ticket_number = ?').run(betId, betId);
    return result.changes > 0;
  }

  /**
   * Synchronisation en lot (bulk sync) pour un utilisateur
   */
  async syncUserBets(userId: string, incomingBets: BetInput[]): Promise<FormattedBet[]> {
    for (const b of incomingBets) {
      await this.createBet({ ...b, user_id: userId });
    }
    return this.getBetsByUserId(userId);
  }
}

export const betDatabaseService = new BetDatabaseService();
export default betDatabaseService;
