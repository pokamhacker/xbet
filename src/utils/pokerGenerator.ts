import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

export interface PokerDrawResult {
  hand1: string;
  hand2: string;
  hand3: string;
  hand4: string;
  hand5: string;
  hand6: string;
  table: string;
  winnerHand: number;
  combinationName: string;
}

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};
const SUITS = ['♠', '♣', '♥', '♦'];

interface ParsedCard {
  rank: string;
  suit: string;
  val: number;
  raw: string;
}

function parseCard(c: string): ParsedCard {
  const trimmed = c.trim();
  const suit = trimmed.slice(-1);
  const rank = trimmed.slice(0, -1);
  return {
    rank,
    suit,
    val: RANK_VALUES[rank] || 0,
    raw: trimmed,
  };
}

/**
 * Évalue la force d'une main de 7 cartes Texas Hold'em (score numérique croissant)
 */
function evaluate7Cards(cards: string[]): { category: number; score: number } {
  const parsed = cards.map(parseCard);

  // 1. Détection de couleur
  const suitCounts: Record<string, number> = {};
  for (const c of parsed) {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  }
  let flushSuit: string | null = null;
  for (const s of SUITS) {
    if ((suitCounts[s] || 0) >= 5) {
      flushSuit = s;
      break;
    }
  }

  // 2. Détection de quinte
  const uniqueVals = Array.from(new Set(parsed.map((c) => c.val))).sort((a, b) => b - a);
  if (uniqueVals.includes(14)) uniqueVals.push(1); // As comme 1

  let straightHigh = 0;
  for (let i = 0; i <= uniqueVals.length - 5; i++) {
    if (
      uniqueVals[i] - 1 === uniqueVals[i + 1] &&
      uniqueVals[i + 1] - 1 === uniqueVals[i + 2] &&
      uniqueVals[i + 2] - 1 === uniqueVals[i + 3] &&
      uniqueVals[i + 3] - 1 === uniqueVals[i + 4]
    ) {
      straightHigh = uniqueVals[i];
      break;
    }
  }

  // 3. Détection de quinte flush
  if (flushSuit) {
    const flushCards = parsed.filter((c) => c.suit === flushSuit);
    const fVals = Array.from(new Set(flushCards.map((c) => c.val))).sort((a, b) => b - a);
    if (fVals.includes(14)) fVals.push(1);
    for (let i = 0; i <= fVals.length - 5; i++) {
      if (
        fVals[i] - 1 === fVals[i + 1] &&
        fVals[i + 1] - 1 === fVals[i + 2] &&
        fVals[i + 2] - 1 === fVals[i + 3] &&
        fVals[i + 3] - 1 === fVals[i + 4]
      ) {
        return { category: 9, score: 90000 + fVals[i] };
      }
    }
  }

  // 4. Groupements de rangs (Carré, Full, Brelan, Paires)
  const rankCounts: Record<number, number> = {};
  for (const c of parsed) {
    rankCounts[c.val] = (rankCounts[c.val] || 0) + 1;
  }
  const counts = Object.entries(rankCounts)
    .map(([v, cnt]) => ({ val: Number(v), cnt }))
    .sort((a, b) => b.cnt - a.cnt || b.val - a.val);

  if (counts[0].cnt === 4) {
    return { category: 8, score: 80000 + counts[0].val * 100 + (counts[1]?.val || 0) };
  }
  if (counts[0].cnt === 3 && counts[1]?.cnt >= 2) {
    return { category: 7, score: 70000 + counts[0].val * 100 + counts[1].val };
  }
  if (flushSuit) {
    const fVals = parsed.filter((c) => c.suit === flushSuit).map((c) => c.val).sort((a, b) => b - a);
    return { category: 6, score: 60000 + fVals[0] * 100 + (fVals[1] || 0) };
  }
  if (straightHigh > 0) {
    return { category: 5, score: 50000 + straightHigh };
  }
  if (counts[0].cnt === 3) {
    return { category: 4, score: 40000 + counts[0].val * 100 + (counts[1]?.val || 0) };
  }
  if (counts[0].cnt === 2 && counts[1]?.cnt === 2) {
    return { category: 3, score: 30000 + counts[0].val * 100 + counts[1].val * 10 + (counts[2]?.val || 0) };
  }
  if (counts[0].cnt === 2) {
    return { category: 2, score: 20000 + counts[0].val * 100 + (counts[1]?.val || 0) };
  }
  return { category: 1, score: 10000 + counts[0].val * 100 + (counts[1]?.val || 0) };
}

