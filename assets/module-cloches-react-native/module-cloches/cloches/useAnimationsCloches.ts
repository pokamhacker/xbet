/**
 * ANIMATIONS DES CLOCHES — utilisable seul si tu as déjà ta propre grille.
 *
 *   const anim = useAnimationsCloches(5, 5);
 *   anim.vague({ ligne: 2, colonne: 4 }, cases);   // vague dorée depuis cette cloche
 *   anim.reveler(2, 4);                             // éclat + plat qui pop
 *   anim.get(2, 4)                                  // valeurs Animated à brancher sur <Cloche>
 *
 * N'utilise que l'API Animated de React Native : aucune librairie à installer.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { delaisVague, type EtatCase, type Position } from './logique';

export type AnimCase = {
  /** 0 → 1 → 0 : lumière dorée sur la cloche (vague, ou cloche touchée en attente) */
  brille: Animated.Value;
  /** 0 → 1 : éclat (vert si gagné, rouge si perdu) au moment de la révélation */
  eclat: Animated.Value;
  /** 0 → 1 (avec rebond) : apparition du plat */
  apparition: Animated.Value;
};

export type OptionsAnimations = {
  /** ms entre deux colonnes : vitesse de la vague (défaut 90) */
  delaiParColonne?: number;
  /** ms pour que la cloche s'allume (défaut 180) */
  dureeMontee?: number;
  /** ms pour qu'elle s'éteigne (défaut 340) */
  dureeDescente?: number;
  /** ms de l'éclat (défaut 420) */
  dureeEclat?: number;
};

export type AnimationsCloches = {
  get: (ligne: number, colonne: number) => AnimCase;
  /** Lance la vague dorée. Seules les cases encore fermées brillent. */
  vague: (origine: Position, cases: EtatCase[][]) => Promise<void>;
  /** Éclat + apparition du plat sur une case. */
  reveler: (ligne: number, colonne: number) => Promise<void>;
  /** Allume (ou éteint) une cloche, ex. pendant l'attente du serveur. */
  surbrillance: (ligne: number, colonne: number, allumee: boolean) => void;
  /** Coupe tout et remet toutes les valeurs à zéro. */
  reinitialiser: () => void;
};

const nd = true; // useNativeDriver : opacity et transform tournent sur le thread natif

function creerGrille(lignes: number, colonnes: number): AnimCase[][] {
  return Array.from({ length: lignes }, () =>
    Array.from({ length: colonnes }, () => ({
      brille: new Animated.Value(0),
      eclat: new Animated.Value(0),
      apparition: new Animated.Value(0),
    })),
  );
}

export function useAnimationsCloches(
  lignes: number,
  colonnes: number,
  options: OptionsAnimations = {},
): AnimationsCloches {
  const {
    delaiParColonne = 90,
    dureeMontee = 180,
    dureeDescente = 340,
    dureeEclat = 420,
  } = options;

  const grille = useMemo(() => creerGrille(lignes, colonnes), [lignes, colonnes]);
  const enCours = useRef(new Set<Animated.CompositeAnimation>());

  const lancer = useCallback((a: Animated.CompositeAnimation) => {
    enCours.current.add(a);
    return new Promise<void>((resolve) =>
      a.start(() => {
        enCours.current.delete(a);
        resolve();
      }),
    );
  }, []);

  const get = useCallback((l: number, c: number) => grille[l][c], [grille]);

  const vague = useCallback(
    (origine: Position, cases: EtatCase[][]) => {
      const delais = delaisVague(cases, origine, delaiParColonne);
      const anims: Animated.CompositeAnimation[] = [];
      delais.forEach((row, l) =>
        row.forEach((d, c) => {
          if (d < 0 || !grille[l]?.[c]) return;
          const v = grille[l][c].brille;
          v.stopAnimation();
          v.setValue(0);
          anims.push(
            Animated.sequence([
              Animated.delay(d),
              Animated.timing(v, { toValue: 1, duration: dureeMontee, easing: Easing.out(Easing.quad), useNativeDriver: nd }),
              Animated.timing(v, { toValue: 0, duration: dureeDescente, easing: Easing.in(Easing.quad), useNativeDriver: nd }),
            ]),
          );
        }),
      );
      // stopTogether: false → arrêter une cloche (ex. celle qu'on touche) ne fige pas toute la vague
      return lancer(Animated.parallel(anims, { stopTogether: false }));
    },
    [grille, delaiParColonne, dureeMontee, dureeDescente, lancer],
  );

  const reveler = useCallback(
    (l: number, c: number) => {
      const a = grille[l][c];
      a.brille.stopAnimation();
      a.brille.setValue(0);
      a.eclat.setValue(0);
      a.apparition.setValue(0);
      return lancer(
        Animated.parallel([
          Animated.timing(a.eclat, { toValue: 1, duration: dureeEclat, easing: Easing.out(Easing.cubic), useNativeDriver: nd }),
          Animated.sequence([
            Animated.delay(90), // le plat sort juste après l'éclat
            Animated.spring(a.apparition, { toValue: 1, friction: 5, tension: 140, useNativeDriver: nd }),
          ]),
        ]),
      );
    },
    [grille, dureeEclat, lancer],
  );

  const surbrillance = useCallback(
    (l: number, c: number, allumee: boolean) => {
      const v = grille[l][c].brille;
      v.stopAnimation();
      Animated.timing(v, {
        toValue: allumee ? 0.85 : 0,
        duration: allumee ? 150 : 250,
        useNativeDriver: nd,
      }).start();
    },
    [grille],
  );

  const reinitialiser = useCallback(() => {
    enCours.current.forEach((a) => a.stop());
    enCours.current.clear();
    grille.forEach((row) =>
      row.forEach((a) => {
        a.brille.stopAnimation();
        a.eclat.stopAnimation();
        a.apparition.stopAnimation();
        a.brille.setValue(0);
        a.eclat.setValue(0);
        a.apparition.setValue(0);
      }),
    );
  }, [grille]);

  // stoppe proprement si l'écran est démonté en pleine animation
  useEffect(() => () => enCours.current.forEach((a) => a.stop()), []);

  return { get, vague, reveler, surbrillance, reinitialiser };
}
