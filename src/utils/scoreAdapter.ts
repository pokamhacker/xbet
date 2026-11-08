import { MatchEvent, BetStatus, PokerRoundResult, MKRoundResult } from '../types/bet';
import { generateRealisticPokerDraw } from './pokerEngine';
import { combineDateAndTime, getEventDurationSeconds, getEventLiveProgress } from './dateFormatter';

export interface AdaptedEventResult {
  actualScore: string;
  halftimeScore?: string;
  status: BetStatus;
  pokerResult?: PokerRoundResult;
  mkResult?: MKRoundResult;
}

export type BetPeriodKey = 'regular' | 'first_half' | 'second_half';

/**
 * Formate l'intitulé d'un pronostic selon la nomenclature officielle :
 * - 1X2 -> "1X2. V1", "1X2. X", "1X2. V2"
 * - Total -> "Total. (14.5) Plus de", "Total. (2.5) Moins de"
 * - Total 1 / Total 2 -> "Total 1. (7.5) Plus de", "Total 2. (5.5) Moins de"
 * - Suffixe mi-temps si applicable : "1X2. V2. 1ère mi-temps", "Total. (7.5) Moins de. 2ème mi-temps"
 */
export function formatBetSelectionLabel(params: {
  period?: BetPeriodKey | string;
  marketTitle: string;
  optionLabel: string;
}): string {
  const { period = 'regular', marketTitle, optionLabel } = params;
  const pLower = String(period || 'regular').toLowerCase().trim();
  const periodSuffix =
    pLower === 'first_half' || pLower.includes('1ère') || pLower.includes('1ere')
      ? '. 1ère mi-temps'
      : pLower === 'second_half' || pLower.includes('2ème') || pLower.includes('2eme')
      ? '. 2ème mi-temps'
      : '';

  const mTitle = (marketTitle || '').trim();
  const mUpper = mTitle.toUpperCase();
  const opt = (optionLabel || '').trim();
  const optUpper = opt.toUpperCase();

  // 1. Marché 1X2
  if (mUpper === '1X2') {
    if (optUpper === '1' || optUpper === 'V1' || optUpper.includes('DOMICILE') || optUpper.includes('ÉQUIPE 1')) {
      return `1X2. V1${periodSuffix}`;
    }
    if (optUpper === 'X' || optUpper === 'N' || optUpper.includes('NUL')) {
      return `1X2. X${periodSuffix}`;
    }
    if (optUpper === '2' || optUpper === 'V2' || optUpper.includes('EXTÉRIEUR') || optUpper.includes('ÉQUIPE 2')) {
      return `1X2. V2${periodSuffix}`;
    }
    return `1X2. ${opt}${periodSuffix}`;
  }

  // 2. Marchés Total / Total 1 / Total 2
  if (mUpper === 'TOTAL' || mUpper === 'TOTAL 1' || mUpper === 'TOTAL 2') {
    const canonMarket = mUpper === 'TOTAL 1' ? 'Total 1' : mUpper === 'TOTAL 2' ? 'Total 2' : 'Total';
    // Déjà au format "(14.5) Plus de" ou "(2.5) Moins de"
    const parenFirst = opt.match(/^\(\s*(\d+(?:\.\d+)?)\s*\)\s*(Plus de|Moins de)/i);
    if (parenFirst) {
      const val = parenFirst[1];
      const dir = parenFirst[2].toLowerCase().includes('plus') ? 'Plus de' : 'Moins de';
      return `${canonMarket}. (${val}) ${dir}${periodSuffix}`;
    }
    // Format inverse "Plus de (2.5)" ou "Plus de 2.5"
    const dirFirst = opt.match(/(Plus de|Moins de)\s*\(?(\d+(?:\.\d+)?)\)?/i);
    if (dirFirst) {
      const dir = dirFirst[1].toLowerCase().includes('plus') ? 'Plus de' : 'Moins de';
      const val = dirFirst[2];
      return `${canonMarket}. (${val}) ${dir}${periodSuffix}`;
    }
    return `${canonMarket}. ${opt}${periodSuffix}`;
  }

  // 3. Double chance
  if (mUpper === 'DOUBLE CHANCE' || mUpper === 'DOUBLE_CHANCE') {
    return `Double chance. ${opt}${periodSuffix}`;
  }

  // 4. Deux équipes vont marquer
  if (mUpper.includes('DEUX ÉQUIPES VONT MARQUER') || mUpper.includes('DEUX EQUIPES VONT MARQUER')) {
    if (opt.toLowerCase().startsWith('chaque equipe va marquer') || opt.toLowerCase().startsWith('chaque équipe va marquer')) {
      return `${opt}${periodSuffix}`;
    }
    return `Deux équipes vont marquer - ${opt}${periodSuffix}`;
  }

  // 5. Total pair
  if (mUpper === 'TOTAL PAIR' || mUpper === 'TOTAL_PAIR') {
    return `Total pair. ${opt}${periodSuffix}`;
  }

  // 6. Marchés mi-temps spécifiques (Equipe 1/2 va gagner au moins une mi-temps / les deux mi-temps)
  if (
    mUpper.includes('GAGNER AU MOINS UNE MI-TEMPS') ||
    mUpper.includes('GAGNER LES DEUX MI-TEMPS')
  ) {
    return `${mTitle} - ${opt}`;
  }

  // 7. Score dans chaque mi-temps
  if (mUpper.includes('SCORE DANS CHAQUE MI-TEMPS')) {
    return `Score dans chaque mi-temps. ${opt}`;
  }

  return `${mTitle}. ${opt}${periodSuffix}`;
}

/**
 * Normalise n'importe quel intitulé de pronostic (y compris les anciens coupons enregistrés)
 * vers la nomenclature stricte :
 * - "Vainqueur : Real Madrid" -> "1X2. V1" ou "1X2. V2"
 * - "1ère mi-temps. 1X2. V2" -> "1X2. V2. 1ère mi-temps"
 * - "Match nul (X)" -> "1X2. X"
 * - "Plus de 2.5 buts" / "Total. Plus de (2.5)" -> "Total. (2.5) Plus de"
 * - "Total 1. Plus de (6.5)" -> "Total 1. (6.5) Plus de"
 */