/**
 * Normalise le marché sélectionné pour en extraire la combinaison exacte et la main gagnante
 */
export function parsePokerMarket(chosenMarket: string): {
  combinationName: string;
  winnerHand: number;
} {
  const norm = chosenMarket.toLowerCase().trim();

  // Extraction d'une main ciblée (ex: "Main 2", "Main 4", etc.)
  let winnerHand = 1;
  const mainMatch = norm.match(/main\s*([1-6])/);
  if (mainMatch) {
    winnerHand = parseInt(mainMatch[1], 10);
  }

  // Détection de la combinaison demandée
  if (norm.includes('quinte flush') || norm.includes('straight flush') || norm.includes('royal')) {
    return { combinationName: 'Quinte flush', winnerHand };
  }
  if (norm.includes('carré') || norm.includes('carre') || norm.includes('four of a kind')) {
    return { combinationName: 'Carré', winnerHand };
  }
  if (norm.includes('full')) {
    return { combinationName: 'Full', winnerHand };
  }
  if (norm.includes('couleur') || norm.includes('flush')) {
    return { combinationName: 'Couleur', winnerHand };
  }
  if (norm.includes('quinte') || norm.includes('straight') || norm.includes('suite')) {
    return { combinationName: 'Quinte', winnerHand };
  }
  if (norm.includes('brelan') || norm.includes('three of a kind')) {
    return { combinationName: 'Brelan', winnerHand };
  }
  if (norm.includes('deux paire') || norm.includes('double paire') || norm.includes('two pair')) {
    return { combinationName: 'Deux paires', winnerHand };
  }
  if (norm.includes('paire') || norm.includes('pair')) {
    return { combinationName: 'Paire', winnerHand };
  }
  if (norm.includes('carte haute') || norm.includes('high card')) {
    return { combinationName: 'Carte haute', winnerHand };
  }

  // Par défaut : Quinte flush
  return { combinationName: 'Quinte flush', winnerHand };
}

/**
 * Générateur principal de tirage de Texas Hold'em avec combinaison gagnante garantie
 * @param chosenMarket Libellé du pronostic (ex: "Combinaison gagnante. Quinte flush", "Full", etc.)
 */
