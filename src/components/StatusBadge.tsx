import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BetStatus } from '../types/bet';
import { Colors } from '../theme/theme';
import { useThemeStore } from '../stores/themeStore';

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
  const { currentTheme } = useThemeStore();

  const getStatusConfig = () => {
    switch (status) {
      case 'Payé':
        return {
          bg: currentTheme.isDark ? '#064E3B' : '#DCFCE7',
          color: currentTheme.status.paye || '#16A34A',
          icon: 'checkmark-circle' as const,
          label: 'Payé',
        };
      case 'Gagné':
      case 'Gain':
        return {
          bg: currentTheme.isDark ? '#064E3B' : '#DCFCE7',
          color: currentTheme.status.paye || '#16A34A',
          icon: 'checkmark-circle' as const,
          label: 'Gain',
        };
      case 'Perdu':
        return {
          bg: currentTheme.isDark ? '#7F1D1D' : '#FEE2E2',
          color: currentTheme.status.perdu || '#EF4444',
          icon: 'close-circle' as const,
          label: 'Perdu',
        };
      case 'En cours':
        return {
          bg: currentTheme.isDark ? '#78350F' : '#FEF3C7',
          color: currentTheme.status.accepte || '#F59E0B',
          icon: 'time' as const,
          label: 'En cours',
        };
      case 'Vendu':
        return {
          bg: currentTheme.isDark ? '#4C1D95' : '#EDE9FE',
          color: '#7C3AED',
          icon: 'pricetag' as const,
          label: 'Vendu (Cashout)',
        };
      case 'Annulé':
        return {
          bg: currentTheme.isDark ? '#334155' : '#E2E8F0',
          color: currentTheme.textSecondary || Colors.textMuted,
          icon: 'ban' as const,
          label: 'Annulé',
        };
      case 'Accepté':
      default:
        return {
          bg: currentTheme.primarySoft || (currentTheme.isDark ? '#1E293B' : '#EFF6FF'),
          color: currentTheme.status.accepte || currentTheme.primary,
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
