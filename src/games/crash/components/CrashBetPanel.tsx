import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CRASH_COLORS, QUICK_STAKES } from '../constants';
import { BetPanelState, GamePhase } from '../types';
import { useThemeStore } from '../../../stores/themeStore';
import { useResponsive } from '../../../utils/responsive';

interface CrashBetPanelProps {
  panelId: 1 | 2;
  stake: string;
  onChangeStake: (val: string) => void;
  panelState: BetPanelState;
  gamePhase: GamePhase;
  currentMultiplier: number;
  autoCashoutMultiplier: number | null;
  onOpenAutoModal: () => void;
  onPlaceBet: () => void;
  onCashout: () => void;
}

export const CrashBetPanel: React.FC<CrashBetPanelProps> = ({
  stake,
  onChangeStake,
  panelState,
  gamePhase,
  currentMultiplier,
  autoCashoutMultiplier,
  onOpenAutoModal,
  onPlaceBet,
  onCashout,
}) => {
  const { currentTheme } = useThemeStore();
  const brandPrimary = currentTheme?.primary || CRASH_COLORS.orangePrimary;
  const brandButtonTextColor = currentTheme?.colors?.primaryText || currentTheme?.textWhite || '#FFFFFF';

  const numericStake = parseFloat(stake) || 0;
  const isLocked =
    panelState === 'BET_QUEUED' ||
    panelState === 'ACTIVE_IN_FLIGHT' ||
    panelState === 'CASHING_OUT' ||
    panelState === 'CASHED_OUT';

  const currentReturn = (numericStake * currentMultiplier).toFixed(2);

  // Détermination de l'état d'affichage du bouton inférieur dynamique
  const renderDynamicButton = () => {
    switch (panelState) {
      case 'ACTIVE_IN_FLIGHT':
        return (
          <TouchableOpacity
            style={[styles.mainActionButton, { backgroundColor: CRASH_COLORS.yellowOrange }]}
            activeOpacity={0.8}
            onPress={onCashout}
          >
            <Text style={styles.cashoutBtnText}>RETIRER {currentReturn}</Text>
          </TouchableOpacity>
        );

      case 'CASHING_OUT':
        return (
          <View style={[styles.mainActionButton, { backgroundColor: CRASH_COLORS.yellowOrange }]}>
            <ActivityIndicator size="small" color="#000000" />
            <Text style={[styles.cashoutBtnText, { marginLeft: 6 }]}>...</Text>
          </View>
        );

      case 'CASHED_OUT':
        return (
          <View style={[styles.mainActionButton, { backgroundColor: CRASH_COLORS.yellowOrange }]}>
            <Text style={styles.cashoutBtnText}>OBTENIR</Text>
          </View>
        );

      case 'BET_QUEUED':
        return (
          <View style={[styles.mainActionButton, { backgroundColor: CRASH_COLORS.ochreMuted }]}>
            <Text style={styles.queuedBtnText}>PARI ACCEPTÉ</Text>
          </View>
        );

      case 'IDLE_COUNTDOWN':
      case 'IDLE_DURING_FLIGHT':
      default:
        const isDuringFlight = gamePhase === 'flight';
        return (
          <TouchableOpacity
            style={[styles.mainActionButton, { backgroundColor: brandPrimary }]}
            activeOpacity={0.85}
            onPress={onPlaceBet}
          >
            <Text style={[styles.placeBetBtnText, { color: brandButtonTextColor }]}>PLACER UN PARI</Text>
            {isDuringFlight && (
              <Text style={styles.placeBetSubText}>(sur le prochain tour)</Text>
            )}
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.panelCard}>
      {/* Colonne Gauche (50%) : Input blanc/gris + Grille des raccourcis */}
      <View style={styles.columnLeft}>
        {/* Champ TextInput avec fond blanc actif (#FFFFFF) ou gris verrouillé (#6C7A89) */}
        <View
          style={[
            styles.inputWrap,
            { backgroundColor: isLocked ? '#6C7A89' : '#FFFFFF' },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: '#111111' },
            ]}
            value={stake}
            onChangeText={(val) => {
              if (!isLocked) {
                const clean = val.replace(/[^0-9]/g, '');
                onChangeStake(clean);
              }
            }}
            keyboardType="numeric"
            editable={!isLocked}
            placeholder="Mise"
            placeholderTextColor="#8A9BA8"
          />
          {!isLocked && stake.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeStake('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <Ionicons name="close" size={18} color="#6C7A89" />
            </TouchableOpacity>
          )}
        </View>

        {/* Grille 6 boutons raccourcis (200, 800, 2000, 6000, 20000, 70000) */}
        <View style={styles.quickGrid}>
          {QUICK_STAKES.map((row, rIdx) => (
            <View key={rIdx} style={styles.quickRow}>
              {row.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickBtn,
                    isLocked && { opacity: 0.5 },
                  ]}
                  disabled={isLocked}
                  onPress={() => onChangeStake(String(amount))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickBtnText}>{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Colonne Droite (50%) : Auto Play + Bouton Dynamique */}
      <View style={styles.columnRight}>
        {/* Bouton Supérieur : Activer le Jeu Automatique */}
        <TouchableOpacity
          style={[
            styles.autoPlayBtn,
            { borderColor: brandPrimary },
            autoCashoutMultiplier !== null && styles.autoPlayBtnActive,
          ]}
          onPress={onOpenAutoModal}
          activeOpacity={0.8}
        >
          <Text style={[styles.autoPlayBtnText, { color: brandPrimary }]}>
            {autoCashoutMultiplier !== null
              ? `AUTO RETRAIT :\n${autoCashoutMultiplier.toFixed(2)}x`
              : 'ACTIVER LE JEU\nAUTOMATIQUE'}
          </Text>
        </TouchableOpacity>

        {/* Bouton Inférieur Dynamique (Machine à états) */}
        {renderDynamicButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panelCard: {
    backgroundColor: '#142132',
    borderRadius: 10,
    padding: 9,
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  columnLeft: {
    flex: 1,
    justifyContent: 'space-between',
  },
  columnRight: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  inputWrap: {
    height: 38,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    padding: 0,
  },
  clearBtn: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickGrid: {
    gap: 4,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 4,
  },
  quickBtn: {
    flex: 1,
    height: 26,
    borderRadius: 5,
    backgroundColor: '#283A4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  autoPlayBtn: {
    height: 40,
    borderRadius: 6,
    backgroundColor: '#121E2C',
    borderWidth: 1,
    borderColor: CRASH_COLORS.orangePrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  autoPlayBtnActive: {
    backgroundColor: 'rgba(232, 108, 37, 0.15)',
  },
  autoPlayBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: CRASH_COLORS.orangePrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  mainActionButton: {
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  placeBetBtnText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  placeBetSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  cashoutBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.3,
  },
  queuedBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