export function normalizeBetSelectionLabel(
  rawPrediction?: string,
  homeTeamName?: string,
  awayTeamName?: string
): string {
  if (!rawPrediction) return '1X2. V1';
  let trimmed = rawPrediction.trim();
  if (!trimmed) return '1X2. V1';

  // Extraire un éventuel préfixe ou suffixe de période
  let periodSuffix = '';
  if (/^1[èe]re\s*mi-temps[\s\.:,-]+/i.test(trimmed)) {
    periodSuffix = '. 1ère mi-temps';
    trimmed = trimmed.replace(/^1[èe]re\s*mi-temps[\s\.:,-]+/i, '').trim();
  } else if (/^2[èe]me\s*mi-temps[\s\.:,-]+/i.test(trimmed)) {
    periodSuffix = '. 2ème mi-temps';
    trimmed = trimmed.replace(/^2[èe]me\s*mi-temps[\s\.:,-]+/i, '').trim();
  } else if (/^temps\s*r[ée]glementaire[\s\.,:-]+/i.test(trimmed)) {
    trimmed = trimmed.replace(/^temps\s*r[ée]glementaire[\s\.,:-]+/i, '').trim();
  }

  if (/[\s\.:,-]+1[èe]re\s*mi-temps[\s\.:,-]*$/i.test(trimmed)) {
    periodSuffix = '. 1ère mi-temps';
    trimmed = trimmed.replace(/[\s\.:,-]+1[èe]re\s*mi-temps[\s\.:,-]*$/i, '').trim();
  } else if (/[\s\.:,-]+2[èe]me\s*mi-temps[\s\.:,-]*$/i.test(trimmed)) {
    periodSuffix = '. 2ème mi-temps';
    trimmed = trimmed.replace(/[\s\.:,-]+2[èe]me\s*mi-temps[\s\.:,-]*$/i, '').trim();
  }

  const lower = trimmed.toLowerCase();
  const homeLower = (homeTeamName || '').trim().toLowerCase();
  const awayLower = (awayTeamName || '').trim().toLowerCase();

  // 1. Anciens intitulés "Vainqueur : [Équipe]" ou "1X2: V1"
  if (lower.startsWith('vainqueur')) {
    const teamPart = trimmed.replace(/^vainqueur\s*:\s*/i, '').trim().toLowerCase();
    if (awayLower && (teamPart === awayLower || teamPart.includes(awayLower) || awayLower.includes(teamPart))) {
      return `1X2. V2${periodSuffix}`;
    }
    return `1X2. V1${periodSuffix}`;
  }

  if (
    lower === 'match nul (x)' ||
    lower === 'match nul' ||
    lower === 'nul (x)' ||
    lower === '1x2: x' ||
    lower === '1x2. x' ||
    lower === 'x'
  ) {
    return `1X2. X${periodSuffix}`;
  }

  if (lower === '1x2: v1' || lower === '1x2: 1' || lower === '1x2. 1' || lower === '1x2. v1' || lower === 'v1') {
    return `1X2. V1${periodSuffix}`;
  }

  if (lower === '1x2: v2' || lower === '1x2: 2' || lower === '1x2. 2' || lower === '1x2. v2' || lower === 'v2') {
    return `1X2. V2${periodSuffix}`;
  }

  // 2. Anciens intitulés Double chance "1X (Domicile ou Nul)"
  if (/^1x\s*\(/i.test(trimmed) || lower === 'double chance: 1x' || lower === 'double chance. 1x') {
    return `Double chance. 1X${periodSuffix}`;
  }
  if (/^12\s*\(/i.test(trimmed) || lower === 'double chance: 12' || lower === 'double chance. 12') {
    return `Double chance. 12${periodSuffix}`;
  }
  if (/^(?:x2|2x)\s*\(/i.test(trimmed) || lower === 'double chance: 2x' || lower === 'double chance: x2' || lower === 'double chance. 2x') {
    return `Double chance. 2X${periodSuffix}`;
  }

  // 3. Normalisation des Totaux :
  // "Total. Plus de (2.5)", "Total: (14.5) Plus de", "Plus de 2.5 buts", "Moins de 2.5 buts"
  const total1Match =
    trimmed.match(/^total\s*1[\s\.:]+(?:(plus\s*de|moins\s*de)\s*\(?(\d+(?:\.\d+)?)\)?|\(?(\d+(?:\.\d+)?)\)?\s*(plus\s*de|moins\s*de))/i);
  if (total1Match) {
    const dirRaw = total1Match[1] || total1Match[4] || 'Plus de';
    const val = total1Match[2] || total1Match[3] || '1.5';
    const dir = dirRaw.toLowerCase().includes('moins') ? 'Moins de' : 'Plus de';
    return `Total 1. (${val}) ${dir}${periodSuffix}`;
  }

  const total2Match =
    trimmed.match(/^total\s*2[\s\.:]+(?:(plus\s*de|moins\s*de)\s*\(?(\d+(?:\.\d+)?)\)?|\(?(\d+(?:\.\d+)?)\)?\s*(plus\s*de|moins\s*de))/i);
  if (total2Match) {
    const dirRaw = total2Match[1] || total2Match[4] || 'Plus de';
    const val = total2Match[2] || total2Match[3] || '1.5';
    const dir = dirRaw.toLowerCase().includes('moins') ? 'Moins de' : 'Plus de';
    return `Total 2. (${val}) ${dir}${periodSuffix}`;
  }

  const totalGlobalMatch =
    trimmed.match(/^total[\s\.:]+(?:(plus\s*de|moins\s*de)\s*\(?(\d+(?:\.\d+)?)\)?|\(?(\d+(?:\.\d+)?)\)?\s*(plus\s*de|moins\s*de))/i) ||
    trimmed.match(/^(plus\s*de|moins\s*de)\s*\(?(\d+(?:\.\d+)?)\)?(?:\s*buts)?$/i);
  if (totalGlobalMatch) {
    const dirRaw = totalGlobalMatch[1] || totalGlobalMatch[4] || 'Plus de';
    const val = totalGlobalMatch[2] || totalGlobalMatch[3] || '2.5';
    const dir = dirRaw.toLowerCase().includes('moins') ? 'Moins de' : 'Plus de';
    return `Total. (${val}) ${dir}${periodSuffix}`;
  }

  // 4. Normalisation générique des ":" après le nom de marché FIFA
  if (trimmed.includes(': ') && !trimmed.toLowerCase().startsWith('score exact')) {
    const [mPart, oPart] = trimmed.split(/:\s+/);
    if (mPart && oPart) {
      return formatBetSelectionLabel({
        period: periodSuffix ? (periodSuffix.includes('1') ? 'first_half' : 'second_half') : 'regular',
        marketTitle: mPart,
        optionLabel: oPart,
      });
    }
  }

  return `${trimmed}${periodSuffix}`;
}

/**
 * Analyse la prédiction choisie au départ pour un événement
 * et génère le score et résultat réaliste correspondant (100% cohérent avec la période et le marché).
 */
export function adaptEventResultToPrediction(
  event: MatchEvent,
  isWin: boolean = true
): AdaptedEventResult {
  const status: BetStatus = isWin ? 'Gain' : 'Perdu';
  const homeName = event.homeTeam?.name || 'Équipe 1';
  const awayName = event.awayTeam?.name || 'Équipe 2';
  const prediction = normalizeBetSelectionLabel(event.prediction, homeName, awayName);
  const lowerPred = prediction.toLowerCase();
  const isFifa = isFifaMatch(event);

  // Détection de la période ciblée (1ère mi-temps, 2ème mi-temps, ou Temps réglementaire)
  const isFirstHalfBet =
    /^1[èe]re\s*mi-temps/i.test(prediction) ||
    /[\s\.:,-]+1[èe]re\s*mi-temps$/i.test(prediction);
  const isSecondHalfBet =
    /^2[èe]me\s*mi-temps/i.test(prediction) ||
    /[\s\.:,-]+2[èe]me\s*mi-temps$/i.test(prediction);
  const corePred = prediction
    .replace(/^(?:1[èe]re|2[èe]me)\s*mi-temps[\s\.:,-]+/i, '')
    .replace(/[\s\.:,-]+(?:1[èe]re|2[èe]me)\s*mi-temps$/i, '')
    .trim();
  const lowerCore = corePred.toLowerCase();

  // 1. CAS POKER (TVBet / Poker Hold'em)
  const isPoker =
    event.gameCategory === 'poker' ||
    (event.league && event.league.toUpperCase().includes('POKER')) ||
    (event.sport && event.sport.toUpperCase().includes('POKER')) ||
    lowerPred.includes('combinaison gagnante') ||
    lowerPred.includes('carte haute') ||
    lowerPred.includes('quinte');

  if (isPoker) {
    let combo = 'Carte haute';
    if (lowerPred.includes('quinte flush royale')) combo = 'Quinte flush royale';
    else if (lowerPred.includes('quinte flush')) combo = 'Quinte flush';
    else if (lowerPred.includes('carré') || lowerPred.includes('carre')) combo = 'Carré';
    else if (lowerPred.includes('full')) combo = 'Full';
    else if (lowerPred.includes('couleur')) combo = 'Couleur';
    else if (lowerPred.includes('quinte')) combo = 'Quinte';
    else if (lowerPred.includes('brelan')) combo = 'Brelan';
    else if (lowerPred.includes('double paire')) combo = 'Double paire';
    else if (lowerPred.includes('paire')) combo = 'Paire';

    const winningHand = isWin ? 1 : 2;
    const finalCombo = isWin ? combo : 'Carte haute';

    return {
      actualScore: isWin ? '1 - 0' : '0 - 1',
      status,
      pokerResult: generateRealisticPokerDraw(winningHand, finalCombo),
    };
  }

  // 2. CAS MORTAL KOMBAT
  const isMortalKombat =
    event.gameCategory === 'mortalkombat' ||
    (event.league && event.league.toUpperCase().includes('MORTAL KOMBAT')) ||
    (event.sport && event.sport.toUpperCase().includes('MORTAL KOMBAT'));

  if (isMortalKombat) {
    const betOnAway = lowerPred.includes('v2') || lowerPred.includes('2') || lowerPred.includes(awayName.toLowerCase());
    const predictedWinner = betOnAway ? awayName : homeName;
    const oppositeFighter = betOnAway ? homeName : awayName;
    const winner = isWin ? predictedWinner : oppositeFighter;

    return {
      actualScore: isWin ? (betOnAway ? '1-2' : '2-1') : (betOnAway ? '2-1' : '1-2'),
      status,
      mkResult: {
        rounds: [
          { roundNum: 1, winner, victoryType: 'Brutality' },
          { roundNum: 2, winner: oppositeFighter, victoryType: 'Normal' },
          { roundNum: 3, winner, victoryType: 'Fatality' },
        ],
        finalWinner: winner,
      },
    };
  }

  // Helper pour construire l'objet AdaptedEventResult à partir des scores de 1ère et 2ème mi-temps
  const buildFromHalves = (h1: number, a1: number, h2: number, a2: number): AdaptedEventResult => {
    const totalH = h1 + h2;
    const totalA = a1 + a2;
    return {
      actualScore: `${totalH}:${totalA}`,
      halftimeScore: `${totalH}:${totalA} (${h1}:${a1},${h2}:${a2})`,
      status,
    };
  };

  // 3. CAS SCORE EXACT
  const exactScoreMatch =
    corePred.match(/(?:score\s*exact[^\d]*|^)(\d+)\s*[-:–]\s*(\d+)/i) ||
    corePred.match(/^(\d+)\s*[-:–]\s*(\d+)$/);

  if (exactScoreMatch) {
    const h = parseInt(exactScoreMatch[1], 10);
    const a = parseInt(exactScoreMatch[2], 10);

    if (isWin) {
      if (isFirstHalfBet) {
        return buildFromHalves(h, a, isFifa ? 3 : 1, isFifa ? 2 : 0);
      }
      if (isSecondHalfBet) {
        return buildFromHalves(isFifa ? 3 : 1, isFifa ? 2 : 0, h, a);
      }
      const h1 = Math.floor(h / 2);
      const h2 = h - h1;
      const a1 = Math.floor(a / 2);
      const a2 = a - a1;
      return buildFromHalves(h1, a1, h2, a2);
    } else {
      const falseH = h === 0 ? 1 : Math.max(0, h - 1);
      const falseA = a === 0 ? 2 : a + 1;
      return buildFromHalves(Math.floor(falseH / 2), Math.floor(falseA / 2), Math.ceil(falseH / 2), Math.ceil(falseA / 2));
    }
  }

  // 4. CAS MARCHÉS SPÉCIAUX MI-TEMPS (Score dans chaque mi-temps, Equipe 1/2 va gagner au moins une / les deux mi-temps)
  if (lowerCore.includes('score dans chaque mi-temps')) {
    if (lowerCore.includes('1 > 2') || lowerCore.includes('1>2') || lowerCore.includes('1ère > 2ème')) {
      return isWin
        ? (isFifa ? buildFromHalves(5, 3, 2, 2) : buildFromHalves(2, 1, 1, 0))
        : (isFifa ? buildFromHalves(2, 2, 5, 3) : buildFromHalves(0, 1, 2, 1));
    }
    if (lowerCore.includes('1 = 2') || lowerCore.includes('1=2') || lowerCore.includes('1ère = 2ème')) {
      return isWin
        ? (isFifa ? buildFromHalves(4, 2, 3, 3) : buildFromHalves(1, 0, 1, 0))
        : (isFifa ? buildFromHalves(5, 2, 2, 2) : buildFromHalves(2, 0, 0, 1));
    }
    // 1 < 2
    return isWin
      ? (isFifa ? buildFromHalves(2, 2, 5, 3) : buildFromHalves(0, 1, 2, 1))
      : (isFifa ? buildFromHalves(5, 3, 2, 1) : buildFromHalves(2, 1, 0, 0));
  }

  if (lowerCore.includes('equipe 1 va gagner les deux mi-temps')) {
    const wantsYes = !lowerCore.includes('non');
    const winBoth = wantsYes ? isWin : !isWin;
    return winBoth
      ? (isFifa ? buildFromHalves(5, 2, 4, 2) : buildFromHalves(1, 0, 2, 0))
      : (isFifa ? buildFromHalves(3, 3, 4, 2) : buildFromHalves(0, 0, 1, 0));
  }

  if (lowerCore.includes('equipe 2 va gagner les deux mi-temps')) {
    const wantsYes = !lowerCore.includes('non');
    const winBoth = wantsYes ? isWin : !isWin;
    return winBoth
      ? (isFifa ? buildFromHalves(2, 5, 2, 4) : buildFromHalves(0, 1, 0, 2))
      : (isFifa ? buildFromHalves(3, 3, 2, 4) : buildFromHalves(0, 0, 0, 1));
  }

  if (lowerCore.includes('equipe 1 va gagner au moins une mi-temps')) {
    const wantsYes = !lowerCore.includes('non');
    const winOne = wantsYes ? isWin : !isWin;
    return winOne
      ? (isFifa ? buildFromHalves(5, 2, 2, 3) : buildFromHalves(1, 0, 1, 1))
      : (isFifa ? buildFromHalves(2, 4, 3, 3) : buildFromHalves(0, 1, 0, 0));
  }

  if (lowerCore.includes('equipe 2 va gagner au moins une mi-temps')) {
    const wantsYes = !lowerCore.includes('non');
    const winOne = wantsYes ? isWin : !isWin;
    return winOne
      ? (isFifa ? buildFromHalves(2, 4, 3, 2) : buildFromHalves(0, 1, 1, 1))
      : (isFifa ? buildFromHalves(4, 2, 3, 3) : buildFromHalves(1, 0, 0, 0));
  }

  // 5. CAS "CHAQUE EQUIPE VA MARQUER (N) OU PLUS - OUI / NON" (Vidéo FIFA & Football)
  const eachTeamGoalCountMatch = lowerCore.match(
    /chaque\s*[ée]quipe\s*va\s*marquer\s*\(\s*(\d+)\s*\)\s*ou\s*plus\s*-\s*(oui|non)/i
  );
  if (eachTeamGoalCountMatch) {
    const minGoals = parseInt(eachTeamGoalCountMatch[1], 10);
    const wantsYes = eachTeamGoalCountMatch[2].toLowerCase() === 'oui';
    const shouldAchieve = wantsYes ? isWin : !isWin;

    if (shouldAchieve) {
      const targetH = minGoals + 1;
      const targetA = minGoals;
      if (isFirstHalfBet) {
        return buildFromHalves(targetH, targetA, 2, 2);
      }
      if (isSecondHalfBet) {
        return buildFromHalves(2, 2, targetH, targetA);
      }
      const h1 = Math.ceil(targetH / 2);
      const a1 = Math.floor(targetA / 2);
      return buildFromHalves(h1, a1, targetH - h1, targetA - a1);
    } else {
      const lowGoals = Math.max(0, minGoals - 1);
      if (isFirstHalfBet) {
        return buildFromHalves(minGoals, lowGoals, 3, 2);
      }
      if (isSecondHalfBet) {
        return buildFromHalves(3, 2, minGoals, lowGoals);
      }
      const h1 = Math.floor(minGoals / 2);
      const a1 = Math.floor(lowGoals / 2);
      return buildFromHalves(h1, a1, minGoals - h1, lowGoals - a1);
    }
  }

  // 6. CAS TOTAL 1 / TOTAL 2 INDIVIDUEL (Plus de / Moins de)
  const indTotalMatch =
    corePred.match(/^total\s*(1|2)[\s\.:]+\(\s*(\d+(?:\.\d+)?)\s*\)\s*(plus\s*de|moins\s*de)/i) ||
    corePred.match(/^total\s*(1|2)[\s\.:]+(plus\s*de|moins\s*de)\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/i);
  if (indTotalMatch) {
    const teamNum = indTotalMatch[1];
    const threshold = parseFloat(indTotalMatch[2]?.match(/^\d/) ? indTotalMatch[2] : indTotalMatch[3]);
    const dirRaw = indTotalMatch[2]?.match(/^\d/) ? indTotalMatch[3] : indTotalMatch[2];
    const isOver = dirRaw.toLowerCase().includes('plus');
    const shouldGoOver = isOver ? isWin : !isWin;
    const teamGoals = shouldGoOver
      ? Math.floor(threshold) + 1
      : Math.max(0, Math.ceil(threshold) - 1);
    const otherGoals = isFifa ? 5 : 1;

    const totalH = teamNum === '1' ? teamGoals : otherGoals;
    const totalA = teamNum === '2' ? teamGoals : otherGoals;

    if (isFirstHalfBet) {
      return buildFromHalves(totalH, totalA, isFifa ? 3 : 1, isFifa ? 2 : 0);
    }
    if (isSecondHalfBet) {
      return buildFromHalves(isFifa ? 3 : 1, isFifa ? 2 : 0, totalH, totalA);
    }
    const h1 = Math.floor(totalH / 2);
    const a1 = Math.floor(totalA / 2);
    return buildFromHalves(h1, a1, totalH - h1, totalA - a1);
  }

  // 7. CAS TOTAL GLOBAL PLUS DE / MOINS DE (Ex: "Total. (14.5) Plus de", "Total. (2.5) Moins de")
  const globalTotalMatch =
    corePred.match(/(?:^total[\s\.:]+)?\(\s*(\d+(?:\.\d+)?)\s*\)\s*(plus\s*de|moins\s*de)/i) ||
    corePred.match(/(?:total\s*)?(plus\s*de|moins\s*de|over|under)\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/i);

  if (globalTotalMatch) {
    const firstIsNum = /^\d/.test(globalTotalMatch[1]);
    const threshold = parseFloat(firstIsNum ? globalTotalMatch[1] : globalTotalMatch[2]);
    const dirRaw = (firstIsNum ? globalTotalMatch[2] : globalTotalMatch[1]).toLowerCase();
    const isOver = dirRaw.includes('plus') || dirRaw.includes('over');
    const shouldGoOver = isOver ? isWin : !isWin;

    const targetTotal = shouldGoOver
      ? Math.floor(threshold) + 1
      : Math.max(0, Math.ceil(threshold) - 1);

    const pH = Math.ceil(targetTotal / 2);
    const pA = targetTotal - pH;

    if (isFirstHalfBet) {
      return buildFromHalves(pH, pA, isFifa ? 4 : 1, isFifa ? 3 : 0);
    }
    if (isSecondHalfBet) {
      return buildFromHalves(isFifa ? 4 : 1, isFifa ? 3 : 0, pH, pA);
    }
    const h1 = Math.floor(pH / 2);
    const a1 = Math.floor(pA / 2);
    return buildFromHalves(h1, a1, pH - h1, pA - a1);
  }

  // 8. CAS TOTAL PAIR (Oui / Non)
  if (lowerCore.includes('total pair')) {
    const wantsEven = !lowerCore.includes('non');
    const shouldBeEven = wantsEven ? isWin : !isWin;
    if (shouldBeEven) {
      return isFifa ? buildFromHalves(4, 3, 4, 3) : buildFromHalves(1, 0, 1, 0);
    }
    return isFifa ? buildFromHalves(4, 3, 4, 2) : buildFromHalves(1, 0, 1, 1);
  }

  // 9. CAS LES DEUX ÉQUIPES MARQUENT (BTTS)
  if (
    lowerCore.includes('deux équipes') ||
    lowerCore.includes('deux equipes') ||
    lowerCore.includes('btts')
  ) {
    const wantsYes = !lowerCore.includes('non') && !lowerCore.includes('no');
    const bothScore = wantsYes ? isWin : !isWin;
    if (isFirstHalfBet) {
      return bothScore ? buildFromHalves(1, 1, 1, 0) : buildFromHalves(1, 0, 1, 1);
    }
    if (isSecondHalfBet) {
      return bothScore ? buildFromHalves(1, 0, 1, 1) : buildFromHalves(1, 1, 1, 0);
    }
    return bothScore ? buildFromHalves(1, 0, 1, 1) : buildFromHalves(1, 0, 1, 0);
  }

  // 10. CAS DOUBLE CHANCE (1X, 12, 2X)
  if (lowerCore.includes('1x')) {
    const ok = isWin;
    if (isFirstHalfBet) {
      return ok ? buildFromHalves(1, 0, 1, 1) : buildFromHalves(0, 2, 1, 0);
    }
    if (isSecondHalfBet) {
      return ok ? buildFromHalves(0, 0, 1, 0) : buildFromHalves(1, 0, 0, 2);
    }
    return ok ? buildFromHalves(1, 0, 1, 1) : buildFromHalves(0, 1, 0, 1);
  }

  if (lowerCore.includes('2x') || lowerCore.includes('x2')) {
    const ok = isWin;
    if (isFirstHalfBet) {
      return ok ? buildFromHalves(0, 1, 1, 1) : buildFromHalves(2, 0, 0, 1);
    }
    if (isSecondHalfBet) {
      return ok ? buildFromHalves(0, 0, 0, 1) : buildFromHalves(0, 1, 2, 0);
    }
    return ok ? buildFromHalves(0, 1, 1, 1) : buildFromHalves(1, 0, 1, 0);
  }

  if (lowerCore.includes('double chance') && lowerCore.includes('12')) {
    const ok = isWin;
    if (isFirstHalfBet) {
      return ok ? buildFromHalves(1, 0, 1, 1) : buildFromHalves(1, 1, 1, 0);
    }
    if (isSecondHalfBet) {
      return ok ? buildFromHalves(1, 1, 1, 0) : buildFromHalves(1, 0, 1, 1);
    }
    return ok ? buildFromHalves(1, 0, 1, 1) : buildFromHalves(1, 0, 0, 1);
  }

  // 11. CAS 1X2. X / MATCH NUL
  if (
    lowerCore === '1x2. x' ||
    lowerCore === 'x' ||
    lowerCore === 'n' ||
    lowerCore.includes('match nul') ||
    /\b1x2[\s\.:]+x\b/i.test(lowerCore)
  ) {
    if (isFirstHalfBet) {
      return isWin
        ? (isFifa ? buildFromHalves(3, 3, 4, 2) : buildFromHalves(1, 1, 1, 0))
        : (isFifa ? buildFromHalves(4, 2, 3, 3) : buildFromHalves(2, 0, 0, 1));
    }
    if (isSecondHalfBet) {
      return isWin
        ? (isFifa ? buildFromHalves(4, 2, 3, 3) : buildFromHalves(1, 0, 1, 1))
        : (isFifa ? buildFromHalves(3, 3, 4, 2) : buildFromHalves(1, 1, 2, 0));
    }
    return isWin
      ? (isFifa ? buildFromHalves(4, 3, 3, 4) : buildFromHalves(1, 0, 0, 1))
      : (isFifa ? buildFromHalves(5, 3, 4, 2) : buildFromHalves(1, 0, 1, 1));
  }

  // 12. CAS 1X2. V2 / VICTOIRE ÉQUIPE 2
  if (
    lowerCore.includes('v2') ||
    lowerCore.includes('victoire 2') ||
    lowerCore === '2'
  ) {
    if (isFirstHalfBet) {
      return isWin
        ? (isFifa ? buildFromHalves(2, 4, 3, 3) : buildFromHalves(0, 1, 1, 1))
        : (isFifa ? buildFromHalves(4, 2, 2, 3) : buildFromHalves(1, 0, 0, 1));
    }
    if (isSecondHalfBet) {
      return isWin
        ? (isFifa ? buildFromHalves(3, 3, 2, 4) : buildFromHalves(1, 1, 0, 1))
        : (isFifa ? buildFromHalves(2, 4, 4, 2) : buildFromHalves(0, 1, 1, 0));
    }
    return isWin
      ? (isFifa ? buildFromHalves(2, 4, 3, 4) : buildFromHalves(0, 1, 1, 1))
      : (isFifa ? buildFromHalves(4, 2, 4, 3) : buildFromHalves(1, 0, 1, 1));
  }

  // 13. CAS 1X2. V1 / VICTOIRE ÉQUIPE 1 (Défaut 1X2)
  if (isFirstHalfBet) {
    return isWin
      ? (isFifa ? buildFromHalves(4, 2, 3, 3) : buildFromHalves(1, 0, 1, 1))
      : (isFifa ? buildFromHalves(2, 4, 3, 2) : buildFromHalves(0, 1, 1, 0));
  }
  if (isSecondHalfBet) {
    return isWin
      ? (isFifa ? buildFromHalves(3, 3, 4, 2) : buildFromHalves(1, 1, 1, 0))
      : (isFifa ? buildFromHalves(4, 2, 2, 4) : buildFromHalves(1, 0, 0, 1));
  }
  return isWin
    ? (isFifa ? buildFromHalves(4, 2, 4, 3) : buildFromHalves(1, 0, 1, 1))
    : (isFifa ? buildFromHalves(2, 4, 3, 4) : buildFromHalves(0, 1, 1, 1));
}

export interface AdaptiveLiveScoreResult {
  mainScore: string;
  detailedScore: string;
  scoreFinal: string;
  scoreDetail: string;
}

/**
 * Garantit le formatage strict du score final et du sous-score des 2 mi-temps pour tout événement terminé / gagné :
 * - Score principal : "${totalHome}:${totalAway}" (ex: "9:7")
 * - Sous-score des deux mi-temps : "${totalHome}:${totalAway} (${ht1Home}:${ht1Away},${ht2Home}:${ht2Away})" (ex: "9:7 (1:3,8:4)")
 * - Vérification mathématique automatique : totalHome = ht1Home + ht2Home et totalAway = ht1Away + ht2Away.
 */
export function ensureTwoHalvesScoreFormat(params: {
  event: Partial<MatchEvent> | any;
  rawScoreFinal?: string;
  rawScoreDetail?: string;
  isWin?: boolean;
}): {
  scoreFinal: string;
  scoreDetail: string;
  ht1Home: number;
  ht1Away: number;
  ht2Home: number;
  ht2Away: number;
  totalHome: number;
  totalAway: number;
} {
  const { event, rawScoreFinal, rawScoreDetail, isWin = true } = params;

  const pred = String(event?.prediction || event?.market || '1X2. V1').trim().toLowerCase();
  const isExplicit11 = /(?:1\s*[-:–]\s*1|match\s*nul|nul|^x$|^n$|1x2\.\s*x)/i.test(pred);

  const cleanRawFinal = (rawScoreFinal || '').trim();
  const isDefault11 =
    cleanRawFinal === '1-1' ||
    cleanRawFinal === '1:1' ||
    cleanRawFinal === '1 - 1' ||
    cleanRawFinal === '1 : 1';

  const adapted = adaptEventResultToPrediction(
    {
      id: event?.id || 'settled-ev',
      sport: event?.sport || (event?.isFifa ? 'FIFA' : 'Football'),
      league: event?.league || (event?.isFifa ? 'FIFA' : 'Football'),
      date: event?.date || '',
      homeTeam:
        typeof event?.homeTeam === 'string'
          ? { name: event.homeTeam }
          : event?.homeTeam || { name: 'Équipe 1' },
      awayTeam:
        typeof event?.awayTeam === 'string'
          ? { name: event.awayTeam }
          : event?.awayTeam || { name: 'Équipe 2' },
      prediction: event?.prediction || event?.market || '1X2. V1',
      odd: Number(event?.odd) || 1.5,
      status: isWin ? 'Gain' : 'Perdu',
    } as MatchEvent,
    isWin
  );

  // 1. Extraction de totalHome et totalAway
  let totalHome = 1;
  let totalAway = 0;
  let hasExplicitTotal = false;

  const validFinalStr =
    cleanRawFinal && cleanRawFinal.toUpperCase() !== 'VS' && !(isDefault11 && !isExplicit11)
      ? cleanRawFinal
      : '';

  const finalMatch = validFinalStr.match(/(\d+)\s*[:\-–]\s*(\d+)/);
  const detailPrefixMatch =
    !finalMatch && rawScoreDetail
      ? rawScoreDetail.trim().match(/^(\d+)\s*[:\-–]\s*(\d+)\s*\(/)
      : null;
  const adaptedMatch = (adapted.actualScore || '2:1').match(/(\d+)\s*[:\-–]\s*(\d+)/);

  if (finalMatch) {
    totalHome = parseInt(finalMatch[1], 10);
    totalAway = parseInt(finalMatch[2], 10);
    hasExplicitTotal = true;
  } else if (detailPrefixMatch) {
    totalHome = parseInt(detailPrefixMatch[1], 10);
    totalAway = parseInt(detailPrefixMatch[2], 10);
    hasExplicitTotal = true;
  } else if (adaptedMatch) {
    totalHome = parseInt(adaptedMatch[1], 10);
    totalAway = parseInt(adaptedMatch[2], 10);
  }

  // 2. Extraction ou reconstruction des 2 mi-temps (ht1Home:ht1Away,ht2Home:ht2Away)
  let ht1Home = 0;
  let ht1Away = 0;
  let ht2Home = 0;
  let ht2Away = 0;
  let resolvedHalves = false;

  const detailStr =
    rawScoreDetail && !(isDefault11 && !isExplicit11) ? rawScoreDetail.trim() : '';

  // Cas 2A : Les deux mi-temps sont déjà présentes entre parenthèses (h1:a1, h2:a2)
  const twoHalvesMatch = detailStr.match(
    /\(\s*(\d+)\s*[:\-]\s*(\d+)\s*,\s*(\d+)\s*[:\-]\s*(\d+)\s*\)/
  );
  if (twoHalvesMatch) {
    const h1 = parseInt(twoHalvesMatch[1], 10);
    const a1 = parseInt(twoHalvesMatch[2], 10);
    const h2 = parseInt(twoHalvesMatch[3], 10);
    const a2 = parseInt(twoHalvesMatch[4], 10);

    if (!hasExplicitTotal) {
      totalHome = h1 + h2;
      totalAway = a1 + a2;
      ht1Home = h1;
      ht1Away = a1;
      ht2Home = h2;
      ht2Away = a2;
      resolvedHalves = true;
    } else if (h1 + h2 === totalHome && a1 + a2 === totalAway) {
      ht1Home = h1;
      ht1Away = a1;
      ht2Home = h2;
      ht2Away = a2;
      resolvedHalves = true;
    } else if (h1 <= totalHome && a1 <= totalAway) {
      ht1Home = h1;
      ht1Away = a1;
      ht2Home = totalHome - h1;
      ht2Away = totalAway - a1;
      resolvedHalves = true;
    }
  }

  // Cas 2B : Une seule mi-temps est présente entre parenthèses (ex: "(1:3)" ou "2:2 (2:2)")
  if (!resolvedHalves && detailStr) {
    const oneHalfMatch = detailStr.match(/\(\s*(\d+)\s*[:\-]\s*(\d+)\s*\)/);
    if (oneHalfMatch) {
      const h1 = parseInt(oneHalfMatch[1], 10);
      const a1 = parseInt(oneHalfMatch[2], 10);
      if (h1 <= totalHome && a1 <= totalAway && (h1 < totalHome || a1 < totalAway || (totalHome <= 1 && totalAway <= 1))) {
        ht1Home = h1;
        ht1Away = a1;
        ht2Home = totalHome - h1;
        ht2Away = totalAway - a1;
        resolvedHalves = true;
      }
    }
  }

  // Cas 2C : Vérifier si adapted.halftimeScore correspond au totalHome:totalAway
  if (!resolvedHalves && adapted.halftimeScore) {
    const adaptedHalves = adapted.halftimeScore.match(
      /\(\s*(\d+)\s*[:\-]\s*(\d+)\s*,\s*(\d+)\s*[:\-]\s*(\d+)\s*\)/
    );
    if (adaptedHalves) {
      const ah1 = parseInt(adaptedHalves[1], 10);
      const aa1 = parseInt(adaptedHalves[2], 10);
      const ah2 = parseInt(adaptedHalves[3], 10);
      const aa2 = parseInt(adaptedHalves[4], 10);
      if (ah1 + ah2 === totalHome && aa1 + aa2 === totalAway) {
        ht1Home = ah1;
        ht1Away = aa1;
        ht2Home = ah2;
        ht2Away = aa2;
        resolvedHalves = true;
      }
    }
  }

  // Cas 2D : Répartition mathématique exacte garantissant totalHome = ht1Home + ht2Home et totalAway = ht1Away + ht2Away
  if (!resolvedHalves) {
    ht1Home = Math.floor(totalHome / 2);
    ht2Home = totalHome - ht1Home;
    ht1Away = Math.floor(totalAway / 2);
    ht2Away = totalAway - ht1Away;
  }

  const scoreFinal = `${totalHome}:${totalAway}`;
  const scoreDetail = `${totalHome}:${totalAway} (${ht1Home}:${ht1Away},${ht2Home}:${ht2Away})`;

  return {
    scoreFinal,
    scoreDetail,
    ht1Home,
    ht1Away,
    ht2Home,
    ht2Away,
    totalHome,
    totalAway,
  };
}

/**
 * Calcule le score EN DIRECT adaptatif :
 * - À 00:00 : démarre systématiquement à "0:0" et "0:0 (0:0)"
 * - En 1ère mi-temps : "${h1}:${a1}" et "${h1}:${a1} (${h1}:${a1})"
 * - En 2ème mi-temps : "${totalH}:${totalA}" et "${totalH}:${totalA} (${h1}:${a1},${h2}:${a2})"
 */
export function computeAdaptiveLiveScore(params: {
  marketLabel: string;
  elapsedSeconds: number;
  durationSeconds?: number;
  isFifa?: boolean;
  existingScoreFinal?: string;
  existingScoreDetail?: string;
}): AdaptiveLiveScoreResult {
  const {
    marketLabel,
    elapsedSeconds,
    durationSeconds = 5400,
    isFifa = false,
  } = params;

  const safeDur = Math.max(60, durationSeconds);
  const safeElapsed = Math.max(0, elapsedSeconds);
  const progress = Math.min(1, safeElapsed / safeDur);
  const isFirstHalf = progress < 0.5;

  // Au coup d'envoi (00:00) et dans les premières secondes : toujours 0:0 et 0:0 (0:0)
  if (safeElapsed === 0 || progress < 0.04) {
    return {
      mainScore: '0:0',
      detailedScore: '0:0 (0:0)',
      scoreFinal: '0:0',
      scoreDetail: '0:0 (0:0)',
    };
  }

  const normLabel = normalizeBetSelectionLabel(marketLabel);
  const lower = normLabel.toLowerCase();

  // Pour un match de football en 1ère mi-temps avant la 28e minute (ex: 22:10 sur la capture Valencia vs Real Madrid)
  // sur un pari 1X2 / Double chance / Moins de : score 0:0 et détail 0:0 (0:0)
  if (!isFifa && isFirstHalf && progress < 0.34) {
    const isHighOver =
      lower.includes('plus de') &&
      (() => {
        const m = lower.match(/\((\d+(?:\.\d+)?)\)/);
        return m ? parseFloat(m[1]) >= 3.5 : false;
      })();

    if (!isHighOver) {
      return {
        mainScore: '0:0',
        detailedScore: '0:0 (0:0)',
        scoreFinal: '0:0',
        scoreDetail: '0:0 (0:0)',
      };
    }
  }

  // Cible finale gagnante via adaptEventResultToPrediction échelonnée selon le temps écoulé
  const target = adaptEventResultToPrediction(
    {
      id: 'live-sim',
      sport: isFifa ? 'FIFA' : 'Football',
      league: isFifa ? 'FIFA' : 'Football',
      date: '',
      homeTeam: { name: 'Équipe 1' },
      awayTeam: { name: 'Équipe 2' },
      prediction: normLabel,
      odd: 1.5,
      status: 'Accepté',
    },
    true
  );

  // Extraire (h1:a1,h2:a2) de target.halftimeScore
  const htMatch = (target.halftimeScore || '').match(/\((\d+):(\d+),\s*(\d+):(\d+)\)/);
  const targetH1 = htMatch ? parseInt(htMatch[1], 10) : 1;
  const targetA1 = htMatch ? parseInt(htMatch[2], 10) : 0;
  const targetH2 = htMatch ? parseInt(htMatch[3], 10) : 1;
  const targetA2 = htMatch ? parseInt(htMatch[4], 10) : 0;

  if (isFirstHalf) {
    const halfRatio = Math.min(1, progress / 0.5);
    const curH1 = Math.min(targetH1, Math.floor(targetH1 * (halfRatio * 1.25)));
    const curA1 = Math.min(targetA1, Math.floor(targetA1 * (halfRatio * 1.25)));
    const main = `${curH1}:${curA1}`;
    const det = `${main} (${curH1}:${curA1})`;
    return {
      mainScore: main,
      detailedScore: det,
      scoreFinal: main,
      scoreDetail: det,
    };
  }

  const secondHalfRatio = Math.min(1, (progress - 0.5) / 0.5);
  const curH2 = Math.min(targetH2, Math.floor(targetH2 * (secondHalfRatio * 1.25)));
  const curA2 = Math.min(targetA2, Math.floor(targetA2 * (secondHalfRatio * 1.25)));
  const curTotalH = targetH1 + curH2;
  const curTotalA = targetA1 + curA2;
  const main = `${curTotalH}:${curTotalA}`;
  const det = `${main} (${targetH1}:${targetA1},${curH2}:${curA2})`;

  return {
    mainScore: main,
    detailedScore: det,
    scoreFinal: main,
    scoreDetail: det,
  };
}

/**
 * Vérifie si un événement correspond à un match FIFA ou e-football
 */
export function isFifaMatch(event?: Partial<MatchEvent> | null): boolean {
  if (!event) return false;
  const sport = (event.sport || '').toLowerCase();
  const league = (event.league || '').toLowerCase();
  const badge = ((event as any).badge || '').toLowerCase();
  return (
    sport.includes('fifa') ||
    league.includes('fifa') ||
    league.includes('fc 2') ||
    badge.includes('fifa')
  );
}

/**
 * Détermine si l'heure de début d'un événement (ou d'un coupon) est arrivée ou dépassée
 */
export function isEventStarted(event?: Partial<MatchEvent> | null, nowTimestamp?: number): boolean {
  if (!event) return false;
  const progress = getEventLiveProgress(event, nowTimestamp);
  return progress.hasStarted;
}

/**
 * Calcule le score effectif à afficher pour un événement :
 * - État A (PRE_MATCH : now < startTime et non terminé) : retourne 'VS' et aucun score de mi-temps.
 * - État B (LIVE : now >= startTime et now < startTime + duration) : adapte le score en direct ("0:0 (0:0)" -> 2ème mi-temps "total (h1,h2)").
 * - État C (FINISHED : terminé ou Payé/Gain/Perdu) : retourne "${totalHome}:${totalAway}" et "${totalHome}:${totalAway} (${ht1Home}:${ht1Away},${ht2Home}:${ht2Away})".
 */
export function getEffectiveEventScore(
  event: MatchEvent,
  isWon?: boolean,
  nowTimestamp?: number
): { mainScore: string; detailedScore?: string; isStarted: boolean } {
  if (!event) {
    return { mainScore: 'VS', detailedScore: undefined, isStarted: false };
  }

  const progress = getEventLiveProgress(event, nowTimestamp);

  // État A — AVANT LE DÉBUT DE L'ÉVÉNEMENT (now < startTime)
  if (!progress.hasStarted) {
    return {
      mainScore: 'VS',
      detailedScore: undefined,
      isStarted: false,
    };
  }

  const statusLower = String(event.status || '').toLowerCase().trim();
  const isSettled =
    statusLower === 'gain' ||
    statusLower === 'payé' ||
    statusLower === 'paye' ||
    statusLower === 'gagné' ||
    statusLower === 'gagne' ||
    statusLower === 'perdu' ||
    statusLower === 'perte';

  // État B — PENDANT L'ÉVÉNEMENT EN DIRECT
  if (!isSettled && progress.isLive) {
    const liveAdapted = computeAdaptiveLiveScore({
      marketLabel: event.prediction || '1X2. V1',
      elapsedSeconds: progress.elapsedSeconds,
      durationSeconds: progress.durationSeconds,
      isFifa: isFifaMatch(event),
    });
    return {
      mainScore: liveAdapted.mainScore,
      detailedScore: liveAdapted.detailedScore,
      isStarted: true,
    };
  }

  // État C — QUAND L'ÉVÉNEMENT EST TERMINÉ OU QUE LE COUPON GAGNE
  const isWinning =
    isWon ??
    (event.status === 'Gain' ||
      event.status === 'Payé' ||
      event.status === 'Gagné' ||
      event.status !== 'Perdu');

  const completeScore = ensureTwoHalvesScoreFormat({
    event,
    rawScoreFinal: (event as any).scoreFinal || (event as any).score || event.finalScore || event.actualScore,
    rawScoreDetail: (event as any).scoreDetail || event.halftimeScore,
    isWin: isWinning,
  });

  return {
    mainScore: completeScore.scoreFinal,
    detailedScore: completeScore.scoreDetail,
    isStarted: true,
  };
}
