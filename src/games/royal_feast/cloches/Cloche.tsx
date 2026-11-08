/**
 * Une case de la grille : la cloche avec son couvercle animé, sa lumière dorée,
 * et le plat révélé centré avec son aura chaleureuse.
 */
import React, { isValidElement } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { EtatCase, Plat } from './logique';
import type { AnimCase } from './useAnimationsCloches';

const HALO = require('./assets/halo.png');
const ECLAT_GAGNE = require('./assets/eclat-vert.png');
const ECLAT_PERDU = require('./assets/eclat-rouge.png');
const CLOCHE_IMG = require('../../../../assets/ui/cloche.png');

export type ClocheProps = {
  anim: AnimCase;
  etat: EtatCase;
  largeur: number;
  hauteur?: number;
  imageCloche?: ImageSourcePropType;
  onPress?: () => void;
  desactivee?: boolean;
  estLigneActive?: boolean;
  couleurBrillance?: string;
  echellePlat?: number;
  imageHalo?: ImageSourcePropType;
  imageEclatGagne?: ImageSourcePropType;
  imageEclatPerdu?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
};

function carreCentre(taille: number, largeur: number, hauteur: number) {
  return {
    position: 'absolute' as const,
    width: taille,
    height: taille,
    left: (largeur - taille) / 2,
    top: (hauteur - taille) / 2,
  };
}

function estElement(p: Plat): p is React.ReactElement {
  return isValidElement(p);
}

function ClocheComponent({
  anim,
  etat,
  largeur,
  hauteur,
  imageCloche = CLOCHE_IMG,
  onPress,
  desactivee,
  estLigneActive = true,
  couleurBrillance = '#FFF1A6',
  echellePlat = 1.30,
  imageHalo = HALO,
  imageEclatGagne = ECLAT_GAGNE,
  imageEclatPerdu = ECLAT_PERDU,
  style,
}: ClocheProps) {
  const h = hauteur ?? largeur * 0.9;
  const ouverte = etat.type !== 'cloche';

  // 1. Halo sur la cloche fermée (vague dorée au démarrage / gain, ou suspense au toucher)
  const styleHaloFerme = {
    opacity: anim.brille,
    transform: [
      {
        scale: anim.brille.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.25],
        }),
      },
    ],
  };

  // 2. Halo / Aura doré chaleureux permanent derrière la nourriture révélée
  const styleHaloRevele = {
    opacity: anim.apparition.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.85, 0.92],
    }),
    transform: [
      {
        scale: anim.apparition.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1.0],
        }),
      },
    ],
  };

  // 4. Apparition en zoom élastique du plat révélé (généreux et couvrant la cloche)
  const stylePlat = {
    opacity: anim.apparition.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 1],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        scale: anim.apparition.interpolate({
          inputRange: [0, 1],
          outputRange: [0.35, 1],
          extrapolate: 'clamp',
        }),
      },
      {
        translateY: anim.apparition.interpolate({
          inputRange: [0, 1],
          outputRange: [6, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  // 5. Éclat lumineux scintillant au pop
  const styleEclat = {
    opacity: anim.eclat.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0, 1, 0],
    }),
    transform: [
      {
        scale: anim.eclat.interpolate({
          inputRange: [0, 1],
          outputRange: [0.2, 1.5],
        }),
      },
    ],
  };

  const plat = ouverte ? etat.plat : undefined;
  const boiteCloche = carreCentre(largeur, largeur, h);
  const boitePlat = carreCentre(largeur * echellePlat, largeur, h);
  const boiteHalo = carreCentre(largeur * 1.5, largeur, h);

  // Ligne active mise en avant, lignes inactives légèrement assombries
  const opaciteLigne = estLigneActive ? 1.0 : 0.65;

  return (
    <Pressable
      onPress={onPress}
      disabled={desactivee || ouverte || !onPress}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={ouverte ? 'Plat révélé' : 'Cloche'}
      style={[
        {
          width: largeur,
          height: h,
          overflow: 'visible',
          zIndex: ouverte ? 2 : 1,
          backgroundColor: 'rgba(0, 0, 0, 0.001)', // Détection tactile optimale
          opacity: ouverte ? 1.0 : opaciteLigne,
        },
        style,
      ]}
    >
      {/* CLOCHE FERMÉE : La cloche dorée posée sur l'étagère */}
      {!ouverte && (
        <>
          <Image
            source={imageCloche}
            resizeMode="contain"
            style={boiteCloche}
          />
          {/* Halo doré pour les vagues et le suspense 350ms */}
          <Animated.Image
            source={imageHalo}
            resizeMode="contain"
            style={[boiteHalo, styleHaloFerme]}
          />
        </>
      )}

      {/* CLOCHE OUVERTE : Aucun fond rectangle, cloche 100% disparue, nourriture pure avec halo et pop */}
      {ouverte && (
        <>
          {/* A. Aura dorée chaleureuse enveloppant le plat révélé */}
          <Animated.Image
            source={imageHalo}
            resizeMode="contain"
            style={[boiteHalo, styleHaloRevele]}
          />

          {/* B. Plat révélé posé et centré sur l'étagère avec apparition en zoom (sans aucun fond) */}
          {plat != null &&
            (estElement(plat) ? (
              <Animated.View pointerEvents="none" style={[boitePlat, styles.centre, stylePlat]}>
                {plat}
              </Animated.View>
            ) : (
              <Animated.Image
                source={plat}
                resizeMode="contain"
                style={[
                  boitePlat,
                  stylePlat,
                  {
                    shadowColor: '#ff9900',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.85,
                    shadowRadius: 6,
                  },
                ]}
              />
            ))}

          {/* C. Éclat vert scintillant au pop */}
          <Animated.Image
            source={etat.type === 'perdu' ? imageEclatPerdu : imageEclatGagne}
            resizeMode="contain"
            style={[carreCentre(largeur * 1.5, largeur, h), styleEclat]}
          />
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center' },
  fullSize: { width: '100%', height: '100%' },
});

// Mémoïsation pour garantir 60 fps sur Android sans aucun re-render inutile de la grille
export const Cloche = React.memo(ClocheComponent, (prevProps, nextProps) => {
  return (
    prevProps.etat === nextProps.etat &&
    prevProps.desactivee === nextProps.desactivee &&
    prevProps.estLigneActive === nextProps.estLigneActive &&
    prevProps.largeur === nextProps.largeur &&
    prevProps.hauteur === nextProps.hauteur &&
    prevProps.anim === nextProps.anim &&
    prevProps.imageCloche === nextProps.imageCloche
  );
});
