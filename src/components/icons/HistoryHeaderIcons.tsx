import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';

export interface HistoryHeaderIconProps {
  size?: number;
  color?: string;
  cutoutColor?: string;
}

// 1. Icône Filtre Entonnoir Fendu (barre supérieure détachée + tige biseautée)
export const FilterFunnelIcon: React.FC<HistoryHeaderIconProps> = ({
  size = 23,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const effectiveColor = color || currentTheme?.primary || '#3982C6';
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {/* Barre horizontale supérieure séparée */}
      <Rect x="4" y="4" width="16" height="2.6" rx="1.2" fill={effectiveColor} />
      {/* Corps de l'entonnoir avec tige biseautée en bas */}
      <Path
        d="M4.8 8.1H19.2C19.55 8.1 19.75 8.5 19.52 8.77L13.9 14.3V18.4L10.1 20.6V14.3L4.48 8.77C4.25 8.5 4.45 8.1 4.8 8.1Z"
        fill={effectiveColor}
      />
    </Svg>
  );
};

// 2. Icône Cartes Empilées / Ticket (Header haut droite uniquement)
export const CouponScanHeaderIcon: React.FC<HistoryHeaderIconProps> = ({
  size = 25,
  color,
  cutoutColor,
}) => {
  const { currentTheme } = useThemeStore();
  const effectiveColor =
    color || (currentTheme?.isDark ? currentTheme.textSecondary : '#577089');
  const innerCutout =
    cutoutColor || currentTheme?.headerBackground || '#FFFFFF';

  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {/* Ligne supérieure fine de même largeur que la carte */}
      <Rect x="2.5" y="2.5" width="19" height="2" rx="0.9" fill={effectiveColor} />

      {/* Bloc principal arrondi au centre */}
      <Rect x="2.5" y="6.2" width="19" height="11.6" rx="2.4" fill={effectiveColor} />

      {/* Deux barres blanches alignées à gauche à l'intérieur du bloc */}
      <Rect x="5.8" y="9.3" width="6.6" height="1.9" rx="0.8" fill={innerCutout} />
      <Rect x="5.8" y="12.8" width="6.6" height="1.9" rx="0.8" fill={innerCutout} />

      {/* Ligne inférieure fine de même largeur que la carte */}
      <Rect x="2.5" y="19.5" width="19" height="2" rx="0.9" fill={effectiveColor} />
    </Svg>
  );
};

// 3. Icône Carte + Badge Plus (« Effectuer un dépôt »)
export const DepositCardPlusIcon: React.FC<HistoryHeaderIconProps> = ({
  size = 25,
  color = '#48B16E',
  cutoutColor = '#DCF2E3',
}) => (
  <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
    {/* Carte arrondie en haut à gauche */}
    <Rect x="2.5" y="3" width="15.5" height="13" rx="3" fill={color} />
    {/* Fente horizontale supérieure */}
    <Rect x="5.2" y="5.8" width="9.8" height="1.8" rx="0.9" fill={cutoutColor} />
    {/* Découpe circulaire autour du badge + */}
    <Circle cx="15.8" cy="15.5" r="6.8" fill={cutoutColor} />
    {/* Cercle plein vert avec signe + */}
    <Circle cx="15.8" cy="15.5" r="5.3" fill={color} />
    <Rect x="13.1" y="14.65" width="5.4" height="1.7" rx="0.6" fill={cutoutColor} />
    <Rect x="14.95" y="12.8" width="1.7" height="5.4" rx="0.6" fill={cutoutColor} />
  </Svg>
);

// 4. Icône Étiquette Diagonale (« Vente »)
export const SaleTagHeaderIcon: React.FC<HistoryHeaderIconProps> = ({
  size = 23,
  color,
  cutoutColor = '#EAEEF4',
}) => {
  const { currentTheme } = useThemeStore();
  const effectiveColor = color || currentTheme?.primary || '#3982C6';
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M4.2 6.2C4.2 5.09543 5.09543 4.2 6.2 4.2H11.35C11.95 4.2 12.52 4.44 12.94 4.86L19.34 11.26C20.22 12.14 20.22 13.56 19.34 14.44L14.44 19.34C13.56 20.22 12.14 20.22 11.26 19.34L4.86 12.94C4.44 12.52 4.2 11.95 4.2 11.35V6.2Z"
        fill={effectiveColor}
      />
      <Circle cx="8.3" cy="8.3" r="1.85" fill={cutoutColor} />
    </Svg>
  );
};
