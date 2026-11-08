import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import { dur } from '../game/motion';

interface Props {
  id: number;
  x: number;
  y: number;
  cell: number;
  big: boolean;
  onDone: (id: number) => void;
}

/**
 * Explosion authentique Kamikaze (sprite officiel boule de feu et détonation).
 */
export function Explosion({ id, x, y, cell, big, onDone }: Props) {
  const scale = useRef(new Animated.Value(0.15)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const totalDuration = big ? 1000 : 850;
    const peakScale = big ? 1.25 : 1.05;

    const anim = Animated.parallel([
      // Flash central incandescent
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 0.9,
          duration: dur(100),
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: dur(250),
          useNativeDriver: true,
        }),
      ]),
      // Expansion rapide de la boule de feu puis dérive
      Animated.sequence([
        Animated.timing(scale, {
          toValue: peakScale,
          duration: dur(180),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: peakScale * 1.15,
          duration: dur(totalDuration - 180),
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Révélation instantanée et dissipation progressive de la fumée
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: dur(80),
          useNativeDriver: true,
        }),
        Animated.delay(dur(big ? 450 : 350)),
        Animated.timing(opacity, {
          toValue: 0,
          duration: dur(big ? 470 : 420),
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    anim.start(() => onDone(id));
    return () => anim.stop();
  }, [id, big, onDone]);

  const size = cell * (big ? 1.3 : 1.15);
  const flashSize = cell * 0.7;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Flash lumineux blanc au centre */}
      <Animated.View
        style={[
          styles.abs,
          {
            left: x - flashSize / 2,
            top: y - flashSize / 2,
            width: flashSize,
            height: flashSize,
            borderRadius: flashSize / 2,
            backgroundColor: '#FFFFFF',
            opacity: flashOpacity,
          },
        ]}
      />

      {/* Boule de feu authentique Kamikaze */}
      <Animated.View
        style={[
          styles.abs,
          {
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Image
          source={require('../assets/kamikaze_explosion.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
  },
});
