import { BetSlip, BetStatus, MatchEvent } from '../types/bet';

// URL du backend unifié déployé (Render.com ou variable d'environnement)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://xbet-backend.onrender.com';
const API_BASE_URL = `${BACKEND_URL}/api/bets`;

/**
 * Convertir un BetSlip (Modèle frontend) vers le schéma de base de données (bets & bet_items)
 */
export function mapCouponToDbPayload(coupon: BetSlip, userId: string) {
  return {
    id: coupon.id,
    user_id: userId,
    ticket_number: coupon.ticketNumber || coupon.id,
    type: coupon.type || (coupon.events?.length > 1 ? 'Combiné' : 'Simple'),
    odds: coupon.totalOdds,
    stake: coupon.stake,
    potential_gains: coupon.potentialPayout,
    actual_gains: coupon.actualPayout || 0,
    status: coupon.status,
    created_at: coupon.createdAt,
    start_date: coupon.startDate || null,
    match_time: coupon.matchTime || null,
    match_date: coupon.matchDate || null,
    game_category: coupon.gameCategory || null,
    draw_number: coupon.drawNumber || null,
    round_code: coupon.roundCode || null,
    items: (coupon.events || []).map((e) => ({
      id: e.id,
      bet_id: coupon.id,
      sport_category: e.sport || e.gameCategory || 'Football',
      tournament_name: e.league || '',
      home_team: e.homeTeam?.name || 'Équipe A',
      away_team: e.awayTeam?.name || 'Équipe B',
      prediction: e.prediction || 'V1',
      odds: e.odd || 1.85,
      status: e.status || 'En cours',
      final_score: e.actualScore || null,
      event_date: e.date || null,
      start_date: e.startDate || null,
      match_time: e.matchTime || null,
      match_date: e.matchDate || null,
      game_category: e.gameCategory || null,
      badge: e.badge || null,
      round_code: e.roundCode || null,
      poker_result: e.pokerResult ? JSON.stringify(e.pokerResult) : null,
      mk_result: e.mkResult ? JSON.stringify(e.mkResult) : null,
    })),
  };
}

/**
 * Convertir un enregistrement BDD (bets & bet_items) vers un BetSlip frontend
 */
export function mapDbRecordToCoupon(dbBet: any): BetSlip {
  const events: MatchEvent[] = (dbBet.items || []).map((it: any) => {
    let pokerResult = undefined;
    if (it.poker_result) {
      try {
        pokerResult = typeof it.poker_result === 'string' ? JSON.parse(it.poker_result) : it.poker_result;
      } catch (e) {}
    }
    let mkResult = undefined;
    if (it.mk_result) {
      try {
        mkResult = typeof it.mk_result === 'string' ? JSON.parse(it.mk_result) : it.mk_result;
      } catch (e) {}
    }

    const sportCategory = it.sport_category || 'Football';
    const isPoker =
      it.game_category === 'poker' ||
      sportCategory.toLowerCase().includes('poker') ||
      (it.tournament_name && it.tournament_name.toLowerCase().includes('poker')) ||
      it.badge === 'POKE';

    return {
      id: it.id,
      sport: isPoker ? 'Cyber-Sport' : sportCategory,
      league: it.tournament_name || (isPoker ? 'TvBet. POKER' : 'Matchs amicaux'),
      date: it.event_date || it.start_date || dbBet.created_at || '24.09.2026 (08:00)',
      startDate: it.start_date || it.event_date || dbBet.created_at,
      matchTime: it.match_time,
      matchDate: it.match_date,
      homeTeam: { name: it.home_team || (isPoker ? 'Main 1' : 'Équipe A') },
      awayTeam: { name: it.away_team || (isPoker ? 'Main 6' : 'Équipe B') },
      prediction: it.prediction,
      odd: Number(it.odds),
      status: it.status || 'Accepté',
      actualScore: it.final_score || undefined,
      gameCategory: isPoker ? 'poker' : it.game_category || 'sports',
      badge: it.badge || (isPoker ? 'POKE' : undefined),
      roundCode: it.round_code,
      pokerResult,
      mkResult,
    };
  });

  const isPokerCoupon =
    dbBet.game_category === 'poker' ||
    events.some((e) => e.gameCategory === 'poker' || (e.league && e.league.toLowerCase().includes('poker')));

  return {
    id: dbBet.id || dbBet.ticket_number,
    userId: dbBet.user_id,
    ticketNumber: dbBet.ticket_number || dbBet.id,
    createdAt: dbBet.created_at || new Date().toISOString(),
    startDate: dbBet.start_date || dbBet.created_at,
    matchTime: dbBet.match_time || events[0]?.matchTime,
    matchDate: dbBet.match_date || events[0]?.matchDate,
    type: dbBet.type || (events.length > 1 ? 'Combiné' : 'Simple'),
    eventsCount: events.length || 1,
    completedCount: events.filter((e) => e.status !== 'Accepté' && e.status !== 'En cours').length,
    totalOdds: Number(dbBet.odds),
    stake: Number(dbBet.stake),
    potentialPayout: Number(dbBet.potential_gains),
    actualPayout: Number(dbBet.actual_gains) || 0,
    status: dbBet.status || 'Accepté',
    gameCategory: isPokerCoupon ? 'poker' : dbBet.game_category || 'sports',
    drawNumber: dbBet.draw_number || events[0]?.roundCode,
    roundCode: dbBet.round_code || events[0]?.roundCode,
    events,
    isForSale: dbBet.status === 'Accepté',
    cashoutAmount: Math.round(Number(dbBet.stake) * 0.95),
  };
}

export const betApiService = {
  /**
   * Récupérer tous les tickets d'un utilisateur depuis le serveur backend
   */
  async fetchUserBets(userId: string): Promise<BetSlip[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (!response.ok) return [];
      const json = await response.json();
      if (json.success && Array.isArray(json.bets)) {
        return json.bets.map(mapDbRecordToCoupon);
      }
      return [];
    } catch (e) {
      // Serveur injoignable, le store local assure le fallback
      return [];
    }
  },

  /**
   * Sauvegarder un nouveau coupon sur le backend
   */
  async saveBetToBackend(coupon: BetSlip, userId: string): Promise<boolean> {
    try {
      const payload = mapCouponToDbPayload(coupon, userId);
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Mettre à jour le statut d'un coupon (ex: Vente / Cashout, Paiement)
   */
  async updateBetStatusOnBackend(
    betId: string,
    status: BetStatus,
    actualPayout?: number
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/${betId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actual_gains: actualPayout }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Mettre à jour le score et résultat d'un match
   */
  async updateBetScoreOnBackend(
    betId: string,
    eventId: string,
    score: string,
    itemStatus: BetStatus,
    betStatus?: BetStatus
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/${betId}/items/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_score: score,
          item_status: itemStatus,
          bet_status: betStatus,
        }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Supprimer un ticket de pari sur le backend
   */
  async deleteBetOnBackend(betId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/${betId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Synchronisation en lot (Bulk Sync)
   */
  async syncAllBetsToBackend(userId: string, coupons: BetSlip[]): Promise<BetSlip[]> {
    try {
      const betsPayload = coupons.map((c) => mapCouponToDbPayload(c, userId));
      const res = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, bets: betsPayload }),
      });
      if (!res.ok) return coupons;
      const json = await res.json();
      if (json.success && Array.isArray(json.bets)) {
        return json.bets.map(mapDbRecordToCoupon);
      }
      return coupons;
    } catch (e) {
      return coupons;
    }
  },
};

export default betApiService;
