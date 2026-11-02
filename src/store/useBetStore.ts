import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BetSlip, BetStatus, CustomLeague, CustomTeam, MatchEvent } from '../types/bet';
import { generateRealisticPokerDraw, generateShareCode } from '../utils/pokerEngine';
import { adaptEventResultToPrediction } from '../utils/scoreAdapter';
import { betApiService } from '../services/betApiService';
import { combineDateAndTime, formatBetDate } from '../utils/dateFormatter';

interface BetState {
  balance: number;
  activeSlip: MatchEvent[];
  coupons: BetSlip[];
  customLeagues: CustomLeague[];
  customTeams: CustomTeam[];

  // Actions
  addCoupon: (coupon: BetSlip, userId?: string) => void;
  addMatchToBetCoupon: (matchPayload: any) => void;
  updateCouponStatus: (couponId: string, status: BetStatus) => void;
  validateCouponWithResult: (couponId: string, isWon: boolean, customScores?: { [eventId: string]: string }) => void;
  updateEventScore: (couponId: string, eventId: string, score: string, status: BetStatus) => void;
  toggleCashout: (couponId: string, amount?: number) => void;
  executeCashout: (couponId: string) => void;
  duplicateCoupon: (couponId: string) => MatchEvent[];
  deleteCoupon: (couponId: string) => void;
  setBalance: (amount: number) => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  addCustomLeague: (league: CustomLeague) => void;
  removeCustomLeague: (leagueId: string) => void;
  addCustomTeam: (team: CustomTeam) => void;
  removeCustomTeam: (teamId: string) => void;
  syncUserBets: (userId: string) => Promise<void>;
  getCouponsForUser: (userId?: string) => BetSlip[];
}

