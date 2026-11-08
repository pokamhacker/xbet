// Espace insécable comme séparateur de milliers (présent dans toutes les polices).
const SEP = ' ';

const group = (digits: string): string => digits.replace(/\B(?=(\d{3})+(?!\d))/g, SEP);

/** Symbole du solde dans Bookmaker Studio (menu, populaire, coupon…). */
export const BALANCE_SYMBOL = '₣';

/** Solde de la barre du haut, au même format que le solde du compte dans l'app : 24 322 344,84 */
export function formatBalance(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Montants du jeu : 600, 1 250, 1 312.5 */
export function formatMoney(n: number): string {
  const v = Math.round(n * 100) / 100;
  if (Number.isInteger(v)) return group(String(v));
  const [int, dec] = v.toFixed(2).split('.');
  return group(int) + '.' + dec.replace(/0$/, '');
}

export const multText = (m: number): string => `x${m}`;

export const percent = (p: number): string => {
  const v = p * 100;
  return (v >= 10 ? Math.round(v) : v >= 1 ? v.toFixed(1) : v.toFixed(2)) + ' %';
};
