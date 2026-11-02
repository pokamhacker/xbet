export type FeatureKey =
  | 'studio_match'       // Studio Match & FIFA
  | 'studio_tv'          // Studio TV & Poker
  | 'studio_mk'          // Studio Mortal Kombat
  | 'game_crash'         // Crash Game (Aviator)
  | 'game_apple'         // Apple of Fortune
  | 'game_royal_feast'   // Royal Feast
  | 'game_kamikaze';     // Kamikaze

export type FeatureCategory = 'STUDIO' | 'GAME';

export interface FeatureAccess {
  key: FeatureKey;
  name: string;
  category: FeatureCategory;
  categoryLabel: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  color: string;
  description: string;
  route: string;
}

export const ALL_FEATURES: FeatureAccess[] = [
  // 1. STUDIOS DE CRÉATION
  {
    key: 'studio_match',
    name: 'Studio Match & FIFA',
    category: 'STUDIO',
    categoryLabel: 'Studio de Création',
    icon: 'football',
    iconFamily: 'Ionicons',
    color: '#38BDF8',
    description: 'Créateur de matchs, cotes et résultats personnalisés',
    route: 'StudioCreation',
  },
  {
    key: 'studio_tv',
    name: 'Studio TV & Poker',
    category: 'STUDIO',
    categoryLabel: 'Studio de Création',
    icon: 'tv-outline',
    iconFamily: 'Ionicons',
    color: '#EAB308',
    description: 'Manches TvBet Poker et tirages en direct',
    route: 'StudioTV',
  },
  {
    key: 'studio_mk',
    name: 'Studio Mortal Kombat',
    category: 'STUDIO',
    categoryLabel: 'Studio de Création',
    icon: 'sword-cross',
    iconFamily: 'MaterialCommunityIcons',
    color: '#A855F7',
    description: 'Combats virtuels, rounds, Brutality et Fatality',
    route: 'StudioMortalKombat',
  },

  // 2. MINI-JEUX
  {
    key: 'game_crash',
    name: 'Crash (Aviator)',
    category: 'GAME',
    categoryLabel: 'Mini-Jeu',
    icon: 'airplane-takeoff',
    iconFamily: 'MaterialCommunityIcons',
    color: '#E86C25',
    description: 'Jeu de multiplicateur avion en temps réel',
    route: 'CrashGame',
  },
  {
    key: 'game_apple',
    name: 'Apple of Fortune',
    category: 'GAME',
    categoryLabel: 'Mini-Jeu',
    icon: 'apple',
    iconFamily: 'MaterialCommunityIcons',
    color: '#22C55E',
    description: 'Paliers de pommes dorées jusqu’à 350x',
    route: 'AppleOfFortune',
  },
  {
    key: 'game_royal_feast',
    name: 'Royal Feast',
    category: 'GAME',
    categoryLabel: 'Mini-Jeu',
    icon: 'restaurant-outline',
    iconFamily: 'Ionicons',
    color: '#F59E0B',
    description: 'Cloches royales et poisons jusqu’à 24x',
    route: 'RoyalFeast',
  },
  {
    key: 'game_kamikaze',
    name: 'Kamikaze',
    category: 'GAME',
    categoryLabel: 'Mini-Jeu',
    icon: 'crosshairs-gps',
    iconFamily: 'MaterialCommunityIcons',
    color: '#EF4444',
    description: 'Avion contre DCA jusqu’à x50',
    route: 'Kamikaze',
  },
];

export const DEFAULT_ALLOWED_FEATURES: FeatureKey[] = ALL_FEATURES.map((f) => f.key);

export const ROUTE_TO_FEATURE_MAP: Record<string, FeatureKey> = {
  StudioCreation: 'studio_match',
  CouponStudio: 'studio_match',
  CouponStudioScreen: 'studio_match',
  MatchStudio: 'studio_match',
  StudioTV: 'studio_tv',
  StudioMortalKombat: 'studio_mk',
  CrashGame: 'game_crash',
  AppleOfFortune: 'game_apple',
  RoyalFeast: 'game_royal_feast',
  Kamikaze: 'game_kamikaze',
};
