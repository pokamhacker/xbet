import { test } from 'node:test';
import assert from 'node:assert/strict';

import { COLS, LADDER, MAX_LEVEL, MINES_PER_ROW } from './config';
import {
  cellCenter,
  computeLayout,
  drawMines,
  multiplier,
  payout,
  shouldScroll,
  successProbability,
  validateBet,
} from './engine';
import { formatBalance, formatMoney } from './format';

test('les coefficients correspondent au jeu original sur les 5 premiers niveaux', () => {
  assert.deepEqual(LADDER.slice(0, 5), [1.2, 1.4, 1.6, 2, 2.5]);
  assert.equal(multiplier(1), 1.2);
  assert.equal(multiplier(MAX_LEVEL), LADDER[LADDER.length - 1]);
  assert.throws(() => multiplier(0));
  assert.throws(() => multiplier(MAX_LEVEL + 1));
});

test('les coefficients augmentent strictement et la cote maximale est 10', () => {
  for (let i = 1; i < LADDER.length; i++) assert.ok(LADDER[i] > LADDER[i - 1]);
  assert.equal(multiplier(MAX_LEVEL), 10);
  assert.equal(Math.max(...LADDER), 10);
});

test('drawMines avec excludeCol n inclut jamais la colonne de l avion', () => {
  const rng = (n: number) => 0;
  for (let c = 0; c < COLS; c++) {
    const m = drawMines(rng, COLS, MINES_PER_ROW, c);
    assert.equal(m.includes(c), false);
  }
});

test('gains de la vidéo : mise 500 -> 600, 700, 800, 1000', () => {
  assert.deepEqual([1, 2, 3, 4].map(l => payout(500, l)), [600, 700, 800, 1000]);
  assert.equal(payout(333, 1), 399.6);
});

test('drawMines donne des colonnes valides et distinctes', () => {
  let seed = 7;
  const rng = (n: number) => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;
  for (let i = 0; i < 500; i++) {
    const m = drawMines(rng);
    assert.equal(m.length, MINES_PER_ROW);
    assert.equal(new Set(m).size, m.length);
    m.forEach(c => assert.ok(c >= 0 && c < COLS));
  }
  assert.deepEqual(drawMines(() => 0, 5, 3), [0, 1, 2]);
});

test('chaque colonne est visée à peu près aussi souvent (tirage équitable)', () => {
  const counts = new Array(COLS).fill(0);
  const rng = (n: number) => Math.floor(Math.random() * n);
  const N = 50_000;
  for (let i = 0; i < N; i++) counts[drawMines(rng)[0]]++;
  counts.forEach(c => assert.ok(Math.abs(c / N - 1 / COLS) < 0.015, `répartition déséquilibrée : ${counts}`));
});

test('probabilité de réussite', () => {
  assert.equal(successProbability(1), 0.8);
  assert.ok(Math.abs(successProbability(4) - 0.4096) < 1e-12);
});

test('défilement toutes les deux lignes', () => {
  assert.equal(shouldScroll(1, 1), false);
  assert.equal(shouldScroll(2, 1), false);
  assert.equal(shouldScroll(3, 1), true);
  assert.equal(shouldScroll(4, 3), false);
  assert.equal(shouldScroll(5, 3), true);
});

test('position des cases dans la bande', () => {
  assert.deepEqual(cellCenter(0, 1, 1, 60), { x: 30, y: 390 });
  assert.deepEqual(cellCenter(4, 3, 3, 60), { x: 270, y: 390 });
  assert.deepEqual(cellCenter(2, 7, 1, 60), { x: 150, y: 30 });
});

test('validation de la mise', () => {
  assert.equal(validateBet('', 1000).error, 'Entrez un montant');
  assert.equal(validateBet('50', 1000).error, 'Mise minimale : 100 XAF');
  assert.equal(validateBet('600000', 10_000_000).error, 'Mise maximale : 500000 XAF');
  assert.equal(validateBet('2000', 1000).error, 'Solde insuffisant');
  assert.deepEqual(validateBet('5 00', 1000), { value: 500, error: null });
});

test('mise en page : tout tient sur un téléphone', () => {
  const l = computeLayout(390, 760);
  assert.ok(l.cell >= 34 && l.cell <= 84);
  assert.ok(l.fieldWidth <= 390 - 2 * l.pad);
  assert.ok(l.cell * 5 + 248 <= 760);
  assert.equal(computeLayout(320, 300).cell, 34);
});

test('formatage', () => {
  // même format que le solde du compte dans l'app (séparateurs : espace insécable fournie par Intl)
  assert.match(formatBalance(24322344.84), /^24\s322\s344,84$/u);
  assert.match(formatBalance(1500), /^1\s500,00$/u);
  assert.equal(formatMoney(1000), '1 000');
  assert.equal(formatMoney(1312.5), '1 312.5');
  assert.equal(formatMoney(399.6), '399.6');
});
