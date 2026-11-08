import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';

export type SkeletonVariant = 'statistics-screen' | 'statistics-rows' | 'markets-list';

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  style?: ViewStyle;
}

/**
 * SkeletonLoader : Composant de chargement animé (Animated.loop)
 * S'adapte automatiquement à tous les thèmes (1xBet, Melbet, WinWin, Betwinner, Paripesa, MegaPari — Clair / Sombre / Noir)
 * ainsi qu'aux différentes tailles d'écran via useResponsive().
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'markets-list',
  count = 4,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const { moderateScale } = useResponsive();
  const pulseAnim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.42,
          duration: 520,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [pulseAnim]);

  const isDark = Boolean(currentTheme.isDark);
  const cardBg = currentTheme.cardBackground || (isDark ? '#1E293B' : '#FFFFFF');
  const boneBg = isDark ? 'rgba(255, 255, 255, 0.10)' : '#DCE2EC';
  const subtleBoneBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5EAF2';

  if (variant === 'statistics-screen') {
    return (
      <View style={[styles.statsScreenWrap, { backgroundColor: cardBg }, style]}>
        <Animated.View
          style={[
            styles.largeHeroBone,
            {
              backgroundColor: boneBg,
              height: moderateScale(230, 0.35),
              opacity: pulseAnim,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.sectionPillBone,
            {
              backgroundColor: boneBg,
              width: '40%',
              height: moderateScale(14, 0.3),
              opacity: pulseAnim,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.mediumCardBone,
            {
              backgroundColor: boneBg,
              height: moderateScale(155, 0.35),
              opacity: pulseAnim,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.sectionPillBone,
            {
              backgroundColor: boneBg,
              width: '40%',
              height: moderateScale(14, 0.3),
              opacity: pulseAnim,
            },
          ]}
        />

        <View style={styles.avatarRowSkeleton}>
          <Animated.View
            style={[
              styles.avatarCircleBone,
              {
                backgroundColor: boneBg,
                width: moderateScale(46, 0.3),
                height: moderateScale(46, 0.3),
                borderRadius: moderateScale(23, 0.3),
                opacity: pulseAnim,
              },
            ]}
          />
          <View style={styles.avatarLinesCol}>
            <Animated.View
              style={[
                styles.avatarLineTop,
                {
                  backgroundColor: boneBg,
                  height: moderateScale(12, 0.3),
                  opacity: pulseAnim,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.avatarLineBottom,
                {
                  backgroundColor: subtleBoneBg,
                  height: moderateScale(12, 0.3),
                  opacity: pulseAnim,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  if (variant === 'statistics-rows') {
    const rowCount = count || 8;
    return (
      <View style={[styles.statsRowsContainer, style]}>
        {Array.from({ length: rowCount }).map((_, idx) => (
          <View
            key={`stat-skel-${idx}`}
            style={[
              styles.statRowSkeleton,
              {
                borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              },
            ]}
          >
            <View style={styles.statRowHeaderSkeleton}>
              <Animated.View
                style={[
                  styles.statValBone,
                  { backgroundColor: boneBg, opacity: pulseAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.statLabelBone,
                  {
                    backgroundColor: boneBg,
                    width: idx % 2 === 0 ? '42%' : '32%',
                    opacity: pulseAnim,
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.statValBone,
                  { backgroundColor: boneBg, opacity: pulseAnim },
                ]}
              />
            </View>
            <View style={styles.statBarsSkeleton}>
              <Animated.View
                style={[
                  styles.statBarHalfBone,
                  { backgroundColor: subtleBoneBg, opacity: pulseAnim },
                ]}
              />
              <Animated.View
                style={[
                  styles.statBarHalfBone,
                  { backgroundColor: subtleBoneBg, opacity: pulseAnim },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Default: 'markets-list'
  const itemsCount = count || 4;
  return (
    <View style={[styles.marketsListWrap, style]}>
      {Array.from({ length: itemsCount }).map((_, idx) => {
        const cols = idx % 2 === 0 ? 2 : 3;
        return (
          <View
            key={`mkt-skel-${idx}`}
            style={[
              styles.marketCardSkeleton,
              {
                backgroundColor: cardBg,
                borderColor: isDark ? currentTheme.border : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.marketTitleBone,
                {
                  backgroundColor: boneBg,
                  width: idx % 2 === 0 ? '36%' : '46%',
                  opacity: pulseAnim,
                },
              ]}
            />
            <View style={styles.marketOddsRowSkeleton}>
              {Array.from({ length: cols }).map((__, colIdx) => (
                <Animated.View
                  key={`mkt-col-${idx}-${colIdx}`}
                  style={[
                    styles.marketOddBtnBone,
                    {
                      backgroundColor: subtleBoneBg,
                      height: moderateScale(40, 0.3),
                      opacity: pulseAnim,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  statsScreenWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 16,
    gap: 16,
  },
  largeHeroBone: {
    width: '100%',
    borderRadius: 16,
  },
  sectionPillBone: {
    borderRadius: 8,
  },
  mediumCardBone: {
    width: '100%',
    borderRadius: 16,
  },
  avatarRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  avatarCircleBone: {},
  avatarLinesCol: {
    flex: 1,
    gap: 10,
  },
  avatarLineTop: {
    width: '78%',
    borderRadius: 6,
  },
  avatarLineBottom: {
    width: '55%',
    borderRadius: 6,
  },
  statsRowsContainer: {
    paddingTop: 6,
  },
  statRowSkeleton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statRowHeaderSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  statValBone: {
    width: 34,
    height: 13,
    borderRadius: 5,
  },
  statLabelBone: {
    height: 13,
    borderRadius: 5,
  },
  statBarsSkeleton: {
    flexDirection: 'row',
    gap: 6,
  },
  statBarHalfBone: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  marketsListWrap: {
    paddingHorizontal: 10,
    paddingTop: 6,
    gap: 10,
  },
  marketCardSkeleton: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  marketTitleBone: {
    height: 15,
    borderRadius: 7,
  },
  marketOddsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  marketOddBtnBone: {
    flex: 1,
    borderRadius: 10,
  },
});

export default SkeletonLoader;

