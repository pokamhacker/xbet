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
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { generateCouponId, generateShareCode } from '../utils/pokerEngine';
import { BetSlip, MatchEvent } from '../types/bet';
import { SportsPickerModal } from '../components/SportsPickerModal';
import { SPORTS_CATALOG, resolveTeamLogo, resolveCompetitionLogo } from '../data/sportsCatalog';
import { TeamLogo } from '../components/common/TeamLogo';
import { fetchTeamsByLeague } from '../services/sportsApi';
import { LiveMatchPickerModal } from '../components/modals/LiveMatchPickerModal';
import { FIFA_LEAGUES_LIST, getFifaLeagueLogo } from '../constants/fifaLeagues';
import { formatBetDate } from '../utils/dateFormatter';

export default function StudioCreationScreen({ navigation }: any) {
  const { customLeagues, addCoupon } = useBetStore();

  // 1. Identité
  const [customId, setCustomId] = useState('');
  const [hasCustomBadge, setHasCustomBadge] = useState(false);
  const [isLiveBadge, setIsLiveBadge] = useState(true);

  // Heure & Date du match (HH:mm)
  const getCurrentTimeFormatted = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getCurrentDateFormatted = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [matchTime, setMatchTime] = useState(getCurrentTimeFormatted());
  const [matchDate, setMatchDate] = useState(getCurrentDateFormatted());

  // 2. Filtres & Marchés
  const [sourceType, setSourceType] = useState<'Tout' | 'FIFA' | 'Original'>('FIFA');
  const [champType, setChampType] = useState<'Base' | 'Custo'>('Base');

  // Sélection Visuelle Championnat & Équipes
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedLeagueLogo, setSelectedLeagueLogo] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');

  const [homeTeam, setHomeTeam] = useState('');
  const [homeTeamLogo, setHomeTeamLogo] = useState('');

  const [awayTeam, setAwayTeam] = useState('');
  const [awayTeamLogo, setAwayTeamLogo] = useState('');

  const [isManualEntry, setIsManualEntry] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [liveModalVisible, setLiveModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'competition' | 'team'>('competition');
  const [pickingTarget, setPickingTarget] = useState<'home' | 'away'>('home');

  const [marketType, setMarketType] = useState<'Base' | 'Custo'>('Base');
  const [selectedCategory, setSelectedCategory] = useState('Résultat');
  const [selectedOptionLabel, setSelectedOptionLabel] = useState('');
  const [odd, setOdd] = useState('');
  const [finalScoreSwitch, setFinalScoreSwitch] = useState(false);

  // 3. Événements ajoutés (vide par défaut)
  const [addedEvents, setAddedEvents] = useState<MatchEvent[]>([]);

  // 4. Mise & Résumé
  const [stake, setStake] = useState('1000');
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
    const isFifa =
      sourceType === 'FIFA' ||
      selectedLeague.toUpperCase().includes('FIFA') ||
      selectedLeague.toUpperCase().includes('FC ') ||
      selectedLeagueId.toLowerCase().includes('fifa') ||
      selectedLeagueId.toLowerCase().includes('fc2');
    const finalTime = matchTime.trim() || getCurrentTimeFormatted();
    const finalDate = matchDate.trim() || getCurrentDateFormatted();
    const eventTimestamp = formatBetDate(`${finalDate} (${finalTime})`);

    const newEv: MatchEvent = {
      id: String(Date.now()),
      sport: isFifa ? 'FIFA' : 'Football',
      league: selectedLeague,
      date: eventTimestamp,
      homeTeam: { name: homeTeam, logo: homeTeamLogo },
      awayTeam: { name: awayTeam, logo: awayTeamLogo },
      prediction: selectedOptionLabel,
      odd: numericOdd,
      actualScore: isLiveBadge ? '1-1' : undefined,
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
    const finalTime = matchTime.trim() || getCurrentTimeFormatted();
    const finalDate = matchDate.trim() || getCurrentDateFormatted();
    const hasLive = isLiveBadge || addedEvents.some((e) => e.isLive);

    const newCoupon: BetSlip = {
      id: finalId,
      createdAt: formatBetDate(`${finalDate} (${finalTime})`),
      type: addedEvents.length > 1 ? 'Combiné' : 'Simple',
      eventsCount: addedEvents.length,
      completedCount: 0,
      totalOdds: Math.round(totalOdds * 100) / 100,
      stake: numericStake,
      potentialPayout: potentialPayout,
      status: 'Accepté',
      isLive: hasLive,
      events: addedEvents.map((ev) => ({
        ...ev,
        status: 'Accepté' as const,
        isLive: isLiveBadge ? true : ev.isLive,
      })),
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
      )} ₣\n\nLe coupon a été ajouté avec succès à votre Historique !`,
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={Platform.OS === 'android'} />
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

          {/* Sélection de l'Heure et Date du match */}
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
            <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Horodatage du match</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helperText, { marginTop: 0, marginBottom: 4 }]}>Heure (HH:mm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 15:45"
                  value={matchTime}
                  onChangeText={setMatchTime}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helperText, { marginTop: 0, marginBottom: 4 }]}>Date (JJ.MM.AAAA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 02.10.2026"
                  value={matchDate}
                  onChangeText={setMatchDate}
                />
              </View>
            </View>
            <Text style={styles.helperText}>
              Pré-rempli avec l'heure actuelle. Affiché sur le ticket : {matchDate || getCurrentDateFormatted()} ({matchTime || getCurrentTimeFormatted()}).
            </Text>
          </View>
        </View>

        {/* Section 2 : ÉVÉNEMENT */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>ÉVÉNEMENT</Text>

          {/* Bouton d'importation directe API-Football */}
          <TouchableOpacity
            style={styles.apiFootballCardBtn}
            activeOpacity={0.8}
            onPress={() => setLiveModalVisible(true)}
          >
            <View style={styles.apiFootballIconWrap}>
              <MaterialCommunityIcons name="soccer" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.apiFootballCardTitle}>API-Football Direct & Cotes</Text>
                <View style={styles.apiFootballLiveTag}>
                  <Text style={styles.apiFootballLiveTagText}>TEMPS RÉEL</Text>
                </View>
              </View>
              <Text style={styles.apiFootballCardSubtitle}>
                Importer un match en direct avec logos officiels et cotes en 1 clic
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>

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

          {/* Sélecteur Cliquable pour Nom du Championnat */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Nom du championnat</Text>
          {isManualEntry ? (
            <TextInput
              style={styles.input}
              value={selectedLeague}
              onChangeText={setSelectedLeague}
              placeholder="Ex: UEFA Champions League"
            />
          ) : (
            <TouchableOpacity
              style={styles.clickableSelector}
              activeOpacity={0.8}
              onPress={() => {
                setPickerMode('competition');
                setPickerModalVisible(true);
              }}
            >
              {selectedLeagueLogo ? (
                <Image source={{ uri: selectedLeagueLogo }} style={styles.selectorMiniLogo} resizeMode="contain" />
              ) : (
                <View style={styles.selectorPlaceholderIcon}>
                  <Ionicons name="trophy-outline" size={16} color={Colors.primaryAccent} />
                </View>
              )}
              <Text
                style={[
                  styles.selectorText,
                  !selectedLeague && styles.selectorPlaceholderText,
                ]}
                numberOfLines={1}
              >
                {selectedLeague || 'Sélectionner un championnat...'}
              </Text>
              {selectedLeague ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedLeague('');
                    setSelectedLeagueLogo('');
                    setSelectedLeagueId('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-down" size={18} color="#94A3B8" />
              )}
            </TouchableOpacity>
          )}

          {/* Championnats FIFA rapides si Source === 'FIFA' */}
          {sourceType === 'FIFA' && (
            <View style={{ marginTop: 8 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {FIFA_LEAGUES_LIST.map((fl) => {
                  const isSelected = selectedLeague === fl.name || selectedLeagueId === fl.id;
                  const logo = getFifaLeagueLogo(fl.flagType);
                  return (
                    <TouchableOpacity
                      key={fl.id}
                      style={[
                        styles.fifaQuickChip,
                        isSelected && styles.fifaQuickChipActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedLeague(fl.name);
                        setSelectedLeagueId(fl.id);
                        setSelectedLeagueLogo(logo);
                        fetchTeamsByLeague(fl.name);
                      }}
                    >
                      <Image source={{ uri: logo }} style={styles.fifaChipLogo} resizeMode="contain" />
                      <Text
                        style={[
                          styles.fifaChipText,
                          isSelected && styles.fifaChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {fl.name}
                      </Text>
                      {fl.isNew && (
                        <View style={styles.chipNewBadge}>
                          <Text style={styles.chipNewText}>NEW</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Configuration des Équipes (Domicile VS Extérieur) */}
          <View style={styles.teamsInputBlock}>
            <View style={styles.teamsHeaderRow}>
              <Text style={styles.fieldLabel}>Équipes (Domicile VS Extérieur)</Text>
              <TouchableOpacity
                onPress={() => setIsManualEntry(!isManualEntry)}
                style={styles.toggleManualBtn}
              >
                <Text style={styles.toggleManualText}>
                  {isManualEntry ? '📋 Choisir du catalogue' : '✍️ Saisie manuelle'}
                </Text>
              </TouchableOpacity>
            </View>

            {isManualEntry ? (
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
            ) : (
              <View style={styles.teamsRowPickers}>
                {/* Sélecteur Domicile */}
                <TouchableOpacity
                  style={[styles.teamPickerCard, styles.teamPickerCardHome]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setPickerMode('team');
                    setPickingTarget('home');
                    setPickerModalVisible(true);
                  }}
                >
                  <View style={styles.teamLogoThumbWrap}>
                    {homeTeam ? (
                      <TeamLogo teamName={homeTeam} logoUrl={homeTeamLogo} size={30} />
                    ) : (
                      <Ionicons name="shield-outline" size={18} color={Colors.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamRoleLabel}>Domicile</Text>
                    <Text style={styles.teamSelectedName} numberOfLines={1}>
                      {homeTeam || 'Choisir...'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={14} color="#94A3B8" />
                </TouchableOpacity>

                {/* Badge Central VS */}
                <View style={styles.vsCenterBadge}>
                  <Text style={styles.vsCenterText}>VS</Text>
                </View>

                {/* Sélecteur Extérieur */}
                <TouchableOpacity
                  style={[styles.teamPickerCard, styles.teamPickerCardAway]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setPickerMode('team');
                    setPickingTarget('away');
                    setPickerModalVisible(true);
                  }}
                >
                  <View style={styles.teamLogoThumbWrap}>
                    {awayTeam ? (
                      <TeamLogo teamName={awayTeam} logoUrl={awayTeamLogo} size={30} />
                    ) : (
                      <Ionicons name="shield-outline" size={18} color="#EA580C" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamRoleLabel}>Extérieur</Text>
                    <Text style={styles.teamSelectedName} numberOfLines={1}>
                      {awayTeam || 'Choisir...'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}
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
          <Text style={styles.fieldLabel}>Mise virtuelle (₣)</Text>
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
              <Text style={styles.helperText}>Affiche un bouton « Vendre pour X ₣ » sur le détail du pari.</Text>
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
                {addedEvents.length > 0 ? `${potentialPayout.toLocaleString('fr-FR')} ₣` : '-'}
              </Text>
            </View>
          </View>

          <Text style={styles.dateAutoText}>Date du pari : Auto (maintenant)</Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCoupon}>
            <Text style={styles.saveBtnText}>Sauvegarder le coupon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sélecteur Visuel Modal pour Championnats et Équipes */}
      <SportsPickerModal
        visible={pickerModalVisible}
        mode={pickerMode}
        initialCategoryTab={sourceType === 'FIFA' ? 'FIFA' : undefined}
        filterCompetitionId={pickerMode === 'team' ? selectedLeagueId : undefined}
        selectedId={
          pickerMode === 'competition'
            ? selectedLeagueId || selectedLeague
            : pickingTarget === 'home'
              ? homeTeam
              : awayTeam
        }
        onSelectCompetition={(comp) => {
          setSelectedLeague(comp.name);
          const logo = (comp as any).badge || comp.logo || resolveCompetitionLogo(comp.name) || '';
          setSelectedLeagueLogo(logo);
          setSelectedLeagueId(comp.id);
          // Déclenche l'appel API REST TheSportsDB pour mettre à jour les équipes en temps réel
          fetchTeamsByLeague(comp.name);
        }}
        onSelectTeam={(team, comp) => {
          const teamLogo = (team as any).badge || team.logo || resolveTeamLogo(team.name) || '';
          if (pickingTarget === 'home') {
            setHomeTeam(team.name);
            setHomeTeamLogo(teamLogo);
          } else {
            setAwayTeam(team.name);
            setAwayTeamLogo(teamLogo);
          }

          // Auto-complétion de la compétition si non définie ou liée
          if (comp) {
            setSelectedLeague(comp.name);
            const compLogo = (comp as any).badge || comp.logo || resolveCompetitionLogo(comp.name) || '';
            setSelectedLeagueLogo(compLogo);
            setSelectedLeagueId(comp.id);
          }
        }}
        onClose={() => setPickerModalVisible(false)}
      />

      {/* Modale des matchs en direct API-Football */}
      <LiveMatchPickerModal
        visible={liveModalVisible}
        onClose={() => setLiveModalVisible(false)}
        onSelectMatch={(match) => {
          setSelectedLeague(match.league);
          if (match.badge) setSelectedLeagueLogo(match.badge);
          setHomeTeam(match.homeTeam.name);
          if (match.homeTeam.logo) setHomeTeamLogo(match.homeTeam.logo);
          setAwayTeam(match.awayTeam.name);
          if (match.awayTeam.logo) setAwayTeamLogo(match.awayTeam.logo);
          setOdd(match.odd.toString());
          setSelectedOptionLabel(match.prediction);
          setIsLiveBadge(Boolean(match.isLive));
          setAddedEvents((prev) => [...prev, match]);
          setLiveModalVisible(false);
          Alert.alert(
            'Match Importé !',
            `${match.homeTeam.name} vs ${match.awayTeam.name} a été ajouté au coupon.`
          );
        }}
      />
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollArea: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 110,
  },
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  apiFootballCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  apiFootballIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  apiFootballCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  apiFootballLiveTag: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  apiFootballLiveTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  apiFootballCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  // Nouveaux Styles Sélecteurs Visuels
  clickableSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    gap: 10,
  },
  selectorMiniLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  selectorPlaceholderIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectorPlaceholderText: {
    color: Colors.textMuted,
    fontWeight: '500',
  },
  teamsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  toggleManualBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  toggleManualText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryAccent,
  },
  teamsRowPickers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamPickerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  teamPickerCardHome: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
  },
  teamPickerCardAway: {
    borderColor: '#FED7AA',
    backgroundColor: '#F8FAFC',
  },
  teamLogoThumbWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamThumbImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  teamRoleLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  teamSelectedName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vsCenterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCenterText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  fifaQuickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  fifaQuickChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primaryAccent,
  },
  fifaChipLogo: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  fifaChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  fifaChipTextActive: {
    color: Colors.primaryAccent,
    fontWeight: '700',
  },
  chipNewBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  chipNewText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
});

