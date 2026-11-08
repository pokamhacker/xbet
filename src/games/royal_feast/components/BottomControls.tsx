import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { GameStatus } from '../types/game';
import { UI_IMAGES } from '../constants/gameConfig';

interface BottomControlsProps {
  status: GameStatus;
  currentBet: number;
  winnings: number;
  openedCount?: number;
  onPlayPress: () => void;
  onCashoutPress: () => void;
  onBetModalOpen: () => void;
  onHelpPress: () => void;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  status,
  currentBet,
  winnings,
  openedCount = 0,
  onPlayPress,
  onCashoutPress,
  onBetModalOpen,
  onHelpPress,
}) => {
  const isPlaying = status === 'PLAYING' || status === 'EVALUATING' || status === 'REVEALED';
  const isIdle = status === 'IDLE';

  return (
    <View style={styles.footerContainer} pointerEvents="box-none">
      {/* 1. Image de fond du footer pour recouvrir la partie inférieure de game_bg.png */}
      <Image
        source={UI_IMAGES.FOOTER}
        style={styles.footerBackground}
        resizeMode="stretch"
      />

      {/* 2. Superposition de la rangée de boutons interactifs */}
      <View style={styles.controlsRow}>
        {/* Emplacement Gauche : Sélecteur de mise (visible en IDLE, masqué en jeu et après cashout) */}
        <View style={styles.leftSlot}>
          {isIdle && (
            <TouchableOpacity
              style={styles.betSelector}
              onPress={onBetModalOpen}
              activeOpacity={0.8}
            >
              <View style={styles.betBadge}>
                <Text style={styles.betValue}>{currentBet.toLocaleString('fr-FR')}</Text>
                <Text style={styles.betCurrency}>XAF</Text>
              </View>
              <View style={styles.coinsIconBox}>
                <Image
                  source={UI_IMAGES.COINS}
                  style={styles.coinsImg}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Emplacement Centre : Bouton Play (Capture 1) ou Bouton Récupérer les gains (Capture 2), masqué en Capture 3 */}
        <View style={styles.centerSlot}>
          {isIdle && (
            <TouchableOpacity
              style={styles.playBtn}
              onPress={onPlayPress}
              activeOpacity={0.8}
            >
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          )}

          {isPlaying && openedCount > 0 && (
            <TouchableOpacity
              style={styles.cashoutBtn}
              onPress={onCashoutPress}
              activeOpacity={0.8}
            >
              <Text style={styles.cashoutTitle}>Récupérer les gains</Text>
              <Text style={styles.cashoutAmount}>
                {`${winnings.toLocaleString('fr-FR')} XAF`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emplacement Droite : Bouton d'aide '?' fixe dans les 3 captures */}
        <View style={styles.rightSlot}>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={onHelpPress}
            activeOpacity={0.8}
          >
            <Text style={styles.helpText}>?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '18.45%',
    justifyContent: 'flex-end',
  },
  footerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  controlsRow: {
    position: 'absolute',
    bottom: '26%',
    left: '4%',
    right: '4%',
    height: '42.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSlot: {
    width: '32%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centerSlot: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  rightSlot: {
    width: '18%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  betSelector: {
    flexDirection: 'row',
    backgroundColor: '#1f0406',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8a938',
    overflow: 'hidden',
    height: '100%',
    alignItems: 'center',
  },
  betBadge: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  betValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  betCurrency: {
    color: '#f0c070',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coinsIconBox: {
    backgroundColor: '#f5a623',
    height: '100%',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#c48215',
  },
  coinsImg: {
    width: 22,
    height: 22,
  },
  playBtn: {
    backgroundColor: '#72c824',
    height: '100%',
    aspectRatio: 1.35,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#bbf660',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  playIcon: {
    color: '#083300',
    fontSize: 28,
    fontWeight: 'bold',
  },
  cashoutBtn: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#72c824',
    height: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#bbf660',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  cashoutBtnDisabled: {
    opacity: 0.85,
  },
  cashoutTitle: {
    color: '#083300',
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  cashoutAmount: {
    color: '#083300',
    fontSize: 15,
    fontWeight: '900',
  },
  helpBtn: {
    backgroundColor: '#f7a82b',
    height: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffd777',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  helpText: {
    color: '#3d1c00',
    fontSize: 26,
    fontWeight: 'bold',
  },
});
