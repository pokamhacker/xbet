/**
 * Contrôleur de partie : état du jeu + enchaînement des animations.
 *
 * L'état vit dans un objet mutable (ref) parce que les manches sont des séquences async
 * (tap → défilement → réticule → vol → explosion) qui doivent toujours lire la valeur
 * la plus récente. `commit()` déclenche le rendu après chaque changement.
 *
 * Le solde est celui du compte de l'application (useBetStore) : la mise est débitée au
 * premier tap et les gains sont crédités à l'encaissement.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type RefObject } from 'react';

import { useBetStore } from '../../../store/useBetStore';
import { sfx } from '../audio/sfx';
import type { CellRef, PlayFieldHandle } from '../components/PlayField';
import { COLS, DEFAULT_BET, MAX_LEVEL, MINES_PER_ROW, MIN_BET, TIMING, TOPUP } from './config';
import { drawMines, payout, shouldScroll, type Rng } from './engine';
import { BALANCE_SYMBOL, formatMoney } from './format';
import { sleep } from './motion';
import { randInt } from './rng';
import { loadSaved, saveSaved } from './storage';

export type Phase = 'idle' | 'select' | 'ended';

export type BannerState =
  | { kind: 'prompt'; text: string }
  | { kind: 'gain'; label: string; amount: string }
  | { kind: 'win'; label: string; amount: string }
  | { kind: 'lose'; text: string }
  | { kind: 'empty' };

export interface Notice {
  id: number;
  text: string;
}

interface GameState {
  hydrated: boolean;
  bet: number;
  sound: boolean;
  phase: Phase;
  /** Niveaux réussis dans la manche en cours. */
  cleared: number;
  /** La mise a été débitée (au premier tap) et la manche n'est pas encore réglée. */
  betPlaced: boolean;
  /** Une animation est en cours : aucun tap accepté. */
  busy: boolean;
  /** La ligne suivante est jouable. */
  showActive: boolean;
  /** Cases visées révélées, par niveau. */
  shown: Record<number, readonly number[]>;
  picked: CellRef | null;
  banner: BannerState;
}

const initialState = (): GameState => ({
  hydrated: false,
  bet: DEFAULT_BET,
  sound: true,
  phase: 'idle',
  cleared: 0,
  betPlaced: false,
  busy: false,
  showActive: false,
  shown: {},
  picked: null,
  banner: { kind: 'prompt', text: 'Placez un pari' },
});

/** Compte de l'application, lu hors rendu pour avoir toujours le solde le plus récent. */
const wallet = () => useBetStore.getState();

