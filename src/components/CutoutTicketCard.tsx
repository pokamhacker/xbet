import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, TicketTheme } from '../theme/theme';

interface CutoutTicketCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CutoutTicketCard: React.FC<CutoutTicketCardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

export const TicketCutoutDivider: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.cutoutContainer, style]}>
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={styles.dashedLine} />
      <View style={[styles.notch, styles.notchRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cutoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    backgroundColor: Colors.surface,
    position: 'relative',
    overflow: 'hidden',
  },
  notch: {
    width: TicketTheme.notchSize,
    height: TicketTheme.notchSize,
    borderRadius: TicketTheme.notchSize / 2,
    backgroundColor: TicketTheme.notchColor,
    position: 'absolute',
    top: 0,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notchLeft: {
    left: TicketTheme.notchOffset,
  },
  notchRight: {
    right: TicketTheme.notchOffset,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: TicketTheme.dashedBorderColor,
    borderStyle: 'dashed',
    marginHorizontal: 16,
  },
});
