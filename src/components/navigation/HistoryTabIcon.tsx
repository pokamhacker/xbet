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
  size = 24,
  showLabel = true,
  label = 'Historique',
}) => {
  const { currentTheme, isDark } = useThemeStore();

  // 1. Couleurs adaptées au thème actif (1xBet, Melbet, Melbet Light, Paripesa)
  const activeColor =
    color ||
    currentTheme.bottomBar?.active ||
    currentTheme.primary ||
    '#2563EB';

  const inactiveColor =
    currentTheme.bottomBar?.inactive ||
    currentTheme.textSecondary ||
    (isDark ? '#7C8B99' : '#7E95AC');

  // Couleur des aiguilles au centre de la pastille active (généralement blanc ou fort contraste)
  const needleColor = currentTheme.bottomBar?.centerTint || '#FFFFFF';

  // Dimensions proportionnelles
  const badgeSize = size + 2; // ex. 26 pour size=24
  const needleSvgSize = Math.round(size * 0.6); // ex. 14 pour size=24
  const outlineSvgSize = Math.max(size - 2, 18); // ex. 22 pour size=24

  return (
    <View style={styles.container}>
      {focused ? (
        /* ÉTAT ACTIF : Pastille circulaire pleine à la couleur du thème avec aiguilles d'horloge */
        <View
          style={[
            styles.activeCircle,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: activeColor,
            },
          ]}
        >
          <Svg width={needleSvgSize} height={needleSvgSize} viewBox="0 0 24 24" fill="none">
            {/* Cadran / Aiguille d'horloge en L */}
            <Path
              d="M12 7V12L15.5 14.9"
              stroke={needleColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      ) : (
        /* ÉTAT INACTIF : Horloge simple contour selon la teinte inactive du thème */
        <View
          style={[
            styles.inactiveContainer,
            {
              width: badgeSize,
              height: badgeSize,
            },
          ]}
        >
          <Svg width={outlineSvgSize} height={outlineSvgSize} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke={inactiveColor}
              strokeWidth="2"
            />
            <Path
              d="M12 6V12L16 14"
              stroke={inactiveColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      )}

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
  activeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  inactiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  label: {
    fontSize: 10.5,
    textAlign: 'center',
    letterSpacing: -0.1,
    fontFamily: Typography.fontFamily,
  },
  activeLabel: {
    fontWeight: '700',
  },
  inactiveLabel: {
    fontWeight: '500',
  },
});
