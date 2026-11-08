import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

export interface TvBetGamepadIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Icône manette TVBet avec antennes.
 * S'adapte dynamiquement à la marque active (1xBet, Melbet, WinWin, BetWinner, PariPesa, MegaPari).
 */
export const TvBetGamepadIcon: React.FC<TvBetGamepadIconProps> = ({
  size = 24,
  color,
  style,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();

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

  const brandPrimary =
    color ||
    (isMelbet
      ? '#1B365D'
      : isMegaPari
        ? detailPokerColor
        : brandChoice === 'winwin'
          ? '#7CBD17'
          : brandChoice === 'betwinner'
            ? '#007348'
            : brandChoice === 'paripesa'
              ? '#1E5BBB'
              : '#507694');

  return (
    <Image
      source={require('../../../assets/icons/ic_tvbet_gamepad.png')}
      style={[
        {
          width: size,
          height: size,
          tintColor: brandPrimary,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export default TvBetGamepadIcon;
