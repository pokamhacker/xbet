import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { ToggleCardIcon } from './icons/ToggleCardIcon';

export interface SportStatusBadgeProps {
  category?: 'FIFA' | 'TvBet POKER' | 'Football' | 'Combiné' | string;
  isPaid?: boolean;
  size?: number;
  style?: ViewStyle;
}

export const SportStatusBadge: React.FC<SportStatusBadgeProps> = ({
  category = 'Football',
  isPaid = false,
  size = 38,
  style,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const isFifa = category.toUpperCase().includes('FIFA');
  const isPoker = category.toUpperCase().includes('POKER') || category.toUpperCase().includes('TVBET');
  const isCombine = category.toUpperCase().includes('COMBINÉ') || category.toUpperCase().includes('COMBINE');

  const brandPrimary =
    currentTheme?.primary ||
    currentTheme?.colors?.primary ||
    (brandChoice === 'melbet'
      ? '#E58B05'
      : brandChoice === 'winwin'
        ? '#7CBD17'
        : brandChoice === 'betwinner'
          ? '#007348'
          : brandChoice === 'paripesa'
            ? '#1E5BBB'
            : brandChoice === 'megaparis' || brandChoice === 'megapari'
              ? '#D3242A'
              : '#2563EB');

  const isMelbet = Boolean(
    brandChoice === 'melbet' ||
    (currentTheme?.name || '').toLowerCase().includes('melbet')
  );

  const isMegaPari = Boolean(
    brandChoice === 'megaparis' ||
    brandChoice === 'megapari' ||
    (currentTheme?.name || '').toLowerCase().includes('megapari')
  );

  const detailPokerColor =
    currentTheme.textSecondary ||
    currentTheme.colors?.textSecondary ||
    (currentTheme.isDark ? '#8A96A3' : '#64748B');

  const pokerIconTint = isMelbet
    ? '#1B365D'
    : isMegaPari
      ? detailPokerColor
      : brandPrimary;

  const checkSize = Math.max(14, Math.round(size * 0.38));
  const checkRadius = checkSize / 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {/* 1. Conteneur principal de l'icône de discipline - Sans fond blanc */}
      <View style={[styles.badgeBase, { width: size, height: size, borderRadius: size / 2 }]}>
        {isFifa ? (
          <Image
            source={require('../../assets/icons/fifa_badge.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        ) : isPoker ? (
          <Image
            source={require('../../assets/icons/ic_tvbet_gamepad.png')}
            style={[styles.gamepadImage, { tintColor: pokerIconTint }]}
            resizeMode="contain"
          />
        ) : isCombine ? (
          <ToggleCardIcon size={size} />
        ) : (
          <Image
            source={require('../../assets/icons/ic_football.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        )}
      </View>

      {/* 2. Pastille circulaire verte avec check blanc si statut Payé - Bordure dynamique assortie au fond de la carte */}
      {isPaid && (
        <View
          style={[
            styles.checkDot,
            {
              width: checkSize,
              height: checkSize,
              borderRadius: checkRadius,
              bottom: -1,
              right: -1,
              backgroundColor: currentTheme.colors.accentGreen,
              borderColor: currentTheme.colors.cardBackground,
            },
          ]}
        >
          <Ionicons name="checkmark" size={Math.round(checkSize * 0.65)} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  badgeBase: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '74%',
    height: '74%',
    backgroundColor: 'transparent',
  },
  gamepadImage: {
    width: '68%',
    height: '68%',
    backgroundColor: 'transparent',
  },
  checkDot: {
    position: 'absolute',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
});

export default SportStatusBadge;
