import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CRASH_COLORS } from '../constants';
import { CrashHistoryRound } from '../types';

/* ===================================================================== */
/* 1. MODALE DES RÈGLES DU JEU                                           */
/* ===================================================================== */
export const CrashRulesModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="book-open-page-variant" size={22} color={CRASH_COLORS.orangePrimary} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Règles du jeu Crash</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.rulesSectionTitle}>Principe de base</Text>
            <Text style={styles.rulesParagraph}>
              L'avion décolle et prend de l'altitude. À mesure qu'il s'élève, le multiplicateur augmente de manière exponentielle de 1.00x jusqu'à ce que l'avion explose en plein vol.
            </Text>

            <Text style={styles.rulesSectionTitle}>Comment gagner ?</Text>
            <Text style={styles.rulesParagraph}>
              Placez un pari avant le décollage ou pour le prochain tour. Cliquez sur le bouton <Text style={{ color: CRASH_COLORS.yellowOrange, fontWeight: '800' }}>RETIRER</Text> avant le crash pour encaisser vos gains :
            </Text>
            <View style={styles.highlightFormula}>
              <Text style={styles.formulaText}>Gain = Mise × Multiplicateur au moment du retrait</Text>
            </View>

            <Text style={styles.rulesSectionTitle}>Les 2 Modes de Jeu</Text>
            <View style={styles.modeRuleCard}>
              <Text style={[styles.modeRuleTitle, { color: CRASH_COLORS.orangePrimary }]}>
                🛡️ Toujours gagnant (Vol protégé)
              </Text>
              <Text style={styles.rulesParagraph}>
                Tant que vous avez au moins un pari actif en vol (Pari #1 ou Pari #2) et que vous n'avez pas encore retiré, l'avion ne crashe jamais ! Dès que vous encaissez, l'avion poursuit son vol encore quelques instants avant d'exploser.
              </Text>
            </View>

            <View style={[styles.modeRuleCard, { marginTop: 10 }]}>
              <Text style={[styles.modeRuleTitle, { color: '#E53E3E' }]}>
                🔥 Classique
              </Text>
              <Text style={styles.rulesParagraph}>
                Le crash peut survenir à tout moment (dès 1.00x ou au-delà de 10x+). Si vous ne retirez pas avant l'explosion, votre mise est perdue.
              </Text>
            </View>

            <Text style={styles.rulesSectionTitle}>Double Panneau de Pari</Text>
            <Text style={styles.rulesParagraph}>
              Vous pouvez placer 2 paris totalement indépendants sur le même vol et les retirer à des multiplicateurs différents.
            </Text>
          </ScrollView>

          <TouchableOpacity style={styles.modalActionBtn} onPress={onClose}>
            <Text style={styles.modalActionBtnText}>J'ai compris</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* ===================================================================== */
/* 2. MODALE D'HISTORIQUE DES TOURS                                      */
/* ===================================================================== */
export const CrashHistoryModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  rounds: CrashHistoryRound[];
}> = ({ visible, onClose, rounds }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { maxHeight: '82%' }]}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="history" size={22} color="#EA4C2B" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Historique des vols</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Bandeau des multiplicateurs récents */}
          <View style={styles.recentBadgesRow}>
            {rounds.slice(0, 7).map((r) => (
              <View
                key={r.id}
                style={[
                  styles.multBadge,
                  r.crashMultiplier >= 2.0 ? styles.multBadgeHigh : styles.multBadgeLow,
                ]}
              >
                <Text
                  style={[
                    styles.multBadgeText,
                    r.crashMultiplier >= 2.0 ? { color: '#2ECC71' } : { color: '#E2E8F0' },
                  ]}
                >
                  {r.crashMultiplier.toFixed(2)}x
                </Text>
              </View>
            ))}
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {rounds.length === 0 ? (
              <Text style={styles.emptyNote}>Aucun vol enregistré pour le moment.</Text>
            ) : (
              rounds.map((round) => (
                <View key={round.id} style={styles.historyCardItem}>
                  <View style={styles.historyCardTop}>
                    <Text style={styles.historyRoundNum}>Vol #{round.roundNumber}</Text>
                    <Text style={styles.historyTimestamp}>{round.timestamp}</Text>
                  </View>

                  <View style={styles.historyCardMid}>
                    <Text style={styles.historyCrashLabel}>Cote de crash :</Text>
                    <Text
                      style={[
                        styles.historyCrashValue,
                        round.crashMultiplier >= 2 ? { color: '#2ECC71' } : { color: '#FFFFFF' },
                      ]}
                    >
                      {round.crashMultiplier.toFixed(2)}x
                    </Text>
                  </View>

                  {/* Vos paris sur ce tour */}
                  {round.userBets && round.userBets.length > 0 && (
                    <View style={styles.userBetsBox}>
                      {round.userBets.map((b, bIdx) => (
                        <View key={bIdx} style={styles.userBetRow}>
                          <Text style={styles.userBetLabel}>
                            Pari #{b.panelId} ({b.stake} F) :
                          </Text>
                          <Text
                            style={[
                              styles.userBetResult,
                              b.status === 'Payé' ? { color: '#2ECC71' } : { color: '#EF4444' },
                            ]}
                          >
                            {b.status === 'Payé'
                              ? `+${b.gain.toFixed(2)} F (retrait à ${b.cashedMultiplier?.toFixed(2)}x)`
                              : 'Perdu'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.modalActionBtn} onPress={onClose}>
            <Text style={styles.modalActionBtnText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/* ===================================================================== */
/* 3. MODALE RECHARGEMENT / MODIFICATION DU SOLDE                        */
/* ===================================================================== */
export const CrashRechargeModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  currentBalance: number;
  onDeposit: (amount: number) => void;
  onSetBalance: (balance: number) => void;
}> = ({ visible, onClose, currentBalance, onDeposit, onSetBalance }) => {
  const [manualInput, setManualInput] = useState('');

  const quickAmounts = [10000, 50000, 100000, 500000, 1000000];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={22} color={CRASH_COLORS.greenSuccess} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Recharger le solde</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.rulesParagraph}>
              Solde actuel : <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{currentBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} F</Text>
            </Text>

            <Text style={[styles.rulesSectionTitle, { marginTop: 12 }]}>Recharge rapide :</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 }}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickRechargeBtn}
                  onPress={() => {
                    onDeposit(amt);
                    onClose();
                  }}
                >
                  <Text style={styles.quickRechargeBtnText}>+{amt.toLocaleString('fr-FR')} F</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.rulesSectionTitle, { marginTop: 14 }]}>Définir un solde exact :</Text>
            <View style={styles.manualInputRow}>
              <TextInput
                style={styles.manualTextInput}
                value={manualInput}
                onChangeText={setManualInput}
                keyboardType="numeric"
                placeholder="Ex: 9517353"
                placeholderTextColor="#64748B"
              />
              <TouchableOpacity
                style={styles.applyBalanceBtn}
                onPress={() => {
                  const num = parseFloat(manualInput);
                  if (!isNaN(num) && num >= 0) {
                    onSetBalance(num);
                    onClose();
                  }
                }}
              >
                <Text style={styles.applyBalanceBtnText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ===================================================================== */
/* 4. MODALE DE CONFIGURATION RETRAIT AUTOMATIQUE                        */
/* ===================================================================== */
export const CrashAutoModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  panelId: 1 | 2;
  currentMultiplier: number | null;
  onSave: (multiplier: number | null) => void;
}> = ({ visible, onClose, panelId, currentMultiplier, onSave }) => {
  const [val, setVal] = useState(currentMultiplier ? String(currentMultiplier) : '2.00');

  const presets = [1.25, 1.50, 1.80, 2.00, 3.00, 5.00, 10.00];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="robot" size={22} color={CRASH_COLORS.orangePrimary} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Jeu Automatique - Pari #{panelId}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.rulesParagraph}>
              Définissez la cote à laquelle votre pari sera automatiquement encaissé en plein vol.
            </Text>

            <Text style={[styles.rulesSectionTitle, { marginTop: 12 }]}>Multiplicateur de retrait :</Text>
            <TextInput
              style={[styles.manualTextInput, { marginBottom: 12, marginTop: 6 }]}
              value={val}
              onChangeText={setVal}
              keyboardType="numeric"
              placeholder="Ex: 2.00"
              placeholderTextColor="#64748B"
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {presets.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.quickRechargeBtn}
                  onPress={() => setVal(p.toFixed(2))}
                >
                  <Text style={styles.quickRechargeBtnText}>{p.toFixed(2)}x</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { flex: 1, backgroundColor: '#334155' }]}
                onPress={() => {
                  onSave(null);
                  onClose();
                }}
              >
                <Text style={styles.modalActionBtnText}>Désactiver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { flex: 1, backgroundColor: CRASH_COLORS.orangePrimary }]}
                onPress={() => {
                  const num = parseFloat(val);
                  if (!isNaN(num) && num > 1.0) {
                    onSave(num);
                    onClose();
                  }
                }}
              >
                <Text style={styles.modalActionBtnText}>Activer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#16293D',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 10,
  },
  rulesSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  rulesParagraph: {
    fontSize: 12.5,
    color: CRASH_COLORS.textSecondary,
    lineHeight: 18,
  },
  highlightFormula: {
    backgroundColor: 'rgba(232, 108, 37, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: CRASH_COLORS.orangePrimary,
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  formulaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modeRuleCard: {
    backgroundColor: '#101F2F',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeRuleTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalActionBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: CRASH_COLORS.orangePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recentBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  multBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  multBadgeHigh: {
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
    borderColor: '#2ECC71',
  },
  multBadgeLow: {
    backgroundColor: '#1E3246',
    borderColor: '#2B3E52',
  },
  multBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyNote: {
    color: CRASH_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyCardItem: {
    backgroundColor: '#101F2F',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyRoundNum: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  historyTimestamp: {
    color: CRASH_COLORS.textSecondary,
    fontSize: 11,
  },
  historyCardMid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyCrashLabel: {
    color: CRASH_COLORS.textSecondary,
    fontSize: 12,
  },
  historyCrashValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  userBetsBox: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 2,
  },
  userBetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userBetLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  userBetResult: {
    fontSize: 11,
    fontWeight: '800',
  },
  quickRechargeBtn: {
    backgroundColor: '#1E3246',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2B3E52',
  },
  quickRechargeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  manualTextInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#0D1B2A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2B3E52',
    paddingHorizontal: 10,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  applyBalanceBtn: {
    backgroundColor: CRASH_COLORS.greenSuccess,
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBalanceBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
