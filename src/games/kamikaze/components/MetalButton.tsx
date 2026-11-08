import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FONTS, GRADIENTS } from '../theme';

interface Props {
  label: string;
  tone: 'red' | 'green';
  onPress: () => void;
  disabled?: boolean;
  big?: boolean;
  testID?: string;
}

/** Bouton à cadre chromé, comme « JOUER » et « OBTENIR » dans le jeu original. */
export function MetalButton({ label, tone, onPress, disabled = false, big = false, testID }: Props) {
  const fill = tone === 'red' ? GRADIENTS.red : GRADIENTS.green;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.shadow, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <LinearGradient colors={GRADIENTS.silver.colors} locations={GRADIENTS.silver.locations} style={styles.frame}>
        <LinearGradient
          colors={fill.colors}
          locations={fill.locations}
          style={[styles.inner, big ? styles.innerBig : null]}
        >
          <Text style={[styles.label, big ? styles.labelBig : null]}>{label.toUpperCase()}</Text>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 13,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
  },
  frame: { padding: 3, borderRadius: 13 },
  inner: { paddingVertical: 7, paddingHorizontal: 22, borderRadius: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.3)' },
  innerBig: { paddingVertical: 8, paddingHorizontal: 28 },
  label: {
    color: '#fff',
    fontFamily: FONTS.regular,
    fontSize: 14,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  labelBig: { fontFamily: FONTS.bold, fontSize: 18 },
  pressed: { transform: [{ translateY: 1 }, { scale: 0.99 }] },
  disabled: { opacity: 0.4 },
});
