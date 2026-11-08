import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GameStatus } from '../types/game';

interface StatusBannerProps {
  status: GameStatus;
  openedCount: number;
  winnings: number;
  isOpening?: boolean;
  nextMultiplier?: number;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  openedCount,
  winnings,
  isOpening,
  nextMultiplier,
}) => {
  // 1. État d'attente "..." pendant 350ms
  if (isOpening || status === 'EVALUATING') {
    return (
      <View style={styles.bannerContainer}>
        <Text style={styles.waitingDots}>...</Text>
      </View>
    );
  }

  let title = '';
  let subtitle: string | null = null;

  switch (status) {
    case 'IDLE':
      title = 'Placez un pari';
      subtitle = null;
      break;

    case 'PLAYING':
      title = 'Sélectionnez un plat !';
      subtitle = nextMultiplier != null ? `Prochaine étape : x${nextMultiplier.toFixed(2)}` : null;
      break;

    case 'REVEALED':
      title = `Vos gains : ${winnings.toLocaleString('fr-FR')} XAF`;
      subtitle = null;
      break;

    case 'CASHED_OUT':
      title = `Vos gains : ${winnings.toLocaleString('fr-FR')} XAF`;
      subtitle = null;
      break;

    case 'LOST':
      title = 'Pas de chance. On rejoue ?';
      subtitle = null;
      break;

    case 'WON':
      title = 'Victoire maximale !';
      subtitle = `${winnings.toLocaleString('fr-FR')} XAF crédités`;
      break;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.textWrapper}>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subText}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Fond 100% opaque pour masquer "Placez un pari" de game_bg.png sans deuxième bordure
  bannerContainer: {
    position: 'absolute',
    top: '57.8%',
    left: '17.5%',
    width: '65%',
    height: '7.5%',
    borderRadius: 12,
    backgroundColor: '#280403',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  textWrapper: {
    width: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingDots: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 2,
  },
  titleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});
