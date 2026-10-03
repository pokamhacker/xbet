import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Colors } from '../theme/theme';
import { SPORTS_CATALOG, Competition, Team } from '../data/sportsCatalog';
import { TeamLogo } from './common/TeamLogo';
import {
  fetchAllLeagues,
  fetchTeamsByLeague,
  SportsLeague,
  SportsTeam,
} from '../services/sportsApi';
import apiFootballService, {
  ApiFootballLeagueItem,
  ApiFootballTeamItem,
} from '../services/apiFootballService';

export type PickerCategoryTab =
  | 'Tous'
  | 'Afrique'
  | 'Europe'
  | 'Amérique'
  | 'Asie'
  | 'Football Réel'
  | 'FIFA'
  | 'Sélections'
  | 'Exotiques'
  | 'Fictifs / Cyber';

export interface SportsPickerModalProps {
  visible: boolean;
  mode: 'competition' | 'team';
  title?: string;
  filterCompetitionId?: string;
  selectedId?: string;
  initialCategoryTab?: PickerCategoryTab;
  onSelectCompetition?: (competition: Competition | SportsLeague) => void;
  onSelectTeam?: (team: Team | SportsTeam, competition?: Competition | SportsLeague) => void;
  onClose: () => void;
}

export const SportsPickerModal: React.FC<SportsPickerModalProps> = ({
  visible,
  mode,
  title,
  filterCompetitionId,
  selectedId,
  initialCategoryTab,
  onSelectCompetition,
  onSelectTeam,
  onClose,
}) => {
  const { theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<PickerCategoryTab>('Tous');
  const [useLeagueConstraint, setUseLeagueConstraint] = useState<boolean>(!!filterCompetitionId);

  // États dynamiques pour l'API REST TheSportsDB
  const [apiLeagues, setApiLeagues] = useState<SportsLeague[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState<boolean>(false);
  const [dynamicTeams, setDynamicTeams] = useState<SportsTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState<boolean>(false);

  // Helper continent pour les catégories
  const getContinentForCountry = (country?: string): 'Europe' | 'Afrique' | 'Amerique' | 'Asie' | 'International' => {
    if (!country) return 'International';
    const c = country.toLowerCase();
    const europe = ['england', 'angleterre', 'spain', 'espagne', 'france', 'germany', 'allemagne', 'italy', 'italie', 'portugal', 'netherlands', 'pays-bas', 'belgium', 'belgique', 'turkey', 'turquie', 'scotland', 'ecosse'];
    if (europe.some((e) => c.includes(e))) return 'Europe';
    const afrique = ['cameroun', 'cameroon', 'nigeria', 'egypt', 'egypte', 'morocco', 'maroc', 'senegal', 'algeria', 'algerie', 'tunisia', 'tunisie', 'ivory coast', "cote d'ivoire", 'ghana'];
    if (afrique.some((a) => c.includes(a))) return 'Afrique';
    const amerique = ['usa', 'united states', 'etats-unis', 'brazil', 'bresil', 'argentina', 'argentine', 'mexico', 'mexique', 'colombia', 'colombie', 'chile', 'chili'];
    if (amerique.some((am) => c.includes(am))) return 'Amerique';
    const asie = ['saudi arabia', 'arabie saoudite', 'japan', 'japon', 'south korea', 'coree du sud', 'china', 'chine', 'qatar', 'uae'];
    if (asie.some((as) => c.includes(as))) return 'Asie';
    return 'International';
  };

  // Charger les championnats dynamiquement dès l'ouverture (API-Football en priorité)
  useEffect(() => {
    if (visible && mode === 'competition') {
      if (apiLeagues.length === 0) {
        setLoadingLeagues(true);
        apiFootballService
          .getLeagues()
          .then((fbLeagues) => {
            if (fbLeagues && fbLeagues.length > 0) {
              const mapped: SportsLeague[] = fbLeagues.map((item) => ({
                id: String(item.league.id),
                name: item.league.name,
                sport: 'Football',
                country: item.country.name,
                continent: getContinentForCountry(item.country.name),
                badge: item.league.logo,
                logo: item.league.logo,
                teams: [],
                category: 'major',
              }));
              setApiLeagues(mapped);
            } else {
              return fetchAllLeagues().then((leagues) => setApiLeagues(leagues));
            }
          })
          .catch(() => {
            fetchAllLeagues()
              .then((leagues) => setApiLeagues(leagues))
              .catch(() => {});
          })
          .finally(() => {
            setLoadingLeagues(false);
          });
      }
    }
  }, [visible, mode, apiLeagues.length]);

  // Synchronise league constraint & charge les équipes dynamiquement de la ligue sélectionnée
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setUseLeagueConstraint(!!filterCompetitionId);
      setActiveTab(initialCategoryTab || 'Tous');

      if (mode === 'team') {
        const targetLeague =
          filterCompetitionId ||
          (selectedId && !selectedId.startsWith('team-') ? selectedId : undefined);

        // Trouver la ligue correspondante (nom ou ID)
        let leagueName = targetLeague;
        let leagueNumericId: number | undefined;

        if (targetLeague) {
          const matchedCatalog = SPORTS_CATALOG.find((c) => c.id === targetLeague || c.name === targetLeague);
          const matchedApi = apiLeagues.find((l) => l.id === targetLeague || l.name === targetLeague);

          if (matchedCatalog) {
            leagueName = matchedCatalog.name;
          } else if (matchedApi) {
            leagueName = matchedApi.name;
          }

          // Extraire l'ID numérique pour API-Football
          if (!isNaN(Number(targetLeague))) {
            leagueNumericId = Number(targetLeague);
          } else if (matchedApi && !isNaN(Number(matchedApi.id))) {
            leagueNumericId = Number(matchedApi.id);
          }
        }

        if (targetLeague) {
          setLoadingTeams(true);

          // 1. Tenter via API-Football
          const promise = leagueNumericId
            ? apiFootballService.getTeams(leagueNumericId)
            : apiFootballService.getTeams(targetLeague);

          promise
            .then((fbTeams) => {
              if (fbTeams && fbTeams.length > 0) {
                const mapped: SportsTeam[] = fbTeams.map((item) => ({
                  id: `team-${item.team.id}`,
                  name: item.team.name,
                  shortName: item.team.code || undefined,
                  badge: item.team.logo,
                  logo: item.team.logo,
                  country: item.team.country,
                  leagueId: String(leagueNumericId || targetLeague),
                  leagueName: leagueName,
                }));
                setDynamicTeams(mapped);
              } else if (leagueName) {
                return fetchTeamsByLeague(leagueName).then((teams) => setDynamicTeams(teams));
              }
            })
            .catch(() => {
              if (leagueName) {
                fetchTeamsByLeague(leagueName)
                  .then((teams) => setDynamicTeams(teams))
                  .catch(() => {});
              }
            })
            .finally(() => {
              setLoadingTeams(false);
            });
        }
      }
    }
  }, [visible, filterCompetitionId, mode, selectedId, apiLeagues]);

  // Catégories disponibles
  const tabs: PickerCategoryTab[] = [
    'Tous',
    'Afrique',
    'Europe',
    'Amérique',
    'Asie',
    'Football Réel',
    'FIFA',
    'Sélections',
    'Exotiques',
    'Fictifs / Cyber',
  ];

  // Trouver la compétition filtrée active
  const constrainedCompetition = useMemo(() => {
    if (!filterCompetitionId) return undefined;
    return (
      SPORTS_CATALOG.find((c) => c.id === filterCompetitionId || c.name === filterCompetitionId) ||
      apiLeagues.find((l) => l.id === filterCompetitionId || l.name === filterCompetitionId)
    );
  }, [filterCompetitionId, apiLeagues]);

  // Fusionner les ligues de l'API avec le catalogue local pour une couverture exhaustive
  const combinedCompetitions = useMemo(() => {
    const list: Array<Competition | SportsLeague> = [];
    const seenNames = new Set<string>();

    // 1. Ajouter les ligues de l'API TheSportsDB
    for (const al of apiLeagues) {
      seenNames.add(al.name.toLowerCase());
      list.push(al);
    }

    // 2. Compléter avec les ligues locales (FIFA, Cyber, etc.) si non présentes
    for (const sc of SPORTS_CATALOG) {
      if (!seenNames.has(sc.name.toLowerCase())) {
        list.push(sc);
      }
    }

    return list.length > 0 ? list : SPORTS_CATALOG;
  }, [apiLeagues]);

  // Liste des Compétitions filtrées
  const filteredCompetitions = useMemo(() => {
    if (mode !== 'competition') return [];
    let list = combinedCompetitions;

    // Filtre par Onglet de Catégorie
    if (activeTab === 'Afrique') {
      list = list.filter((c) => c.continent === 'Afrique' || c.country === 'Cameroun' || c.country === 'Nigeria' || c.country === 'Egypte' || c.country === 'Afrique du Sud' || c.country === 'Maroc' || c.country === 'Tunisie' || c.country === 'Algerie' || c.country === "Cote d'Ivoire" || c.country === 'Senegal' || c.country === 'Ghana' || c.country === 'RD Congo' || c.country === 'Mali' || c.country === 'Guinee' || c.country === 'Kenya' || c.country === 'Tanzanie');
    } else if (activeTab === 'Europe') {
      list = list.filter((c) => c.continent === 'Europe' || c.country === 'Angleterre' || c.country === 'Espagne' || c.country === 'Italie' || c.country === 'Allemagne' || c.country === 'France' || c.country === 'Portugal' || c.country === 'Pays-Bas' || c.country === 'Turquie' || c.country === 'Belgique' || c.country === 'Ecosse' || c.country === 'Grece' || c.country === 'Autriche' || c.country === 'Suisse' || c.country === 'Danemark' || c.country === 'Suede');
    } else if (activeTab === 'Amérique') {
      list = list.filter((c) => c.continent === 'Amerique' || c.country === 'Etats-Unis' || c.country === 'Bresil' || c.country === 'Argentine' || c.country === 'Mexique' || c.country === 'Colombie' || c.country === 'Chili' || c.country === 'Uruguay' || c.country === 'Equateur' || c.country === 'Perou' || c.country === 'Paraguay' || c.country === 'Canada' || c.country === 'Costa Rica' || c.country === 'Bolivie' || c.country === 'Venezuela');
    } else if (activeTab === 'Asie') {
      list = list.filter((c) => c.continent === 'Asie' || c.country === 'Arabie Saoudite' || c.country === 'Japon' || c.country === 'Coree du Sud' || c.country === 'Australie' || c.country === 'Emirats Arabes Unis' || c.country === 'Qatar' || c.country === 'Chine' || c.country === 'Inde' || c.country === 'Iran' || c.country === 'Thailande' || c.country === 'Indonesie' || c.country === 'Ouzbekistan' || c.country === 'Malaisie' || c.country === 'Vietnam' || c.country === 'Nouvelle-Zelande');
    } else if (activeTab === 'FIFA') {
      list = list.filter((c) => c.category === 'fifa' || c.name.startsWith('FIFA') || c.name.startsWith('FC '));
    } else if (activeTab === 'Football Réel') {
      list = list.filter((c) => c.category === 'major' || c.category === 'lower' || c.category === 'exotic');
    } else if (activeTab === 'Sélections') {
      list = list.filter((c) => c.category === 'national');
    } else if (activeTab === 'Exotiques') {
      list = list.filter((c) => c.category === 'exotic');
    } else if (activeTab === 'Fictifs / Cyber') {
      list = list.filter((c) => c.category === 'cybersport');
    }

    // Filtre par Requête texte
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.country && c.country.toLowerCase().includes(q)) ||
          (c.teams && c.teams.some((t) => t.name.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [mode, activeTab, searchQuery, combinedCompetitions]);

  // Liste des Équipes filtrées (combinant API dynamique et catalogue)
  const filteredTeams = useMemo(() => {
    if (mode !== 'team') return [];

    // Rassemblement des équipes dynamiques de l'API + locales
    let allTeamEntries: { team: Team | SportsTeam; comp: Competition | SportsLeague }[] = [];

    // 1. Si on a des équipes dynamiques de l'API pour la ligue choisie
    if (dynamicTeams.length > 0) {
      const parentComp: SportsLeague = (constrainedCompetition as SportsLeague) || {
        id: filterCompetitionId || 'api-league',
        name: filterCompetitionId || 'Championnat',
        sport: 'Football',
        badge: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png',
        logo: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png',
        teams: [],
      };
      for (const t of dynamicTeams) {
        allTeamEntries.push({ team: t, comp: parentComp });
      }
    }

    // 2. Ajouter les équipes du catalogue local (pour garantir fallback immédiat)
    for (const comp of SPORTS_CATALOG) {
      for (const team of comp.teams) {
        // Éviter les doublons exacts de nom
        if (!allTeamEntries.some((e) => e.team.name.toLowerCase() === team.name.toLowerCase())) {
          allTeamEntries.push({ team, comp });
        }
      }
    }

    // Restriction optionnelle à la ligue choisie
    if (useLeagueConstraint && filterCompetitionId) {
      allTeamEntries = allTeamEntries.filter(
        (e) =>
          e.comp.id === filterCompetitionId ||
          e.comp.name.toLowerCase() === filterCompetitionId.toLowerCase()
      );
    }

    // Filtre par Onglet de Catégorie
    if (activeTab === 'Afrique') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.continent === 'Afrique' || e.comp.country === 'Cameroun' || e.comp.country === 'Nigeria' || e.comp.country === 'Egypte' || e.comp.country === 'Afrique du Sud' || e.comp.country === 'Maroc' || e.comp.country === 'Tunisie' || e.comp.country === 'Algerie' || e.comp.country === "Cote d'Ivoire" || e.comp.country === 'Senegal' || e.comp.country === 'Ghana' || e.comp.country === 'RD Congo' || e.comp.country === 'Mali' || e.comp.country === 'Guinee' || e.comp.country === 'Kenya' || e.comp.country === 'Tanzanie');
    } else if (activeTab === 'Europe') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.continent === 'Europe' || e.comp.country === 'Angleterre' || e.comp.country === 'Espagne' || e.comp.country === 'Italie' || e.comp.country === 'Allemagne' || e.comp.country === 'France' || e.comp.country === 'Portugal' || e.comp.country === 'Pays-Bas' || e.comp.country === 'Turquie' || e.comp.country === 'Belgique' || e.comp.country === 'Ecosse' || e.comp.country === 'Grece' || e.comp.country === 'Autriche' || e.comp.country === 'Suisse' || e.comp.country === 'Danemark' || e.comp.country === 'Suede');
    } else if (activeTab === 'Amérique') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.continent === 'Amerique' || e.comp.country === 'Etats-Unis' || e.comp.country === 'Bresil' || e.comp.country === 'Argentine' || e.comp.country === 'Mexique' || e.comp.country === 'Colombie' || e.comp.country === 'Chili' || e.comp.country === 'Uruguay' || e.comp.country === 'Equateur' || e.comp.country === 'Perou' || e.comp.country === 'Paraguay' || e.comp.country === 'Canada' || e.comp.country === 'Costa Rica' || e.comp.country === 'Bolivie' || e.comp.country === 'Venezuela');
    } else if (activeTab === 'Asie') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.continent === 'Asie' || e.comp.country === 'Arabie Saoudite' || e.comp.country === 'Japon' || e.comp.country === 'Coree du Sud' || e.comp.country === 'Australie' || e.comp.country === 'Emirats Arabes Unis' || e.comp.country === 'Qatar' || e.comp.country === 'Chine' || e.comp.country === 'Inde' || e.comp.country === 'Iran' || e.comp.country === 'Thailande' || e.comp.country === 'Indonesie' || e.comp.country === 'Ouzbekistan' || e.comp.country === 'Malaisie' || e.comp.country === 'Vietnam' || e.comp.country === 'Nouvelle-Zelande');
    } else if (activeTab === 'FIFA') {
      allTeamEntries = allTeamEntries.filter(
        (e) => e.comp.category === 'fifa' || e.comp.name.startsWith('FIFA') || e.comp.name.startsWith('FC ')
      );
    } else if (activeTab === 'Football Réel') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.category === 'major' || e.comp.category === 'lower' || e.comp.category === 'exotic');
    } else if (activeTab === 'Sélections') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.category === 'national');
    } else if (activeTab === 'Exotiques') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.category === 'exotic');
    } else if (activeTab === 'Fictifs / Cyber') {
      allTeamEntries = allTeamEntries.filter((e) => e.comp.category === 'cybersport');
    }

    // Filtre par Requête texte
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      allTeamEntries = allTeamEntries.filter(
        (e) =>
          e.team.name.toLowerCase().includes(q) ||
          (e.team.shortName && e.team.shortName.toLowerCase().includes(q)) ||
          (e.team.country && e.team.country.toLowerCase().includes(q)) ||
          e.comp.name.toLowerCase().includes(q)
      );
    }

    return allTeamEntries;
  }, [mode, activeTab, searchQuery, useLeagueConstraint, filterCompetitionId, dynamicTeams, constrainedCompetition]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.cardBackground,
            },
          ]}
        >
          {/* Header avec Poignée & Titre */}
          <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                {title || (mode === 'competition' ? 'Sélectionner un championnat' : 'Choisir une équipe')}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                {mode === 'competition'
                  ? `${filteredCompetitions.length} compétitions disponibles`
                  : `${filteredTeams.length} équipes référencées`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Restricteur de Ligue si actif */}
          {mode === 'team' && constrainedCompetition && (
            <View
              style={[
                styles.leagueConstraintBar,
                { backgroundColor: theme.primarySoft || (theme.isDark ? '#2A2E39' : '#EFF6FF') },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                <Ionicons name="filter" size={15} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.constraintText, { color: theme.primary }]} numberOfLines={1}>
                  {useLeagueConstraint
                    ? `Filtré sur : ${constrainedCompetition.name}`
                    : 'Toutes les ligues affichées'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setUseLeagueConstraint(!useLeagueConstraint)}
                style={[
                  styles.toggleConstraintBtn,
                  { borderColor: theme.primary },
                ]}
              >
                <Text style={[styles.toggleConstraintText, { color: theme.primary }]}>
                  {useLeagueConstraint ? 'Tout afficher' : 'Restreindre'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Barre de Recherche Instantanée */}
          <View
            style={[
              styles.searchBarWrap,
              {
                backgroundColor: theme.isDark ? '#181A20' : '#F1F5F9',
                borderColor: theme.isDark ? '#2A2E39' : '#E2E8F0',
              },
            ]}
          >
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={[
                styles.searchInput,
                { color: theme.isDark ? '#FFFFFF' : '#0F172A' },
              ]}
              placeholder={mode === 'competition' ? 'Rechercher un championnat, pays...' : 'Rechercher une équipe, sigle (ex: RMA)...'}
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Onglets de Catégories Rapides */}
          <View style={styles.tabsScrollWrap}>
            <FlatList
              horizontal
              data={tabs}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContainer}
              renderItem={({ item }) => {
                const isActive = activeTab === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.tabBadge,
                      isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                      !isActive && {
                        backgroundColor: theme.isDark ? '#2A2E39' : '#F8FAFC',
                        borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}
                    onPress={() => setActiveTab(item)}
                  >
                    {item === 'FIFA' && (
                      <Ionicons
                        name="game-controller"
                        size={13}
                        color={isActive ? (theme.colors?.primaryText || '#FFFFFF') : theme.primary}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.tabBadgeText,
                        isActive && { color: theme.colors?.primaryText || '#FFFFFF', fontWeight: '800' },
                        !isActive && { color: theme.isDark ? '#CBD5E1' : '#475569' },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Liste des Résultats */}
          {mode === 'competition' ? (
            loadingLeagues ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.isDark ? '#CBD5E1' : '#64748B' }]}>
                  Chargement des championnats mondiaux...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredCompetitions}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isSelected = selectedId === item.id || selectedId === item.name;
                  const isFifaComp = item.category === 'fifa' || item.name.startsWith('FIFA') || item.name.startsWith('FC ');
                  const badgeUri = (item as any).badge || item.logo;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.listItemCard,
                        {
                          backgroundColor: isSelected
                            ? theme.isDark
                              ? '#2A2E39'
                              : '#EFF6FF'
                            : theme.isDark
                            ? '#181A20'
                            : '#FFFFFF',
                          borderColor: isSelected ? theme.primary : theme.isDark ? '#2A2E39' : '#E2E8F0',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (onSelectCompetition) onSelectCompetition(item);
                        // Précharger les clubs en arrière-plan
                        fetchTeamsByLeague(item.name);
                        onClose();
                      }}
                    >
                      <View style={styles.itemLogoWrap}>
                        <Image
                          source={{ uri: badgeUri }}
                          style={styles.compLogoImage}
                          resizeMode="contain"
                        />
                        {isFifaComp && (
                          <View style={styles.fifaMiniBadge}>
                            <Ionicons name="game-controller" size={10} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <View style={styles.itemInfoWrap}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            style={[
                              styles.itemTitle,
                              { color: theme.isDark ? '#F8FAFC' : '#0F172A', flex: 1 },
                            ]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          {(item as any).isNew && (
                            <View style={styles.newTagBadge}>
                              <Text style={styles.newTagText}>NOUVEAU</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.itemMetaRow}>
                          {item.country && (
                            <Text style={styles.metaCountryText}>🌍 {item.country}</Text>
                          )}
                          <Text style={styles.metaCountText}>
                            · {(item as any).matchesCount ? `${(item as any).matchesCount} matchs` : `${item.teams?.length || 0} équipes`}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Ionicons name="search-outline" size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyText}>Aucun championnat correspondant.</Text>
                  </View>
                }
              />
            )
          ) : (
            loadingTeams ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.isDark ? '#CBD5E1' : '#64748B' }]}>
                  Chargement des clubs en direct (TheSportsDB)...
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredTeams}
                keyExtractor={(item) => `${item.comp.id}-${item.team.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isSelected = selectedId === item.team.name || selectedId === item.team.id;
                  const teamBadgeUri = (item.team as any).badge || item.team.logo;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.listItemCard,
                        {
                          backgroundColor: isSelected
                            ? theme.isDark
                              ? '#2A2E39'
                              : '#EFF6FF'
                            : theme.isDark
                            ? '#181A20'
                            : '#FFFFFF',
                          borderColor: isSelected ? theme.primary : theme.isDark ? '#2A2E39' : '#E2E8F0',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (onSelectTeam) onSelectTeam(item.team, item.comp);
                        onClose();
                      }}
                    >
                      <View style={styles.itemLogoWrap}>
                        {teamBadgeUri ? (
                          <Image
                            source={{ uri: teamBadgeUri }}
                            style={styles.teamLogoImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <TeamLogo
                            teamName={item.team.name}
                            logoUrl={item.team.logo}
                            size={32}
                          />
                        )}
                      </View>
                      <View style={styles.itemInfoWrap}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text
                            style={[
                              styles.itemTitle,
                              { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                            ]}
                            numberOfLines={1}
                          >
                            {item.team.name}
                          </Text>
                          {item.team.shortName && (
                            <View style={styles.shortNameBadge}>
                              <Text style={styles.shortNameText}>{item.team.shortName}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.itemMetaRow}>
                          <Image
                            source={require('../../assets/icons/ic_football.png')}
                            style={{ width: 12, height: 12, resizeMode: 'contain', marginRight: 4 }}
                          />
                          <Text style={styles.compSubName} numberOfLines={1}>
                            {item.comp.name}
                          </Text>
                          {item.team.country && (
                            <Text style={styles.metaCountryText}> · {item.team.country}</Text>
                          )}
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Ionicons name="search-outline" size={36} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyText}>Aucune équipe trouvée.</Text>
                  </View>
                }
              />
            )
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    maxHeight: '90%',
    minHeight: '65%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  leagueConstraintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 10,
  },
  constraintText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleConstraintBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  toggleConstraintText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
  },
  tabsScrollWrap: {
    marginBottom: 12,
  },
  tabsContainer: {
    paddingHorizontal: 18,
    gap: 8,
  },
  tabBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 8,
  },
  listItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemLogoWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fifaMiniBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  compLogoImage: {
    width: 32,
    height: 32,
  },
  teamLogoImage: {
    width: 32,
    height: 32,
  },
  itemInfoWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  shortNameBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  shortNameText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  compSubName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metaCountryText: {
    fontSize: 12,
    color: '#64748B',
  },
  metaCountText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  newTagBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  newTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default SportsPickerModal;
