const RANGE = 0x100000000;

/** 32 bits aléatoires : Web Crypto quand le moteur JS le fournit (web), sinon Math.random. */
function random32(): number {
  try {
    const c = globalThis.crypto;
    if (c && typeof c.getRandomValues === 'function') return c.getRandomValues(new Uint32Array(1))[0];
  } catch {
    // pas de Web Crypto : repli ci-dessous
  }
  return Math.floor(Math.random() * RANGE);
}

/** Entier aléatoire uniforme dans [0, n). */
export function randInt(n: number): number {
  const limit = Math.floor(RANGE / n) * n; // rejet pour éviter le biais du modulo
  let x: number;
  do {
    x = random32();
  } while (x >= limit);
  return x % n;
}
