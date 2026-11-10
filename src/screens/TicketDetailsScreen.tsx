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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getHeaderBgColor,
  getScreenBgColor,
  getStatusBarStyleForTheme,
} from '../theme/themes';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
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

// ============================================================================
// Types
// ============================================================================
// Helper de formatage de devise (symbole ₣ sans décimales ni virgules sur Mise et Gains potentiels)
const formatCurrency = (val: number | string | undefined): string => {
  if (val === undefined || val === null) return '0 ₣';
  const num =
    typeof val === 'number'
      ? val
      : parseFloat(String(val).replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return `${val} ₣`;
  const rounded = Math.round(num);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} ₣`;
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

  // Horloge temps réel pour la progression dynamique des événements EN DIRECT
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Résolution dynamique du coupon
  const couponId = route?.params?.couponId || route?.params?.ticketId || route?.params?.id;
  const passedCoupon = route?.params?.coupon || route?.params?.ticket || propTicket;

  const currentCoupon: BetSlip = useMemo(() => {
    if (passedCoupon && (passedCoupon.id || passedCoupon.ticketNumber)) {
      return passedCoupon;
    }
    if (couponId) {
      const found = coupons.find(
        (c) =>
          String(c.id) === String(couponId) ||
          String((c as any).ticketNumber) === String(couponId)
      );
      if (found) return found;
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

  // Couleurs dynamiques selon le thème actif (Correction 2 : Unification de SUCCESS_GREEN = '#4EBA6F')
  const SUCCESS_GREEN = '#4EBA6F';
  const primaryActionColor = isDark
    ? '#FFFFFF'
    : (currentTheme?.activeIcon || currentTheme?.primary || '#557089');
  const payeColor = SUCCESS_GREEN;
  const accepteColor = currentTheme?.status?.accepte || '#4A83C4';
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
        (rawHomeLogo &&
        (rawHomeLogo.startsWith('http://') || rawHomeLogo.startsWith('https://')) &&
        !rawHomeLogo.includes('ui-avatars.com')
          ? rawHomeLogo
          : undefined) ||
        resolveTeamLogo(homeName) ||
        rawHomeLogo;
      const awayLogo =
        (rawAwayLogo &&
        (rawAwayLogo.startsWith('http://') || rawAwayLogo.startsWith('https://')) &&
        !rawAwayLogo.includes('ui-avatars.com')
          ? rawAwayLogo
          : undefined) ||
        resolveTeamLogo(awayName) ||
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
  const ticketNumber = currentCoupon?.id || (currentCoupon as any)?.ticketNumber || '89755801725';

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
    Alert.alert(
      `Pari № ${ticketNumber}`,
      'Que souhaitez-vous faire ?',
      [
        ...(!isPaid
          ? [
              {
                text: 'Valider le coupon (Gain / Payé)',
                onPress: () => {
                  validateCouponWithResult(currentCoupon.id, true);
                  Alert.alert('Succès', 'Le coupon a été validé et payé.');
                },
              },
            ]
          : [
              {
                text: 'Marquer comme Accepté (En cours)',
                onPress: () => {
                  updateCouponStatus(currentCoupon.id, 'Accepté');
                  Alert.alert('Statut mis à jour', 'Le coupon est maintenant en statut Accepté.');
                },
              },
            ]),
        {
          text: 'Dupliquer le coupon',
          onPress: handleDuplicate,
        },
        {
          text: 'Copier le numéro de coupon',
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(ticketNumber);
              Alert.alert('Copié', 'Numéro de coupon copié dans le presse-papier.');
            } catch {
              // noop
            }
          },
        },
        {
          text: 'Enregistrer le coupon',
          onPress: () => {
            Alert.alert('Enregistré', 'Coupon sauvegardé dans vos favoris.');
          },
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
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

  const headerBg = getHeaderBgColor(currentTheme);
  const screenBg = getScreenBgColor(currentTheme);
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
          <BackArrowIcon size={26} color={primaryActionColor} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>
            Informations sur le pari
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isAccepted && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => Alert.alert('Notifications', 'Notifications activées pour ce pari.')}
            >
              <OfficialBellIcon size={21} color={primaryActionColor} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={handleMore}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <OfficialThreeDotsIcon size={19} color={primaryActionColor} />
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
            backgroundColor: currentTheme.colors?.cardBackground || currentTheme.cardBackground,
          },
        ]}
      >
        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Cotes:</Text>
          <Text style={[styles.financialValueBold, { color: currentTheme.textPrimary }]}>
            {formatCleanOdds(currentCoupon?.totalOdds || 1.921)}
          </Text>
        </View>

        <View style={styles.financialRow}>
          <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Mise:</Text>
          <Text style={[styles.financialValueBold, { color: currentTheme.textPrimary }]}>{stakeFormatted}</Text>
        </View>

        {isAccepted && (
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Gains potentiels:</Text>
            <Text style={[styles.financialValueBold, { color: currentTheme.textPrimary }]}>{potentialPayoutFormatted}</Text>
          </View>
        )}

        {isPaid && (
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Gains:</Text>
            <Text style={[styles.financialValueBold, { color: payeColor }]}>
              {actualPayoutFormatted}
            </Text>
          </View>
        )}

        {isLost && (
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Statut:</Text>
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
        style={[styles.scrollView, { backgroundColor: currentTheme.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              bottomBarHeight + (showDuplicateFooter ? (showSellButton ? 140 : 88) : 28),
          },
        ]}
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
        {/* BLOC RÉSUMÉ SUPÉRIEUR (FOND BLANC DYNAMIQUE THÈME)                */}
        {/* ================================================================ */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: currentTheme.cardBackground, overflow: 'hidden' },
          ]}
        >
          {isPaid && (
            <LinearGradient
              colors={['rgba(78, 186, 111, 0)', 'rgba(78, 186, 111, 0)', 'rgba(78, 186, 111, 0.08)']}
              locations={[0, 0.55, 1]}
              start={{ x: 0.3, y: 0.2 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          )}
          {/* En-tête du ticket : Avatar + Type + Date + Badge ligue */}
          <View style={styles.summaryHeaderRow}>
            <View style={styles.avatarWrap}>
              <View
                style={[
                  styles.avatarCircle,
                  {
                    backgroundColor:
                      (currentTheme as any).surfaceSecondary ||
                      (isDark ? 'rgba(255,255,255,0.08)' : '#E9EFF6'),
                  },
                ]}
              >
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
                      tintColor: isPokerCoupon
                        ? (currentTheme as any).iconSlate || (isDark ? '#8A9DB0' : '#5C7690')
                        : currentTheme.textSecondary || (isDark ? '#8A9DB0' : '#6E849B'),
                    },
                  ]}
                  resizeMode="contain"
                />
              </View>

              {/* Badge de vérification superposé en bas à droite (adapté à tous les thèmes) */}
              <View
                style={[
                  styles.statusMiniDot,
                  {
                    backgroundColor: isPaid
                      ? '#52B76E'
                      : isLost
                      ? (currentTheme.status?.perdu || '#E74C3C')
                      : (currentTheme.status?.accepte || currentTheme.primary || '#4A8FE7'),
                    borderColor: currentTheme.cardBackground || '#FFFFFF',
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
              <Text style={[styles.summaryDateText, { color: currentTheme.textSecondary }]}>
                {ticketDate}
              </Text>
              <Text style={[styles.summaryTypeText, { color: currentTheme.textPrimary }]}>
                {typeLabel}
              </Text>
              <Text style={[styles.summaryNumberText, { color: currentTheme.textPrimary || '#002B49' }]}>
                № {ticketNumber}
              </Text>
            </View>

            {/* Badge • En direct rouge (sur événements FIFA ou Poker quand Accepté/Live, ou tout événement en direct) */}
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
              // Le badge live apparaît sur les événements FIFA et Poker quand le statut est accepté, ou sur tout événement live
              return (!evSettled && (evFifa || evPoker || prog.isLive)) || prog.isLive;
            })) ? (
              <View style={[styles.liveRedBadge, { backgroundColor: (currentTheme as any).liveBadgeBg || '#D94343' }]}>
                <View style={styles.liveRedBadgeDot} />
                <Text style={styles.liveRedBadgeText}>En direct</Text>
              </View>
            ) : currentCoupon?.badge === 'Serie A' ? (
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueBadgeText}>Serie A</Text>
              </View>
            ) : null}
          </View>

          {/* Séparateur fin */}
          <View
            style={[
              styles.thinDivider,
              { backgroundColor: currentTheme.divider || currentTheme.border },
            ]}
          />

          {/* Ligne Événements si Combiné (Pixel-Perfect selon capture de référence) */}
          {(isCombine || totalEventsCount > 1) && (
            <View style={styles.eventsRowContainer}>
              <View style={styles.eventsLeftGroup}>
                <View style={{ marginRight: 8 }}>
                  <OfficialLayersIcon
                    size={16}
                    color={currentTheme.textSecondary || (isDark ? '#8A9DB0' : '#5C7690')}
                  />
                </View>
                <Text style={[styles.eventsCountText, { color: currentTheme.textPrimary }]}>
                  Événements : {totalEventsCount}
                </Text>
              </View>
              <Text style={[styles.eventsFinishedText, { color: currentTheme.textPrimary }]}>
                {completedEventsCount} sur {matchEventsTotal} terminés
              </Text>
            </View>
          )}

          {/* Lignes Financières */}
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Cotes:</Text>
            <Text style={[styles.financialValueBold, { color: currentTheme.textPrimary }]}>
              {formatCleanOdds(currentCoupon?.totalOdds || 1.921)}
            </Text>
          </View>

          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Mise:</Text>
            <Text style={[styles.financialValueBold, { color: currentTheme.textPrimary }]}>
              {stakeFormatted}
            </Text>
          </View>

          {/* Ligne Gains potentiels (si Accepté) ou Gains (si Payé) */}
          {isAccepted && (
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>
                Gains potentiels:
              </Text>
              <Text style={[styles.financialValueBold, { color: currentTheme.textPrimary }]}>
                {potentialPayoutFormatted}
              </Text>
            </View>
          )}

          {isPaid && (
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Gains:</Text>
              <Text style={[styles.financialValueBold, { color: payeColor, fontWeight: '600' }]}>
                {actualPayoutFormatted}
              </Text>
            </View>
          )}

          {/* Ligne Statut parfaitement alignée (sans boîte verte décalée) */}
          <View style={styles.financialRow}>
            <Text style={[styles.financialLabel, { color: currentTheme.textSecondary }]}>Statut:</Text>
            <Text
              style={[
                styles.financialValueStatus,
                { color: statusColor, fontWeight: isPaid ? '600' : '500' },
              ]}
            >
              {statusLabel}
            </Text>
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

          // Machine à États Temporelle en temps réel (PRE_MATCH -> LIVE -> FINISHED) via currentTime (1000ms)
          const liveProgress = getEventLiveProgress(ev, currentTime);
          const isFifaEvent = Boolean(
            ev.isFifa ||
              ev.sport === 'FIFA' ||
              String(ev.league || '').toLowerCase().includes('fifa') ||
              String(ev.league || '').toUpperCase().startsWith('FIFA')
          );

          // État C : Terminé ou coupon résolu (Gain / Payé / Perte)
          const isEventFinished = isEventSettled || liveProgress.isFinished;
          // État B : En direct uniquement lorsque l'heure de début est atteinte (now >= startTime et now < startTime + durationSeconds, non terminé)
          const isEventLive = !isEventFinished && liveProgress.isLive;
          // État A : Avant le début de l'événement (now < startTime et non terminé)
          const isPreMatch = !isEventFinished && !isEventLive;

          const hasEventStarted = !isPreMatch;
          const showElapsedRow = isEventLive;
          const elapsedSec = liveProgress.elapsedSeconds;

          const displayDate = isEventLive || (isFifaEvent && hasEventStarted)
            ? ev.matchDate && ev.matchTime
              ? `${ev.matchDate} (${ev.matchTime})`
              : formatBetDate(ev.rawDate || ev.date)
            : formatFrenchEventDate(ev.rawDate || ev.date);

          const isStandardMatch = !ev.isPoker && !ev.isBonus && !ev.isOutright;

          const liveAdaptiveScore =
            isStandardMatch && isEventLive
              ? computeAdaptiveLiveScore({
                  marketLabel: ev.market,
                  elapsedSeconds: elapsedSec,
                  durationSeconds: liveProgress.durationSeconds,
                  isFifa: isFifaEvent,
                })
              : null;

          const finishedFormattedScore =
            isStandardMatch && isEventFinished
              ? ensureTwoHalvesScoreFormat({
                  event: ev,
                  rawScoreFinal: ev.scoreFinal,
                  rawScoreDetail: ev.scoreDetail,
                  isWin: !isEventPerte,
                })
              : null;

          const effectiveScoreFinal = isPreMatch
            ? undefined
            : isEventLive
            ? liveAdaptiveScore?.mainScore || '0:0'
            : finishedFormattedScore?.scoreFinal || ev.scoreFinal;

          const effectiveScoreDetail = isPreMatch
            ? undefined
            : isEventLive
            ? liveAdaptiveScore?.detailedScore || '0:0 (0:0)'
            : finishedFormattedScore?.scoreDetail || ev.scoreDetail;

          // Rendu dédié pour la carte Bonus (identique à video_gagnant.mp4 et WhatsApp_Video)
          if (ev.isBonus) {
            return (
              <View
                key={ev.id || index}
                style={[styles.eventCard, { backgroundColor: currentTheme.cardBackground }]}
              >
                <View style={styles.bonusCardHeader}>
                  <View style={styles.eventSportIconWrap}>
                    <BonusGiftIcon size={24} color={currentTheme.textSecondary} />
                  </View>
                  <Text style={[styles.bonusHeaderTitle, { color: currentTheme.textSecondary }]}>
                    Bonus
                  </Text>
                </View>

                <View style={styles.bonusCenterBox}>
                  <Text style={[styles.bonusCenterTitle, { color: currentTheme.textPrimary }]}>
                    {ev.market || 'Bonus, Bonus pari combiné'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.thinDividerNoMargin,
                    { backgroundColor: currentTheme.divider || currentTheme.border },
                  ]}
                />

                <View style={styles.bonusFooterBox}>
                  <Text style={[styles.eventMarketName, { color: currentTheme.textPrimary }]}>
                    Bonus
                  </Text>
                  <Text style={[styles.eventOddText, { color: currentTheme.textPrimary }]}>
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
              style={[styles.eventCard, { backgroundColor: currentTheme.cardBackground }]}
            >
              {isEventGain && (
                <LinearGradient
                  colors={['rgba(78, 186, 111, 0)', 'rgba(78, 186, 111, 0)', 'rgba(78, 186, 111, 0.08)']}
                  locations={[0, 0.55, 1]}
                  start={{ x: 0.3, y: 0.2 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              )}

              {/* En-tête de carte d'événement */}
              <View style={styles.eventCardHeader}>
                <View style={styles.eventSportIconWrap}>
                  <Image
                    source={
                      ev.isPoker
                        ? ASSET_ICONS.poker
                        : ev.sport === 'FIFA' || ev.isFifa
                        ? ASSET_ICONS.fifa
                        : ASSET_ICONS.football
                    }
                    style={[
                      ev.isPoker ? styles.eventPokerIcon : styles.eventSportIcon,
                      { tintColor: currentTheme.textSecondary || '#6E849B' },
                    ]}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.eventLeagueInfoCol}>
                  <Text
                    style={[styles.eventLeagueText, { color: currentTheme.textSecondary || '#6E849B' }]}
                    numberOfLines={1}
                  >
                    {ev.isPoker
                      ? (ev.league || 'TvBet. POKER')
                      : ev.isFifa
                      ? (ev.league?.startsWith('FIFA') ? ev.league : `FIFA. ${ev.league || '5x5 Rush. Superligue'}`)
                      : formatFootballHeader(ev.sport, ev.league)}
                  </Text>
                  <Text style={[styles.eventDateText, { color: currentTheme.textSecondary || '#6E849B' }]}>
                    {displayDate}
                  </Text>
                </View>

                {/* Badge • En direct rouge (sur les événements FIFA ou Poker quand statut Accepté/Live, ou tout événement en direct) ou Serie A */}
                {((!isEventFinished && (isFifaEvent || ev.isPoker)) || (isFifaEvent && hasEventStarted) || isEventLive) ? (
                  <View style={[styles.liveRedBadge, { backgroundColor: (currentTheme as any).liveBadgeBg || '#D94343' }]}>
                    <View style={styles.liveRedBadgeDot} />
                    <Text style={styles.liveRedBadgeText}>En direct</Text>
                  </View>
                ) : ev.badge === 'Serie A' ? (
                  <View style={styles.leagueBadge}>
                    <Text style={styles.leagueBadgeText}>Serie A</Text>
                  </View>
                ) : null}
              </View>

              {/* Zone d'affrontement centrale */}
              {ev.isPoker ? (
                // Bloc Poker
                <View style={styles.eventPokerContainer}>
                  {isAccepted ? (
                    <Text style={[styles.eventPokerTitleLive, { color: currentTheme.textPrimary }]}>
                      POKER
                    </Text>
                  ) : (
                    <>
                      <Text style={[styles.eventPokerTitle, { color: currentTheme.textPrimary }]}>
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
                  <Text style={[styles.eventOutrightText, { color: currentTheme.textPrimary }]}>
                    {ev.outrightTitle || ev.homeTeam}
                  </Text>
                </View>
              ) : (
                // Match avec 2 équipes et VS / Score + détail mi-temps centré en dessous
                <View style={styles.eventMatchBlock}>
                  <View style={styles.eventFaceoffContainer}>
                    {/* Équipe 1 (Gauche) */}
                    <View style={styles.teamLeftContainer}>
                      <Text
                        style={[styles.teamNameLeft, { color: currentTheme.textPrimary }]}
                        numberOfLines={2}
                      >
                        {ev.homeTeam}
                      </Text>
                      <TeamLogo
                        teamName={ev.homeTeam}
                        logoUrl={ev.homeLogo}
                        size={34}
                      />
                    </View>

                    {/* Centre : VS ou Score (0:0 en direct ou score final) */}
                    <View style={styles.centerScoreContainer}>
                      {effectiveScoreFinal && hasEventStarted ? (
                        <Text style={[styles.mainScoreText, { color: currentTheme.textPrimary }]}>
                          {effectiveScoreFinal}
                        </Text>
                      ) : (
                        <Text style={[styles.vsText, { color: currentTheme.textPrimary }]}>
                          VS
                        </Text>
                      )}
                    </View>

                    {/* Équipe 2 (Droite) */}
                    <View style={styles.teamRightContainer}>
                      <TeamLogo
                        teamName={ev.awayTeam}
                        logoUrl={ev.awayLogo}
                        size={34}
                      />
                      <Text
                        style={[styles.teamNameRight, { color: currentTheme.textPrimary }]}
                        numberOfLines={2}
                      >
                        {ev.awayTeam}
                      </Text>
                    </View>
                  </View>

                  {/* Détail du score centré sous les logos (ex: 0:0 (0:0), 2:2 (2:2) ou 0:2 (0:0,0:2)) */}
                  {Boolean(effectiveScoreDetail) && hasEventStarted && (
                    <Text
                      style={[
                        styles.detailScoreBelowText,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      {effectiveScoreDetail}
                    </Text>
                  )}
                </View>
              )}

              {/* Séparateur fin */}
              <View
                style={[
                  styles.thinDividerNoMargin,
                  { backgroundColor: currentTheme.divider || currentTheme.border },
                ]}
              />

              {/* Pied de carte d'événement */}
              <View style={styles.eventFooterBox}>
                <View style={styles.eventMarketRow}>
                  <Text
                    style={[styles.eventMarketName, { color: currentTheme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {ev.market}
                  </Text>
                  <Text style={[styles.eventOddText, { color: currentTheme.textPrimary }]}>
                    {ev.odd}
                  </Text>
                </View>

                {/* Ligne EN DIRECT + temps écoulé : s'affiche dès l'heure de début de l'événement */}
                {showElapsedRow && (
                  <View style={styles.eventLiveElapsedRow}>
                    <Text
                      style={[
                        styles.eventLiveElapsedLeft,
                        { color: currentTheme.textSecondary || '#6E849B' },
                      ]}
                    >
                      EN DIRECT
                    </Text>
                    <Text
                      style={[
                        styles.eventLiveElapsedRight,
                        { color: currentTheme.textPrimary },
                      ]}
                    >
                      temps écoulé : {formatSecondsToMMSS(elapsedSec)}
                    </Text>
                  </View>
                )}

                <View style={styles.eventStatusRow}>
                  <Text style={[styles.eventStatusLabel, { color: currentTheme.textSecondary }]}>
                    Statut:
                  </Text>
                  <Text
                    style={[
                      styles.eventStatusValue,
                      {
                        color: eventStatusColor,
                        fontWeight: isEventGain ? '600' : '500',
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
                      styles.thinDividerNoMargin,
                      { backgroundColor: currentTheme.divider || currentTheme.border },
                    ]}
                  />
                  <View style={styles.extraInfoBox}>
                    <Text
                      style={[
                        styles.extraInfoTitle,
                        { color: currentTheme.textSecondary || (isDark ? '#8A9DB0' : '#557089') },
                      ]}
                    >
                      Informations supplémentaires
                    </Text>
                    <Text style={[styles.extraInfoValue, { color: currentTheme.textPrimary }]}>
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
      {/* 3. FOOTER FIXE AU-DESSUS DE LA BOTTOM BAR (Vendre / Dupliquer)     */}
      {/* ================================================================== */}
      {showDuplicateFooter && (
        <View
          style={[
            styles.fixedFooter,
            {
              bottom: bottomBarHeight,
              backgroundColor:
                currentTheme.cardBackground || (isDark ? '#1A242D' : '#FFFFFF'),
              borderTopColor:
                currentTheme.border ||
                currentTheme.divider ||
                (isDark ? '#334458' : '#EEF2F6'),
            },
          ]}
        >
          {showSellButton && (
            <TouchableOpacity
              style={[
                styles.sellActionBtn,
                {
                  backgroundColor:
                    (currentTheme as any).primaryBlue ||
                    currentTheme.cashoutButton?.bg ||
                    '#4A8AE8',
                },
              ]}
              activeOpacity={0.85}
              onPress={handleCashout}
            >
              <Text style={styles.sellActionBtnText}>
                Vendre pour {sellPriceFormatted} ₣
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.duplicateBtn,
              {
                marginTop: showSellButton ? 8 : 0,
                backgroundColor: isDark
                  ? ((currentTheme as any).surfaceSecondary ||
                      currentTheme.duplicateButton?.bg ||
                      '#253341')
                  : (currentTheme.duplicateButton?.bg || '#EEF2F6'),
              },
            ]}
            activeOpacity={0.85}
            onPress={handleDuplicate}
          >
            <Text
              style={[
                styles.duplicateBtnText,
                {
                  color:
                    currentTheme.primary ||
                    currentTheme.duplicateButton?.text ||
                    '#4A84C4',
                },
              ]}
            >
              Dupliquer le coupon de pari
            </Text>
          </TouchableOpacity>
        </View>
      )}
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

  // 1. Header
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    color: '#557089',
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
    width: 70,
    gap: 14,
  },
  headerActionBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBellIcon: {
    width: 21,
    height: 21,
    tintColor: '#557089',
  },
  headerThreeDotsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#557089',
    letterSpacing: 1,
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

  // 2. Bloc Résumé Supérieur
  summaryCard: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    width: 48,
    height: 48,
    marginRight: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E9EFF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 26,
    height: 26,
  },
  avatarIconPoker: {
    width: 26,
    height: 26,
    tintColor: '#6E849B',
  },
  avatarIconFifa: {
    width: 28,
    height: 19,
    tintColor: '#6E849B',
  },
  avatarIconCombine: {
    width: 24,
    height: 24,
  },
  statusMiniDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusDotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 12,
  },
  summaryMetaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryDateText: {
    fontSize: 12,
    color: '#6E849B',
    fontWeight: '400',
    marginBottom: 1,
  },
  summaryTypeText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1D2B3A',
    lineHeight: 20,
    marginBottom: 1,
  },
  summaryNumberText: {
    fontSize: 14.5,
    fontWeight: '500',
    letterSpacing: 0.1,
    marginTop: 2,
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

  thinDivider: {
    height: 1,
    backgroundColor: '#F0F4F8',
    marginVertical: 10,
  },
  thinDividerNoMargin: {
    height: 1,
    backgroundColor: '#F0F4F8',
  },

  // Lignes financières
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  financialLabel: {
    fontSize: 14,
    color: '#6E849B',
    fontWeight: '400',
  },
  financialValueBold: {
    fontSize: 14.5,
    color: '#1D2B3A',
    fontWeight: '600',
  },
  financialValueStatus: {
    fontSize: 14.5,
    fontWeight: '500',
  },

  eventsRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  eventsLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  layersIcon: {
    width: 18,
    height: 18,
    marginRight: 9,
    tintColor: '#557089',
  },
  eventsCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#002B49',
  },
  eventsFinishedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#002B49',
  },

  // 3. Cartes d'Événements
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eventSportIconWrap: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  eventSportIcon: {
    width: 26,
    height: 26,
    tintColor: '#6E849B',
  },
  eventPokerIcon: {
    width: 22,
    height: 22,
    tintColor: '#6E849B',
  },
  eventLeagueInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  eventLeagueText: {
    fontSize: 13,
    color: '#6E849B',
    fontWeight: '400',
  },
  eventDateText: {
    fontSize: 12.5,
    color: '#6E849B',
    fontWeight: '400',
    marginTop: 2,
  },

  // Carte Bonus (identique à video_gagnant.mp4 et WhatsApp_Video)
  bonusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  bonusHeaderTitle: {
    fontSize: 13,
    color: '#6E849B',
    fontWeight: '400',
  },
  bonusCenterBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusCenterTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1D2B3A',
    textAlign: 'center',
  },
  bonusFooterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  // Zone Poker (Pixel-Perfect comme sur les captures)
  eventPokerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventPokerTitleLive: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#1D2B3A',
    textAlign: 'center',
    paddingVertical: 14,
  },
  eventPokerTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#1D2B3A',
    textAlign: 'center',
    marginBottom: 6,
  },
  eventPokerRoundText: {
    fontSize: 12,
    color: '#7B8794',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  eventPokerHandsBox: {
    alignItems: 'center',
    width: '100%',
    marginTop: 2,
  },
  eventPokerHandLine: {
    fontSize: 12.5,
    color: '#557089',
    lineHeight: 20,
    textAlign: 'center',
  },
  eventPokerHandLabel: {
    fontWeight: '400',
    color: '#557089',
  },
  eventPokerCardText: {
    fontWeight: '500',
    color: '#557089',
  },
  eventPokerRedCardText: {
    fontWeight: '600',
    color: '#DC2626',
  },
  eventPokerTableLine: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#557089',
    lineHeight: 20,
    marginTop: 2,
    textAlign: 'center',
  },
  eventPokerWinnerLine: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#557089',
    marginTop: 2,
    textAlign: 'center',
  },

  // Zone d'affrontement (Match standard)
  eventMatchBlock: {
    paddingBottom: 10,
  },
  eventFaceoffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  teamLeftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  teamNameLeft: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1D2B3A',
    marginRight: 8,
    textAlign: 'right',
    flexShrink: 1,
  },
  teamRightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamNameRight: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1D2B3A',
    marginLeft: 8,
    textAlign: 'left',
    flexShrink: 1,
  },
  centerScoreContainer: {
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 38,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#002B49',
  },
  mainScoreText: {
    fontSize: 19.5,
    fontWeight: '600',
    color: '#002B49',
    letterSpacing: 0.5,
  },
  detailScoreBelowText: {
    fontSize: 12.5,
    color: '#6E849B',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 8,
  },

  // Zone outright / vainqueur
  eventOutrightContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventOutrightText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1D2B3A',
    textAlign: 'center',
  },

  // Pied de carte d'événement
  eventFooterBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  eventMarketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventMarketName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D2B3A',
    flex: 1,
    marginRight: 10,
  },
  eventOddText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1D2B3A',
  },
  eventLiveElapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  eventLiveElapsedLeft: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  eventLiveElapsedRight: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  eventLiveElapsedRightBold: {
    fontWeight: '600',
  },
  eventStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  eventStatusLabel: {
    fontSize: 13.5,
    color: '#6E849B',
    fontWeight: '400',
  },
  eventStatusValue: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Badge • En direct rouge (Correction 4 : Style exact de la Capture 3)
  liveRedBadge: {
    backgroundColor: '#D94343',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  liveRedBadgeDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#FFFFFF',
    marginRight: 5,
  },
  liveRedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Section Informations supplémentaires (Poker)
  extraInfoBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  extraInfoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#557089',
    marginBottom: 2,
  },
  extraInfoValue: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#002B49',
  },

  // 4. Fixed Footer (Correction 5 : Barre inférieure adaptative multi-thèmes)
  fixedFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 100,
  },
  sellActionBtn: {
    backgroundColor: '#4A8AE8',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '500',
  },
  duplicateBtn: {
    backgroundColor: '#EEF2F6',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  duplicateBtnText: {
    color: '#4A84C4',
    fontSize: 15.5,
    fontWeight: '600',
  },
});