const INITIAL_COUPONS: BetSlip[] = [
  {
    id: '89694250971',
    createdAt: '28.10.2026 (07:34 PM)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 0,
    totalOdds: 1.345,
    stake: 90,
    potentialPayout: 121.05,
    status: 'Accepté',
    isLive: true,
    gameCategory: 'esports',
    shareCode: 'FF8969',
    isForSale: true,
    canSell: true,
    sellPrice: '102.09',
    cashoutAmount: 102.09,
    events: [
      {
        id: 'ev-fifa-bayern-napoli-8969',
        sport: 'FIFA',
        league: 'FC 26. 5x5 Rush. Superligue',
        date: '28.10.2026 (07:30 PM)',
        homeTeam: {
          name: 'Bayern Munich',
          logo: 'generic-player',
        },
        awayTeam: {
          name: 'Napoli',
          logo: 'https://media.api-sports.io/football/teams/492.png',
        },
        prediction: '1X2. V1',
        odd: 1.345,
        status: 'Accepté',
        isLive: true,
        actualScore: '3:1',
        halftimeScore: '3:1 (3:1)',
        elapsed: 223,
        gameCategory: 'esports',
      },
    ],
  },
  {
    id: '88909739359',
    createdAt: '16.10.2026 (09:59 AM)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 2,
    totalOdds: 2.734,
    stake: 500000,
    potentialPayout: 1367400,
    actualPayout: 1367400,
    status: 'Payé',
    isLive: false,
    gameCategory: 'sports',
    shareCode: 'ML8890',
    isForSale: false,
    events: [
      {
        id: 'ev-frankfurt-cologne-8890',
        sport: 'Football',
        league: 'Allemagne. Bundesliga',
        date: '16.10.2026 (07:30 PM)',
        homeTeam: {
          name: 'Eintracht Frankfurt',
          logo: 'jersey:stripes:#111111:#E11D48:DE',
        },
        awayTeam: {
          name: 'Cologne',
          logo: 'jersey:solid:#FFFFFF:#CBD5E1:DE',
        },
        prediction: 'Total. (4) Moins de',
        odd: 1.59,
        status: 'Gain',
        isLive: false,
        actualScore: '1:0',
        halftimeScore: '(0:0,1:0)',
        gameCategory: 'sports',
      },
      {
        id: 'ev-deportivo-levante-8890',
        sport: 'Football',
        league: 'Espagne. La Liga',
        date: '16.10.2026 (08:00 PM)',
        homeTeam: {
          name: 'Deportivo de A Coruna',
          logo: 'https://media.api-sports.io/football/teams/544.png',
        },
        awayTeam: {
          name: 'Levante UD',
          logo: 'https://media.api-sports.io/football/teams/539.png',
        },
        prediction: 'Deux équipes vont marquer. Oui',
        odd: 1.72,
        status: 'Gain',
        isLive: false,
        actualScore: '1:1',
        halftimeScore: '(0:0,1:1)',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '89680022549',
    createdAt: '28.10.2026 (03:50 PM)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 2.334,
    stake: 1000,
    potentialPayout: 2334.48,
    status: 'Accepté',
    isLive: false,
    gameCategory: 'sports',
    shareCode: 'ML8968',
    isForSale: true,
    canSell: true,
    sellPrice: 750,
    cashoutAmount: 750,
    events: [
      {
        id: 'ev-venise-inter-8968',
        sport: 'Football',
        league: 'Italie. Série A',
        date: '28.10.2026 (06:30 PM)',
        roundCode: 'Tour 9',
        homeTeam: {
          name: 'Venise FC',
          logo: 'https://media.api-sports.io/football/teams/517.png',
        },
        awayTeam: {
          name: 'Inter Milan',
          logo: 'https://media.api-sports.io/football/teams/505.png',
        },
        prediction: '1X2. V2',
        odd: 1.37,
        status: 'Accepté',
        isLive: false,
        gameCategory: 'sports',
      },
      {
        id: 'ev-milan-bologna-8968',
        sport: 'Football',
        league: 'Italie. Série A',
        date: '28.10.2026 (06:30 PM)',
        roundCode: 'Tour 9',
        homeTeam: {
          name: 'Milan',
          logo: 'https://media.api-sports.io/football/teams/489.png',
        },
        awayTeam: {
          name: 'Bologna1909',
          logo: 'https://media.api-sports.io/football/teams/500.png',
        },
        prediction: '1X2. V1',
        odd: 1.704,
        status: 'Accepté',
        isLive: false,
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '88964599389',
    createdAt: '17.10.2026 (11:20 AM)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 2,
    totalOdds: 3.021,
    stake: 500000,
    potentialPayout: 1510760,
    actualPayout: 1510760,
    status: 'Payé',
    isLive: false,
    gameCategory: 'sports',
    shareCode: 'ML8896',
    isForSale: false,
    events: [
      {
        id: 'ev-bayern-leipzig-8896',
        sport: 'Football',
        league: 'Allemagne. Bundesliga',
        date: '17.10.2026 (05:30 PM)',
        homeTeam: {
          name: 'Bayern Munich',
          logo: 'https://media.api-sports.io/football/teams/157.png',
        },
        awayTeam: {
          name: 'RasenBallsport Leipzig',
          logo: 'https://media.api-sports.io/football/teams/173.png',
        },
        prediction: 'Total. (4.5) Plus de',
        odd: 1.79,
        status: 'Gain',
        isLive: false,
        actualScore: '6:1',
        halftimeScore: '(3:0,3:1)',
        gameCategory: 'sports',
      },
      {
        id: 'ev-espanyol-atletico-8896',
        sport: 'Football',
        league: 'Espagne. La Liga',
        date: '17.10.2026 (01:00 PM)',
        homeTeam: {
          name: 'Espanyol',
          logo: 'https://media.api-sports.io/football/teams/540.png',
        },
        awayTeam: {
          name: 'Atlético de Madrid',
          logo: 'https://media.api-sports.io/football/teams/530.png',
        },
        prediction: '1X2. V2',
        odd: 1.688,
        status: 'Gain',
        isLive: false,
        actualScore: '0:1',
        halftimeScore: '(0:0,0:1)',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '89736180539',
    createdAt: '29.10.2026 (03:55 PM)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 1,
    totalOdds: 5.8,
    stake: 90,
    potentialPayout: 522,
    status: 'Payé',
    isLive: false,
    gameCategory: 'poker',
    shareCode: 'CP8973618',
    isForSale: false,
    pokerResult: {
      board: 'A♣, 3♠, 2♠, 9♦, K♣',
      hands: [
        { id: 1, cards: '9♣, 8♣' },
        { id: 2, cards: 'J♣, 5♣' },
        { id: 3, cards: '3♣, 6♦' },
        { id: 4, cards: '2♥, J♥' },
        { id: 5, cards: 'A♣, 10♣' },
        { id: 6, cards: 'Q♣, 4♥' },
      ],
      winnerLabel: '5 (Paire)',
      combinationName: 'Combinaison gagnante. Une Paire',
    },
    events: [
      {
        id: 'ev-poker-89736180539-1',
        sport: 'TvBet. POKER',
        league: 'TvBet. POKER',
        date: '29.10.2026 (03:55 PM)',
        homeTeam: { name: 'TvBet. POKER' },
        awayTeam: { name: 'TvBet' },
        prediction: 'Combinaison gagnante. Une Paire',
        odd: 5.8,
        status: 'Gain',
        isLive: false,
        gameCategory: 'poker',
        roundCode: 'PB232803',
      },
    ],
  },
  {
    id: '89193928697',
    createdAt: '20.10.2026 (17:14)',
    type: 'Combiné',
    eventsCount: 2,
    completedCount: 0,
    totalOdds: 33.64,
    stake: 500,
    potentialPayout: 16820,
    status: 'Accepté',
    isLive: true,
    gameCategory: 'poker',
    shareCode: 'CP8919',
    isForSale: false,
    events: [
      {
        id: 'ev-poker-8919-1',
        sport: 'TvBet. POKER',
        league: 'TvBet. POKER',
        date: '20.10.2026 (17:22)',
        homeTeam: { name: 'TvBet. POKER' },
        awayTeam: { name: 'TvBet' },
        prediction: 'Combinaison gagnante. Une Paire',
        odd: 5.8,
        status: 'Accepté',
        isLive: true,
        gameCategory: 'poker',
        roundCode: 'PB227671',
      },
      {
        id: 'ev-poker-8919-2',
        sport: 'TvBet. POKER',
        league: 'TvBet. POKER',
        date: '20.10.2026 (17:20)',
        homeTeam: { name: 'TvBet. POKER' },
        awayTeam: { name: 'TvBet' },
        prediction: 'Combinaison gagnante. Une Paire',
        odd: 5.8,
        status: 'Accepté',
        isLive: true,
        gameCategory: 'poker',
        roundCode: 'PB227670',
      },
    ],
  },
  {
    id: '89193515741',
    createdAt: '20.10.2026 (17:09)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 0,
    totalOdds: 5.2,
    stake: 90,
    potentialPayout: 468,
    status: 'Accepté',
    isLive: true,
    gameCategory: 'poker',
    shareCode: 'CP8919-2',
    isForSale: false,
    events: [
      {
        id: 'ev-poker-8919-simple-1',
        sport: 'TvBet. POKER',
        league: 'TvBet. POKER',
        date: '20.10.2026 (17:09)',
        homeTeam: { name: 'TvBet. POKER' },
        awayTeam: { name: 'TvBet' },
        prediction: 'Combinaison gagnante. Une Paire',
        odd: 5.2,
        status: 'Accepté',
        isLive: true,
        gameCategory: 'poker',
        roundCode: 'PB227668',
      },
    ],
  },
  {
    id: '89193508467',
    createdAt: '20.10.2026 (17:09)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 0,
    totalOdds: 1000,
    stake: 90,
    potentialPayout: 90000,
    status: 'Accepté',
    isLive: true,
    gameCategory: 'poker',
    shareCode: 'CP8919-3',
    isForSale: false,
    events: [
      {
        id: 'ev-poker-8919-simple-2',
        sport: 'TvBet. POKER',
        league: 'TvBet. POKER',
        date: '20.10.2026 (17:09)',
        homeTeam: { name: 'TvBet. POKER' },
        awayTeam: { name: 'TvBet' },
        prediction: 'Quinte Flush Royale',
        odd: 1000,
        status: 'Accepté',
        isLive: true,
        gameCategory: 'poker',
        roundCode: 'PB227667',
      },
    ],
  },
  {
    id: '89147610641',
    createdAt: '19.10.2026 (21:42)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 1,
    totalOdds: 2.325,
    stake: 100000,
    potentialPayout: 232500,
    actualPayout: 232500,
    status: 'Payé',
    isLive: false,
    gameCategory: 'sports',
    shareCode: 'CP8914',
    isForSale: false,
    events: [
      {
        id: 'ev-tottenham-8914',
        sport: 'Football',
        league: 'Angleterre. Premier League',
        date: '19.10.2026 (20:00)',
        homeTeam: {
          name: 'Tottenham Hotspur',
          logo: 'https://media.api-sports.io/football/teams/47.png',
        },
        awayTeam: {
          name: 'Coventry City',
          logo: 'https://media.api-sports.io/football/teams/1346.png',
        },
        prediction: 'Total. (3.5) Plus de',
        odd: 2.325,
        status: 'Gain',
        isLive: false,
        actualScore: '3-1',
        halftimeScore: '3:1 (1:0, 2:1)',
        gameCategory: 'sports',
      },
    ],
  },
  {
    id: '85801058016',
    createdAt: '07.10.2026 (16:11)',
    type: 'Simple',
    eventsCount: 1,
    completedCount: 1,
    totalOdds: 100,
    stake: 1000,
    potentialPayout: 100000,
    actualPayout: 100000,
    status: 'Payé',
    isLive: true,
    gameCategory: 'sports',
    shareCode: 'CP8580',
    isForSale: false,
    events: [
      {
        id: 'ev-nextgen-8580',
        sport: 'Football',
        league: 'NextGen Trophy U17',
        date: '07.10.2026 (16:11)',
        homeTeam: {
          name: 'Red Bull Salzburg U17',
          logo: 'https://media.api-sports.io/football/teams/571.png',
        },
        awayTeam: {
          name: 'Ajax U17',
          logo: 'https://media.api-sports.io/football/teams/194.png',
        },
        prediction: 'Vainqueur : Red Bull Salzburg U17',
        odd: 100,
        status: 'Gain',
        isLive: true,
        actualScore: '1-1',
        halftimeScore: '1:1 (0:0, 1:1)',
        gameCategory: 'sports',
      },
    ],
  },
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
    isLive: true,
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
        isLive: true,
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
    isLive: true,
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
        isLive: true,
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
        isLive: true,
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
  {
    id: 'custo-1',
    name: 'Tournoi des Champions Studio',
    sport: 'Football',
    country: 'International',
    icon: 'trophy',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    category: 'custom',
  },
  {
    id: 'custo-2',
    name: 'Super Ligue des Quartiers',
    sport: 'Football',
    country: 'France',
    icon: 'shield',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    category: 'custom',
  },
  {
    id: 'custo-3',
    name: 'E-Soccer Cyber Cup 2026',
    sport: 'Cyber-Sport',
    country: 'Global',
    icon: 'game-controller',
    logo: 'https://media.api-sports.io/football/leagues/1.png',
    category: 'custom',
  },
];

const INITIAL_TEAMS: CustomTeam[] = [
  { id: 'ct1', leagueId: 'custo-1', name: 'FC Stars Studio', shortName: 'FCS', country: 'France', logo: 'https://media.api-sports.io/football/teams/85.png' },
  { id: 'ct2', leagueId: 'custo-1', name: 'Olympique Galactique', shortName: 'OLG', country: 'France', logo: 'https://media.api-sports.io/football/teams/541.png' },
  { id: 'ct3', leagueId: 'custo-1', name: 'Athletic Red Bulls', shortName: 'ARB', country: 'Espagne', logo: 'https://media.api-sports.io/football/teams/173.png' },
  { id: 'ct4', leagueId: 'custo-1', name: 'Inter Cyber Stars', shortName: 'ICS', country: 'Italie', logo: 'https://media.api-sports.io/football/teams/505.png' },
  { id: 'ct5', leagueId: 'custo-2', name: 'AS Belleville', shortName: 'BEL', country: 'France', logo: 'https://media.api-sports.io/football/teams/116.png' },
  { id: 'ct6', leagueId: 'custo-2', name: 'Étoile de Montmartre', shortName: 'EDM', country: 'France', logo: 'https://media.api-sports.io/football/teams/111.png' },
  { id: 'ct7', leagueId: 'custo-3', name: 'Cyber Titans', shortName: 'CYB', country: 'Global', logo: 'https://media.api-sports.io/football/teams/50.png' },
  { id: 'ct8', leagueId: 'custo-3', name: 'Neo Warriors', shortName: 'NEO', country: 'Global', logo: 'https://media.api-sports.io/football/teams/529.png' },
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
        // Exclure formellement les mini-jeux (crash, kamikaze, apple, etc.) de l'historique des paris sportifs
        const gCat = (coupon.gameCategory || '').toLowerCase();
        const firstEvCat = (coupon.events?.[0]?.gameCategory || '').toLowerCase();
        const firstEvSport = (coupon.events?.[0]?.sport || '').toLowerCase();
        const firstEvLeague = (coupon.events?.[0]?.league || '').toLowerCase();
        const firstEvBadge = (coupon.events?.[0]?.badge || '').toLowerCase();

        const isMiniGame =
          ['crash', 'apple', 'kamikaze', 'royal_feast', 'minigame', 'arcade', '1xgames'].includes(gCat) ||
          ['crash', 'apple', 'kamikaze', 'royal_feast', 'minigame', 'arcade', '1xgames'].includes(firstEvCat) ||
          firstEvBadge === 'crash' ||
          firstEvBadge === 'apple' ||
          firstEvBadge === 'kamikaze' ||
          firstEvSport.includes('mini-jeu') ||
          firstEvSport.includes('mini-game') ||
          firstEvLeague.includes('crash') ||
          firstEvLeague.includes('apple of fortune') ||
          firstEvLeague.includes('kamikaze') ||
          firstEvLeague.includes('1xgames');

        if (isMiniGame) {
          // Les mini-jeux gèrent directement le solde et ne doivent pas apparaître dans l'historique des paris
          return;
        }

        let targetUserId = userId || coupon.userId;
        if (!targetUserId) {
          try {
            const { useAuthStore } = require('./authStore');
            targetUserId = useAuthStore.getState().currentUser?.id;
          } catch (e) {}
        }
        targetUserId = targetUserId || 'user-demo-1';

        // Horodatage strict : combine date et heure sans décalage
        const combined = combineDateAndTime(
          coupon.matchDate || coupon.startDate || coupon.createdAt,
          coupon.matchTime
        );

        // Normalisation de chaque événement avec conservation stricte de son heure de début
        const normalizedEvents = (coupon.events || []).map((ev) => {
          const evTime = ev.matchTime || coupon.matchTime || combined.isoString.substring(11, 16);
          const evDate = ev.matchDate || coupon.matchDate;
          const evCombined = combineDateAndTime(ev.startDate || ev.date || evDate, evTime);

          return {
            ...ev,
            date: ev.date || evCombined.formatted,
            startDate: ev.startDate || evCombined.isoString,
            matchTime: ev.matchTime || evTime,
            matchDate: ev.matchDate || evDate || combined.formatted.substring(0, 10),
          };
        });

        const couponWithUser: BetSlip = {
          ...coupon,
          userId: targetUserId,
          ticketNumber: coupon.ticketNumber || coupon.id,
          createdAt: coupon.createdAt || combined.formatted,
          startDate: coupon.startDate || combined.isoString,
          matchTime: coupon.matchTime || combined.isoString.substring(11, 16),
          matchDate: coupon.matchDate || combined.formatted.substring(0, 10),
          events: normalizedEvents,
        };

        set((state) => ({
          coupons: [couponWithUser, ...state.coupons.filter((c) => c.id !== couponWithUser.id)],
          balance: state.balance - coupon.stake,
        }));

        // Sauvegarde asynchrone sur le backend
        betApiService.saveBetToBackend(couponWithUser, targetUserId);
      },

      addMatchToBetCoupon: (matchPayload: any) => {
        const finalDate = matchPayload.matchDate || matchPayload.date || matchPayload.startDate;
        const finalTime = matchPayload.matchTime || (matchPayload.startDate ? matchPayload.startDate.substring(11, 16) : undefined);
        const combined = combineDateAndTime(finalDate, finalTime);

        const newEv: MatchEvent = {
          id: matchPayload.id || `ev-${Date.now()}`,
          sport: matchPayload.sport || 'Football',
          league: matchPayload.league || 'Football',
          date: matchPayload.date || combined.formatted,
          startDate: matchPayload.startDate || combined.isoString,
          matchTime: matchPayload.matchTime || finalTime || combined.isoString.substring(11, 16),
          matchDate: matchPayload.matchDate || combined.formatted.substring(0, 10),
          homeTeam: matchPayload.homeTeam || (matchPayload.team1 ? { name: matchPayload.team1 } : { name: 'Équipe 1' }),
          awayTeam: matchPayload.awayTeam || (matchPayload.team2 ? { name: matchPayload.team2 } : { name: 'Équipe 2' }),
          prediction: matchPayload.prediction || matchPayload.betType || 'V1',
          odd: typeof matchPayload.odd === 'number' ? matchPayload.odd : (parseFloat(matchPayload.odds) || 1.85),
          status: matchPayload.status || 'Accepté',
          isLive: Boolean(matchPayload.isLive),
          actualScore: matchPayload.actualScore,
          gameCategory: matchPayload.gameCategory || 'sports',
        };

        set((state) => ({
          activeSlip: [...state.activeSlip, newEv],
        }));

        // Synchroniser également avec couponStore si initialisé
        try {
          const { useCouponStore } = require('./couponStore');
          useCouponStore.getState().addEvent(newEv);
        } catch (e) {}
      },

      updateCouponStatus: (couponId: string, status: BetStatus) => {
        let actualPayout = 0;
        set((state) => ({
          coupons: state.coupons.map((c) => {
            if (c.id !== couponId) return c;
            const isWinning = status === 'Payé' || status === 'Gagné' || status === 'Gain';
            const isSettled = isWinning || status === 'Perdu' || status === 'Annulé';
            actualPayout = isWinning ? (c.potentialPayout || c.actualPayout || 0) : 0;
            return {
              ...c,
              status,
              isLive: isSettled ? false : c.isLive,
              events: isSettled && c.events ? c.events.map((ev) => ({ ...ev, isLive: false })) : c.events,
              completedCount: isWinning || status === 'Perdu' ? c.eventsCount : c.completedCount,
              actualPayout,
            };
          }),
        }));
        betApiService.updateBetStatusOnBackend(couponId, status, actualPayout);
      },

      validateCouponWithResult: (couponId: string, isWon: boolean, customScores?: { [eventId: string]: string }) => {
        let finalStatus: BetStatus = isWon ? 'Payé' : 'Perdu';
        let payout = 0;
        set((state) => {
          let balanceChange = 0;
          const updatedCoupons = state.coupons.map((coupon) => {
            if (coupon.id !== couponId) return coupon;

            const updatedEvents = coupon.events.map((event) => {
              const adapted = adaptEventResultToPrediction(event, isWon);
              const customScore = customScores?.[event.id];

              return {
                ...event,
                status: (isWon ? 'Gain' : 'Perdu') as BetStatus,
                isLive: false,
                actualScore: customScore || adapted.actualScore,
                halftimeScore: adapted.halftimeScore || event.halftimeScore,
                pokerResult: adapted.pokerResult || event.pokerResult,
                mkResult: adapted.mkResult || event.mkResult,
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
              isLive: false,
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
            const newEvents = c.events.map((e) => {
              if (e.id !== eventId) return e;
              let half = e.halftimeScore;
              if (!half && score && score.includes('-')) {
                const parts = score.split(/[-:]/).map((s) => parseInt(s.trim(), 10) || 0);
                half = `(${Math.floor(parts[0] / 2)}:${Math.floor(parts[1] / 2)})`;
              }
              return { ...e, actualScore: score, status, halftimeScore: half };
            });
            const completedEventsCount = newEvents.filter(
              (e) => e.status !== 'Accepté' && e.status !== 'En cours'
            ).length;
            const allCompleted = completedEventsCount === newEvents.length;
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
              completedCount: completedEventsCount,
              actualPayout: allWon ? c.potentialPayout : (anyLost ? 0 : c.actualPayout),
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

      removeCustomLeague: (leagueId: string) => {
        set((state) => ({
          customLeagues: state.customLeagues.filter((l) => l.id !== leagueId),
          customTeams: state.customTeams.filter((t) => t.leagueId !== leagueId),
        }));
      },

      addCustomTeam: (team: CustomTeam) => {
        set((state) => ({
          customTeams: [...state.customTeams, team],
        }));
      },

      removeCustomTeam: (teamId: string) => {
        set((state) => ({
          customTeams: state.customTeams.filter((t) => t.id !== teamId),
        }));
      },

      syncUserBets: async (userId: string) => {
        if (!userId) return;
        try {
          const remoteBets = await betApiService.fetchUserBets(userId);
          if (remoteBets && remoteBets.length > 0) {
            set((state) => {
              const map = new Map<string, BetSlip>();
              // 1. D'abord les coupons distants
              for (const r of remoteBets) {
                map.set(String(r.id), r);
              }
              // 2. Fusionner avec les coupons locaux pour préserver les enrichissements
              for (const loc of state.coupons) {
                const existing = map.get(String(loc.id));
                if (existing) {
                  // Conserver les détails locaux essentiels (pokerResult, événements enrichis, matchTime)
                  map.set(String(loc.id), {
                    ...existing,
                    ...loc,
                    status: existing.status || loc.status,
                    gameCategory: loc.gameCategory || existing.gameCategory,
                    events: (loc.events && loc.events.length > 0) ? loc.events : existing.events,
                    pokerResult: loc.pokerResult || existing.pokerResult,
                    drawNumber: loc.drawNumber || existing.drawNumber,
                    matchTime: loc.matchTime || existing.matchTime,
                    matchDate: loc.matchDate || existing.matchDate,
                  });
                } else {
                  // Garder les coupons locaux non encore enregistrés sur le serveur
                  map.set(String(loc.id), loc);
                }
              }
              return {
                coupons: Array.from(map.values()),
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
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        if (Array.isArray(persistedState?.coupons)) {
          const existingIds = new Set(persistedState.coupons.map((c: BetSlip) => String(c.id)));
          const missingDefaults = INITIAL_COUPONS.filter((c) => !existingIds.has(String(c.id)));
          merged.coupons = [...missingDefaults, ...persistedState.coupons];
        }
        return merged;
      },
    }
  )
);
