import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useThemeStore } from '../stores/themeStore';

export interface TicketDividerProps {
  backgroundColor?: string; // Couleur de fond exacte derrière la carte (ex: #EDF0F5 ou #18222D)
  dotColor?: string;        // Couleur des pointillés (ex: #DCE1E7 ou #2C3A4B)
  notchSize?: number;       // Diamètre de l'encoche (défaut: 16)
  style?: StyleProp<ViewStyle>;
  marginVertical?: number;
}

export const TicketDivider: React.FC<TicketDividerProps> = ({
  backgroundColor: propBg,
  dotColor: propDot,
  notchSize = 16,
  style,
  marginVertical = 6,
}) => {
  const { currentTheme } = useThemeStore();
  const backgroundColor =
    propBg ??
    (currentTheme?.isDark
      ? currentTheme?.notchBg ?? currentTheme?.background ?? '#18222D'
      : '#EDF0F5');
  const dotColor =
    propDot ??
    (currentTheme?.isDark
      ? currentTheme?.dividerBorder ?? currentTheme?.border ?? '#2C3A4B'
      : '#DCE1E7');
  const radius = notchSize / 2;

  return (
    <View style={[styles.container, { height: notchSize, marginVertical }, style]}>
      {/* Notch / Encoche Gauche */}
      <View
        style={[
          styles.notch,
          {
            width: notchSize,
            height: notchSize,
            borderRadius: radius,
            left: -radius,
            backgroundColor,
          },
        ]}
      />

      {/* Ligne horizontale en pointillés (dashed) */}
      <View style={[styles.dashedContainer, { paddingHorizontal: radius + 2 }]}>
        <Svg height="2" width="100%">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={dotColor}
            strokeWidth="1.2"
            strokeDasharray="4, 3"
          />
        </Svg>
      </View>

      {/* Notch / Encoche Droite */}
      <View
        style={[
          styles.notch,
          {
            width: notchSize,
            height: notchSize,
            borderRadius: radius,
            right: -radius,
            backgroundColor,
          },
        ]}
      />
    </View>
  );
};

const DEFAULT_NOTCH_SIZE = 16;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: DEFAULT_NOTCH_SIZE,
    position: 'relative',
    marginVertical: 6,
  },
  notch: {
    width: DEFAULT_NOTCH_SIZE,
    height: DEFAULT_NOTCH_SIZE,
    borderRadius: DEFAULT_NOTCH_SIZE / 2,
    position: 'absolute',
    zIndex: 2,
  },
  dashedContainer: {
    flex: 1,
    height: 2,
    paddingHorizontal: DEFAULT_NOTCH_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  dottedLine: {
    height: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DCE1E7',
  },
});

export default TicketDivider;
