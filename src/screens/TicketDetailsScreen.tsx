import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getHeaderBgColor,
  getScreenBgColor,
  getStatusBarStyleForTheme,
} from '../theme/themes';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { BackArrowIcon } from '../components/common/BackArrowIcon';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

// Stores & types
import { useBetStore } from '../store/useBetStore';
import { useCouponStore } from '../store/couponStore';
import { useThemeStore } from '../stores/themeStore';
import { BetSlip, MatchEvent } from '../types/bet';
import { resolveMatchNavigationTarget } from '../data/mockData';
import { resolveTeamLogo } from '../data/sportsCatalog';
import {
  adaptEventResultToPrediction,
  normalizeBetSelectionLabel,
  computeAdaptiveLiveScore,
  ensureTwoHalvesScoreFormat,
} from '../utils/scoreAdapter';
import { TeamLogo } from '../components/common/TeamLogo';
import {
  ASSET_ICONS,
  OfficialBellIcon,
  OfficialLayersIcon,
  OfficialThreeDotsIcon,
} from './history/HistoryListScreen';
import {
  formatBetDate,
  formatFrenchEventDate,
  formatFootballHeader,
  getEventLiveProgress,
  formatSecondsToMMSS,
} from '../utils/dateFormatter';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { renderCardsWithSuits, generateWinningPokerDraw } from '../utils/pokerGenerator';
import { PokerFormattedLine } from '../components/poker/PokerSuit3DIcon';
import { ScoreEditorModal } from '../components/ScoreEditorModal';

// ============================================================================
// Types
// ============================================================================
// Helper de formatage de devise (symbole ₣ en conservant la décimale utile si présente, ex: 777.6 ₣, 90 ₣)
const formatCurrency = (val: number | string | undefined): string => {
  if (val === undefined || val === null) return '0 ₣';
  const num =
    typeof val === 'number'
      ? val
      : parseFloat(String(val).replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return `${val} ₣`;
  const rounded = Math.round(num * 100) / 100;
  const [intPart, decPart] = rounded.toFixed(2).split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (!decPart || decPart === '00') {
    return `${formattedInt} ₣`;
  }
  const trimmedDec = decPart.replace(/0+$/, '');
  return `${formattedInt}.${trimmedDec} ₣`;
};

// Helper de formatage de date spécifique Poker (ex: 30 oct. 2026 (22:30))
const formatPokerEventDate = (dateStr?: string): string => {
  if (!dateStr) return '30 oct. 2026 (22:30)';
  if (
    dateStr.includes('oct.') ||
    dateStr.includes('nov.') ||
    dateStr.includes('déc.') ||
    dateStr.includes('janv.') ||
    dateStr.includes('févr.') ||
    dateStr.includes('mars.') ||
    dateStr.includes('avr.') ||
    dateStr.includes('mai') ||
    dateStr.includes('juin') ||
    dateStr.includes('juil.') ||
    dateStr.includes('août') ||
    dateStr.includes('sept.')
  ) {
    return dateStr;
  }
  const m = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s*\(?(\d{2}:\d{2})\)?)?/);
  if (m) {
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const monthIdx = parseInt(m[2], 10) - 1;
    const monthName = months[monthIdx] || 'oct.';
    const time = m[4] ? ` (${m[4]})` : '';
    return `${m[1]} ${monthName} ${m[3]}${time}`;
  }
  return dateStr;
};

export interface BetDetailEvent {
  id?: string;
  matchId?: string;
  sport?: string;
  league: string;
  date: string;
  rawDate?: any;
  startDate?: any;
  matchDate?: string;
  matchTime?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  scoreFinal?: string;
  scoreDetail?: string;
  market: string;
  odd: string;
  status: 'Accepté' | 'Gain' | 'Perte' | 'Payé' | 'Perdu' | 'en_cours' | 'gagne' | 'perdu';
  isOutright?: boolean;
  outrightTitle?: string;
  isPoker?: boolean;
  isFifa?: boolean;
  isBonus?: boolean;
  isLive?: boolean;
  durationSeconds?: number;
  elapsedSeconds?: number;
  badge?: string;
  roundCode?: string;
  drawNumber?: string;
  pokerDraw?: {
    board?: string;
    hands?: Array<{ id: number; cards: string }>;
    winnerLabel?: string;
  };
}

// Icône vectorielle Bonus (Cadeau avec 3 étoiles au-dessus, identique à video_gagnant.mp4)
const BonusGiftIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#6E849B',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Étoile centrale */}
    <Path
      d="M12 2L12.9 3.9L15 4.2L13.5 5.6L13.9 7.6L12 6.6L10.1 7.6L10.5 5.6L9 4.2L11.1 3.9L12 2Z"
      fill={color}
    />
    {/* Étoile gauche */}
    <Path
      d="M6 4.5L6.6 5.8L8 6L7 7L7.2 8.4L6 7.7L4.8 8.4L5 7L4 6L5.4 5.8L6 4.5Z"
      fill={color}
    />
    {/* Étoile droite */}
    <Path
      d="M18 4.5L18.6 5.8L20 6L19 7L19.2 8.4L18 7.7L16.8 8.4L17 7L16 6L17.4 5.8L18 4.5Z"
      fill={color}
    />
    {/* Couvercle de la boîte */}
    <Rect x="3" y="9.5" width="18" height="3.2" rx="1" fill={color} />
    {/* Corps de la boîte (coupé au centre par le ruban) */}
    <Path
      d="M4.5 14H10.8V20.5H6C5.17 20.5 4.5 19.83 4.5 19V14ZM13.2 14H19.5V19C19.5 19.83 18.83 20.5 18 20.5H13.2V14Z"
      fill={color}
    />
  </Svg>
);

export interface Props {
  route?: any;
  navigation?: any;
  ticket?: any;
  onBack?: () => void;
  onMore?: () => void;
}

