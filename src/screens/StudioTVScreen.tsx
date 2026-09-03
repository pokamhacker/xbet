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
import { generateCouponId, generateRoundCode, generateShareCode } from '../utils/pokerEngine';
import { BetSlip, MatchEvent } from '../types/bet';

interface RoundEvent {
  id: string;
  roundNumber: number;
  timeString: string;
  marketType: 'combination' | 'hand';
  selectedOption: { name: string; odd: number } | null;
  roundCode: string;
}

const COMBINATIONS = [
  { name: 'Carte haute', odd: 100 },
  { name: 'Une Paire', odd: 5 },
  { name: 'Deux Paires', odd: 3 },
  { name: 'Brelan', odd: 6 },
  { name: 'Quinte', odd: 5 },
  { name: 'Couleur', odd: 8 },
  { name: 'Full House', odd: 8 },
  { name: 'Carré', odd: 10 },
  { name: 'Quinte flush', odd: 60 },
  { name: 'Quinte flush royale', odd: 100 },
  { name: 'Combinaison gagnante. Carte haute', odd: 1000 },
];

const HANDS = [
  { name: 'Main 1', odd: 5 },
  { name: 'Main 2', odd: 5 },
  { name: 'Main 3', odd: 5 },
  { name: 'Main 4', odd: 5 },
  { name: 'Main 5', odd: 5 },
  { name: 'Main 6', odd: 5 },
  { name: 'Quelle Main va gagner ?. Main 1', odd: 5 },
];

