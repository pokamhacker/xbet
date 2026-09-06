import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BetSlip, BetStatus } from '../types/bet';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';

interface ScoreEditorModalProps {
  visible: boolean;
  coupon: BetSlip | null;
  onClose: () => void;
}

export const ScoreEditorModal: React.FC<ScoreEditorModalProps> = ({
  visible,
  coupon,
  onClose,
}) => {
  const { updateEventScore, validateCouponWithResult } = useBetStore();

  if (!coupon) return null;

  // Local state for event scores and statuses
  const [eventStates, setEventStates] = useState<{
    [id: string]: { score: string; status: BetStatus };
  }>(() => {
    const map: { [id: string]: { score: string; status: BetStatus } } = {};
    coupon.events.forEach((e) => {
      map[e.id] = {
        score: e.actualScore || (e.prediction.includes(':') ? e.prediction.split(':')?.[1]?.trim() || '2-1' : '1-0'),
        status: e.status,
      };
    });
    return map;
  });

  const handleScoreChange = (eventId: string, text: string) => {
    setEventStates((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], score: text },
    }));
  };

  const handleStatusChange = (eventId: string, newStatus: BetStatus) => {
    setEventStates((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], status: newStatus },
    }));
  };

  const handleQuickValidateAll = (isWin: boolean) => {
    validateCouponWithResult(coupon.id, isWin);
    onClose();
    Alert.alert(
      isWin ? 'Coupon validé en Gain !' : 'Coupon marqué comme Perdu',
      isWin
        ? `Le statut est passé à Payé et ${coupon.potentialPayout.toLocaleString('fr-FR')} ₣ ont été crédités.`
        : 'Le statut est passé à Perdu.'
    );
  };

  const handleApply = () => {
    coupon.events.forEach((ev) => {
      const st = eventStates[ev.id];
      if (st) {
        updateEventScore(coupon.id, ev.id, st.score, st.status);
      }
    });
    onClose();
    Alert.alert('Scores enregistrés', 'Les résultats du coupon ont été mis à jour.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Saisie des scores</Text>
              <Text style={styles.subtitle}>Coupon № {coupon.id}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick 1-Tap actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickBtn, styles.quickWinBtn]}
              onPress={() => handleQuickValidateAll(true)}
            >
              <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.quickBtnText}>Tout Valider (Gain)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, styles.quickLossBtn]}
              onPress={() => handleQuickValidateAll(false)}
            >
              <Ionicons name="close-circle" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.quickBtnText}>Tout Marquer (Perdu)</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.eventsScroll} showsVerticalScrollIndicator={false}>
            {coupon.events.map((ev, index) => {
              const current = eventStates[ev.id] || { score: '1-0', status: ev.status };
              return (
                <View key={ev.id} style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventIndex}>Match {index + 1}</Text>
                    <Text style={styles.eventLeague}>{ev.league}</Text>
                  </View>

                  <Text style={styles.eventMatch}>
                    {ev.homeTeam.name} vs {ev.awayTeam.name}
                  </Text>
                  <Text style={styles.eventPrediction}>Pronostic : {ev.prediction}</Text>

                  <View style={styles.inputsRow}>
                    <View style={styles.scoreInputBox}>
                      <Text style={styles.inputLabel}>Score final :</Text>
                      <TextInput
                        style={styles.scoreInput}
                        value={current.score}
                        onChangeText={(txt) => handleScoreChange(ev.id, txt)}
                        placeholder="Ex: 5-4"
                      />
                    </View>

                    <View style={styles.statusPillsBox}>
                      <Text style={styles.inputLabel}>Résultat :</Text>
                      <View style={styles.pillsRow}>
                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            current.status === 'Gain' && styles.statusPillWin,
                          ]}
                          onPress={() => handleStatusChange(ev.id, 'Gain')}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              current.status === 'Gain' && styles.statusPillTextActive,
                            ]}
                          >
                            Gain
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            current.status === 'Perdu' && styles.statusPillLoss,
                          ]}
                          onPress={() => handleStatusChange(ev.id, 'Perdu')}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              current.status === 'Perdu' && styles.statusPillTextActive,
                            ]}
                          >
                            Perdu
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            current.status === 'Accepté' && styles.statusPillPending,
                          ]}
                          onPress={() => handleStatusChange(ev.id, 'Accepté')}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              current.status === 'Accepté' && styles.statusPillTextActive,
                            ]}
                          >
                            En cours
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Enregistrer et Recalculer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.darkOverlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderDark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  quickWinBtn: {
    backgroundColor: Colors.success,
  },
  quickLossBtn: {
    backgroundColor: Colors.danger,
  },
  quickBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  eventsScroll: {
    maxHeight: 340,
    marginBottom: 14,
  },
  eventCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventIndex: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  eventLeague: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  eventMatch: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  eventPrediction: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreInputBox: {
    width: 90,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  scoreInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  statusPillsBox: {
    flex: 1,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusPillWin: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  statusPillLoss: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  statusPillPending: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusPillTextActive: {
    color: '#fff',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default ScoreEditorModal;
