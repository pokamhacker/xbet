import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { DepositIcon } from './icons/DepositIcon';
import { useThemeStore } from '../stores/themeStore';

export interface DepositButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  label?: string;
  size?: 'card' | 'pill';
  iconSize?: number;
}

export const DepositButton: React.FC<DepositButtonProps> = ({
  onPress,
  style,
  label = 'Effectuer un dépôt',
  size = 'card',
  iconSize,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark;

  // Fond vert menthe très clair
  const mintBg = isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7';
  const iconColor = isDark ? '#4ADE80' : '#2E7D32';
  const badgePlusColor = isDark ? (currentTheme.cardBackground || '#1E293B') : '#DCFCE7';
  const textColor = isDark ? '#4ADE80' : '#1B5E20';

  if (size === 'pill') {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={[styles.pillBtn, { backgroundColor: mintBg }, style]}
      >
        <DepositIcon
          size={iconSize || 20}
          color={iconColor}
          badgePlusColor={badgePlusColor}
        />
        <Text style={[styles.pillText, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.cardBtn, { backgroundColor: mintBg }, style]}
    >
      <DepositIcon
        size={iconSize || 24}
        color={iconColor}
        badgePlusColor={badgePlusColor}
      />
      <Text style={[styles.cardText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 4,
  },
  cardText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DepositButton;