export default function StudioTVScreen({ navigation }: any) {
  const { addCoupon } = useBetStore();

  const [baseDate, setBaseDate] = useState('03.09.2026 (13:32)');
  const [stake, setStake] = useState('90');

  // Multi-round poker list
  const [events, setEvents] = useState<RoundEvent[]>([
    {
      id: '1',
      roundNumber: 1,
      timeString: '03.09.2026 (13:32)',
      marketType: 'combination',
      selectedOption: { name: 'Combinaison gagnante. Carte haute', odd: 1000 },
      roundCode: generateRoundCode(),
    },
  ]);

  // Dynamic odds calculation
  const totalOdd = events.reduce((acc, ev) => {
    return ev.selectedOption ? acc * (ev.selectedOption.odd || 1) : acc;
  }, 1);

  const numericStake = parseFloat(stake) || 0;
  const potentialPayout = Math.round(numericStake * totalOdd);

  const addRound = () => {
    const nextRound = events.length + 1;
    const baseMinutes = 32 + (nextRound - 1) * 3;
    const hour = 13 + Math.floor(baseMinutes / 60);
    const minute = baseMinutes % 60;
    const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;

    const newEvent: RoundEvent = {
      id: String(Date.now()),
      roundNumber: nextRound,
      timeString: `03.09.2026 (${hour}:${minuteStr})`,
      marketType: 'combination',
      selectedOption: { name: 'Combinaison gagnante. Carte haute', odd: 1000 },
      roundCode: generateRoundCode(),
    };
    setEvents([...events, newEvent]);
  };

  const selectMarket = (eventId: string, type: 'combination' | 'hand') => {
    setEvents(
      events.map((e) =>
        e.id === eventId ? { ...e, marketType: type, selectedOption: null } : e
      )
    );
  };

  const selectBet = (eventId: string, option: { name: string; odd: number }) => {
    setEvents(
      events.map((e) => (e.id === eventId ? { ...e, selectedOption: option } : e))
    );
  };

  const removeRound = (eventId: string) => {
    if (events.length <= 1) {
      Alert.alert('Action impossible', 'Le coupon doit contenir au moins 1 manche.');
      return;
    }
    setEvents(events.filter((e) => e.id !== eventId));
  };

  const handleCreateCoupon = () => {
    const unselected = events.find((e) => !e.selectedOption);
    if (unselected) {
      Alert.alert('Pronostic manquant', `Veuillez sélectionner un pronostic pour la manche ${unselected.roundNumber}.`);
      return;
    }

    const ticketId = generateCouponId();

    const slipEvents: MatchEvent[] = events.map((ev) => ({
      id: ev.id,
      sport: 'Cyber-Sport',
      league: 'TvBet. POKER',
      date: ev.timeString,
      homeTeam: { name: 'Main 1' },
      awayTeam: { name: 'Main 6' },
      prediction: ev.selectedOption!.name,
      odd: ev.selectedOption!.odd,
      status: 'Accepté',
      roundCode: ev.roundCode,
      badge: 'POKE',
      gameCategory: 'poker',
    }));

    const newCoupon: BetSlip = {
      id: ticketId,
      createdAt: '03.09.2026 (13:30)',
      type: events.length > 1 ? 'Combiné' : 'Simple',
      eventsCount: events.length,
      completedCount: 0,
      totalOdds: totalOdd,
      stake: numericStake,
      potentialPayout: potentialPayout,
      status: 'Accepté',
      events: slipEvents,
      isForSale: false,
      shareCode: generateShareCode(),
      gameCategory: 'poker',
    };

    addCoupon(newCoupon);

    Alert.alert(
      'Coupon TVBet Créé !',
      `Coupon ${newCoupon.type} № ${ticketId}\nCote totale: ${totalOdd.toLocaleString(
        'fr-FR'
      )}\nGains potentiels: ${potentialPayout.toLocaleString(
        'fr-FR'
      )} F\n\nLe coupon a été ajouté à votre Historique !`,
      [
        {
          text: 'Voir l’Historique',
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio TV</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="game-controller-outline" size={24} color={Colors.textSubtle} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Info */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <MaterialCommunityIcons name="television-play" size={24} color={Colors.primaryAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Coupon TVBet Poker</Text>
            <Text style={styles.infoSubtitle}>
              Ajoute plusieurs manches. Leurs horaires sont espacés automatiquement de 3 minutes.
            </Text>
          </View>
        </View>

        {/* Programmation */}
        <Text style={styles.sectionHeader}>Programmation</Text>
        <TouchableOpacity style={styles.dateSelector}>
          <View style={styles.dateIconBox}>
            <Ionicons name="calendar-outline" size={18} color={Colors.primaryAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateSub}>Première manche</Text>
            <Text style={styles.dateValue}>{baseDate}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />
        </TouchableOpacity>
        <Text style={styles.hintText}>Les manches suivantes démarrent automatiquement toutes les 3 minutes.</Text>

        {/* Événements Header */}
        <View style={styles.eventsHeader}>
          <View>
            <Text style={styles.sectionHeader}>Événements</Text>
            <Text style={styles.roundCounter}>
              {events.length} manche{events.length > 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addRound}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des Manches */}
        {events.map((ev) => (
          <View key={ev.id} style={styles.eventCard}>
            {/* Round Title */}
            <View style={styles.eventCardHeader}>
              <View style={styles.roundBadge}>
                <Text style={styles.roundBadgeText}>{ev.roundNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.matchTitle}>TvBet. POKER</Text>
                <Text style={styles.matchTime}>{ev.timeString}</Text>
              </View>
              {events.length > 1 && (
                <TouchableOpacity onPress={() => removeRound(ev.id)} style={{ padding: 4 }}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>

            {/* Onglets Choix du Marché */}
            <Text style={styles.marketLabel}>Marché</Text>
            <View style={styles.marketTabs}>
              <TouchableOpacity
                style={[styles.tabButton, ev.marketType === 'combination' && styles.tabButtonActive]}
                onPress={() => selectMarket(ev.id, 'combination')}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    ev.marketType === 'combination' && styles.tabButtonTextActive,
                  ]}
                >
                  Combinaison
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, ev.marketType === 'hand' && styles.tabButtonActive]}
                onPress={() => selectMarket(ev.id, 'hand')}
              >
                <Text
                  style={[styles.tabButtonText, ev.marketType === 'hand' && styles.tabButtonTextActive]}
                >
                  Quelle Main va...
                </Text>
              </TouchableOpacity>
            </View>

            {/* Pronostics List */}
            <Text style={styles.marketLabel}>Pronostic</Text>
            <View style={styles.oddsGrid}>
              {(ev.marketType === 'combination' ? COMBINATIONS : HANDS).map((item, idx) => {
                const isSelected = ev.selectedOption?.name === item.name;
                const isFullWidth = item.name.length > 20;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.oddBox,
                      isFullWidth && styles.oddBoxFull,
                      isSelected && styles.oddBoxActive,
                    ]}
                    onPress={() => selectBet(ev.id, item)}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.oddName, isSelected && styles.oddTextActive]}
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.oddValue, isSelected && styles.oddTextActive]}>
                      {item.odd}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Mise et résumé */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Mise et résumé</Text>
          <Text style={styles.inputLabel}>Mise (F)</Text>
          <TextInput
            style={styles.input}
            value={stake}
            onChangeText={setStake}
            keyboardType="numeric"
            placeholder="Montant"
          />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Cote</Text>
            <Text style={styles.summaryRowVal}>{totalOdd.toLocaleString('fr-FR')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Gains potentiels</Text>
            <Text style={styles.summaryPayout}>{potentialPayout.toLocaleString('fr-FR')} F</Text>
          </View>

          <Text style={styles.disclaimerText}>Les cotes TVBet sont prédéfinies et ne peuvent pas être modifiées.</Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateCoupon}>
            <Text style={styles.submitButtonText}>Créer le coupon</Text>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  iconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  hintText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roundCounter: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roundBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  roundBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  matchTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  matchTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  marketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
    marginTop: 4,
  },
  marketTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  oddsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  oddBox: {
    width: '48.8%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  oddBoxFull: {
    width: '100%',
  },
  oddBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  oddName: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    paddingRight: 4,
  },
  oddValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  oddTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 6,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryRowLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  summaryRowVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryPayout: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.success,
  },
  disclaimerText: {
    fontSize: 10,
    color: Colors.textSubtle,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
