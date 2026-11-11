import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BetSlip, BetStatus, MatchEvent } from '../types/bet';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import {
  adaptEventResultToPrediction,
  ensureTwoHalvesScoreFormat,
} from '../utils/scoreAdapter';

interface ScoreEditorModalProps {
  visible: boolean;
  coupon: BetSlip | null;
  onClose: () => void;
}

interface EventHalfScoreState {
  ht1Home: string;
  ht1Away: string;
  ht2Home: string;
  ht2Away: string;
  status: BetStatus;
}

function buildInitialEventStates(
  coupon: BetSlip | null,
  forceWinDefault: boolean = true
): { [id: string]: EventHalfScoreState } {
  const map: { [id: string]: EventHalfScoreState } = {};
  if (!coupon || !coupon.events) return map;

  coupon.events.forEach((e: MatchEvent, idx: number) => {
    const evKey = e.id || `ev-${idx}`;
    const isWin =
      e.status === 'Gain' ||
      e.status === 'Payé' ||
      e.status === 'Gagné' ||
      coupon.status === 'Payé' ||
      (forceWinDefault && e.status !== 'Perdu');

    const complete = ensureTwoHalvesScoreFormat({
      event: e,
      rawScoreFinal: (e as any).scoreFinal || e.actualScore,
      rawScoreDetail: (e as any).scoreDetail || e.halftimeScore,
      isWin,
    });

    map[evKey] = {
      ht1Home: String(complete.ht1Home),
      ht1Away: String(complete.ht1Away),
      ht2Home: String(complete.ht2Home),
      ht2Away: String(complete.ht2Away),
      status: e.status === 'Perdu' ? 'Perdu' : 'Gain',
    };
  });

  return map;
}

