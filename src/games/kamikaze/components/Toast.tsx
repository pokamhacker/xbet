import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { TIMING } from '../game/config';
import type { Notice } from '../game/useKamikaze';
import { FONTS } from '../theme';

/** Message court en haut de l'écran (solde insuffisant, crédits ajoutés…). */
export function Toast({ notice, top }: { notice: Notice | null; top: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [text, setText] = useState('');

  useEffect(() => {
    if (!notice) return;
    setText(notice.text);
    opacity.stopAnimation();
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(TIMING.toast),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [notice, opacity]);

  return (
    <Animated.View style={[styles.toast, { top, opacity }]} accessibilityLiveRegion="polite">
      <Text testID="toast" style={styles.text}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '88%',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(8,18,28,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    pointerEvents: 'none',
  },
  text: { color: '#fff', fontFamily: FONTS.regular, fontSize: 16, textAlign: 'center' },
});
