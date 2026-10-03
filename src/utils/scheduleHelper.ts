/**
 * Utilitaires de Programmation des Horaires pour les Matchs et Tirages Studio TVBet
 * Format standard : JJ.MM.AAAA (HH:mm)
 */

export interface ScheduleItem {
  roundNumber: number;
  dateStr: string;     // JJ.MM.AAAA
  timeStr: string;     // HH:mm
  formatted: string;   // JJ.MM.AAAA (HH:mm)
  jsDate: Date;
}

/**
 * Retourne la date courante au format JJ.MM.AAAA
 */
export function getCurrentDateString(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Retourne l'heure courante au format HH:mm
 */
export function getCurrentTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Retourne la date et heure courantes au format JJ.MM.AAAA (HH:mm)
 */
export function getCurrentDateTimeFormatted(date: Date = new Date()): string {
  return `${getCurrentDateString(date)} (${getCurrentTimeString(date)})`;
}

/**
 * Parse une chaîne "JJ.MM.AAAA" et "HH:mm" vers un objet Date natif JavaScript
 */
export function parseDateTime(dateStr: string, timeStr: string): Date {
  try {
    const [day, month, year] = dateStr.split('.').map((n) => parseInt(n, 10));
    const [hours, minutes] = timeStr.split(':').map((n) => parseInt(n, 10));

    const validYear = year || new Date().getFullYear();
    const validMonth = (month || 1) - 1;
    const validDay = day || 1;
    const validHours = hours || 0;
    const validMinutes = minutes || 0;

    return new Date(validYear, validMonth, validDay, validHours, validMinutes, 0, 0);
  } catch (e) {
    return new Date();
  }
}

/**
 * Décompose une chaîne au format "JJ.MM.AAAA (HH:mm)"
 */
export function parseScheduleString(schedule: string): { dateStr: string; timeStr: string; jsDate: Date } {
  const match = schedule.match(/^(\d{2}\.\d{2}\.\d{4})\s*\(([\d]{1,2}:[\d]{2})\)$/);
  if (match) {
    const dateStr = match[1];
    const timeStr = match[2];
    return {
      dateStr,
      timeStr,
      jsDate: parseDateTime(dateStr, timeStr),
    };
  }

  // Fallback si format partiel
  return {
    dateStr: getCurrentDateString(),
    timeStr: getCurrentTimeString(),
    jsDate: new Date(),
  };
}

/**
 * Ajoute un nombre de minutes à une date et heure données
 */
export function addMinutesToSchedule(
  dateStr: string,
  timeStr: string,
  minutesToAdd: number
): { dateStr: string; timeStr: string; formatted: string; jsDate: Date } {
  const baseDate = parseDateTime(dateStr, timeStr);
  const targetDate = new Date(baseDate.getTime() + minutesToAdd * 60 * 1000);

  const newDateStr = getCurrentDateString(targetDate);
  const newTimeStr = getCurrentTimeString(targetDate);

  return {
    dateStr: newDateStr,
    timeStr: newTimeStr,
    formatted: `${newDateStr} (${newTimeStr})`,
    jsDate: targetDate,
  };
}

/**
 * Génère une séquence programmée de manches avec un intervalle précis
 * @param startDate Date de départ (JJ.MM.AAAA)
 * @param startTime Heure de départ (HH:mm)
 * @param intervalMinutes Intervalle en minutes entre chaque manche (ex: 3)
 * @param count Nombre de manches à programmer
 * @param startRoundNumber Numéro de manche initiale (défaut: 1)
 */
export function generateRoundScheduleSequence(
  startDate: string,
  startTime: string,
  intervalMinutes: number,
  count: number,
  startRoundNumber: number = 1
): ScheduleItem[] {
  const results: ScheduleItem[] = [];
  const baseDate = parseDateTime(startDate, startTime);

  for (let i = 0; i < count; i++) {
    const roundDate = new Date(baseDate.getTime() + i * intervalMinutes * 60 * 1000);
    const dStr = getCurrentDateString(roundDate);
    const tStr = getCurrentTimeString(roundDate);

    results.push({
      roundNumber: startRoundNumber + i,
      dateStr: dStr,
      timeStr: tStr,
      formatted: `${dStr} (${tStr})`,
      jsDate: roundDate,
    });
  }

  return results;
}
