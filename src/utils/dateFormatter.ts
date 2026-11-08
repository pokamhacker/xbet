/**
 * Utilitaire de formatage et de normalisation des dates de paris
 * Format strict : JJ.MM.AAAA (HH:mm)
 * Exemple : "03.10.2026 (15:45)"
 */

export interface CombinedDateTimeResult {
  formatted: string;
  isoString: string;
  date: Date;
  toISOString: () => string;
  toString: () => string;
  toJSON: () => string;
}

/**
 * Dictionnaire de correspondance des noms et abréviations de mois (français et anglais)
 */
export const MONTH_NAMES_TO_NUMBERS: Record<string, string> = {
  // Janvier
  janv: '01', 'janv.': '01', janvier: '01', jan: '01', 'jan.': '01', january: '01',
  // Février
  févr: '02', 'févr.': '02', fevr: '02', 'fevr.': '02', février: '02', fevrier: '02', feb: '02', 'feb.': '02', february: '02',
  // Mars
  mars: '03', mar: '03', 'mar.': '03', march: '03',
  // Avril
  avr: '04', 'avr.': '04', avril: '04', apr: '04', 'apr.': '04', april: '04',
  // Mai
  mai: '05', may: '05',
  // Juin
  juin: '06', jun: '06', 'jun.': '06', june: '06',
  // Juillet
  juil: '07', 'juil.': '07', juillet: '07', jul: '07', 'jul.': '07', july: '07',
  // Août
  août: '08', aout: '08', aug: '08', 'aug.': '08', august: '08',
  // Septembre
  sept: '09', 'sept.': '09', septembre: '09', sep: '09', 'sep.': '09', september: '09',
  // Octobre
  oct: '10', 'oct.': '10', octobre: '10', october: '10',
  // Novembre
  nov: '11', 'nov.': '11', novembre: '11', november: '11',
  // Décembre
  déc: '12', 'déc.': '12', dec: '12', 'dec.': '12', décembre: '12', decembre: '12', december: '12',
};

/**
 * Remplace les noms ou abréviations de mois par leur numéro à deux chiffres
 * Ex: "21 oct 2026" -> "21.10.2026"
 * Ex: "21 oct. 2026" -> "21.10.2026"
 * Ex: "21 oct. 2026 (17:25)" -> "21.10.2026 (17:25)"
 * Ex: "21 oct 2026 à 17:25" -> "21.10.2026 (17:25)"
 */
export const replaceMonthNamesWithNumbers = (str?: string | null): string => {
  if (!str || typeof str !== 'string') return '';
  let res = str.trim();

  // Remplacement des dates avec heure séparée par 'à' ou ',' ex: "21 oct 2026 à 17:25"
  res = res.replace(
    /(\b\d{1,2})\s+([a-zà-ÿ\.]+)\s+(\d{2,4})(?:\s*(?:à|,)\s*(\d{1,2}:\d{2}))/gi,
    (match, day, monthName, year, timePart) => {
      const cleanMonth = monthName.toLowerCase().trim();
      const monthNum = MONTH_NAMES_TO_NUMBERS[cleanMonth];
      if (monthNum) {
        const d = day.padStart(2, '0');
        const y = year.length === 2 ? `20${year}` : year;
        return `${d}.${monthNum}.${y} (${timePart})`;
      }
      return match;
    }
  );

  // Remplacement standard : "21 oct 2026" -> "21.10.2026"
  res = res.replace(
    /(\b\d{1,2})\s+([a-zà-ÿ\.]+)\s+(\d{2,4})/gi,
    (match, day, monthName, year) => {
      const cleanMonth = monthName.toLowerCase().trim();
      const monthNum = MONTH_NAMES_TO_NUMBERS[cleanMonth];
      if (monthNum) {
        const d = day.padStart(2, '0');
        const y = year.length === 2 ? `20${year}` : year;
        return `${d}.${monthNum}.${y}`;
      }
      return match;
    }
  );

  return res;
};

/**
 * Combine une date et une heure pour garantir la stricte conservation sans décalage horaire
 * @param dateInput Date au format "JJ.MM.AAAA", "AAAA-MM-JJ", ISO ou objet Date
 * @param timeInput Heure au format "HH:mm"
 */
