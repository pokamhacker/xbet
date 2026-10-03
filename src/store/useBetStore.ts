import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BetSlip, BetStatus, CustomLeague, CustomTeam, MatchEvent } from '../types/bet';
import { generateRealisticPokerDraw, generateShareCode } from '../utils/pokerEngine';
import { betApiService } from '../services/betApiService';

interface BetState {
  balance: number;
  activeSlip: MatchEvent[];
  coupons: BetSlip[];
  customLeagues: CustomLeague[];
  customTeams: CustomTeam[];

  // Actions
  addCoupon: (coupon: BetSlip, userId?: string) => void;
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
  syncUserBets: (userId: string) => Promise<void>;
  getCouponsForUser: (userId?: string) => BetSlip[];
}

const INITIAL_COUPONS: BetSlip[] = [
  {
    id: '86037893293',
    createdAt: '27.09.2026 (08:30)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 0,
    totalOdds: 58,
    stake: 5000,
    potentialPayout: 290000,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'CP8603',
    isForSale: false,
    events: [
      {
        id: 'ev-fifa-8603',
        sport: 'FIFA',
        league: 'FC 25. 3x3. Champions League',
        date: '27.09.2026 (08:50)',
        homeTeam: {
          name: 'Johnstone Burgh',
          logo: 'https://media.api-sports.io/football/teams/256.png',
        },
        awayTeam: {
          name: '07 Diefflen',
          logo: 'https://media.api-sports.io/football/teams/10278.png',
        },
        prediction: 'Score exact. 7-7',
        odd: 58,
        status: 'Accepté',
        isLive: false,
        gameCategory: 'sports',
    badge: 'FIFA',
      },
    ],
  },
  {
    id: '86180587255',
    createdAt: '26.09.2026 (12:48)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 0,
    totalOdds: 58,
    stake: 5000,
    potentialPayout: 290000,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'CP8618',
    isForSale: false,
    events: [
      {
        id: 'ev-foot-8618',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '26.09.2026 (13:00)',
        homeTeam: { name: 'Bayern Munich' },
        awayTeam: { name: 'Arsenal' },
        prediction: 'Score exact: 2-1',
        odd: 58,
        status: 'Accepté',
        isLive: false,
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '86799754787',
    createdAt: '26.09.2026 (12:45)',
    type: 'Combiné',
    eventsCount: 3,
    completedCount: 3,
    totalOdds: 28152,
    stake: 500,
    potentialPayout: 14076000,
    actualPayout: 14076000,
    status: 'Payé',
    gameCategory: 'sports',
    shareCode: 'CP8679',
    isForSale: false,
    events: [
      {
        id: 'ev-foot-8679-1',
        sport: 'Football',
        league: 'Ligue des Champions',
        date: '26.09.2026 (13:00)',
        homeTeam: { name: 'Real Madrid' },
        awayTeam: { name: 'Liverpool' },
        prediction: 'Score exact: 3-1',
        odd: 56,
        status: 'Gain',
        isLive: false,
        actualScore: '3-1',
        gameCategory: 'sports',
      },
      {
        id: 'ev-foot-8679-2',
        sport: 'Football',
        league: 'Ligue des Champions',
        date: '26.09.2026 (13:00)',
        homeTeam: { name: 'PSG' },
        awayTeam: { name: 'Inter Milan' },
        prediction: 'Score exact: 2-2',
        odd: 42,
        status: 'Gain',
        isLive: false,
        actualScore: '2-2',
        gameCategory: 'sports',
      },
      {
        id: 'ev-foot-8679-3',
        sport: 'Football',
        league: 'Premier League',
        date: '26.09.2026 (13:00)',
        homeTeam: { name: 'Chelsea' },
        awayTeam: { name: 'Man City' },
        prediction: 'Score exact: 1-2',
        odd: 12,
        status: 'Gain',
        isLive: false,
        actualScore: '1-2',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '86856631156',
    createdAt: '23.09.2026 (13:35)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 2,
    totalOdds: 4224,
    stake: 1000,
    potentialPayout: 4224000,
    actualPayout: 4224000,
    status: 'Payé',
    gameCategory: 'sports',
    shareCode: 'CP8685',
    isForSale: false,
    events: [
      {
        id: 'ev-foot-8685-1',
        sport: 'Football',
        league: 'Ligue des Champions',
        date: '23.09.2026 (14:00)',
        homeTeam: { name: 'Barcelona' },
        awayTeam: { name: 'Juventus' },
        prediction: 'Score exact: 2-0',
        odd: 64,
        status: 'Gain',
        isLive: false,
        actualScore: '2-0',
        gameCategory: 'sports',
      },
      {
        id: 'ev-foot-8685-2',
        sport: 'Football',
        league: 'Ligue des Champions',
        date: '23.09.2026 (14:00)',
        homeTeam: { name: 'Bayern Munich' },
        awayTeam: { name: 'AC Milan' },
        prediction: 'Score exact: 3-1',
        odd: 66,
        status: 'Gain',
        isLive: false,
        actualScore: '3-1',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '85133576275',
    createdAt: '24.09.2026 (07:58)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 1815,
    stake: 1850,
    potentialPayout: 3357750,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'CP1815',
    isForSale: true,
    cashoutAmount: 1800,
    events: [
      {
        id: 'ev-live-1',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '24.09.2026 (08:00)',
        homeTeam: { name: 'Chelsea' },
        awayTeam: { name: 'Arsenal' },
        prediction: 'Score exact: 3-2',
        odd: 55,
        status: 'Accepté',
        isLive: true,
        actualScore: '1-1',
        gameCategory: 'sports',
      },
      {
        id: 'ev-live-2',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '24.09.2026 (08:00)',
        homeTeam: { name: 'Bayern Munich' },
        awayTeam: { name: 'Borussia Dortmund' },
        prediction: 'Score exact: 4-2',
        odd: 33,
        status: 'Accepté',
        isLive: true,
        actualScore: '2-1',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '85344055521',
    createdAt: '24.09.2026 (07:57)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 1815,
    stake: 1850,
    potentialPayout: 3357750,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'CP8534',
    isForSale: true,
    cashoutAmount: 1800,
    events: [
      {
        id: 'ev-live-3',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '24.09.2026 (08:00)',
        homeTeam: { name: 'Real Madrid' },
        awayTeam: { name: 'Manchester City' },
        prediction: 'Score exact: 2-3',
        odd: 55,
        status: 'Accepté',
        isLive: true,
        actualScore: '0-0',
        gameCategory: 'sports',
      },
      {
        id: 'ev-live-4',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '24.09.2026 (08:00)',
        homeTeam: { name: 'Inter Milan' },
        awayTeam: { name: 'Juventus' },
        prediction: 'Score exact: 3-1',
        odd: 33,
        status: 'Accepté',
        isLive: true,
        actualScore: '1-0',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '85699466605',
    createdAt: '12.09.2026 (08:55)',
    type: 'Combiné',
    eventsCount: 3,
    completedCount: 3,
    totalOdds: 14364,
    stake: 1500,
    potentialPayout: 21546000,
    actualPayout: 21546000,
    status: 'Payé',
    gameCategory: 'sports',
    shareCode: 'CP8569',
    isForSale: false,
    events: [
      {
        id: 'ev-won-1',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '12.09.2026 (09:00)',
        homeTeam: { name: 'FC Groningen' },
        awayTeam: { name: 'Minnesota United FC' },
        prediction: 'Score exact: 1-0',
        odd: 23,
        status: 'Gain',
        actualScore: '1-0',
        gameCategory: 'sports',
      },
      {
        id: 'ev-won-2',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '12.09.2026 (09:00)',
        homeTeam: { name: 'FC Twente' },
        awayTeam: { name: 'Queens Park Rangers' },
        prediction: 'Score exact: 1-2',
        odd: 26,
        status: 'Gain',
        actualScore: '1-2',
        gameCategory: 'sports',
      },
      {
        id: 'ev-won-3',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '12.09.2026 (09:00)',
        homeTeam: { name: 'FK Bodo/Glimt' },
        awayTeam: { name: 'Paraná Clube' },
        prediction: 'Score exact: 3-1',
        odd: 24,
        status: 'Gain',
        actualScore: '3-1',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '482910481',
    createdAt: '09.09.2026 (14:32)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 2,
    totalOdds: 72.00,
    stake: 500,
    potentialPayout: 36000,
    actualPayout: 36000,
    status: 'Payé',
    gameCategory: 'sports',
    shareCode: 'CP7200',
    isForSale: false,
    events: [
      {
        id: 'e1',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '09.09.2026 (14:32)',
        homeTeam: { name: 'FC Groningen' },
        awayTeam: { name: 'Minnesota United FC' },
        prediction: 'Score exact: 1-0',
        odd: 9.00,
        status: 'Gain',
        actualScore: '1-0',
        gameCategory: 'sports',
      },
      {
        id: 'e2',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '09.09.2026 (14:32)',
        homeTeam: { name: 'FC Twente' },
        awayTeam: { name: 'Queens Park Rangers' },
        prediction: 'Score exact: 1-2',
        odd: 8.00,
        status: 'Gain',
        actualScore: '1-2',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '86270208738',
    createdAt: '20.09.2026 (11:40)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 8800,
    stake: 500,
    potentialPayout: 4400000,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'CP8800',
    isForSale: true,
    cashoutAmount: 475,
    events: [
      {
        id: 'ev-ref-1',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '13.09.2026 (04:00)',
        homeTeam: { name: 'Aalesunds U19' },
        awayTeam: { name: 'AA Iguaçu' },
        prediction: 'Score exact: 6-3',
        odd: 100,
        status: 'Accepté',
        gameCategory: 'sports',
      },
      {
        id: 'ev-ref-2',
        sport: 'Football',
        league: 'Matchs amicaux des clubs',
        date: '13.09.2026 (04:00)',
        homeTeam: { name: 'FK Bodo/Glimt U19' },
        awayTeam: { name: 'Paraná Clube U19' },
        prediction: 'Score exact: 5-2',
        odd: 88,
        status: 'Accepté',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '86118228811',
    createdAt: '05.09.2026 (01:47)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 1,
    totalOdds: 600,
    stake: 650,
    potentialPayout: 390000,
    actualPayout: 390000,
    status: 'Payé',
    gameCategory: 'poker',
    drawNumber: 'PB286750',
    shareCode: 'PK600',
    isForSale: false,
    events: [
      {
        id: 'ev-poker-ref',
        sport: 'Cyber-Sport',
        league: 'TvBet. POKER',
        date: '05.09.2026 (01:50)',
        homeTeam: { name: 'Main 1' },
        awayTeam: { name: 'Main 6' },
        prediction: 'Combinaison gagnante. Quinte flush',
        odd: 600,
        status: 'Gain',
        roundCode: 'PB286750',
        badge: 'POKE',
        gameCategory: 'poker',
      },
    ],
  },
  {
    id: '85792134012',
    createdAt: '06.09.2026 (17:45)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 3.98,
    stake: 2000,
    potentialPayout: 7960,
    status: 'Accepté',
    gameCategory: 'sports',
    shareCode: 'FIFA88',
    isForSale: true,
    cashoutAmount: 1950,
    events: [
      {
        id: 'ev-fifa-1',
        sport: 'FIFA',
        league: 'FIFA. Ligue des Champions',
        date: '06.09.2026 (18:00)',
        isLive: true,
        homeTeam: { name: 'Real Madrid' },
        awayTeam: { name: 'Manchester City' },
        prediction: 'V1 (Temps Réglementaire)',
        odd: 2.15,
        status: 'Accepté',
        actualScore: '1-1',
        gameCategory: 'sports',
      },
      {
        id: 'ev-fifa-2',
        sport: 'FIFA',
        league: 'FIFA. Championnat d\'Espagne',
        date: '06.09.2026 (19:30)',
        isLive: false,
        homeTeam: { name: 'FC Barcelona' },
        awayTeam: { name: 'Atletico Madrid' },
        prediction: 'Total plus de (2.5)',
        odd: 1.85,
        status: 'Accepté',
        actualScore: '0-0',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '84910283741',
    createdAt: '01.09.2026 (19:15)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 2,
    totalOdds: 5.40,
    stake: 1000,
    potentialPayout: 5400,
    actualPayout: 0,
    status: 'Perdu',
    gameCategory: 'sports',
    shareCode: 'LOST01',
    isForSale: false,
    events: [
      {
        id: 'ev-lost-1',
        sport: 'FIFA',
        league: 'FIFA. Ligue des Champions',
        date: '01.09.2026 (19:30)',
        homeTeam: { name: 'Bayern Munich' },
        awayTeam: { name: 'Paris Saint-Germain' },
        prediction: 'V1',
        odd: 1.80,
        status: 'Perdu',
        actualScore: '1-2',
        gameCategory: 'sports',
      },
      {
        id: 'ev-lost-2',
        sport: 'FIFA',
        league: 'FIFA. Championnat d\'Angleterre',
        date: '01.09.2026 (20:00)',
        homeTeam: { name: 'Liverpool' },
        awayTeam: { name: 'Arsenal' },
        prediction: 'Total plus de (2.5)',
        odd: 3.00,
        status: 'Gain',
        actualScore: '3-1',
        gameCategory: 'sports',
      },
    ],
  },
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
    drawNumber: 'PB286750',
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

export const useBetStore = create<BetState>()(
  persist(
    (set, get) => ({
      balance: 64801550,
      activeSlip: [],
      coupons: INITIAL_COUPONS.map((c) => ({
        ...c,
        userId: c.userId || 'user-demo-1',
        ticketNumber: c.ticketNumber || c.id,
      })),
      customLeagues: INITIAL_LEAGUES,
      customTeams: INITIAL_TEAMS,

      addCoupon: (coupon: BetSlip, userId?: string) => {
        let targetUserId = userId || coupon.userId;
        if (!targetUserId) {
          try {
            const { useAuthStore } = require('./authStore');
            targetUserId = useAuthStore.getState().currentUser?.id;
          } catch (e) {}
        }
        targetUserId = targetUserId || 'user-demo-1';

        const couponWithUser: BetSlip = {
          ...coupon,
          userId: targetUserId,
          ticketNumber: coupon.ticketNumber || coupon.id,
        };

        set((state) => ({
          coupons: [couponWithUser, ...state.coupons.filter((c) => c.id !== couponWithUser.id)],
          balance: state.balance - coupon.stake,
        }));

        // Sauvegarde asynchrone sur le backend
        betApiService.saveBetToBackend(couponWithUser, targetUserId);
      },

      updateCouponStatus: (couponId: string, status: BetStatus) => {
        let actualPayout = 0;
        set((state) => ({
          coupons: state.coupons.map((c) => {
            if (c.id !== couponId) return c;
            const isWinning = status === 'Payé' || status === 'Gagné' || status === 'Gain';
            actualPayout = isWinning ? (c.potentialPayout || c.actualPayout || 0) : 0;
            return {
              ...c,
              status,
              completedCount: isWinning || status === 'Perdu' ? c.eventsCount : c.completedCount,
              actualPayout,
            };
          }),
        }));
        betApiService.updateBetStatusOnBackend(couponId, status, actualPayout);
      },

      validateCouponWithResult: (couponId: string, isWon: boolean) => {
        let finalStatus: BetStatus = isWon ? 'Payé' : 'Perdu';
        let payout = 0;
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
            finalStatus = newStatus;
            if (isWon) {
              balanceChange += coupon.potentialPayout;
              payout = coupon.potentialPayout;
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

        betApiService.updateBetStatusOnBackend(couponId, finalStatus, payout);
      },

      updateEventScore: (couponId: string, eventId: string, score: string, status: BetStatus) => {
        let updatedCouponStatus: BetStatus | undefined;
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
            updatedCouponStatus = newCouponStatus;

            return {
              ...c,
              events: newEvents,
              status: newCouponStatus,
              completedCount: allCompleted ? c.eventsCount : c.completedCount,
            };
          }),
        }));

        betApiService.updateBetScoreOnBackend(couponId, eventId, score, status, updatedCouponStatus);
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
        let payout = 0;
        set((state) => {
          const coupon = state.coupons.find((c) => c.id === couponId);
          if (!coupon || !coupon.cashoutAmount) return state;

          payout = coupon.cashoutAmount;
          return {
            balance: state.balance + payout,
            coupons: state.coupons.map((c) =>
              c.id === couponId
                ? { ...c, status: 'Vendu', isForSale: false, actualPayout: payout }
                : c
            ),
          };
        });

        if (payout > 0) {
          betApiService.updateBetStatusOnBackend(couponId, 'Vendu', payout);
        }
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
        betApiService.deleteBetOnBackend(couponId);
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

      syncUserBets: async (userId: string) => {
        if (!userId) return;
        try {
          const remoteBets = await betApiService.fetchUserBets(userId);
          if (remoteBets && remoteBets.length > 0) {
            set((state) => {
              const remoteIds = new Set(remoteBets.map((b) => b.id));
              const localOtherUsers = state.coupons.filter(
                (c) => c.userId && c.userId !== userId && !remoteIds.has(c.id)
              );
              return {
                coupons: [...remoteBets, ...localOtherUsers],
              };
            });
          } else {
            const currentCoupons = get().coupons.filter(
              (c) => !c.userId || c.userId === userId || c.userId === 'user-demo-1'
            );
            if (currentCoupons.length > 0) {
              await betApiService.syncAllBetsToBackend(userId, currentCoupons);
            }
          }
        } catch (e) {
          // Fallback offline via AsyncStorage
        }
      },

      getCouponsForUser: (userId?: string) => {
        const all = get().coupons;
        if (!userId || userId === 'all') return all;
        return all.filter((c) => !c.userId || c.userId === userId || c.userId === 'user-demo-1');
      },
    }),
    {
      name: 'xbet_user_bets_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
