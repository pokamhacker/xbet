import { PokerRoundResult, PokerHandDistribution } from '../types/bet';
export * from './pokerGenerator';

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['♠️', '❤️', '♦️', '♣️'];

/**
 * Génère un tirage de Texas Hold'em réaliste à 6 mains + 5 cartes de board
 * @param winningHandId Main déclarée gagnante (1 à 6)
 * @param combinationName Combinaison (ex: "Carte haute", "Paire", "Couleur")
 */
export function generateRealisticPokerDraw(
  winningHandId: number = 1,
  combinationName: string = 'Carte haute'
): PokerRoundResult {
  // 1. Jeu de 52 cartes
  const deck: string[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      deck.push(`${r}${s}`);
    }
  }

  // 2. Mélange de Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // 3. Distribution de 2 cartes pour 6 mains (12 cartes)
  const hands: PokerHandDistribution[] = [];
  for (let h = 1; h <= 6; h++) {
    const c1 = deck.pop() || 'A♠️';
    const c2 = deck.pop() || 'K❤️';
    hands.push({
      id: h,
      cards: `${c1}, ${c2}`,
    });
  }

  // 4. Distribution de la table (5 cartes : flop, turn, river)
  const boardCards = [
    deck.pop() || '2♣️',
    deck.pop() || '5♦️',
    deck.pop() || '7♠️',
    deck.pop() || '9❤️',
    deck.pop() || 'K♣️',
  ];
  const board = boardCards.join(', ');

  // 5. Libellé du gagnant
  const winnerLabel = `${winningHandId} (${combinationName})`;

  return {
    hands,
    board,
    winnerLabel,
  };
}

export function generateRoundCode(): string {
  return `PB${Math.floor(100000 + Math.random() * 900000)}`;
}

export function generateCouponId(): string {
  return `85${Math.floor(100000000 + Math.random() * 900000000)}`;
}

export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
