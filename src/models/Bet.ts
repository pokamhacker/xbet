export interface IBetItem {
  id: string;
  betId: string;
  sportCategory?: string;
  tournamentName?: string;
  homeTeam: string;
  awayTeam: string;
  prediction: string;
  odds: number;
  status: 'Gain' | 'Perdu' | 'En cours' | 'Accepté';
  finalScore?: string | null;
  eventDate?: Date | string | null;
}

export interface IBet {
  id: string;
  userId: string;
  ticketNumber: string;
  type: 'Simple' | 'Combiné';
  odds: number;
  stake: number;
  potentialGains: number;
  actualGains: number;
  status: 'Accepté' | 'Payé' | 'Gagné' | 'Perdu';
  items: IBetItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
