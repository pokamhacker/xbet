import React, { useState, useEffect, useMemo } from 'react';
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BackArrowIcon } from '../components/common/BackArrowIcon';
import { Colors } from '../theme/theme';
import { useThemeStore } from '../stores/themeStore';
import { useBetStore } from '../store/useBetStore';
import { useAuthStore } from '../store/authStore';
import { generateCouponId, generateShareCode } from '../utils/pokerEngine';
import { BetSlip, MatchEvent } from '../types/bet';
import { SportsPickerModal } from '../components/SportsPickerModal';
import {
  SPORTS_CATALOG,
  getCompetitionById,
  resolveTeamLogo,
  resolveCompetitionLogo,
} from '../data/sportsCatalog';
import { TeamLogo } from '../components/common/TeamLogo';
import { fetchTeamsByLeague, SportsTeam } from '../services/sportsApi';
import { LiveMatchPickerModal } from '../components/modals/LiveMatchPickerModal';
import { FIFA_LEAGUES_LIST, getFifaLeagueLogo, FIFA_DEFAULT_TEAMS } from '../constants/fifaLeagues';
import { formatBetDate, combineDateAndTime } from '../utils/dateFormatter';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { normalizeBetSelectionLabel } from '../utils/scoreAdapter';

// Championnats majeurs de football réel
const TOP_REAL_LEAGUES = [
  {
    id: 'uefa-champions-league',
    name: 'UEFA Champions League',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    country: 'Angleterre',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    country: 'Espagne',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
  },
  {
    id: 'ligue-1',
    name: 'Ligue 1',
    country: 'France',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    country: 'Italie',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    country: 'Allemagne',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
  },
  {
    id: 'uefa-europa-league',
    name: 'UEFA Europa League',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/3.png',
  },
  {
    id: 'saudi-pro-league',
    name: 'Saudi Pro League',
    country: 'Arabie Saoudite',
    logo: 'https://media.api-sports.io/football/leagues/307.png',
  },
];

// Championnats Afrique & Sélections Internationales
const AFRICA_AND_REGIONS_LEAGUES = [
  {
    id: 'can-coupe-dafrique-des-nations',
    name: "Coupe d'Afrique des Nations (CAN)",
    country: 'Afrique',
    logo: 'https://media.api-sports.io/football/leagues/6.png',
  },
  {
    id: 'coupe-du-monde',
    name: 'Coupe du Monde FIFA',
    country: 'International',
    logo: 'https://media.api-sports.io/football/leagues/1.png',
  },
  {
    id: 'euro-uefa',
    name: 'UEFA Euro',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/4.png',
  },
  {
    id: 'botola-pro',
    name: 'Botola Pro Maroc',
    country: 'Maroc',
    logo: 'https://media.api-sports.io/football/leagues/200.png',
  },
  {
    id: 'mtn-elite-1-cameroun',
    name: 'MTN Elite 1 Cameroun',
    country: 'Cameroun',
    logo: 'https://media.api-sports.io/football/leagues/210.png',
  },
  {
    id: 'npfl-nigeria',
    name: 'NPFL Nigéria',
    country: 'Nigéria',
    logo: 'https://media.api-sports.io/football/leagues/207.png',
  },
  {
    id: 'ligue-1-pro-tunisie',
    name: 'Ligue 1 Pro Tunisie',
    country: 'Tunisie',
    logo: 'https://media.api-sports.io/football/leagues/202.png',
  },
  {
    id: 'copa-america',
    name: 'Copa America',
    country: 'Amérique du Sud',
    logo: 'https://media.api-sports.io/football/leagues/9.png',
  },
];

// Helper pour générer un avatar de blason réaliste
const makeAvatarLogo = (name: string, bg: string = '243DB5', fg: string = 'FFFFFF') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Club')}&background=${bg}&color=${fg}&size=128&bold=true&rounded=true`;

// Cotes de référence pour le marché « Score exact » (clé = "buts domicile-buts extérieur")
const EXACT_SCORE_ODDS: Record<string, number> = {
  '1-0': 6.5, '2-0': 8.0, '2-1': 8.5, '3-0': 13.0, '3-1': 13.0, '3-2': 23.0, '4-0': 26.0, '4-1': 26.0,
  '0-0': 9.0, '1-1': 6.0, '2-2': 13.0, '3-3': 51.0,
  '0-1': 9.5, '0-2': 15.0, '1-2': 11.0, '0-3': 29.0, '1-3': 23.0, '2-3': 29.0, '0-4': 51.0, '1-4': 51.0,
};

// Estimation de cote pour n'importe quel score (table de référence, sinon formule progressive)
const estimateExactScoreOdd = (h: number, a: number): string => {
  const known = EXACT_SCORE_ODDS[`${h}-${a}`];
  if (known) return formatCleanOdds(known);
  const total = h + a;
  const diff = Math.abs(h - a);
  const est = 6 * Math.pow(1.55, Math.max(0, total - 1)) * (1 + diff * 0.15);
  return formatCleanOdds(Math.min(501, Math.round(est * 2) / 2));
};

// Scores fréquents groupés par issue : 1 (Domicile), X (Nul), 2 (Extérieur)
const EXACT_SCORE_GROUPS: Array<{ key: '1' | 'X' | '2'; color: string; bg: string; scores: Array<[number, number]> }> = [
  { key: '1', color: '#2563EB', bg: '#EFF6FF', scores: [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2], [4, 0], [4, 1]] },
  { key: 'X', color: '#64748B', bg: '#F1F5F9', scores: [[0, 0], [1, 1], [2, 2], [3, 3]] },
  { key: '2', color: '#EA580C', bg: '#FFF7ED', scores: [[0, 1], [0, 2], [1, 2], [0, 3], [1, 3], [2, 3], [0, 4], [1, 4]] },
];

interface TeamItem {
  id: string;
  name: string;
  logo?: string;
  shortName?: string;
}