export const combineDateAndTime = (
  dateInput?: string | Date | number | null,
  timeInput?: string | null
): CombinedDateTimeResult => {
  const now = new Date();
  let day = String(now.getDate()).padStart(2, '0');
  let month = String(now.getMonth() + 1).padStart(2, '0');
  let year = String(now.getFullYear());
  let hours = String(now.getHours()).padStart(2, '0');
  let minutes = String(now.getMinutes()).padStart(2, '0');

  if (typeof dateInput === 'string' && dateInput.trim()) {
    // Normalise d'abord les mois textuels (ex: "21 oct 2026" -> "21.10.2026")
    const trimmed = replaceMonthNamesWithNumbers(dateInput.trim());

    // 1. Détection de l'heure embarquée dans la chaîne (si timeInput n'est pas encore fourni)
    // Ex: "03.10.2026 (15:45)", "2026-10-03T15:45:00", "03/10/2026 15:45", "15:45"
    const embeddedTime = trimmed.match(/(?:^|T|\(|\s+)(\d{1,2}):(\d{2})/);
    if (embeddedTime) {
      hours = embeddedTime[1].padStart(2, '0');
      minutes = embeddedTime[2];
    }

    // 2. Détection de la date
    // Format AAAA-MM-JJ
    const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    // Format JJ.MM.AAAA ou JJ/MM/AAAA
    const dmy = trimmed.match(/^(\d{1,2})[\/\.](\d{1,2})(?:[\/\.](\d{2,4}))?/);

    if (ymd) {
      year = ymd[1];
      month = ymd[2];
      day = ymd[3];
    } else if (dmy) {
      day = dmy[1].padStart(2, '0');
      month = dmy[2].padStart(2, '0');
      if (dmy[3]) {
        year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3];
      }
    }
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    day = String(dateInput.getDate()).padStart(2, '0');
    month = String(dateInput.getMonth() + 1).padStart(2, '0');
    year = String(dateInput.getFullYear());
    hours = String(dateInput.getHours()).padStart(2, '0');
    minutes = String(dateInput.getMinutes()).padStart(2, '0');
  } else if (typeof dateInput === 'number' && !isNaN(dateInput)) {
    const d = new Date(dateInput);
    if (!isNaN(d.getTime())) {
      day = String(d.getDate()).padStart(2, '0');
      month = String(d.getMonth() + 1).padStart(2, '0');
      year = String(d.getFullYear());
      hours = String(d.getHours()).padStart(2, '0');
      minutes = String(d.getMinutes()).padStart(2, '0');
    }
  }

  // 3. Si un timeInput explicite est fourni, il a priorité absolue
  if (typeof timeInput === 'string' && timeInput.trim()) {
    const hm = timeInput.trim().match(/(\d{1,2}):(\d{2})/);
    if (hm) {
      hours = hm[1].padStart(2, '0');
      minutes = hm[2];
    }
  }

  const formatted = `${day}.${month}.${year} (${hours}:${minutes})`;
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
  const jsDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10)
  );

  return {
    formatted,
    isoString,
    date: jsDate,
    toISOString: () => isoString,
    toString: () => formatted,
    toJSON: () => isoString,
  };
};

