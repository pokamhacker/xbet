import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopBarProps {
  balance: number;
  onBackPress?: () => void;
  onPlusPress?: () => void;
  onBonusPress?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  balance,
  onBackPress,
  onPlusPress,
  onBonusPress,
}) => {
  const insets = useSafeAreaInsets();

  // Formatage officiel fr-FR : ex. "26 532 207,34 F" (séparateurs d'espace et virgule décimale)
  const formattedBalance = balance
    .toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/\u202f/g, ' ');

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: insets.top + 48,
        },
      ]}
    >
      <View style={styles.headerRow}>
        {/* 1. Bouton Retour à gauche : chevron fin et tactile 44x44 */}
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        {/* 2. Centre : Pastille de solde sombre au format fr-FR avec bouton '+' vert */}
        <View style={styles.balanceCapsule}>
          <Text style={styles.balanceText}>{formattedBalance} F</Text>
          <TouchableOpacity
            style={styles.plusCircle}
            onPress={onPlusPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Recharger"
          >
            <Text style={styles.plusSign}>+</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Droite : Bouton Bonus avec pastille '+' */}
        <TouchableOpacity
          style={styles.bonusButton}
          onPress={onBonusPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Bonus"
        >
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusText}>BONUS</Text>
            <View style={styles.bonusPlusBadge}>
              <Text style={styles.bonusPlus}>+</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerRow: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrow: {
    color: '#10678d',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 36,
  },
  balanceCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b4743',
    borderRadius: 22,
    height: 38,
    paddingLeft: 14,
    paddingRight: 4,
    minWidth: 165,
    justifyContent: 'space-between',
  },
  balanceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 10,
    letterSpacing: 0.3,
  },
  plusCircle: {
    backgroundColor: '#28a745',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSign: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    lineHeight: 21,
  },
  bonusButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  bonusBadge: {
    borderWidth: 1.5,
    borderColor: '#10678d',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(16, 103, 141, 0.04)',
  },
  bonusText: {
    color: '#10678d',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bonusPlusBadge: {
    position: 'absolute',
    top: -5,
    right: -6,
    backgroundColor: '#10678d',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusPlus: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});
