import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ToggleCardIcon } from '../icons/ToggleCardIcon';
import { useThemeStore } from '../../stores/themeStore';

export type SportCategory =
  | 'football'
  | 'fifa'
  | 'poker'
  | 'apple_of_fortune'
  | 'tennis'
  | 'basketball'
  | 'other';

export interface BetTypeIconProps {
  type: 'Simple' | 'Combiné' | string;
  category?: SportCategory | string;
  eventsCount?: number;
  size?: number;
  useImageAsset?: boolean;
  color?: string;
  imageStyle?: StyleProp<ImageStyle>;
  containerBg?: string;
}

export const BetTypeIcon: React.FC<BetTypeIconProps> = ({
  type,
  category = 'football',
  eventsCount = 1,
  size = 22,
  useImageAsset = true,
  color,
  imageStyle,
  containerBg,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const iconColor =
    color ||
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
      : '#507694';

  // RÈGLE 1 : Si c'est un Combiné (ou plus de 1 événement), on force l'icône Combiné vectorielle
  if (type === 'Combiné' || eventsCount > 1) {
    return <ToggleCardIcon size={size} containerBg={containerBg} />;
  }

  const normalizedCategory = (category || 'football').toLowerCase();

  // RÈGLE 2 : Si c'est un Pari Simple, on sélectionne l'icône selon la catégorie
  // Les badges officiels disponibles dans assets/icons sont prioritaires si useImageAsset est actif
  if (useImageAsset) {
    if (normalizedCategory.includes('fifa')) {
      return (
        <Image
          source={require('../../../assets/icons/fifa_badge.png')}
          style={[{ width: size, height: size }, imageStyle]}
          resizeMode="contain"
        />
      );
    }
    if (normalizedCategory.includes('tvbet') || normalizedCategory.includes('poker')) {
      return (
        <Image
          source={require('../../../assets/icons/ic_tvbet_gamepad.png')}
          style={[
            { width: size, height: size },
            pokerIconTint ? { tintColor: pokerIconTint } : null,
            imageStyle,
          ]}
          resizeMode="contain"
        />
      );
    }
    if (normalizedCategory.includes('mortal') || normalizedCategory.includes('mk')) {
      return (
        <Image
          source={require('../../../assets/icons/mortal_kombat_dragon.png')}
          style={[{ width: size, height: size }, imageStyle]}
          resizeMode="contain"
        />
      );
    }
    if (normalizedCategory.includes('football') || normalizedCategory.includes('foot')) {
      return (
        <Image
          source={require('../../../assets/icons/ic_football.png')}
          style={[{ width: size, height: size }, imageStyle]}
          resizeMode="contain"
        />
      );
    }
  }

  // Rendu vectoriel selon la catégorie avec adaptation à la charte graphique
  if (normalizedCategory.includes('poker') || normalizedCategory.includes('tvbet')) {
    return (
      <Image
        source={require('../../../assets/icons/ic_tvbet_gamepad.png')}
        style={[
          { width: size, height: size },
          pokerIconTint ? { tintColor: pokerIconTint } : null,
          imageStyle,
        ]}
        resizeMode="contain"
      />
    );
  }
  if (normalizedCategory.includes('fifa')) {
    return <Ionicons color={iconColor} name="game-controller-outline" size={size} />;
  }
  if (normalizedCategory.includes('apple')) {
    return <Ionicons color={iconColor} name="nutrition-outline" size={size} />;
  }
  if (normalizedCategory.includes('tennis')) {
    return <Ionicons color={iconColor} name="tennisball-outline" size={size} />;
  }
  if (normalizedCategory.includes('basket')) {
    return <Ionicons color={iconColor} name="basketball-outline" size={size} />;
  }

  // Ballon de football par défaut
  return <Ionicons color={iconColor} name="football-outline" size={size} />;
};

export default BetTypeIcon;
