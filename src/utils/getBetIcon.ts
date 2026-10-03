import { ImageSourcePropType } from 'react-native';

// Import / require des logos depuis le dossier assets
export const combineIcon: ImageSourcePropType = require('../../assets/icons/combine.png');
export const fifaIcon: ImageSourcePropType = require('../../assets/icons/fifa.png');
export const pokerIcon: ImageSourcePropType = require('../../assets/icons/poker.png');
export const footballIcon: ImageSourcePropType = require('../../assets/icons/football.png');
export const defaultSportsIcon: ImageSourcePropType = require('../../assets/icons/sports_default.png');

export interface BetTicketData {
  id?: string;
  type?: 'combiné' | 'simple' | 'accumulator' | string;
  sportCategory?: 'fifa' | 'poker' | 'football' | string;
  category?: string;
  sport?: string;
  league?: string;
  gameCategory?: string;
  eventsCount?: number;
  events?: Array<{
    sport?: string;
    league?: string;
    gameCategory?: string;
    sportCategory?: string;
    badge?: string;
  }>;
  [key: string]: any;
}

/**
 * Détermine quelle icône afficher selon les règles métiers :
 * 1. Si type === 'combiné' ou eventsCount > 1 => Logo Combiné
 * 2. Si pari simple et sport === 'poker' => Logo Poker
 * 3. Si pari simple et sport === 'fifa' => Logo FIFA
 * 4. Si pari simple et sport === 'football' => Logo Football
 */
export const getBetTypeIcon = (bet: BetTicketData): ImageSourcePropType => {
  const betType = (bet?.type || '').toLowerCase();
  const isCombine =
    betType === 'combiné' ||
    betType === 'combine' ||
    betType === 'accumulator' ||
    (typeof bet?.eventsCount === 'number' && bet.eventsCount > 1) ||
    (Array.isArray(bet?.events) && bet.events.length > 1);

  if (isCombine) {
    return combineIcon;
  }

  // Cas Pari Simple : détection selon la catégorie du sport
  const firstEvent = bet?.events?.[0];
  const sport = (
    bet?.sportCategory ||
    bet?.category ||
    bet?.sport ||
    bet?.gameCategory ||
    firstEvent?.sportCategory ||
    firstEvent?.sport ||
    firstEvent?.gameCategory ||
    firstEvent?.league ||
    firstEvent?.badge ||
    ''
  ).toLowerCase();

  if (sport.includes('poker') || sport.includes('tvbet')) {
    return pokerIcon;
  }
  if (
    sport.includes('fifa') ||
    sport.includes('fc 26') ||
    sport.includes('fc 25') ||
    sport.includes('ea fc')
  ) {
    return fifaIcon;
  }
  if (
    sport.includes('football') ||
    sport.includes('soccer') ||
    sport.includes('foot')
  ) {
    return footballIcon;
  }

  return defaultSportsIcon;
};

export default getBetTypeIcon;
