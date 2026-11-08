import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export interface LiveBadgeProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
  label?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({
  style,
  textStyle,
  label = 'En direct',
}) => {
  return (
    <View style={[styles.badgeContainer, style]}>
      <View style={styles.whiteDot} />
      <Text style={[styles.badgeText, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 3,
  },
  whiteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});

export default LiveBadge;
