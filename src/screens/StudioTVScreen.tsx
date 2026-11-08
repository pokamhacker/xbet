import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useResponsive } from '../utils/responsive';
import { generateCouponId, generateRoundCode, generateShareCode, generateRealisticPokerDraw } from '../utils/pokerEngine';
import { BetSlip, MatchEvent } from '../types/bet';
import { PokerScheduleModal } from '../components/modals/PokerScheduleModal';
import { SingleRoundEditModal } from '../components/modals/SingleRoundEditModal';
import {
  getCurrentDateString,
  getCurrentTimeString,
  generateRoundScheduleSequence,
  addMinutesToSchedule,
  parseScheduleString,
} from '../utils/scheduleHelper';
import { combineDateAndTime } from '../utils/dateFormatter';
import { formatCleanOdds } from '../utils/oddsFormatter';

interface RoundEvent {
  id: string;
  roundNumber: number;
  timeString: string;
  marketType: 'combination' | 'hand';
  selectedOption: { name: string; odd: number } | null;
  roundCode: string;
}

const COMBINATIONS = [
  { name: 'Combinaison gagnante. Carte haute', odd: 100 },
  { name: 'Combinaison gagnante. Une Paire', odd: 5.8 },
  { name: 'Combinaison gagnante. Deux Paires', odd: 3.1 },
  { name: 'Combinaison gagnante. Brelan', odd: 6.8 },
  { name: 'Combinaison gagnante. Quinte', odd: 5.7 },
  { name: 'Combinaison gagnante. Couleur', odd: 8.7 },
  { name: 'Combinaison gagnante. Full House', odd: 8.6 },
  { name: 'Combinaison gagnante. Carré', odd: 100 },
  { name: 'Combinaison gagnante. Quinte flush', odd: 600 },
  { name: 'Combinaison gagnante. Quinte flush royale', odd: 1000 },
  { name: 'Combinaison gagnante. Carte haute', odd: 1000 },
];

const HANDS = [

  { name: 'Quelle Main va gagner ?.(1)', odd: 5.2 },
  { name: 'Quelle Main va gagner ?.(2)', odd: 5.2 },
  { name: 'Quelle Main va gagner ?.(3)', odd: 5.2 },
  { name: 'Quelle Main va gagner ?.(4)', odd: 5.2 },
  { name: 'Quelle Main va gagner ?.(5)', odd: 5.2 },
  { name: 'Quelle Main va gagner ?.(6)', odd: 5.2 },
];

