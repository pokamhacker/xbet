import React from 'react';
import Svg, { Path, Rect, G } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';

/**
 * 1. TrashBinIcon: reproduction vectorielle pixel-perfect de l'icône Corbeille du Header Coupon
 * - Couvercle horizontal en capsule arrondie détachée (sans poignée haute)
 * - Espace transparent net entre le couvercle et la cuve
 * - Corps arrondi avec 2 fentes verticales percées (fillRule="evenodd" pour transparence native sur tout fond)
 */
export const TrashBinIcon: React.FC<{
  size?: number;
  color?: string;
  cutoutColor?: string;
}> = ({
  size = 20,
  color,
}) => {
  const { currentTheme, isDark } = useThemeStore();
  const effectiveIsDark = isDark ?? currentTheme?.isDark ?? false;
  const iconColor = color || (effectiveIsDark ? '#94A1B4' : '#557089');

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Barre supérieure du couvercle horizontal en capsule arrondie */}
      <Rect x="3.5" y="2.2" width="17" height="3.1" rx="1.55" fill={iconColor} />

      {/* Corps principal de la corbeille (y=7.4..22.0) avec 2 fentes verticales percées */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 7.5 7.4 H 16.5 A 3.2 3.2 0 0 1 19.7 10.6 V 18.8 A 3.2 3.2 0 0 1 16.5 22.0 H 7.5 A 3.2 3.2 0 0 1 4.3 18.8 V 10.6 A 3.2 3.2 0 0 1 7.5 7.4 Z M 9.4 10.4 A 1.1 1.1 0 0 1 10.5 11.5 V 17.7 A 1.1 1.1 0 0 1 8.3 17.7 V 11.5 A 1.1 1.1 0 0 1 9.4 10.4 Z M 14.6 10.4 A 1.1 1.1 0 0 1 15.7 11.5 V 17.7 A 1.1 1.1 0 0 1 13.5 17.7 V 11.5 A 1.1 1.1 0 0 1 14.6 10.4 Z"
        fill={iconColor}
      />
    </Svg>
  );
};

/**
 * 1B. DiagonalCouponTicketIcon: icône de ticket perforé incliné en diagonale
 * Affichée à gauche du compteur d'événements ("1") dans le Bottom Sheet 1xBet
 */
export const DiagonalCouponTicketIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({
  size = 15,
  color,
}) => {
  const { currentTheme, isDark } = useThemeStore();
  const effectiveIsDark = isDark ?? currentTheme?.isDark ?? false;
  const iconColor = color || (effectiveIsDark ? '#8FA2B6' : '#5C7690');

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G transform="rotate(-28 12 12)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 4.5 6.2 H 8.3 A 1.2 1.2 0 0 0 10.7 6.2 H 19.5 A 2.2 2.2 0 0 1 21.7 8.4 V 9.5 A 2.5 2.5 0 0 0 21.7 14.5 V 15.6 A 2.2 2.2 0 0 1 19.5 17.8 H 10.7 A 1.2 1.2 0 0 0 8.3 17.8 H 4.5 A 2.2 2.2 0 0 1 2.3 15.6 V 14.5 A 2.5 2.5 0 0 0 2.3 9.5 V 8.4 A 2.2 2.2 0 0 1 4.5 6.2 Z M 9.5 9.1 A 1.15 1.15 0 1 0 9.5 11.4 A 1.15 1.15 0 1 0 9.5 9.1 Z M 9.5 12.6 A 1.15 1.15 0 1 0 9.5 14.9 A 1.15 1.15 0 1 0 9.5 12.6 Z"
          fill={iconColor}
        />
      </G>
    </Svg>
  );
};

/**
 * 1C. SoccerBallCouponIcon: ballon de football géométrique à hexagone central et 6 pans
 * Sans fond résiduel pour un rendu net sur tous les thèmes clairs, sombres et noirs
 */