export const formatBetDate = (dateInput?: any, timeOverride?: string): string => {
  if (!dateInput) return '';

  // 0. Si un timeOverride explicite est passé, combiner immédiatement
  if (typeof timeOverride === 'string' && timeOverride.trim()) {
    return combineDateAndTime(dateInput, timeOverride.trim()).formatted;
  }

  // 1. Objet personnalisé (ex: retour de combineDateAndTime ou MatchEvent / BetSlip)
  if (typeof dateInput === 'object') {
    if (typeof dateInput.formatted === 'string' && dateInput.formatted) {
      return dateInput.formatted;
    }

    // Si l'objet contient matchTime et matchDate ou startDate
    const objTime = dateInput.matchTime || dateInput.time || dateInput.startTime;
    const objDate = dateInput.matchDate || dateInput.date || dateInput.startDate || dateInput.createdAt;
    if (objTime && objDate) {
      return combineDateAndTime(objDate, objTime).formatted;
    }

    if (typeof dateInput.isoString === 'string' && dateInput.isoString) {
      dateInput = dateInput.isoString;
    } else if (typeof dateInput.toISOString === 'function' && !(dateInput instanceof Date)) {
      dateInput = dateInput.toISOString();
    }
  }

  const currentYear = new Date().getFullYear();

  // 2. Si c'est déjà une chaîne
  if (typeof dateInput === 'string') {
    // Normalise d'abord les mois textuels (ex: "21 oct 2026" -> "21.10.2026", "21 oct. 2026 (17:25)" -> "21.10.2026 (17:25)")
    const trimmed = replaceMonthNamesWithNumbers(dateInput.trim());
    if (!trimmed) return '';

    // Cas 1 : Format déjà complet ex: "02.10.2026 (04:13)" ou "02.10.26 (04:13)"
    const fullMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s*\(([\d]{1,2}:[\d]{2})\)$/);
    if (fullMatch) {
      const [_, d, m, y, timePart] = fullMatch;
      const yearFull = y.length === 2 ? `20${y}` : y;
      return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${yearFull} (${timePart})`;
    }

    // Cas 2A : Format ISO avec fuseau UTC 'Z' ou offset explicite ex: "2026-10-03T14:45:00.000Z"
    // Attention : si l'heure UTC est 00:00:00 (minuit), la conversion UTC+1 produit 01:00.
    // On extrait l'heure réelle si présente
    if (trimmed.endsWith('Z') || /[+-]\d{2}(?::?\d{2})?$/.test(trimmed)) {
      // Détecter si l'ISO contient une heure non-nulle
      const isoTimeMatch = trimmed.match(/T(\d{2}):(\d{2})/);
      if (isoTimeMatch && isoTimeMatch[1] === '00' && isoTimeMatch[2] === '00') {
        // C'était une date UTC minuit sans heure utile -> extraire juste la date
        const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (ymd) {
          const now = new Date();
          const curHours = String(now.getHours()).padStart(2, '0');
          const curMinutes = String(now.getMinutes()).padStart(2, '0');
          return `${ymd[3]}.${ymd[2]}.${ymd[1]} (${curHours}:${curMinutes})`;
        }
      }

      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} (${hours}:${minutes})`;
      }
    }

    // Cas 2B : Format ISO strict SANS fuseau UTC ex: "2026-10-03T15:45:00" ou "2026-10-03T15:45"
    // Extraction directe sans conversion pour préserver exactement l'heure saisie
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (isoMatch) {
      const [_, y, m, d, hh, mm] = isoMatch;
      return `${d}.${m}.${y} (${hh}:${mm})`;
    }

    // Cas 3 : Format date SQL "AAAA-MM-JJ HH:mm"
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (ymdMatch) {
      const [_, y, m, d, hh, mm] = ymdMatch;
      return `${d}.${m}.${y} (${hh}:${mm})`;
    }

    // Cas 4 : Format avec slashes ou sans parenthèses ex: "03/10/2026 15:45" ou "03/10/2026 à 15:45"
    const slashMatch = trimmed.match(/^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{2,4})(?:\s*(?:à|,|\()?\s*)(\d{1,2}):(\d{2})\)?$/);
    if (slashMatch) {
      const [_, d, m, y, hh, mm] = slashMatch;
      const yearFull = y.length === 2 ? `20${y}` : y;
      return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${yearFull} (${hh.padStart(2, '0')}:${mm})`;
    }

    // Cas 5 : Format court sans année ex: "02.10 (04:13)" ou "2.10 (4:13)"
    const shortMatch = trimmed.match(/^(\d{1,2}\.\d{1,2})\s*\((.*)\)$/);
    if (shortMatch) {
      const [d, m] = shortMatch[1].split('.');
      return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${currentYear} (${shortMatch[2]})`;
    }

    // Cas 6A : Format date seule sans heure YYYY-MM-DD
    const ymdOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdOnlyMatch) {
      const [_, y, m, d] = ymdOnlyMatch;
      const now = new Date();
      const curHours = String(now.getHours()).padStart(2, '0');
      const curMinutes = String(now.getMinutes()).padStart(2, '0');
      return `${d}.${m}.${y} (${curHours}:${curMinutes})`;
    }

    // Cas 6B : Format date seule sans heure ex: "02.10" ou "02.10.2026"
    const dateOnlyMatch = trimmed.match(/^(\d{1,2})[\/\.](\d{1,2})(?:[\/\.](\d{2,4}))?$/);
    if (dateOnlyMatch) {
      const [_, d, m, y] = dateOnlyMatch;
      const yearFull = y ? (y.length === 2 ? `20${y}` : y) : String(currentYear);
      const now = new Date();
      const curHours = String(now.getHours()).padStart(2, '0');
      const curMinutes = String(now.getMinutes()).padStart(2, '0');
      return `${d.padStart(2, '0')}.${m.padStart(2, '0')}.${yearFull} (${curHours}:${curMinutes})`;
    }
  }

  // Conversion en Date JS (pour Date native ou timestamp numérique)
  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} (${hours}:${minutes})`;
};

/**
 * Noms abrégés des mois en français avec point
 */
export const FRENCH_MONTHS_ABBR: string[] = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
];

/**
 * Formate une date d'événement au format français strict avec mois abrégé :
 * "31 oct. 2026 (21:00)"
 */
export const formatFrenchEventDate = (
  dateInput?: any,
  timeOverride?: string
): string => {
  if (!dateInput) return '31 oct. 2026 (21:00)';

  let rawStr = '';
  let explicitTime = timeOverride?.trim();

  // Si c'est un objet (MatchEvent, BetSlip, Date, etc.)
  if (typeof dateInput === 'object') {
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      const day = String(dateInput.getDate()).padStart(2, '0');
      const mIdx = dateInput.getMonth();
      const year = dateInput.getFullYear();
      const hours = String(dateInput.getHours()).padStart(2, '0');
      const mins = String(dateInput.getMinutes()).padStart(2, '0');
      const time = explicitTime || `${hours}:${mins}`;
      return `${day} ${FRENCH_MONTHS_ABBR[mIdx] || 'oct.'} ${year} (${time})`;
    }
    const objTime = dateInput.matchTime || dateInput.time || dateInput.startTime;
    const objDate =
      dateInput.matchDate ||
      dateInput.date ||
      dateInput.startDate ||
      dateInput.createdAt ||
      dateInput.formatted;
    if (objTime && !explicitTime) {
      explicitTime = String(objTime).trim();
    }
    rawStr = String(objDate || '').trim();
  } else {
    rawStr = String(dateInput).trim();
  }

  if (!rawStr) return '31 oct. 2026 (21:00)';

  // Vérifier si la chaîne contient déjà un mois en français et l'heure entre parenthèses
  const alreadyFormattedMatch = rawStr.match(
    /^(\d{1,2})\s+([a-zà-ÿ\.]+)\s+(\d{4})(?:\s*\(([\d]{1,2}:[\d]{2})\))?/i
  );
  if (alreadyFormattedMatch) {
    const day = alreadyFormattedMatch[1].padStart(2, '0');
    const monthRaw = alreadyFormattedMatch[2].toLowerCase();
    const year = alreadyFormattedMatch[3];
    const time = explicitTime || alreadyFormattedMatch[4] || '21:00';
    let mIdx = FRENCH_MONTHS_ABBR.findIndex((m) => m.startsWith(monthRaw.slice(0, 3)));
    if (mIdx === -1) {
      const numStr = MONTH_NAMES_TO_NUMBERS[monthRaw];
      if (numStr) mIdx = parseInt(numStr, 10) - 1;
    }
    const monthName = mIdx >= 0 && mIdx < 12 ? FRENCH_MONTHS_ABBR[mIdx] : monthRaw;
    return `${day} ${monthName} ${year} (${time})`;
  }

  // Format JJ.MM.AAAA (HH:mm) ou JJ/MM/AAAA (HH:mm)
  const dmyMatch = rawStr.match(
    /(\d{1,2})[\.\/](\d{1,2})(?:[\.\/](\d{2,4}))?(?:\s*\(?(\d{1,2}:\d{2})\)?)?/
  );
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const mNum = parseInt(dmyMatch[2], 10);
    const mIdx = mNum >= 1 && mNum <= 12 ? mNum - 1 : 9; // défaut octobre (index 9)
    let year = dmyMatch[3] || '2026';
    if (year.length === 2) year = `20${year}`;
    const time = explicitTime || dmyMatch[4] || '21:00';
    return `${day} ${FRENCH_MONTHS_ABBR[mIdx]} ${year} (${time})`;
  }

  // Format ISO YYYY-MM-DD
  const ymdMatch = rawStr.match(
    /(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}:\d{2}))?/
  );
  if (ymdMatch) {
    const year = ymdMatch[1];
    const mNum = parseInt(ymdMatch[2], 10);
    const mIdx = mNum >= 1 && mNum <= 12 ? mNum - 1 : 9;
    const day = ymdMatch[3].padStart(2, '0');
    const time = explicitTime || ymdMatch[4] || '21:00';
    return `${day} ${FRENCH_MONTHS_ABBR[mIdx]} ${year} (${time})`;
  }

  return rawStr;
};

/**
 * Formate le titre d'un événement football au format pixel-perfect :
 * "Football . [Pays]. [Compétition]" (ex: "Football . Angleterre. Premier League")
 */
export const formatFootballHeader = (
  sport?: string,
  league?: string,
  country?: string
): string => {
  const sportName =
    sport && sport.toLowerCase() !== 'football' && sport.toLowerCase() !== 'soccer'
      ? sport
      : 'Football';

  let cleanLeague = (league || 'Angleterre. Premier League').trim();

  // Si cleanLeague commence déjà par le nom du sport (ex: "Football . Angleterre..."), le nettoyer
  cleanLeague = cleanLeague.replace(/^(?:football|fifa|tvbet|poker)\s*[\.\-·:]\s*/i, '').trim();

  // Nettoyer les tirets et puces
  cleanLeague = cleanLeague
    .replace(/\s*-\s*/g, '. ')
    .replace(/\s*·\s*/g, '. ')
    .replace(/\s*:\s*/g, '. ')
    .trim();

  // Si la ligue ne contient pas encore de point (ex: "Premier League")
  if (!cleanLeague.includes('.') && country) {
    cleanLeague = `${country}. ${cleanLeague}`;
  } else if (!cleanLeague.includes('.')) {
    const lower = cleanLeague.toLowerCase();
    if (lower.includes('premier league')) {
      cleanLeague = `Angleterre. ${cleanLeague}`;
    } else if (lower.includes('laliga') || lower.includes('la liga')) {
      cleanLeague = `Espagne. ${cleanLeague}`;
    } else if (lower.includes('serie a')) {
      cleanLeague = `Italie. ${cleanLeague}`;
    } else if (lower.includes('bundesliga')) {
      cleanLeague = `Allemagne. ${cleanLeague}`;
    } else if (lower.includes('ligue 1')) {
      cleanLeague = `France. ${cleanLeague}`;
    } else if (lower.includes('champions league') || lower.includes('ligue des champions')) {
      cleanLeague = `Europe. ${cleanLeague}`;
    } else if (lower.includes('europa league')) {
      cleanLeague = `Europe. ${cleanLeague}`;
    }
  }

  // Normaliser les espaces après les points internes (ex: "Angleterre.Premier League" -> "Angleterre. Premier League")
  cleanLeague = cleanLeague.replace(/\.([^\s])/g, '. $1');

  return `${sportName} . ${cleanLeague}`;
};

/**
 * Extrait la date et l'heure de début d'un événement sous forme d'objet Date JS
 * Prend en charge les formats :
 * - "31 oct. 2026 (23:35)"
 * - "31.10.2026 (23:35)"
 * - "2026-10-31T23:35:00"
 * - Objets Date JS, timestamp numérique ou objets MatchEvent / BetDetailEvent
 */
export const getEventStartTime = (
  eventOrDate?: any,
  timeOverride?: string
): Date | null => {
  if (!eventOrDate) return null;

  // 1. Si c'est déjà un objet Date valide
  if (eventOrDate instanceof Date && !isNaN(eventOrDate.getTime())) {
    return eventOrDate;
  }

  // 2. Si c'est un timestamp numérique
  if (typeof eventOrDate === 'number' && !isNaN(eventOrDate)) {
    const d = new Date(eventOrDate);
    return isNaN(d.getTime()) ? null : d;
  }

  // 3. Si c'est un objet événement (MatchEvent, BetDetailEvent, BetSlip)
  if (typeof eventOrDate === 'object') {
    if (eventOrDate.date instanceof Date && !isNaN(eventOrDate.date.getTime())) {
      return eventOrDate.date;
    }

    const explicitTime =
      timeOverride?.trim() ||
      eventOrDate.matchTime ||
      eventOrDate.time ||
      eventOrDate.startTime;

    const rawDate =
      eventOrDate.startDate ||
      eventOrDate.rawDate ||
      eventOrDate.matchDate ||
      eventOrDate.date ||
      eventOrDate.createdAt ||
      eventOrDate.formatted;

    if (rawDate) {
      const res = combineDateAndTime(rawDate, explicitTime);
      if (res && res.date && !isNaN(res.date.getTime())) {
        return res.date;
      }
    }
    return null;
  }

  // 4. Si c'est une chaîne directe
  if (typeof eventOrDate === 'string' && eventOrDate.trim()) {
    const res = combineDateAndTime(eventOrDate, timeOverride);
    if (res && res.date && !isNaN(res.date.getTime())) {
      return res.date;
    }
  }

  return null;
};

/**
 * Calcule la durée réglementaire d'un événement en secondes selon le sport et la compétition
 */
export const getEventDurationSeconds = (event?: any): number => {
  if (!event) return 5400; // Par défaut Football standard : 90 min = 5400s

  // Durée explicite passée sur l'objet
  const customDur = event.durationSeconds ?? event.duration ?? event.matchDuration;
  if (typeof customDur === 'number' && customDur > 0) {
    // Si la durée est inférieure ou égale à 120, elle est exprimée en minutes (ex: 6 pour 6 min)
    return customDur <= 120 ? customDur * 60 : customDur;
  }

  const sportUpper = String(event.sport || '').toUpperCase();
  const leagueUpper = String(event.league || '').toUpperCase();
  const gameCat = String(event.gameCategory || '').toLowerCase();
  const allText = `${sportUpper} ${leagueUpper} ${gameCat}`;

  // 1. TvBet / POKER
  if (allText.includes('POKER') || allText.includes('TVBET')) {
    return 300; // 5 minutes pour un tour de TvBet Poker
  }

  // 2. FIFA (eSports)
  if (
    allText.includes('FIFA') ||
    allText.includes('FC 25') ||
    allText.includes('FC 26') ||
    allText.includes('FC25') ||
    allText.includes('FC26') ||
    Boolean(event.isFifa)
  ) {
    if (allText.includes('3X3') || allText.includes('RUSH')) {
      return 366; // 06:06 comme sur la capture officielle de fin de match FIFA
    }
    if (allText.includes('4X4')) {
      return 366; // 06:06
    }
    if (allText.includes('5X5')) {
      return 366; // 06:06
    }
    return 366; // 06:06 par défaut pour FIFA
  }

  // 3. Basketball
  if (allText.includes('BASKET') || allText.includes('NBA')) {
    return 2880; // 48 minutes (NBA) ou 2400s pour FIBA
  }

  // 4. Hockey sur glace
  if (allText.includes('HOCKEY') || allText.includes('NHL')) {
    return 3600; // 60 minutes
  }

  // 5. Tennis
  if (allText.includes('TENNIS') || allText.includes('ATP') || allText.includes('WTA')) {
    return 7200; // 2 heures (120 minutes)
  }

  // 6. Football / Soccer standard par défaut
  return 5400; // 90 minutes = 5400 secondes
};

/**
 * Formate un nombre de secondes en format MM:SS (ex: 0 -> "00:00", 195 -> "03:15")
 */
export const formatSecondsToMMSS = (totalSeconds: number): string => {
  if (!totalSeconds || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export interface EventLiveProgress {
  hasStarted: boolean;
  isFinished: boolean;
  isLive: boolean;
  elapsedSeconds: number;
  formattedElapsed: string;
  startTime: Date | null;
  durationSeconds: number;
}

/**
 * Calcule l'état d'avancement en direct d'un événement selon son heure de début et sa durée
 */
export const getEventLiveProgress = (
  event: any,
  nowTimestamp?: number
): EventLiveProgress => {
  const now = typeof nowTimestamp === 'number' ? nowTimestamp : Date.now();
  const durationSeconds = getEventDurationSeconds(event);
  const statusStr = String(event?.status || '').trim();
  const isResolved = [
    'Gain',
    'Perte',
    'Payé',
    'Perdu',
    'Gagné',
    'gagne',
    'perdu',
    'rembourse',
    'Remboursé',
    'Vendu',
    'vendu',
  ].includes(statusStr);

  const startTime = getEventStartTime(event);

  // État C prioritaire : Si l'événement est déjà résolu (Gain / Payé / Perte / Perdu)
  if (isResolved) {
    return {
      hasStarted: true,
      isFinished: true,
      isLive: false,
      elapsedSeconds: durationSeconds,
      formattedElapsed: formatSecondsToMMSS(durationSeconds),
      startTime,
      durationSeconds,
    };
  }

  // Si l'événement possède une heure de début programmée (startTime) :
  // Machine à États Temporelle stricte : PRE_MATCH -> LIVE -> FINISHED
  if (startTime) {
    const diffSec = Math.floor((now - startTime.getTime()) / 1000);

    // État A — AVANT LE DÉBUT DE L'ÉVÉNEMENT (now < startTime)
    // Interdiction d'afficher un score, le badge En direct ou un temps écoulé avant startTime
    if (diffSec < 0) {
      return {
        hasStarted: false,
        isFinished: false,
        isLive: false,
        elapsedSeconds: 0,
        formattedElapsed: '00:00',
        startTime,
        durationSeconds,
      };
    }

    // État C — QUAND L'ÉVÉNEMENT A DÉPASSÉ SA DURÉE RÉGLEMENTAIRE (diffSec >= durationSeconds)
    if (diffSec >= durationSeconds) {
      return {
        hasStarted: true,
        isFinished: true,
        isLive: false,
        elapsedSeconds: durationSeconds,
        formattedElapsed: formatSecondsToMMSS(durationSeconds),
        startTime,
        durationSeconds,
      };
    }

    // État B — AU DÉBUT ET PENDANT L'ÉVÉNEMENT (0 <= diffSec < durationSeconds)
    // Si un temps écoulé personnalisé a été explicitement saisi par l'utilisateur pour un match déjà en cours
    const hasCustomElapsed =
      Boolean(event?.hasCustomElapsed) &&
      typeof event?.elapsedSeconds === 'number' &&
      event.elapsedSeconds > 0;

    if (hasCustomElapsed) {
      const baseTs = typeof event?.liveStartedAt === 'number' ? event.liveStartedAt : startTime.getTime();
      const tickDelta = Math.max(0, Math.floor((now - baseTs) / 1000));
      const currentElapsed = Math.min(durationSeconds - 1, event.elapsedSeconds + tickDelta);
      return {
        hasStarted: true,
        isFinished: false,
        isLive: true,
        elapsedSeconds: currentElapsed,
        formattedElapsed: formatSecondsToMMSS(currentElapsed),
        startTime,
        durationSeconds,
      };
    }

    // Sinon, démarre exactement à 00:00 à startTime et s'incrémente seconde par seconde
    return {
      hasStarted: true,
      isFinished: false,
      isLive: true,
      elapsedSeconds: diffSec,
      formattedElapsed: formatSecondsToMMSS(diffSec),
      startTime,
      durationSeconds,
    };
  }

  // Fallback uniquement si aucune heure de début (startTime === null) n'est présente sur l'événement
  if (event?.isLive) {
    const explicitSec =
      typeof event.elapsedSeconds === 'number' && event.elapsedSeconds >= 0
        ? event.elapsedSeconds
        : 0;
    const baseTs = typeof event?.liveStartedAt === 'number' ? event.liveStartedAt : now;
    const tickDelta = Math.max(0, Math.floor((now - baseTs) / 1000));
    const currentElapsed = Math.min(durationSeconds - 1, explicitSec + tickDelta);
    return {
      hasStarted: true,
      isFinished: false,
      isLive: true,
      elapsedSeconds: currentElapsed,
      formattedElapsed: formatSecondsToMMSS(currentElapsed),
      startTime: null,
      durationSeconds,
    };
  }

  return {
    hasStarted: false,
    isFinished: false,
    isLive: false,
    elapsedSeconds: 0,
    formattedElapsed: '00:00',
    startTime: null,
    durationSeconds,
  };
};

export default formatBetDate;
