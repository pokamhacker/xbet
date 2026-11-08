import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AppTheme } from '../theme/themes';
import { useThemeStore } from '../stores/themeStore';
import { Typography } from '../theme/theme';

export interface DuplicateCouponButtonProps {
  onPress: () => void;
  title?: string;
  theme?: AppTheme;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

/**
 * Bouton "DUPLIQUER LE COUPON DE PARI"
 * En mode sombre 1xBet :
 * - Intégration harmonieuse avec le fond sombre de la carte (#212D3B) et de l'écran (#18222D)
 * - Fond sombre (#243242 ou #212D3B) avec bordure subtile (#2C3A4B)
 * - Texte bleu vif 1xBet (#3A86FF)
 * - Aucun fond blanc ni conteneur clair parasite
 */
export const DuplicateCouponButton: React.FC<DuplicateCouponButtonProps> = ({
  onPress,
  title = 'DUPLIQUER LE COUPON DE PARI',
  theme: propTheme,
  style,
  textStyle,
  activeOpacity = 0.85,
}) => {
  const { currentTheme } = useThemeStore();
  const theme = propTheme || currentTheme;
  const isDark = Boolean(theme?.isDark);

  // Couleur de fond selon le thème (s'adapte à toutes les marques)
  const bgColor = isDark
    ? theme.duplicateButton?.bg &&
      theme.duplicateButton.bg !== '#FFFFFF' &&
      theme.duplicateButton.bg !== '#ffffffff'
      ? theme.duplicateButton.bg
      : (theme.cardBackground || '#243242')
    : theme.duplicateButton?.bg || theme.primarySoft || '#E8F1FD';

  // Couleur du texte dynamique selon le thème de chaque marque (Melbet, MegaPari, WinWin, BetWinner, PariPesa, 1xBet)
  const textColor = theme.duplicateButton?.text || theme.primary || (isDark ? '#3A86FF' : '#2563EB');

  const borderColor = isDark ? (theme.border || '#2C3A4B') : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: isDark ? 1 : 0,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: textColor,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default DuplicateCouponButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
});
