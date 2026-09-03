import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BetStatus } from '../types/bet';
import { Colors } from '../theme/theme';

interface StatusBadgeProps {
  status: BetStatus;
  style?: ViewStyle;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  style,
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Payé':
      case 'Gagné':
        return {
          bg: Colors.successSoft,
          color: Colors.success,
          icon: 'checkmark-circle' as const,
          label: status,
        };
      case 'Perdu':
        return {
          bg: Colors.dangerSoft,
          color: Colors.danger,
          icon: 'close-circle' as const,
          label: 'Perdu',
        };
      case 'En cours':
        return {
          bg: Colors.warningSoft,
          color: Colors.warning,
          icon: 'time' as const,
          label: 'En cours',
        };
      case 'Vendu':
        return {
          bg: '#EDE9FE',
          color: '#7C3AED',
          icon: 'pricetag' as const,
          label: 'Vendu (Cashout)',
        };
      case 'Annulé':
        return {
          bg: '#E2E8F0',
          color: Colors.textMuted,
          icon: 'ban' as const,
          label: 'Annulé',
        };
      case 'Accepté':
      default:
        return {
          bg: Colors.primarySoft,
          color: Colors.primaryAccent,
          icon: 'checkmark-circle' as const,
          label: 'Accepté',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }, style]}>
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={14}
          color={config.color}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
