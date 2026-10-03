import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { Colors } from '../../theme/theme';
import {
  getCurrentDateString,
  getCurrentTimeString,
  addMinutesToSchedule,
  generateRoundScheduleSequence,
  parseScheduleString,
} from '../../utils/scheduleHelper';

export interface PokerScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  currentStartDate?: string;
  currentStartTime?: string;
  currentInterval?: number;
  currentRoundsCount?: number;
  onApplySchedule: (params: {
    startDate: string;
    startTime: string;
    interval: number;
    roundsCount: number;
  }) => void;
}

export const PokerScheduleModal: React.FC<PokerScheduleModalProps> = ({
  visible,
  onClose,
  currentStartDate,
  currentStartTime,
  currentInterval = 3,
  currentRoundsCount = 1,
  onApplySchedule,
}) => {
  const { currentTheme, theme: baseTheme } = useThemeStore();
  const theme = currentTheme || baseTheme;
  const isDark = theme.isDark;

  // États locaux du formulaire de programmation
  const [startDate, setStartDate] = useState<string>(currentStartDate || getCurrentDateString());
  const [startTime, setStartTime] = useState<string>(currentStartTime || getCurrentTimeString());
  const [interval, setInterval] = useState<number>(currentInterval);
  const [roundsCount, setRoundsCount] = useState<number>(Math.max(1, currentRoundsCount));

  // Initialisation à l'ouverture
  useEffect(() => {
    if (visible) {
      setStartDate(currentStartDate || getCurrentDateString());
      setStartTime(currentStartTime || getCurrentTimeString());
      setInterval(currentInterval || 3);
      setRoundsCount(Math.max(1, currentRoundsCount || 1));
    }
  }, [visible, currentStartDate, currentStartTime, currentInterval, currentRoundsCount]);

  // Presets de date rapide
  const handleSetToday = () => {
    setStartDate(getCurrentDateString());
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    setStartDate(getCurrentDateString(tomorrow));
  };

  // Presets d'heure rapide
  const handleSetNow = () => {
    setStartTime(getCurrentTimeString());
  };

  const handleAddMinutes = (mins: number) => {
    const res = addMinutesToSchedule(startDate, startTime, mins);
    setStartDate(res.dateStr);
    setStartTime(res.timeStr);
  };

  // Séquence prévisualisée
  const previewSequence = useMemo(() => {
    return generateRoundScheduleSequence(startDate, startTime, interval, roundsCount, 1);
  }, [startDate, startTime, interval, roundsCount]);

  const handleConfirm = () => {
    // Validation du format date (JJ.MM.AAAA)
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(startDate.trim())) {
      Alert.alert('Format invalide', 'Veuillez saisir une date au format JJ.MM.AAAA (ex: 25.09.2026).');
      return;
    }

    // Validation du format heure (HH:mm)
    if (!/^\d{1,2}:\d{2}$/.test(startTime.trim())) {
      Alert.alert('Format invalide', 'Veuillez saisir une heure au format HH:mm (ex: 14:30).');
      return;
    }

    onApplySchedule({
      startDate: startDate.trim(),
      startTime: startTime.trim(),
      interval: Math.max(1, interval),
      roundsCount: Math.max(1, roundsCount),
    });
    onClose();
  };

  const INTERVAL_PRESETS = [
    { label: '1 min', value: 1, subtitle: 'Turbo' },
    { label: '2 min', value: 2, subtitle: 'Rapide' },
    { label: '3 min', value: 3, subtitle: 'TVBet ⭐' },
    { label: '5 min', value: 5, subtitle: 'Classique' },
    { label: '10 min', value: 10, subtitle: 'Long' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name="clock-edit-outline" size={22} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.title, { color: theme.textPrimary }]}>Programmation TVBet</Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Configure les horaires de départ et le cadencement des manches
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* 1. Date de Début */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1C222B' : '#F8FAFC', borderColor: isDark ? '#2E3846' : '#E2E8F0' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={17} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Date de la première manche</Text>
              </View>

              <View style={styles.presetsRow}>
                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    startDate === getCurrentDateString() && { backgroundColor: theme.primary, borderColor: theme.primary },
                    startDate !== getCurrentDateString() && { backgroundColor: isDark ? '#252D38' : '#EDF2F7', borderColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                  onPress={handleSetToday}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      startDate === getCurrentDateString() ? { color: '#FFFFFF', fontWeight: '800' } : { color: theme.textPrimary },
                    ]}
                  >
                    Aujourd'hui
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    { backgroundColor: isDark ? '#252D38' : '#EDF2F7', borderColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                  onPress={handleSetTomorrow}
                >
                  <Text style={[styles.presetBtnText, { color: theme.textPrimary }]}>Demain</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.inputField,
                  {
                    backgroundColor: isDark ? '#12161C' : '#FFFFFF',
                    borderColor: isDark ? '#2E3846' : '#CBD5E1',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  },
                ]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="JJ.MM.AAAA (ex: 25.09.2026)"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* 2. Heure de Début */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1C222B' : '#F8FAFC', borderColor: isDark ? '#2E3846' : '#E2E8F0' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={17} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Heure de départ (1ère manche)</Text>
              </View>

              <View style={styles.presetsRow}>
                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    { backgroundColor: isDark ? '#252D38' : '#EDF2F7', borderColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                  onPress={handleSetNow}
                >
                  <Text style={[styles.presetBtnText, { color: theme.textPrimary }]}>Maintenant</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    { backgroundColor: isDark ? '#252D38' : '#EDF2F7', borderColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                  onPress={() => handleAddMinutes(2)}
                >
                  <Text style={[styles.presetBtnText, { color: theme.textPrimary }]}>+2 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    { backgroundColor: isDark ? '#252D38' : '#EDF2F7', borderColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                  onPress={() => handleAddMinutes(15)}
                >
                  <Text style={[styles.presetBtnText, { color: theme.textPrimary }]}>+15 min</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.presetBtn,
                    { backgroundColor: isDark ? '#252D38' : '#EDF2F7', borderColor: isDark ? '#334155' : '#CBD5E1' },
                  ]}
                  onPress={() => handleAddMinutes(60)}
                >
                  <Text style={[styles.presetBtnText, { color: theme.textPrimary }]}>+1h</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[
                  styles.inputField,
                  {
                    backgroundColor: isDark ? '#12161C' : '#FFFFFF',
                    borderColor: isDark ? '#2E3846' : '#CBD5E1',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  },
                ]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:mm (ex: 14:32)"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* 3. Intervalle entre les Manches (TVBet) */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1C222B' : '#F8FAFC', borderColor: isDark ? '#2E3846' : '#E2E8F0' }]}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="timer-sand" size={17} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Intervalle entre les manches</Text>
              </View>

              <View style={styles.intervalsGrid}>
                {INTERVAL_PRESETS.map((p) => {
                  const isSelected = interval === p.value;
                  return (
                    <TouchableOpacity
                      key={p.value}
                      style={[
                        styles.intervalCard,
                        isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                        !isSelected && {
                          backgroundColor: isDark ? '#252D38' : '#FFFFFF',
                          borderColor: isDark ? '#334155' : '#CBD5E1',
                        },
                      ]}
                      onPress={() => setInterval(p.value)}
                    >
                      <Text
                        style={[
                          styles.intervalCardLabel,
                          isSelected ? { color: '#FFFFFF', fontWeight: '800' } : { color: theme.textPrimary },
                        ]}
                      >
                        {p.label}
                      </Text>
                      <Text
                        style={[
                          styles.intervalCardSub,
                          isSelected ? { color: 'rgba(255,255,255,0.85)' } : { color: theme.textSecondary },
                        ]}
                      >
                        {p.subtitle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Nombre de Manches à Programmer */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1C222B' : '#F8FAFC', borderColor: isDark ? '#2E3846' : '#E2E8F0' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="layers" size={17} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nombre de manches à programmer</Text>
              </View>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[styles.counterBtn, { backgroundColor: isDark ? '#252D38' : '#EDF2F7' }]}
                  onPress={() => setRoundsCount(Math.max(1, roundsCount - 1))}
                >
                  <Ionicons name="remove" size={20} color={theme.textPrimary} />
                </TouchableOpacity>

                <View style={styles.counterValueWrap}>
                  <Text style={[styles.counterValueText, { color: theme.primary }]}>{roundsCount}</Text>
                  <Text style={[styles.counterValueSub, { color: theme.textSecondary }]}>
                    manche{roundsCount > 1 ? 's' : ''}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.counterBtn, { backgroundColor: isDark ? '#252D38' : '#EDF2F7' }]}
                  onPress={() => setRoundsCount(roundsCount + 1)}
                >
                  <Ionicons name="add" size={20} color={theme.textPrimary} />
                </TouchableOpacity>

                {/* Quick Presets */}
                {[1, 2, 3, 5, 8].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[
                      styles.quickCountPill,
                      roundsCount === n && { backgroundColor: theme.primary, borderColor: theme.primary },
                      roundsCount !== n && { backgroundColor: isDark ? '#252D38' : '#FFFFFF', borderColor: isDark ? '#334155' : '#CBD5E1' },
                    ]}
                    onPress={() => setRoundsCount(n)}
                  >
                    <Text
                      style={[
                        styles.quickCountText,
                        roundsCount === n ? { color: '#FFFFFF', fontWeight: '800' } : { color: theme.textSecondary },
                      ]}
                    >
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 5. Prévisualisation du Calendrier */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1C222B' : '#F8FAFC', borderColor: isDark ? '#2E3846' : '#E2E8F0' }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={17} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Aperçu du calendrier des tirages</Text>
              </View>

              <View style={styles.timelineList}>
                {previewSequence.map((item, idx) => (
                  <View key={item.roundNumber} style={styles.timelineItem}>
                    <View style={styles.timelineBulletWrap}>
                      <View style={[styles.timelineBullet, { backgroundColor: idx === 0 ? theme.primary : '#94A3B8' }]} />
                      {idx < previewSequence.length - 1 && <View style={[styles.timelineLine, { backgroundColor: isDark ? '#2E3846' : '#CBD5E1' }]} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.timelineRoundBadge, { backgroundColor: theme.primarySoft || 'rgba(37, 99, 235, 0.15)', color: theme.primary }]}>
                          Manche #{item.roundNumber}
                        </Text>
                        <Text style={[styles.timelineTimeText, { color: theme.textPrimary }]}>
                          {item.formatted}
                        </Text>
                      </View>
                      <Text style={[styles.timelineDetailText, { color: theme.textSecondary }]}>
                        {idx === 0
                          ? 'Démarrage initial'
                          : `+${interval * idx} min depuis le départ`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { borderTopColor: isDark ? '#2E3846' : '#E2E8F0' }]}>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: theme.primary }]}
              activeOpacity={0.85}
              onPress={handleConfirm}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.applyBtnText}>
                Appliquer la programmation ({roundsCount} manche{roundsCount > 1 ? 's' : ''})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  bodyScroll: {
    paddingHorizontal: 16,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputField: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '600',
  },
  intervalsGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  intervalCard: {
    flex: 1,
    minWidth: '28%',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  intervalCardLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  intervalCardSub: {
    fontSize: 10,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValueWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  counterValueText: {
    fontSize: 18,
    fontWeight: '900',
  },
  counterValueSub: {
    fontSize: 10,
  },
  quickCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineList: {
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 46,
  },
  timelineBulletWrap: {
    alignItems: 'center',
    width: 20,
  },
  timelineBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 10,
  },
  timelineRoundBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  timelineTimeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineDetailText: {
    fontSize: 11,
    marginTop: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
