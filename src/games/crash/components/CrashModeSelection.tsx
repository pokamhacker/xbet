import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CRASH_COLORS } from '../constants';
import { GameMode } from '../types';

interface CrashModeSelectionProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onConfirmPlay: () => void;
  onBack?: () => void;
}

export const CrashModeSelection: React.FC<CrashModeSelectionProps> = ({
  selectedMode,
  onSelectMode,
  onConfirmPlay,
  onBack,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top bar avec flèche retour à gauche (Screenshot 1) */}
      <View style={styles.topBar}>
        {onBack && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* En-tête centré au tiers supérieur */}
        <View style={styles.headerBox}>
          <Text style={styles.title}>CRASH</Text>
          <Text style={styles.subtitle}>Choisis le mode de jeu</Text>
        </View>

        {/* Deux Cartes de sélection empilées verticalement */}
        <View style={styles.cardsContainer}>
          {/* Carte 1 : Toujours gagnant */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'always_win' && styles.modeCardActive,
            ]}
            onPress={() => onSelectMode('always_win')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Toujours gagnant</Text>
              {selectedMode === 'always_win' && (
                <Ionicons name="checkmark" size={22} color="#E86C25" />
              )}
            </View>
            <Text style={styles.cardDescription}>
              Vol protégé — l'avion ne crashe jamais tant que tu n'as pas retiré.
            </Text>
          </TouchableOpacity>

          {/* Carte 2 : Classique */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              selectedMode === 'classic' && styles.modeCardActive,
            ]}
            onPress={() => onSelectMode('classic')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Classique</Text>
              {selectedMode === 'classic' && (
                <Ionicons name="checkmark" size={22} color="#E86C25" />
              )}
            </View>
            <Text style={styles.cardDescription}>
              Comme l'original — retire avant le crash, sinon la mise est perdue.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pied de page fixé en bas : Bouton JOUER orange pleine largeur */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={onConfirmPlay}
          activeOpacity={0.85}
        >
          <Text style={styles.playButtonText}>JOUER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09101A',
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginTop: -40,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A9BA8',
    letterSpacing: 0.2,
  },
  cardsContainer: {
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#131F2E',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 110,
    justifyContent: 'center',
  },
  modeCardActive: {
    borderColor: '#E86C25',
    backgroundColor: '#131F2E',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 13.5,
    color: '#8A9BA8',
    lineHeight: 19,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  playButton: {
    height: 52,
    backgroundColor: '#E86C25',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
