import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface BetLayersIconProps {
  /** Taille en pixels (largeur et hauteur), par défaut 15 */
  size?: number;
  /** Couleur principale (défaut #56728A ou #64748B) */
  color?: string;
  /** Couleur spécifique de la plaque supérieure en mode relief (défaut #56728A) */
  primaryColor?: string;
  /** Couleur des tranches inférieures et ombres en mode relief (défaut #3E5468) */
  shadowColor?: string;
  /** Couleur claire des faces supérieures des plaques inférieures en mode 3D (défaut #EBF1F6) */
  lightColor?: string;
  /** Mode de rendu : 'flat' (silhouette vectorielle exacte 7383.ai / 7383.jpg) ou '3d' (relief isométrique ombré) */
  variant?: 'flat' | '3d';
  style?: StyleProp<ViewStyle>;
}

// ============================================================================
// TRACÉS VECTORIELS MATHEMATIQUEMENT EXACTS EXTRAITS DE 7383.ai / 7383.jpg
// Repères d'origine : Canvas 800x800, Vue isométrique orthogonale à 30°
// ============================================================================
const EXACT_7383_TOP =
  'M 400.00 484.47 C 397.83 484.47, 395.65 483.86, 393.75 482.64 L 125.98 310.56 C 122.67 308.43, 120.67 304.77, 120.67 300.84 C 120.67 296.90, 122.67 293.24, 125.98 291.11 L 393.75 119.03 C 395.65 117.81, 397.83 117.20, 400.00 117.20 C 402.17 117.20, 404.35 117.81, 406.25 119.03 L 674.02 291.11 C 677.33 293.24, 679.33 296.90, 679.33 300.84 C 679.33 304.77, 677.33 308.43, 674.02 310.56 L 406.25 482.64 C 404.35 483.86, 402.17 484.47, 400.00 484.47 Z';

const EXACT_7383_MID =
  'M 400.00 583.64 C 397.83 583.64, 395.65 583.03, 393.75 581.80 L 125.98 409.72 C 122.67 407.60, 120.67 403.93, 120.67 400.00 C 120.67 396.07, 122.67 392.40, 125.98 390.28 L 151.18 374.08 C 153.09 372.86, 155.26 372.24, 157.43 372.24 C 159.60 372.24, 161.78 372.86, 163.68 374.08 L 400.00 525.94 L 636.32 374.08 C 638.22 372.86, 640.39 372.24, 642.57 372.24 C 644.74 372.24, 646.91 372.86, 648.82 374.08 L 674.02 390.28 C 677.33 392.40, 679.33 396.07, 679.33 400.00 C 679.33 403.93, 677.33 407.60, 674.02 409.72 L 406.25 581.80 C 404.35 583.03, 402.17 583.64, 400.00 583.64 Z';

const EXACT_7383_BOT =
  'M 400.00 682.80 C 397.83 682.80, 395.65 682.19, 393.75 680.97 L 125.98 508.89 C 122.67 506.76, 120.67 503.10, 120.67 499.17 C 120.67 495.23, 122.67 491.57, 125.98 489.44 L 151.18 473.24 C 153.09 472.02, 155.26 471.41, 157.43 471.41 C 159.60 471.41, 161.78 472.02, 163.68 473.24 L 400.00 625.11 L 636.32 473.24 C 638.22 472.02, 640.39 471.41, 642.57 471.41 C 644.74 471.41, 646.91 472.02, 648.82 473.24 L 674.02 489.44 C 677.33 491.57, 679.33 495.23, 679.33 499.17 C 679.33 503.10, 677.33 506.76, 674.02 508.89 L 406.25 680.97 C 404.35 682.19, 402.17 682.80, 400.00 682.80 Z';

/**
 * Composant d'icône vectorielle SVG représentant les 3 calques / disques
 * empilés en perspective isométrique à 30° (« Simple 1 », « Combiné 2 »,
 * et sélections multiples dans l'interface Coupon).
 *
 * Directement extrait des courbes Bézier de l'asset vectoriel officiel 7383.ai.
 */
export const BetLayersIcon: React.FC<BetLayersIconProps> = ({
  size = 15,
  color,
  primaryColor,
  shadowColor,
  lightColor,
  variant = 'flat',
  style,
}) => {
  const effectivePrimary = primaryColor || color || '#56728A';
  const effectiveShadow = shadowColor || '#3E5468';
  const effectiveLight = lightColor || '#EBF1F6';

  if (variant === '3d') {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={style}
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

  // Rendu vectoriel exact 7383.ai / 7383.jpg (3 plaques empilées découpées)
  return (
    <Svg
      width={size}
      height={size}
      viewBox="100 100 600 600"
      fill="none"
      style={style}
    >
      {/* 1. Étage supérieur (Losange complet) */}
      <Path d={EXACT_7383_TOP} fill={effectivePrimary} />

      {/* 2. Étage intermédiaire (Chevron) */}
      <Path d={EXACT_7383_MID} fill={effectivePrimary} />

      {/* 3. Étage inférieur (Chevron) */}
      <Path d={EXACT_7383_BOT} fill={effectivePrimary} />
    </Svg>
  );
};

export default BetLayersIcon;
