import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CRASH_COLORS } from '../constants';

interface CrashTabBarProps {
  onOpenRules: () => void;
  onOpenHistory: () => void;
}

export const CrashTabBar: React.FC<CrashTabBarProps> = ({
  onOpenRules,
  onOpenHistory,
}) => {
  return (
    <View style={styles.container}>
      {/* Bouton Règles (50%) : Fond sombre avec bordure orange #E86C25 comme sur la capture */}
      <TouchableOpacity
        style={styles.rulesButton}
        onPress={onOpenRules}
        activeOpacity={0.8}
      >
        <Text style={styles.rulesButtonText}>Règles</Text>
      </TouchableOpacity>

      {/* Bouton Historique (50%) : Fond rouge-orangé avec icône réveil / alarme blanc */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={onOpenHistory}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name="alarm"
          size={18}
          color="#FFFFFF"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.historyButtonText}>HISTORIQUE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 42,
    marginHorizontal: 12,
    marginVertical: 8,
    gap: 8,
  },
  rulesButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#0C1826',
    borderWidth: 1.2,
    borderColor: CRASH_COLORS.orangePrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rulesButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyButton: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#E05A2B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
