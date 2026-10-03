import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';

export interface TicketNotchDividerProps {
  notchSize?: number;
  backgroundColor?: string;
  ticketColor?: string;
  dashedColor?: string;
  style?: ViewStyle;
}

export const TicketNotchDivider: React.FC<TicketNotchDividerProps> = ({
  notchSize = 16,
  backgroundColor,
  ticketColor,
  dashedColor,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark || currentTheme.name === 'melbet';

  // Couleur des pointillés subtile et fidèle à la capture officielle
  const dashColor =
    dashedColor ||
    (isDark ? 'rgba(255, 255, 255, 0.25)' : '#D1D9E4');

  // Fond des encoches (identique au fond de l'écran parent)
  const screenBg =
    backgroundColor ||
    (currentTheme as any).colors?.background ||
    currentTheme.background ||
    '#EEF2F6';

  const radius = Math.round(notchSize / 2); // 8px pour notchSize = 16

  return (
    <View style={[styles.container, style]}>
      {/* Encoche Gauche (Demi-cercle parfait découpé vers l'intérieur) */}
      <View
        style={[
          styles.notchLeft,
          {
            width: radius,
            height: notchSize,
            borderTopRightRadius: radius,
            borderBottomRightRadius: radius,
            backgroundColor: screenBg,
          },
        ]}
      />

      {/* Ligne Pointillée SVG nette et fidèle */}
      <View style={[styles.dashedLineContainer, { marginHorizontal: radius + 4 }]}>
        <Svg width="100%" height="2">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={dashColor}
            strokeWidth="1.2"
            strokeDasharray="4, 4"
          />
        </Svg>
      </View>

      {/* Encoche Droite (Demi-cercle parfait découpé vers l'intérieur) */}
      <View
        style={[
          styles.notchRight,
          {
            width: radius,
            height: notchSize,
            borderTopLeftRadius: radius,
            borderBottomLeftRadius: radius,
            backgroundColor: screenBg,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 18,
    position: 'relative',
    marginVertical: 2,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  notchLeft: {
    position: 'absolute',
    left: 0,
    zIndex: 2,
    borderWidth: 0,
  },
  notchRight: {
    position: 'absolute',
    right: 0,
    zIndex: 2,
    borderWidth: 0,
  },
  dashedLineContainer: {
    flex: 1,
    height: 2,
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default TicketNotchDivider;
