import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BackArrowIcon } from '../components/common/BackArrowIcon';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../stores/themeStore';
import { useCouponStore } from '../store/couponStore';
import { useResponsive } from '../utils/responsive';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatFootballHeader } from '../utils/dateFormatter';
import { formatBetSelectionLabel } from '../utils/scoreAdapter';
import {
  MarketPeriodKey,
  MarketGroupItem,
  MarketOddOption,
  MARKET_PERIOD_TABS,
  buildMatchMarketsFromEvent,
} from '../data/mockData';

const STADIUM_HEADER_BG = require('../../assets/ui/football_stadium_header_bg.jpg');

// ============================================================================
// HOOK : COMPTE À REBOURS DYNAMIQUE (useCountdown)
// ============================================================================

export function useCountdown(initialSeconds: number) {
  const [remaining, setRemaining] = useState<number>(Math.max(0, initialSeconds));

  useEffect(() => {
    setRemaining(Math.max(0, initialSeconds));
  }, [initialSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return {
    hours,
    minutes,
    seconds,
    spacedFormatted: `${hours} : ${minutes} : ${seconds}`,
    compactFormatted: `${hours}:${minutes}:${seconds}`,
  };
}

function isBrightHex(hex: string): boolean {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

/**
 * Formate la date d'avant-match au format "DD.MM.YYYY (HH:mm)" fidèle à la capture 1xBet
 */
function formatPreMatchDotDate(raw?: string): string {
  if (!raw) return '01.11.2026 (14:30)';
  const trimmed = raw.trim();
  if (/^\d{2}\.\d{2}\.\d{4}\s*\(\d{2}:\d{2}\)$/.test(trimmed)) {
    return trimmed;
  }
  const monthMap: Record<string, string> = {
    jan: '01',
    fév: '02',
    fev: '02',
    mar: '03',
    avr: '04',
    mai: '05',
    juin: '06',
    juil: '07',
    aoû: '08',
    aou: '08',
    sep: '09',
    oct: '10',
    nov: '11',
    déc: '12',
    dec: '12',
  };
  const frMatch = trimmed.match(/(\d{1,2})\s+([a-zéû]+)\.?\s+(\d{4})\s*\((\d{1,2}:\d{2})/i);
  if (frMatch) {
    const day = frMatch[1].padStart(2, '0');
    const monPrefix = frMatch[2].toLowerCase().slice(0, 3);
    const mon = monthMap[monPrefix] || '11';
    const year = frMatch[3];
    const time = frMatch[4].padStart(5, '0');
    return `${day}.${mon}.${year} (${time})`;
  }
  const slashMatch = trimmed.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:.*?(\d{1,2}:\d{2}))?/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const mon = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    const time = (slashMatch[4] || '14:30').padStart(5, '0');
    return `${day}.${mon}.${year} (${time})`;
  }
  return trimmed;
}

type MarketCategoryKey = 'all' | 'popular' | 'total' | 'handicap';

const MARKET_CATEGORY_PILLS: { key: MarketCategoryKey; label: string; hasBadge?: boolean }[] = [
  { key: 'all', label: 'Tous les marchés' },
  { key: 'popular', label: 'Populaires', hasBadge: true },
  { key: 'total', label: 'Total' },
  { key: 'handicap', label: 'Handicap' },
];

// ============================================================================
// SOUS-COMPOSANT : LIGNE ACCORDÉON DE MARCHÉ DE PARI (Pixel-Perfect)
// ============================================================================

interface MarketAccordionCardProps {
  market: MarketGroupItem;
  isExpanded: boolean;
  isPinned: boolean;
  selectedOptionIds: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSelectOdd: (market: MarketGroupItem, option: MarketOddOption) => void;
  cardBg: string;
  oddChipBg: string;
  textPrimary: string;
  textSecondary: string;
  dividerColor: string;
  accentColor: string;
  accentTextColor: string;
  fontFn: (size: number) => number;
}

const MarketAccordionCard: React.FC<MarketAccordionCardProps> = React.memo(
  ({
    market,
    isExpanded,
    isPinned,
    selectedOptionIds,
    onToggleExpand,
    onTogglePin,
    onSelectOdd,
    cardBg,
    oddChipBg,
    textPrimary,
    textSecondary,
    dividerColor,
    accentColor,
    accentTextColor,
    fontFn,
  }) => {
    const rows = useMemo(() => {
      const cols = market.columns || 3;
      const chunked: MarketOddOption[][] = [];
      for (let i = 0; i < market.options.length; i += cols) {
        chunked.push(market.options.slice(i, i + cols));
      }
      return chunked;
    }, [market.options, market.columns]);

    const showInfoBadge =
      market.id.includes('2up') || market.title.toUpperCase().includes('2UP');

    return (
      <View
        style={[
          styles.marketRowSection,
          {
            backgroundColor: cardBg,
            borderBottomColor: dividerColor,
          },
        ]}
      >
        {/* En-tête cliquable du marché */}
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => onToggleExpand(market.id)}
          style={styles.marketHeaderRow}
        >
          <Text
            style={[
              styles.marketTitleText,
              { color: textPrimary, fontSize: fontFn(14.5) },
            ]}
            numberOfLines={2}
          >
            {market.title}
          </Text>

          <View style={styles.marketHeaderActions}>
            {showInfoBadge && (
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() =>
                  Alert.alert(
                    '1X2 (2UP)',
                    'Votre pari est automatiquement gagnant dès que votre équipe mène de 2 buts d’écart !'
                  )
                }
                style={styles.infoIconButton}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color={accentColor}
                />
              </TouchableOpacity>
            )}

            {!isExpanded && market.optionCount !== undefined && (
              <Text
                style={[
                  styles.marketCountBadgeText,
                  { color: textSecondary, fontSize: fontFn(14) },
                ]}
              >
                ({market.optionCount})
              </Text>
            )}

            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onTogglePin(market.id)}
              style={styles.pinButton}
              accessibilityLabel="Épingler le marché"
            >
              <MaterialCommunityIcons
                name="pin"
                size={18}
                color={isPinned ? accentColor : '#94A3B8'}
                style={styles.pinIconRotated}
              />
            </TouchableOpacity>

            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={accentColor}
            />
          </View>
        </TouchableOpacity>

        {/* Grille de boutons de cotes (Label centré en haut, Cote en gras en bas) */}
        {isExpanded && (
          <View style={styles.oddsGridWrap}>
            {rows.map((rowOptions, rIdx) => (
              <View key={`${market.id}-row-${rIdx}`} style={styles.oddsRow}>
                {rowOptions.map((opt) => {
                  const isSelected = Boolean(selectedOptionIds[opt.id]);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.8}
                      onPress={() => onSelectOdd(market, opt)}
                      style={[
                        styles.oddButton,
                        {
                          backgroundColor: isSelected ? accentColor : oddChipBg,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.oddChoiceLabel,
                          {
                            color: isSelected ? accentTextColor : textSecondary,
                            fontSize: fontFn(12.5),
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={[
                          styles.oddValueText,
                          {
                            color: isSelected ? accentTextColor : textPrimary,
                            fontSize: fontFn(14),
                          },
                        ]}
                      >
                        {opt.odd}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
);

// ============================================================================
// ÉCRAN PRINCIPAL : MatchMarketsScreen (Avant-Match Football — Pixel-Perfect)
// ============================================================================

export const MatchMarketsScreen: React.FC<{ route?: any; navigation?: any }> = ({
  route,
  navigation,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const { addEvent, removeEvent } = useCouponStore();
  const {
    insets,
    isSmallDevice,
    isTablet,
    isLandscape,
    font,
    contentContainerStyle,
  } = useResponsive();

  const eventParam = route?.params?.event || route?.params?.match;
  const marketsData = useMemo(() => buildMatchMarketsFromEvent(eventParam), [eventParam]);
  const countdown = useCountdown(marketsData.initialCountdownSeconds);

  const [selectedPeriod, setSelectedPeriod] = useState<MarketPeriodKey>('regular');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategoryKey>('all');
  const [isLoadingMarkets, setIsLoadingMarkets] = useState<boolean>(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [pinnedMap, setPinnedMap] = useState<Record<string, boolean>>({
    pin_total_pair: true,
    pin_12_total_eq1: true,
  });
  const [selectedOddsMap, setSelectedOddsMap] = useState<Record<string, boolean>>({});
  const [homeFavorite, setHomeFavorite] = useState<boolean>(false);
  const [awayFavorite, setAwayFavorite] = useState<boolean>(false);
  const [oneClickBetActive, setOneClickBetActive] = useState<boolean>(false);

  const currentPeriodMarkets = useMemo(
    () => marketsData.periods[selectedPeriod] || marketsData.periods.regular,
    [marketsData, selectedPeriod]
  );

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    const initialSelected: Record<string, boolean> = {};
    const targetOdd = Number(eventParam?.odd || 0);
    const rawPred = String(eventParam?.prediction || '').toLowerCase();

    currentPeriodMarkets.forEach((m) => {
      initialExpanded[m.id] = m.defaultExpanded;
      if (rawPred && selectedPeriod === 'regular') {
        m.options.forEach((opt) => {
          const fullLabel = `${m.title}. ${opt.label}`.toLowerCase();
          if (
            fullLabel === rawPred ||
            (targetOdd > 1 &&
              Math.abs(opt.odd - targetOdd) < 0.002 &&
              rawPred.includes(m.title.toLowerCase().split(' ')[0]))
          ) {
            initialSelected[opt.id] = true;
            initialExpanded[m.id] = true;
          }
        });
      }
    });
    setExpandedMap(initialExpanded);
    if (selectedPeriod === 'regular') {
      setSelectedOddsMap(initialSelected);
    }
  }, [selectedPeriod, marketsData.eventId, currentPeriodMarkets, eventParam?.odd, eventParam?.prediction]);

  const handleSelectPeriod = useCallback(
    (periodKey: MarketPeriodKey) => {
      if (periodKey === selectedPeriod) return;
      try {
        Haptics.selectionAsync();
      } catch {
        // Ignoré sur web
      }
      setSelectedPeriod(periodKey);
    },
    [selectedPeriod]
  );

  const handleToggleExpand = useCallback((marketId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignoré sur web
    }
    setExpandedMap((prev) => ({
      ...prev,
      [marketId]: !prev[marketId],
    }));
  }, []);

  const handleTogglePin = useCallback((marketId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignoré sur web
    }
    setPinnedMap((prev) => ({
      ...prev,
      [marketId]: !prev[marketId],
    }));
  }, []);

  const handleToggleAllAccordions = useCallback(() => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignoré sur web
    }
    const anyCollapsed = currentPeriodMarkets.some((m) => !expandedMap[m.id]);
    const nextState: Record<string, boolean> = {};
    currentPeriodMarkets.forEach((m) => {
      nextState[m.id] = anyCollapsed;
    });
    setExpandedMap(nextState);
  }, [currentPeriodMarkets, expandedMap]);

  const handleSelectOdd = useCallback(
    (market: MarketGroupItem, option: MarketOddOption) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Ignoré sur web
      }

      const selectionEventId = `mkt-${marketsData.eventId}-${market.id}-${option.id}`;
      const formattedPred = formatBetSelectionLabel({
        period: selectedPeriod,
        marketTitle: market.title,
        optionLabel: option.label,
      });
      setSelectedOddsMap((prev) => {
        const nextSelected = !prev[option.id];
        if (nextSelected) {
          addEvent({
            id: selectionEventId,
            sport: marketsData.sport,
            league: marketsData.competitionTitle,
            date: marketsData.matchDate,
            homeTeam: marketsData.homeTeam,
            awayTeam: marketsData.awayTeam,
            prediction: formattedPred,
            odd: option.odd,
            status: 'Accepté',
            gameCategory: 'sports',
          });
        } else {
          removeEvent(selectionEventId);
        }
        return {
          ...prev,
          [option.id]: nextSelected,
        };
      });

      if (oneClickBetActive) {
        Alert.alert(
          'Pari en 1 clic',
          `Sélection "${formattedPred}" (cote ${option.odd}) ajoutée instantanément.`
        );
      }
    },
    [addEvent, removeEvent, marketsData, oneClickBetActive, selectedPeriod]
  );

  // Filtrage par catégorie (Tous les marchés / Populaires / Total / Handicap) + tri épinglés
  const orderedMarkets = useMemo(() => {
    let filtered = currentPeriodMarkets;
    if (selectedCategory === 'popular') {
      filtered = currentPeriodMarkets.filter((m) => m.isPrimary || pinnedMap[m.id]);
    } else if (selectedCategory === 'total') {
      filtered = currentPeriodMarkets.filter((m) =>
        m.title.toLowerCase().includes('total')
      );
    } else if (selectedCategory === 'handicap') {
      filtered = currentPeriodMarkets.filter((m) =>
        m.title.toLowerCase().includes('handicap')
      );
    }
    const pinned = filtered.filter((m) => pinnedMap[m.id]);
    const unpinned = filtered.filter((m) => !pinnedMap[m.id]);
    return [...pinned, ...unpinned];
  }, [currentPeriodMarkets, pinnedMap, selectedCategory]);

  // =========================================================================
  // PALETTE MULTI-THÈMES ADAPTATIVE
  // =========================================================================
  const isDark = Boolean(currentTheme.isDark);
  const isMelbet =
    brandChoice === 'melbet' || (currentTheme.name || '').toLowerCase().includes('melbet');

  const accentColor = isMelbet ? '#DF9F28' : currentTheme.primary || '#4A8FD6';
  const accentTextColor = isBrightHex(accentColor) ? '#1E293B' : '#FFFFFF';
  const favBadgeColor = isMelbet ? '#DF9F28' : '#4A8FD6';

  const cardBg = isDark ? currentTheme.cardBackground || '#1E293B' : '#FFFFFF';
  const oddChipBg = isDark ? 'rgba(255, 255, 255, 0.08)' : '#EAEFF5';
  const textPrimary = isDark ? currentTheme.textPrimary || '#F8FAFC' : '#00325E';
  const textSecondary = isDark ? currentTheme.textSecondary || '#94A3B8' : '#5C7690';
  const dividerColor = isDark ? currentTheme.border || 'rgba(255,255,255,0.08)' : '#E8EEF3';

  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset =
    insets.bottom > 0
      ? Math.max(insets.bottom, androidBottomPad)
      : Platform.OS === 'ios'
      ? 20
      : androidBottomPad;
  const bottomBarHeight = 56 + bottomInset;
  const topSafePad = insets.top > 0 ? insets.top : Platform.OS === 'android' ? 28 : 16;
  const crestSize = isSmallDevice ? 46 : 52;

  const formattedHeaderTitle = useMemo(
    () => formatFootballHeader(marketsData.sport || 'Football', marketsData.competitionTitle),
    [marketsData.sport, marketsData.competitionTitle]
  );

  const formattedDotDate = useMemo(
    () => formatPreMatchDotDate(marketsData.matchDate),
    [marketsData.matchDate]
  );

  return (
    <View style={[styles.screenRoot, { backgroundColor: cardBg }]}>
      <StatusBar
        animated
        barStyle="light-content"
        {...({ translucent: true, backgroundColor: 'transparent' } as any)}
      />

      {/* =====================================================================
          1. HEADER STADE PLEINE LARGEUR (identique à la capture de référence)
          ===================================================================== */}
      <ImageBackground
        source={STADIUM_HEADER_BG}
        style={[styles.stadiumHeaderBg, { paddingTop: topSafePad }]}
        resizeMode="cover"
      >
        <View style={(isTablet || isLandscape) ? styles.centeredMaxWidth : undefined}>
          {/* Top AppBar : < | Football . Pays. Compétition | ⚡ | ⋮ */}
          <View style={styles.appBarRow}>
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              style={styles.headerIconBtn}
              activeOpacity={0.75}
              accessibilityLabel="Retour"
            >
              <BackArrowIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text
              style={[styles.appBarTitle, { fontSize: font(16.5) }]}
              numberOfLines={1}
            >
              {formattedHeaderTitle}
            </Text>

            <View style={styles.headerRightIcons}>
              <TouchableOpacity
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {
                    // Ignoré sur web
                  }
                  setOneClickBetActive((v) => !v);
                }}
                style={styles.headerIconBtn}
                activeOpacity={0.75}
                accessibilityLabel="Pari éclair"
              >
                <Ionicons
                  name="flash"
                  size={21}
                  color={oneClickBetActive ? '#FACC15' : '#FFFFFF'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  navigation?.navigate?.('MatchStatistics', {
                    event: eventParam || {
                      sport: marketsData.sport,
                      league: marketsData.competitionTitle,
                      date: marketsData.matchDate,
                      homeTeam: marketsData.homeTeam,
                      awayTeam: marketsData.awayTeam,
                      actualScore: '0:0',
                    },
                  })
                }
                style={styles.headerIconBtn}
                activeOpacity={0.75}
                accessibilityLabel="Plus d'options"
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sous-titre du tour : ex. "Tour 11. Pays-Bas" */}
          <Text style={[styles.roundSubtitleText, { fontSize: font(11.5) }]}>
            {marketsData.roundSubtitle}
          </Text>

          {/* Zone d'affrontement : Logo au-dessus du nom + badge étoile + VS + Démarre dans */}
          <View style={styles.confrontationRow}>
            {/* Équipe Domicile */}
            <View style={styles.teamColumn}>
              <View style={[styles.crestWrap, { width: crestSize + 8, height: crestSize + 4 }]}>
                <Image
                  source={{ uri: marketsData.homeTeam.logo }}
                  style={{ width: crestSize, height: crestSize }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setHomeFavorite((v) => !v)}
                  style={[
                    styles.favStarBadge,
                    styles.favStarBadgeLeft,
                    { backgroundColor: favBadgeColor },
                  ]}
                >
                  <Ionicons
                    name={homeFavorite ? 'star' : 'star-outline'}
                    size={13}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[styles.teamNameText, { fontSize: font(13.5) }]}
                numberOfLines={2}
              >
                {marketsData.homeTeam.name}
              </Text>
            </View>

            {/* Centre : VS + Démarre dans + Compte à rebours */}
            <View style={styles.vsCountdownCenter}>
              <Text style={[styles.vsCenterLabel, { fontSize: font(22) }]}>VS</Text>
              <Text style={[styles.startsInCaption, { fontSize: font(11.5) }]}>
                Démarre dans
              </Text>
              <Text style={[styles.countdownTimerText, { fontSize: font(13.5) }]}>
                {countdown.spacedFormatted}
              </Text>
            </View>

            {/* Équipe Extérieur */}
            <View style={styles.teamColumn}>
              <View style={[styles.crestWrap, { width: crestSize + 8, height: crestSize + 4 }]}>
                <Image
                  source={{ uri: marketsData.awayTeam.logo }}
                  style={{ width: crestSize, height: crestSize }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setAwayFavorite((v) => !v)}
                  style={[
                    styles.favStarBadge,
                    styles.favStarBadgeRight,
                    { backgroundColor: favBadgeColor },
                  ]}
                >
                  <Ionicons
                    name={awayFavorite ? 'star' : 'star-outline'}
                    size={13}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[styles.teamNameText, { fontSize: font(13.5) }]}
                numberOfLines={2}
              >
                {marketsData.awayTeam.name}
              </Text>
            </View>
          </View>

          {/* Date sur la pelouse + indicateurs de pagination */}
          <Text style={[styles.pitchDateText, { fontSize: font(12) }]}>
            {formattedDotDate}
          </Text>

          <View style={styles.paginationDotsRow}>
            <View style={styles.paginationDashActive} />
            <View style={styles.paginationDashInactive} />
            <View style={styles.paginationDashInactive} />
            <View style={styles.paginationDashInactive} />
          </View>

          {/* Pilules de catégories sur le bas de la pelouse : Tous les marchés | Populaires | Total | Handicap */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsRow}
          >
            {MARKET_CATEGORY_PILLS.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCategory(cat.key)}
                  style={[
                    styles.categoryPill,
                    isActive ? styles.categoryPillActive : styles.categoryPillInactive,
                  ]}
                >
                  {cat.hasBadge && (
                    <View style={styles.popularBurstBadge}>
                      <MaterialCommunityIcons
                        name="decagram"
                        size={17}
                        color={isActive ? '#0F172A' : '#FFFFFF'}
                      />
                      <Ionicons
                        name="star"
                        size={8}
                        color={isActive ? '#FFFFFF' : '#2E4C34'}
                        style={styles.popularInnerStar}
                      />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.categoryPillText,
                      {
                        color: isActive ? '#0F172A' : '#FFFFFF',
                        fontWeight: isActive ? '500' : '400',
                        fontSize: font(13.5),
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sous-barre sombre : Pinceau + Liste + Onglets de périodes avec soulignement vert */}
        <View style={styles.darkSubToolbar}>
          <View
            style={[
              styles.darkSubToolbarInner,
              (isTablet || isLandscape) && styles.centeredMaxWidth,
            ]}
          >
            <View style={styles.toolbarLeftIcons}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleToggleAllAccordions}
                style={styles.toolbarIconBtn}
                accessibilityLabel="Personnaliser l'affichage"
              >
                <MaterialCommunityIcons
                  name="brush-outline"
                  size={20}
                  color="rgba(255,255,255,0.68)"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleToggleAllAccordions}
                style={styles.toolbarIconBtn}
                accessibilityLabel="Déplier ou replier tous les marchés"
              >
                <Ionicons name="list" size={20} color="rgba(255,255,255,0.68)" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodTabsUnderlineScroll}
            >
              {MARKET_PERIOD_TABS.map((tab) => {
                const isActive = selectedPeriod === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPeriod(tab.key)}
                    style={styles.periodUnderlineTab}
                  >
                    <Text
                      style={[
                        styles.periodUnderlineTabText,
                        {
                          color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.62)',
                          fontWeight: isActive ? '500' : '400',
                          fontSize: font(13.5),
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                    {isActive && <View style={styles.periodActiveGreenBar} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>

      {/* =====================================================================
          2. LISTE DES MARCHÉS DE PARIS (Fond blanc uni + séparateurs fins)
          ===================================================================== */}
      <ScrollView
        style={[styles.marketsScrollView, { backgroundColor: cardBg }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.marketsScrollContent,
          contentContainerStyle,
          { paddingBottom: bottomBarHeight + 28 },
        ]}
      >
        {isLoadingMarkets ? (
          <SkeletonLoader variant="markets-list" count={4} />
        ) : (
          <View style={styles.flatMarketsContainer}>
            {orderedMarkets.map((market) => (
              <MarketAccordionCard
                key={`${selectedPeriod}-${market.id}`}
                market={market}
                isExpanded={Boolean(expandedMap[market.id])}
                isPinned={Boolean(pinnedMap[market.id])}
                selectedOptionIds={selectedOddsMap}
                onToggleExpand={handleToggleExpand}
                onTogglePin={handleTogglePin}
                onSelectOdd={handleSelectOdd}
                cardBg={cardBg}
                oddChipBg={oddChipBg}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                dividerColor={dividerColor}
                accentColor={accentColor}
                accentTextColor={accentTextColor}
                fontFn={font}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  centeredMaxWidth: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  stadiumHeaderBg: {
    width: '100%',
    backgroundColor: '#0E351A',
  },
  appBarRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roundSubtitleText: {
    color: 'rgba(255, 255, 255, 0.90)',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  confrontationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 2,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  crestWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  favStarBadge: {
    position: 'absolute',
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favStarBadgeLeft: {
    left: -4,
  },
  favStarBadgeRight: {
    right: -4,
  },
  teamNameText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  vsCountdownCenter: {
    width: 118,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
  },
  vsCenterLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  startsInCaption: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontWeight: '400',
  },
  countdownTimerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  pitchDateText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 16,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  paginationDashActive: {
    width: 10,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  paginationDashInactive: {
    width: 6,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
  },
  categoryPillsRow: {
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 11,
    gap: 8,
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 7.5,
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#FFFFFF',
  },
  categoryPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.23)',
  },
  popularBurstBadge: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularInnerStar: {
    position: 'absolute',
  },
  categoryPillText: {
    letterSpacing: 0.1,
  },
  darkSubToolbar: {
    backgroundColor: 'rgba(6, 20, 11, 0.88)',
    width: '100%',
  },
  darkSubToolbarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  toolbarLeftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  toolbarIconBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodTabsUnderlineScroll: {
    paddingRight: 14,
    alignItems: 'center',
  },
  periodUnderlineTab: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  periodUnderlineTabText: {
    letterSpacing: 0.1,
  },
  periodActiveGreenBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#48B254',
  },
  marketsScrollView: {
    flex: 1,
  },
  marketsScrollContent: {
    paddingTop: 0,
  },
  flatMarketsContainer: {
    width: '100%',
  },
  marketRowSection: {
    width: '100%',
    borderBottomWidth: 1,
  },
  marketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  marketTitleText: {
    flex: 1,
    fontWeight: '600',
  },
  marketHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIconButton: {
    padding: 1,
  },
  marketCountBadgeText: {
    fontWeight: '400',
  },
  pinButton: {
    padding: 2,
  },
  pinIconRotated: {
    transform: [{ rotate: '42deg' }],
  },
  oddsGridWrap: {
    paddingHorizontal: 12,
    paddingBottom: 13,
    paddingTop: 1,
    gap: 8,
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oddButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  oddChoiceLabel: {
    fontWeight: '400',
    textAlign: 'center',
  },
  oddValueText: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default MatchMarketsScreen;
