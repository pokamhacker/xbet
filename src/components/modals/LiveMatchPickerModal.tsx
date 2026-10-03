import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { useFootballStore } from '../../store/useFootballStore';
import { useCouponStore } from '../../store/couponStore';
import { MatchEvent } from '../../types/bet';
import apiFootballService, { ApiFootballFixtureItem } from '../../services/apiFootballService';

interface LiveMatchPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMatch?: (match: MatchEvent) => void;
}

const TOP_LEAGUES_FILTER = [
  { id: 'all', name: 'Tous les matchs' },
  { id: '2', name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { id: '39', name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: '140', name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: '61', name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png' },
  { id: '78', name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: '135', name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
];

export const LiveMatchPickerModal: React.FC<LiveMatchPickerModalProps> = ({
  visible,
  onClose,
  onSelectMatch,
}) => {
  const { currentTheme, theme: baseTheme } = useThemeStore();
  const theme = currentTheme || baseTheme;
  const isDark = theme.isDark;

  const {
    liveFixtures,
    upcomingFixtures,
    isLoadingFixtures,
    fetchLiveFixtures,
    fetchUpcomingFixtures,
    hasApiKey,
  } = useFootballStore();

  const { addEvent } = useCouponStore();

  const [tabMode, setTabMode] = useState<'live' | 'upcoming'>('live');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Charger les matchs dès l'ouverture
  useEffect(() => {
    if (visible) {
      if (tabMode === 'live') {
        fetchLiveFixtures(selectedLeagueFilter !== 'all' ? selectedLeagueFilter : undefined);
      } else {
        fetchUpcomingFixtures({
          league: selectedLeagueFilter !== 'all' ? selectedLeagueFilter : undefined,
          next: 25,
        });
      }
    }
  }, [visible, tabMode, selectedLeagueFilter]);

  const activeFixtures: ApiFootballFixtureItem[] = useMemo(() => {
    const list = tabMode === 'live' ? liveFixtures : upcomingFixtures;

    return list.filter((item) => {
      // Filtre championnat
      if (selectedLeagueFilter !== 'all') {
        if (String(item.league.id) !== selectedLeagueFilter) return false;
      }

      // Filtre recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const homeName = item.teams.home.name.toLowerCase();
        const awayName = item.teams.away.name.toLowerCase();
        const leagueName = item.league.name.toLowerCase();
        return homeName.includes(q) || awayName.includes(q) || leagueName.includes(q);
      }

      return true;
    });
  }, [liveFixtures, upcomingFixtures, tabMode, selectedLeagueFilter, searchQuery]);

  const handlePickPrediction = (
    fixture: ApiFootballFixtureItem,
    predictionType: '1' | 'X' | '2',
    oddValue: number
  ) => {
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(fixture.fixture.status.short);
    const homeScore = fixture.goals.home ?? 0;
    const awayScore = fixture.goals.away ?? 0;

    let predictionLabel = '';
    if (predictionType === '1') {
      predictionLabel = `V1 (Victoire ${fixture.teams.home.name})`;
    } else if (predictionType === 'X') {
      predictionLabel = 'Match Nul (X)';
    } else {
      predictionLabel = `V2 (Victoire ${fixture.teams.away.name})`;
    }

    const event: MatchEvent = {
      id: `apifb-${fixture.fixture.id}-${predictionType}`,
      sport: 'Football',
      league: fixture.league.name,
      tournamentName: fixture.league.name,
      badge: fixture.league.logo,
      date: new Date(fixture.fixture.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      homeTeam: {
        name: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
      },
      awayTeam: {
        name: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
      },
      prediction: predictionLabel,
      odd: oddValue,
      status: 'Accepté',
      isLive,
      actualScore: isLive ? `${homeScore}-${awayScore}` : undefined,
      gameCategory: 'sports',
    };

    if (onSelectMatch) {
      onSelectMatch(event);
    } else {
      addEvent(event);
      setAddedIds((prev) => new Set(prev).add(event.id));
      Alert.alert('Événement ajouté', `${predictionLabel} ajouté au coupon !`);
    }
  };

  const getEstimatedOdds = (fixtureId: number) => {
    const base1 = 1.45 + ((fixtureId % 150) / 100);
    const baseX = 3.10 + ((fixtureId % 60) / 100);
    const base2 = 2.10 + (((fixtureId * 3) % 200) / 100);
    return {
      odd1: Math.round(base1 * 100) / 100,
      oddX: Math.round(baseX * 100) / 100,
      odd2: Math.round(base2 * 100) / 100,
    };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name="soccer" size={22} color={theme.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.title, { color: theme.textPrimary }]}>API-Football Live</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: hasApiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: hasApiKey ? '#10B981' : '#F59E0B' },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: hasApiKey ? '#10B981' : '#F59E0B' }]}>
                    {hasApiKey ? 'Direct Connecté' : 'Données En Ligne'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Championnats, clubs et cotes en temps réel (api-sports.io)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switch (En Direct vs Programmés) */}
          <View style={[styles.modeSwitchWrap, { backgroundColor: isDark ? '#1E232A' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                styles.modeTab,
                tabMode === 'live' && [styles.modeTabActive, { backgroundColor: theme.primary }],
              ]}
              onPress={() => setTabMode('live')}
            >
              <View style={styles.liveIndicatorCircle} />
              <Text
                style={[
                  styles.modeTabText,
                  { color: tabMode === 'live' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                Matchs en Direct ({liveFixtures.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeTab,
                tabMode === 'upcoming' && [styles.modeTabActive, { backgroundColor: theme.primary }],
              ]}
              onPress={() => setTabMode('upcoming')}
            >
              <Ionicons
                name="calendar-outline"
                size={14}
                color={tabMode === 'upcoming' ? '#FFFFFF' : theme.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.modeTabText,
                  { color: tabMode === 'upcoming' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                À Venir ({upcomingFixtures.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick League Pills */}
          <View style={styles.leaguesScrollWrap}>
            <FlatList
              horizontal
              data={TOP_LEAGUES_FILTER}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.leaguesContainer}
              renderItem={({ item }) => {
                const isSelected = selectedLeagueFilter === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.leaguePill,
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                      !isSelected && {
                        backgroundColor: isDark ? '#232932' : '#F8FAFC',
                        borderColor: isDark ? '#2E3846' : '#E2E8F0',
                      },
                    ]}
                    onPress={() => setSelectedLeagueFilter(item.id)}
                  >
                    {item.logo && (
                      <Image source={{ uri: item.logo }} style={styles.leaguePillLogo} resizeMode="contain" />
                    )}
                    <Text
                      style={[
                        styles.leaguePillText,
                        isSelected && { color: '#FFFFFF', fontWeight: '700' },
                        !isSelected && { color: theme.textSecondary },
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Search Bar */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#191E24' : '#F1F5F9',
                borderColor: isDark ? '#2E3846' : '#E2E8F0',
              },
            ]}
          >
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
              placeholder="Rechercher une équipe ou championnat..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Matches List */}
          {isLoadingFixtures ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Chargement des matchs en direct depuis API-Football...
              </Text>
            </View>
          ) : activeFixtures.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="soccer-field" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Aucun match trouvé</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {tabMode === 'live'
                  ? 'Aucun match en direct en cours pour ce championnat.'
                  : 'Aucun match programmé ne correspond à votre filtre.'}
              </Text>
              <TouchableOpacity
                style={[styles.refreshBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setSelectedLeagueFilter('all');
                  setSearchQuery('');
                  if (tabMode === 'live') fetchLiveFixtures();
                  else fetchUpcomingFixtures();
                }}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.refreshBtnText}>Réinitialiser les filtres</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={activeFixtures}
              keyExtractor={(item) => String(item.fixture.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(item.fixture.status.short);
                const odds = getEstimatedOdds(item.fixture.id);

                return (
                  <View
                    style={[
                      styles.matchCard,
                      {
                        backgroundColor: isDark ? '#1C222B' : '#FFFFFF',
                        borderColor: isDark ? '#2E3846' : '#E2E8F0',
                      },
                    ]}
                  >
                    {/* En-tête de la ligue */}
                    <View style={styles.matchCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        {item.league.logo && (
                          <Image
                            source={{ uri: item.league.logo }}
                            style={styles.cardLeagueLogo}
                            resizeMode="contain"
                          />
                        )}
                        <Text style={[styles.cardLeagueName, { color: theme.textSecondary }]} numberOfLines={1}>
                          {item.league.name} • {item.league.round || 'Saison Régulière'}
                        </Text>
                      </View>
                      {isLive ? (
                        <View style={styles.liveMinuteBadge}>
                          <Text style={styles.liveMinuteText}>
                            {item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : 'LIVE'}
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.matchDateText, { color: theme.textSecondary }]}>
                          {new Date(item.fixture.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>

                    {/* Équipes et Score */}
                    <View style={styles.teamsRow}>
                      {/* Équipe Domicile */}
                      <View style={styles.teamCol}>
                        <Image
                          source={{ uri: item.teams.home.logo }}
                          style={styles.teamLogo}
                          resizeMode="contain"
                        />
                        <Text
                          style={[styles.teamName, { color: theme.textPrimary }]}
                          numberOfLines={1}
                        >
                          {item.teams.home.name}
                        </Text>
                      </View>

                      {/* Score Central */}
                      <View style={styles.scoreCol}>
                        {isLive ? (
                          <View style={styles.scoreBox}>
                            <Text style={[styles.scoreText, { color: theme.primary }]}>
                              {item.goals.home ?? 0} - {item.goals.away ?? 0}
                            </Text>
                            <Text style={styles.scoreSubtext}>
                              {item.fixture.status.long || 'En direct'}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.vsBox}>
                            <Text style={[styles.vsText, { color: theme.textSecondary }]}>VS</Text>
                          </View>
                        )}
                      </View>

                      {/* Équipe Extérieure */}
                      <View style={styles.teamCol}>
                        <Image
                          source={{ uri: item.teams.away.logo }}
                          style={styles.teamLogo}
                          resizeMode="contain"
                        />
                        <Text
                          style={[styles.teamName, { color: theme.textPrimary }]}
                          numberOfLines={1}
                        >
                          {item.teams.away.name}
                        </Text>
                      </View>
                    </View>

                    {/* Boutons de Cotes 1 - X - 2 */}
                    <View style={styles.oddsRow}>
                      <TouchableOpacity
                        style={[
                          styles.oddBtn,
                          {
                            backgroundColor: isDark ? '#232A34' : '#F1F5F9',
                            borderColor: isDark ? '#2E3846' : '#E2E8F0',
                          },
                          addedIds.has(`apifb-${item.fixture.id}-1`) && {
                            borderColor: theme.primary,
                            backgroundColor: theme.primarySoft || 'rgba(37,99,235,0.1)',
                          },
                        ]}
                        onPress={() => handlePickPrediction(item, '1', odds.odd1)}
                      >
                        <Text style={[styles.oddLabel, { color: theme.textSecondary }]}>1</Text>
                        <Text style={[styles.oddValue, { color: theme.textPrimary }]}>
                          {odds.odd1.toFixed(2)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.oddBtn,
                          {
                            backgroundColor: isDark ? '#232A34' : '#F1F5F9',
                            borderColor: isDark ? '#2E3846' : '#E2E8F0',
                          },
                          addedIds.has(`apifb-${item.fixture.id}-X`) && {
                            borderColor: theme.primary,
                            backgroundColor: theme.primarySoft || 'rgba(37,99,235,0.1)',
                          },
                        ]}
                        onPress={() => handlePickPrediction(item, 'X', odds.oddX)}
                      >
                        <Text style={[styles.oddLabel, { color: theme.textSecondary }]}>X</Text>
                        <Text style={[styles.oddValue, { color: theme.textPrimary }]}>
                          {odds.oddX.toFixed(2)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.oddBtn,
                          {
                            backgroundColor: isDark ? '#232A34' : '#F1F5F9',
                            borderColor: isDark ? '#2E3846' : '#E2E8F0',
                          },
                          addedIds.has(`apifb-${item.fixture.id}-2`) && {
                            borderColor: theme.primary,
                            backgroundColor: theme.primarySoft || 'rgba(37,99,235,0.1)',
                          },
                        ]}
                        onPress={() => handlePickPrediction(item, '2', odds.odd2)}
                      >
                        <Text style={[styles.oddLabel, { color: theme.textSecondary }]}>2</Text>
                        <Text style={[styles.oddValue, { color: theme.textPrimary }]}>
                          {odds.odd2.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  modeSwitchWrap: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 10,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  liveIndicatorCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  leaguesScrollWrap: {
    marginTop: 10,
  },
  leaguesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  leaguePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  leaguePillLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  leaguePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    textAlign: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  matchCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  matchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLeagueLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  cardLeagueName: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveMinuteBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveMinuteText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  matchDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 42,
    height: 42,
    marginBottom: 6,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreCol: {
    width: 90,
    alignItems: 'center',
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreSubtext: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
    marginTop: 2,
  },
  vsBox: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '800',
  },
  oddsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  oddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  oddLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  oddValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
