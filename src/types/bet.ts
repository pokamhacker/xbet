export type BetStatus = 'Accepté' | 'En cours' | 'Payé' | 'Gagné' | 'Gain' | 'Perdu' | 'Annulé' | 'Vendu';
export type BetType = 'Simple' | 'Combiné' | 'Système';

export interface PokerHandDistribution {
  id: number;
  cards: string;
}

export interface PokerRoundResult {
  hands: PokerHandDistribution[];
  board: string;
  winnerLabel: string;
}

export interface MKRoundDetails {
  roundNum: number;
  winner: string;
  victoryType: 'Brutality' | 'Fatality' | 'Normal' | 'Flawless Victory';
}

export interface MKRoundResult {
  rounds: MKRoundDetails[];
  finalWinner: string;
}

export interface MatchEvent {
  id: string;
  sport: string;
  league: string;
  date: string;
  homeTeam: { name: string; logo?: string };
  awayTeam: { name: string; logo?: string };
  prediction: string;
  odd: number;
  actualScore?: string;
  halftimeScore?: string;
  status: BetStatus;
  roundCode?: string;
  badge?: string;
  isLive?: boolean;
  gameCategory?: 'sports' | 'poker' | 'mortalkombat' | 'apple' | 'crash' | 'esports';
  pokerResult?: PokerRoundResult;
  mkResult?: MKRoundResult;
  betId?: string;
  sportCategory?: string;
  tournamentName?: string;
  finalScore?: string;
  eventDate?: string;
}

export interface BetSlip {
  id: string; // 11 digits starting with 85
  userId?: string; // ID utilisateur relié (clé étrangère)
  ticketNumber?: string; // Numéro unique de ticket
  createdAt: string;
  type: BetType;
  eventsCount: number;
  completedCount: number;
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  actualPayout?: number;
  status: BetStatus;
  events: MatchEvent[];
  isForSale?: boolean;
  canSell?: boolean;
  cashoutAmount?: number;
  sellPrice?: number | string;
  shareCode?: string;
  isLive?: boolean;
  gameCategory?: 'sports' | 'poker' | 'mortalkombat' | 'apple' | 'crash' | 'esports';
  drawNumber?: string;
}

export interface CustomLeague {
  id: string;
  name: string;
  sport: string;
  country?: string;
  icon?: string;
}

export interface CustomTeam {
  id: string;
  leagueId: string;
  name: string;
  logo?: string;
}
