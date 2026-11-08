/**
 * Réglages du jeu Kamikaze.
 * Tout ce qui change l'équilibre (coefficients, mises, nombre de cases visées) est ici.
 */

/** Nombre de colonnes de la grille. */
export const COLS = 5;
/** Lignes visibles à l'écran. */
export const VISIBLE_ROWS = 5;
/** Lignes dessinées dans la bande qui défile (5 visibles + 2 qui arrivent par le haut). */
export const STRIP_ROWS = 7;
/** Cases visées par la DCA sur chaque ligne : 1 sur 5 = 80 % de réussite par niveau. */
export const MINES_PER_ROW = 1;

/** Coefficient appliqué à la mise pour chaque niveau réussi (cote max = 10). */
export const LADDER: readonly number[] = [
  1.2, 1.4, 1.6, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10,
];
export const MAX_LEVEL = LADDER.length;

/**
 * Le solde joué est celui du compte de l'application (useBetStore) : des crédits virtuels,
 * aucun argent réel n'est misé ni gagné. Le bouton + de la barre du haut y ajoute TOPUP.
 */
export const TOPUP = 50_000;

export const MIN_BET = 100;
export const MAX_BET = 500_000;
export const DEFAULT_BET = 500;
export const QUICK_BETS: readonly number[] = [200, 800, 2000, 6000, 20000, 70000];

export const STORAGE_KEY = 'kamikaze-jeu-v1';

/** Durées des animations, en millisecondes. */
export const TIMING = {
  tapPause: 220,
  scroll: 420,
  reticle: 300,
  planeDelay: 140,
  flight: 420,
  reticleFade: 300,
  planeExit: 700,
  afterSafe: 380,
  loseHidePlane: 260,
  loseBanner: 260,
  loseEnd: 700,
  maxLevelPause: 300,
  toast: 2600,
} as const;