export function useKamikaze(field: RefObject<PlayFieldHandle | null>, rng: Rng = randInt) {
  const s = useRef<GameState>(initialState()).current;
  const balance = useBetStore(state => state.balance);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const alive = useRef(true);
  const noticeSeq = useRef(0);

  const commit = useCallback(() => {
    if (alive.current) bump();
  }, []);

  const actions = useMemo(() => {
    const notify = (text: string) => {
      if (alive.current) setNotice({ id: ++noticeSeq.current, text });
    };

    const persist = () => saveSaved({ bet: s.bet, sound: s.sound });

    const endRound = () => {
      Object.assign(s, {
        phase: 'ended',
        busy: false,
        betPlaced: false,
        showActive: false,
        cleared: 0,
        shown: {},
        picked: null,
      } satisfies Partial<GameState>);
      field.current?.reset();
      persist();
      commit();
      if (wallet().balance < MIN_BET) notify('Solde virtuel épuisé : touchez + pour le recharger');
    };

    const startRound = (bet: number): boolean => {
      if (s.phase === 'select' || !s.hydrated) return false;
      if (bet > wallet().balance) {
        notify('Solde insuffisant');
        return false;
      }
      const f = field.current;
      if (!f) return false;
      Object.assign(s, {
        bet,
        phase: 'select',
        busy: false,
        betPlaced: false,
        cleared: 0,
        shown: {},
        picked: null,
        showActive: true,
        banner: { kind: 'prompt', text: 'Sélectionnez une case' },
      } satisfies Partial<GameState>);
      f.reset();
      f.placeReticle(rng(COLS), 2);
      persist();
      commit();
      return true;
    };

    const cashOut = async () => {
      if (s.phase !== 'select' || s.busy || s.cleared < 1) return;
      s.busy = true;
      const amount = payout(s.bet, s.cleared);
      wallet().deposit(amount);
      s.betPlaced = false; // gains crédités : quitter l'écran ne fait plus rien perdre
      s.showActive = false;
      s.banner = { kind: 'win', label: 'Vous avez gagné :', amount: `${formatMoney(amount)} XAF` };
      sfx.play('win');
      sfx.haptic('win');
      commit();
      const f = field.current;
      f?.hideReticle();
      await f?.planeExit(TIMING.planeExit);
      endRound();
    };

    const pick = async (col: number) => {
      const f = field.current;
      if (!f || s.phase !== 'select' || s.busy || !s.showActive) return;
      s.busy = true;
      const level = s.cleared + 1;

      if (!s.betPlaced) {
        // Le solde a pu changer depuis « Jouer » (recharge, mise à jour par l'administrateur…).
        if (s.bet > wallet().balance) {
          s.banner = { kind: 'prompt', text: 'Placez un pari' };
          endRound();
          notify('Solde insuffisant');
          return;
        }
        wallet().withdraw(s.bet);
        s.betPlaced = true;
      }
      s.picked = { col, level };
      s.showActive = false;
      s.banner = { kind: 'empty' };
      commit();
      sfx.play('tap');
      sfx.haptic('tap');
      await sleep(TIMING.tapPause);

      if (shouldScroll(level, f.getWinStart())) await f.scrollTo(level);

      // Sur toutes les cases du jeu Kamikaze : l'avion ne doit JAMAIS être touché par la DCA / mine
      // La DCA vise toujours une autre case au hasard, évitant systématiquement la case choisie par le joueur
      const mines = drawMines(rng, COLS, MINES_PER_ROW, col);
      const lose = false; // L'avion n'est jamais touché
      const target = mines[0] ?? ((col + 1) % COLS);

      if (lose) {
        // La DCA vise la case ciblée : l'avion ne doit JAMAIS toucher ni être dans la même case que la mire
        f.hidePlane();
        await f.moveReticle(target, level, TIMING.reticle);
        s.shown = { ...s.shown, [level]: mines };
        s.picked = null;
        s.betPlaced = false; // mise perdue : la manche est réglée
        commit();

        f.shake();
        sfx.play('boom_big');
        sfx.play('lose');
        sfx.haptic('lose');

        // Explosion authentique sur la case de la mire (la flèche)
        const boom = f.explode(col, level, true);
        await boom;
        await sleep(TIMING.loseBanner);
        s.banner = { kind: 'lose', text: 'Réessayez !' };
        commit();
        await sleep(TIMING.loseEnd);
        endRound();
        return;
      }

      // Case sûre : la mire de la DCA vise une autre case (target != col)
      const aim = f.moveReticle(target, level, TIMING.reticle);
      await sleep(TIMING.planeDelay);
      sfx.play('plane');
      const flight = f.flyPlane(col, level, TIMING.flight);
      await aim;
      s.shown = { ...s.shown, [level]: mines };
      commit();
      await flight;
      s.picked = null;
      commit();

      // Case sûre : l'obus explose à côté, le coefficient de la ligne s'applique.
      s.cleared = level;
      s.showActive = true;
      s.banner = { kind: 'gain', label: 'Gains actuels', amount: `${formatMoney(payout(s.bet, level))} XAF` };
      sfx.play('boom');
      sfx.haptic('safe');
      const boom = f.explode(target, level, false);
      commit();
      await sleep(TIMING.afterSafe);
      s.busy = false;
      commit();
      await boom;

      if (level >= MAX_LEVEL) {
        await sleep(TIMING.maxLevelPause);
        await cashOut();
      }
    };

    const topUp = () => {
      if (s.phase === 'select') return;
      wallet().deposit(TOPUP);
      notify(`+${formatMoney(TOPUP)} ${BALANCE_SYMBOL} ajoutés à votre solde virtuel`);
    };

    const toggleSound = () => {
      s.sound = !s.sound;
      sfx.setEnabled(s.sound);
      persist();
      commit();
      if (s.sound) sfx.play('tap');
    };

    return { startRound, pick, cashOut, topUp, toggleSound, notify };
  }, [commit, field, rng, s]);

  useEffect(() => {
    alive.current = true;
    sfx.init();
    loadSaved().then(saved => {
      if (saved.bet !== undefined) s.bet = saved.bet;
      if (saved.sound !== undefined) s.sound = saved.sound;
      sfx.setEnabled(s.sound);
      s.hydrated = true;
      commit();
    });
    return () => {
      alive.current = false;
      sfx.dispose();
    };
  }, [commit, s]);

  const activeLevel = s.phase === 'select' && s.showActive ? s.cleared + 1 : -1;

  return {
    hydrated: s.hydrated,
    balance,
    bet: s.bet,
    sound: s.sound,
    phase: s.phase,
    cleared: s.cleared,
    banner: s.banner,
    shown: s.shown,
    picked: s.picked,
    activeLevel,
    interactive: s.phase === 'select' && s.showActive && !s.busy,
    canCash: s.phase === 'select' && !s.busy && s.cleared >= 1,
    /** Une mise débitée n'est pas encore réglée : quitter l'écran la ferait perdre. */
    atStake: s.phase === 'select' && s.betPlaced,
    notice,
    ...actions,
  };
}