export default function StudioTVScreen({ navigation }: any) {
  const hasAccess = useAuthStore((s) => s.hasAccessToFeature('studio_tv'));

  useEffect(() => {
    if (!hasAccess) {
      Alert.alert(
        'Accès restreint',
        "Vous n'avez pas l'autorisation d'accéder au Studio TV & Poker. Veuillez contacter votre administrateur.",
        [{ text: 'Compris', onPress: () => navigation.goBack() }]
      );
    }
  }, [hasAccess, navigation]);

  const { addCoupon } = useBetStore();
  const { currentTheme, theme: baseTheme } = useThemeStore();
  const theme = currentTheme || baseTheme;
  const isDark = theme.isDark;
  const { contentContainerStyle } = useResponsive();

  // Configuration de Programmation (Date, Heure, Intervalle)
  const [placedDate, setPlacedDate] = useState(getCurrentDateString());
  const [placedTime, setPlacedTime] = useState(getCurrentTimeString());
  const [startDate, setStartDate] = useState(getCurrentDateString());
  const [startTime, setStartTime] = useState(getCurrentTimeString());
  const [interval, setInterval] = useState(3); // 3 minutes standard TVBet
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingRound, setEditingRound] = useState<RoundEvent | null>(null);

  const [stake, setStake] = useState('90');

  // Multi-round poker list initialisée avec l'horaire de départ dynamique
  const [events, setEvents] = useState<RoundEvent[]>([
    {
      id: '1',
      roundNumber: 1,
      timeString: `${getCurrentDateString()} (${getCurrentTimeString()})`,
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

  // Applique la programmation complète (date, heure, intervalle, nombre de manches)
  const handleApplySchedule = ({
    placedDate: newPlacedDate,
    placedTime: newPlacedTime,
    startDate: newStartDate,
    startTime: newStartTime,
    interval: newInterval,
    roundsCount: newRoundsCount,
  }: {
    placedDate?: string;
    placedTime?: string;
    startDate: string;
    startTime: string;
    interval: number;
    roundsCount: number;
  }) => {
    if (newPlacedDate) setPlacedDate(newPlacedDate);
    if (newPlacedTime) setPlacedTime(newPlacedTime);
    setStartDate(newStartDate);
    setStartTime(newStartTime);
    setInterval(newInterval);

    const sequence = generateRoundScheduleSequence(
      newStartDate,
      newStartTime,
      newInterval,
      newRoundsCount,
      1
    );

    const newEvents: RoundEvent[] = sequence.map((item, idx) => {
      const existing = events[idx];
      return {
        id: existing?.id || String(Date.now() + idx),
        roundNumber: item.roundNumber,
        timeString: item.formatted,
        marketType: existing?.marketType || 'combination',
        selectedOption: existing?.selectedOption || {
          name: 'Combinaison gagnante. Carte haute',
          odd: 1000,
        },
        roundCode: existing?.roundCode || generateRoundCode(),
      };
    });

    setEvents(newEvents);
    Alert.alert(
      'Programmation Appliquée !',
      `${newRoundsCount} manche(s) programmée(s) dès le ${newStartDate} (${newStartTime}) avec un cadencement de ${newInterval} min.`
    );
  };

  // Ajoute une manche en calculant automatiquement l'horaire suivant (+intervalle)
  const addRound = () => {
    const nextRound = events.length + 1;
    let nextTimeString = '';

    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      const parsed = parseScheduleString(lastEvent.timeString);
      const nextTime = addMinutesToSchedule(parsed.dateStr, parsed.timeStr, interval);
      nextTimeString = nextTime.formatted;
    } else {
      nextTimeString = `${startDate} (${startTime})`;
    }

    const newEvent: RoundEvent = {
      id: String(Date.now()),
      roundNumber: nextRound,
      timeString: nextTimeString,
      marketType: 'combination',
      selectedOption: { name: 'Combinaison gagnante. Carte haute', odd: 1000 },
      roundCode: generateRoundCode(),
    };
    setEvents([...events, newEvent]);
  };

  // Décale tous les horaires de X minutes
  const handleQuickShift = (minutes: number) => {
    const updated = events.map((ev) => {
      const parsed = parseScheduleString(ev.timeString);
      const res = addMinutesToSchedule(parsed.dateStr, parsed.timeStr, minutes);
      return { ...ev, timeString: res.formatted };
    });
    setEvents(updated);
    if (updated.length > 0) {
      const firstParsed = parseScheduleString(updated[0].timeString);
      setStartDate(firstParsed.dateStr);
      setStartTime(firstParsed.timeStr);
    }
  };

  // Mise à jour individuelle d'une manche
  const handleUpdateSingleRound = (updated: { timeString: string; roundCode: string }) => {
    if (!editingRound) return;
    setEvents(
      events.map((e) =>
        e.id === editingRound.id
          ? { ...e, timeString: updated.timeString, roundCode: updated.roundCode }
          : e
      )
    );
    setEditingRound(null);
  };

  // Régénère le code TVBet d'une manche
  const handleRegenerateRoundCode = (eventId: string) => {
    setEvents(
      events.map((e) => (e.id === eventId ? { ...e, roundCode: generateRoundCode() } : e))
    );
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

    // L'heure à laquelle on mise le coupon est différente de l'heure de début du coupon / match
    const placedDateTime = combineDateAndTime(placedDate, placedTime);
    const combinedCouponDate = combineDateAndTime(startDate, startTime);

    const slipEvents: MatchEvent[] = events.map((ev) => {
      const parsed = parseScheduleString(ev.timeString);
      const evCombined = combineDateAndTime(parsed.dateStr, parsed.timeStr);
      const handMatch = ev.selectedOption!.name.match(/\(([1-6])\)/);
      const resolvedTargetHand = (ev.marketType === 'hand' && handMatch)
        ? parseInt(handMatch[1], 10)
        : undefined;

      return {
        id: ev.id,
        sport: 'Cyber-Sport',
        league: 'TvBet. POKER',
        date: evCombined.formatted,
        startDate: evCombined.toISOString(),
        matchTime: parsed.timeStr,
        matchDate: parsed.dateStr,
        homeTeam: { name: 'Main 1' },
        awayTeam: { name: 'Main 6' },
        prediction: ev.selectedOption!.name,
        odd: ev.selectedOption!.odd,
        status: 'Accepté' as const,
        roundCode: ev.roundCode,
        badge: 'POKE',
        gameCategory: 'poker' as const,
        pokerResult: generateRealisticPokerDraw(resolvedTargetHand, ev.selectedOption!.name, ev.roundCode || ev.id),
        isLive: true,
      };
    });

    const newCoupon: BetSlip = {
      id: ticketId,
      ticketNumber: ticketId,
      createdAt: placedDateTime.formatted,
      startDate: combinedCouponDate.toISOString(),
      matchTime: startTime,
      matchDate: startDate,
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
      isLive: true,
    };

    addCoupon(newCoupon);

    Alert.alert(
      'Coupon TVBet Créé !',
      `Coupon ${newCoupon.type} № ${ticketId}\nCote totale: ${formatCleanOdds(totalOdd)}\nGains potentiels: ${potentialPayout.toLocaleString(
        'fr-FR'
      )} ₣\n\nLe coupon a été ajouté à votre Historique !`,
      [
        {
          text: 'Voir l’Historique',
          onPress: () => navigation.navigate('Historique'),
        },
        { text: 'Continuer' },
      ]
    );
  };

  if (!hasAccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B132B', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="lock-closed" size={56} color="#EF4444" />
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
          Accès restreint
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Votre compte n'a pas l'autorisation d'accéder au Studio TV & Poker. Veuillez contacter votre administrateur.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            alignSelf: 'center',
            maxWidth: 600,
            width: '100%',
            backgroundColor: theme.headerBackground || theme.cardBackground,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Studio TV</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="game-controller-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, contentContainerStyle]} showsVerticalScrollIndicator={false}>
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

        {/* Panneau de Programmation des Manches */}
        <View style={styles.scheduleHeaderRow}>
          <Text style={styles.sectionHeader}>Programmation des manches</Text>
          <View style={styles.intervalBadge}>
            <MaterialCommunityIcons name="timer-sand" size={13} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.intervalBadgeText}>Espacées de {interval} min (TVBet)</Text>
          </View>
        </View>

        <View style={styles.scheduleCard}>
          <TouchableOpacity
            style={styles.dateSelector}
            activeOpacity={0.8}
            onPress={() => setIsScheduleModalVisible(true)}
          >
            <View style={styles.dateIconBox}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateSub}>Heure de mise du coupon (Header & Historique)</Text>
              <Text style={styles.dateValue}>
                {placedDate} ({placedTime})
              </Text>
              <Text style={styles.scheduleDetailText}>
                Début 1ère manche : {events[0]?.timeString || `${startDate} (${startTime})`} • {events.length} manche{events.length > 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons name="create-outline" size={20} color={theme.primary} />
          </TouchableOpacity>

          {/* Raccourcis Rapides de Décalage */}
          <View style={styles.quickShiftRow}>
            <Text style={styles.quickShiftLabel}>Ajustement rapide :</Text>
            <TouchableOpacity style={styles.quickShiftBtn} onPress={() => handleQuickShift(2)}>
              <Text style={styles.quickShiftBtnText}>+2 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickShiftBtn} onPress={() => handleQuickShift(5)}>
              <Text style={styles.quickShiftBtnText}>+5 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickShiftBtn} onPress={() => handleQuickShift(15)}>
              <Text style={styles.quickShiftBtnText}>+15 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickShiftBtn, { backgroundColor: 'rgba(37,99,235,0.1)' }]}
              onPress={() => setIsScheduleModalVisible(true)}
            >
              <Text style={[styles.quickShiftBtnText, { color: '#2563EB', fontWeight: '800' }]}>
                ⚙️ Configurer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Événements Header */}
        <View style={styles.eventsHeader}>
          <View>
            <Text style={styles.sectionHeader}>Manches programmées</Text>
            <Text style={styles.roundCounter}>
              {events.length} manche{events.length > 1 ? 's' : ''} au total
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addRound}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter une manche</Text>
          </TouchableOpacity>
        </View>

        {/* Liste des Manches */}
        {events.map((ev) => (
          <View key={ev.id} style={styles.eventCard}>
            {/* Round Title & Horaire */}
            <View style={styles.eventCardHeader}>
              <View style={styles.roundBadge}>
                <Text style={styles.roundBadgeText}>{ev.roundNumber}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.matchTitle}>TvBet. POKER</Text>
                  <View style={styles.pokerLivePill}>
                    <Text style={styles.pokerLivePillText}>MANCHE #{ev.roundNumber}</Text>
                  </View>
                </View>

                {/* Horaire cliquable pour modification individuelle */}
                <TouchableOpacity
                  style={styles.timeClickableRow}
                  activeOpacity={0.7}
                  onPress={() => setEditingRound(ev)}
                >
                  <Ionicons name="time-outline" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={styles.matchTimeText}>{ev.timeString}</Text>
                  <Ionicons name="pencil" size={11} color="#64748B" style={{ marginLeft: 5 }} />
                </TouchableOpacity>

                {/* Code TVBet */}
                <View style={styles.roundCodeRow}>
                  <Text style={styles.roundCodeLabel}>Code tirage : </Text>
                  <Text style={styles.roundCodeValue}>{ev.roundCode}</Text>
                  <TouchableOpacity
                    onPress={() => handleRegenerateRoundCode(ev.id)}
                    style={{ paddingLeft: 6 }}
                  >
                    <Ionicons name="refresh" size={12} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {events.length > 1 && (
                <TouchableOpacity onPress={() => removeRound(ev.id)} style={{ padding: 6 }}>
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
                      {formatCleanOdds(item.odd)}
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
          <Text style={styles.inputLabel}>Mise (₣)</Text>
          <TextInput
            style={styles.input}
            value={stake}
            onChangeText={setStake}
            keyboardType="numeric"
            placeholder="Montant"
          />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Cote</Text>
            <Text style={styles.summaryRowVal}>{formatCleanOdds(totalOdd)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>Gains potentiels</Text>
            <Text style={styles.summaryPayout}>{potentialPayout.toLocaleString('fr-FR')} ₣</Text>
          </View>

          <Text style={styles.disclaimerText}>Les cotes TVBet sont prédéfinies et ne peuvent pas être modifiées.</Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleCreateCoupon}>
            <Text style={styles.submitButtonText}>Créer le coupon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modale de Programmation Complète des Manches */}
      <PokerScheduleModal
        visible={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
        currentPlacedDate={placedDate}
        currentPlacedTime={placedTime}
        currentStartDate={startDate}
        currentStartTime={startTime}
        currentInterval={interval}
        currentRoundsCount={events.length}
        onApplySchedule={handleApplySchedule}
      />

      {/* Modale d'Édition Individuelle d'une Manche */}
      {editingRound && (
        <SingleRoundEditModal
          visible={!!editingRound}
          roundNumber={editingRound.roundNumber}
          initialTimeString={editingRound.timeString}
          initialRoundCode={editingRound.roundCode}
          onClose={() => setEditingRound(null)}
          onSave={handleUpdateSingleRound}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
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
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 110,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  intervalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  intervalBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduleDetailText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quickShiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
  },
  quickShiftLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quickShiftBtn: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickShiftBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pokerLivePill: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  pokerLivePillText: {
    color: '#2563EB',
    fontSize: 9,
    fontWeight: '900',
  },
  timeClickableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  matchTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  roundCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roundCodeLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  roundCodeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