export const SoccerBallCouponIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({
  size = 16,
  color,
}) => {
  const { currentTheme, isDark } = useThemeStore();
  const effectiveIsDark = isDark ?? currentTheme?.isDark ?? false;
  const iconColor = color || (effectiveIsDark ? '#8FA2B6' : '#5C7690');

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Hexagone central */}
      <Path
        d="M 12 7.2 L 16.2 9.6 V 14.4 L 12 16.8 L 7.8 14.4 V 9.6 Z"
        fill={iconColor}
      />
      {/* Pan supérieur gauche */}
      <Path
        d="M 11.1 1.6 V 5.6 L 6.7 8.1 L 3.3 6.1 A 10.5 10.5 0 0 1 11.1 1.6 Z"
        fill={iconColor}
      />
      {/* Pan supérieur droit */}
      <Path
        d="M 12.9 1.6 A 10.5 10.5 0 0 1 20.7 6.1 L 17.3 8.1 L 12.9 5.6 V 1.6 Z"
        fill={iconColor}
      />
      {/* Pan latéral gauche */}
      <Path
        d="M 2.3 7.7 L 5.8 9.7 V 14.3 L 2.3 16.3 A 10.5 10.5 0 0 1 2.3 7.7 Z"
        fill={iconColor}
      />
      {/* Pan latéral droit */}
      <Path
        d="M 21.7 7.7 A 10.5 10.5 0 0 1 21.7 16.3 L 18.2 14.3 V 9.7 L 21.7 7.7 Z"
        fill={iconColor}
      />
      {/* Pan inférieur gauche */}
      <Path
        d="M 3.3 17.9 L 6.7 15.9 L 11.1 18.4 V 22.4 A 10.5 10.5 0 0 1 3.3 17.9 Z"
        fill={iconColor}
      />
      {/* Pan inférieur droit */}
      <Path
        d="M 12.9 22.4 V 18.4 L 17.3 15.9 L 20.7 17.9 A 10.5 10.5 0 0 1 12.9 22.4 Z"
        fill={iconColor}
      />
    </Svg>
  );
};

/**
 * 2. SaveCouponActionIcon: reproduction exacte de l'icône "Enregistrer le coupon de pari" (Image 2 - ligne 1)
 * Flèche descendante épaisse au-dessus d'une barre horizontale simple
 */
export const SaveCouponActionIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({
  size = 24,
  color,
}) => {
  const { isDark } = useThemeStore();
  const iconColor = color || (isDark ? '#94A3B8' : '#567994');

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Tige de la flèche descendante */}
      <Path
        d="M12 3.5 V14.5"
        stroke={iconColor}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pointe de la flèche descendante (V) */}
      <Path
        d="M7.2 9.8 L12 14.6 L16.8 9.8"
        stroke={iconColor}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Barre horizontale inférieure simple */}
      <Path
        d="M4.5 19.5 H19.5"
        stroke={iconColor}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * 3. LoadCouponActionIcon: reproduction exacte de l'icône "Charger le coupon de pari" (Image 2 - ligne 2)
 * Flèche montante épaisse au-dessus d'une barre horizontale simple
 */
export const LoadCouponActionIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({
  size = 24,
  color,
}) => {
  const { isDark } = useThemeStore();
  const iconColor = color || (isDark ? '#94A3B8' : '#567994');

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Tige de la flèche montante */}
      <Path
        d="M12 14.5 V4.5"
        stroke={iconColor}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pointe de la flèche montante (^) */}
      <Path
        d="M7.2 9.2 L12 4.4 L16.8 9.2"
        stroke={iconColor}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Barre horizontale inférieure simple */}
      <Path
        d="M4.5 19.5 H19.5"
        stroke={iconColor}
        strokeWidth={2.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * 4. CreateCouponActionIcon: reproduction exacte de l'icône "Créer un coupon de pari" (Image 2 - ligne 3)
 * Égaliseur à 3 curseurs horizontaux avec boutons de réglage verticaux arrondis
 */
export const CreateCouponActionIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({
  size = 24,
  color,
}) => {
  const { isDark } = useThemeStore();
  const iconColor = color || (isDark ? '#94A3B8' : '#567994');

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Piste 1 (Haut) : ligne gauche, curseur vertical à droite, courte ligne */}
      <Path
        d="M3.5 6 H13.5"
        stroke={iconColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Path
        d="M17.5 3 V9"
        stroke={iconColor}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M17.5 6 H20.5"
        stroke={iconColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />

      {/* Piste 2 (Milieu) : curseur vertical à gauche, longue ligne à droite */}
      <Path
        d="M7 9 V15"
        stroke={iconColor}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M3.5 12 H7"
        stroke={iconColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Path
        d="M10.5 12 H20.5"
        stroke={iconColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />

      {/* Piste 3 (Bas) : ligne gauche, curseur vertical au centre-droit, ligne droite */}
      <Path
        d="M3.5 18 H11"
        stroke={iconColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 15 V21"
        stroke={iconColor}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M14.5 18 H20.5"
        stroke={iconColor}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </Svg>
  );
};
