import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

export interface TicketDividerProps {
  backgroundColor?: string; // Couleur de fond exacte derrière la carte (ex: #F1F5F9 ou #18222D)
  dotColor?: string;        // Couleur des points (ex: #CBD5E1 ou #2C3A4B)
  notchSize?: number;       // Diamètre de l'encoche (défaut: 12)
  style?: StyleProp<ViewStyle>;
  marginVertical?: number;
}

export const TicketDivider: React.FC<TicketDividerProps> = ({
  backgroundColor: propBg,
  dotColor: propDot,
  notchSize = 12,
  style,
  marginVertical = 6,
}) => {
  const { currentTheme } = useThemeStore();
  const backgroundColor =
    propBg ??
    currentTheme?.notchBg ??
    currentTheme?.background ??
    (currentTheme?.isDark ? '#18222D' : '#F1F5F9');
  const dotColor =
    propDot ??
    currentTheme?.dividerBorder ??
    currentTheme?.border ??
    (currentTheme?.isDark ? '#2C3A4B' : '#CBD5E1');
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

      {/* Ligne de petits points ronds */}
      <View style={[styles.dashedContainer, { paddingHorizontal: radius }]}>
        <View style={[styles.dottedLine, { borderColor: dotColor }]} />
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

const DEFAULT_NOTCH_SIZE = 12;

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
    height: 1,
    paddingHorizontal: DEFAULT_NOTCH_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  dottedLine: {
    height: 0,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderRadius: 1,
  },
});

export default TicketDivider;
