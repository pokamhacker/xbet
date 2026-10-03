import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore, BrandKey } from '../../stores/themeStore';
import { useResponsive } from '../../utils/responsive';

export interface BrandLogoProps {
  brand?: BrandKey;
  size?: 'small' | 'medium' | 'large' | number;
  variant?: 'full' | 'header' | 'badge' | 'compact';
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brand: propBrand,
  size = 'medium',
  variant = 'header',
  isDark: propIsDark,
  style,
  onPress,
  showTagline = false,
}) => {
  const { currentTheme, themeName } = useThemeStore();
  const { moderateScale, font } = useResponsive();

  const brand = propBrand || (themeName as BrandKey) || '1xbet';
  const isDark = propIsDark !== undefined ? propIsDark : currentTheme.isDark;

  // Détermination de la dimension de base
  let baseSize = 22;
  if (typeof size === 'number') {
    baseSize = size;
  } else if (size === 'small') {
    baseSize = 16;
  } else if (size === 'large') {
    baseSize = 32;
  } else {
    baseSize = 22;
  }

  const fontSize = moderateScale(baseSize);

  // -------------------------------------------------------------------------
  // 1. MARQUE : MELBET (DARK ou LIGHT)
  // -------------------------------------------------------------------------
  if (brand === 'melbet' || brand === 'melbet-light') {
    const isLightBrand = brand === 'melbet-light';
    const melColor = isLightBrand ? '#00325E' : '#FFFFFF';
    const betBoxBg = isLightBrand ? '#E7B12C' : '#E58B05';
    const betBoxText = '#000000';

    const content = (
      <View style={[styles.logoRow, style]}>
        <View style={styles.melbetContainer}>
          <Text
            style={[
              styles.melbetMelText,
              {
                fontSize,
                color: melColor,
                letterSpacing: -0.5,
              },
            ]}
          >
            MEL
          </Text>
          <View
            style={[
              styles.melbetBetBadge,
              {
                backgroundColor: betBoxBg,
                paddingHorizontal: Math.max(4, fontSize * 0.28),
                paddingVertical: Math.max(1, fontSize * 0.08),
                borderRadius: Math.max(3, fontSize * 0.18),
                marginLeft: Math.max(2, fontSize * 0.1),
              },
            ]}
          >
            <Text
              style={[
                styles.melbetBetText,
                {
                  fontSize: fontSize * 0.95,
                  color: betBoxText,
                },
              ]}
            >
              BET
            </Text>
          </View>
        </View>

        {showTagline && (
          <Text
            style={[
              styles.taglineText,
              {
                fontSize: Math.max(9, fontSize * 0.42),
                color: isDark ? '#7C8B99' : '#6B7280',
                marginTop: 2,
              },
            ]}
          >
            SPORTS BOOKMAKER
          </Text>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
          {content}
        </TouchableOpacity>
      );
    }
    return content;
  }

  // -------------------------------------------------------------------------
  // 2. MARQUE : PARIPESA
  // -------------------------------------------------------------------------
  if (brand === 'paripesa') {
    const pariColor = isDark ? '#FFFFFF' : '#0F172A';
    const pesaBg = '#DC2626';
    const pesaText = '#FFFFFF';

    const content = (
      <View style={[styles.logoRow, style]}>
        <View style={styles.paripesaContainer}>
          <Text
            style={[
              styles.paripesaPariText,
              {
                fontSize,
                color: pariColor,
                letterSpacing: -0.5,
              },
            ]}
          >
            PARI
          </Text>
          <View
            style={[
              styles.paripesaPesaBadge,
              {
                backgroundColor: pesaBg,
                paddingHorizontal: Math.max(4, fontSize * 0.28),
                paddingVertical: Math.max(1, fontSize * 0.08),
                borderRadius: Math.max(3, fontSize * 0.18),
                marginLeft: Math.max(2, fontSize * 0.1),
              },
            ]}
          >
            <Text
              style={[
                styles.paripesaPesaText,
                {
                  fontSize: fontSize * 0.95,
                  color: pesaText,
                },
              ]}
            >
              PESA
            </Text>
          </View>
        </View>

        {showTagline && (
          <Text
            style={[
              styles.taglineText,
              {
                fontSize: Math.max(9, fontSize * 0.42),
                color: isDark ? '#94A3B8' : '#64748B',
                marginTop: 2,
              },
            ]}
          >
            BETTING COMPANY
          </Text>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
          {content}
        </TouchableOpacity>
      );
    }
    return content;
  }

  // -------------------------------------------------------------------------
  // 3. MARQUE : 1XBET (Par défaut)
  // -------------------------------------------------------------------------
  const primaryBlue = currentTheme.primary || '#2563EB';
  const betColor = isDark ? '#FFFFFF' : '#1A2B49';

  const content = (
    <View style={[styles.logoRow, style]}>
      <View style={styles.xbetContainer}>
        {/* Badge '1X' sur fond bleu si variant badge ou compact */}
        {variant === 'badge' ? (
          <View
            style={[
              styles.xbetBadgeBox,
              {
                backgroundColor: primaryBlue,
                paddingHorizontal: Math.max(6, fontSize * 0.35),
                paddingVertical: Math.max(2, fontSize * 0.12),
                borderRadius: Math.max(4, fontSize * 0.22),
              },
            ]}
          >
            <Text
              style={[
                styles.xbetBadge1X,
                {
                  fontSize,
                  color: '#FFFFFF',
                },
              ]}
            >
              1X
            </Text>
            <Text
              style={[
                styles.xbetBadgeBET,
                {
                  fontSize,
                  color: '#FFFFFF',
                  marginLeft: 2,
                },
              ]}
            >
              BET
            </Text>
          </View>
        ) : (
          <View style={styles.xsetBadgeTextRow}>
            <View
              style={[
                styles.xbet1XBox,
                {
                  backgroundColor: primaryBlue,
                  paddingHorizontal: Math.max(4, fontSize * 0.22),
                  paddingVertical: Math.max(1, fontSize * 0.05),
                  borderRadius: Math.max(3, fontSize * 0.16),
                  marginRight: Math.max(2, fontSize * 0.1),
                },
              ]}
            >
              <Text
                style={[
                  styles.xbet1XText,
                  {
                    fontSize: fontSize * 0.95,
                    color: '#FFFFFF',
                  },
                ]}
              >
                1X
              </Text>
            </View>
            <Text
              style={[
                styles.xbetBetText,
                {
                  fontSize,
                  color: betColor,
                  letterSpacing: -0.3,
                },
              ]}
            >
              BET
            </Text>
          </View>
        )}
      </View>

      {showTagline && (
        <Text
          style={[
            styles.taglineText,
            {
              fontSize: Math.max(9, fontSize * 0.42),
              color: isDark ? '#94A3B8' : '#7E95AC',
              marginTop: 2,
            },
          ]}
        >
          GLOBAL BOOKMAKER
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  // Melbet
  melbetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  melbetMelText: {
    fontWeight: '900',
    fontStyle: 'italic',
  },
  melbetBetBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  melbetBetText: {
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  // Paripesa
  paripesaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paripesaPariText: {
    fontWeight: '900',
    fontStyle: 'italic',
  },
  paripesaPesaBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  paripesaPesaText: {
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  // 1xBet
  xbetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xsetBadgeTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xbet1XBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  xbet1XText: {
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  xbetBetText: {
    fontWeight: '900',
    fontStyle: 'italic',
  },
  xbetBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xbetBadge1X: {
    fontWeight: '900',
    fontStyle: 'italic',
  },
  xbetBadgeBET: {
    fontWeight: '900',
    fontStyle: 'italic',
  },
  taglineText: {
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default BrandLogo;
