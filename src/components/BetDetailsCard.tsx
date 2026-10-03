import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { TicketDivider, TicketDividerProps } from './TicketDivider';

export interface BetDetailsCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
}

export const BetDetailsCard: React.FC<BetDetailsCardProps> = ({
  children,
  style,
  backgroundColor: propBg,
  borderColor: propBorder,
}) => {
  const { currentTheme } = useThemeStore();
  const backgroundColor = propBg ?? currentTheme?.cardBackground ?? '#212D3B';
  const borderColor = propBorder ?? 'transparent';

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]}>
      {children}
    </View>
  );
};

export { TicketDivider };
export type { TicketDividerProps };

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 16,
  },
});

export default BetDetailsCard;
