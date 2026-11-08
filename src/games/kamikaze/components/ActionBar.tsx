import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { formatMoney } from '../game/format';
import type { Phase } from '../game/useKamikaze';
import { FONTS, GRADIENTS } from '../theme';
import { DollarIcon, RepeatIcon } from './art';
import { MetalButton } from './MetalButton';

interface Props {
  phase: Phase;
  canCash: boolean;
  bet: number;
  width: number;
  onPlay: () => void;
  onCash: () => void;
  onSettings: () => void;
  onAgain: () => void;
}

/** Boutons sous le plateau : JOUER → OBTENIR → Paramètres / Refaire. */
export function ActionBar({ phase, canCash, bet, width, onPlay, onCash, onSettings, onAgain }: Props) {
  return (
    <View style={[styles.wrap, { width }]}>
      {phase === 'idle' && <MetalButton testID="btn-play" label="Jouer" tone="red" onPress={onPlay} />}
      {phase === 'select' && <MetalButton testID="btn-cash" label="Obtenir" tone="green" disabled={!canCash} onPress={onCash} />}
      {phase === 'ended' && (
        <LinearGradient colors={GRADIENTS.silver.colors} locations={GRADIENTS.silver.locations} style={styles.endbar}>
          <Pressable testID="btn-settings" accessibilityRole="button" accessibilityLabel="Paramètres des paris" onPress={onSettings} style={styles.half}>
            <LinearGradient colors={GRADIENTS.teal.colors} style={[styles.halfFill, styles.left]}>
              <DollarIcon size={26} />
              <Text style={styles.text}>{'PARAMÈTRES DES\nPARIS'}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            testID="btn-again"
            accessibilityRole="button"
            accessibilityLabel={`Refaire avec ${formatMoney(bet)} XAF`}
            onPress={onAgain}
            style={styles.half}
          >
            <LinearGradient colors={['#d8524d', '#b13430']} style={[styles.halfFill, styles.right]}>
              <RepeatIcon size={26} />
              <Text style={styles.text}>{`REFAIRE\n${formatMoney(bet)} XAF`}</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 56, alignItems: 'center', justifyContent: 'flex-start' },
  endbar: {
    width: '100%',
    flexDirection: 'row',
    gap: 3,
    padding: 3,
    borderRadius: 10,
    elevation: 8,
  },
  half: { flex: 1 },
  halfFill: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 6,
  },
  left: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  right: { borderTopRightRadius: 8, borderBottomRightRadius: 8, borderTopLeftRadius: 2, borderBottomLeftRadius: 2 },
  text: {
    flex: 1,
    color: '#fff',
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
