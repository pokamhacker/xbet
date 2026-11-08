import React from 'react';
import { StyleProp, ViewStyle, Image, ImageStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { Colors } from '../../theme/theme';

export interface BetLayersIconProps {
  /** Taille en pixels (largeur et hauteur), par défaut 15 */
  size?: number;
  /** Couleur principale (par défaut : couleur primary du thème actif) */
  color?: string;
  /** Couleur spécifique de la plaque supérieure en mode relief */
  primaryColor?: string;
  /** Couleur des tranches inférieures et ombres en mode relief */
  shadowColor?: string;
  /** Couleur claire des faces supérieures des plaques inférieures en mode 3D */
  lightColor?: string;
  /** Mode de rendu : 'flat' (vectoriel SVG), '3d' (isométrique ombré) ou 'image' (PNG ic_events_layers teinté) */
  variant?: 'flat' | '3d' | 'image';
  /** Utiliser l'asset PNG ic_events_layers.png teinté plutôt que le SVG */
  useImageAsset?: boolean;
  /** Rayon d'arrondi (par défaut 1px) */
  borderRadius?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

// ============================================================================
// TRACÉS VECTORIELS OFFICIELS CALIBRÉS SUR LA CAPTURE NATIVE (ic_events_layers)
// Repères : viewBox 0 0 24 24 — Losange supérieur + 2 chevrons avec arrondi 1px
// ============================================================================
const OFFICIAL_LAYERS_TOP =
  'M 10.50 2.81 L 3.15 6.78 Q 1.65 7.50 3.15 8.22 L 10.50 12.19 Q 12.00 13.00 13.50 12.19 L 20.85 8.22 Q 22.35 7.50 20.85 6.78 L 13.50 2.81 Q 12.00 2.00 10.50 2.81 Z';

const OFFICIAL_LAYERS_MID =
  'M 3.12 11.84 L 10.75 15.89 Q 12.00 16.55 13.25 15.89 L 20.88 11.84';

const OFFICIAL_LAYERS_BOT =
  'M 3.12 16.74 L 10.75 20.79 Q 12.00 21.45 13.25 20.79 L 20.88 16.74';

/**
 * Composant représentant les 3 calques / disques empilés (ic_events_layers)
 * de l'interface coupon et historique.
 *
 * Applique systématiquement la couleur `primary` du thème actif
 * (1xBet bleu #243DB5 / #488DD2, Melbet jaune/or, etc.).
 */
export const BetLayersIcon: React.FC<BetLayersIconProps> = ({
  size = 15,
  color,
  primaryColor,
  shadowColor,
  lightColor,
  variant = 'flat',
  useImageAsset = false,
  borderRadius = 5,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const themePrimary = currentTheme?.colors?.primary || currentTheme?.primary || Colors.primary;

  const effectivePrimary = primaryColor || color || themePrimary;
  const effectiveShadow = shadowColor || currentTheme?.border || '#243DB5';
  const effectiveLight = lightColor || currentTheme?.primarySoft || '#243DB5';

  // Rendu PNG teinté avec la couleur primaire du thème
  if (variant === 'image' || useImageAsset) {
    return (
      <Image
        source={require('../../../assets/icons/ic_events_layers.png')}
        style={[
          {
            width: size,
            height: size,
            borderRadius,
            tintColor: effectivePrimary,
          },
          style as StyleProp<ImageStyle>,
        ]}
        resizeMode="contain"
      />
    );
  }

  // Rendu 3D isométrique ombré
  if (variant === '3d') {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={[{ borderRadius }, style as StyleProp<ViewStyle>]}
      >
        {/* Étage 3 (Bas) */}
        <Path
          d="M 3.2 16.5 L 11.2 21.7 Q 12 22.2 12.8 21.7 L 20.8 16.5 Q 21.6 16.0 21.6 17.0 L 21.6 17.4 Q 21.6 18.0 20.8 18.5 L 12.8 23.7 Q 12 24.2 11.2 23.7 L 3.2 18.5 Q 2.4 18.0 2.4 17.4 L 2.4 17.0 Q 2.4 16.0 3.2 16.5 Z"
          fill={effectiveShadow}
        />
        <Path
          d="M 3.2 14.7 L 11.2 19.9 Q 12 20.4 12.8 19.9 L 20.8 14.7 Q 21.6 14.2 21.6 15.0 L 21.6 15.6 Q 21.6 16.3 20.8 16.8 L 12.8 22.0 Q 12 22.5 11.2 22.0 L 3.2 16.8 Q 2.4 16.3 2.4 15.6 L 2.4 15.0 Q 2.4 14.2 3.2 14.7 Z"
          fill={effectiveLight}
        />

        {/* Étage 2 (Intermédiaire) */}
        <Path
          d="M 3.2 12.5 L 11.2 17.7 Q 12 18.2 12.8 17.7 L 20.8 12.5 Q 21.6 12.0 21.6 13.0 L 21.6 13.4 Q 21.6 14.0 20.8 14.5 L 12.8 19.7 Q 12 20.2 11.2 19.7 L 3.2 14.5 Q 2.4 14.0 2.4 13.4 L 2.4 13.0 Q 2.4 12.0 3.2 12.5 Z"
          fill={effectiveShadow}
        />
        <Path
          d="M 3.2 10.7 L 11.2 15.9 Q 12 16.4 12.8 15.9 L 20.8 10.7 Q 21.6 10.2 21.6 11.0 L 21.6 11.6 Q 21.6 12.3 20.8 12.8 L 12.8 18.0 Q 12 18.5 11.2 18.0 L 3.2 12.8 Q 2.4 12.3 2.4 11.6 L 2.4 11.0 Q 2.4 10.2 3.2 10.7 Z"
          fill={effectiveLight}
        />

        {/* Étage 1 (Haut) */}
        <Path
          d="M 3.2 7.7 L 11.2 12.9 Q 12 13.4 12.8 12.9 L 20.8 7.7 Q 21.6 7.2 21.6 8.2 L 21.6 8.6 Q 21.6 9.2 20.8 9.7 L 12.8 14.9 Q 12 15.4 11.2 14.9 L 3.2 9.7 Q 2.4 9.2 2.4 8.6 L 2.4 8.2 Q 2.4 7.2 3.2 7.7 Z"
          fill={effectiveShadow}
        />
        <Path
          d="M 11.2 1.5 Q 12 1.0 12.8 1.5 L 21.2 6.8 Q 21.9 7.3 21.2 7.8 L 12.8 13.1 Q 12 13.6 11.2 13.1 L 2.8 7.8 Q 2.1 7.3 2.8 6.8 Z"
          fill={effectivePrimary}
        />
      </Svg>
    );
  }

  // Rendu vectoriel officiel ic_events_layers (3 calques empilés avec arrondi 1px)
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={[{ borderRadius }, style as StyleProp<ViewStyle>]}
    >
      {/* 1. Étage supérieur (Losange arrondi 1px plein) */}
      <Path d={OFFICIAL_LAYERS_TOP} fill={effectivePrimary} />

      {/* 2. Étage intermédiaire (Chevron à arrondi 1px) */}
      <Path
        d={OFFICIAL_LAYERS_MID}
        stroke={effectivePrimary}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 3. Étage inférieur (Chevron à arrondi 1px) */}
      <Path
        d={OFFICIAL_LAYERS_BOT}
        stroke={effectivePrimary}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

/**
 * Composant Image direct pour ic_events_layers.png avec tintColor automatique sur la couleur primary du thème
 */
export const EventsLayersImage: React.FC<{
  size?: number;
  color?: string;
  borderRadius?: number;
  style?: StyleProp<ImageStyle>;
}> = ({ size = 16, color, borderRadius = 1, style }) => {
  const { currentTheme } = useThemeStore();
  const tintColor = color || currentTheme?.colors?.primary || currentTheme?.primary || Colors.primary;

  return (
    <Image
      source={require('../../../assets/icons/ic_events_layers.png')}
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          tintColor,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export default BetLayersIcon;
