/**
 * La grille complète, branchée sur useCloches().
 *   <GrilleCloches jeu={jeu} imageCloche={require('./img/cloche.png')} />
 * Elle prend toute la largeur disponible (ou `largeur` si tu la donnes).
 */
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Cloche } from './Cloche';
import type { JeuCloches } from './useCloches';

export type GrilleClochesProps = {
  jeu: JeuCloches;
  imageCloche: ImageSourcePropType;
  /** largeur totale en px (sinon : largeur du parent) */
  largeur?: number;
  /** espace entre deux cloches (défaut 6) */
  espacement?: number;
  /** fond de chaque ligne. Passe {} si ton décor a déjà les barres. */
  styleLigne?: StyleProp<ViewStyle>;
  /** style en plus pour la ligne jouable (mode 'ligne') */
  styleLigneActive?: StyleProp<ViewStyle>;
  couleurBrillance?: string;
  echellePlat?: number;
  style?: StyleProp<ViewStyle>;
};

const PADDING_LIGNE = 10;

export function GrilleCloches({
  jeu,
  imageCloche,
  largeur,
  espacement = 6,
  styleLigne,
  styleLigneActive,
  couleurBrillance,
  echellePlat,
  style,
}: GrilleClochesProps) {
  const [largeurMesuree, setLargeurMesuree] = useState(0);
  const W = largeur ?? largeurMesuree;

  const onLayout = (e: LayoutChangeEvent) => {
    if (largeur == null) setLargeurMesuree(e.nativeEvent.layout.width);
  };

  const tailleCase = W > 0 ? (W - PADDING_LIGNE * 2 - espacement * (jeu.colonnes - 1)) / jeu.colonnes : 0;

  return (
    <View onLayout={onLayout} style={[{ width: largeur ?? '100%' }, style]}>
      {tailleCase > 0 &&
        jeu.cases.map((ligne, l) => (
          <View
            key={l}
            style={[
              styles.ligne,
              styleLigne ?? styles.fondLigne,
              l === jeu.ligneActive && jeu.statut === 'enJeu' ? styleLigneActive : null,
              // une ligne avec un plat révélé passe devant : le plat déborde sans être coupé
              ligne.some((e) => e.type !== 'cloche') ? { zIndex: 2 } : null,
            ]}
          >
            {ligne.map((etat, c) => (
              <Cloche
                key={c}
                anim={jeu.anim.get(l, c)}
                etat={etat}
                largeur={tailleCase}
                imageCloche={imageCloche}
                desactivee={!jeu.peutChoisir(l, c)}
                onPress={() => jeu.choisir(l, c)}
                couleurBrillance={couleurBrillance}
                echellePlat={echellePlat}
                style={c > 0 ? { marginLeft: espacement } : undefined}
              />
            ))}
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING_LIGNE,
    paddingVertical: 4,
    marginVertical: 4,
    overflow: 'visible',
  },
  fondLigne: {
    backgroundColor: 'rgba(30, 6, 3, 0.75)',
    borderRadius: 999,
  },
});
