import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Image, DimensionValue, ImageSourcePropType } from 'react-native';
import { DishType } from '../types/game';
import { DISH_IMAGES, UI_IMAGES } from '../constants/gameConfig';

interface TopDishGaugesProps {
  dishCounts: Record<DishType, number>;
  lastRevealedDish: DishType | null;
  triggerKey: number; // Increment to force re-trigger if same dish revealed consecutively
}

type GaugeKey = DishType | 'COINS';

interface GaugeConfig {
  key: GaugeKey;
  image: ImageSourcePropType;
  color: string;
  highlightColor: string;
  left: DimensionValue;
}

// Les 6 icônes alignées dans des cercles sous JACKPOT (9.67% + n * 13.57%)
const GAUGE_CONFIGS: GaugeConfig[] = [
  { key: 'COINS', image: UI_IMAGES.COINS, color: '#f5a623', highlightColor: '#ffd777', left: '9.67%' },
  { key: 'HAM', image: DISH_IMAGES.HAM, color: '#e68a1e', highlightColor: '#ffaa33', left: '23.24%' },
  { key: 'PANCAKES', image: DISH_IMAGES.PANCAKES, color: '#e68a1e', highlightColor: '#ffaa33', left: '36.81%' },
  { key: 'CHICKEN', image: DISH_IMAGES.CHICKEN, color: '#58a719', highlightColor: '#76c828', left: '50.38%' },
  { key: 'PIE', image: DISH_IMAGES.PIE, color: '#e68a1e', highlightColor: '#ffaa33', left: '63.95%' },
  { key: 'CAKE', image: DISH_IMAGES.CAKE, color: '#9b26b6', highlightColor: '#b94bd8', left: '77.52%' },
];

const SingleDishGauge: React.FC<{
  config: GaugeConfig;
  count: number;
  shouldBounce: boolean;
}> = ({ config, count, shouldBounce }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Portions de 0 à 4 : 0%, 25%, 50%, 75%, 100%
    const targetPercentage = Math.min(count, 4) * 0.25;

    Animated.timing(fillAnim, {
      toValue: targetPercentage,
      duration: 350,
      useNativeDriver: false,
    }).start();

    if (shouldBounce && count > prevCountRef.current) {
      // Rebond au gain : scale 1 -> 1.15 -> 1
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    prevCountRef.current = count;
  }, [count, shouldBounce]);

  const fillHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.circleContainer,
        {
          left: config.left,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Jauge colorée montant depuis le bas */}
      <Animated.View
        style={[
          styles.gaugeFill,
          {
            height: fillHeight,
            backgroundColor: config.color,
          },
        ]}
      />

      {/* Icône de la nourriture posée au centre avec resizeMode contain */}
      <Image
        source={config.image}
        style={styles.dishImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export const TopDishGauges: React.FC<TopDishGaugesProps> = ({
  dishCounts,
  lastRevealedDish,
  triggerKey,
}) => {
  return (
    <View style={styles.overlay} pointerEvents="none">
      {GAUGE_CONFIGS.map((config) => {
        const count = config.key === 'COINS' ? 4 : dishCounts[config.key] || 0;
        const shouldBounce = lastRevealedDish === config.key;

        return (
          <SingleDishGauge
            key={`${config.key}-${triggerKey}`}
            config={config}
            count={count}
            shouldBounce={shouldBounce}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  circleContainer: {
    position: 'absolute',
    top: '20.70%',
    width: '11.87%',
    height: '5.89%',
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 2,
  },
  gaugeFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    opacity: 0.9,
  },
});

