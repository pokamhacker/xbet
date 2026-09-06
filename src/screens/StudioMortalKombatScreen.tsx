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
import { BetSlip, MatchEvent } from '../types/bet';

interface MKSelection {
  id: string;
  roundNumber: number;
  timeString: string;
  marketTitle: string;
  prediction: string;
  odd: number;
}

const FIGHTERS = [
  { name: 'Scorpion', color: '#F59E0B', icon: 'fire' },
  { name: 'Sub-Zero', color: '#0EA5E9', icon: 'snowflake' },
  { name: 'Raiden', color: '#EAB308', icon: 'flash' },
  { name: 'Liu Kang', color: '#EF4444', icon: 'dragon' },
  { name: 'Sonya Blade', color: '#10B981', icon: 'shield-account' },
  { name: 'Johnny Cage', color: '#8B5CF6', icon: 'glasses' },
  { name: 'Mileena', color: '#EC4899', icon: 'skull-crossbones' },
  { name: 'Shao Kahn', color: '#DC2626', icon: 'crown' },
];

export default function StudioMortalKombatScreen({ navigation }: any) {
  const { addCoupon } = useBetStore();

  const [fighter1, setFighter1] = useState(FIGHTERS[0]);
  const [fighter2, setFighter2] = useState(FIGHTERS[1]);
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(1);
  const [stake, setStake] = useState('500');

  // Selections added to ticket
  const [selections, setSelections] = useState<MKSelection[]>([
    {
      id: 'mk-init-1',
      roundNumber: 1,
      timeString: '03.09.2026 (21:15)',
      marketTitle: 'Type de victoire - Round 1',
      prediction: 'Scorpion par Brutality',
      odd: 5.5,
    },
  ]);

  // Total odds calculation
  const totalOdds = selections.reduce((acc, s) => acc * s.odd, 1);
  const numericStake = parseFloat(stake) || 0;
  const potentialPayout = Math.round(numericStake * totalOdds);

  const addSelection = (marketTitle: string, prediction: string, odd: number) => {
    const newSel: MKSelection = {
      id: String(Date.now() + Math.random()),
      roundNumber: activeRound,
      timeString: `03.09.2026 (21:${15 + (activeRound - 1) * 3})`,
      marketTitle,
      prediction,
      odd,
    };
    setSelections([...selections, newSel]);
  };

  const removeSelection = (id: string) => {
    if (selections.length <= 1) {
      Alert.alert('Action impossible', 'Le coupon doit comporter au moins 1 sélection.');
      return;
    }
    setSelections(selections.filter((s) => s.id !== id));
  };

  const handleCreateCoupon = () => {
    const ticketId = generateCouponId();

    const slipEvents: MatchEvent[] = selections.map((sel) => ({
      id: sel.id,
      sport: 'Cyber-Sport',
      league: 'Mortal Kombat 11 · Cyber Arena',
      date: sel.timeString,
      homeTeam: { name: fighter1.name },
      awayTeam: { name: fighter2.name },
      prediction: sel.prediction,
      odd: sel.odd,
      status: 'Accepté',
      badge: 'MK-11',
      gameCategory: 'mortalkombat',
      mkResult: {
        rounds: [
          { roundNum: 1, winner: fighter1.name, victoryType: 'Brutality' },
          { roundNum: 2, winner: fighter2.name, victoryType: 'Normal' },
          { roundNum: 3, winner: fighter1.name, victoryType: 'Fatality' },
        ],
        finalWinner: fighter1.name,
      },
    }));

    const newCoupon: BetSlip = {
      id: ticketId,
      createdAt: '03.09.2026 (21:12)',
      type: selections.length > 1 ? 'Combiné' : 'Simple',
      eventsCount: selections.length,
      completedCount: 0,
      totalOdds: Math.round(totalOdds * 100) / 100,
      stake: numericStake,
      potentialPayout: potentialPayout,
      status: 'Accepté',
      events: slipEvents,
      isForSale: false,
      shareCode: generateShareCode(),
      gameCategory: 'mortalkombat',
    };

    addCoupon(newCoupon);

    Alert.alert(
      'Coupon Mortal Kombat Créé !',
      `Coupon ${newCoupon.type} № ${ticketId}\nCote totale: ${newCoupon.totalOdds}\nGains potentiels: ${potentialPayout.toLocaleString(
        'fr-FR'
      )} ₣\n\nLe combat est enregistré dans votre Historique !`,
      [
        {
          text: 'Voir dans l’Historique',
          onPress: () => navigation.navigate('Historique'),
        },
        { text: 'Continuer' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio Mortal Kombat</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Cyber-Sport */}
        <View style={styles.mkBanner}>
          <View style={styles.bannerIconBox}>
            <MaterialCommunityIcons name="sword-cross" size={26} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Mortal Kombat 11</Text>
            <Text style={styles.bannerSub}>Combats simulés en direct, types de fatalités et cotes dynamiques.</Text>
          </View>
        </View>

        {/* Fighter Matchup Card */}
        <View style={styles.matchupCard}>
          <Text style={styles.cardHeaderTitle}>SÉLECTION DU DUEL</Text>

          <View style={styles.versusRow}>
            {/* Fighter 1 */}
            <View style={styles.fighterBox}>
              <View style={[styles.fighterAvatar, { borderColor: fighter1.color }]}>
                <MaterialCommunityIcons name={fighter1.icon as any} size={28} color={fighter1.color} />
              </View>
              <Text style={styles.fighterName}>{fighter1.name}</Text>
            </View>

            <View style={styles.vsBadge}>
              <Text style={styles.vsBadgeText}>VS</Text>
            </View>

            {/* Fighter 2 */}
            <View style={styles.fighterBox}>
              <View style={[styles.fighterAvatar, { borderColor: fighter2.color }]}>
                <MaterialCommunityIcons name={fighter2.icon as any} size={28} color={fighter2.color} />
              </View>
              <Text style={styles.fighterName}>{fighter2.name}</Text>
            </View>
          </View>

          {/* Quick Roster Picker */}
          <Text style={styles.rosterLabel}>Changer les combattants :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rosterScroll}>
            {FIGHTERS.map((f) => (
              <TouchableOpacity
                key={f.name}
                style={[
                  styles.rosterChip,
                  (fighter1.name === f.name || fighter2.name === f.name) && styles.rosterChipActive,
                ]}
                onPress={() => {
                  if (fighter1.name !== f.name && fighter2.name !== f.name) {
                    setFighter2(f);
                  }
                }}
              >
                <Text style={styles.rosterChipText}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Round Navigation Tabs */}
        <View style={styles.roundTabContainer}>
          {([1, 2, 3] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roundTab, activeRound === r && styles.roundTabActive]}
              onPress={() => setActiveRound(r)}
            >
              <Text style={[styles.roundTabText, activeRound === r && styles.roundTabTextActive]}>
                ROUND {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Category 1: Vainqueur Round */}
        <View style={styles.marketBox}>
          <Text style={styles.marketTitle}>Vainqueur du Round {activeRound}</Text>
          <View style={styles.oddsGrid}>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() => addSelection(`Vainqueur R${activeRound}`, `${fighter1.name} gagne R${activeRound}`, 1.85)}
            >
              <Text style={styles.oddName}>{fighter1.name}</Text>
              <Text style={styles.oddValue}>1.85</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() => addSelection(`Vainqueur R${activeRound}`, `${fighter2.name} gagne R${activeRound}`, 1.95)}
            >
              <Text style={styles.oddName}>{fighter2.name}</Text>
              <Text style={styles.oddValue}>1.95</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Category 2: Types de Finition (Brutality / Fatality / Flawless) */}
        <View style={styles.marketBox}>
          <Text style={styles.marketTitle}>Type de Finition (Round {activeRound})</Text>
          <View style={styles.oddsGrid}>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() =>
                addSelection(
                  `Finition R${activeRound}`,
                  `${fighter1.name} par Brutality 🩸`,
                  5.5
                )
              }
            >
              <Text style={styles.oddName}>{fighter1.name} (Brutality)</Text>
              <Text style={[styles.oddValue, { color: Colors.danger }]}>5.50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() =>
                addSelection(
                  `Finition R${activeRound}`,
                  `${fighter2.name} par Brutality 🩸`,
                  5.8
                )
              }
            >
              <Text style={styles.oddName}>{fighter2.name} (Brutality)</Text>
              <Text style={[styles.oddValue, { color: Colors.danger }]}>5.80</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() =>
                addSelection(`Finition R${activeRound}`, `${fighter1.name} par Fatality 💀`, 2.75)
              }
            >
              <Text style={styles.oddName}>{fighter1.name} (Fatality)</Text>
              <Text style={styles.oddValue}>2.75</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() =>
                addSelection(`Finition R${activeRound}`, `${fighter2.name} par Fatality 💀`, 2.85)
              }
            >
              <Text style={styles.oddName}>{fighter2.name} (Fatality)</Text>
              <Text style={styles.oddValue}>2.85</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.oddBtn, { width: '100%' }]}
              onPress={() =>
                addSelection(`Finition R${activeRound}`, `Flawless Victory (Sans dégâts) ⚡`, 18.0)
              }
            >
              <Text style={styles.oddName}>Flawless Victory (Sans subir de dégâts)</Text>
              <Text style={[styles.oddValue, { color: Colors.gold }]}>18.00</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Category 3: Durée & Total */}
        <View style={styles.marketBox}>
          <Text style={styles.marketTitle}>Durée & Total du Combat</Text>
          <View style={styles.oddsGrid}>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() => addSelection('Total Rounds', 'Plus de 2.5 Rounds', 2.1)}
            >
              <Text style={styles.oddName}>Plus de 2.5 Rounds</Text>
              <Text style={styles.oddValue}>2.10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oddBtn}
              onPress={() => addSelection('Total Rounds', 'Moins de 2.5 Rounds', 1.7)}
            >
              <Text style={styles.oddName}>Moins de 2.5 Rounds</Text>
              <Text style={styles.oddValue}>1.70</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Added Selections List */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeaderTitle}>SÉLECTIONS MK AJOUTÉES ({selections.length})</Text>
          {selections.map((s, idx) => (
            <View key={s.id} style={styles.selItemRow}>
              <Text style={styles.selIndex}>{idx + 1}.</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.selTitle}>{s.marketTitle}</Text>
                <Text style={styles.selPred}>{s.prediction}</Text>
              </View>
              <Text style={styles.selOdd}>{s.odd.toFixed(2)}</Text>
              <TouchableOpacity onPress={() => removeSelection(s.id)} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Stake & Financials */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Mise (F)</Text>
          <TextInput
            style={styles.stakeInput}
            value={stake}
            onChangeText={setStake}
            keyboardType="numeric"
          />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cote totale :</Text>
            <Text style={styles.summaryVal}>{totalOdds.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gains potentiels :</Text>
            <Text style={styles.summaryPayout}>{potentialPayout.toLocaleString('fr-FR')} ₣</Text>
          </View>

          <TouchableOpacity style={styles.createCouponBtn} onPress={handleCreateCoupon}>
            <Text style={styles.createCouponBtnText}>Créer le coupon Mortal Kombat</Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1917',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#44403C',
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  bannerSub: {
    fontSize: 11,
    color: '#A8A29E',
    marginTop: 2,
    lineHeight: 15,
  },
  matchupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  versusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  fighterBox: {
    alignItems: 'center',
  },
  fighterAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  fighterName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  rosterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  rosterScroll: {
    flexDirection: 'row',
  },
  rosterChip: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  rosterChipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primaryAccent,
  },
  rosterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  roundTabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roundTab: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roundTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roundTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  roundTabTextActive: {
    color: '#fff',
  },
  marketBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  marketTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  oddsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  oddBtn: {
    width: '48.5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  oddName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  oddValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
  },
  selItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  selIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  selTitle: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  selPred: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selOdd: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryAccent,
    marginRight: 4,
  },
  fieldLabel: {
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
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryPayout: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.success,
  },
  createCouponBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  createCouponBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
