/**
 * Une case de la grille : la cloche, sa lumière dorée, et le plat révélé (SANS fond noir).
 * Utilisable seule dans ta propre grille avec les valeurs de useAnimationsCloches().
 */
import React, { isValidElement } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { EtatCase, Plat } from './logique';
import type { AnimCase } from './useAnimationsCloches';

const HALO = require('./assets/halo.png');
const ECLAT_GAGNE = require('./assets/eclat-vert.png');
const ECLAT_PERDU = require('./assets/eclat-rouge.png');

export type ClocheProps = {
  anim: AnimCase;
  etat: EtatCase;
  /** largeur de la case en px */
  largeur: number;
  /** hauteur de la case (défaut : largeur × 0.9) */
  hauteur?: number;
  /** TON image de cloche (PNG fond transparent) */
  imageCloche: ImageSourcePropType;
  onPress?: () => void;
  desactivee?: boolean;
  /** couleur de la lumière sur la cloche (défaut jaune doré) */
  couleurBrillance?: string;
  /** taille du plat par rapport à la case (défaut 1.25 : plus grand que la cloche, comme le vrai jeu) */
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

export function Cloche({
  anim,
  etat,
  largeur,
  hauteur,
  imageCloche,
  onPress,
  desactivee,
  couleurBrillance = '#FFF1A6',
  echellePlat = 1.25,
  imageHalo = HALO,
  imageEclatGagne = ECLAT_GAGNE,
  imageEclatPerdu = ECLAT_PERDU,
  style,
}: ClocheProps) {
  const h = hauteur ?? largeur * 0.9;
  const ouverte = etat.type !== 'cloche';

  const styleHalo = {
    opacity: anim.brille,
    transform: [{ scale: anim.brille.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
  };
  const styleReflet = {
    tintColor: couleurBrillance,
    opacity: anim.brille.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
  };
  const stylePlat = {
    opacity: anim.apparition.interpolate({ inputRange: [0, 0.6], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [{ scale: anim.apparition.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
  };
  const styleEclat = {
    opacity: anim.eclat.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
    transform: [{ scale: anim.eclat.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.6] }) }],
  };

  const plat = ouverte ? etat.plat : undefined;
  const boitePlat = carreCentre(largeur * echellePlat, largeur, h);

  return (
    <Pressable
      onPress={onPress}
      disabled={desactivee || ouverte || !onPress}
      accessibilityRole="button"
      accessibilityLabel={ouverte ? 'Plat révélé' : 'Cloche'}
      style={[{ width: largeur, height: h, overflow: 'visible', zIndex: ouverte ? 2 : 1 }, style]}
    >
      {!ouverte && (
        <>
          {/* halo doré derrière la cloche */}
          <Animated.Image source={imageHalo} resizeMode="contain" style={[carreCentre(largeur * 1.7, largeur, h), styleHalo]} />
          {/* la cloche */}
          <Image source={imageCloche} resizeMode="contain" style={{ width: largeur, height: h }} />
          {/* la même cloche teintée par-dessus = effet « elle s'illumine » */}
          <Animated.Image source={imageCloche} resizeMode="contain" style={[StyleSheet.absoluteFill, styleReflet]} />
        </>
      )}

      {/* le plat : directement l'image, sans rond ni fond derrière */}
      {plat != null &&
        (estElement(plat) ? (
          <Animated.View style={[boitePlat, styles.centre, stylePlat]}>{plat}</Animated.View>
        ) : (
          <Animated.Image source={plat} resizeMode="contain" style={[boitePlat, stylePlat]} />
        ))}

      {/* éclat vert (gagné) ou rouge (perdu) */}
      {ouverte && (
        <Animated.Image
          source={etat.type === 'perdu' ? imageEclatPerdu : imageEclatGagne}
          resizeMode="contain"
          style={[carreCentre(largeur * 1.5, largeur, h), styleEclat]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center' },
});
