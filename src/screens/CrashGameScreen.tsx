import React, { useState, useEffect, useRef } from 'react';
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

export default function CrashGameScreen({ navigation }: any) {
  const { balance, deposit, withdraw, addCoupon } = useBetStore();

  const [stake, setStake] = useState('500');
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(2.5);
  const [recentCrashes, setRecentCrashes] = useState<number[]>([1.45, 2.12, 1.15, 8.4, 1.95, 3.2, 14.8]);

  const animationTimer = useRef<any>(null);
  const numericStake = parseFloat(stake) || 0;
  const currentPotentialPayout = Math.round(numericStake * multiplier);

  useEffect(() => {
    return () => {
      if (animationTimer.current) clearInterval(animationTimer.current);
    };
  }, []);

  const handleStartFlight = () => {
    if (numericStake <= 0) {
      Alert.alert('Mise invalide', 'Veuillez renseigner une mise positive.');
      return;
    }
    if (numericStake > balance) {
      Alert.alert('Solde insuffisant', 'Votre solde est inférieur au montant misé.');
      return;
    }

    // Deduct stake from account
    withdraw(numericStake);

    // Random crash point (realistic distribution: 70% between 1.1x and 3.0x, 20% between 3.0x and 10x, 10% high)
    const rand = Math.random();
    let point = 1.2;
    if (rand < 0.25) point = 1.05 + Math.random() * 0.45; // early crash 1.05 - 1.50
    else if (rand < 0.7) point = 1.5 + Math.random() * 1.8; // medium 1.50 - 3.30
    else if (rand < 0.92) point = 3.3 + Math.random() * 6.0; // high 3.30 - 9.30
    else point = 10.0 + Math.random() * 25.0; // extreme 10.0 - 35.0
    point = Math.round(point * 100) / 100;

    setCrashPoint(point);
    setMultiplier(1.0);
    setGameState('running');

    let current = 1.0;
    const interval = 60; // 60ms updates

    if (animationTimer.current) clearInterval(animationTimer.current);

    animationTimer.current = setInterval(() => {
      // Exponential flight curve
      current += current * 0.025 + 0.01;
      const rounded = Math.round(current * 100) / 100;

      if (rounded >= point) {
        clearInterval(animationTimer.current);
        setMultiplier(point);
        setGameState('crashed');
        setRecentCrashes((prev) => [point, ...prev.slice(0, 9)]);
        recordHistorySlip(point, 0, 'Perdu');
      } else {
        setMultiplier(rounded);
      }
    }, interval);
  };

  const handleCashout = () => {
    if (gameState !== 'running') return;

    if (animationTimer.current) clearInterval(animationTimer.current);
    const winAmount = Math.round(numericStake * multiplier);
    deposit(winAmount);
    setGameState('cashed_out');
    setRecentCrashes((prev) => [multiplier, ...prev.slice(0, 9)]);
    recordHistorySlip(multiplier, winAmount, 'Payé');

    Alert.alert(
      'Encaissement Réussi !',
      `Tu as sauté à ${multiplier.toFixed(2)}x et remporté ${winAmount.toLocaleString('fr-FR')} ₣ !`
    );
  };

  const recordHistorySlip = (exitMult: number, payout: number, status: 'Payé' | 'Gagné' | 'Perdu') => {
    const couponId = generateCouponId();
    const newCoupon: BetSlip = {
      id: couponId,
      createdAt: '03.09.2026 (21:40)',
      type: 'Simple',
      eventsCount: 1,
      completedCount: 1,
      totalOdds: exitMult,
      stake: numericStake,
      potentialPayout: Math.round(numericStake * exitMult),
      actualPayout: payout,
      status: status,
      gameCategory: 'crash',
      shareCode: generateShareCode(),
      events: [
        {
          id: String(Date.now()),
          sport: 'Mini-Jeu',
          league: 'Crash · 1xGames Aviator',
          date: '03.09.2026 (21:40)',
          homeTeam: { name: 'Fusée Crash' },
          awayTeam: { name: 'Point d’éjection' },
          prediction: `Éjection à ${exitMult}x`,
          odd: exitMult,
          status: status,
          badge: 'CRASH',
          gameCategory: 'crash',
        },
      ],
    };
    addCoupon(newCoupon);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crash Aviator</Text>
        <View style={styles.balanceTag}>
          <Text style={styles.balanceTagText}>
            {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Past Multipliers Bar */}
        <View style={styles.historyBar}>
          <Text style={styles.historyLabel}>RÉCENTS :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            {recentCrashes.map((val, idx) => {
              const isHigh = val >= 10;
              const isMed = val >= 2 && val < 10;
              return (
                <View
                  key={idx}
                  style={[
                    styles.historyPill,
                    isHigh && styles.pillHigh,
                    isMed && styles.pillMed,
                    !isHigh && !isMed && styles.pillLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyPillText,
                      isHigh && { color: Colors.gold },
                      isMed && { color: '#8B5CF6' },
                      !isHigh && !isMed && { color: Colors.primaryAccent },
                    ]}
                  >
                    {val.toFixed(2)}x
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Live Flight Arena Screen */}
        <View style={styles.flightArena}>
          {/* Trajectory Graphic & Jet */}
          <View style={styles.flightBackground}>
            <View
              style={[
                styles.flightRocketWrap,
                {
                  bottom: Math.min(160, 20 + (multiplier - 1) * 35),
                  left: Math.min(220, 30 + (multiplier - 1) * 45),
                },
              ]}
            >
              <MaterialCommunityIcons
                name="airplane-takeoff"
                size={48}
                color={gameState === 'crashed' ? Colors.danger : Colors.gold}
              />
            </View>
          </View>

          {/* Central Multiplier Indicator */}
          <View style={styles.multiplierCenter}>
            <Text
              style={[
                styles.multiplierValue,
                gameState === 'crashed' && styles.multiplierCrashed,
                gameState === 'cashed_out' && styles.multiplierWon,
              ]}
            >
              {multiplier.toFixed(2)}x
            </Text>
            {gameState === 'crashed' && (
              <Text style={styles.crashedSubText}>L'AVION S'EST ENVOLÉ !</Text>
            )}
            {gameState === 'cashed_out' && (
              <Text style={styles.wonSubText}>ENCAISSÉ AVEC SUCCÈS !</Text>
            )}
            {gameState === 'running' && (
              <Text style={styles.runningSubText}>EN VOL...</Text>
            )}
          </View>
        </View>

        {/* Betting / Cashout Control Card */}
        <View style={styles.controlCard}>
          {gameState === 'running' ? (
            <TouchableOpacity style={styles.cashoutBigBtn} onPress={handleCashout}>
              <Text style={styles.cashoutBigBtnSub}>RETIRER LES GAINS</Text>
              <Text style={styles.cashoutBigBtnMain}>
                {currentPotentialPayout.toLocaleString('fr-FR')} ₣
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.fieldLabel}>Mise (₣)</Text>
              <TextInput
                style={styles.inputStake}
                value={stake}
                onChangeText={setStake}
                keyboardType="numeric"
              />

              <View style={styles.quickStakesRow}>
                {['200', '500', '1000', '5000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickStakeBtn}
                    onPress={() => setStake(amt)}
                  >
                    <Text style={styles.quickStakeText}>+{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.startFlightBtn} onPress={handleStartFlight}>
                <Text style={styles.startFlightBtnText}>PLACER UN PARI</Text>
              </TouchableOpacity>
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
  historyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  historyLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  historyScroll: {
    flexDirection: 'row',
  },
  historyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
  },
  pillLow: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primarySoft,
  },
  pillMed: {
    backgroundColor: '#F3E8FF',
    borderColor: '#E9D5FF',
  },
  pillHigh: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  flightArena: {
    height: 240,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  flightBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flightRocketWrap: {
    position: 'absolute',
  },
  multiplierCenter: {
    alignItems: 'center',
    zIndex: 10,
  },
  multiplierValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  multiplierCrashed: {
    color: Colors.danger,
  },
  multiplierWon: {
    color: Colors.successAccent,
  },
  crashedSubText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.danger,
    marginTop: 4,
    letterSpacing: 1,
  },
  wonSubText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.successAccent,
    marginTop: 4,
    letterSpacing: 1,
  },
  runningSubText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gold,
    marginTop: 4,
    letterSpacing: 1,
  },
  controlCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  inputStake: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  quickStakesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  quickStakeBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 7,
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
  startFlightBtn: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startFlightBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cashoutBigBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cashoutBigBtnSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cashoutBigBtnMain: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
});
