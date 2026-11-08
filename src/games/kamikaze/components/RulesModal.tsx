import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LADDER } from '../game/config';
import { successProbability } from '../game/engine';
import { multText, percent } from '../game/format';
import { COLORS, FONTS } from '../theme';

export function RulesModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fermer" />
        <View style={styles.panel} accessibilityViewIsModal>
          <Pressable testID="rules-close" onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Fermer">
            <Text style={styles.closeText}>X</Text>
          </Pressable>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Comment jouer</Text>
            <Text style={styles.p}>
              Choisissez votre mise, puis touchez une case de la ligne active. À chaque ligne, la DCA vise une case au hasard.
            </Text>
            <Text style={styles.p}>
              Si votre avion évite la case visée, il passe : votre mise est multipliée par le coefficient de la ligne. S'il tombe
              dessus, il est abattu et la mise est perdue.
            </Text>
            <Text style={styles.p}>
              Après chaque ligne réussie, touchez Obtenir pour encaisser, ou tentez la ligne suivante : le coefficient grimpe à chaque
              niveau.
            </Text>
            <View style={styles.odds}>
              <Text style={styles.oddsText}>Chances de réussite : 4 sur 5 à chaque ligne.</Text>
              <Text style={styles.oddsSub}>Sous chaque coefficient : la probabilité d'atteindre ce niveau sans être abattu.</Text>
            </View>
            <View style={styles.chips}>
              {LADDER.map((m, i) => (
                <View key={m} style={styles.chip}>
                  <Text style={styles.chipTop}>
                    <Text style={styles.chipLevel}>{i + 1}  </Text>
                    {multText(m)}
                  </Text>
                  <Text style={styles.chipPct}>{percent(successProbability(i + 1))}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.note}>Jeu gratuit avec des crédits virtuels : aucun argent réel n'est misé ni gagné.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 440, maxHeight: '88%', borderRadius: 14, backgroundColor: COLORS.teal, elevation: 16 },
  content: { paddingTop: 22, paddingBottom: 22, paddingHorizontal: 18 },
  close: { position: 'absolute', top: 4, right: 6, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  closeText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 22 },
  title: { marginTop: 4, marginBottom: 14, color: '#fff', fontFamily: FONTS.bold, fontSize: 24, textAlign: 'center' },
  p: { marginBottom: 11, color: '#fff', fontFamily: FONTS.regular, fontSize: 17, lineHeight: 23 },
  odds: { marginVertical: 8, padding: 12, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.28)' },
  oddsText: { color: '#fff', fontFamily: FONTS.bold, fontSize: 17 },
  oddsSub: { marginTop: 4, color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.regular, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 10 },
  chip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center' },
  chipTop: { color: '#fff', fontFamily: FONTS.bold, fontSize: 16 },
  chipLevel: { color: 'rgba(255,255,255,0.65)', fontFamily: FONTS.regular },
  chipPct: { color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.regular, fontSize: 12 },
  note: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.regular, fontSize: 15, lineHeight: 20 },
});
