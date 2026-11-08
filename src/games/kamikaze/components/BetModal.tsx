import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { QUICK_BETS } from '../game/config';
import { validateBet } from '../game/engine';
import { COLORS, FONTS, GRADIENTS } from '../theme';
import { MetalButton } from './MetalButton';

interface Props {
  visible: boolean;
  initialBet: number;
  balance: number;
  onClose: () => void;
  onSubmit: (bet: number) => void;
}

/** « ENTREZ LE MONTANT DE LA MISE! » avec montants rapides. */
export function BetModal({ visible, initialBet, balance, onClose, onSubmit }: Props) {
  const [text, setText] = useState(String(initialBet));

  useEffect(() => {
    if (visible) setText(String(initialBet));
  }, [visible, initialBet]);

  const { value, error } = validateBet(text, balance);

  const submit = () => {
    if (!error) onSubmit(value);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={styles.panel} accessibilityViewIsModal>
          <Pressable testID="bet-close" onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Fermer">
            <Text style={styles.closeText}>X</Text>
          </Pressable>

          <Text style={styles.title}>ENTREZ LE MONTANT DE LA MISE!</Text>

          <LinearGradient colors={['#e9eced', '#7f878c', '#dfe3e5']} locations={[0, 0.5, 1]} style={styles.field}>
            <TextInput
              testID="bet-input"
              value={text}
              onChangeText={t => setText(t.replace(/\D/g, '').slice(0, 7))}
              onSubmitEditing={submit}
              keyboardType="number-pad"
              returnKeyType="done"
              maxLength={7}
              selectTextOnFocus
              accessibilityLabel="Montant de la mise en XAF"
              style={styles.input}
            />
            <Pressable testID="bet-clear" onPress={() => setText('')} style={styles.clear} accessibilityRole="button" accessibilityLabel="Effacer le montant">
              <Text style={styles.clearText}>X</Text>
            </Pressable>
          </LinearGradient>

          <Text testID="bet-error" style={styles.error} accessibilityLiveRegion="polite">
            {error ?? ' '}
          </Text>

          <View style={styles.quick}>
            {QUICK_BETS.map(v => (
              <Pressable
                key={v}
                testID={`quick-${v}`}
                accessibilityRole="button"
                accessibilityLabel={`${v} XAF`}
                onPress={() => setText(String(v))}
                style={({ pressed }) => [styles.quickCell, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient colors={GRADIENTS.silverH.colors} locations={GRADIENTS.silverH.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.quickBtn}>
                  <Text style={styles.quickText}>{v}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>

          <View style={styles.go}>
            <MetalButton testID="bet-go" label="Jouer" tone="red" big disabled={!!error} onPress={submit} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 10 },
  panel: {
    width: '100%',
    maxWidth: 440,
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: COLORS.teal,
    elevation: 16,
  },
  close: { position: 'absolute', top: 2, right: 4, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  closeText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 19 },
  title: { marginTop: 8, marginBottom: 14, color: '#fff', fontFamily: FONTS.bold, fontSize: 19, textAlign: 'center' },
  field: { flexDirection: 'row', alignItems: 'center', padding: 3, borderRadius: 9, marginBottom: 4 },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 14,
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 22,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  clear: {
    width: 46,
    height: 46,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  clearText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 21 },
  error: { minHeight: 18, marginHorizontal: 2, marginBottom: 6, color: COLORS.error, fontFamily: FONTS.regular, fontSize: 13 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: 18 },
  quickCell: { width: '31.5%', borderRadius: 7, borderWidth: 3, borderColor: 'rgba(20,50,52,0.85)' },
  quickBtn: { height: 42, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  quickText: { color: '#111', fontFamily: FONTS.bold, fontSize: 18 },
  go: { alignItems: 'center' },
});
