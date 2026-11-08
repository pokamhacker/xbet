import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { CRASH_COLORS } from '../constants';

interface CrashHeaderProps {
  balance: number;
  onBack: () => void;
  onOpenRecharge: () => void;
  onAirplanePress?: () => void;
}

// Badge Rosette/Étoile BONUS + (exactement comme sur les captures d'écran)
const BonusBadgeIcon = () => (
  <View style={styles.bonusBadgeWrap}>
    <Svg width={30} height={30} viewBox="0 0 32 32">
      {/* Bordure crénelée / rosette verte */}
      <Path
        d="M 16 2
           L 19 4.5 L 23 4 L 25 7.5 L 29 8.5 L 29 12.5 L 31.5 15 L 30 18.5 L 31.5 22 L 29 24 L 27.5 27.5 L 24 28 L 22 31 L 18 30 L 16 32 L 14 30 L 10 31 L 8 28 L 4.5 27.5 L 3 24 L 0.5 22 L 2 18.5 L 0.5 15 L 3 12.5 L 3 8.5 L 7 7.5 L 9 4 L 13 4.5 Z"
        fill="#0D1B2A"
        stroke="#2ECC71"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </Svg>
    <View style={styles.bonusBadgeTextWrap}>
      <Text style={styles.bonusBadgeTitle}>BONUS</Text>
      <Text style={styles.bonusBadgePlus}>+</Text>
    </View>
  </View>
);

export const CrashHeader: React.FC<CrashHeaderProps> = ({
  balance,
  onBack,
  onOpenRecharge,
  onAirplanePress,
}) => {
  // Formatage propre : pas de décimale superflue si entier ou 2 décimales
  const formattedBalance = Math.floor(balance).toLocaleString('fr-FR');

  return (
    <View style={styles.header}>
      {/* Bouton Retour (Flèche gauche droite simple comme sur les captures) */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Pilule Centrale : Solde + Bouton Recharger (+) */}
      <View style={styles.balancePill}>
        <Text style={styles.balanceText} numberOfLines={1}>
          {formattedBalance} F
        </Text>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={onOpenRecharge}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Badge BONUS + à droite (comme sur les captures 2, 3, 4) */}
      <TouchableOpacity
        style={styles.rightButton}
        onPress={onAirplanePress}
        activeOpacity={0.8}
      >
        <BonusBadgeIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 52,
    backgroundColor: '#0D1A29',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162334',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  balanceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
    letterSpacing: 0.3,
  },
  plusButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CRASH_COLORS.greenSuccess,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusBadgeWrap: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bonusBadgeTextWrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusBadgeTitle: {
    color: '#2ECC71',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  bonusBadgePlus: {
    color: '#2ECC71',
    fontSize: 9,
    fontWeight: '900',
    marginTop: -2,
  },
});