export const generateWinningPokerDraw = (chosenMarket: string = 'Quinte flush'): PokerDrawResult => {
  const { combinationName, winnerHand } = parsePokerMarket(chosenMarket);

  // Configurations réalistes garantissant la combinaison exacte sur la table et la main gagnante
  const presets: Record<string, { winnerCards: string[]; tableCards: string[] }> = {
    'Quinte flush': {
      winnerCards: ['K♠', 'A♠'],
      tableCards: ['10♠', 'J♠', 'Q♠', '3♥', '6♣'],
    },
    'Carré': {
      winnerCards: ['A♠', 'A♥'],
      tableCards: ['A♦', 'A♣', 'K♠', '7♥', '2♣'],
    },
    'Full': {
      winnerCards: ['K♠', 'K♥'],
      tableCards: ['K♦', '9♣', '9♠', '4♥', '2♦'],
    },
    'Couleur': {
      winnerCards: ['A♥', 'J♥'],
      tableCards: ['8♥', '4♥', '2♥', 'K♠', '9♣'],
    },
    'Quinte': {
      winnerCards: ['9♠', '8♥'],
      tableCards: ['7♦', '6♣', '5♠', 'K♥', '2♦'],
    },
    'Brelan': {
      winnerCards: ['Q♠', 'Q♥'],
      tableCards: ['Q♦', '8♣', '4♠', '2♥', '7♦'],
    },
    'Deux paires': {
      winnerCards: ['J♠', '10♥'],
      tableCards: ['J♦', '10♣', '4♠', '8♥', '2♦'],
    },
    'Paire': {
      winnerCards: ['A♠', '9♥'],
      tableCards: ['A♦', '7♣', '4♠', '3♥', '2♦'],
    },
    'Carte haute': {
      winnerCards: ['A♠', 'K♦'],
      tableCards: ['J♣', '8♥', '6♠', '4♦', '2♣'],
    },
  };

  const preset = presets[combinationName] || presets['Quinte flush'];
  const winnerCards = [...preset.winnerCards];
  const tableCards = [...preset.tableCards];

  // Calcul du score de la main gagnante avec la table
  const winnerEval = evaluate7Cards([...winnerCards, ...tableCards]);

  // Constitution du jeu de 52 cartes et exclusion des cartes déjà utilisées
  const usedCards = new Set([...winnerCards, ...tableCards]);
  const deck: string[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      const card = `${r}${s}`;
      if (!usedCards.has(card)) {
        deck.push(card);
      }
    }
  }

  // Mélange aléatoire de Fisher-Yates sur les cartes restantes
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Distribution des mains pour les 6 joueurs
  const hands: string[] = new Array(6).fill('');
  const winnerIdx = Math.max(0, Math.min(5, winnerHand - 1));
  hands[winnerIdx] = `${winnerCards[0]}, ${winnerCards[1]}`;

  let deckPtr = 0;
  for (let h = 0; h < 6; h++) {
    if (h === winnerIdx) continue;

    // Attribution de deux cartes garantissant une combinaison inférieure à celle du gagnant
    let assigned = false;
    for (let attempt = 0; attempt < 30 && deckPtr + 1 < deck.length; attempt++) {
      const c1 = deck[deckPtr];
      const c2 = deck[deckPtr + 1];
      const otherEval = evaluate7Cards([c1, c2, ...tableCards]);

      if (otherEval.score < winnerEval.score) {
        hands[h] = `${c1}, ${c2}`;
        deckPtr += 2;
        assigned = true;
        break;
      } else {
        // En cas de conflit rare, pousser les cartes au fond du paquet
        deck.push(deck.splice(deckPtr, 1)[0]);
      }
    }

    if (!assigned) {
      // Fallback sécurisé : attribue les cartes disponibles
      const c1 = deck[deckPtr++] || '2♣';
      const c2 = deck[deckPtr++] || '3♦';
      hands[h] = `${c1}, ${c2}`;
    }
  }

  return {
    hand1: hands[0],
    hand2: hands[1],
    hand3: hands[2],
    hand4: hands[3],
    hand5: hands[4],
    hand6: hands[5],
    table: tableCards.join(', '),
    winnerHand,
    combinationName,
  };
};

/**
 * Helper React Native pour afficher les cartes avec les symboles rouges (♥, ♦)
 * stylisés automatiquement en #DC2626 et les noirs (♠, ♣) en couleur sombre.
 */
export const renderCardsWithSuits = (
  cardsText: string,
  textStyle?: StyleProp<TextStyle>,
  redStyle?: StyleProp<TextStyle>
): React.ReactNode => {
  if (!cardsText) return null;

  // Découpage par caractères pour styliser les symboles rouges
  const parts = cardsText.split(/([♥♦])/g);

  return parts.map((part, idx) => {
    if (part === '♥' || part === '♦') {
      return React.createElement(
        Text,
        {
          key: `suit-${idx}`,
          style: redStyle || { color: '#DC2626', fontWeight: '700' },
        },
        part
      );
    }
    return React.createElement(
      Text,
      {
        key: `txt-${idx}`,
        style: textStyle,
      },
      part
    );
  });
};

