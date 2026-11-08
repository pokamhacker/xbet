/**
 * Formate une cote de pari en supprimant les zéros superflus après la virgule.
 * Exemples :
 * - 1.500 -> "1.5"
 * - 1.50  -> "1.5"
 * - 2.000 -> "2"
 * - 2.0   -> "2"
 * - 1.450 -> "1.45"
 * - 1.459 -> "1.459"
 * - "58.00" -> "58"
 */
export function formatCleanOdds(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '1';
  
  const rawStr = String(val).trim().replace(',', '.');
  const num = parseFloat(rawStr);
  
  if (isNaN(num)) {
    return rawStr.replace(/\.?0+$/, '');
  }

  // Arrondi à max 3 décimales significatives (norme des cotes sportives)
  const rounded = Math.round(num * 1000) / 1000;
  
  // Suppression des zéros de fin après la virgule (ex: 2.00 -> 2, 1.50 -> 1.5)
  let result = rounded.toString();
  if (result.includes('.')) {
    result = result.replace(/\.?0+$/, '');
  }
  
  return result || '1';
}

export default formatCleanOdds;
