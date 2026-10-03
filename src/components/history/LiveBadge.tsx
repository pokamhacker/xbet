import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface LiveBadgeProps {
  style?: ViewStyle;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ style }) => {
  return (
    <View style={[styles.badgeContainer, style]}>
      <View style={styles.whiteDot} />
      <Text style={styles.badgeText}>En direct</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#E53E3E', // Rouge vif exact
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    gap: 4,
  },
  whiteDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});

export default LiveBadge;