// ============================================================================
// Composant Principal : TicketDetailsScreen
// ============================================================================
export default function TicketDetailsScreen({
  route,
  navigation: propNavigation,
  ticket: propTicket,
  onBack,
  onMore,
}: Props) {
  const nav = useNavigation<any>();
  const navigation = propNavigation || nav;
  const insets = useSafeAreaInsets();
  const { currentTheme } = useThemeStore();
  const isDark = Boolean(currentTheme?.isDark);

  const {
    coupons,
    executeCashout,
    duplicateCoupon,
    updateCouponStatus,
    validateCouponWithResult,
  } = useBetStore();
  const { duplicateFromCoupon } = useCouponStore();

  // Scroll tracking pour le repli fluide de l'en-tête
  const scrollY = useRef(new Animated.Value(0)).current;

  // 1. Résolution dynamique du coupon (priorité au store réactif pour refléter immédiatement la validation/saisie de scores)
  const couponId = route?.params?.couponId || route?.params?.ticketId || route?.params?.id;
  const passedCoupon = route?.params?.coupon || route?.params?.ticket || propTicket;
  const [isScoreModalVisible, setIsScoreModalVisible] = useState(false);
  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);

  // Horloge temps réel pour la progression dynamique des événements EN DIRECT (suspendue quand une modale est ouverte pour ne pas perturber la saisie)
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    if (isScoreModalVisible || isMoreModalVisible) return;
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isScoreModalVisible, isMoreModalVisible]);

  const currentCoupon: BetSlip = useMemo(() => {
    const targetId = couponId || passedCoupon?.id || (passedCoupon as any)?.ticketNumber;
    if (targetId) {
      const found = coupons.find(
        (c) =>
          String(c.id) === String(targetId) ||
          String((c as any).ticketNumber) === String(targetId)
      );
      if (found) return found;
    }
    if (passedCoupon && (passedCoupon.id || (passedCoupon as any).ticketNumber)) {
      return passedCoupon;
    }
    return coupons[0] || ({} as BetSlip);
  }, [coupons, couponId, passedCoupon]);

  // Statuts normalisés
  const rawStatus = String(currentCoupon?.status || 'Accepté');
  const isPaid =
    rawStatus === 'Payé' ||
    rawStatus === 'Gagné' ||
    rawStatus === 'Gain' ||
    rawStatus.toLowerCase() === 'paid';
  const isLost = rawStatus === 'Perdu' || rawStatus.toLowerCase() === 'lost';
  const isAccepted = !isPaid && !isLost;

  const isMelbet = String(currentTheme?.name || '').toLowerCase().includes('melbet');

  // Couleurs dynamiques selon le thème actif (Correction 2 : Unification de SUCCESS_GREEN = '#4EBA6F')
  const SUCCESS_GREEN = '#4EBA6F';
  const primaryActionColor = isDark
    ? '#9BA3AE'
    : (currentTheme?.activeIcon || currentTheme?.primary || '#557089');
  const payeColor = SUCCESS_GREEN;
  const accepteColor = isMelbet
    ? '#D89228'
    : (currentTheme?.status?.accepte || '#4A83C4');
  const perduColor = currentTheme?.status?.perdu || '#E74C3C';

  // Détection Poker pour le coupon global
  const isPokerCoupon =
    currentCoupon?.gameCategory === 'poker' ||
    String(currentCoupon?.sport || '').toUpperCase().includes('POKER') ||
    String(currentCoupon?.league || '').toUpperCase().includes('POKER') ||
    currentCoupon?.badge === 'POKE' ||
    currentCoupon?.events?.some(
      (e) =>
        e.gameCategory === 'poker' ||
        String(e.sport || '').toUpperCase().includes('POKER') ||
        String(e.league || '').toUpperCase().includes('POKER')
    );

  // Détection FIFA pour le coupon global
  const isFifaCoupon =
    !isPokerCoupon &&
    (String(currentCoupon?.sport || '').toUpperCase().includes('FIFA') ||
      String(currentCoupon?.league || '').toUpperCase().includes('FIFA') ||
      String(currentCoupon?.league || '').toUpperCase().includes('FC 2') ||
      String(currentCoupon?.league || '').toUpperCase().includes('5X5 RUSH') ||
      Boolean(
        currentCoupon?.events?.some((e: any) => {
          const sUp = String(e?.sport || '').toUpperCase();
          const lUp = String(e?.league || '').toUpperCase();
          return (
            Boolean(e?.isFifa) ||
            sUp.includes('FIFA') ||
            lUp.includes('FIFA') ||
            lUp.includes('FC 24') ||
            lUp.includes('FC 25') ||
            lUp.includes('FC 26') ||
            lUp.includes('5X5 RUSH') ||
            lUp.includes('3X3') ||
            lUp.includes('4X4')
          );
        })
      ));

  const isLive = Boolean(currentCoupon?.isLive || (isPokerCoupon && isAccepted) || (isFifaCoupon && isAccepted));
  const statusLabel = isPaid ? 'Payé' : isLost ? 'Perdu' : 'Accepté';
  const statusColor = isPaid
    ? payeColor
    : isLost
    ? perduColor
    : accepteColor;

  // Formatage du type
  const isCombine =
    (currentCoupon?.events && currentCoupon.events.length > 1) ||
    (currentCoupon?.eventsCount && currentCoupon.eventsCount > 1) ||
    currentCoupon?.type === 'Combiné' ||
    String(currentCoupon?.type || '').toLowerCase().includes('combin');
  const typeLabel = isCombine ? 'Combiné' : 'Simple';

  // Ligues / Badges
  const leagueBadge =
    currentCoupon?.league ||
    currentCoupon?.badge ||
    (isPokerCoupon ? 'POKER' : currentCoupon?.events?.[0]?.league?.split('.')?.pop()?.trim()) ||
    'LaLiga';

  // Événements normalisés
  const events: BetDetailEvent[] = useMemo(() => {
    const rawEvents: MatchEvent[] = currentCoupon?.events || [];
    if (rawEvents.length === 0) {
      return [
        {
          id: 'ev-1',
          matchId: 'match-vil-esp',
          sport: 'Football',
          league: formatFootballHeader('Football', currentCoupon?.league || 'Angleterre. Premier League'),
          date: currentCoupon?.matchTime
            ? formatFrenchEventDate(currentCoupon.matchDate || '31.10.2026', currentCoupon.matchTime)
            : '31 oct. 2026 (21:00)',
          homeTeam: 'Villarreal',
          awayTeam: 'Espanyol',
          market: '1X2. V1',
          odd: formatCleanOdds(currentCoupon?.totalOdds || 1.41),
          status: isPaid ? 'Gain' : isLost ? 'Perte' : 'Accepté',
        },
      ];
    }

    return rawEvents.map((ev, idx) => {
      const homeName =
        typeof ev.homeTeam === 'string'
          ? ev.homeTeam
          : (ev.homeTeam as any)?.name || 'Équipe 1';
      const awayName =
        typeof ev.awayTeam === 'string'
          ? ev.awayTeam
          : (ev.awayTeam as any)?.name || 'Équipe 2';
      const rawHomeLogo =
        typeof ev.homeTeam === 'object' ? (ev.homeTeam as any)?.logo : undefined;
      const rawAwayLogo =
        typeof ev.awayTeam === 'object' ? (ev.awayTeam as any)?.logo : undefined;
      const homeLogo =
        resolveTeamLogo(homeName) ||
        (rawHomeLogo &&
        (rawHomeLogo.startsWith('http://') || rawHomeLogo.startsWith('https://')) &&
        !rawHomeLogo.includes('ui-avatars.com')
          ? rawHomeLogo
          : undefined) ||
        rawHomeLogo;
      const awayLogo =
        resolveTeamLogo(awayName) ||
        (rawAwayLogo &&
        (rawAwayLogo.startsWith('http://') || rawAwayLogo.startsWith('https://')) &&
        !rawAwayLogo.includes('ui-avatars.com')
          ? rawAwayLogo
          : undefined) ||
        rawAwayLogo;

      const evStatusRaw = String(ev.status || currentCoupon?.status || 'Accepté');
      const evPaid =
        evStatusRaw === 'Payé' ||
        evStatusRaw === 'Gagné' ||
        evStatusRaw === 'Gain' ||
        evStatusRaw.toLowerCase() === 'paid';
      const evLost = evStatusRaw === 'Perdu' || evStatusRaw.toLowerCase() === 'lost';
      const evStatus: BetDetailEvent['status'] = evPaid
        ? 'Gain'
        : evLost
        ? 'Perte'
        : 'Accepté';

      const sportUpper = String(ev.sport || currentCoupon?.sport || '').toUpperCase();
      const leagueUpper = String(ev.league || currentCoupon?.league || '').toUpperCase();
      const predStr = String(ev.prediction || '');

      const isBonus =
        sportUpper === 'BONUS' ||
        leagueUpper === 'BONUS' ||
        homeName.toUpperCase() === 'BONUS' ||
        predStr.toLowerCase().includes('bonus pari combin');

      const isPoker =
        !isBonus &&
        (ev.gameCategory === 'poker' ||
          currentCoupon?.gameCategory === 'poker' ||
          sportUpper.includes('POKER') ||
          leagueUpper.includes('POKER') ||
          ev.badge === 'POKE');

      const isFifa =
        !isBonus &&
        !isPoker &&
        (Boolean((ev as any).isFifa) ||
          sportUpper.includes('FIFA') ||
          leagueUpper.includes('FIFA') ||
          leagueUpper.includes('FC 24') ||
          leagueUpper.includes('FC 25') ||
          leagueUpper.includes('FC 26') ||
          leagueUpper.includes('5X5 RUSH') ||
          leagueUpper.includes('3X3') ||
          leagueUpper.includes('4X4') ||
          homeName.toUpperCase().includes('FIFA') ||
          awayName.toUpperCase().includes('FIFA'));

      // Détecter un pari de type vainqueur / outright (ex: Espagne Vainqueur)
      const leagueStr = String(ev.league || '');
      const isOutright =
        !isBonus &&
        !isPoker &&
        (leagueStr.toLowerCase().includes('vainqueur') ||
          leagueStr.toLowerCase().includes('winner') ||
          homeName.toLowerCase().includes('winner') ||
          (homeName === awayName && homeName.length > 0) ||
          !awayName ||
          awayName === 'Équipe 2');

      const outrightTitle = isOutright
        ? leagueStr.includes('La Liga')
          ? 'Spain. La Liga. 2026/27. Winner'
          : `${leagueStr}. Winner`
        : undefined;

      const formattedDate = formatFrenchEventDate(
        ev.matchDate || ev.date || ev.startDate || '31.10.2026',
        ev.matchTime
      );

      // Génération ou récupération des données du tirage Poker
      let pokerDrawData: BetDetailEvent['pokerDraw'] = undefined;
      const roundCode = (ev as any).roundCode || currentCoupon?.drawNumber || (currentCoupon as any)?.roundCode || 'PB232803';

      if (isPoker) {
        const pResult = (ev as any).pokerResult || currentCoupon?.pokerResult;
        if (pResult && pResult.hands && pResult.hands.length > 0) {
          pokerDrawData = {
            board: pResult.board,
            hands: pResult.hands.map((h: any, i: number) => ({
              id: h.id || i + 1,
              cards: h.cards,
            })),
            winnerLabel: pResult.winnerLabel || 'Main 1 (Une Paire)',
          };
        } else if (evPaid) {
          const gen = generateWinningPokerDraw(ev.prediction || 'Une Paire', ev.id || roundCode);
          pokerDrawData = {
            board: gen.table,
            hands: [
              { id: 1, cards: gen.hand1 },
              { id: 2, cards: gen.hand2 },
              { id: 3, cards: gen.hand3 },
              { id: 4, cards: gen.hand4 },
              { id: 5, cards: gen.hand5 },
              { id: 6, cards: gen.hand6 },
            ],
            winnerLabel: `Main ${gen.winnerHand} (${gen.combinationName})`,
          };
        }
      }

      const rawScoreFinal =
        (ev as any).scoreFinal || (ev as any).score || ev.finalScore || ev.actualScore;
      const rawScoreDetail = (ev as any).scoreDetail || ev.halftimeScore;

      const settledScores =
        !isPoker && !isBonus && !isOutright && (evPaid || evLost)
          ? ensureTwoHalvesScoreFormat({
              event: ev,
              rawScoreFinal,
              rawScoreDetail,
              isWin: evPaid,
            })
          : undefined;

      const resolvedScoreFinal = settledScores ? settledScores.scoreFinal : rawScoreFinal;
      const resolvedScoreDetail = settledScores ? settledScores.scoreDetail : rawScoreDetail;

      return {
        id: ev.id || `ev-${idx}`,
        matchId: (ev as any).matchId || ev.id || `match-${idx}`,
        sport: ev.sport || (isPoker ? 'TvBet. POKER' : isFifa ? 'FIFA' : 'Football'),
        league: isPoker
          ? (ev.league || 'TvBet. POKER')
          : isFifa
          ? (ev.league ? (ev.league.startsWith('FIFA') ? ev.league : `FIFA. ${ev.league}`) : 'FIFA. 5x5 Rush. Superligue')
          : formatFootballHeader(ev.sport, ev.league),
        date: formattedDate,
        rawDate: ev.date || (ev as any).rawDate,
        startDate: ev.startDate || (ev as any).startDate,
        matchDate: ev.matchDate,
        matchTime: ev.matchTime,
        homeTeam: homeName,
        awayTeam: awayName,
        homeLogo,
        awayLogo,
        scoreFinal: resolvedScoreFinal,
        scoreDetail: resolvedScoreDetail,
        market: isBonus || isPoker
          ? (ev.prediction || (isPoker ? 'Combinaison gagnante. Une Paire' : 'Bonus, Bonus pari combiné'))
          : normalizeBetSelectionLabel(ev.prediction, homeName, awayName),
        odd: formatCleanOdds(ev.odd || 1.41),
        status: evStatus,
        isOutright,
        outrightTitle,
        isPoker,
        isFifa,
        isBonus,
        isLive: Boolean((ev as any).isLive || isFifa || currentCoupon?.isLive),
        durationSeconds: (ev as any).durationSeconds ?? (ev as any).duration ?? (ev as any).matchDuration,
        elapsedSeconds: (ev as any).elapsedSeconds,
        hasCustomElapsed: Boolean((ev as any).hasCustomElapsed),
        liveStartedAt: (ev as any).liveStartedAt,
        badge: ev.badge || (ev as any).badge,
        roundCode,
        pokerDraw: pokerDrawData,
      };
    });
  }, [currentCoupon, isPaid, isLost]);

  // Nombre d'événements et terminés (ex: Événements : 4 | 3 sur 3 terminés lorsqu'il y a un Bonus)
  const hasBonusEvent = events.some((e) => e.isBonus);
  const nonBonusEvents = events.filter((e) => !e.isBonus);
  const totalEventsCount = currentCoupon?.eventsCount || events.length;
  const matchEventsTotal = hasBonusEvent
    ? Math.max(1, totalEventsCount - 1)
    : totalEventsCount;
  const completedEventsCount = Math.min(
    matchEventsTotal,
    currentCoupon?.completedCount ??
      nonBonusEvents.filter((e) => e.status === 'Gain' || e.status === 'Perte').length
  );

  // Insets et positionnement dynamique au-dessus de la PersistentBottomBar
  const bottomBarHeight =
    56 + (insets.bottom > 0 ? insets.bottom : Platform.OS === 'ios' ? 20 : 0);

  // Visibilité de la barre fixe "Vendre pour XXX ₣" ou "Dupliquer le coupon de pari"
  const showDuplicateFooter = isAccepted;
  const sellPriceNumber =
    (currentCoupon as any)?.sellPrice ||
    currentCoupon?.cashoutAmount ||
    Math.round(Number(currentCoupon?.stake || 500) * 0.94);
  const sellPriceFormatted = sellPriceNumber.toLocaleString('fr-FR');
  const showSellButton = Boolean(
    isAccepted &&
      !isPokerCoupon &&
      (currentCoupon?.isForSale ||
        currentCoupon?.isLive ||
        events.some((e) => e.isLive || e.isFifa))
  );

  // Mise et Gains formatés avec le symbole F (ex: 90 F, 522 F, 156.6 F comme sur les captures)
  const stakeFormatted = formatCurrency(currentCoupon?.stake ?? 90);
  const potentialPayoutFormatted = formatCurrency(currentCoupon?.potentialPayout ?? 522);
  const actualPayoutFormatted = formatCurrency(
    currentCoupon?.actualPayout ?? currentCoupon?.potentialPayout ?? 156.6
  );

  // Ticket date & numéro (affiche l'heure de mise du coupon en priorité)
  const ticketDate = currentCoupon?.createdAt
    ? formatBetDate(currentCoupon.createdAt)
    : currentCoupon?.matchTime && currentCoupon?.matchDate
    ? `${currentCoupon.matchDate} (${currentCoupon.matchTime})`
    : '29.10.2026 (22:23)';
  const ticketNumber = currentCoupon?.id || (currentCoupon as any)?.ticketNumber || '99755801725';

  // 2. Handlers d'action
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      try {
        navigation?.navigate?.('MainTabs', { screen: 'Historique' });
      } catch (e) {
        try {
          navigation?.navigate?.('Historique');
        } catch (err) {
          // Fallback no-op
        }
      }
    }
  };

  const handleDuplicate = () => {
    if (currentCoupon) {
      const rawEventsToCopy =
        currentCoupon.events && currentCoupon.events.length > 0
          ? currentCoupon.events.filter(
              (e) => String(e.sport || '').toUpperCase() !== 'BONUS'
            )
          : events
              .filter((ev) => !ev.isBonus)
              .map((ev, i) => ({
                id: `ev-dup-${Date.now()}-${i}`,
                sport: ev.sport || 'Football',
                league: ev.league || 'LaLiga',
                date: ev.date || '30.10.2026 (21:00)',
                homeTeam: { name: ev.homeTeam || 'Barcelone', logo: ev.homeLogo },
                awayTeam: { name: ev.awayTeam || 'Alavés', logo: ev.awayLogo },
                prediction: ev.market || '1X2. V1',
                odd: Number(ev.odd) || 1.4,
                status: 'Accepté' as const,
              }));

      duplicateCoupon(currentCoupon.id);
      duplicateFromCoupon({
        ...currentCoupon,
        events: rawEventsToCopy,
      });

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } catch {
        // noop
      }
    }

    try {
      navigation.navigate('MainTabs', { screen: 'CouponTab' });
    } catch {
      try {
        navigation.navigate('CouponTab');
      } catch {
        navigation.navigate('Coupon');
      }
    }
  };

  const handleMore = () => {
    if (onMore) {
      onMore();
      return;
    }
    setIsMoreModalVisible(true);
  };

  const handleCashout = () => {
    Alert.alert(
      'Confirmer la vente (Cashout)',
      `Vendre ce coupon immédiatement pour ${sellPriceFormatted} ₣ ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vendre',
          style: 'default',
          onPress: () => {
            executeCashout(currentCoupon.id);
            Alert.alert(
              'Vente effectuée',
              `Votre compte a été crédité de ${sellPriceFormatted} ₣.`
            );
          },
        },
      ]
    );
  };

  const handlePressEvent = (ev: BetDetailEvent) => {
    if (ev.isBonus) {
      return;
    }
    if (ev.isPoker) {
      navigation?.navigate?.('PokerLiveMatch', {
        matchId: ev.matchId || ev.id,
        event: {
          id: ev.id,
          sport: 'TvBet. POKER',
          league: ev.league || 'TvBet. POKER',
          homeTeam: { name: 'TvBet. POKER' },
          awayTeam: { name: ev.roundCode || 'PB232803' },
          prediction: ev.market,
          odd: Number(ev.odd) || 5.8,
          roundCode: ev.roundCode || 'PB232803',
          date: ev.date,
          status: ev.status === 'Gain' ? 'Payé' : ev.status === 'Perte' ? 'Perdu' : 'Accepté',
          pokerResult: ev.pokerDraw ? {
            board: ev.pokerDraw.board,
            hands: ev.pokerDraw.hands,
            winnerLabel: ev.pokerDraw.winnerLabel,
          } : undefined,
        },
      });
      return;
    }

    const liveState = getEventLiveProgress(ev, currentTime);
    const isFinishedOrResolved =
      liveState.isFinished ||
      ev.status === 'Gain' ||
      ev.status === 'Perte' ||
      ev.status === 'Payé' ||
      ev.status === 'Perdu' ||
      isPaid ||
      isLost;
    const isEventLost = ev.status === 'Perte' || ev.status === 'Perdu' || isLost;
    const isEventPreMatch = !isFinishedOrResolved && !liveState.hasStarted;

    if (ev.isFifa) {
      const completeFifa = isFinishedOrResolved
        ? ensureTwoHalvesScoreFormat({
            event: ev,
            rawScoreFinal: ev.scoreFinal,
            rawScoreDetail: ev.scoreDetail,
            isWin: !isEventLost,
          })
        : null;

      const resolvedFifaScore = completeFifa
        ? completeFifa.scoreFinal
        : ev.scoreFinal || (ev.scoreDetail ? ev.scoreDetail.split('(')[0].trim() : undefined);
      const resolvedFifaDetail = completeFifa ? completeFifa.scoreDetail : ev.scoreDetail;

      navigation?.navigate?.('FifaLiveMatch', {
        event: {
          id: ev.id,
          sport: 'FIFA',
          league: ev.league,
          homeTeam: { name: ev.homeTeam, logo: ev.homeLogo },
          awayTeam: { name: ev.awayTeam, logo: ev.awayLogo },
          score: resolvedFifaScore,
          actualScore: resolvedFifaScore,
          finalScore: resolvedFifaScore,
          halftimeScore: resolvedFifaDetail,
          scoreDetail: resolvedFifaDetail,
          date: ev.date,
          rawDate: ev.rawDate,
          startDate: ev.startDate,
          matchDate: ev.matchDate,
          matchTime: ev.matchTime,
          durationSeconds: ev.durationSeconds,
          elapsedSeconds: ev.elapsedSeconds,
          hasCustomElapsed: (ev as any).hasCustomElapsed,
          liveStartedAt: (ev as any).liveStartedAt,
          prediction: ev.market,
          odd: Number(ev.odd) || 1.92,
          status: isFinishedOrResolved
            ? isEventLost
              ? 'Perdu'
              : 'Payé'
            : 'Accepté',
          isFinished: isFinishedOrResolved,
          isPreMatch: isEventPreMatch,
          isLive: !isFinishedOrResolved && liveState.isLive,
        },
      });
      return;
    }

    const targetScreen = isFinishedOrResolved
      ? 'MatchStatistics'
      : resolveMatchNavigationTarget(ev.status, ev.status === 'Gain');
    const resolvedScore =
      ev.scoreFinal ||
      (ev.scoreDetail ? ev.scoreDetail.split('(')[0].trim() : undefined);
    const eventPayload = {
      id: ev.id || ev.matchId,
      matchId: ev.matchId,
      sport: ev.sport || 'Football',
      league: ev.league,
      date: ev.date,
      roundCode: ev.roundCode,
      homeTeam: { name: ev.homeTeam, logo: ev.homeLogo },
      awayTeam: { name: ev.awayTeam, logo: ev.awayLogo },
      prediction: ev.market,
      odd: Number(ev.odd) || 1.5,
      status: ev.status === 'Gain' ? 'Payé' : ev.status === 'Perte' ? 'Perdu' : 'Accepté',
      isWon: ev.status === 'Gain',
      actualScore: resolvedScore,
      finalScore: resolvedScore,
      halftimeScore: ev.scoreDetail || resolvedScore,
      score: resolvedScore,
    };

    navigation?.navigate?.(targetScreen, {
      matchId: ev.matchId,
      event: eventPayload,
      match: eventPayload,
    });
  };

  // Suivi du scroll pour afficher la barre collante Cotes / Mise / Gains (identique aux vidéos)
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  const stickyBarOpacity = scrollY.interpolate({
    inputRange: [70, 105],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const rawHeaderBg = getHeaderBgColor(currentTheme);
  const rawScreenBg = getScreenBgColor(currentTheme);
  const headerBg = isDark && isMelbet ? '#262B31' : rawHeaderBg;
  const screenBg = isDark && isMelbet ? '#1E2328' : rawScreenBg;
  const cardSurfaceBg = isDark
    ? isMelbet
      ? '#262B31'
      : currentTheme.cardBackground
    : currentTheme.cardBackground;
  const dividerColor = isDark
    ? '#323840'
    : (currentTheme.divider || currentTheme.border || '#F0F4F8');
  const labelGrayColor = isDark ? '#8A949E' : currentTheme.textSecondary;
  const valueWhiteColor = isDark ? '#FFFFFF' : currentTheme.textPrimary;
  const headerRightIconColor = isDark ? '#8A949E' : primaryActionColor;

  const statusBarStyle = getStatusBarStyleForTheme(currentTheme, headerBg);
  const topInset = insets.top;

  return (
    <View
      style={[
        styles.safeContainer,
        { backgroundColor: screenBg },
      ]}
    >
      <StatusBar
        animated
        barStyle={statusBarStyle}
        {...({ translucent: true, backgroundColor: 'transparent' } as any)}
      />

      {/* ================================================================== */}
      {/* 1. HEADER SUPÉRIEUR FIXE (Couverture Edge-to-Edge avec insets.top) */}
      {/* ================================================================== */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: headerBg,
            paddingTop: topInset,
            height: 52 + topInset,
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Retour"
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke={isDark ? '#9BA3AE' : primaryActionColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? '#9BA3AE' : currentTheme.textPrimary },
            ]}
          >
            Informations sur le pari
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isAccepted && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => Alert.alert('Notifications', 'Notifications activées pour ce pari.')}
            >
              <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke={headerRightIconColor}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke={headerRightIconColor}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleMore}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Circle cx="3.5" cy="10" r="2" fill={headerRightIconColor} />
              <Circle cx="10" cy="10" r="2" fill={headerRightIconColor} />
              <Circle cx="16.5" cy="10" r="2" fill={headerRightIconColor} />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================== */}
      {/* 1B. BARRE COLLANTE COTES / MISE / GAINS AU SCROLL (COMME LA VIDÉO) */}
      {/* ================================================================== */}
      <Animated.View
        pointerEvents={isStickyVisible ? 'auto' : 'none'}
        style={[
          styles.stickyFinancialBar,
          {
            top: 52 + topInset,
            opacity: stickyBarOpacity,
            backgroundColor: cardSurfaceBg,
          },
        ]}
      >
        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Cotes:</Text>
          <Text style={[styles.financialValueBold, { color: valueWhiteColor }]}>
            {formatCleanOdds(currentCoupon?.totalOdds || 1.921)}
          </Text>
        </View>

        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Mise:</Text>
          <Text style={[styles.financialValueBold, { color: valueWhiteColor }]}>{stakeFormatted}</Text>
        </View>

        {isAccepted && (
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Gains potentiels:</Text>
            <Text style={[styles.financialValueBold, { color: valueWhiteColor }]}>{potentialPayoutFormatted}</Text>
          </View>
        )}

        {isPaid && (
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Gains:</Text>
            <Text style={[styles.financialValueBold, { color: payeColor }]}>
              {actualPayoutFormatted}
            </Text>
          </View>
        )}

        {isLost && (
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Statut:</Text>
            <Text style={[styles.financialValueBold, { color: perduColor }]}>
              Perdu
            </Text>
          </View>
        )}
      </Animated.View>

      {/* ================================================================== */}
      {/* 2. CONTENU DÉFILANT                                               */}
      {/* ================================================================== */}
      <Animated.ScrollView
        style={[styles.scrollView, { backgroundColor: screenBg }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              bottomBarHeight + (showDuplicateFooter ? 88 : 28),
          },
        ]}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              if (offsetY > 75 && !isStickyVisible) {
                setIsStickyVisible(true);
              } else if (offsetY <= 75 && isStickyVisible) {
                setIsStickyVisible(false);
              }
            },
          }
        )}
        scrollEventThrottle={16}
      >
        {/* ================================================================ */}
        {/* BLOC RÉSUMÉ SUPÉRIEUR                                            */}
        {/* ================================================================ */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: cardSurfaceBg, overflow: 'hidden' },
          ]}
        >
          {/* En-tête du ticket : Avatar (44x44) + Colonne centrale + Badge • En direct */}
          <View style={styles.summaryHeaderRow}>
            <View style={styles.avatarWrap}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor: isDark ? '#1E2328' : '#E9EFF6',
                  },
                ]}
              >
                {isFifaCoupon && !isCombine ? (
                  <Text style={styles.fifaAvatarText}>FIFA</Text>
                ) : (
                  <Image
                    source={
                      isPokerCoupon
                        ? ASSET_ICONS.poker
                        : isCombine
                        ? ASSET_ICONS.combine
                        : isFifaCoupon
                        ? ASSET_ICONS.fifa
                        : ASSET_ICONS.football
                    }
                    style={[
                      isPokerCoupon
                        ? styles.avatarIconPoker
                        : isCombine
                        ? styles.avatarIconCombine
                        : isFifaCoupon
                        ? styles.avatarIconFifa
                        : styles.avatarIcon,
                      {
                        tintColor: '#8A949E',
                      },
                    ]}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Badge circulaire (16x16, borderRadius: 8, borderWidth: 1.5, borderColor: #262B31) */}
              <View
                style={[
                  styles.statusMiniDot,
                  {
                    backgroundColor: isPaid
                      ? '#52B76E'
                      : isLost
                      ? perduColor
                      : accepteColor,
                    borderColor: cardSurfaceBg || '#262B31',
                    borderWidth: 1.5,
                  },
                ]}
              >
                {(isAccepted || isPaid) && (
                  <Svg width={9.5} height={9.5} viewBox="0 0 12 12" fill="none" style={{ width: 9.5, height: 9.5 }}>
                    <Path
                      d="M2.5 6.2L5 8.6L9.6 3.6"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
                {isLost && (
                  <Svg width={8.5} height={8.5} viewBox="0 0 12 12" fill="none" style={{ width: 8.5, height: 8.5 }}>
                    <Rect x="2.5" y="5" width="7" height="2" rx="1" fill="#FFFFFF" />
                  </Svg>
                )}
              </View>
            </View>

            <View style={styles.summaryMetaCol}>
              <Text style={[styles.summaryDateText, { color: labelGrayColor }]}>
                {ticketDate}
              </Text>
              <Text style={[styles.summaryTypeText, { color: valueWhiteColor }]}>
                {typeLabel}
              </Text>
              <Text
                style={[
                  styles.summaryNumberText,
                  { color: isDark ? '#B8C0C8' : '#557089' },
                ]}
              >
                № {ticketNumber}
              </Text>
            </View>

            {/* Badge • En direct (#F04438, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2.5) */}
            {(events.some((e) => {
              if (e.isBonus) return false;
              const prog = getEventLiveProgress(e, currentTime);
              const evSettled =
                e.status === 'Gain' ||
                e.status === 'gagne' ||
                e.status === 'Perte' ||
                e.status === 'perdu' ||
                isPaid ||
                isLost;
              const evFifa = Boolean(
                e.isFifa ||
                  e.sport === 'FIFA' ||
                  String(e.league || '').toUpperCase().startsWith('FIFA') ||
                  String(e.league || '').toUpperCase().includes('FIFA')
              );
              const evPoker = Boolean(
                e.isPoker ||
                  String(e.sport || '').toUpperCase().includes('POKER') ||
                  String(e.sport || '').toUpperCase().includes('TVBET')
              );
              return (!evSettled && (evFifa || evPoker || prog.isLive)) || prog.isLive;
            })) ? (
              <View style={styles.liveRedBadge}>
                <View style={styles.liveRedBadgeDot} />
                <Text style={styles.liveRedBadgeText}>En direct</Text>
              </View>
            ) : currentCoupon?.badge === 'Serie A' ? (
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueBadgeText}>Serie A</Text>
              </View>
            ) : null}
          </View>

          {/* Séparateur horizontal supérieur (height: 1, #323840, marginHorizontal: 16, marginTop: 12, marginBottom: 8) */}
          <View
            style={[
              styles.thinDivider,
              { backgroundColor: dividerColor },
            ]}
          />

          {/* Conteneur des lignes financières (paddingHorizontal: 16, paddingBottom: 12) */}
          <View style={styles.financialBlockContainer}>
            {/* Ligne Événements si Combiné */}
            {(isCombine || totalEventsCount > 1) && (
              <View style={styles.eventsRowContainer}>
                <View style={styles.eventsLeftGroup}>
                  <View style={{ marginRight: 8 }}>
                    <OfficialLayersIcon
                      size={16}
                      color={labelGrayColor}
                    />
                  </View>
                  <Text style={[styles.eventsCountText, { color: valueWhiteColor }]}>
                    Événements : {totalEventsCount}
                  </Text>
                </View>
                <Text style={[styles.eventsFinishedText, { color: valueWhiteColor }]}>
                  {completedEventsCount} sur {matchEventsTotal} terminés
                </Text>
              </View>
            )}

            {/* Lignes Financières */}
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Cotes:</Text>
              <Text style={[styles.financialValueBold, { color: valueWhiteColor }]}>
                {formatCleanOdds(currentCoupon?.totalOdds || 1.921)}
              </Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Mise:</Text>
              <Text style={[styles.financialValueBold, { color: valueWhiteColor }]}>
                {stakeFormatted}
              </Text>
            </View>

            {/* Ligne Gains potentiels (si Accepté) ou Gains (si Payé) */}
            {isAccepted && (
              <View style={styles.financialRow}>
                <Text style={[styles.financialLabel, { color: labelGrayColor }]}>
                  Gains potentiels:
                </Text>
                <Text style={[styles.financialValueBold, { color: valueWhiteColor }]}>
                  {potentialPayoutFormatted}
                </Text>
              </View>
            )}

            {isPaid && (
              <View style={styles.financialRow}>
                <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Gains:</Text>
                <Text style={[styles.financialValueBold, { color: payeColor, fontWeight: '600' }]}>
                  {actualPayoutFormatted}
                </Text>
              </View>
            )}

            {/* Ligne Statut */}
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: labelGrayColor }]}>Statut:</Text>
              <Text
                style={[
                  styles.financialValueStatus,
                  { color: statusColor },
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================================ */}
        {/* CARTES DES ÉVÉNEMENTS / SÉLECTIONS                                */}
        {/* ================================================================ */}
        {events.map((ev, index) => {
          const isEventGain = ev.status === 'Gain' || ev.status === 'gagne' || isPaid;
          const isEventPerte = ev.status === 'Perte' || ev.status === 'perdu' || isLost;
          const isEventSettled = isEventGain || isEventPerte;
          const eventStatusLabel = isEventGain ? 'Gain' : isEventPerte ? 'Perte' : 'Accepté';
          const eventStatusColor = isEventGain ? payeColor : isEventPerte ? perduColor : accepteColor;

          const liveProgress = getEventLiveProgress(ev, currentTime);
          const isFifaEvent = Boolean(
            ev.isFifa ||
              ev.sport === 'FIFA' ||
              String(ev.league || '').toLowerCase().includes('fifa') ||
              String(ev.league || '').toUpperCase().startsWith('FIFA')
          );

          const isEventFinished = isEventSettled || liveProgress.isFinished;
          const isEventLive = !isEventFinished && liveProgress.isLive;
          const isPreMatch = !isEventFinished && !isEventLive;
          const hasEventStarted = !isPreMatch;

          // Date numérique exacte sur les cartes d'événements (ex: 14.11.2026 (14:40))
          const displayDate =
            ev.matchDate && ev.matchTime
              ? `${ev.matchDate} (${ev.matchTime})`
              : formatBetDate(ev.rawDate || ev.date);

          const isStandardMatch = !ev.isPoker && !ev.isBonus && !ev.isOutright;

          const finishedFormattedScore =
            isStandardMatch && isEventSettled
              ? ensureTwoHalvesScoreFormat({
                  event: ev,
                  rawScoreFinal: ev.scoreFinal,
                  rawScoreDetail: ev.scoreDetail,
                  isWin: !isEventPerte,
                })
              : null;

          // Sur l'état Accepté (!isEventSettled), on affiche toujours VS sans score ni sous-score
          const effectiveScoreFinal = isEventSettled
            ? finishedFormattedScore?.scoreFinal || ev.scoreFinal
            : undefined;

          const effectiveScoreDetail = isEventSettled
            ? finishedFormattedScore?.scoreDetail || ev.scoreDetail
            : undefined;

          const showEventLiveBadge =
            (!isEventSettled && (isFifaEvent || ev.isPoker || isEventLive)) ||
            (isFifaEvent && hasEventStarted && !isEventSettled);

          // Rendu dédié pour la carte Bonus
          if (ev.isBonus) {
            return (
              <View
                key={ev.id || index}
                style={[styles.eventCard, { backgroundColor: cardSurfaceBg }]}
              >
                <View style={styles.bonusCardHeader}>
                  <View style={styles.eventSportIconWrap}>
                    <BonusGiftIcon size={24} color={labelGrayColor} />
                  </View>
                  <Text style={[styles.bonusHeaderTitle, { color: labelGrayColor }]}>
                    Bonus
                  </Text>
                </View>

                <View style={styles.bonusCenterBox}>
                  <Text style={[styles.bonusCenterTitle, { color: valueWhiteColor }]}>
                    {ev.market || 'Bonus, Bonus pari combiné'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.eventInternalDivider,
                    { backgroundColor: dividerColor },
                  ]}
                />

                <View style={styles.bonusFooterBox}>
                  <Text style={[styles.eventMarketName, { color: valueWhiteColor }]}>
                    Bonus
                  </Text>
                  <Text style={[styles.eventOddText, { color: valueWhiteColor }]}>
                    {ev.odd}
                  </Text>
                </View>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={ev.id || index}
              activeOpacity={0.88}
              onPress={() => handlePressEvent(ev)}
              style={[styles.eventCard, { backgroundColor: cardSurfaceBg }]}
            >
              {/* Badge • En direct positionné en absolu tout à l'angle supérieur droit (top: 8, right: 8) */}
              {showEventLiveBadge ? (
                <View style={styles.cardCornerLiveBadge}>
                  <View style={styles.liveRedBadgeDot} />
                  <Text style={styles.liveRedBadgeText}>En direct</Text>
                </View>
              ) : ev.badge === 'Serie A' ? (
                <View style={[styles.leagueBadge, { position: 'absolute', top: 8, right: 8, zIndex: 5 }]}>
                  <Text style={styles.leagueBadgeText}>Serie A</Text>
                </View>
              ) : null}

              {/* En-tête de la compétition */}
              <View style={styles.eventCardHeader}>
                {isFifaEvent ? (
                  <Text style={styles.eventFifaLeftLabel}>FIFA</Text>
                ) : (
                  <View style={styles.eventSportIconWrap}>
                    <Image
                      source={
                        ev.isPoker
                          ? ASSET_ICONS.poker
                          : ASSET_ICONS.football
                      }
                      style={[
                        ev.isPoker ? styles.eventPokerIcon : styles.eventSportIcon,
                        { tintColor: labelGrayColor },
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                )}

                <View style={styles.eventLeagueInfoCol}>
                  <Text
                    style={[styles.eventLeagueText, { color: labelGrayColor }]}
                  >
                    {ev.isPoker
                      ? (ev.league || 'TvBet. POKER')
                      : isFifaEvent
                      ? (ev.league?.startsWith('FIFA') ? ev.league : `FIFA. ${ev.league || '5x5 Rush. Superligue'}`)
                      : formatFootballHeader(ev.sport, ev.league)}
                  </Text>
                  <Text style={[styles.eventDateText, { color: labelGrayColor }]}>
                    {displayDate}
                  </Text>
                </View>
              </View>

              {/* Zone d'affrontement centrale */}
              {ev.isPoker ? (
                // Bloc Poker
                <View style={styles.eventPokerContainer}>
                  {isAccepted ? (
                    <Text style={[styles.eventPokerTitleLive, { color: valueWhiteColor }]}>
                      POKER
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.eventPokerTitle, { color: valueWhiteColor }]}>
                        POKER
                      </Text>
                      {Boolean(ev.pokerDraw) && (
                        <View style={styles.eventPokerHandsBox}>
                          {ev.pokerDraw?.hands?.map((h: any, hIdx: number) => (
                            <PokerFormattedLine
                              key={h.id || hIdx}
                              label={`Main ${h.id || hIdx + 1}: `}
                              text={h.cards}
                              color={isDark ? '#93A7BC' : currentTheme.textSecondary}
                            />
                          ))}
                          <PokerFormattedLine
                            label="Table : "
                            text={ev.pokerDraw?.board || ''}
                            color={isDark ? '#93A7BC' : currentTheme.textSecondary}
                          />
                          {Boolean(ev.pokerDraw?.winnerLabel) && (
                            <PokerFormattedLine
                              label="Gagnant : "
                              text={
                                ev.pokerDraw?.winnerLabel
                                  ? ev.pokerDraw.winnerLabel.replace(/^Main\s+/i, '')
                                  : ''
                              }
                              color={isDark ? '#93A7BC' : currentTheme.textSecondary}
                            />
                          )}
                        </View>
                      )}
                    </>
                  )}
                </View>
              ) : ev.isOutright ? (
                // Pari long terme / vainqueur (centré)
                <View style={styles.eventOutrightContainer}>
                  <Text style={[styles.eventOutrightText, { color: valueWhiteColor }]}>
                    {ev.outrightTitle || ev.homeTeam}
                  </Text>
                </View>
              ) : (
                // Match avec 2 équipes sur 1 seule ligne et VS au centre
                <View style={styles.eventMatchBlock}>
                  <View style={styles.eventFaceoffContainer}>
                    {/* Équipe 1 (Gauche) : Texte aligné à droite (1 ligne) + Logo 36x36 */}
                    <View style={styles.teamLeftContainer}>
                      <View style={styles.teamLeftTextWrap}>
                        <Text
                          style={[styles.teamNameLeft, { color: valueWhiteColor }]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.82}
                        >
                          {ev.homeTeam}
                        </Text>
                      </View>
                      <TeamLogo
                        teamName={ev.homeTeam}
                        logoUrl={ev.homeLogo}
                        leagueName={ev.league}
                        size={36}
                      />
                    </View>

                    {/* Centre : VS (ou score final uniquement si événement terminé/résolu) */}
                    {effectiveScoreFinal ? (
                      <Text style={[styles.mainScoreText, { color: valueWhiteColor }]}>
                        {effectiveScoreFinal}
                      </Text>
                    ) : (
                      <Text style={[styles.vsText, { color: valueWhiteColor }]}>
                        VS
                      </Text>
                    )}

                    {/* Équipe 2 (Droite) : Logo 36x36 + Texte aligné à gauche sur 1 seule ligne */}
                    <View style={styles.teamRightContainer}>
                      <TeamLogo
                        teamName={ev.awayTeam}
                        logoUrl={ev.awayLogo}
                        leagueName={ev.league}
                        size={36}
                      />
                      <View style={styles.teamRightTextWrap}>
                        <Text
                          style={[styles.teamNameRight, { color: valueWhiteColor }]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.82}
                        >
                          {ev.awayTeam}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {Boolean(effectiveScoreDetail) && (
                    <Text
                      style={[
                        styles.detailScoreBelowText,
                        { color: labelGrayColor },
                      ]}
                    >
                      {effectiveScoreDetail}
                    </Text>
                  )}
                </View>
              )}

              {/* Séparateur interne de la carte (height: 1, #323840, marginBottom: 10) */}
              <View
                style={[
                  styles.eventInternalDivider,
                  { backgroundColor: dividerColor },
                ]}
              />

              {/* Pied de la carte : Uniquement 2 lignes (Marché & Cote + Statut) */}
              <View style={styles.eventFooterBox}>
                <View style={styles.eventMarketRow}>
                  <Text
                    style={[styles.eventMarketName, { color: valueWhiteColor }]}
                    numberOfLines={2}
                  >
                    {ev.market}
                  </Text>
                  <Text style={[styles.eventOddText, { color: valueWhiteColor }]}>
                    {ev.odd}
                  </Text>
                </View>

                <View style={styles.eventStatusRow}>
                  <Text style={[styles.eventStatusLabel, { color: labelGrayColor }]}>
                    Statut:
                  </Text>
                  <Text
                    style={[
                      styles.eventStatusValue,
                      {
                        color: eventStatusColor,
                      },
                    ]}
                  >
                    {eventStatusLabel}
                  </Text>
                </View>
              </View>

              {/* Informations supplémentaires pour Poker */}
              {ev.isPoker && Boolean(ev.roundCode) && (
                <>
                  <View
                    style={[
                      styles.eventInternalDivider,
                      { backgroundColor: dividerColor, marginTop: 8 },
                    ]}
                  />
                  <View style={styles.extraInfoBox}>
                    <Text
                      style={[
                        styles.extraInfoTitle,
                        { color: labelGrayColor },
                      ]}
                    >
                      Informations supplémentaires
                    </Text>
                    <Text style={[styles.extraInfoValue, { color: valueWhiteColor }]}>
                      {ev.roundCode}
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      {/* ================================================================== */}
      {/* 6. BARRE D'ACTION INFÉRIEURE (BOUTON UNIQUE COMME SUR LA CAPTURE 2) */}
      {/* ================================================================== */}
      {showDuplicateFooter && (
        <View
          style={[
            styles.fixedFooter,
            {
              bottom: bottomBarHeight,
              backgroundColor: cardSurfaceBg || (isDark ? '#262B31' : '#FFFFFF'),
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.singleFooterBtn,
              {
                backgroundColor: isMelbet
                  ? '#D88D23'
                  : (currentTheme.cashoutButton?.bg || currentTheme.primary || '#4A8AE8'),
              },
            ]}
            activeOpacity={0.85}
            onPress={showSellButton ? handleCashout : handleDuplicate}
          >
            <Text style={styles.singleFooterBtnText}>
              {showSellButton
                ? `Vendre pour ${sellPriceFormatted} ₣`
                : 'Dupliquer le coupon de pari'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu d'options du coupon (Validation avec saisie des scores des 2 mi-temps) */}
      {isMoreModalVisible && (
      <Modal
        visible={isMoreModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsMoreModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.52)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsMoreModalVisible(false)}
          />
          <View
            style={{
              backgroundColor: currentTheme.cardBackground || (isDark ? '#1E2A36' : '#FFFFFF'),
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 18,
              paddingTop: 14,
              paddingBottom: Math.max(24, insets.bottom + 14),
              zIndex: 2,
            }}
          >
            <View
              style={{
                width: 38,
                height: 4,
                borderRadius: 2,
                backgroundColor: currentTheme.border || '#CBD5E1',
                alignSelf: 'center',
                marginBottom: 12,
              }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: currentTheme.textPrimary,
                textAlign: 'center',
                marginBottom: 14,
              }}
            >
              Pari № {ticketNumber}
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.divider || currentTheme.border || '#E2E8F0',
              }}
              onPress={() => {
                setIsMoreModalVisible(false);
                setIsScoreModalVisible(true);
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: payeColor,
                }}
              >
                {isPaid
                  ? 'Modifier les scores des 2 mi-temps'
                  : 'Valider le coupon (Saisir les scores des 2 mi-temps)'}
              </Text>
              <Ionicons name="checkmark-circle-outline" size={22} color={payeColor} />
            </TouchableOpacity>

            {(isPaid || isLost) && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: currentTheme.divider || currentTheme.border || '#E2E8F0',
                }}
                onPress={() => {
                  updateCouponStatus(currentCoupon.id, 'Accepté');
                  setIsMoreModalVisible(false);
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: accepteColor,
                  }}
                >
                  Marquer comme Accepté (En cours)
                </Text>
                <Ionicons name="refresh-outline" size={20} color={accepteColor} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.divider || currentTheme.border || '#E2E8F0',
              }}
              onPress={() => {
                setIsMoreModalVisible(false);
                handleDuplicate();
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: currentTheme.textPrimary,
                }}
              >
                Dupliquer le coupon
              </Text>
              <Ionicons name="copy-outline" size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.divider || currentTheme.border || '#E2E8F0',
              }}
              onPress={async () => {
                try {
                  await Clipboard.setStringAsync(ticketNumber);
                } catch {
                  // noop
                }
                setIsMoreModalVisible(false);
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: currentTheme.textPrimary,
                }}
              >
                Copier le numéro de coupon
              </Text>
              <Ionicons name="clipboard-outline" size={20} color={currentTheme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 14,
                marginTop: 4,
                alignItems: 'center',
              }}
              onPress={() => setIsMoreModalVisible(false)}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: currentTheme.textSecondary,
                }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      )}

      {/* Modale de saisie des scores des 2 mi-temps avant validation */}
      <ScoreEditorModal
        visible={isScoreModalVisible}
        coupon={currentCoupon}
        onClose={() => setIsScoreModalVisible(false)}
      />
    </View>
  );
}

// Re-exports pour compatibilité
export const BetDetailTicketScreen = TicketDetailsScreen;
export const BetDetailsScreen = TicketDetailsScreen;
export const BetDetailScreen = TicketDetailsScreen;

// ============================================================================
// STYLES PIXEL-PERFECT (Melbet Thème)
// ============================================================================
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // 1. Barre d'En-tête Supérieure (Informations sur le pari)
  header: {
    height: 52,
    backgroundColor: '#262B31',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 28,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#9BA3AE',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#7A8FA6',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 18,
  },
  headerActionBtn: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 1B. Barre collante Cotes / Mise / Gains au scroll
  stickyFinancialBar: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 50,
  },

  // 2. Bloc Résumé du Ticket
  summaryCard: {
    paddingTop: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatarWrap: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2328',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fifaAvatarText: {
    color: '#8A949E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  avatarIcon: {
    width: 24,
    height: 24,
  },
  avatarIconPoker: {
    width: 24,
    height: 24,
    tintColor: '#8A949E',
  },
  avatarIconFifa: {
    width: 26,
    height: 18,
    tintColor: '#8A949E',
  },
  avatarIconCombine: {
    width: 22,
    height: 22,
  },
  statusMiniDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#262B31',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryMetaCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  summaryDateText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8A949E',
  },
  summaryTypeText: {
    fontSize: 17.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  summaryNumberText: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#B8C0C8',
    marginTop: 1,
  },

  // Badge Ligue Bleu (Serie A uniquement)
  leagueBadge: {
    backgroundColor: '#527BFF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    alignSelf: 'flex-start',
  },
  leagueBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // 3. Bloc Financier
  thinDivider: {
    height: 1,
    backgroundColor: '#323840',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  financialBlockContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5.5,
  },
  financialLabel: {
    fontSize: 15.5,
    fontWeight: '400',
    color: '#8A949E',
  },
  financialValueBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  financialValueStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D89228',
  },

  eventsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5.5,
  },
  eventsLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventsCountText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventsFinishedText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 4. Carte d'Événement
  eventCard: {
    backgroundColor: '#262B31',
    borderRadius: 12,
    marginHorizontal: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    position: 'relative',
  },
  cardCornerLiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F04438',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventFifaLeftLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A949E',
    marginRight: 10,
    marginTop: 4,
  },
  eventSportIconWrap: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eventSportIcon: {
    width: 22,
    height: 22,
    tintColor: '#8A949E',
  },
  eventPokerIcon: {
    width: 20,
    height: 20,
    tintColor: '#8A949E',
  },
  eventLeagueInfoCol: {
    flex: 1,
    paddingRight: 64,
    justifyContent: 'center',
  },
  eventLeagueText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8A949E',
  },
  eventDateText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8A949E',
    marginTop: 2,
  },

  // Carte Bonus
  bonusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
  },
  bonusHeaderTitle: {
    fontSize: 13,
    color: '#8A949E',
    fontWeight: '400',
  },
  bonusCenterBox: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusCenterTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bonusFooterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },

  // Zone Poker
  eventPokerContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventPokerTitleLive: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 14,
  },
  eventPokerTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  eventPokerHandsBox: {
    alignItems: 'center',
    width: '100%',
    marginTop: 2,
  },

  // 5. Zone d'Affrontement (VS & Noms d'Équipes sur 1 Ligne) et Pied de Carte
  eventMatchBlock: {
    width: '100%',
  },
  eventFaceoffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  teamLeftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  teamLeftTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  teamNameLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  teamRightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamRightTextWrap: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  teamNameRight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  vsText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  mainScoreText: {
    fontSize: 19,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  detailScoreBelowText: {
    fontSize: 12.5,
    color: '#8A949E',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Zone outright / vainqueur
  eventOutrightContainer: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOutrightText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // Séparateur interne de la carte
  eventInternalDivider: {
    height: 1,
    backgroundColor: '#323840',
    marginBottom: 10,
  },

  // Pied de la carte (Uniquement 2 lignes comme sur la Capture 2)
  eventFooterBox: {
    width: '100%',
  },
  eventMarketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventMarketName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  eventOddText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventStatusLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#8A949E',
  },
  eventStatusValue: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#D89228',
  },

  // Badge • En direct (Résumé & Carte)
  liveRedBadge: {
    backgroundColor: '#F04438',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  liveRedBadgeDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveRedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Section Informations supplémentaires (Poker)
  extraInfoBox: {
    paddingTop: 2,
  },
  extraInfoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A949E',
    marginBottom: 2,
  },
  extraInfoValue: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  // 6. Barre d'Action Inférieure (Bouton Unique comme sur la Capture 2)
  fixedFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#262B31',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
  },
  singleFooterBtn: {
    backgroundColor: '#D88D23',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleFooterBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
