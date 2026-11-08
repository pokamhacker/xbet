/**
 * LOGIQUE DU JEU DES CLOCHES — pure, sans React ni React Native.
 * Tout ce qui décide « qu'est-ce qui se passe quand on touche une cloche ».
 * Le résultat (gagné / perdu) vient TOUJOURS de ton serveur, jamais d'ici.
 */
import type { ReactElement } from 'react';
import type { ImageSourcePropType } from 'react-native';

/** Un plat = une image (require('./poulet.png') ou { uri }) ou n'importe quel élément React. */
export type Plat = ImageSourcePropType | ReactElement;

export type Statut =
  | 'pret'      // en attente du pari
  | 'enJeu'     // le joueur peut choisir une cloche
  | 'attente'   // cloche touchée, on attend la réponse du serveur
  | 'perdu'     // mauvaise cloche
  | 'complet'   // toutes les étapes réussies
  | 'encaisse'; // le joueur a récupéré ses gains

export type EtatCase =
  | { type: 'cloche' }
  | { type: 'gagne'; plat: Plat }
  | { type: 'perdu'; plat?: Plat };

/** 'ligne' = une ligne à la fois, de bas en haut (comme ton app). 'libre' = n'importe quelle cloche. */
export type ModeSelection = 'ligne' | 'libre';

export type Position = { ligne: number; colonne: number };

export type EtatJeu = {
  statut: Statut;
  etape: number;            // nombre de plats trouvés
  cases: EtatCase[][];      // [ligne][colonne], ligne 0 = en haut
  choix: Position | null;   // cloche touchée en attente de réponse
};

export type Config = {
  lignes: number;
  colonnes: number;
  mode: ModeSelection;
  etapesMax: number;        // nb d'étapes pour gagner la partie
};

export type ResultatChoix = { gagne: boolean; plat?: Plat };

const CLOCHE: EtatCase = { type: 'cloche' };

export function grilleVide(lignes: number, colonnes: number): EtatCase[][] {
  return Array.from({ length: lignes }, () => Array.from({ length: colonnes }, () => CLOCHE));
}

export function etatInitial(cfg: Config): EtatJeu {
  return { statut: 'pret', etape: 0, cases: grilleVide(cfg.lignes, cfg.colonnes), choix: null };
}

/** Ligne jouable en mode 'ligne' (on monte depuis le bas). null en mode 'libre' ou partie finie. */
export function ligneActive(etat: EtatJeu, cfg: Config): number | null {
  if (cfg.mode !== 'ligne') return null;
  const l = cfg.lignes - 1 - etat.etape;
  return l >= 0 ? l : null;
}

export function peutChoisir(etat: EtatJeu, cfg: Config, p: Position): boolean {
  if (etat.statut !== 'enJeu') return false;
  const c = etat.cases[p.ligne]?.[p.colonne];
  if (!c || c.type !== 'cloche') return false;
  if (cfg.mode === 'ligne') return p.ligne === ligneActive(etat, cfg);
  return true;
}

export function demarrer(etat: EtatJeu, cfg: Config): EtatJeu {
  return { ...etatInitial(cfg), statut: 'enJeu' };
}

export function debutChoix(etat: EtatJeu, cfg: Config, p: Position): EtatJeu {
  if (!peutChoisir(etat, cfg, p)) return etat;
  return { ...etat, statut: 'attente', choix: p };
}

export function appliquerResultat(etat: EtatJeu, cfg: Config, r: ResultatChoix): EtatJeu {
  const p = etat.choix;
  if (etat.statut !== 'attente' || !p) return etat;
  const cases = etat.cases.map((row) => row.slice());
  if (r.gagne) {
    if (r.plat == null) throw new Error('[cloches] onChoisir doit renvoyer un plat quand gagne = true');
    cases[p.ligne][p.colonne] = { type: 'gagne', plat: r.plat };
    const etape = etat.etape + 1;
    const fini = etape >= cfg.etapesMax || (cfg.mode === 'ligne' && etape >= cfg.lignes);
    return { statut: fini ? 'complet' : 'enJeu', etape, cases, choix: null };
  }
  cases[p.ligne][p.colonne] = { type: 'perdu', plat: r.plat };
  return { ...etat, statut: 'perdu', cases, choix: null };
}

/** Le serveur n'a pas répondu : on rend la main au joueur sans rien changer. */
export function annulerChoix(etat: EtatJeu): EtatJeu {
  if (etat.statut !== 'attente') return etat;
  return { ...etat, statut: 'enJeu', choix: null };
}

export function encaisser(etat: EtatJeu): EtatJeu {
  if (etat.statut !== 'enJeu' && etat.statut !== 'complet') return etat;
  if (etat.etape === 0) return etat; // rien à récupérer
  return { ...etat, statut: 'encaisse' };
}

/**
 * Délai (ms) de la vague dorée pour chaque case : elle part de la colonne d'origine
 * et avance colonne par colonne. -1 = cette case ne brille pas.
 */
export function delaisVague(
  cases: EtatCase[][],
  origine: Position,
  delaiParColonne: number,
): number[][] {
  return cases.map((row, l) =>
    row.map((c, col) => {
      if (c.type !== 'cloche') return -1;
      if (l === origine.ligne && col === origine.colonne) return -1;
      return Math.abs(col - origine.colonne) * delaiParColonne;
    }),
  );
}