export const ScoreEditorModal: React.FC<ScoreEditorModalProps> = ({
  visible,
  coupon,
  onClose,
}) => {
  const { currentTheme } = useThemeStore();
  const { updateEventScore, validateCouponWithResult } = useBetStore();
  const { isTablet, isDesktop, font, moderateScale, insets } = useResponsive();

  const [eventStates, setEventStates] = useState<{
    [id: string]: EventHalfScoreState;
  }>(() => buildInitialEventStates(coupon, true));

  const wasVisibleRef = useRef(false);
  const lastCouponIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = coupon?.id ? String(coupon.id) : null;
    if (visible && coupon) {
      if (!wasVisibleRef.current || lastCouponIdRef.current !== currentId) {
        setEventStates(buildInitialEventStates(coupon, true));
        lastCouponIdRef.current = currentId;
      }
      wasVisibleRef.current = true;
    } else if (!visible) {
      wasVisibleRef.current = false;
    }
  }, [visible, coupon]);

  if (!visible || !coupon) return null;

  const isBonusOrPokerEvent = (e: MatchEvent): boolean => {
    const s = String(e.sport || '').toUpperCase();
    const l = String(e.league || '').toUpperCase();
    const h = typeof e.homeTeam === 'string' ? e.homeTeam : e.homeTeam?.name || '';
    return (
      s === 'BONUS' ||
      l === 'BONUS' ||
      h.toUpperCase() === 'BONUS' ||
      e.gameCategory === 'poker' ||
      s.includes('POKER') ||
      l.includes('POKER')
    );
  };

  const computeFormattedFromHalves = (st: EventHalfScoreState) => {
    const h1 = Math.max(0, parseInt(st.ht1Home, 10) || 0);
    const a1 = Math.max(0, parseInt(st.ht1Away, 10) || 0);
    const h2 = Math.max(0, parseInt(st.ht2Home, 10) || 0);
    const a2 = Math.max(0, parseInt(st.ht2Away, 10) || 0);
    const totalH = h1 + h2;
    const totalA = a1 + a2;
    return {
      h1,
      a1,
      h2,
      a2,
      totalH,
      totalA,
      scoreFinal: `${totalH}:${totalA}`,
      scoreDetail: `${totalH}:${totalA} (${h1}:${a1},${h2}:${a2})`,
    };
  };

  const handleHalfFieldChange = (
    eventId: string,
    field: 'ht1Home' | 'ht1Away' | 'ht2Home' | 'ht2Away',
    text: string
  ) => {
    const clean = text.replace(/[^0-9]/g, '');
    setEventStates((prev) => {
      const current = prev[eventId] || {
        ht1Home: '1',
        ht1Away: '0',
        ht2Home: '1',
        ht2Away: '0',
        status: 'Gain' as BetStatus,
      };
      return {
        ...prev,
        [eventId]: {
          ...current,
          [field]: clean,
        },
      };
    });
  };

  const adjustHalfField = (
    eventId: string,
    field: 'ht1Home' | 'ht1Away' | 'ht2Home' | 'ht2Away',
    delta: number
  ) => {
    setEventStates((prev) => {
      const current = prev[eventId] || {
        ht1Home: '1',
        ht1Away: '0',
        ht2Home: '1',
        ht2Away: '0',
        status: 'Gain' as BetStatus,
      };
      const curNum = parseInt(current[field], 10) || 0;
      const nextNum = Math.max(0, Math.min(99, curNum + delta));
      return {
        ...prev,
        [eventId]: {
          ...current,
          [field]: String(nextNum),
        },
      };
    });
  };

  const handleStatusChange = (eventId: string, newStatus: BetStatus) => {
    setEventStates((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], status: newStatus },
    }));
  };

  const handleAutoAdaptScores = (isWin: boolean = true) => {
    const newStates: { [id: string]: EventHalfScoreState } = {};
    coupon.events.forEach((e, idx) => {
      const evKey = e.id || `ev-${idx}`;
      const adapted = adaptEventResultToPrediction(e, isWin);
      const complete = ensureTwoHalvesScoreFormat({
        event: e,
        rawScoreFinal: adapted.actualScore,
        rawScoreDetail: adapted.halftimeScore,
        isWin,
      });
      newStates[evKey] = {
        ht1Home: String(complete.ht1Home),
        ht1Away: String(complete.ht1Away),
        ht2Home: String(complete.ht2Home),
        ht2Away: String(complete.ht2Away),
        status: isWin ? 'Gain' : 'Perdu',
      };
    });
    setEventStates(newStates);
  };

  const handleValidateCouponWithEnteredHalves = (isWin: boolean) => {
    const customScores: {
      [eventId: string]: { scoreFinal: string; halftimeScore: string };
    } = {};

    coupon.events.forEach((ev, idx) => {
      if (isBonusOrPokerEvent(ev)) return;
      const evKey = ev.id || `ev-${idx}`;
      const st = eventStates[evKey] || (ev.id ? eventStates[ev.id] : undefined);
      if (st) {
        const formatted = computeFormattedFromHalves(st);
        const entry = {
          scoreFinal: formatted.scoreFinal,
          halftimeScore: formatted.scoreDetail,
        };
        customScores[evKey] = entry;
        if (ev.id) customScores[ev.id] = entry;
      } else {
        const adapted = adaptEventResultToPrediction(ev, isWin);
        const complete = ensureTwoHalvesScoreFormat({
          event: ev,
          rawScoreFinal: adapted.actualScore,
          rawScoreDetail: adapted.halftimeScore,
          isWin,
        });
        const entry = {
          scoreFinal: complete.scoreFinal,
          halftimeScore: complete.scoreDetail,
        };
        customScores[evKey] = entry;
        if (ev.id) customScores[ev.id] = entry;
      }
    });

    validateCouponWithResult(coupon.id, isWin, customScores);
    onClose();

    if (Platform.OS !== 'web') {
      Alert.alert(
        isWin ? 'Coupon validé (Gain / Payé)' : 'Coupon marqué comme Perdu',
        isWin
          ? `Les scores des 2 mi-temps ont été enregistrés. Le coupon est maintenant Payé (${coupon.potentialPayout.toLocaleString('fr-FR')} ₣).`
          : 'Le coupon a été marqué comme Perdu avec les scores saisis.'
      );
    }
  };

  const handleApplyIndividualScores = () => {
    coupon.events.forEach((ev, idx) => {
      if (isBonusOrPokerEvent(ev)) return;
      const evKey = ev.id || `ev-${idx}`;
      const st = eventStates[evKey] || (ev.id ? eventStates[ev.id] : undefined);
      if (st) {
        const formatted = computeFormattedFromHalves(st);
        updateEventScore(
          coupon.id,
          ev.id || evKey,
          formatted.scoreFinal,
          st.status,
          formatted.scoreDetail
        );
      }
    });
    onClose();
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Scores des 2 mi-temps enregistrés',
        'Les résultats et le détail des deux mi-temps ont été mis à jour.'
      );
    }
  };

  const isDark = Boolean(currentTheme?.isDark);
  const sheetBg = currentTheme.modalBackground || currentTheme.cardBackground || '#FFFFFF';
  const cardSurfaceBg = isDark ? currentTheme.surface || '#1E293B' : '#F8FAFC';
  const inputBg = currentTheme.cardBackground || (isDark ? '#0F172A' : '#FFFFFF');
  const payeGreen = '#4EBA6F';

  const modalContent = (
    <View
      style={[
        Platform.OS === 'web' ? styles.webPortalOverlay : styles.overlay,
        { paddingTop: Math.max(insets.top + 8, 12) },
        (isTablet || isDesktop) && styles.overlayTablet,
      ]}
    >
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: sheetBg,
            borderColor: currentTheme.border,
            paddingBottom: Math.max(18, insets.bottom + 10),
            zIndex: 2,
          },
          (isTablet || isDesktop) && styles.sheetTablet,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: currentTheme.border }]} />

        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              style={[styles.title, { color: currentTheme.textPrimary, fontSize: font(16.5) }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Saisir les scores des 2 mi-temps
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.textSecondary, fontSize: font(12) }]}>
              Coupon № {coupon.id} • Validation & Scores (1ère et 2ème mi-temps)
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={moderateScale(22)} color={currentTheme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.adaptScoresBtn,
            {
              borderColor: currentTheme.border || '#CBD5E1',
              backgroundColor: isDark ? currentTheme.surface || '#1E293B' : '#F1F5F9',
            },
          ]}
          onPress={() => handleAutoAdaptScores(true)}
        >
          <Ionicons
            name="sparkles"
            size={moderateScale(14)}
            color={currentTheme.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.adaptScoresBtnText, { color: currentTheme.primary, fontSize: font(12) }]}>
            Générer des scores de mi-temps adaptés aux pronostics
          </Text>
        </TouchableOpacity>

        <ScrollView
          style={styles.eventsScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
          {coupon.events.map((ev, index) => {
            if (isBonusOrPokerEvent(ev)) {
              return null;
            }
            const evKey = ev.id || `ev-${index}`;
            const current = eventStates[evKey] || {
              ht1Home: '1',
              ht1Away: '0',
              ht2Home: '1',
              ht2Away: '0',
              status: 'Gain' as BetStatus,
            };
            const computed = computeFormattedFromHalves(current);
            const homeName =
              typeof ev.homeTeam === 'string' ? ev.homeTeam : ev.homeTeam?.name || 'Équipe 1';
            const awayName =
              typeof ev.awayTeam === 'string' ? ev.awayTeam : ev.awayTeam?.name || 'Équipe 2';

            return (
              <View
                key={evKey}
                style={[
                  styles.eventCard,
                  {
                    backgroundColor: cardSurfaceBg,
                    borderColor: currentTheme.border,
                  },
                ]}
              >
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventIndex, { color: currentTheme.primary }]}>
                    Match {index + 1}
                  </Text>
                  <Text
                    style={[styles.eventLeague, { color: currentTheme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {ev.league}
                  </Text>
                </View>

                <Text style={[styles.eventMatch, { color: currentTheme.textPrimary }]}>
                  {homeName} vs {awayName}
                </Text>
                <Text style={[styles.eventPrediction, { color: currentTheme.textSecondary }]}>
                  Pronostic : {ev.prediction}
                </Text>

                {/* Saisie 1ère Mi-Temps et 2ème Mi-Temps */}
                <View style={styles.halvesContainer}>
                  {/* 1ère Mi-Temps */}
                  <View
                    style={[
                      styles.halfBox,
                      {
                        backgroundColor: inputBg,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.halfTitle, { color: currentTheme.textSecondary }]}>
                      1ère mi-temps
                    </Text>
                    <View style={styles.halfInputsRow}>
                      <View style={styles.teamScoreCol}>
                        <Text
                          style={[styles.teamMiniLabel, { color: currentTheme.textSecondary }]}
                          numberOfLines={1}
                        >
                          Dom.
                        </Text>
                        <TextInput
                          style={[
                            styles.halfDigitInput,
                            {
                              backgroundColor: cardSurfaceBg,
                              color: currentTheme.textPrimary,
                              borderColor: currentTheme.border,
                            },
                          ]}
                          value={current.ht1Home}
                          onChangeText={(t) => handleHalfFieldChange(evKey, 'ht1Home', t)}
                          keyboardType="numeric"
                          inputMode="numeric"
                          maxLength={2}
                          selectTextOnFocus
                        />
                        <View style={styles.miniStepperRow}>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht1Home', -1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.textSecondary }]}>-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht1Home', 1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.primary }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={[styles.scoreColon, { color: currentTheme.textPrimary }]}>:</Text>
                      <View style={styles.teamScoreCol}>
                        <Text
                          style={[styles.teamMiniLabel, { color: currentTheme.textSecondary }]}
                          numberOfLines={1}
                        >
                          Ext.
                        </Text>
                        <TextInput
                          style={[
                            styles.halfDigitInput,
                            {
                              backgroundColor: cardSurfaceBg,
                              color: currentTheme.textPrimary,
                              borderColor: currentTheme.border,
                            },
                          ]}
                          value={current.ht1Away}
                          onChangeText={(t) => handleHalfFieldChange(evKey, 'ht1Away', t)}
                          keyboardType="numeric"
                          inputMode="numeric"
                          maxLength={2}
                          selectTextOnFocus
                        />
                        <View style={styles.miniStepperRow}>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht1Away', -1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.textSecondary }]}>-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht1Away', 1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.primary }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* 2ème Mi-Temps */}
                  <View
                    style={[
                      styles.halfBox,
                      {
                        backgroundColor: inputBg,
                        borderColor: currentTheme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.halfTitle, { color: currentTheme.textSecondary }]}>
                      2ème mi-temps
                    </Text>
                    <View style={styles.halfInputsRow}>
                      <View style={styles.teamScoreCol}>
                        <Text
                          style={[styles.teamMiniLabel, { color: currentTheme.textSecondary }]}
                          numberOfLines={1}
                        >
                          Dom.
                        </Text>
                        <TextInput
                          style={[
                            styles.halfDigitInput,
                            {
                              backgroundColor: cardSurfaceBg,
                              color: currentTheme.textPrimary,
                              borderColor: currentTheme.border,
                            },
                          ]}
                          value={current.ht2Home}
                          onChangeText={(t) => handleHalfFieldChange(evKey, 'ht2Home', t)}
                          keyboardType="numeric"
                          inputMode="numeric"
                          maxLength={2}
                          selectTextOnFocus
                        />
                        <View style={styles.miniStepperRow}>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht2Home', -1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.textSecondary }]}>-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht2Home', 1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.primary }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={[styles.scoreColon, { color: currentTheme.textPrimary }]}>:</Text>
                      <View style={styles.teamScoreCol}>
                        <Text
                          style={[styles.teamMiniLabel, { color: currentTheme.textSecondary }]}
                          numberOfLines={1}
                        >
                          Ext.
                        </Text>
                        <TextInput
                          style={[
                            styles.halfDigitInput,
                            {
                              backgroundColor: cardSurfaceBg,
                              color: currentTheme.textPrimary,
                              borderColor: currentTheme.border,
                            },
                          ]}
                          value={current.ht2Away}
                          onChangeText={(t) => handleHalfFieldChange(evKey, 'ht2Away', t)}
                          keyboardType="numeric"
                          inputMode="numeric"
                          maxLength={2}
                          selectTextOnFocus
                        />
                        <View style={styles.miniStepperRow}>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht2Away', -1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.textSecondary }]}>-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.miniStepBtn, { borderColor: currentTheme.border }]}
                            onPress={() => adjustHalfField(evKey, 'ht2Away', 1)}
                          >
                            <Text style={[styles.miniStepTxt, { color: currentTheme.primary }]}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Aperçu en direct du score final et détail */}
                <View
                  style={[
                    styles.previewScoreBar,
                    {
                      backgroundColor: isDark ? 'rgba(78, 186, 111, 0.14)' : '#ECFDF5',
                      borderColor: isDark ? 'rgba(78, 186, 111, 0.35)' : '#A7F3D0',
                    },
                  ]}
                >
                  <Text style={[styles.previewScoreLabel, { color: currentTheme.textSecondary }]}>
                    Score affiché sur le coupon :
                  </Text>
                  <Text style={[styles.previewScoreValue, { color: payeGreen }]}>
                    {computed.scoreDetail}
                  </Text>
                </View>

                {/* Statut de l'événement */}
                <View style={styles.statusPillsBox}>
                  <Text style={[styles.inputLabel, { color: currentTheme.textSecondary }]}>
                    Statut de l'événement :
                  </Text>
                  <View style={styles.pillsRow}>
                    <TouchableOpacity
                      style={[
                        styles.statusPill,
                        { borderColor: currentTheme.border, backgroundColor: inputBg },
                        current.status === 'Gain' && {
                          backgroundColor: payeGreen,
                          borderColor: payeGreen,
                        },
                      ]}
                      onPress={() => handleStatusChange(evKey, 'Gain')}
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
                        { borderColor: currentTheme.border, backgroundColor: inputBg },
                        current.status === 'Perdu' && styles.statusPillLoss,
                      ]}
                      onPress={() => handleStatusChange(evKey, 'Perdu')}
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
                        { borderColor: currentTheme.border, backgroundColor: inputBg },
                        current.status === 'Accepté' && {
                          backgroundColor: currentTheme.primary,
                          borderColor: currentTheme.primary,
                        },
                      ]}
                      onPress={() => handleStatusChange(evKey, 'Accepté')}
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
            );
          })}
        </ScrollView>

        {/* Boutons de validation finale avec les scores des 2 mi-temps saisis */}
        <TouchableOpacity
          style={[styles.validateMainBtn, { backgroundColor: payeGreen }]}
          activeOpacity={0.85}
          onPress={() => handleValidateCouponWithEnteredHalves(true)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.validateMainBtnText}>
            Valider le coupon (Gain / Payé)
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSecondaryRow}>
          <TouchableOpacity
            style={[
              styles.secondaryActionBtn,
              {
                backgroundColor: currentTheme.primary || '#3B82F6',
              },
            ]}
            activeOpacity={0.85}
            onPress={handleApplyIndividualScores}
          >
            <Text style={styles.secondaryActionBtnText}>Enregistrer les scores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryActionBtn,
              {
                backgroundColor: currentTheme.status?.perdu || '#EF4444',
              },
            ]}
            activeOpacity={0.85}
            onPress={() => handleValidateCouponWithEnteredHalves(false)}
          >
            <Text style={styles.secondaryActionBtnText}>Valider en Perdu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      // Rendu direct dans document.body sans ModalFocusTrap de react-native-web
      // pour empêcher toute perte de focus ou fermeture du clavier virtuel sur mobile.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ReactDOM = require('react-dom');
      if (ReactDOM && typeof ReactDOM.createPortal === 'function') {
        return ReactDOM.createPortal(modalContent, document.body);
      }
    } catch {
      // fallback
    }
    return modalContent;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {modalContent}
    </Modal>
  );
};

const styles = StyleSheet.create({
  webPortalOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: Colors.darkOverlay,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.darkOverlay,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  overlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '92%',
    width: '100%',
    maxWidth: 480,
  },
  sheetTablet: {
    maxWidth: 560,
    borderRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: '85%',
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
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 16.5,
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
  adaptScoresBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  adaptScoresBtnText: {
    fontWeight: '700',
  },
  eventsScroll: {
    maxHeight: 380,
    marginBottom: 12,
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
    maxWidth: '75%',
  },
  eventMatch: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  eventPrediction: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  halvesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  halfBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  halfTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  halfInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  teamScoreCol: {
    alignItems: 'center',
  },
  teamMiniLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    marginBottom: 3,
  },
  halfDigitInput: {
    width: 46,
    height: 38,
    borderWidth: 1,
    borderRadius: 7,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 0,
  },
  miniStepperRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  miniStepBtn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepTxt: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  scoreColon: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
  },
  previewScoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  previewScoreLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  previewScoreValue: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  statusPillsBox: {
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 5,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
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
  statusPillLoss: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  statusPillTextActive: {
    color: '#fff',
  },
  validateMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 13,
    marginBottom: 8,
  },
  validateMainBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  bottomSecondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionBtn: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default ScoreEditorModal;
