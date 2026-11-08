/**
 * useCloches — LE hook à brancher dans ton app.
 * Il gère la logique (quelle cloche est jouable, étapes, gagné/perdu) ET déclenche les animations.
 *
 *   const jeu = useCloches({
 *     lignes: 5, colonnes: 5,
 *     onChoisir: async ({ ligne, colonne, etape }) => {
 *       const r = await monApi.choisirPlat(ligne, colonne);       // ← ton serveur décide
 *       return { gagne: r.gagne, plat: IMAGES_PLATS[r.plat] };
 *     },
 *   });
 *   <GrilleCloches jeu={jeu} imageCloche={require('./img/cloche.png')} />
 *   jeu.demarrer()   → après avoir placé le pari
 *   jeu.encaisser()  → bouton « Récupérer les gains »
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as L from './logique';
import {
  useAnimationsCloches,
  type AnimationsCloches,
  type OptionsAnimations,
} from './useAnimationsCloches';

export type InfoChoix = { ligne: number; colonne: number; etape: number };

export type OptionsCloches = {
  lignes?: number;                 // défaut 5
  colonnes?: number;               // défaut 5
  mode?: L.ModeSelection;          // défaut 'ligne' (de bas en haut, comme ton app)
  etapesMax?: number;              // défaut = lignes
  /** Appelé quand le joueur touche une cloche jouable. Renvoie le résultat de TON serveur. */
  onChoisir: (info: InfoChoix) => Promise<L.ResultatChoix> | L.ResultatChoix;
  /** Vague dorée au lancement de la partie (défaut true) */
  vagueAuDemarrage?: boolean;
  /** Appelés après les animations */
  onGagne?: (info: InfoChoix) => void;
  onPerdu?: (info: InfoChoix) => void;
  onComplet?: (etape: number) => void;
  /** Le serveur a échoué : la cloche se rallume et le joueur peut réessayer */
  onErreur?: (erreur: unknown) => void;
  animations?: OptionsAnimations;
};

export type JeuCloches = {
  statut: L.Statut;
  etape: number;
  cases: L.EtatCase[][];
  choix: L.Position | null;
  ligneActive: number | null;
  lignes: number;
  colonnes: number;
  peutChoisir: (ligne: number, colonne: number) => boolean;
  choisir: (ligne: number, colonne: number) => Promise<void>;
  demarrer: () => void;
  encaisser: () => void;
  reinitialiser: () => void;
  /** Relancer la vague à la main (ex. après une reconnexion) */
  vague: (ligne: number, colonne: number) => void;
  anim: AnimationsCloches;
};

export function useCloches(options: OptionsCloches): JeuCloches {
  const lignes = options.lignes ?? 5;
  const colonnes = options.colonnes ?? 5;
  const cfg = useMemo<L.Config>(
    () => ({
      lignes,
      colonnes,
      mode: options.mode ?? 'ligne',
      etapesMax: options.etapesMax ?? lignes,
    }),
    [lignes, colonnes, options.mode, options.etapesMax],
  );

  const anim = useAnimationsCloches(lignes, colonnes, options.animations);

  const [etat, setEtatState] = useState<L.EtatJeu>(() => L.etatInitial(cfg));
  const etatRef = useRef(etat);
  const setEtat = useCallback((e: L.EtatJeu) => {
    etatRef.current = e;
    setEtatState(e);
  }, []);

  // toujours la dernière version des callbacks, sans relancer les effets
  const optsRef = useRef(options);
  optsRef.current = options;

  // change à chaque nouvelle partie : une réponse serveur d'une ancienne partie est ignorée
  const partieRef = useRef(0);

  // si la taille de la grille change, on repart de zéro
  useEffect(() => {
    partieRef.current++;
    setEtat(L.etatInitial(cfg));
  }, [cfg, setEtat]);

  // écran quitté pendant un appel serveur : la réponse sera ignorée
  useEffect(
    () => () => {
      partieRef.current++;
    },
    [],
  );

  const choisir = useCallback(
    async (ligne: number, colonne: number) => {
      const avant = etatRef.current;
      if (!L.peutChoisir(avant, cfg, { ligne, colonne })) return;

      const partie = partieRef.current;
      const info: InfoChoix = { ligne, colonne, etape: avant.etape };
      setEtat(L.debutChoix(avant, cfg, { ligne, colonne }));
      anim.surbrillance(ligne, colonne, true);

      let resultat: L.ResultatChoix;
      let apres: L.EtatJeu;
      try {
        resultat = await optsRef.current.onChoisir(info);
        if (partie !== partieRef.current) return; // partie réinitialisée entre-temps
        apres = L.appliquerResultat(etatRef.current, cfg, resultat);
      } catch (e) {
        if (partie !== partieRef.current) return;
        anim.surbrillance(ligne, colonne, false);
        setEtat(L.annulerChoix(etatRef.current));
        optsRef.current.onErreur?.(e);
        return;
      }

      // remettre les valeurs à 0 AVANT d'afficher le plat (sinon il flashe une frame)
      const revele = anim.reveler(ligne, colonne);
      setEtat(apres);

      if (resultat.gagne) {
        anim.vague({ ligne, colonne }, apres.cases);
        await revele;
        if (partie !== partieRef.current) return;
        optsRef.current.onGagne?.(info);
        if (apres.statut === 'complet') optsRef.current.onComplet?.(apres.etape);
      } else {
        await revele;
        if (partie !== partieRef.current) return;
        optsRef.current.onPerdu?.(info);
      }
    },
    [anim, cfg, setEtat],
  );

  const demarrer = useCallback(() => {
    partieRef.current++;
    anim.reinitialiser();
    const e = L.demarrer(etatRef.current, cfg);
    setEtat(e);
    if (optsRef.current.vagueAuDemarrage ?? true) {
      // origine virtuelle (ligne -1) au milieu : toutes les cloches brillent, du centre vers les bords
      anim.vague({ ligne: -1, colonne: Math.floor(cfg.colonnes / 2) }, e.cases);
    }
  }, [anim, cfg, setEtat]);

  const encaisser = useCallback(() => {
    setEtat(L.encaisser(etatRef.current));
  }, [setEtat]);

  const reinitialiser = useCallback(() => {
    partieRef.current++;
    anim.reinitialiser();
    setEtat(L.etatInitial(cfg));
  }, [anim, cfg, setEtat]);

  const vague = useCallback(
    (ligne: number, colonne: number) => {
      anim.vague({ ligne, colonne }, etatRef.current.cases);
    },
    [anim],
  );

  const peutChoisir = useCallback(
    (ligne: number, colonne: number) => L.peutChoisir(etat, cfg, { ligne, colonne }),
    [etat, cfg],
  );

  return {
    statut: etat.statut,
    etape: etat.etape,
    cases: etat.cases,
    choix: etat.choix,
    ligneActive: L.ligneActive(etat, cfg),
    lignes,
    colonnes,
    peutChoisir,
    choisir,
    demarrer,
    encaisser,
    reinitialiser,
    vague,
    anim,
  };
}
