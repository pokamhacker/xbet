import { ImageSourcePropType } from 'react-native';

// Import / require des logos depuis le dossier assets
export const combineIcon: ImageSourcePropType = require('../../assets/icons/combine.png');
export const fifaIcon: ImageSourcePropType = require('../../assets/icons/fifa.png');
export const pokerIcon: ImageSourcePropType = require('../../assets/icons/poker.png');
export const tvbetIcon: ImageSourcePropType = require('../../assets/icons/ic_tvbet_gamepad.png');
export const footballIcon: ImageSourcePropType = require('../../assets/icons/football.png');
export const defaultSportsIcon: ImageSourcePropType = require('../../assets/icons/sports_default.png');
export const eventsLayersIcon: ImageSourcePropType = require('../../assets/icons/ic_events_layers.png');
export const mkIcon: ImageSourcePropType = require('../../assets/icons/mortal_kombat_dragon.png');

export type RecognizedSportType = 'poker' | 'fifa' | 'mortalkombat' | 'football';

/**
 * Vérifie si un sport, une ligue, un ticket ou un logo correspond à TVBet / Poker
 */
export const isTvBetOrPokerSport = (categoryOrEvent?: any): boolean => {
  if (!categoryOrEvent) return false;
  if (categoryOrEvent === pokerIcon || categoryOrEvent === tvbetIcon) return true;
  const str = typeof categoryOrEvent === 'string'
    ? categoryOrEvent.toLowerCase()
    : [
        categoryOrEvent.sport,
        categoryOrEvent.league,
        categoryOrEvent.gameCategory,
        categoryOrEvent.sportCategory,
        categoryOrEvent.category,
        categoryOrEvent.badge,
      ].filter(Boolean).join(' ').toLowerCase();

  return str.includes('poker') || str.includes('tvbet') || str.includes('poke');
};

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
    prediction?: string;
    homeTeam?: { name?: string };
    awayTeam?: { name?: string };
  }>;
  [key: string]: any;
}

/**
 * Détecte le sport / type de jeu (poker, fifa, mortalkombat, football) d'un événement
 */
export const getEventGameType = (event?: any): RecognizedSportType => {
  if (!event) return 'football';

  const raw = [
    event.sport,
    event.league,
    event.tournamentName,
    event.sportCategory,
    event.gameCategory,
    event.badge,
    event.prediction,
    event.roundCode,
    event.homeTeam?.name,
    event.awayTeam?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    raw.includes('poker') ||
    raw.includes('tvbet') ||
    raw.includes('carte haute') ||
    raw.includes('main 1') ||
    raw.includes('main 6') ||
    raw.includes('combinaison gagnante') ||
    event.gameCategory === 'poker' ||
    (event.badge && String(event.badge).toUpperCase().includes('POKE'))
  ) {
    return 'poker';
  }

  if (
    raw.includes('fifa') ||
    raw.includes('fc 26') ||
    raw.includes('fc 25') ||
    raw.includes('fc 24') ||
    raw.includes('ea fc') ||
    (event.badge && String(event.badge).toUpperCase().includes('FIFA'))
  ) {
    return 'fifa';
  }

  if (
    raw.includes('mortal') ||
    raw.includes('kombat') ||
    raw.includes('mk1') ||
    raw.includes('mk 11') ||
    event.gameCategory === 'mortalkombat' ||
    (event.badge && String(event.badge).toUpperCase().includes('MK'))
  ) {
    return 'mortalkombat';
  }

  return 'football';
};

/**
 * Retourne la source d'image du logo adapté au sport / jeu
 */
export const getEventSportIcon = (
  event?: any
): { source: ImageSourcePropType; sportType: RecognizedSportType } => {
  const sportType = getEventGameType(event);
  switch (sportType) {
    case 'poker':
      return { source: pokerIcon, sportType };
    case 'fifa':
      return { source: fifaIcon, sportType };
    case 'mortalkombat':
      return { source: mkIcon, sportType };
    case 'football':
    default:
      return { source: footballIcon, sportType: 'football' };
  }
};

/**
 * Détermine quelle icône afficher selon les règles métiers :
 * 1. Si type === 'combiné' ou eventsCount > 1 => Logo Combiné
 * 2. Si pari simple et sport === 'poker' => Logo Poker
 * 3. Si pari simple et sport === 'fifa' => Logo FIFA
 * 4. Si pari simple et sport === 'football' => Logo Football
 */
export const getBetTypeIcon = (bet: BetTicketData): ImageSourcePropType => {
  // 1. Si le coupon concerne TVBet / Poker (même en Combiné, comme sur la capture officielle)
  if (
    isTvBetOrPokerSport(bet) ||
    (Array.isArray(bet?.events) && bet.events.some((e: any) => isTvBetOrPokerSport(e)))
  ) {
    return pokerIcon;
  }

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
  const detected = getEventGameType(firstEvent || bet);
  switch (detected) {
    case 'poker':
      return pokerIcon;
    case 'fifa':
      return fifaIcon;
    case 'mortalkombat':
      return mkIcon;
    case 'football':
    default:
      return footballIcon;
  }
};

export default getBetTypeIcon;
