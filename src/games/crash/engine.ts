import { BotBet } from './types';

/**
 * Calcul de la croissance exponentielle du multiplicateur:
 * Démarre à 1.00x à t = 0
 * Atteint ~2.70x en 8s et ~10.14x en 19s
 * Formule: multiplier = Math.pow(Math.E, 0.122 * elapsedSeconds)
 */
export function calculateMultiplier(elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 1.0;
  const growthRate = 0.122; // Produit e^(0.122 * 8) = 2.65x (~2.70x) et e^(0.122 * 19) = 10.15x (~10.14x)
  const mult = Math.exp(growthRate * elapsedSeconds);
  return Math.max(1.0, mult);
}

/**
 * Génération d'un crash point réaliste en mode Classique:
 * 3% de chance de crash instantané à 1.00x
 * Médiane autour de 1.80x
 * Possibilité de dépasser 10x+
 */
export function generateClassicCrashPoint(): number {
  const r = Math.random();
  if (r < 0.03) {
    return 1.0; // Crash instantané
  }
  if (r < 0.35) {
    // 1.05x à 1.60x
    return parseFloat((1.05 + Math.random() * 0.55).toFixed(2));
  }
  if (r < 0.70) {
    // 1.60x à 2.80x (médiane ~1.80x)
    return parseFloat((1.6 + Math.random() * 1.2).toFixed(2));
  }
  if (r < 0.88) {
    // 2.80x à 6.00x
    return parseFloat((2.8 + Math.random() * 3.2).toFixed(2));
  }
  if (r < 0.96) {
    // 6.00x à 12.00x
    return parseFloat((6.0 + Math.random() * 6.0).toFixed(2));
  }
  // 12.00x à 35.00x
  return parseFloat((12.0 + Math.random() * 23.0).toFixed(2));
}

/**
 * Génère 32 bots réalistes triés par mise décroissante (de ~19656.69 à ~200 XAF)
 */
export function generateBotList(): BotBet[] {
  // Liste prédéfinie de montants dégressifs avec centimes réalistes
  const baseStakes = [
    19656.69, 17840.50, 16200.00, 14500.85, 13100.20,
    11800.00, 10540.35, 9600.00, 8750.15, 7800.00,
    6900.50, 6100.00, 5400.75, 4800.00, 4200.25,
    3700.00, 3200.50, 2800.00, 2400.00, 2000.00,
    1700.00, 1400.50, 1200.00, 1000.00, 850.00,
    700.00, 600.00, 500.00, 400.00, 300.00,
    250.00, 200.00
  ];

  return baseStakes.map((stake, idx) => {
    const twoDigits = String(Math.floor(Math.random() * 90) + 10);
    // Cibles de cotes réalistes
    let target = 1.2 + Math.random() * 1.5;
    const luck = Math.random();
    if (luck < 0.3) {
      target = 1.15 + Math.random() * 0.45; // Petites cotes 1.15 - 1.60
    } else if (luck < 0.7) {
      target = 1.6 + Math.random() * 1.8;  // Moyennes cotes 1.60 - 3.40
    } else if (luck < 0.9) {
      target = 3.4 + Math.random() * 3.5;  // Hautes cotes 3.40 - 6.90
    } else {
      target = 7.0 + Math.random() * 8.0;  // Très hautes cotes 7.00 - 15.00
    }

    return {
      id: `bot-${idx + 1}`,
      name: `*******${twoDigits}`,
      bet: stake,
      targetMultiplier: parseFloat(target.toFixed(2)),
      isCashedOut: false,
      gain: 0,
    };
  });
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
