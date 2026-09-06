import { create } from 'zustand';
import { BetSlip, BetStatus, CustomLeague, CustomTeam, MatchEvent } from '../types/bet';
import { generateRealisticPokerDraw, generateShareCode } from '../utils/pokerEngine';

interface BetState {
  balance: number;
  activeSlip: MatchEvent[];
  coupons: BetSlip[];
  customLeagues: CustomLeague[];
  customTeams: CustomTeam[];

  // Actions
  addCoupon: (coupon: BetSlip) => void;
  updateCouponStatus: (couponId: string, status: BetStatus) => void;
  validateCouponWithResult: (couponId: string, isWon: boolean) => void;
  updateEventScore: (couponId: string, eventId: string, score: string, status: BetStatus) => void;
  toggleCashout: (couponId: string, amount?: number) => void;
  executeCashout: (couponId: string) => void;
  duplicateCoupon: (couponId: string) => MatchEvent[];
  deleteCoupon: (couponId: string) => void;
  setBalance: (amount: number) => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  addCustomLeague: (league: CustomLeague) => void;
  addCustomTeam: (team: CustomTeam) => void;
}

const INITIAL_COUPONS: BetSlip[] = [
  {
    id: '85104674928',
    createdAt: '02.09.2026 (13:30)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 2,
    totalOdds: 2710.4,
    stake: 5000,
    potentialPayout: 13552000,
    actualPayout: 13552000,
    status: 'Payé',
    gameCategory: 'sports',
    shareCode: 'KW928',
    isForSale: false,
    events: [
      {
        id: 'ev-kw-1',
        sport: 'Football',
        league: 'Koweït. Championnat du Koweït',
        date: '02.09.2026 (14:00)',
        homeTeam: { name: 'Al-Salmiya' },
        awayTeam: { name: 'Al-Arabi Kuwait' },
        prediction: 'Score exact : 2–2',
        odd: 52,
        status: 'Gain',
        actualScore: '2-2',
        halftimeScore: '2:2 (1:1, 1:1)',
        gameCategory: 'sports',
      },
      {
        id: 'ev-kw-2',
        sport: 'Football',
        league: 'Koweït. Championnat du Koweït',
        date: '02.09.2026 (16:30)',
        homeTeam: { name: 'Al-Qadsia' },
        awayTeam: { name: 'Kazma SC' },
        prediction: 'Score exact : 3–2',
        odd: 52.12,
        status: 'Gain',
        actualScore: '3-2',
        halftimeScore: '3:2 (2:1, 1:1)',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '85435548340',
    createdAt: '03.09.2026 (13:00)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 33516,
    stake: 3500,
    potentialPayout: 117306000,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'A8KF2',
    isForSale: true,
    cashoutAmount: 3325,
    events: [
      {
        id: 'ev-vleague-1',
        sport: 'Football',
        league: 'Vietnam · V-League',
        date: '03.09.2026 (13:15)',
        homeTeam: { name: 'Albany Rush' },
        awayTeam: { name: 'Aksu Pavlodar' },
        prediction: 'Score exact. 5–4',
        odd: 69,
        status: 'Accepté',
        actualScore: '5-4',
        roundCode: '0903001',
        gameCategory: 'sports',
      },
      {
        id: 'ev-vleague-2',
        sport: 'Football',
        league: 'Vietnam · V-League',
        date: '03.09.2026 (13:30)',
        homeTeam: { name: 'Aberdeen Fc' },
        awayTeam: { name: 'Aarau' },
        prediction: 'Score exact. 4–4',
        odd: 485.74,
        status: 'Accepté',
        actualScore: '4-4',
        roundCode: '0903002',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '85517683766',
    createdAt: '03.09.2026 (15:01)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 1000000,
    stake: 90,
    potentialPayout: 90000000,
    status: 'Accepté',
    gameCategory: 'poker',
    shareCode: 'PK89X',
    isForSale: false,
    cashoutAmount: 85,
    events: [
      {
        id: 'ev-poker-1',
        sport: 'Cyber-Sport',
        league: 'TvBet. POKER',
        date: '03.09.2026 (15:03)',
        homeTeam: { name: 'Main 1' },
        awayTeam: { name: 'Main 6' },
        prediction: 'Combinaison gagnante. Carte haute',
        odd: 1000,
        status: 'Accepté',
        roundCode: 'PB840645',
        badge: 'POKE',
        gameCategory: 'poker',
      },
      {
        id: 'ev-poker-2',
        sport: 'Cyber-Sport',
        league: 'TvBet. POKER',
        date: '03.09.2026 (15:06)',
        homeTeam: { name: 'Main 1' },
        awayTeam: { name: 'Main 6' },
        prediction: 'Combinaison gagnante. Carte haute',
        odd: 1000,
        status: 'Accepté',
        roundCode: 'PB653039',
        badge: 'POKE',
        gameCategory: 'poker',
      },
    ],
  },
  {
    id: '82574662089',
    createdAt: '03.09.2026 (20:00)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 3795,
    stake: 500,
    potentialPayout: 1897500,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'VN77Q',
    isForSale: true,
    cashoutAmount: 480,
    events: [
      {
        id: 'ev-foot-1',
        sport: 'Football',
        league: 'Vietnam · V-League',
        date: '03.09.2026 (20:00)',
        homeTeam: { name: 'Albany Rush' },
        awayTeam: { name: 'Aksu Pavlodar' },
        prediction: 'Score exact : 5–4',
        odd: 69,
        status: 'Accepté',
        actualScore: '5-4',
        gameCategory: 'sports',
      },
      {
        id: 'ev-foot-2',
        sport: 'Football',
        league: 'Vietnam · V-League',
        date: '03.09.2026 (20:00)',
        homeTeam: { name: 'Aberdeen Fc' },
        awayTeam: { name: 'Aarau' },
        prediction: 'Score exact : 4–4',
        odd: 55,
        status: 'Accepté',
        actualScore: '4-4',
        gameCategory: 'sports',
      },
    ],
  },
];

const INITIAL_LEAGUES: CustomLeague[] = [
  { id: '1', name: 'Vietnam · V-League', sport: 'Football', country: 'Vietnam' },
  { id: '2', name: 'UEFA Champions League', sport: 'Football', country: 'Europe' },
  { id: '3', name: 'Premier League', sport: 'Football', country: 'Angleterre' },
  { id: '4', name: 'Mortal Kombat Cyber League', sport: 'Cyber-Sport', country: 'Global' },
  { id: '5', name: 'TvBet Live Games', sport: 'Live Casino', country: 'Global' },
];

const INITIAL_TEAMS: CustomTeam[] = [
  { id: 't1', leagueId: '1', name: 'Albany Rush' },
  { id: 't2', leagueId: '1', name: 'Aksu Pavlodar' },
  { id: 't3', leagueId: '1', name: 'Aberdeen Fc' },
  { id: 't4', leagueId: '1', name: 'Aarau' },
  { id: 't5', leagueId: '4', name: 'Scorpion' },
  { id: 't6', leagueId: '4', name: 'Sub-Zero' },
  { id: 't7', leagueId: '4', name: 'Raiden' },
  { id: 't8', leagueId: '4', name: 'Liu Kang' },
];

export const useBetStore = create<BetState>((set, get) => ({
  balance: 182419282.08,
  activeSlip: [],
  coupons: INITIAL_COUPONS,
  customLeagues: INITIAL_LEAGUES,
  customTeams: INITIAL_TEAMS,

  addCoupon: (coupon: BetSlip) => {
    set((state) => ({
      coupons: [coupon, ...state.coupons],
      balance: state.balance - coupon.stake,
    }));
  },

  updateCouponStatus: (couponId: string, status: BetStatus) => {
    set((state) => ({
      coupons: state.coupons.map((c) => {
        if (c.id !== couponId) return c;
        const isWinning = status === 'Payé' || status === 'Gagné' || status === 'Gain';
        return {
          ...c,
          status,
          completedCount: isWinning || status === 'Perdu' ? c.eventsCount : c.completedCount,
          actualPayout: isWinning ? c.potentialPayout : 0,
        };
      }),
    }));
  },

  validateCouponWithResult: (couponId: string, isWon: boolean) => {
    set((state) => {
      let balanceChange = 0;
      const updatedCoupons = state.coupons.map((coupon) => {
        if (coupon.id !== couponId) return coupon;

        const updatedEvents = coupon.events.map((event) => {
          let pResult = event.pokerResult;
          if (event.gameCategory === 'poker' && !pResult) {
            pResult = generateRealisticPokerDraw(1, 'Carte haute');
          }

          let mkRes = event.mkResult;
          if (event.gameCategory === 'mortalkombat' && !mkRes) {
            mkRes = {
              rounds: [
                { roundNum: 1, winner: event.homeTeam.name, victoryType: 'Brutality' },
                { roundNum: 2, winner: event.awayTeam.name, victoryType: 'Normal' },
                { roundNum: 3, winner: event.homeTeam.name, victoryType: 'Fatality' },
              ],
              finalWinner: event.homeTeam.name,
            };
          }

          return {
            ...event,
            status: (isWon ? 'Gain' : 'Perdu') as BetStatus,
            pokerResult: pResult,
            mkResult: mkRes,
          };
        });

        const newStatus: BetStatus = isWon ? 'Payé' : 'Perdu';
        if (isWon) {
          balanceChange += coupon.potentialPayout;
        }

        return {
          ...coupon,
          status: newStatus,
          completedCount: coupon.eventsCount,
          actualPayout: isWon ? coupon.potentialPayout : 0,
          events: updatedEvents,
        };
      });

      return {
        coupons: updatedCoupons,
        balance: state.balance + balanceChange,
      };
    });
  },

  updateEventScore: (couponId: string, eventId: string, score: string, status: BetStatus) => {
    set((state) => ({
      coupons: state.coupons.map((c) => {
        if (c.id !== couponId) return c;
        const newEvents = c.events.map((e) =>
          e.id === eventId ? { ...e, actualScore: score, status } : e
        );
        const allCompleted = newEvents.every((e) => e.status !== 'Accepté' && e.status !== 'En cours');
        const allWon = newEvents.every((e) => e.status === 'Gain' || e.status === 'Payé');
        const anyLost = newEvents.some((e) => e.status === 'Perdu');

        let newCouponStatus = c.status;
        if (allWon) newCouponStatus = 'Payé';
        else if (anyLost) newCouponStatus = 'Perdu';

        return {
          ...c,
          events: newEvents,
          status: newCouponStatus,
          completedCount: allCompleted ? c.eventsCount : c.completedCount,
        };
      }),
    }));
  },

  toggleCashout: (couponId: string, amount?: number) => {
    set((state) => ({
      coupons: state.coupons.map((c) => {
        if (c.id !== couponId) return c;
        const nextForSale = !c.isForSale;
        const defaultCashout = Math.round(c.stake * 0.95);
        return {
          ...c,
          isForSale: nextForSale,
          cashoutAmount: amount || c.cashoutAmount || defaultCashout,
        };
      }),
    }));
  },

  executeCashout: (couponId: string) => {
    set((state) => {
      const coupon = state.coupons.find((c) => c.id === couponId);
      if (!coupon || !coupon.cashoutAmount) return state;

      const payout = coupon.cashoutAmount;
      return {
        balance: state.balance + payout,
        coupons: state.coupons.map((c) =>
          c.id === couponId
            ? { ...c, status: 'Vendu', isForSale: false, actualPayout: payout }
            : c
        ),
      };
    });
  },

  duplicateCoupon: (couponId: string) => {
    const coupon = get().coupons.find((c) => c.id === couponId);
    if (!coupon) return [];
    set({ activeSlip: [...coupon.events] });
    return coupon.events;
  },

  deleteCoupon: (couponId: string) => {
    set((state) => ({
      coupons: state.coupons.filter((c) => c.id !== couponId),
    }));
  },

  setBalance: (amount: number) => {
    set({ balance: amount });
  },

  deposit: (amount: number) => {
    set((state) => ({ balance: state.balance + amount }));
  },

  withdraw: (amount: number) => {
    set((state) => ({ balance: Math.max(0, state.balance - amount) }));
  },

  addCustomLeague: (league: CustomLeague) => {
    set((state) => ({
      customLeagues: [...state.customLeagues, league],
    }));
  },

  addCustomTeam: (team: CustomTeam) => {
    set((state) => ({
      customTeams: [...state.customTeams, team],
    }));
  },
}));
