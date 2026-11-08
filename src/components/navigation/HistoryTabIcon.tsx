import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { Typography } from '../../theme/theme';

export interface HistoryTabIconProps {
  focused?: boolean;
  color?: string;
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export const HistoryTabIcon: React.FC<HistoryTabIconProps> = ({
  focused = false,
  color,
  size = 22,
  showLabel = true,
  label = 'Historique',
}) => {
  const { currentTheme, isDark } = useThemeStore();

  // 1. Couleurs adaptées au thème actif (1xBet, Melbet, Melbet Light, Paripesa, WinWin, BetWinner, MegaPari)
  const activeColor =
    (focused && color) ||
    currentTheme.bottomBar?.active ||
    currentTheme.primary ||
    '#2563EB';

  const inactiveColor =
    (!focused && color) ||
    currentTheme.bottomBar?.inactive ||
    currentTheme.textSecondary ||
    (isDark ? '#7C8B99' : '#7E95AC');

  // Le fond de la pastille prend la couleur active si sélectionné, sinon la couleur inactive (identique au fond plein de l'icône Favoris)
  const discBgColor = focused ? activeColor : inactiveColor;

  // Couleur des aiguilles au centre : blanc haute visibilité ou centerTint du thème
  const rawCenterTint = currentTheme.bottomBar?.centerTint;
  const needleColor =
    rawCenterTint && rawCenterTint.length >= 4 && rawCenterTint !== '#FFFFF'
      ? rawCenterTint
      : '#FFFFFF';

  // Dimensions
  const discSize = size;
  const needleSvgSize = Math.round(discSize * 0.65); // ~14px pour size=22

  return (
    <View style={styles.container}>
      {/* Pastille circulaire pleine à la couleur du thème (active ou inactive, calquée sur le fond de Favoris) */}
      <View
        style={[
          styles.circleDisc,
          {
            width: discSize,
            height: discSize,
            borderRadius: discSize / 2,
            backgroundColor: discBgColor,
          },
        ]}
      >
        <Svg width={needleSvgSize} height={needleSvgSize} viewBox="0 0 24 24" fill="none">
          {/* Aiguille d'horloge en L à angle droit (12h - 15h) parfaitement nette et lisible */}
          <Path
            d="M12 6.5V12H16.5"
            stroke={needleColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Libellé du texte dynamique selon l'état et le thème */}
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: focused ? activeColor : inactiveColor },
            focused && styles.activeLabel,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

export const HistoryIcon = HistoryTabIcon;
export default HistoryTabIcon;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  circleDisc: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 10.5,
    textAlign: 'center',
    letterSpacing: -0.1,
    fontFamily: Typography.fontFamily,
    fontWeight: '500',
    marginTop: 1,
  },
  activeLabel: {
    fontWeight: '700',
  },
  inactiveLabel: {
    fontWeight: '500',
  },
});
