import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { generateRoundCode } from '../../utils/pokerEngine';
import {
  parseScheduleString,
  addMinutesToSchedule,
} from '../../utils/scheduleHelper';

export interface SingleRoundEditModalProps {
  visible: boolean;
  roundNumber: number;
  initialTimeString: string;
  initialRoundCode: string;
  onClose: () => void;
  onSave: (updated: { timeString: string; roundCode: string }) => void;
}

export const SingleRoundEditModal: React.FC<SingleRoundEditModalProps> = ({
  visible,
  roundNumber,
  initialTimeString,
  initialRoundCode,
  onClose,
  onSave,
}) => {
  const { currentTheme, theme: baseTheme } = useThemeStore();
  const theme = currentTheme || baseTheme;
  const isDark = theme.isDark;

  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [roundCode, setRoundCode] = useState('');

  useEffect(() => {
    if (visible) {
      const parsed = parseScheduleString(initialTimeString);
      setDateStr(parsed.dateStr);
      setTimeStr(parsed.timeStr);
      setRoundCode(initialRoundCode || generateRoundCode());
    }
  }, [visible, initialTimeString, initialRoundCode]);

  const handleAdjustMinutes = (mins: number) => {
    const res = addMinutesToSchedule(dateStr, timeStr, mins);
    setDateStr(res.dateStr);
    setTimeStr(res.timeStr);
  };

  const handleRegenerateCode = () => {
    setRoundCode(generateRoundCode());
  };

  const handleSave = () => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr.trim())) {
      Alert.alert('Format invalide', 'La date doit être au format JJ.MM.AAAA');
      return;
    }
    if (!/^\d{1,2}:\d{2}$/.test(timeStr.trim())) {
      Alert.alert('Format invalide', "L'heure doit être au format HH:mm");
      return;
    }

    const formatted = `${dateStr.trim()} (${timeStr.trim()})`;
    onSave({
      timeString: formatted,
      roundCode: roundCode.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Modifier la Manche #{roundNumber}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Ajuste l'horaire précis ou régénère l'identifiant TVBet
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Code de tirage */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Code du tirage TVBet</Text>
            <View style={styles.codeRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    backgroundColor: isDark ? '#1C222B' : '#F8FAFC',
                    borderColor: isDark ? '#2E3846' : '#CBD5E1',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  },
                ]}
                value={roundCode}
                onChangeText={setRoundCode}
                placeholder="Ex: PB128945"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                style={[styles.regenBtn, { backgroundColor: theme.primary }]}
                onPress={handleRegenerateCode}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.regenBtnText}>Nouveau</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date de la manche */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Date de la manche (JJ.MM.AAAA)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1C222B' : '#F8FAFC',
                  borderColor: isDark ? '#2E3846' : '#CBD5E1',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                },
              ]}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="JJ.MM.AAAA"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Heure de la manche */}
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Heure exacte (HH:mm)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1C222B' : '#F8FAFC',
                  borderColor: isDark ? '#2E3846' : '#CBD5E1',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                },
              ]}
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="HH:mm"
              placeholderTextColor="#94A3B8"
            />

            {/* Quick +/- Minutes */}
            <View style={styles.quickPillsRow}>
              {[-3, -1, 1, 3, 5].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: isDark ? '#1E2530' : '#EDF2F7',
                      borderColor: isDark ? '#2E3846' : '#CBD5E1',
                    },
                  ]}
                  onPress={() => handleAdjustMinutes(m)}
                >
                  <Text style={[styles.quickPillText, { color: theme.textPrimary }]}>
                    {m > 0 ? `+${m}m` : `${m}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: isDark ? '#2E3846' : '#CBD5E1' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Enregistrer</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '600',
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  regenBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
