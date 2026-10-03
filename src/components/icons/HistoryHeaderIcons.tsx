import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';

interface IconProps {
  size?: number;
  color?: string;
}

// 1. Icône Filtre Entonnoir Exacte
export const FilterFunnelIcon: React.FC<IconProps> = ({ size = 24, color }) => {
  const { currentTheme } = useThemeStore();
  const effectiveColor = color || currentTheme?.primary || '#3B6A99';
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M3 4H21V6.5L14 13.5V20L10 22V13.5L3 6.5V4Z" fill={effectiveColor} />
    </Svg>
  );
};

// 2. Icône Ticket / Scan avec Lignes Supérieure & Inférieure Exacte
export const CouponScanHeaderIcon: React.FC<IconProps> = ({ size = 26, color }) => {
  const { currentTheme } = useThemeStore();
  const effectiveColor = color || currentTheme?.primary || '#3B6A99';
  return (
    <Svg fill="none" height={size} viewBox="0 0 26 24" width={size}>
      {/* Ligne supérieure fine */}
      <Rect fill={effectiveColor} height="2" rx="1" width="18" x="4" y="2" />

      {/* Bloc principal arrondi au centre */}
      <Rect fill={effectiveColor} height="12" rx="3.5" width="22" x="2" y="6" />

      {/* Deux barres/puces blanches à l'intérieur du bloc */}
      <Rect fill="#FFFFFF" height="2" rx="1" width="10" x="8" y="9" />
      <Rect fill="#FFFFFF" height="2" rx="1" width="10" x="8" y="13" />

      {/* Ligne inférieure fine */}
      <Rect fill={effectiveColor} height="2" rx="1" width="18" x="4" y="20" />
    </Svg>
  );
};
