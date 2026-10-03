import React from 'react';
import Svg, { Rect, Circle, SvgProps } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';

export interface ToggleCardIconProps extends SvgProps {
  size?: number;
  bgColor?: string;
  cardColor?: string;
  circleColor?: string;
  detailColor?: string;
  containerBg?: string;
}

export const ToggleCardIcon: React.FC<ToggleCardIconProps> = ({
  size = 64,
  bgColor = 'transparent',
  cardColor,
  circleColor,
  detailColor,
  containerBg,
  ...props
}) => {
  const { currentTheme } = useThemeStore();
  // La carte a pour fond #9FADB6 sur tous les thèmes
  const resolvedCardColor = cardColor || '#9FADB6';

  // Couleur d'arrière-plan du conteneur où l'icône est positionnée (ex: fond de la carte du ticket)
  // Les deux cercles s'adaptent directement à cette couleur de fond selon la charte du thème
  const resolvedCircleColor =
    circleColor ||
    containerBg ||
    currentTheme.colors?.cardBackground ||
    currentTheme.cardBackground ||
    (currentTheme.isDark ? '#2C353D' : '#FFFFFF');

  const resolvedDetailColor =
    detailColor ||
    resolvedCircleColor;

  return (
    <Svg fill="none" height={size} viewBox="0 0 64 64" width={size} {...props}>
      {/* 1. Fond global aux coins arrondis (si spécifié) */}
      {bgColor && bgColor !== 'transparent' && (
        <Rect fill={bgColor} height="64" rx="10" width="64" />
      )}

      {/* 2. Carte supérieure (Pillule avec switch + 2 barres) */}
      <Rect fill={resolvedCardColor} height="22" rx="7" width="52" x="6" y="8" />
      <Circle cx="17" cy="19" fill={resolvedCircleColor} r="6" />
      <Rect fill={resolvedDetailColor} height="4" rx="2" width="22" x="28" y="13" />
      <Rect fill={resolvedDetailColor} height="4" rx="2" width="14" x="28" y="20" />

      {/* 3. Carte inférieure (Pillule avec switch + 2 barres) */}
      <Rect fill={resolvedCardColor} height="22" rx="7" width="52" x="6" y="34" />
      <Circle cx="17" cy="45" fill={resolvedCircleColor} r="6" />
    </Svg>
  );
};

export default ToggleCardIcon;
