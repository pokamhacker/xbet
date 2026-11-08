# Module Cloches (React Native)

Ce module gère la logique du jeu des cloches et ses animations, comme dans le vrai jeu :

- **éclat vert** sur la cloche gagnante (éclat rouge si elle est perdante) ;
- **plat qui « pop » en grand, sans rond noir derrière** ;
- **vague dorée** qui part de la cloche choisie et traverse toutes les autres, colonne par colonne. C'est l'animation qui « rafraîchit » les cloches ;
- cloche allumée pendant l'attente de la réponse du serveur ;
- vague au lancement de la partie.

Il n'y a **aucune librairie à installer** : seulement l'API `Animated` de React Native, avec le driver natif (fluide même sur les téléphones d'entrée de gamme). Le module marche avec Expo comme avec React Native CLI, et dans un projet en TypeScript comme en JavaScript.

## Contenu

```
cloches/
  index.ts                  ← tout s'importe d'ici
  useCloches.ts             ← LE hook : logique + animations
  useAnimationsCloches.ts   ← les animations seules (si tu gardes ta grille)
  logique.ts                ← règles du jeu, pur, sans React (testable)
  GrilleCloches.tsx         ← la grille prête à l'emploi
  Cloche.tsx                ← une case (cloche / plat / éclat)
  assets/                   ← halo doré, éclat vert, éclat rouge
exemple/
  EcranCloches.tsx          ← écran complet avec un faux serveur
  img/cloche.png            ← cloche de démo, à remplacer par la tienne
```

## Installation

1. Copie le dossier `cloches/` dans ton projet, par exemple dans `src/components/cloches/`.
2. C'est tout.

## Utilisation simple (recommandée)

```tsx
import { useCloches, GrilleCloches } from './components/cloches';

const PLATS = {
  poulet: require('./img/poulet.png'),   // PNG fond transparent !
  pizza:  require('./img/pizza.png'),
  // ...
};

function EcranJeu() {
  const jeu = useCloches({
    lignes: 5,
    colonnes: 5,
    onChoisir: async ({ ligne, colonne, etape }) => {
      const r = await api.choisirPlat({ ligne, colonne, etape });   // ← TON serveur décide
      return { gagne: r.gagne, plat: r.gagne ? PLATS[r.plat] : PLATS.perdu };
    },
  });

  return (
    <>
      <GrilleCloches jeu={jeu} imageCloche={require('./img/cloche.png')} />
      {/* après avoir débité la mise : */}
      <Bouton onPress={jeu.demarrer} />
      {/* bouton « Récupérer les gains » : */}
      <Bouton onPress={jeu.encaisser} />
    </>
  );
}
```

Le résultat gagné/perdu doit **toujours venir du serveur**. Le module ne fait qu'afficher ce qu'il reçoit.

## Le fond noir derrière les plats

`Cloche.tsx` affiche le plat **directement**, sans fond ni rond. Si tu vois encore un rond noir, c'est qu'il est **dans l'image elle-même** (par exemple une icône découpée depuis la rangée du haut). Dans ce cas, il te faut des PNG avec un fond transparent.

## Ce que `useCloches` renvoie

| Champ | Rôle |
|---|---|
| `statut` | `'pret'` → `'enJeu'` → `'attente'` → `'enJeu'`… puis `'perdu'`, `'complet'` ou `'encaisse'` |
| `etape` | nombre de plats trouvés (pour calculer les gains) |
| `ligneActive` | ligne jouable (mode `'ligne'`) |
| `demarrer()` | lance la partie (+ vague) |
| `choisir(l, c)` | ce que fait la grille au toucher (tu peux l'appeler toi-même) |
| `encaisser()` | fin de partie, le joueur récupère ses gains |
| `reinitialiser()` | nouvelle partie |
| `vague(l, c)` | relancer la vague à la main |

**Afficher un seul message selon `statut`** corrige le bug où « Placez un pari » restait affiché sous « Sélectionnez un plat ! ». Regarde `exemple/EcranCloches.tsx`.

## Options

| Option | Défaut | Rôle |
|---|---|---|
| `lignes`, `colonnes` | 5, 5 | taille de la grille |
| `mode` | `'ligne'` | `'ligne'` = de bas en haut, une ligne à la fois ; `'libre'` = n'importe quelle cloche |
| `etapesMax` | `lignes` | nombre d'étapes pour finir la partie |
| `vagueAuDemarrage` | `true` | vague dorée quand la partie commence |
| `onGagne`, `onPerdu`, `onComplet` | — | appelés après les animations (son, vibration…) |
| `onErreur` | — | le serveur a échoué : la cloche se rallume et le joueur peut retoucher |
| `animations.delaiParColonne` | 90 | vitesse de la vague (ms entre deux colonnes) |
| `animations.dureeMontee` / `dureeDescente` | 180 / 340 | allumage et extinction d'une cloche |

## Props de `GrilleCloches`

| Prop | Rôle |
|---|---|
| `imageCloche` | ton image de cloche |
| `largeur` | largeur fixe (sinon toute la largeur du parent) |
| `styleLigne` | fond des lignes. Passe `{}` si ton décor a déjà les barres sombres |
| `styleLigneActive` | style en plus pour la ligne jouable |
| `echellePlat` | taille du plat par rapport à la case (1.25 par défaut) |
| `couleurBrillance` | couleur de la lumière (`'#FFF1A6'` par défaut) |

## Tu as déjà ta propre grille ?

Garde-la et utilise seulement les animations :

```tsx
import { useAnimationsCloches, Cloche } from './components/cloches';

const anim = useAnimationsCloches(5, 5);

// quand le serveur répond « gagné » sur (l, c) :
anim.reveler(l, c);
anim.vague({ ligne: l, colonne: c }, tesCases);   // tesCases[l][c].type = 'cloche' | 'gagne' | 'perdu'

// dans ton rendu, pour chaque case :
<Cloche anim={anim.get(l, c)} etat={tesCases[l][c]} largeur={58}
        imageCloche={require('./img/cloche.png')} onPress={() => ...} />
```
