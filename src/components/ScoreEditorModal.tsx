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
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';

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
  const { currentTheme } = useThemeStore();
  const { updateEventScore, validateCouponWithResult } = useBetStore();
  const { isTablet, isDesktop, font, moderateScale, insets } = useResponsive();

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
      <TouchableOpacity
        style={[
          styles.overlay,
          (isTablet || isDesktop) && styles.overlayTablet,
        ]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: currentTheme.modalBackground || currentTheme.cardBackground,
              borderColor: currentTheme.border,
              paddingBottom: Math.max(24, insets.bottom + 12),
            },
            (isTablet || isDesktop) && styles.sheetTablet,
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={[styles.handle, { backgroundColor: currentTheme.border }]} />

          <View style={styles.headerRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.title, { color: currentTheme.textPrimary, fontSize: font(17) }]} numberOfLines={1} adjustsFontSizeToFit>Saisie des scores</Text>
              <Text style={[styles.subtitle, { color: currentTheme.textSecondary, fontSize: font(12) }]}>Coupon № {coupon.id}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={moderateScale(22)} color={currentTheme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick 1-Tap actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickBtn, styles.quickWinBtn, { backgroundColor: currentTheme.status.paye || '#16A34A' }]}
              onPress={() => handleQuickValidateAll(true)}
            >
              <Ionicons name="checkmark-circle" size={moderateScale(16)} color="#fff" style={{ marginRight: 4 }} />
              <Text style={[styles.quickBtnText, { fontSize: font(12) }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Tout Valider (Gain)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, styles.quickLossBtn, { backgroundColor: currentTheme.status.perdu || '#EF4444' }]}
              onPress={() => handleQuickValidateAll(false)}
            >
              <Ionicons name="close-circle" size={moderateScale(16)} color="#fff" style={{ marginRight: 4 }} />
              <Text style={[styles.quickBtnText, { fontSize: font(12) }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Tout Marquer (Perdu)</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.eventsScroll} showsVerticalScrollIndicator={false}>
            {coupon.events.map((ev, index) => {
              const current = eventStates[ev.id] || { score: '1-0', status: ev.status };
              return (
                <View
                  key={ev.id}
                  style={[
                    styles.eventCard,
                    {
                      backgroundColor: currentTheme.isDark ? currentTheme.surface : '#F8FAFC',
                      borderColor: currentTheme.border,
                    },
                  ]}
                >
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventIndex, { color: currentTheme.primary }]}>Match {index + 1}</Text>
                    <Text style={[styles.eventLeague, { color: currentTheme.textSecondary }]}>{ev.league}</Text>
                  </View>

                  <Text style={[styles.eventMatch, { color: currentTheme.textPrimary }]}>
                    {ev.homeTeam.name} vs {ev.awayTeam.name}
                  </Text>
                  <Text style={[styles.eventPrediction, { color: currentTheme.textSecondary }]}>Pronostic : {ev.prediction}</Text>

                  <View style={styles.inputsRow}>
                    <View style={styles.scoreInputBox}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Score final :</Text>
                      <TextInput
                        style={[
                          styles.scoreInput,
                          {
                            backgroundColor: currentTheme.cardBackground,
                            color: currentTheme.textPrimary,
                            borderColor: currentTheme.border,
                          },
                        ]}
                        value={current.score}
                        onChangeText={(txt) => handleScoreChange(ev.id, txt)}
                        placeholder="Ex: 5-4"
                        placeholderTextColor={currentTheme.textMuted}
                      />
                    </View>

                    <View style={styles.statusPillsBox}>
                      <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>Résultat :</Text>
                      <View style={styles.pillsRow}>
                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            { borderColor: currentTheme.border },
                            current.status === 'Gain' && styles.statusPillWin,
                          ]}
                          onPress={() => handleStatusChange(ev.id, 'Gain')}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: currentTheme.textSecondary },
                              current.status === 'Gain' && styles.statusPillTextActive,
                            ]}
                          >
                            Gain
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            { borderColor: currentTheme.border },
                            current.status === 'Perdu' && styles.statusPillLoss,
                          ]}
                          onPress={() => handleStatusChange(ev.id, 'Perdu')}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: currentTheme.textSecondary },
                              current.status === 'Perdu' && styles.statusPillTextActive,
                            ]}
                          >
                            Perdu
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            { borderColor: currentTheme.border },
                            current.status === 'Accepté' && {
                              backgroundColor: currentTheme.primary,
                              borderColor: currentTheme.primary,
                            },
                          ]}
                          onPress={() => handleStatusChange(ev.id, 'Accepté')}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: currentTheme.textSecondary },
                              current.status === 'Accepté' && {
                                color: currentTheme.colors?.primaryText || '#FFFFFF',
                                fontWeight: '700',
                              },
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

          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: currentTheme.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyBtnText, { color: currentTheme.colors?.primaryText || '#FFFFFF' }]}>Enregistrer et Recalculer</Text>
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
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: '85%',
    width: '100%',
  },
  sheetTablet: {
    maxWidth: 560,
    borderRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
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