export default function StudioCreationScreen({ navigation }: any) {
  const { currentTheme } = useThemeStore();
  const isDark = Boolean(currentTheme?.isDark);
  const hasAccess = useAuthStore((s) => s.hasAccessToFeature('studio_match'));

  useEffect(() => {
    if (!hasAccess) {
      Alert.alert(
        'Accès restreint',
        "Vous n'avez pas l'autorisation d'accéder au Studio Match & FIFA. Veuillez contacter votre administrateur.",
        [{ text: 'Compris', onPress: () => navigation.goBack() }]
      );
    }
  }, [hasAccess, navigation]);

  const {
    customLeagues,
    customTeams,
    addCustomLeague,
    addCustomTeam,
    removeCustomLeague,
    removeCustomTeam,
    addCoupon,
  } = useBetStore();

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

  const [placedTime, setPlacedTime] = useState(getCurrentTimeFormatted());
  const [placedDate, setPlacedDate] = useState(getCurrentDateFormatted());
  const [matchTime, setMatchTime] = useState(getCurrentTimeFormatted());
  const [matchDate, setMatchDate] = useState(getCurrentDateFormatted());

  // 2. Structuration des Championnats
  const [leagueCategory, setLeagueCategory] = useState<'real' | 'fifa' | 'regions' | 'custom'>('real');

  // Championnat Sélectionné
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedLeagueLogo, setSelectedLeagueLogo] = useState('');
  const [selectedLeagueId, setSelectedLeagueId] = useState('');
  const [selectedLeagueCountry, setSelectedLeagueCountry] = useState('');

  // Équipes Sélectionnées (vides par défaut)
  const [homeTeam, setHomeTeam] = useState('');
  const [homeTeamLogo, setHomeTeamLogo] = useState('');

  const [awayTeam, setAwayTeam] = useState('');
  const [awayTeamLogo, setAwayTeamLogo] = useState('');

  // Cible d'attribution active : 'home' ou 'away'
  const [activeSlot, setActiveSlot] = useState<'home' | 'away'>('home');
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Équipes chargées dynamiquement
  const [dynamicLeagueTeams, setDynamicLeagueTeams] = useState<TeamItem[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Modales
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [liveModalVisible, setLiveModalVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'competition' | 'team'>('competition');
  const [pickingTarget, setPickingTarget] = useState<'home' | 'away'>('home');

  // Modales de Création Custom
  const [createLeagueModalVisible, setCreateLeagueModalVisible] = useState(false);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueCountry, setNewLeagueCountry] = useState('');
  const [newLeagueSport, setNewLeagueSport] = useState('Football');

  const [createTeamModalVisible, setCreateTeamModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShort, setNewTeamShort] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');

  // Marché & Cotes
  const [selectedCategory, setSelectedCategory] = useState('Résultat');
  const [selectedOptionLabel, setSelectedOptionLabel] = useState('');
  const [odd, setOdd] = useState('');
  const [finalScoreSwitch, setFinalScoreSwitch] = useState(false);
  // Clé du pronostic rapide actif ('1', 'X', '2', etc. ou 'custom') pour adapter dynamiquement l'intitulé
  const [selectedPredKey, setSelectedPredKey] = useState<string>('1');
  const [predictionPeriod, setPredictionPeriod] = useState<'regular' | 'first_half' | 'second_half'>('regular');
  const [liveElapsedInput, setLiveElapsedInput] = useState<string>('22:10');

  // 3. Événements ajoutés
  const [addedEvents, setAddedEvents] = useState<MatchEvent[]>([]);

  // 4. Mise & Résumé
  const [stake, setStake] = useState('500');
  const [enableCashout, setEnableCashout] = useState(true);
  const [customCashoutAmount, setCustomCashoutAmount] = useState<string>('');

  // Charger les équipes dès que la ligue sélectionnée change
  useEffect(() => {
    if (selectedLeague) {
      setLoadingTeams(true);
      fetchTeamsByLeague(selectedLeague)
        .then((teams) => {
          if (teams && teams.length > 0) {
            setDynamicLeagueTeams(
              teams.map((t) => ({
                id: t.id,
                name: t.name,
                logo: t.badge || t.logo,
                shortName: t.shortName,
              }))
            );
          } else {
            setDynamicLeagueTeams([]);
          }
        })
        .catch(() => {
          setDynamicLeagueTeams([]);
        })
        .finally(() => {
          setLoadingTeams(false);
        });
    } else {
      setDynamicLeagueTeams([]);
    }
  }, [selectedLeague]);

  // Regroupe les équipes structurées pour le championnat actif
  const availableLeagueTeams = useMemo(() => {
    if (!selectedLeague && !selectedLeagueId) return [];
    const results: TeamItem[] = [];
    const seen = new Set<string>();

    // 1. Équipes custom du store appartenant à cette ligue
    const matchedCustom = customTeams.filter(
      (ct) => ct.leagueId === selectedLeagueId || ct.leagueId === selectedLeague
    );
    for (const ct of matchedCustom) {
      if (!seen.has(ct.name.toLowerCase())) {
        seen.add(ct.name.toLowerCase());
        results.push({
          id: ct.id,
          name: ct.name,
          shortName: ct.shortName,
          logo: ct.logo || makeAvatarLogo(ct.name),
        });
      }
    }

    // 2. Équipes FIFA si championnat FIFA
    const cleanUpper = (selectedLeague || '').toUpperCase();
    if (
      cleanUpper.includes('FIFA') ||
      cleanUpper.includes('FC ') ||
      (selectedLeagueId && selectedLeagueId.toLowerCase().includes('fc2'))
    ) {
      const matchedFifa = FIFA_LEAGUES_LIST.find(
        (fl) => fl.id === selectedLeagueId || fl.name === selectedLeague
      );
      let flagType = matchedFifa?.flagType;
      if (!flagType) {
        if (cleanUpper.includes('ANGLETERRE') || cleanUpper.includes('ENGLAND')) flagType = 'england';
        else if (cleanUpper.includes('SPAIN') || cleanUpper.includes('ESPAGNE')) flagType = 'spain';
        else if (cleanUpper.includes('ITAL')) flagType = 'italy';
        else if (cleanUpper.includes('GERMAN') || cleanUpper.includes('ALLEMAGNE')) flagType = 'germany';
        else if (
          cleanUpper.includes('CHAMPION') ||
          cleanUpper.includes('EUROPE') ||
          cleanUpper.includes('RUSH') ||
          cleanUpper.includes('SUPERLIGUE') ||
          cleanUpper.includes('CONFÉRENCE') ||
          cleanUpper.includes('CONFERENCE') ||
          cleanUpper.includes('EUROPA')
        ) {
          flagType = 'europe';
        } else {
          flagType = 'globe';
        }
      }
      const fifaTeams = FIFA_DEFAULT_TEAMS[flagType] || FIFA_DEFAULT_TEAMS['europe'] || [];
      for (const ft of fifaTeams) {
        if (!seen.has(ft.name.toLowerCase())) {
          seen.add(ft.name.toLowerCase());
          results.push({
            id: ft.id,
            name: ft.name,
            shortName: ft.shortName,
            logo: ft.logo,
          });
        }
      }
    }

    // 3. Équipes du catalogue local
    const cleanLeagueLower = (selectedLeague || '').trim().toLowerCase();
    const cleanIdLower = (selectedLeagueId || '').trim().toLowerCase();
    const isLaLigaSelected =
      !cleanLeagueLower.includes('fifa') &&
      !cleanLeagueLower.includes('fc ') &&
      (cleanIdLower === 'la-liga' ||
        cleanIdLower === 'laliga' ||
        cleanIdLower === '140' ||
        cleanIdLower === '4335' ||
        cleanLeagueLower === 'la liga' ||
        cleanLeagueLower === 'spanish la liga' ||
        cleanLeagueLower.includes('la liga ea') ||
        cleanLeagueLower.includes('laliga ea'));

    const catalogComp =
      (isLaLigaSelected
        ? SPORTS_CATALOG.find((c) => c.id === 'la-liga' && c.sport === 'Football')
        : undefined) ||
      SPORTS_CATALOG.find(
        (c) =>
          c.id === selectedLeagueId ||
          c.name.toLowerCase() === cleanLeagueLower
      ) ||
      getCompetitionById(selectedLeagueId) ||
      getCompetitionById(selectedLeague);

    if (catalogComp && catalogComp.teams) {
      for (const t of catalogComp.teams) {
        if (!seen.has(t.name.toLowerCase())) {
          seen.add(t.name.toLowerCase());
          results.push({
            id: t.id,
            name: t.name,
            shortName: t.shortName,
            logo: t.logo,
          });
        }
      }
    }

    // 4. Équipes de l'API dynamique TheSportsDB / API-Football
    for (const dt of dynamicLeagueTeams) {
      if (!seen.has(dt.name.toLowerCase())) {
        seen.add(dt.name.toLowerCase());
        results.push(dt);
      }
    }

    return results;
  }, [selectedLeague, selectedLeagueId, customTeams, dynamicLeagueTeams]);

  // Filtre des suggestions rapides (Tous, Score exact, 1X2, Total pair, Total, Mi-temps, Handicap, etc.)
  const [quickPredFilter, setQuickPredFilter] = useState<
    'Tous' | '1X2' | 'Double chance' | 'Total pair' | 'Total' | 'Buts' | 'Mi-temps' | 'Handicap' | 'Score'
  >('Tous');

  const getPeriodPrefix = (period: 'regular' | 'first_half' | 'second_half', baseLabel: string): string => {
    const lower = baseLabel.toLowerCase();
    if (
      lower.includes('mi-temps') ||
      lower.startsWith('mt-fin') ||
      lower.startsWith('temps réglementaire')
    ) {
      return baseLabel;
    }
    if (period === 'first_half') return `${baseLabel}. 1ère mi-temps`;
    if (period === 'second_half') return `${baseLabel}. 2ème mi-temps`;
    return baseLabel;
  };

  // Helper pour calculer les détails d'un pronostic rapide selon les équipes actuelles et la période
  const getQuickPredictionDetails = (
    key: string,
    hTeam: string,
    aTeam: string,
    eHome: number,
    eAway: number,
    period: 'regular' | 'first_half' | 'second_half' = predictionPeriod
  ): { label: string; odd: string; category: string } => {
    const withP = (lbl: string) => getPeriodPrefix(period, lbl);

    if (key === '1' || key === '1x2-v1') return { label: withP('1X2. V1'), odd: period === 'regular' ? '1.85' : '2.07', category: '1X2' };
    if (key === 'X' || key === '1x2-x') return { label: withP('1X2. X'), odd: period === 'regular' ? '3.40' : '4.59', category: '1X2' };
    if (key === '2' || key === '1x2-v2') return { label: withP('1X2. V2'), odd: period === 'regular' ? '3.90' : '2.655', category: '1X2' };
    if (key === 'fifa-1x2-v1') return { label: withP('1X2. V1'), odd: period === 'regular' ? '1.51' : '2.07', category: '1X2' };
    if (key === 'fifa-1x2-x') return { label: withP('1X2. X'), odd: period === 'regular' ? '8.68' : '4.59', category: '1X2' };
    if (key === 'fifa-1x2-v2') return { label: withP('1X2. V2'), odd: period === 'regular' ? '3.22' : '2.655', category: '1X2' };
    if (key === '1X' || key === 'dc-1x') return { label: withP('Double chance. 1X'), odd: period === 'regular' ? '1.29' : '1.41', category: 'Double chance' };
    if (key === '12' || key === 'dc-12') return { label: withP('Double chance. 12'), odd: period === 'regular' ? '1.01' : '1.15', category: 'Double chance' };
    if (key === 'X2' || key === 'dc-2x') return { label: withP('Double chance. 2X'), odd: period === 'regular' ? '2.36' : '1.63', category: 'Double chance' };
    if (key === '+2.5') return { label: withP('Total. (2.5) Plus de'), odd: '1.75', category: 'Total' };
    if (key === '-2.5') return { label: withP('Total. (2.5) Moins de'), odd: '2.05', category: 'Total' };
    if (key === 'BTTS') return { label: withP('Deux équipes vont marquer - Oui'), odd: '1.68', category: 'Buts' };
    if (key.startsWith('cs-')) {
      const parts = key.replace('cs-', '').split('-');
      const scoreH = parseInt(parts[0], 10) || 0;
      const scoreA = parseInt(parts[1], 10) || 0;
      return {
        label: withP(`Score exact. ${scoreH}-${scoreA}`),
        odd: estimateExactScoreOdd(scoreH, scoreA),
        category: 'Score',
      };
    }
    if (key === 'exact-custom') {
      return {
        label: withP(`Score exact. ${eHome}-${eAway}`),
        odd: estimateExactScoreOdd(eHome, eAway),
        category: 'Score',
      };
    }
    return { label: withP('1X2. V1'), odd: '1.85', category: '1X2' };
  };

  // Liste exhaustive de toutes les suggestions rapides issues des captures vidéo et nomenclature stricte
  const allSmartPredictions = useMemo(() => {
    if (!homeTeam || !awayTeam) return [];
    const withP = (lbl: string) => getPeriodPrefix(predictionPeriod, lbl);
    const isHalf = predictionPeriod !== 'regular';

    return [
      // 1X2 (Nomenclature stricte : 1X2. V1, 1X2. X, 1X2. V2)
      { label: withP('1X2. V1'), odd: isHalf ? '2.07' : '1.51', key: 'fifa-1x2-v1', category: '1X2' as const, badge: 'V1' },
      { label: withP('1X2. X'), odd: isHalf ? '4.59' : '8.68', key: 'fifa-1x2-x', category: '1X2' as const, badge: 'X' },
      { label: withP('1X2. V2'), odd: isHalf ? '2.655' : '3.22', key: 'fifa-1x2-v2', category: '1X2' as const, badge: 'V2' },
      { label: withP('1X2. V1'), odd: '1.85', key: '1', category: '1X2' as const, badge: '1' },
      { label: withP('1X2. X'), odd: '3.40', key: 'X', category: '1X2' as const, badge: 'X' },
      { label: withP('1X2. V2'), odd: '1.275', key: '2', category: '1X2' as const, badge: '2' },
      { label: 'Temps réglementaire, 1X2: V1', odd: '3.075', key: 'tr-1x2-v1', category: '1X2' as const },
      { label: 'Temps réglementaire, 1X2: X', odd: '3.92', key: 'tr-1x2-x', category: '1X2' as const },
      { label: 'Temps réglementaire, 1X2: V2', odd: '2.167', key: 'tr-1x2-v2', category: '1X2' as const },
      { label: '1X2 (2UP). V1', odd: '3.03', key: '2up-v1', category: '1X2' as const },
      { label: '1X2 (2UP). Match nul', odd: '3.92', key: '2up-x', category: '1X2' as const },
      { label: '1X2 (2UP). V2', odd: '2.137', key: '2up-v2', category: '1X2' as const },

      // Double chance (captures vidéo : 1.29 / 1.01 / 2.36 en régulier, 1.41 / 1.15 / 1.63 en mi-temps)
      { label: withP('Double chance. 1X'), odd: isHalf ? '1.41' : '1.29', key: 'dc-1x', category: 'Double chance' as const, badge: '1X' },
      { label: withP('Double chance. 12'), odd: isHalf ? '1.15' : '1.01', key: 'dc-12', category: 'Double chance' as const, badge: '12' },
      { label: withP('Double chance. 2X'), odd: isHalf ? '1.63' : '2.36', key: 'dc-2x', category: 'Double chance' as const, badge: '2X' },
      { label: 'Double Chance + Les deux équipes vont marquer. 1X et Oui', odd: '2.31', key: 'dc-btts-1x-o', category: 'Double chance' as const },
      { label: 'Double Chance + Les deux équipes vont marquer. 12 et Oui', odd: '1.87', key: 'dc-btts-12-o', category: 'Double chance' as const },
      { label: 'Double Chance + Les deux équipes vont marquer. 2X et Oui', odd: '1.96', key: 'dc-btts-2x-o', category: 'Double chance' as const },

      // Total pair (captures vidéo : 1.85 / 1.85)
      { label: withP('Total pair. Oui'), odd: '1.85', key: 'tp-oui', category: 'Total pair' as const, badge: 'Oui' },
      { label: withP('Total pair. Non'), odd: '1.85', key: 'tp-non', category: 'Total pair' as const, badge: 'Non' },
      { label: withP('Individuel Total 1 Pair. Oui'), odd: '1.91', key: 'it1p-oui', category: 'Total pair' as const },
      { label: withP('Individuel Total 1 Pair. Non'), odd: '1.9', key: 'it1p-non', category: 'Total pair' as const },
      { label: withP('Individuel Total 2 Pair. Oui'), odd: '1.93', key: 'it2p-oui', category: 'Total pair' as const },
      { label: withP('Individuel Total 2 Pair. Non'), odd: '1.88', key: 'it2p-non', category: 'Total pair' as const },

      // Total (Nomenclature stricte : Total. (X.5) Plus de / Moins de)
      { label: withP('Total. (1.5) Plus de'), odd: '1.153', key: 'tot-o-1.5', category: 'Total' as const },
      { label: withP('Total. (1.5) Moins de'), odd: '5.35', key: 'tot-u-1.5', category: 'Total' as const },
      { label: withP('Total. (2.5) Plus de'), odd: '1.522', key: 'tot-o-2.5', category: 'Total' as const },
      { label: withP('Total. (2.5) Moins de'), odd: '2.536', key: 'tot-u-2.5', category: 'Total' as const },
      { label: withP('Total. (3.5) Plus de'), odd: '2.288', key: 'tot-o-3.5', category: 'Total' as const },
      { label: withP('Total. (3.5) Moins de'), odd: '1.625', key: 'tot-u-3.5', category: 'Total' as const },
      { label: withP('Total. (4.5) Plus de'), odd: '1.15', key: 'fifa-ht-tot-o-4.5', category: 'Total' as const },
      { label: withP('Total. (4.5) Moins de'), odd: '4.67', key: 'fifa-ht-tot-u-4.5', category: 'Total' as const },
      { label: withP('Total. (5.5) Plus de'), odd: '1.37', key: 'fifa-ht-tot-o-5.5', category: 'Total' as const },
      { label: withP('Total. (5.5) Moins de'), odd: '2.84', key: 'fifa-ht-tot-u-5.5', category: 'Total' as const },
      { label: withP('Total. (6.5) Plus de'), odd: '1.77', key: 'fifa-ht-tot-o-6.5', category: 'Total' as const },
      { label: withP('Total. (6.5) Moins de'), odd: '1.94', key: 'fifa-ht-tot-u-6.5', category: 'Total' as const },
      { label: withP('Total. (7.5) Plus de'), odd: '2.45', key: 'fifa-ht-tot-o-7.5', category: 'Total' as const },
      { label: withP('Total. (7.5) Moins de'), odd: '1.49', key: 'fifa-ht-tot-u-7.5', category: 'Total' as const },
      { label: withP('Total. (8.5) Plus de'), odd: '3.55', key: 'fifa-ht-tot-o-8.5', category: 'Total' as const },
      { label: withP('Total. (8.5) Moins de'), odd: '1.25', key: 'fifa-ht-tot-u-8.5', category: 'Total' as const },
      { label: withP('Total. (9.5) Plus de'), odd: '5.5', key: 'fifa-ht-tot-o-9.5', category: 'Total' as const },
      { label: withP('Total. (9.5) Moins de'), odd: '1.1', key: 'fifa-ht-tot-u-9.5', category: 'Total' as const },
      { label: withP('Total. (11.5) Plus de'), odd: '1.27', key: 'fifa-tot-o-11.5', category: 'Total' as const },
      { label: withP('Total. (11.5) Moins de'), odd: '3.44', key: 'fifa-tot-u-11.5', category: 'Total' as const },
      { label: withP('Total. (12.5) Plus de'), odd: '1.48', key: 'fifa-tot-o-12.5', category: 'Total' as const },
      { label: withP('Total. (12.5) Moins de'), odd: '2.47', key: 'fifa-tot-u-12.5', category: 'Total' as const },
      { label: withP('Total. (13.5) Plus de'), odd: '1.8', key: 'fifa-tot-o-13.5', category: 'Total' as const },
      { label: withP('Total. (13.5) Moins de'), odd: '1.9', key: 'fifa-tot-u-13.5', category: 'Total' as const },
      { label: withP('Total. (14.5) Plus de'), odd: '2.27', key: 'fifa-tot-o-14.5', category: 'Total' as const },
      { label: withP('Total. (14.5) Moins de'), odd: '1.56', key: 'fifa-tot-u-14.5', category: 'Total' as const },
      { label: withP('Total. (15.5) Plus de'), odd: '2.99', key: 'fifa-tot-o-15.5', category: 'Total' as const },
      { label: withP('Total. (15.5) Moins de'), odd: '1.34', key: 'fifa-tot-u-15.5', category: 'Total' as const },
      { label: withP('Total. (16.5) Plus de'), odd: '4.1', key: 'fifa-tot-o-16.5', category: 'Total' as const },
      { label: withP('Total. (16.5) Moins de'), odd: '1.19', key: 'fifa-tot-u-16.5', category: 'Total' as const },
      { label: withP('Total. (17.5) Plus de'), odd: '5.83', key: 'fifa-tot-o-17.5', category: 'Total' as const },
      { label: withP('Total. (17.5) Moins de'), odd: '1.09', key: 'fifa-tot-u-17.5', category: 'Total' as const },

      // Total 1 & Total 2 (Nomenclature stricte : Total 1. (X.5) Plus de / Moins de)
      { label: withP('Total 1. (1.5) Plus de'), odd: isHalf ? '1.14' : '2.24', key: 't1-o-1.5', category: 'Total' as const },
      { label: withP('Total 1. (1.5) Moins de'), odd: isHalf ? '4.85' : '1.65', key: 't1-u-1.5', category: 'Total' as const },
      { label: withP('Total 1. (2.5) Plus de'), odd: '1.39', key: 't1-o-2.5', category: 'Total' as const },
      { label: withP('Total 1. (2.5) Moins de'), odd: '2.76', key: 't1-u-2.5', category: 'Total' as const },
      { label: withP('Total 1. (3.5) Plus de'), odd: '1.86', key: 't1-o-3.5', category: 'Total' as const },
      { label: withP('Total 1. (3.5) Moins de'), odd: '1.84', key: 't1-u-3.5', category: 'Total' as const },
      { label: withP('Total 1. (6.5) Plus de'), odd: '1.46', key: 't1-o-6.5', category: 'Total' as const },
      { label: withP('Total 1. (6.5) Moins de'), odd: '2.52', key: 't1-u-6.5', category: 'Total' as const },
      { label: withP('Total 1. (7.5) Plus de'), odd: '1.85', key: 't1-o-7.5', category: 'Total' as const },
      { label: withP('Total 1. (7.5) Moins de'), odd: '1.85', key: 't1-u-7.5', category: 'Total' as const },
      { label: withP('Total 1. (8.5) Plus de'), odd: '2.5', key: 't1-o-8.5', category: 'Total' as const },
      { label: withP('Total 1. (8.5) Moins de'), odd: '1.47', key: 't1-u-8.5', category: 'Total' as const },
      { label: withP('Total 2. (1.5) Plus de'), odd: isHalf ? '1.22' : '1.8', key: 't2-o-1.5', category: 'Total' as const },
      { label: withP('Total 2. (1.5) Moins de'), odd: isHalf ? '3.82' : '2.01', key: 't2-u-1.5', category: 'Total' as const },
      { label: withP('Total 2. (2.5) Plus de'), odd: '1.58', key: 't2-o-2.5', category: 'Total' as const },
      { label: withP('Total 2. (2.5) Moins de'), odd: '2.23', key: 't2-u-2.5', category: 'Total' as const },
      { label: withP('Total 2. (4.5) Plus de'), odd: '1.28', key: 't2-o-4.5', category: 'Total' as const },
      { label: withP('Total 2. (4.5) Moins de'), odd: '3.35', key: 't2-u-4.5', category: 'Total' as const },
      { label: withP('Total 2. (5.5) Plus de'), odd: '1.63', key: 't2-o-5.5', category: 'Total' as const },
      { label: withP('Total 2. (5.5) Moins de'), odd: '2.14', key: 't2-u-5.5', category: 'Total' as const },
      { label: withP('Total 2. (6.5) Plus de'), odd: '2.23', key: 't2-o-6.5', category: 'Total' as const },
      { label: withP('Total 2. (6.5) Moins de'), odd: '1.58', key: 't2-u-6.5', category: 'Total' as const },

      // Mi-temps & Périodes dédiées (Spécification 2 : [Marché]. [Sélection]. [Période])
      { label: '1X2. V1. 1ère mi-temps', odd: '2.07', key: '1x2-1-1t', category: 'Mi-temps' as const },
      { label: '1X2. X. 1ère mi-temps', odd: '4.59', key: '1x2-x-1t', category: 'Mi-temps' as const },
      { label: '1X2. V2. 1ère mi-temps', odd: '2.655', key: '1x2-2-1t', category: 'Mi-temps' as const },
      { label: '1X2. V1. 2ème mi-temps', odd: '2.07', key: 'ht2-1x2-v1', category: 'Mi-temps' as const },
      { label: '1X2. X. 2ème mi-temps', odd: '4.59', key: 'ht2-1x2-x', category: 'Mi-temps' as const },
      { label: '1X2. V2. 2ème mi-temps', odd: '2.655', key: 'ht2-1x2-v2', category: 'Mi-temps' as const },
      { label: 'Total. (1.5) Plus de. 1ère mi-temps', odd: '2.45', key: 'ht1-tot-o-1.5', category: 'Mi-temps' as const },
      { label: 'Total. (6.5) Plus de. 1ère mi-temps', odd: '1.77', key: 'ht1-tot-o-6.5', category: 'Mi-temps' as const },
      { label: 'Total. (6.5) Moins de. 1ère mi-temps', odd: '1.94', key: 'ht1-tot-u-6.5', category: 'Mi-temps' as const },
      { label: 'Total. (6.5) Plus de. 2ème mi-temps', odd: '1.77', key: 'ht2-tot-o-6.5', category: 'Mi-temps' as const },
      { label: 'Total. (6.5) Moins de. 2ème mi-temps', odd: '1.94', key: 'ht2-tot-u-6.5', category: 'Mi-temps' as const },
      { label: 'Score dans chaque mi-temps. 1 > 2', odd: '2.056', key: 'seh-12', category: 'Mi-temps' as const },
      { label: 'Score dans chaque mi-temps. 1 = 2', odd: '8.34', key: 'seh-eq', category: 'Mi-temps' as const },
      { label: 'Score dans chaque mi-temps. 1 < 2', odd: '2.12', key: 'seh-21', category: 'Mi-temps' as const },
      { label: 'Equipe 1 va gagner au moins une mi-temps - Oui', odd: '1.25', key: 't1wah-oui', category: 'Mi-temps' as const },
      { label: 'Equipe 1 va gagner au moins une mi-temps - Non', odd: '3.54', key: 't1wah-non', category: 'Mi-temps' as const },
      { label: 'Equipe 2 va gagner au moins une mi-temps - Oui', odd: '1.77', key: 't2wah-oui', category: 'Mi-temps' as const },
      { label: 'Equipe 2 va gagner au moins une mi-temps - Non', odd: '1.94', key: 't2wah-non', category: 'Mi-temps' as const },
      { label: 'Equipe 1 va gagner les deux mi-temps - Oui', odd: '3.78', key: 't1wbh-oui', category: 'Mi-temps' as const },
      { label: 'Equipe 1 va gagner les deux mi-temps - Non', odd: '1.22', key: 't1wbh-non', category: 'Mi-temps' as const },
      { label: 'Equipe 2 va gagner les deux mi-temps - Oui', odd: '6.93', key: 't2wbh-oui', category: 'Mi-temps' as const },
      { label: 'Equipe 2 va gagner les deux mi-temps - Non', odd: '1.06', key: 't2wbh-non', category: 'Mi-temps' as const },
      { label: 'MT-Fin. V1V1', odd: '2.73', key: 'htft-11', category: 'Mi-temps' as const },
      { label: 'MT-Fin. V2V1', odd: '5.5', key: 'htft-21', category: 'Mi-temps' as const },
      { label: 'MT-Fin. V1V2', odd: '8.7', key: 'htft-12', category: 'Mi-temps' as const },
      { label: 'MT-Fin. V2V2', odd: '4.63', key: 'htft-22', category: 'Mi-temps' as const },

      // Buts, BTTS (captures vidéo : Chaque Equipe va marquer (5)-(8) Ou Plus, Prochain but, Nombre exact)
      { label: withP('Deux équipes vont marquer - Oui'), odd: '1.46', key: 'btts-oui', category: 'Buts' as const },
      { label: withP('Deux équipes vont marquer - Non'), odd: '2.578', key: 'btts-non', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (2) Ou Plus - Oui'), odd: '1.52', key: 'btts2-oui', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (2) Ou Plus - Non'), odd: '2.35', key: 'btts2-non', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (3) Ou Plus - Oui'), odd: '2.65', key: 'btts3-oui', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (3) Ou Plus - Non'), odd: '1.43', key: 'btts3-non', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (5) Ou Plus - Oui'), odd: '1.47', key: 'btts5-oui', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (5) Ou Plus - Non'), odd: '2.5', key: 'btts5-non', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (6) Ou Plus - Oui'), odd: '2.15', key: 'btts6-oui', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (6) Ou Plus - Non'), odd: '1.63', key: 'btts6-non', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (7) Ou Plus - Oui'), odd: '3.6', key: 'btts7-oui', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (7) Ou Plus - Non'), odd: '1.24', key: 'btts7-non', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (8) Ou Plus - Oui'), odd: '6.85', key: 'btts8-oui', category: 'Buts' as const },
      { label: withP('Chaque Equipe va marquer (8) Ou Plus - Non'), odd: '1.06', key: 'btts8-non', category: 'Buts' as const },
      { label: withP('Prochain but. Equipe 1 (1)'), odd: '1.68', key: 'nb-1-e1', category: 'Buts' as const },
      { label: withP('Prochain but. Equipe 2 (1)'), odd: '2.05', key: 'nb-1-e2', category: 'Buts' as const },

      // Handicap (captures vidéo : -3.5 à +1.5)
      { label: withP('Handicap. 1 (-1.5)'), odd: '1.89', key: 'hc-1--1.5', category: 'Handicap' as const },
      { label: withP('Handicap. 2 (+1.5)'), odd: '1.81', key: 'hc-2-+1.5', category: 'Handicap' as const },
      { label: withP('Handicap. 1 (-2.5)'), odd: '2.45', key: 'hc-1--2.5', category: 'Handicap' as const },
      { label: withP('Handicap. 2 (+2.5)'), odd: '1.49', key: 'hc-2-+2.5', category: 'Handicap' as const },
      { label: withP('Handicap. 1 (-0.5)'), odd: '1.49', key: 'hc-1--0.5', category: 'Handicap' as const },
      { label: withP('Handicap. 2 (+0.5)'), odd: '2.44', key: 'hc-2-+0.5', category: 'Handicap' as const },
      { label: withP('Handicap. 1 (+0.5)'), odd: '1.31', key: 'hc-1-+0.5', category: 'Handicap' as const },
      { label: withP('Handicap. 2 (-0.5)'), odd: '3.18', key: 'hc-2--0.5', category: 'Handicap' as const },

      // Score Exact directement dans les pronostics rapides !
      { label: withP('Score exact. 1-0'), odd: '6.50', key: 'cs-1-0', category: 'Score' as const, scoreHome: 1, scoreAway: 0 },
      { label: withP('Score exact. 2-0'), odd: '8.00', key: 'cs-2-0', category: 'Score' as const, scoreHome: 2, scoreAway: 0 },
      { label: withP('Score exact. 2-1'), odd: '8.50', key: 'cs-2-1', category: 'Score' as const, scoreHome: 2, scoreAway: 1 },
      { label: withP('Score exact. 3-0'), odd: '13.00', key: 'cs-3-0', category: 'Score' as const, scoreHome: 3, scoreAway: 0 },
      { label: withP('Score exact. 3-1'), odd: '13.00', key: 'cs-3-1', category: 'Score' as const, scoreHome: 3, scoreAway: 1 },
      { label: withP('Score exact. 1-1'), odd: '6.00', key: 'cs-1-1', category: 'Score' as const, scoreHome: 1, scoreAway: 1 },
      { label: withP('Score exact. 0-0'), odd: '9.00', key: 'cs-0-0', category: 'Score' as const, scoreHome: 0, scoreAway: 0 },
      { label: withP('Score exact. 2-2'), odd: '13.00', key: 'cs-2-2', category: 'Score' as const, scoreHome: 2, scoreAway: 2 },
      { label: withP('Score exact. 0-1'), odd: '9.50', key: 'cs-0-1', category: 'Score' as const, scoreHome: 0, scoreAway: 1 },
      { label: withP('Score exact. 0-2'), odd: '15.00', key: 'cs-0-2', category: 'Score' as const, scoreHome: 0, scoreAway: 2 },
      { label: withP('Score exact. 1-2'), odd: '11.00', key: 'cs-1-2', category: 'Score' as const, scoreHome: 1, scoreAway: 2 },
      { label: withP('Score exact. 1-3'), odd: '23.00', key: 'cs-1-3', category: 'Score' as const, scoreHome: 1, scoreAway: 3 },
    ];
  }, [homeTeam, awayTeam, predictionPeriod]);

  // Suggestions filtrées selon l'onglet actif
  const smartPredictions = useMemo(() => {
    if (quickPredFilter === 'Tous') return allSmartPredictions;
    return allSmartPredictions.filter((item) => item.category === quickPredFilter);
  }, [allSmartPredictions, quickPredFilter]);

  // Score exact : sélecteur personnalisé (buts Domicile / Extérieur)
  const [exactHome, setExactHome] = useState(0);
  const [exactAway, setExactAway] = useState(0);

  const exactScoreLabel = (h: number, a: number) =>
    getPeriodPrefix(predictionPeriod, `Score exact. ${h}-${a}`);

  const applyExactScore = (h: number, a: number) => {
    setExactHome(h);
    setExactAway(a);
    setSelectedCategory('Score');
    const chipKey = `cs-${h}-${a}`;
    setSelectedPredKey(chipKey);
    setSelectedOptionLabel(exactScoreLabel(h, a));
    setOdd(estimateExactScoreOdd(h, a));
  };

  const handleSelectQuickPrediction = (pred: {
    key: string;
    label: string;
    odd: string;
    category: string;
    scoreHome?: number;
    scoreAway?: number;
  }) => {
    setSelectedPredKey(pred.key);
    setSelectedOptionLabel(pred.label);
    setOdd(pred.odd);
    setSelectedCategory(pred.category === 'Score' ? 'Score' : 'Résultat');
    if (pred.scoreHome !== undefined && pred.scoreAway !== undefined) {
      setExactHome(pred.scoreHome);
      setExactAway(pred.scoreAway);
    }
  };

  // Synchronise et adapte l'intitulé du pronostic personnalisé et la cote
  // automatiquement avec le pronostic rapide suggéré quand les équipes ou la période changent
  useEffect(() => {
    if (!homeTeam) return;

    if (selectedPredKey && selectedPredKey !== 'custom') {
      const matched = allSmartPredictions.find((p) => p.key === selectedPredKey);
      if (matched) {
        if (matched.label !== selectedOptionLabel) {
          setSelectedOptionLabel(matched.label);
        }
        return;
      }
      const details = getQuickPredictionDetails(
        selectedPredKey,
        homeTeam,
        awayTeam,
        exactHome,
        exactAway,
        predictionPeriod
      );
      if (details.label !== selectedOptionLabel) {
        setSelectedOptionLabel(details.label);
      }
      if (details.odd && (!odd || ['1', '2', '1X', '12', 'X2'].includes(selectedPredKey))) {
        setOdd(details.odd);
      }
    } else if (!selectedOptionLabel) {
      setSelectedPredKey('1');
      setSelectedOptionLabel(getPeriodPrefix(predictionPeriod, '1X2. V1'));
      setOdd('1.85');
    }
  }, [homeTeam, awayTeam, selectedPredKey, exactHome, exactAway, predictionPeriod, allSmartPredictions]);

  // Calculs dynamiques de cotes
  const totalOdds = addedEvents.reduce((acc, ev) => acc * (ev.odd || 1), 1);
  const numericStake = parseFloat(stake) || 0;
  const potentialPayout = addedEvents.length > 0 ? Math.round(numericStake * totalOdds) : 0;

  // Sélection d'un championnat
  const handleSelectLeague = (item: { id: string; name: string; logo?: string; country?: string }) => {
    setSelectedLeague(item.name);
    setSelectedLeagueId(item.id);
    setSelectedLeagueLogo(item.logo || resolveCompetitionLogo(item.name) || '');
    if (item.country) setSelectedLeagueCountry(item.country);
    const upper = (item.name || '').toUpperCase();
    const idLower = (item.id || '').toLowerCase();
    if (
      leagueCategory === 'fifa' ||
      upper.includes('FIFA') ||
      upper.includes('FC ') ||
      idLower.includes('fifa') ||
      idLower.includes('fc2')
    ) {
      setIsLiveBadge(true);
    }
  };

  // Attribution d'une équipe en 1 tap
  const handleAssignTeam = (team: TeamItem) => {
    const logo = team.logo || resolveTeamLogo(team.name) || makeAvatarLogo(team.name);
    if (activeSlot === 'home') {
      setHomeTeam(team.name);
      setHomeTeamLogo(logo);
      setActiveSlot('away'); // Passe automatiquement au slot Extérieur
    } else {
      setAwayTeam(team.name);
      setAwayTeamLogo(logo);
    }
  };

  // Inverser Domicile et Extérieur en 1 tap
  const handleSwapTeams = () => {
    const tempName = homeTeam;
    const tempLogo = homeTeamLogo;
    setHomeTeam(awayTeam);
    setHomeTeamLogo(awayTeamLogo);
    setAwayTeam(tempName);
    setAwayTeamLogo(tempLogo);
  };

  // Création d'un championnat personnalisé
  const handleSaveCustomLeague = () => {
    if (!newLeagueName.trim()) {
      Alert.alert('Nom requis', 'Veuillez saisir le nom du championnat.');
      return;
    }
    const newId = `custo-${Date.now()}`;
    const newLeague = {
      id: newId,
      name: newLeagueName.trim(),
      sport: newLeagueSport || 'Football',
      country: newLeagueCountry.trim() || 'Personnalisé',
      icon: 'trophy',
      logo: makeAvatarLogo(newLeagueName.trim(), '1E293B', '38BDF8'),
      category: 'custom',
    };
    addCustomLeague(newLeague);
    setSelectedLeague(newLeague.name);
    setSelectedLeagueId(newLeague.id);
    setSelectedLeagueLogo(newLeague.logo);
    setSelectedLeagueCountry(newLeague.country);
    setLeagueCategory('custom');
    setCreateLeagueModalVisible(false);
    setNewLeagueName('');
    setNewLeagueCountry('');
    Alert.alert('Championnat Créé', `"${newLeague.name}" est maintenant actif dans le Studio.`);
  };

  // Création d'une équipe personnalisée dans le championnat actif
  const handleSaveCustomTeam = () => {
    if (!selectedLeague) {
      Alert.alert('Championnat requis', 'Sélectionnez d’abord un championnat pour y rattacher l’équipe.');
      return;
    }
    if (!newTeamName.trim()) {
      Alert.alert('Nom requis', 'Veuillez saisir le nom de l’équipe.');
      return;
    }
    const newId = `team-custo-${Date.now()}`;
    const logo = newTeamLogo.trim() || makeAvatarLogo(newTeamName.trim(), '243DB5', 'FFFFFF');
    const newTeam = {
      id: newId,
      leagueId: selectedLeagueId || selectedLeague,
      name: newTeamName.trim(),
      shortName: newTeamShort.trim().toUpperCase() || undefined,
      logo,
      country: selectedLeagueCountry || 'Personnalisé',
    };
    addCustomTeam(newTeam);
    // Attribuer automatiquement au slot actif
    if (activeSlot === 'home') {
      setHomeTeam(newTeam.name);
      setHomeTeamLogo(logo);
      setActiveSlot('away');
    } else {
      setAwayTeam(newTeam.name);
      setAwayTeamLogo(logo);
    }
    setCreateTeamModalVisible(false);
    setNewTeamName('');
    setNewTeamShort('');
    setNewTeamLogo('');
  };

  const parseElapsedMMSS = (input: string, isFifa: boolean): number => {
    const clean = (input || '').trim();
    const m = clean.match(/^(\d{1,3}):(\d{1,2})$/);
    if (m) {
      return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    }
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num >= 0) {
      return num * 60;
    }
    return isFifa ? 125 : 1330; // 02:05 FIFA ou 22:10 Football par défaut
  };

  const handleAddEvent = () => {
    if (!selectedLeague) {
      Alert.alert('Championnat requis', 'Veuillez sélectionner un championnat avant d’ajouter.');
      return;
    }
    if (!homeTeam || !awayTeam) {
      Alert.alert('Équipes requises', 'Veuillez définir les équipes Domicile et Extérieur.');
      return;
    }
    const numericOdd = parseFloat(odd.replace(',', '.')) || 1.85;
    const isFifa =
      leagueCategory === 'fifa' ||
      selectedLeague.toUpperCase().includes('FIFA') ||
      selectedLeague.toUpperCase().includes('FC ') ||
      selectedLeagueId.toLowerCase().includes('fifa') ||
      selectedLeagueId.toLowerCase().includes('fc2');
    const finalTime = matchTime.trim() || getCurrentTimeFormatted();
    const finalDate = matchDate.trim() || getCurrentDateFormatted();
    const selectedDateTime = combineDateAndTime(finalDate, finalTime);
    const normalizedPred = normalizeBetSelectionLabel(
      selectedOptionLabel || getPeriodPrefix(predictionPeriod, '1X2. V1'),
      homeTeam,
      awayTeam
    );
    const evIsLive = isFifa ? true : isLiveBadge;

    const newEv: MatchEvent = {
      id: String(Date.now()),
      sport: isFifa ? 'FIFA' : 'Football',
      league: selectedLeague,
      date: selectedDateTime.formatted,
      startDate: selectedDateTime.toISOString(),
      matchTime: finalTime,
      matchDate: finalDate,
      homeTeam: { name: homeTeam, logo: homeTeamLogo },
      awayTeam: { name: awayTeam, logo: awayTeamLogo },
      prediction: normalizedPred,
      odd: numericOdd,
      actualScore: undefined,
      status: 'Accepté',
      isLive: evIsLive,
      isFifa,
      elapsedSeconds: evIsLive ? parseElapsedMMSS(liveElapsedInput, isFifa) : undefined,
      gameCategory: 'sports',
    };
    (newEv as any).liveStartedAt = Date.now();
    setAddedEvents([...addedEvents, newEv]);
    Alert.alert('Événement Ajouté', `${homeTeam} vs ${awayTeam} (${normalizedPred}) ajouté au coupon.`);
  };

  const handleRemoveEvent = (id: string) => {
    setAddedEvents(addedEvents.filter((e) => e.id !== id));
  };

  const handleSaveCoupon = () => {
    const finalPlacedTime = placedTime.trim() || getCurrentTimeFormatted();
    const finalPlacedDate = placedDate.trim() || getCurrentDateFormatted();
    const placedDateTime = combineDateAndTime(finalPlacedDate, finalPlacedTime);

    const finalTime = matchTime.trim() || getCurrentTimeFormatted();
    const finalDate = matchDate.trim() || getCurrentDateFormatted();
    const selectedDateTime = combineDateAndTime(finalDate, finalTime);
    const matchTimestamp = selectedDateTime.formatted;
    const matchIso = selectedDateTime.toISOString();

    let eventsToSave = [...addedEvents];

    // Ajout automatique uniquement si le formulaire est entièrement rempli (aucun événement fictif)
    if (eventsToSave.length === 0 && selectedLeague && homeTeam && awayTeam) {
      const numericOdd = parseFloat(odd.replace(',', '.')) || 1.85;
      const isFifa =
        leagueCategory === 'fifa' ||
        selectedLeague.toUpperCase().includes('FIFA') ||
        selectedLeague.toUpperCase().includes('FC ') ||
        selectedLeagueId.toLowerCase().includes('fifa') ||
        selectedLeagueId.toLowerCase().includes('fc2');
      const normalizedPred = normalizeBetSelectionLabel(
        selectedOptionLabel || getPeriodPrefix(predictionPeriod, '1X2. V1'),
        homeTeam,
        awayTeam
      );
      const evIsLive = isFifa ? true : isLiveBadge;
      const autoEv: MatchEvent = {
        id: String(Date.now()),
        sport: isFifa ? 'FIFA' : 'Football',
        league: selectedLeague || 'Football',
        date: matchTimestamp,
        startDate: matchIso,
        matchTime: finalTime,
        matchDate: finalDate,
        homeTeam: { name: homeTeam, logo: homeTeamLogo },
        awayTeam: { name: awayTeam, logo: awayTeamLogo },
        prediction: normalizedPred,
        odd: numericOdd,
        actualScore: undefined,
        status: 'Accepté',
        isLive: evIsLive,
        isFifa,
        elapsedSeconds: evIsLive ? parseElapsedMMSS(liveElapsedInput, isFifa) : undefined,
        gameCategory: 'sports',
      };
      (autoEv as any).liveStartedAt = Date.now();
      eventsToSave = [autoEv];
      setAddedEvents(eventsToSave);
    }

    if (eventsToSave.length === 0) {
      Alert.alert('Attention', 'Ajoute au moins un événement pour sauvegarder le coupon.');
      return;
    }

    const finalId = customId.trim() !== '' ? customId.trim() : generateCouponId();
    const hasFifa = eventsToSave.some(
      (e) =>
        e.isFifa ||
        e.sport === 'FIFA' ||
        (e.league &&
          (e.league.toUpperCase().includes('FIFA') ||
            e.league.toUpperCase().includes('FC 2') ||
            e.league.toUpperCase().includes('5X5 RUSH')))
    );
    const hasLive =
      isLiveBadge || hasFifa || eventsToSave.some((e) => e.isLive || e.isFifa || e.sport === 'FIFA');
    const calculatedOdds = eventsToSave.reduce((acc, ev) => acc * (ev.odd || 1), 1);
    const calculatedPayout = Math.round(numericStake * calculatedOdds * 100) / 100;

    const newCoupon: BetSlip = {
      id: finalId,
      createdAt: placedDateTime.formatted,
      startDate: matchIso,
      matchTime: finalTime,
      matchDate: finalDate,
      type: eventsToSave.length > 1 ? 'Combiné' : 'Simple',
      eventsCount: eventsToSave.length,
      completedCount: 0,
      totalOdds: Math.round(calculatedOdds * 1000) / 1000,
      stake: numericStake,
      potentialPayout: calculatedPayout,
      status: 'Accepté',
      isLive: hasLive,
      sport: hasFifa ? 'FIFA' : 'Football',
      league: eventsToSave[0]?.league || selectedLeague || (hasFifa ? 'FIFA. FC 26. 5x5 Rush. Superligue' : 'Football'),
      events: eventsToSave.map((ev) => {
        const evTime = eventsToSave.length === 1 || !ev.matchTime ? finalTime : ev.matchTime;
        const evDateStr = eventsToSave.length === 1 || !ev.matchDate ? finalDate : ev.matchDate;
        const evDateTime = combineDateAndTime(evDateStr, evTime);
        const evDate = eventsToSave.length === 1 || !ev.date ? evDateTime.formatted : ev.date;
        const evStartDate = eventsToSave.length === 1 || !ev.startDate ? evDateTime.toISOString() : ev.startDate;
        const evIsFifa = Boolean(
          ev.isFifa ||
          ev.sport === 'FIFA' ||
          (ev.league && (ev.league.toUpperCase().includes('FIFA') || ev.league.toUpperCase().includes('FC ')))
        );
        const evHomeName = typeof ev.homeTeam === 'string' ? ev.homeTeam : ev.homeTeam?.name;
        const evAwayName = typeof ev.awayTeam === 'string' ? ev.awayTeam : ev.awayTeam?.name;
        const evLive = Boolean(evIsFifa || isLiveBadge || ev.isLive);

        const mappedEv: MatchEvent = {
          ...ev,
          sport: evIsFifa ? 'FIFA' : (ev.sport || 'Football'),
          prediction: normalizeBetSelectionLabel(ev.prediction, evHomeName, evAwayName),
          date: evDate,
          startDate: evStartDate,
          matchTime: evTime,
          matchDate: evDateStr,
          status: 'Accepté' as const,
          isFifa: evIsFifa,
          isLive: evLive,
          elapsedSeconds: evLive
            ? (ev.elapsedSeconds ?? parseElapsedMMSS(liveElapsedInput, evIsFifa))
            : ev.elapsedSeconds,
        };
        (mappedEv as any).liveStartedAt = (ev as any).liveStartedAt || Date.now();
        return mappedEv;
      }),
      isForSale: enableCashout,
      cashoutAmount: parseInt(customCashoutAmount, 10) || Math.round(numericStake * 0.94),
      shareCode: generateShareCode(),
      gameCategory: hasFifa ? 'esports' : 'sports',
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

  if (!hasAccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="lock-closed" size={56} color="#EF4444" />
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
          Accès restreint
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Votre compte n'a pas l'autorisation d'accéder au Studio Match & FIFA. Veuillez contacter votre administrateur.
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
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: currentTheme.headerBackground || currentTheme.cardBackground,
            borderBottomColor: currentTheme.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackArrowIcon size={24} color={currentTheme.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>
            Studio de création
          </Text>
          <Text style={[styles.headerSub, { color: currentTheme.textSecondary }]}>
            Championnats, Équipes & Coupons
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Banner : Création guidée */}
        <View style={styles.bannerBox}>
          <View style={styles.bannerIconBox}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={24} color={Colors.primaryAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Création Pro & Hiérarchie Équipes</Text>
            <Text style={styles.bannerSubtitle}>
              Sélectionnez un championnat pour charger et configurer ses équipes en 1 clic.
            </Text>
          </View>
        </View>

        {/* Section 1 : IDENTITÉ */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>IDENTITÉ DU TICKET</Text>
          <Text style={styles.fieldLabel}>ID personnalisé optionnel</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 82574662089"
            value={customId}
            onChangeText={setCustomId}
            keyboardType="numeric"
          />
          <Text style={styles.helperText}>
            11 chiffres, commence par 85. Vide = numéro généré automatiquement.
          </Text>

          {/* Checkboxes */}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setHasCustomBadge(!hasCustomBadge)}>
              <Ionicons
                name={hasCustomBadge ? 'checkbox' : 'square-outline'}
                size={20}
                color={hasCustomBadge ? Colors.primaryAccent : Colors.textSubtle}
              />
              <Text style={styles.checkboxLabel}>Badge coupon</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsLiveBadge(!isLiveBadge)}>
              <Ionicons
                name={isLiveBadge ? 'checkbox' : 'square-outline'}
                size={20}
                color={isLiveBadge ? Colors.primaryAccent : Colors.textSubtle}
              />
              <Text style={styles.checkboxLabel}>
                <Text style={{ color: Colors.liveRed }}>• </Text>Badge En Direct
              </Text>
            </TouchableOpacity>
          </View>

          {isLiveBadge && (
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.helperText, { marginTop: 0, marginBottom: 4 }]}>
                Temps écoulé initial (MM:SS) — affiché dans « EN DIRECT • temps écoulé : XX:XX »
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 22:10"
                value={liveElapsedInput}
                onChangeText={setLiveElapsedInput}
              />
            </View>
          )}

          {/* Horodatage de mise du coupon (Header financier & Historique) */}
          <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border }}>
            <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Heure de mise du coupon (Header & Historique)</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helperText, { marginTop: 0, marginBottom: 4 }]}>Heure de mise (HH:mm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 14:30"
                  value={placedTime}
                  onChangeText={setPlacedTime}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.helperText, { marginTop: 0, marginBottom: 4 }]}>Date de mise (JJ.MM.AAAA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 21.10.2026"
                  value={placedDate}
                  onChangeText={setPlacedDate}
                />
              </View>
            </View>
          </View>

          {/* Horodatage du match */}
          <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border }}>
            <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Horodatage du match (Début du match)</Text>
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
          </View>
        </View>

        {/* Section 2 : CHAMPIONNATS & ÉQUIPES STRUCTURÉS */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={styles.cardSectionTitle}>CHAMPIONNATS & ÉQUIPES</Text>
            <TouchableOpacity
              style={styles.newLeagueTopBtn}
              onPress={() => setCreateLeagueModalVisible(true)}
            >
              <Ionicons name="add-circle" size={16} color={Colors.primary} />
              <Text style={styles.newLeagueTopBtnText}>+ Championnat</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton d'importation directe API-Football */}
          <TouchableOpacity
            style={styles.apiFootballCardBtn}
            activeOpacity={0.8}
            onPress={() => setLiveModalVisible(true)}
          >
            <View style={styles.apiFootballIconWrap}>
              <MaterialCommunityIcons name="soccer" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.apiFootballCardTitle}>API-Football Temps Réel</Text>
                <View style={styles.apiFootballLiveTag}>
                  <Text style={styles.apiFootballLiveTagText}>DIRECT</Text>
                </View>
              </View>
              <Text style={styles.apiFootballCardSubtitle}>
                Importer un match en direct avec logos et cotes officielles
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>

          {/* Onglets de Catégories de Championnats */}
          <Text style={styles.subCategoryTitle}>1. Choisir la catégorie de championnat</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryTabsWrap}>
            <TouchableOpacity
              style={[styles.categoryTab, leagueCategory === 'real' && styles.categoryTabActive]}
              onPress={() => setLeagueCategory('real')}
            >
              <Text style={styles.categoryTabIcon}>🌍</Text>
              <Text style={[styles.categoryTabText, leagueCategory === 'real' && styles.categoryTabTextActive]}>
                Top Ligues
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTab, leagueCategory === 'fifa' && styles.categoryTabActive]}
              onPress={() => setLeagueCategory('fifa')}
            >
              <Text style={styles.categoryTabIcon}>🎮</Text>
              <Text style={[styles.categoryTabText, leagueCategory === 'fifa' && styles.categoryTabTextActive]}>
                FIFA & Cyber
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTab, leagueCategory === 'regions' && styles.categoryTabActive]}
              onPress={() => setLeagueCategory('regions')}
            >
              <Text style={styles.categoryTabIcon}>🦁</Text>
              <Text style={[styles.categoryTabText, leagueCategory === 'regions' && styles.categoryTabTextActive]}>
                Sélections & Afrique
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTab, leagueCategory === 'custom' && styles.categoryTabActive]}
              onPress={() => setLeagueCategory('custom')}
            >
              <Text style={styles.categoryTabIcon}>⭐</Text>
              <Text style={[styles.categoryTabText, leagueCategory === 'custom' && styles.categoryTabTextActive]}>
                Personnalisés ({customLeagues.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Carrousel des Championnats selon Catégorie */}
          <View style={{ marginVertical: 8 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {leagueCategory === 'real' &&
                TOP_REAL_LEAGUES.map((l) => {
                  const isSelected = selectedLeague === l.name;
                  return (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.leagueChip, isSelected && styles.leagueChipActive]}
                      activeOpacity={0.75}
                      onPress={() => handleSelectLeague(l)}
                    >
                      <Image source={{ uri: l.logo }} style={styles.leagueChipLogo} resizeMode="contain" />
                      <View>
                        <Text style={[styles.leagueChipName, isSelected && styles.leagueChipNameActive]}>
                          {l.name}
                        </Text>
                        <Text style={styles.leagueChipCountry}>{l.country}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

              {leagueCategory === 'fifa' &&
                FIFA_LEAGUES_LIST.map((fl) => {
                  const isSelected = selectedLeague === fl.name || selectedLeagueId === fl.id;
                  const logo = getFifaLeagueLogo(fl.flagType);
                  return (
                    <TouchableOpacity
                      key={fl.id}
                      style={[styles.leagueChip, isSelected && styles.leagueChipActive]}
                      activeOpacity={0.75}
                      onPress={() =>
                        handleSelectLeague({
                          id: fl.id,
                          name: fl.name,
                          logo,
                          country: 'E-Sports',
                        })
                      }
                    >
                      <Image source={{ uri: logo }} style={styles.leagueChipLogo} resizeMode="contain" />
                      <View>
                        <Text style={[styles.leagueChipName, isSelected && styles.leagueChipNameActive]}>
                          {fl.name}
                        </Text>
                        <Text style={styles.leagueChipCountry}>{fl.category}</Text>
                      </View>
                      {fl.isNew && (
                        <View style={styles.chipNewBadge}>
                          <Text style={styles.chipNewText}>NEW</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

              {leagueCategory === 'regions' &&
                AFRICA_AND_REGIONS_LEAGUES.map((l) => {
                  const isSelected = selectedLeague === l.name;
                  return (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.leagueChip, isSelected && styles.leagueChipActive]}
                      activeOpacity={0.75}
                      onPress={() => handleSelectLeague(l)}
                    >
                      <Image source={{ uri: l.logo }} style={styles.leagueChipLogo} resizeMode="contain" />
                      <View>
                        <Text style={[styles.leagueChipName, isSelected && styles.leagueChipNameActive]}>
                          {l.name}
                        </Text>
                        <Text style={styles.leagueChipCountry}>{l.country}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

              {leagueCategory === 'custom' && (
                <>
                  {customLeagues.map((cl) => {
                    const isSelected = selectedLeague === cl.name || selectedLeagueId === cl.id;
                    const logoUrl = cl.logo || makeAvatarLogo(cl.name);
                    return (
                      <TouchableOpacity
                        key={cl.id}
                        style={[styles.leagueChip, isSelected && styles.leagueChipActive]}
                        activeOpacity={0.75}
                        onPress={() =>
                          handleSelectLeague({
                            id: cl.id,
                            name: cl.name,
                            logo: logoUrl,
                            country: cl.country,
                          })
                        }
                      >
                        <Image source={{ uri: logoUrl }} style={styles.leagueChipLogo} resizeMode="contain" />
                        <View>
                          <Text style={[styles.leagueChipName, isSelected && styles.leagueChipNameActive]}>
                            {cl.name}
                          </Text>
                          <Text style={styles.leagueChipCountry}>{cl.country || 'Custom'}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={styles.addCustomLeagueChip}
                    onPress={() => setCreateLeagueModalVisible(true)}
                  >
                    <Ionicons name="add" size={18} color={Colors.primary} />
                    <Text style={styles.addCustomLeagueChipText}>Nouveau</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>

          {/* Recherche & Sélecteur Universel */}
          <TouchableOpacity
            style={styles.fullCatalogBtn}
            onPress={() => {
              setPickerMode('competition');
              setPickerModalVisible(true);
            }}
          >
            <Ionicons name="search" size={16} color={Colors.primary} />
            <Text style={styles.fullCatalogBtnText}>Rechercher parmi tous les championnats du monde...</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>

          {/* Carte Visuelle du Championnat Sélectionné */}
          <View style={styles.activeLeagueCard}>
            {selectedLeague ? (
              <Image
                source={{ uri: selectedLeagueLogo || makeAvatarLogo(selectedLeague) }}
                style={styles.activeLeagueLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.activeLeagueLogo, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }]}>
                <Ionicons name="trophy-outline" size={20} color="#0284C7" />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.activeLeagueTitle} numberOfLines={1}>
                {selectedLeague || 'Aucun championnat sélectionné'}
              </Text>
              <Text style={styles.activeLeagueMeta}>
                {selectedLeague
                  ? `${selectedLeagueCountry ? `${selectedLeagueCountry} • ` : ''}${availableLeagueTeams.length} équipes référencées`
                  : 'Choisissez un championnat ci-dessus'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.activeLeagueChangeBtn}
              onPress={() => {
                setPickerMode('competition');
                setPickerModalVisible(true);
              }}
            >
              <Text style={styles.activeLeagueChangeBtnText}>Changer</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Hiérarchie Directe : ÉQUIPES DU CHAMPIONNAT ACTIF */}
          <View style={styles.leagueTeamsContainer}>
            <View style={styles.leagueTeamsHeader}>
              <View>
                <Text style={styles.subCategoryTitle}>2. Équipes du championnat</Text>
                <Text style={styles.slotHintText}>
                  Slot actif :{' '}
                  <Text style={{ fontWeight: '800', color: activeSlot === 'home' ? Colors.primaryAccent : '#EA580C' }}>
                    {activeSlot === 'home' ? '🏠 Domicile (1)' : '✈️ Extérieur (2)'}
                  </Text>{' '}
                  (cliquez sur une équipe pour l'attribuer)
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addTeamSmallBtn}
                onPress={() => setCreateTeamModalVisible(true)}
              >
                <Ionicons name="add" size={14} color={Colors.primary} />
                <Text style={styles.addTeamSmallBtnText}>+ Équipe</Text>
              </TouchableOpacity>
            </View>

            {loadingTeams && (
              <View style={styles.teamsLoadingRow}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.teamsLoadingText}>Chargement des équipes du championnat...</Text>
              </View>
            )}

            {/* Grille / Puces des Équipes de ce Championnat */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {availableLeagueTeams.map((team) => {
                const isHome = homeTeam.toLowerCase() === team.name.toLowerCase();
                const isAway = awayTeam.toLowerCase() === team.name.toLowerCase();
                const isAssigned = isHome || isAway;

                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[
                      styles.teamQuickChip,
                      isHome && styles.teamQuickChipHome,
                      isAway && styles.teamQuickChipAway,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleAssignTeam(team)}
                  >
                    <TeamLogo teamName={team.name} logoUrl={team.logo} size={24} />
                    <Text
                      style={[
                        styles.teamQuickChipText,
                        isHome && styles.teamQuickChipTextHome,
                        isAway && styles.teamQuickChipTextAway,
                      ]}
                      numberOfLines={1}
                    >
                      {team.name}
                    </Text>
                    {isHome && (
                      <View style={styles.teamChipBadgeHome}>
                        <Text style={styles.teamChipBadgeText}>DOM</Text>
                      </View>
                    )}
                    {isAway && (
                      <View style={styles.teamChipBadgeAway}>
                        <Text style={styles.teamChipBadgeText}>EXT</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {availableLeagueTeams.length === 0 && !loadingTeams && (
                <View style={styles.noTeamsNotice}>
                  <Text style={styles.noTeamsText}>
                    {selectedLeague
                      ? 'Aucune équipe trouvée dans ce championnat.'
                      : 'Sélectionnez un championnat pour afficher ses équipes.'}
                  </Text>
                  <TouchableOpacity
                    style={styles.noTeamsAddBtn}
                    onPress={() => setCreateTeamModalVisible(true)}
                  >
                    <Text style={styles.noTeamsAddBtnText}>+ Ajouter une équipe</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>

          {/* 3. CONFRONTATION MATCHUP (DOMICILE VS EXTÉRIEUR) */}
          <View style={styles.matchupBlock}>
            <View style={styles.teamsHeaderRow}>
              <Text style={styles.subCategoryTitle}>3. Confrontation du match</Text>
              <TouchableOpacity
                onPress={() => setIsManualEntry(!isManualEntry)}
                style={styles.toggleManualBtn}
              >
                <Text style={styles.toggleManualText}>
                  {isManualEntry ? '📋 Utiliser le catalogue' : '✍️ Saisie manuelle'}
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
                <TouchableOpacity onPress={handleSwapTeams} style={styles.swapBadgeButton}>
                  <Text style={styles.vsBadgeText}>⇄ VS</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.teamInput, { textAlign: 'right' }]}
                  value={awayTeam}
                  onChangeText={setAwayTeam}
                  placeholder="Équipe Extérieur"
                />
              </View>
            ) : (
              <View style={styles.matchupPickersRow}>
                {/* Sélecteur Domicile */}
                <TouchableOpacity
                  style={[
                    styles.matchupSlotCard,
                    activeSlot === 'home' && styles.matchupSlotCardActiveHome,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setActiveSlot('home')}
                >
                  <View style={styles.slotBadgeHome}>
                    <Text style={styles.slotBadgeText}>1 • DOMICILE</Text>
                  </View>
                  <View style={styles.slotLogoWrap}>
                    {homeTeam ? (
                      <TeamLogo teamName={homeTeam} logoUrl={homeTeamLogo} size={36} />
                    ) : (
                      <Ionicons name="shield-outline" size={24} color={Colors.primary} />
                    )}
                  </View>
                  <Text style={styles.slotTeamName} numberOfLines={1}>
                    {homeTeam || 'Choisir...'}
                  </Text>
                  <TouchableOpacity
                    style={styles.slotActionBtn}
                    onPress={() => {
                      setPickerMode('team');
                      setPickingTarget('home');
                      setPickerModalVisible(true);
                    }}
                  >
                    <Ionicons name="search" size={12} color={Colors.primary} />
                    <Text style={styles.slotActionBtnText}>Changer</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Bouton Central d'Inversion VS */}
                <TouchableOpacity
                  style={styles.vsSwapCircle}
                  activeOpacity={0.7}
                  onPress={handleSwapTeams}
                >
                  <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
                  <Text style={styles.vsSwapText}>VS</Text>
                </TouchableOpacity>

                {/* Sélecteur Extérieur */}
                <TouchableOpacity
                  style={[
                    styles.matchupSlotCard,
                    activeSlot === 'away' && styles.matchupSlotCardActiveAway,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setActiveSlot('away')}
                >
                  <View style={styles.slotBadgeAway}>
                    <Text style={styles.slotBadgeText}>2 • EXTÉRIEUR</Text>
                  </View>
                  <View style={styles.slotLogoWrap}>
                    {awayTeam ? (
                      <TeamLogo teamName={awayTeam} logoUrl={awayTeamLogo} size={36} />
                    ) : (
                      <Ionicons name="shield-outline" size={24} color="#EA580C" />
                    )}
                  </View>
                  <Text style={styles.slotTeamName} numberOfLines={1}>
                    {awayTeam || 'Choisir...'}
                  </Text>
                  <TouchableOpacity
                    style={styles.slotActionBtn}
                    onPress={() => {
                      setPickerMode('team');
                      setPickingTarget('away');
                      setPickerModalVisible(true);
                    }}
                  >
                    <Ionicons name="search" size={12} color="#EA580C" />
                    <Text style={[styles.slotActionBtnText, { color: '#EA580C' }]}>Changer</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 4. Suggestions de Pronostics Intelligents en 1 Clic */}
          {Boolean(homeTeam && awayTeam) && (
            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.subCategoryTitle}>4. Pronostics rapides suggérés</Text>
                <View style={styles.quickPredCountBadge}>
                  <Text style={styles.quickPredCountText}>{smartPredictions.length} cotes</Text>
                </View>
              </View>

              {/* Sélecteur de période : Temps réglementaire | 1ère mi-temps | 2ème mi-temps */}
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                {[
                  { id: 'regular' as const, label: 'Temps réglementaire' },
                  { id: 'first_half' as const, label: '1ère mi-temps' },
                  { id: 'second_half' as const, label: '2ème mi-temps' },
                ].map((pt) => {
                  const active = predictionPeriod === pt.id;
                  return (
                    <TouchableOpacity
                      key={pt.id}
                      style={[
                        styles.quickPredFilterPill,
                        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7 },
                        active && { backgroundColor: '#D98218', borderColor: '#D98218' },
                      ]}
                      onPress={() => setPredictionPeriod(pt.id)}
                    >
                      <Text
                        style={[
                          styles.quickPredFilterPillText,
                          active && { color: '#FFFFFF', fontWeight: '700' },
                        ]}
                        numberOfLines={1}
                      >
                        {pt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Filtres par type dans les pronostics rapides */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickPredFilterRow}
              >
                {[
                  { id: 'Tous', label: 'Tous' },
                  { id: '1X2', label: '1X2' },
                  { id: 'Mi-temps', label: '⏱️ Mi-temps' },
                  { id: 'Total', label: 'Total' },
                  { id: 'Double chance', label: 'Double chance' },
                  { id: 'Buts', label: 'Buts & BTTS' },
                  { id: 'Total pair', label: 'Total pair' },
                  { id: 'Handicap', label: 'Handicap' },
                  { id: 'Score', label: '🎯 Score exact' },
                ].map((ft) => (
                  <TouchableOpacity
                    key={ft.id}
                    style={[
                      styles.quickPredFilterPill,
                      quickPredFilter === ft.id && styles.quickPredFilterPillActive,
                      ft.id === 'Score' && styles.quickPredFilterPillScore,
                    ]}
                    onPress={() => setQuickPredFilter(ft.id as any)}
                  >
                    <Text
                      style={[
                        styles.quickPredFilterPillText,
                        quickPredFilter === ft.id && styles.quickPredFilterPillTextActive,
                      ]}
                    >
                      {ft.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Liste horizontale des puces rapides avec Score Exact directement intégré */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 4 }}>
                {smartPredictions.map((pred) => {
                  const isSelected = selectedPredKey === pred.key || selectedOptionLabel === pred.label;
                  const isScore = pred.category === 'Score';

                  return (
                    <TouchableOpacity
                      key={pred.key}
                      style={[
                        styles.smartPredChip,
                        isScore && styles.smartPredChipScore,
                        isSelected && styles.smartPredChipActive,
                      ]}
                      onPress={() => handleSelectQuickPrediction(pred)}
                    >
                      {isScore && (
                        <MaterialCommunityIcons
                          name="scoreboard-outline"
                          size={13}
                          color={isSelected ? Colors.primaryAccent : '#64748B'}
                          style={{ marginRight: 2 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.smartPredLabel,
                          isSelected && styles.smartPredLabelActive,
                        ]}
                      >
                        {pred.label}
                      </Text>
                      <View style={[styles.smartPredOddBadge, isSelected && styles.smartPredOddBadgeActive]}>
                        <Text style={[styles.smartPredOddText, isSelected && styles.smartPredOddTextActive]}>
                          {pred.odd}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Score exact */}
              <View style={styles.exactScoreBox}>
                <View style={styles.exactScoreHeader}>
                  <MaterialCommunityIcons name="scoreboard-outline" size={16} color={Colors.primary} />
                  <Text style={styles.exactScoreTitle}>Score exact</Text>
                </View>

                {/* Scores fréquents groupés : Victoire Domicile / Nul / Victoire Extérieur */}
                {EXACT_SCORE_GROUPS.map((group) => (
                  <View key={group.key} style={styles.exactGroupRow}>
                    <Text style={[styles.exactGroupLabel, { color: group.color }]} numberOfLines={1}>
                      {group.key === '1' ? homeTeam : group.key === '2' ? awayTeam : 'Nul'}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                      {group.scores.map(([h, a]) => {
                        const chipKey = `cs-${h}-${a}`;
                        const label = exactScoreLabel(h, a);
                        const isActive = selectedPredKey === chipKey || selectedOptionLabel === label;
                        return (
                          <TouchableOpacity
                            key={`${h}-${a}`}
                            style={[
                              styles.exactScoreChip,
                              isActive && { borderColor: group.color, backgroundColor: group.bg },
                            ]}
                            onPress={() => applyExactScore(h, a)}
                          >
                            <Text style={[styles.exactScoreChipScore, isActive && { color: group.color }]}>
                              {h} - {a}
                            </Text>
                            <Text style={styles.exactScoreChipOdd}>{estimateExactScoreOdd(h, a)}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ))}

                {/* Score personnalisé */}
                <View style={styles.exactCustomRow}>
                  <View style={styles.exactStepperCol}>
                    <Text style={styles.exactStepperTeam} numberOfLines={1}>{homeTeam}</Text>
                    <View style={styles.exactStepper}>
                      <TouchableOpacity
                        style={styles.exactStepBtn}
                        onPress={() => {
                          const nextH = Math.max(0, exactHome - 1);
                          setExactHome(nextH);
                          applyExactScore(nextH, exactAway);
                        }}
                      >
                        <Ionicons name="remove" size={16} color={Colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.exactStepValue}>{exactHome}</Text>
                      <TouchableOpacity
                        style={styles.exactStepBtn}
                        onPress={() => {
                          const nextH = Math.min(15, exactHome + 1);
                          setExactHome(nextH);
                          applyExactScore(nextH, exactAway);
                        }}
                      >
                        <Ionicons name="add" size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.exactDash}>–</Text>

                  <View style={styles.exactStepperCol}>
                    <Text style={styles.exactStepperTeam} numberOfLines={1}>{awayTeam}</Text>
                    <View style={styles.exactStepper}>
                      <TouchableOpacity
                        style={styles.exactStepBtn}
                        onPress={() => {
                          const nextA = Math.max(0, exactAway - 1);
                          setExactAway(nextA);
                          applyExactScore(exactHome, nextA);
                        }}
                      >
                        <Ionicons name="remove" size={16} color="#EA580C" />
                      </TouchableOpacity>
                      <Text style={styles.exactStepValue}>{exactAway}</Text>
                      <TouchableOpacity
                        style={styles.exactStepBtn}
                        onPress={() => {
                          const nextA = Math.min(15, exactAway + 1);
                          setExactAway(nextA);
                          applyExactScore(exactHome, nextA);
                        }}
                      >
                        <Ionicons name="add" size={16} color="#EA580C" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.exactApplyBtn}
                    onPress={() => applyExactScore(exactHome, exactAway)}
                  >
                    <Text style={styles.exactApplyText}>Appliquer</Text>
                    <Text style={styles.exactApplyOdd}>@ {estimateExactScoreOdd(exactHome, exactAway)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 5. Choix / Édition du Pronostic & Cote */}
          <View style={styles.predHeaderRow}>
            <Text style={styles.subCategoryTitle}>5. Intitulé du pronostic personnalisé</Text>
            {selectedPredKey !== 'custom' && Boolean(selectedOptionLabel) ? (
              <View style={styles.syncedBadge}>
                <Ionicons name="sparkles" size={11} color="#059669" />
                <Text style={styles.syncedBadgeText}>Adapté au pronostic rapide</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.reSyncBtn}
                onPress={() => {
                  if (homeTeam) {
                    setSelectedPredKey('1');
                    setSelectedOptionLabel(getPeriodPrefix(predictionPeriod, '1X2. V1'));
                    setOdd('1.85');
                  }
                }}
              >
                <Ionicons name="sync-outline" size={12} color={Colors.primary} />
                <Text style={styles.reSyncBtnText}>Réadapter à la suggestion</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={selectedOptionLabel}
            onChangeText={(text) => {
              setSelectedOptionLabel(text);
              const matched = allSmartPredictions.find(
                (p) => p.label.trim().toLowerCase() === text.trim().toLowerCase()
              );
              if (matched) {
                setSelectedPredKey(matched.key);
                setOdd(matched.odd);
              } else {
                setSelectedPredKey('custom');
              }
            }}
            placeholder="Ex: 1X2. V1 ou Total. (2.5) Plus de"
          />

          <View style={styles.oddRowWrap}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Cote du pari</Text>
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

          {/* Bouton Ajouter l'Événement */}
          <TouchableOpacity style={styles.addBtn} onPress={handleAddEvent}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Ajouter l'événement au coupon</Text>
          </TouchableOpacity>
        </View>

        {/* Section 3 : ÉVÉNEMENTS DU COUPON (Liste) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>ÉVÉNEMENTS DU TICKET ({addedEvents.length})</Text>
          {addedEvents.length === 0 ? (
            <Text style={styles.emptyNote}>
              Aucun match ajouté. Cliquez sur « Ajouter l'événement » ci-dessus ou importez un match en direct.
            </Text>
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
                <Text style={styles.addedOdd}>{formatCleanOdds(ev.odd)}</Text>
                <TouchableOpacity style={{ padding: 6 }} onPress={() => handleRemoveEvent(ev.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Section 4 : MISE ET RÉSUMÉ */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>MISE ET RÉSUMÉ DU TICKET</Text>
          <Text style={styles.fieldLabel}>Mise virtuelle (₣)</Text>
          <TextInput
            style={[styles.input, { fontWeight: '700', fontSize: 16 }]}
            value={stake}
            onChangeText={setStake}
            keyboardType="numeric"
          />

          {/* Checkbox Cashout */}
          <TouchableOpacity
            style={[styles.checkboxRow, { marginTop: 12 }]}
            onPress={() => setEnableCashout(!enableCashout)}
          >
            <Ionicons
              name={enableCashout ? 'checkbox' : 'square-outline'}
              size={20}
              color={enableCashout ? Colors.primaryAccent : Colors.textSubtle}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.checkboxLabel}>Activer la vente immédiate (cashout)</Text>
              <Text style={styles.helperText}>Affiche un bouton « Vendre pour X ₣ » sur le coupon.</Text>
            </View>
          </TouchableOpacity>

          {enableCashout && (
            <View style={{ marginTop: 8 }}>
              <Text style={[styles.helperText, { marginTop: 0, marginBottom: 4 }]}>
                Montant « Vendre pour X ₣ » (optionnel, ex: {Math.round(numericStake * 0.94)} ₣ par défaut)
              </Text>
              <TextInput
                style={styles.input}
                placeholder={`Ex: ${Math.round(numericStake * 0.94)}`}
                value={customCashoutAmount}
                onChangeText={setCustomCashoutAmount}
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Encart Statistiques */}
          <View style={styles.statBox}>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>Événements :</Text>
              <Text style={styles.statVal}>{addedEvents.length}</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>Cote totale :</Text>
              <Text style={styles.statVal}>{addedEvents.length > 0 ? formatCleanOdds(totalOdds) : '-'}</Text>
            </View>
            <View style={styles.statLine}>
              <Text style={styles.statLabel}>Gains potentiels :</Text>
              <Text style={[styles.statVal, { color: Colors.success, fontWeight: '800' }]}>
                {addedEvents.length > 0 ? `${potentialPayout.toLocaleString('fr-FR')} ₣` : '-'}
              </Text>
            </View>
          </View>

          <Text style={styles.dateAutoText}>
            Mise du coupon : {placedDate} ({placedTime}) • Début match : {matchDate} ({matchTime})
          </Text>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCoupon}>
            <Text style={styles.saveBtnText}>Sauvegarder le coupon</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sélecteur Visuel Modal pour Championnats et Équipes */}
      <SportsPickerModal
        visible={pickerModalVisible}
        mode={pickerMode}
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
          if ((comp as any).country) setSelectedLeagueCountry((comp as any).country);
          fetchTeamsByLeague(comp.name);
        }}
        onSelectTeam={(team, comp) => {
          const teamLogo = (team as any).badge || team.logo || resolveTeamLogo(team.name) || '';
          if (pickingTarget === 'home') {
            setHomeTeam(team.name);
            setHomeTeamLogo(teamLogo);
            setActiveSlot('away');
          } else {
            setAwayTeam(team.name);
            setAwayTeamLogo(teamLogo);
          }

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

      {/* Modale : Créer un Championnat Personnalisé */}
      <Modal
        visible={createLeagueModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateLeagueModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Créer un Championnat</Text>
              <TouchableOpacity onPress={() => setCreateLeagueModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Nom du championnat</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Tournoi Inter-Quartiers 2026"
              value={newLeagueName}
              onChangeText={setNewLeagueName}
            />

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Pays ou Territoire</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: France, Cameroun, Global..."
              value={newLeagueCountry}
              onChangeText={setNewLeagueCountry}
            />

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Discipline sportive</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
              {['Football', 'FIFA', 'Cyber-Sport', 'Basketball'].map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[styles.smallPill, newLeagueSport === sp && styles.smallPillActive]}
                  onPress={() => setNewLeagueSport(sp)}
                >
                  <Text style={[styles.smallPillText, newLeagueSport === sp && styles.smallPillTextActive]}>
                    {sp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveCustomLeague}>
              <Text style={styles.modalSubmitBtnText}>Créer et Sélectionner</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modale : Créer une Équipe Personnalisée */}
      <Modal
        visible={createTeamModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateTeamModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter une Équipe</Text>
              <TouchableOpacity onPress={() => setCreateTeamModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              Cette équipe sera attachée au championnat :{' '}
              <Text style={{ fontWeight: '800', color: Colors.primary }}>{selectedLeague}</Text>
            </Text>

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Nom de l'équipe</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: FC Étoile Bleue"
              value={newTeamName}
              onChangeText={setNewTeamName}
            />

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Code court (3-4 lettres)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: ETB"
              value={newTeamShort}
              onChangeText={setNewTeamShort}
              maxLength={4}
              autoCapitalize="characters"
            />

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Logo URL (Optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://... (vide = blason automatique)"
              value={newTeamLogo}
              onChangeText={setNewTeamLogo}
            />

            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSaveCustomTeam}>
              <Text style={styles.modalSubmitBtnText}>Ajouter l'Équipe au Championnat</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollArea: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 120,
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
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  apiFootballCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  apiFootballIconWrap: {
    width: 34,
    height: 34,
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
    fontSize: 8.5,
    fontWeight: '900',
  },
  apiFootballCardSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
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
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  helperText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subCategoryTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  newLeagueTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  newLeagueTopBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  categoryTabsWrap: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  categoryTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTabIcon: {
    fontSize: 13,
  },
  categoryTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  leagueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  leagueChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primaryAccent,
  },
  leagueChipLogo: {
    width: 26,
    height: 26,
    borderRadius: 4,
  },
  leagueChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  leagueChipNameActive: {
    color: Colors.primaryAccent,
  },
  leagueChipCountry: {
    fontSize: 9.5,
    color: Colors.textMuted,
  },
  chipNewBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  chipNewText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  addCustomLeagueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    gap: 4,
  },
  addCustomLeagueChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  fullCatalogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  fullCatalogBtnText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  activeLeagueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 10,
    marginBottom: 10,
  },
  activeLeagueLogo: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  activeLeagueTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0369A1',
  },
  activeLeagueMeta: {
    fontSize: 10.5,
    color: '#0284C7',
    fontWeight: '500',
    marginTop: 1,
  },
  activeLeagueChangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  activeLeagueChangeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  leagueTeamsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  leagueTeamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  slotHintText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  addTeamSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  addTeamSmallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  teamsLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  teamsLoadingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  teamQuickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  teamQuickChipHome: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  teamQuickChipAway: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  teamQuickChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  teamQuickChipTextHome: {
    color: '#2563EB',
  },
  teamQuickChipTextAway: {
    color: '#EA580C',
  },
  teamChipBadgeHome: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  teamChipBadgeAway: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  teamChipBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  noTeamsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  noTeamsText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  noTeamsAddBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
  },
  noTeamsAddBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  matchupBlock: {
    marginTop: 4,
  },
  teamsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  teamsRowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 6,
    gap: 6,
  },
  teamInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 8,
  },
  swapBadgeButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  matchupPickersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchupSlotCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 10,
    position: 'relative',
  },
  matchupSlotCardActiveHome: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  matchupSlotCardActiveAway: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  slotBadgeHome: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  slotBadgeAway: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  slotBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  slotLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotTeamName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  slotActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  slotActionBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  vsSwapCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  vsSwapText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    marginTop: -2,
  },
  smartPredChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  smartPredChipScore: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  quickPredCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quickPredCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryAccent,
  },
  quickPredFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  quickPredFilterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickPredFilterPillScore: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  quickPredFilterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickPredFilterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  quickPredFilterPillTextActive: {
    color: '#FFFFFF',
  },
  smartPredOddBadgeActive: {
    backgroundColor: Colors.primary,
  },
  smartPredOddTextActive: {
    color: '#FFFFFF',
  },
  smartPredChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primaryAccent,
  },
  smartPredLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  smartPredLabelActive: {
    color: Colors.primaryAccent,
    fontWeight: '800',
  },
  smartPredOddBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  smartPredOddText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  predHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 4,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  reSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  reSyncBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.primary,
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
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '800',
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
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
    fontSize: 12,
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
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 11.5,
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
    marginVertical: 8,
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
  exactScoreBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
  },
  exactScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  exactScoreTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  exactGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  exactGroupLabel: {
    width: 64,
    fontSize: 10.5,
    fontWeight: '800',
  },
  exactScoreChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 52,
  },
  exactScoreChipScore: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  exactScoreChipOdd: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  exactCustomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  exactStepperCol: {
    flex: 1,
    alignItems: 'center',
  },
  exactStepperTeam: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 3,
  },
  exactStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exactStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  exactStepValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  exactDash: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textSubtle,
    paddingBottom: 6,
  },
  exactApplyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  exactApplyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  exactApplyOdd: {
    color: '#C7D2FE',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  smallPillActive: {
    backgroundColor: Colors.primary,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  smallPillTextActive: {
    color: '#FFFFFF',
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
  },
});
