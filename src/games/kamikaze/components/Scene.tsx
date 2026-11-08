import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { isReducedMotion } from '../game/motion';
import { GRADIENTS } from '../theme';

/** Fond : ciel de bataille sombre et incendie flou en bas de l'écran. */
export function Scene() {
  // Taille de l'écran de jeu (et non de la fenêtre) : l'app peut être affichée dans un cadre sur ordinateur.
  const [{ w, h }, setSize] = useState({ w: 0, h: 0 });
  const pulse = useRef(new Animated.Value(0)).current;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(prev => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
  }, []);

  useEffect(() => {
    if (isReducedMotion()) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.none]} onLayout={onLayout}>
      <LinearGradient colors={GRADIENTS.scene.colors} locations={GRADIENTS.scene.locations} style={StyleSheet.absoluteFill} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
          },
        ]}
      >
        <Svg width={w} height={h}>
          <Defs>
            <RadialGradient id="fire" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#ff9632" stopOpacity={0.95} />
              <Stop offset="0.45" stopColor="#ff5f19" stopOpacity={0.6} />
              <Stop offset="1" stopColor="#ff4614" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="fireHot" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#ffbe5a" stopOpacity={0.75} />
              <Stop offset="1" stopColor="#ff7828" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="smoke" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#0e1016" stopOpacity={0.75} />
              <Stop offset="1" stopColor="#0e1016" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="haze" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#b3b2b2" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#b3b2b2" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {/* fumée claire au milieu de l'écran, nappes sombres, incendie en bas */}
          <Ellipse cx={w * 0.12} cy={h * 0.5} rx={w * 0.55} ry={h * 0.14} fill="url(#haze)" />
          <Ellipse cx={w * 0.7} cy={h * 0.6} rx={w * 0.5} ry={h * 0.1} fill="url(#haze)" opacity={0.7} />
          <Ellipse cx={w * 0.85} cy={h * 0.38} rx={w * 0.45} ry={h * 0.12} fill="url(#smoke)" />
          <Ellipse cx={w * 0.45} cy={h * 0.83} rx={w * 0.8} ry={h * 0.11} fill="url(#fire)" />
          <Ellipse cx={w * 0.42} cy={h * 0.82} rx={w * 0.36} ry={h * 0.06} fill="url(#fireHot)" />
          <Ellipse cx={w * 0.88} cy={h * 0.76} rx={w * 0.3} ry={h * 0.07} fill="url(#fire)" opacity={0.6} />
          <Ellipse cx={w * 0.5} cy={h * 0.71} rx={w * 0.7} ry={h * 0.05} fill="url(#smoke)" opacity={0.6} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  none: { pointerEvents: 'none' },
});
