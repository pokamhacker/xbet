export type GameMode = 'always_win' | 'classic';

export type GamePhase = 'countdown' | 'flight' | 'crashed';

export type BetPanelState =
  | 'IDLE_DURING_FLIGHT'
  | 'IDLE_COUNTDOWN'
  | 'BET_QUEUED'
  | 'ACTIVE_IN_FLIGHT'
  | 'CASHING_OUT'
  | 'CASHED_OUT';

export interface BotBet {
  id: string;
  name: string;
  bet: number;
  targetMultiplier: number;
  isCashedOut: boolean;
  gain: number;
}

export interface UserBetHistoryItem {
  panelId: 1 | 2;
  stake: number;
  cashedMultiplier?: number;
  gain: number;
  status: 'Payé' | 'Perdu';
}

export interface CrashHistoryRound {
  id: string;
  roundNumber: number;
  crashMultiplier: number;
  timestamp: string;
  userBets?: UserBetHistoryItem[];
}
