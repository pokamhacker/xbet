import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TOPUP } from '../game/config';
import { BALANCE_SYMBOL, formatBalance, formatMoney } from '../game/format';
import { COLORS, FONTS } from '../theme';
import { BackIcon, Chevron, SoundIcon } from './art';

interface Props {
  balance: number;
  locked: boolean;
  sound: boolean;
  onBack: () => void;
  onTopUp: () => void;
  onToggleSound: () => void;
}

/** Barre blanche : retour, solde virtuel (marqué DÉMO) avec recharge, son. */
export function TopBar({ balance, locked, sound, onBack, onTopUp, onToggleSound }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable testID="btn-back" accessibilityRole="button" accessibilityLabel="Retour" onPress={onBack} style={styles.side} hitSlop={6}>
        <BackIcon color={COLORS.topbarIcon} />
      </Pressable>

      <View style={[styles.wallet, locked && styles.dim]}>
        <View style={styles.amount}>
          <Chevron />
          <Text testID="balance" style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
            {formatBalance(balance)} {BALANCE_SYMBOL}
          </Text>
        </View>
        <Pressable
          testID="btn-topup"
          accessibilityRole="button"
          accessibilityLabel={`Ajouter ${formatMoney(TOPUP)} ${BALANCE_SYMBOL} au solde virtuel`}
          disabled={locked}
          onPress={onTopUp}
          style={styles.plus}
        >
          <Text style={styles.plusText}>+</Text>
        </Pressable>
      </View>

      <Pressable
        testID="btn-sound"
        accessibilityRole="switch"
        accessibilityState={{ checked: sound }}
        accessibilityLabel={sound ? 'Son et vibrations activés' : 'Son et vibrations coupés'}
        onPress={onToggleSound}
        style={styles.side}
        hitSlop={6}
      >
        <View style={styles.round}>
          <SoundIcon on={sound} size={18} color={COLORS.topbarIcon} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.topbar,
  },
  side: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  round: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: COLORS.topbarIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallet: {
    flexShrink: 1,
    maxWidth: '76%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 18,
    backgroundColor: '#a9adb1',
  },
  dim: { opacity: 0.6 },
  amount: {
    flexShrink: 1,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 15,
    backgroundColor: '#5b5f63',
  },
  demo: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, backgroundColor: COLORS.gold },
  demoText: { color: '#3b2b00', fontFamily: FONTS.bold, fontSize: 10, letterSpacing: 0.3 },
  amountText: { flexShrink: 1, color: '#fff', fontFamily: FONTS.bold, fontSize: 15 },
  plus: {
    width: 34,
    height: 28,
    marginLeft: 4,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efb52c',
  },
  plusText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 22, lineHeight: 26 },
});
