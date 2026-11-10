import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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

  // 1. Couleurs adaptées au thème actif (Capture 1 & 3 : #4A84C4 actif, #6E849B inactif)
  const activeColor =
    (focused && color) ||
    currentTheme.bottomBar?.active ||
    currentTheme.primary ||
    '#4A84C4';

  const inactiveColor =
    (!focused && color) ||
    currentTheme.bottomBar?.inactive ||
    currentTheme.textSecondary ||
    (isDark ? '#7C8B99' : '#6E849B');

  // Disque plein de 22x22 en couleur active (#4A84C4) ou inactive (#6E849B)
  const discBgColor = focused ? activeColor : inactiveColor;

  // Couleur des aiguilles au centre : blanc (#FFFFFF) ou centerTint du thème
  const rawCenterTint = currentTheme.bottomBar?.centerTint;
  const needleColor =
    rawCenterTint && rawCenterTint.length >= 4 && rawCenterTint !== '#FFFFF'
      ? rawCenterTint
      : '#FFFFFF';

  const discSize = size;

  return (
    <View style={styles.container}>
      {/* Disque plein 22x22 (Circle cx="12" cy="12" r="9.5") + aiguilles blanches centrées formant un L net */}
      <View style={styles.iconWrapper}>
        <Svg width={discSize} height={discSize} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9.5" fill={discBgColor} />
          <Path
            d="M12 7.5V12.5H15.5"
            stroke={needleColor}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Libellé Historique en dessous : fontSize: 11, fontWeight: '500', couleur #4A84C4 lorsqu'il est actif */}
      {showLabel && (
        <Text
          style={[
            styles.label,
            { color: focused ? activeColor : inactiveColor },
            focused ? styles.activeLabel : styles.inactiveLabel,
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
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: -0.1,
    fontFamily: Typography.fontFamily,
    fontWeight: '500',
    marginTop: 1,
  },
  activeLabel: {
    fontWeight: '500',
  },
  inactiveLabel: {
    fontWeight: '500',
  },
});
