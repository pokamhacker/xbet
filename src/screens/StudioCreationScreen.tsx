import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { generateCouponId, generateShareCode } from '../utils/pokerEngine';
import { BetSlip, MatchEvent } from '../types/bet';

export default function StudioCreationScreen({ navigation }: any) {
  const { customLeagues, addCoupon } = useBetStore();

  // 1. Identité
  const [customId, setCustomId] = useState('');
  const [hasCustomBadge, setHasCustomBadge] = useState(false);
  const [isLiveBadge, setIsLiveBadge] = useState(false);

  // 2. Filtres & Marchés
  const [sourceType, setSourceType] = useState<'Tout' | 'FIFA' | 'Original'>('Tout');
  const [champType, setChampType] = useState<'Base' | 'Custo'>('Base');
  const [selectedLeague, setSelectedLeague] = useState('Vietnam · V-League');
  const [showLeaguePicker, setShowLeaguePicker] = useState(false);

  const [marketType, setMarketType] = useState<'Base' | 'Custo'>('Base');
  const [selectedCategory, setSelectedCategory] = useState('Résultat');
  const [homeTeam, setHomeTeam] = useState('Albany Rush');
  const [awayTeam, setAwayTeam] = useState('Aksu Pavlodar');
  const [selectedOptionLabel, setSelectedOptionLabel] = useState(
    'Le Gardien de but touchera le Ballon pendant la Première minute du Match'
  );
  const [odd, setOdd] = useState('1.85');
  const [finalScoreSwitch, setFinalScoreSwitch] = useState(false);

  // 3. Événements ajoutés
  const [addedEvents, setAddedEvents] = useState<MatchEvent[]>([
    {
      id: 'ev-init-1',
      sport: 'Football',
      league: 'Vietnam · V-League',
      date: '03.09.2026 (20:00)',
      homeTeam: { name: 'Albany Rush' },
      awayTeam: { name: 'Aksu Pavlodar' },
      prediction: 'Score exact : 5–4',
      odd: 69,
      status: 'Accepté',
      gameCategory: 'sports',
    },
  ]);

  // 4. Mise & Résumé
  const [stake, setStake] = useState('500');
  const [enableStakeBadge, setEnableStakeBadge] = useState(false);
  const [enableCashout, setEnableCashout] = useState(false);

  // Calculs dynamiques
  const totalOdds = addedEvents.reduce((acc, ev) => acc * (ev.odd || 1), 1);
  const numericStake = parseFloat(stake) || 0;
  const potentialPayout = addedEvents.length > 0 ? Math.round(numericStake * totalOdds) : 0;

  const handleAddEvent = () => {
    if (!selectedLeague) {
      Alert.alert('Championnat requis', 'Veuillez sélectionner un championnat avant d’ajouter.');
      return;
    }
    const numericOdd = parseFloat(odd) || 1.0;
    const newEv: MatchEvent = {
      id: String(Date.now()),
      sport: 'Football',
      league: selectedLeague,
      date: '03.09.2026 (20:00)',
      homeTeam: { name: homeTeam },
      awayTeam: { name: awayTeam },
      prediction: selectedOptionLabel,
      odd: numericOdd,
      status: 'Accepté',
      isLive: isLiveBadge,
      gameCategory: 'sports',
    };
    setAddedEvents([...addedEvents, newEv]);
  };

  const handleRemoveEvent = (id: string) => {
    setAddedEvents(addedEvents.filter((e) => e.id !== id));
  };

  const handleSaveCoupon = () => {
    if (addedEvents.length === 0) {
      Alert.alert('Attention', 'Ajoute au moins un événement pour sauvegarder le coupon.');
      return;
    }

    const finalId = customId.trim() !== '' ? customId.trim() : generateCouponId();

    const newCoupon: BetSlip = {
      id: finalId,
      createdAt: '03.09.2026 (20:00)',
      type: addedEvents.length > 1 ? 'Combiné' : 'Simple',
      eventsCount: addedEvents.length,
      completedCount: 0,
      totalOdds: Math.round(totalOdds * 100) / 100,
      stake: numericStake,
      potentialPayout: potentialPayout,
      status: 'Accepté',
      events: addedEvents,
      isForSale: enableCashout,
      cashoutAmount: Math.round(numericStake * 0.95),
      shareCode: generateShareCode(),
      gameCategory: 'sports',
    };

    addCoupon(newCoupon);

    Alert.alert(
      'Coupon Enregistré !',
      `Coupon ${newCoupon.type} № ${finalId}\nCote: ${newCoupon.totalOdds}\nGains potentiels: ${potentialPayout.toLocaleString(
        'fr-FR'
      )} F\n\nLe coupon a été ajouté avec succès à votre Historique !`,
      [
        {
          text: 'Voir dans l’Historique',
          onPress: () => navigation.navigate('Historique'),
        },
        { text: 'Rester ici' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Studio de création</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Banner : Création guidée */}
        <View style={styles.bannerBox}>
          <View style={styles.bannerIconBox}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={24} color={Colors.primaryAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Création guidée</Text>
            <Text style={styles.bannerSubtitle}>ID, équipes, mise et résumé dans un seul parcours.</Text>
          </View>
        </View>

        {/* Section 1 : IDENTITÉ */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>IDENTITÉ</Text>
          <Text style={styles.fieldLabel}>ID personnalisé optionnel</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 82574662089"
            value={customId}
            onChangeText={setCustomId}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            11 chiffres, commence par 85. Vide = numéro généré automatiquement. Le code partageable reste séparé.
          </Text>

          {/* Checkbox 1 */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasCustomBadge(!hasCustomBadge)}
          >
            <Ionicons
              name={hasCustomBadge ? 'checkbox' : 'square-outline'}
              size={20}
              color={hasCustomBadge ? Colors.primaryAccent : Colors.textSubtle}
            />
            <Text style={styles.checkboxLabel}>Ajouter un badge au coupon</Text>
          </TouchableOpacity>

          {/* Checkbox 2 (Badge En Direct) */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsLiveBadge(!isLiveBadge)}>
            <Ionicons
              name={isLiveBadge ? 'checkbox' : 'square-outline'}
              size={20}
              color={isLiveBadge ? Colors.primaryAccent : Colors.textSubtle}
            />
            <Text style={styles.checkboxLabel}>
              <Text style={{ color: Colors.liveRed }}>• </Text>Badge « En direct » sur le match
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 2 : ÉVÉNEMENT */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>ÉVÉNEMENT</Text>

          {/* Source Filter */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Source</Text>
            <View style={styles.pillGroup}>
              {(['Tout', 'FIFA', 'Original'] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, sourceType === s && styles.pillActive]}
                  onPress={() => setSourceType(s)}
                >
                  <Text style={[styles.pillText, sourceType === s && styles.pillTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Championnat Toggle */}
          <View style={[styles.toggleRow, { marginTop: 10 }]}>
            <Text style={styles.toggleLabel}>Championnat</Text>
            <View style={styles.pillGroup}>
              {(['Base', 'Custo'] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pill, champType === c && styles.pillActive]}
                  onPress={() => setChampType(c)}
                >
                  <Text style={[styles.pillText, champType === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dropdown Selector for League */}
          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setShowLeaguePicker(!showLeaguePicker)}
          >
            <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
            <Text style={[styles.dropdownText, selectedLeague ? { color: Colors.textPrimary, fontWeight: '700' } : null]}>
              {selectedLeague || 'Sélectionner un championnat'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Inline League Options if Open */}
          {showLeaguePicker && (
            <View style={styles.inlineLeaguePicker}>
              {customLeagues.map((lg) => (
                <TouchableOpacity
                  key={lg.id}
                  style={styles.leagueItem}
                  onPress={() => {
                    setSelectedLeague(lg.name);
                    setShowLeaguePicker(false);
                  }}
                >
                  <Text style={styles.leagueItemText}>{lg.name}</Text>
                  {selectedLeague === lg.name && (
                    <Ionicons name="checkmark" size={16} color={Colors.primaryAccent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Teams Config */}
          <View style={styles.teamsInputBlock}>
            <Text style={styles.fieldLabel}>Équipes (Domicile VS Extérieur)</Text>
            <View style={styles.teamsRowInput}>
              <TextInput
                style={[styles.teamInput, { textAlign: 'left' }]}
                value={homeTeam}
                onChangeText={setHomeTeam}
                placeholder="Équipe Domicile"
              />
              <Text style={styles.vsBadgeText}>VS</Text>
              <TextInput
                style={[styles.teamInput, { textAlign: 'right' }]}
                value={awayTeam}
                onChangeText={setAwayTeam}
                placeholder="Équipe Extérieur"
              />
            </View>
          </View>

          {/* Marché Categories Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsContainer}>
            {['Résultat', 'Double chance', 'Score', 'Stats'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.subTab, selectedCategory === cat && styles.subTabActive]}
                onPress={() => {
                  setSelectedCategory(cat);
                  if (cat === 'Résultat') setSelectedOptionLabel(`Vainqueur : ${homeTeam}`);
                  else if (cat === 'Score') setSelectedOptionLabel('Score exact : 2–1');
                  else if (cat === 'Double chance') setSelectedOptionLabel(`1X (${homeTeam} ou Nul)`);
                  else setSelectedOptionLabel('Plus de 9.5 Corners');
                }}
              >
                <Text style={[styles.subTabText, selectedCategory === cat && styles.subTabTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Option Input / Selector */}
          <Text style={[styles.fieldLabel, { marginTop: 6 }]}>Pronostic / Marché</Text>
          <TextInput
            style={styles.input}
            value={selectedOptionLabel}
            onChangeText={setSelectedOptionLabel}
            placeholder="Intitulé du pronostic"
          />

          {/* Odd and Final Score */}
          <View style={styles.oddRowWrap}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Cote</Text>
              <TextInput
                style={[styles.input, styles.oddInputText]}
                value={odd}
                onChangeText={setOdd}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.switchCol}>
              <Text style={styles.fieldLabel}>Score final</Text>
              <Switch
                value={finalScoreSwitch}
                onValueChange={setFinalScoreSwitch}
                thumbColor="#fff"
                trackColor={{ false: '#CBD5E1', true: Colors.primaryAccent }}
              />
            </View>
          </View>

          {/* Add Event Button */}
          <TouchableOpacity style={styles.addBtn} onPress={handleAddEvent}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter l'événement</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3 : ÉVÉNEMENTS (Liste) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>ÉVÉNEMENTS ({addedEvents.length})</Text>
          {addedEvents.length === 0 ? (
            <Text style={styles.emptyNote}>Ajoute au moins un événement pour sauvegarder le coupon.</Text>
          ) : (
            addedEvents.map((ev, idx) => (
              <View key={ev.id} style={styles.addedItem}>
                <Text style={styles.addedIndex}>{idx + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addedLeague}>{ev.league}</Text>
                  <Text style={styles.addedMatchTeams}>
                    {ev.homeTeam.name} vs {ev.awayTeam.name}
                  </Text>
                  <Text style={styles.addedLabel}>{ev.prediction}</Text>
                </View>
                <Text style={styles.addedOdd}>{ev.odd}</Text>
                <TouchableOpacity style={{ padding: 6 }} onPress={() => handleRemoveEvent(ev.id)}>
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Section 4 : MISE ET RÉSUMÉ */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>MISE ET RÉSUMÉ</Text>
          <Text style={styles.fieldLabel}>Mise virtuelle (F)</Text>
          <TextInput
            style={[styles.input, { fontWeight: '700', fontSize: 16 }]}
            value={stake}
            onChangeText={setStake}
            keyboardType="numeric"
          />

          {/* Checkbox Cashout */}
          <TouchableOpacity
            style={[styles.checkboxRow, { marginTop: 14 }]}
            onPress={() => setEnableCashout(!enableCashout)}
          >
            <Ionicons
              name={enableCashout ? 'checkbox' : 'square-outline'}
              size={20}
              color={enableCashout ? Colors.primaryAccent : Colors.textSubtle}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.checkboxLabel}>Activer la vente (cashout)</Text>
              <Text style={styles.helperText}>Affiche un bouton « Vendre pour X F » sur le détail du pari.</Text>
            </View>
          </TouchableOpacity>

          {/* Encart Statistiques */}
          <View style={styles.statBox}>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>Événements :</Text>
              <Text style={styles.statVal}>{addedEvents.length}</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>Cote totale :</Text>
              <Text style={styles.statVal}>{addedEvents.length > 0 ? totalOdds.toFixed(2) : '-'}</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>Gains potentiels :</Text>
              <Text style={[styles.statVal, { color: Colors.success, fontWeight: '800' }]}>
                {addedEvents.length > 0 ? `${potentialPayout.toLocaleString('fr-FR')} F` : '-'}
              </Text>
            </View>
          </View>

          <Text style={styles.dateAutoText}>Date du pari : Auto (maintenant)</Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCoupon}>
            <Text style={styles.saveBtnText}>Sauvegarder le coupon</Text>
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
  scrollArea: {
    padding: 16,
    paddingBottom: 50,
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 10,
  },
  fieldLabel: {
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
    fontSize: 13,
    color: Colors.textPrimary,
  },
  helperText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  toggleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 2,
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: '#fff',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
  },
  inlineLeaguePicker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 4,
  },
  leagueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  leagueItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  teamsInputBlock: {
    marginTop: 10,
  },
  teamsRowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 6,
    gap: 6,
  },
  teamInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 6,
  },
  vsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSubtle,
  },
  subTabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 6,
  },
  subTab: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  subTabActive: {
    backgroundColor: Colors.primaryAccent,
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  subTabTextActive: {
    color: '#fff',
  },
  oddRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  oddInputText: {
    fontWeight: '800',
    color: Colors.primaryAccent,
    fontSize: 14,
  },
  switchCol: {
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyNote: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  addedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 6,
  },
  addedIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  addedLeague: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  addedMatchTeams: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addedLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  addedOdd: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryAccent,
    marginRight: 4,
  },
  statBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dateAutoText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginVertical: 10,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
