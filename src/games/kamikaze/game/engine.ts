/**
 * Logique pure du jeu : aucune dépendance à React Native.
 * Ces fonctions sont couvertes par src/game/engine.test.ts.
 */
import { COLS, LADDER, MAX_BET, MAX_LEVEL, MINES_PER_ROW, MIN_BET, STRIP_ROWS } from './config';

/** Renvoie un entier aléatoire dans [0, n). */
export type Rng = (n: number) => number;

export const roundCents = (v: number): number => Math.round(v * 100) / 100;

export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

/** Coefficient du niveau (1 = ligne du bas). */
export function multiplier(level: number): number {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
    throw new RangeError(`Niveau hors limites : ${level}`);
  }
  return LADDER[level - 1];
}

/** Gain total si le joueur encaisse après avoir réussi `level` niveaux. */
export const payout = (bet: number, level: number): number => roundCents(bet * multiplier(level));

/** Tire les colonnes visées sur une ligne, sans doublon (en excluant optionnellement la colonne du joueur). */
export function drawMines(
  rng: Rng,
  cols: number = COLS,
  count: number = MINES_PER_ROW,
  excludeCol?: number,
): number[] {
  const pool = Array.from({ length: cols }, (_, i) => i).filter(c => c !== excludeCol);
  const out: number[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    out.push(pool.splice(rng(pool.length), 1)[0]);
  }
  return out;
}

/** Probabilité de réussir les `level` premiers niveaux d'affilée. */
export const successProbability = (level: number, cols: number = COLS, mines: number = MINES_PER_ROW): number =>
  Math.pow((cols - mines) / cols, level);

/** La grille défile quand la ligne jouée est la 3e en partant du bas de l'écran. */
export const shouldScroll = (level: number, winStart: number): boolean => level - winStart >= 2;

/** Centre d'une case dans la bande qui défile (origine en haut à gauche de la bande). */
export function cellCenter(col: number, level: number, winStart: number, cell: number): { x: number; y: number } {
  return {
    x: (col + 0.5) * cell,
    y: (STRIP_ROWS - 1 - (level - winStart) + 0.5) * cell,
  };
}

export interface BetCheck {
  value: number;
  error: string | null;
}

/** Valide le montant saisi dans la fenêtre de mise. */
export function validateBet(raw: string, balance: number): BetCheck {
  const digits = raw.replace(/\D/g, '');
  const value = digits ? parseInt(digits, 10) : 0;
  let error: string | null = null;
  if (!digits) error = 'Entrez un montant';
  else if (value < MIN_BET) error = `Mise minimale : ${MIN_BET} XAF`;
  else if (value > MAX_BET) error = `Mise maximale : ${MAX_BET} XAF`;
  else if (value > balance) error = 'Solde insuffisant';
  return { value, error };
}

export interface Layout {
  cell: number;
  pad: number;
  fieldWidth: number;
}

/** Hauteur réservée au titre (60), au bandeau (66), à l'espace (18) et aux boutons (56), hors plateau. */
export const FIXED_HEIGHT = 204;

/** Taille d'une case pour que tout tienne dans la zone de jeu (sous la barre du haut). */
export function computeLayout(width: number, height: number): Layout {
  const pad = Math.round(clamp(width * 0.04, 10, 20));
  const byWidth = (width - 2 * pad - 14) / 5.92;
  const byHeight = (height - FIXED_HEIGHT) / 5;
  const cell = Math.max(34, Math.floor(Math.min(byWidth, byHeight, 84)));
  return { cell, pad, fieldWidth: Math.round(cell * 5.92 + 14) };
}
