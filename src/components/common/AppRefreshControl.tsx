import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  RefreshControl,
  RefreshControlProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppTheme } from '../../theme/themes';

export interface AppRefreshControlOptions {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  theme: AppTheme | any;
  progressViewOffset?: number;
}

/**
 * Génère le composant standard React Native RefreshControl configuré
 * avec les couleurs officielles 1xBet et le bon décalage de barre d'en-tête.
 */
export const createAppRefreshControl = ({
  refreshing,
  onRefresh,
  theme,
  progressViewOffset = 0,
}: AppRefreshControlOptions) => {
  const primaryColor = theme?.colors?.primary || theme?.primary || '#6C9AD9';
  const cardBg = theme?.isDark ? (theme?.colors?.cardBackground || theme?.cardBackground || '#222E3C') : '#FFFFFF';

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[primaryColor, '#2860EC', '#26B256']}
      tintColor={primaryColor}
      progressBackgroundColor={cardBg}
      progressViewOffset={progressViewOffset}
    />
  );
};

export interface RefreshArrowBadgeProps {
  refreshing: boolean;
  theme: AppTheme | any;
  topOffset?: number;
  size?: number;
}

/**
 * Flèche circulaire d'actualisation animée (360° en rotation continue).
 * Garantit une visibilité éclatante sur Web, Android et iOS quand l'utilisateur essaie d'actualiser.
 */
export const RefreshArrowBadge: React.FC<RefreshArrowBadgeProps> = ({
  refreshing,
  theme,
  topOffset = 60,
  size = 40,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const loopAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (refreshing) {
      // Démarrage de la rotation continue
      rotateAnim.setValue(0);
      loopAnim.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loopAnim.current.start();

      // Apparition fluide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Disparition en fondu et réduction
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (loopAnim.current) {
          loopAnim.current.stop();
        }
      });
    }

    return () => {
      if (loopAnim.current) {
        loopAnim.current.stop();
      }
    };
  }, [refreshing]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const primaryColor = theme?.colors?.primary || theme?.primary || '#6C9AD9';
  const cardBg = theme?.isDark ? (theme?.colors?.cardBackground || theme?.cardBackground || '#222E3C') : '#FFFFFF';
  const borderCol = theme?.colors?.cardBorder || theme?.border || '#2C3A4B';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.badgeContainer,
        {
          top: topOffset,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: cardBg,
          borderColor: borderCol,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons name="refresh" size={size * 0.52} color={primaryColor} />
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Hook utilitaire pour gérer l'actualisation avec retour haptique
 */
export function useAppRefresh(onRefreshCallback?: () => void | Promise<void>) {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore sur plateformes non supportées
    }
    setRefreshing(true);

    try {
      if (onRefreshCallback) {
        await onRefreshCallback();
      }
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 850);
    }
  }, [onRefreshCallback]);

  return {
    refreshing,
    onRefresh,
    setRefreshing,
  };
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
});
