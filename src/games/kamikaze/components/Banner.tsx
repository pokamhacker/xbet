import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { BannerState } from '../game/useKamikaze';
import { COLORS, FONTS, GRADIENTS } from '../theme';

/** Bandeau d'état : consigne, gains en cours, gain final ou perte. */
export function Banner({ state, width }: { state: BannerState; width: number }) {
  return (
    <LinearGradient
      colors={GRADIENTS.banner.colors}
      style={[styles.box, { width }]}
      accessibilityLiveRegion="polite"
      accessible
    >
      {state.kind === 'prompt' && (
        <Text testID="banner" style={styles.main}>
          {state.text}
        </Text>
      )}
      {(state.kind === 'gain' || state.kind === 'win') && (
        <Text testID="banner" style={styles.center}>
          <Text style={state.kind === 'win' ? styles.gold : styles.small}>{state.label}</Text>
          {'\n'}
          <Text style={styles.main}>{state.amount}</Text>
        </Text>
      )}
      {state.kind === 'lose' && (
        <Text testID="banner" style={[styles.main, styles.lose]}>
          {state.text}
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 52,
    marginBottom: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.rim,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 5 },
  },
  center: { textAlign: 'center', lineHeight: 20 },
  main: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16, textAlign: 'center' },
  small: { color: '#fff', fontFamily: FONTS.regular, fontSize: 14 },
  gold: { color: COLORS.gold, fontFamily: FONTS.regular, fontSize: 15 },
  lose: { color: COLORS.loseText },
});
