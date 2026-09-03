import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { generateCouponId, generateShareCode } from '../utils/pokerEngine';
import { BetSlip } from '../types/bet';

interface TierConfig {
  row: number;
  multiplier: number;
  goodCount: number;
  badCount: number;
}

const TIERS: TierConfig[] = [
  { row: 10, multiplier: 349.35, goodCount: 1, badCount: 4 },
  { row: 9, multiplier: 69.87, goodCount: 2, badCount: 3 },
  { row: 8, multiplier: 27.95, goodCount: 2, badCount: 3 },
  { row: 7, multiplier: 11.18, goodCount: 3, badCount: 2 },
  { row: 6, multiplier: 6.71, goodCount: 3, badCount: 2 },
  { row: 5, multiplier: 4.02, goodCount: 3, badCount: 2 },
  { row: 4, multiplier: 2.41, goodCount: 4, badCount: 1 },
  { row: 3, multiplier: 1.93, goodCount: 4, badCount: 1 },
  { row: 2, multiplier: 1.54, goodCount: 4, badCount: 1 },
  { row: 1, multiplier: 1.23, goodCount: 4, badCount: 1 },
];

export default function AppleOfFortuneScreen({ navigation }: any) {
  const { balance, deposit, withdraw, addCoupon } = useBetStore();

  const [stake, setStake] = useState('500');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTier, setCurrentTier] = useState(0); // 0 = not started, 1 to 10
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Board layout: for each tier (1-10), an array of 5 booleans (true = good apple, false = rotten)
  const [grid, setGrid] = useState<{ [row: number]: boolean[] }>({});
  // User picks: { [row: number]: selectedIndex }
  const [userPicks, setUserPicks] = useState<{ [row: number]: number }>({});

  const numericStake = parseFloat(stake) || 0;
  const currentMultiplier = currentTier > 0 ? TIERS.find((t) => t.row === currentTier)?.multiplier || 1 : 1;
  const currentPotentialWin = Math.round(numericStake * currentMultiplier);

  const startGame = () => {
    if (numericStake <= 0) {
      Alert.alert('Mise invalide', 'Veuillez saisir une mise positive.');
      return;
    }
    if (numericStake > balance) {
      Alert.alert('Solde insuffisant', 'Votre solde ne permet pas de placer cette mise.');
      return;
    }

    // Deduct stake
    withdraw(numericStake);

    // Generate new random grid for all 10 tiers
    const newGrid: { [row: number]: boolean[] } = {};
    TIERS.forEach((t) => {
      const rowArr: boolean[] = [
        ...Array(t.goodCount).fill(true),
        ...Array(t.badCount).fill(false),
      ];
      // Shuffle row
      for (let i = rowArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rowArr[i], rowArr[j]] = [rowArr[j], rowArr[i]];
      }
      newGrid[t.row] = rowArr;
    });

    setGrid(newGrid);
    setUserPicks({});
    setCurrentTier(1);
    setIsPlaying(true);
    setGameOver(false);
    setGameWon(false);
  };

  const handlePickApple = (row: number, colIndex: number) => {
    if (!isPlaying || row !== currentTier || gameOver || gameWon) return;

    const isGood = grid[row][colIndex];
    setUserPicks({ ...userPicks, [row]: colIndex });

    if (isGood) {
      if (row === 10) {
        // Jackpt reached!
        setGameWon(true);
        setIsPlaying(false);
        const winAmount = Math.round(numericStake * 349.35);
        deposit(winAmount);
        recordHistorySlip(10, 349.35, winAmount, 'Gagné');
        Alert.alert('VICTOIRE SUPRÊME !', `Tu as conquis le palier 10 ! Tu empoches ${winAmount.toLocaleString('fr-FR')} F !`);
      } else {
        setCurrentTier(row + 1);
      }
    } else {
      // Rotten apple!
      setGameOver(true);
      setIsPlaying(false);
      recordHistorySlip(row - 1, currentMultiplier, 0, 'Perdu');
      Alert.alert('Aïe ! Pomme pourrie 💀', 'La mauvaise pomme a été croquée. La mise est perdue.');
    }
  };

  const handleCashout = () => {
    if (!isPlaying || currentTier <= 1) return;

    const payout = currentPotentialWin;
    deposit(payout);
    setIsPlaying(false);
    setGameWon(true);
    recordHistorySlip(currentTier - 1, currentMultiplier, payout, 'Payé');

    Alert.alert(
      'Gains Encaissés !',
      `Félicitations ! Tu as encaissé ${payout.toLocaleString('fr-FR')} F (Palier ${currentTier - 1}, Cote ${currentMultiplier}x).`
    );
  };

  const recordHistorySlip = (
    tierReached: number,
    mult: number,
    payout: number,
    status: 'Payé' | 'Gagné' | 'Perdu'
  ) => {
    const couponId = generateCouponId();
    const newCoupon: BetSlip = {
      id: couponId,
      createdAt: '03.09.2026 (21:30)',
      type: 'Simple',
      eventsCount: 1,
      completedCount: 1,
      totalOdds: mult,
      stake: numericStake,
      potentialPayout: Math.round(numericStake * mult),
      actualPayout: payout,
      status: status,
      gameCategory: 'apple',
      shareCode: generateShareCode(),
      events: [
        {
          id: String(Date.now()),
          sport: 'Mini-Jeu',
          league: 'Apple of Fortune · 1xGames',
          date: '03.09.2026 (21:30)',
          homeTeam: { name: 'Pomme Dorée' },
          awayTeam: { name: 'Pomme Pourrie' },
          prediction: `Palier ${tierReached}/10 (${mult}x)`,
          odd: mult,
          status: status,
          badge: 'APPLE',
          gameCategory: 'apple',
        },
      ],
    };
    addCoupon(newCoupon);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apple of Fortune</Text>
        <View style={styles.balanceTag}>
          <Text style={styles.balanceTagText}>
            {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} F
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Game Rules */}
        <View style={styles.gameBanner}>
          <MaterialCommunityIcons name="apple" size={32} color={Colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.gameBannerTitle}>Grimpe les 10 Paliers</Text>
            <Text style={styles.gameBannerSub}>
              Choisis 1 pomme par palier. Évite la pomme croquée 🍏💀 pour encaisser tes gains !
            </Text>
          </View>
        </View>

        {/* 10-Tier Ladder Board */}
        <View style={styles.ladderBoard}>
          {TIERS.map((tier) => {
            const isRowActive = isPlaying && currentTier === tier.row;
            const isRowCompleted = userPicks[tier.row] !== undefined;
            const isRowLocked = tier.row > currentTier;

            return (
              <View
                key={tier.row}
                style={[
                  styles.ladderRow,
                  isRowActive && styles.ladderRowActive,
                  isRowCompleted && styles.ladderRowCompleted,
                ]}
              >
                {/* Multiplier Badge */}
                <View style={styles.multiplierBox}>
                  <Text style={styles.rowNumberText}>#{tier.row}</Text>
                  <Text style={styles.multiplierText}>{tier.multiplier}x</Text>
                </View>

                {/* 5 Apple Cells */}
                <View style={styles.applesRow}>
                  {[0, 1, 2, 3, 4].map((colIndex) => {
                    const picked = userPicks[tier.row] === colIndex;
                    const isGood = grid[tier.row]?.[colIndex];
                    const showContent = (isRowCompleted && picked) || gameOver || gameWon;

                    return (
                      <TouchableOpacity
                        key={colIndex}
                        disabled={!isRowActive}
                        activeOpacity={0.7}
                        style={[
                          styles.appleCell,
                          isRowActive && styles.appleCellActive,
                          picked && (isGood ? styles.appleCellGood : styles.appleCellBad),
                          isRowLocked && styles.appleCellLocked,
                        ]}
                        onPress={() => handlePickApple(tier.row, colIndex)}
                      >
                        {showContent ? (
                          isGood ? (
                            <MaterialCommunityIcons name="apple" size={24} color={Colors.success} />
                          ) : (
                            <MaterialCommunityIcons name="skull-scan" size={24} color={Colors.danger} />
                          )
                        ) : (
                          <MaterialCommunityIcons
                            name="help-circle-outline"
                            size={20}
                            color={isRowActive ? Colors.primaryAccent : Colors.textSubtle}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* Action & Stake Controls */}
        <View style={styles.controlCard}>
          {!isPlaying ? (
            <>
              <Text style={styles.stakeLabel}>Mise pour la partie (F)</Text>
              <TextInput
                style={styles.stakeInput}
                value={stake}
                onChangeText={setStake}
                keyboardType="numeric"
              />
              <View style={styles.quickStakes}>
                {['200', '500', '1000', '5000'].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={styles.quickStakeBtn}
                    onPress={() => setStake(val)}
                  >
                    <Text style={styles.quickStakeText}>+{val}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.playBtn} onPress={startGame}>
                <Text style={styles.playBtnText}>LANCER LA PARTIE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.liveGameSummary}>
                <View>
                  <Text style={styles.summarySub}>Palier actuel</Text>
                  <Text style={styles.summaryBigText}>Palier {currentTier} / 10</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.summarySub}>Gain actuel possible</Text>
                  <Text style={[styles.summaryBigText, { color: Colors.success }]}>
                    {currentPotentialWin.toLocaleString('fr-FR')} F
                  </Text>
                </View>
              </View>

              {currentTier > 1 && (
                <TouchableOpacity style={styles.cashoutBtn} onPress={handleCashout}>
                  <Ionicons name="wallet-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.cashoutBtnText}>
                    ENCAISSER {currentPotentialWin.toLocaleString('fr-FR')} F
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  balanceTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  gameBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  gameBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  gameBannerSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  ladderBoard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  ladderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  ladderRowActive: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  ladderRowCompleted: {
    backgroundColor: '#F0FDF4',
  },
  multiplierBox: {
    width: 68,
    paddingRight: 6,
  },
  rowNumberText: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  applesRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  appleCell: {
    flex: 1,
    height: 38,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleCellActive: {
    borderColor: Colors.gold,
    backgroundColor: '#FFFBEB',
    transform: [{ scale: 1.05 }],
  },
  appleCellGood: {
    backgroundColor: Colors.successSoft,
    borderColor: Colors.success,
  },
  appleCellBad: {
    backgroundColor: Colors.dangerSoft,
    borderColor: Colors.danger,
  },
  appleCellLocked: {
    opacity: 0.6,
  },
  controlCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stakeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  stakeInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  quickStakes: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  quickStakeBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStakeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  playBtn: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  playBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveGameSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summarySub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  summaryBigText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  cashoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
  },
  cashoutBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
