import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { BetTypeIcon, SportCategory } from './history/BetTypeIcon';

export interface TicketBadgeProps {
  type: 'Simple' | 'Combiné' | string;
  sport?: 'FIFA' | 'FOOTBALL' | 'POKER' | SportCategory | string;
  status: 'Accepté' | 'Payé' | 'Perdu' | string;
  eventsCount?: number;
}

export const TicketStatusBadge: React.FC<TicketBadgeProps> = ({
  type,
  sport,
  status,
  eventsCount,
}) => {
  const { currentTheme } = useThemeStore();

  const isAccepted = status === 'Accepté';
  const isPaid = status === 'Payé' || status === 'Gagné' || status === 'Gain';
  const showBadge = isAccepted || isPaid;
  const badgeColor = isAccepted ? currentTheme.status.accepte : currentTheme.colors.accentGreen;

  return (
    <View style={styles.badgeWrapper}>
      <BetTypeIcon
        type={type}
        category={sport}
        eventsCount={eventsCount ?? (type === 'Combiné' ? 2 : 1)}
        size={24}
        containerBg={currentTheme.colors?.cardBackground || currentTheme.cardBackground}
      />

      {showBadge && (
        <View
          style={[
            styles.statusCircle,
            {
              backgroundColor: badgeColor,
              borderColor: currentTheme.colors.cardBackground,
            },
          ]}
        >
          <Ionicons name="checkmark" size={9} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  mainIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
  },
  statusCircle: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    zIndex: 2,
    elevation: 2,
  },
});

export default TicketStatusBadge;
