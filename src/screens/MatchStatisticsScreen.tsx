import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BackArrowIcon } from '../components/common/BackArrowIcon';
import { TeamLogo } from '../components/common/TeamLogo';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { formatFrenchEventDate } from '../utils/dateFormatter';
import {
  StatsPeriodKey,
  StatMetricItem,
  AdditionalInfoItem,
  STATS_PERIOD_TABS,
  buildMatchStatisticsFromEvent,
} from '../data/mockData';

const STADIUM_HEADER_BG = require('../../assets/ui/football_stadium_header_bg.jpg');

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || '#4A8FD6').replace('#', '');
  if (clean.length !== 6) return `rgba(74, 143, 214, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Icône vectorielle officielle "Statistiques de match" (3 barres verticales + point sur la 3e)
 * reproduite au pixel près depuis la capture de référence.
 */
const MatchStatsBarIcon: React.FC<{ color: string; size?: number }> = React.memo(
  ({ color, size = 20 }) => (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Rect x="2.5" y="7" width="3.2" height="12.5" rx="1.6" fill={color} />
      <Rect x="9.4" y="2.5" width="3.2" height="17" rx="1.6" fill={color} />
      <Circle cx="17.9" cy="6.5" r="1.7" fill={color} />
      <Rect x="16.3" y="10.5" width="3.2" height="9" rx="1.6" fill={color} />
    </Svg>
  )
);

interface TeamCrestProps {
  uri: string;
  teamName?: string;
  leagueName?: string;
  size: number;
}

const TeamCrest: React.FC<TeamCrestProps> = ({ uri, teamName, leagueName, size }) => (
  <TeamLogo teamName={teamName || 'Équipe'} logoUrl={uri} leagueName={leagueName} size={size} />
);

interface StatRowProps {
  item: StatMetricItem;
  textPrimary: string;
  textSecondary: string;
  trackColor: string;
  fontFn: (size: number) => number;
}

const StatRow: React.FC<StatRowProps> = React.memo(
  ({ item, textPrimary, textSecondary, trackColor, fontFn }) => {
    const total = item.homeNumeric + item.awayNumeric;
    const homePct = total > 0 ? Math.min(100, Math.max(0, (item.homeNumeric / total) * 100)) : 0;
    const awayPct = total > 0 ? Math.min(100, Math.max(0, (item.awayNumeric / total) * 100)) : 0;

    return (
      <View style={styles.statRowContainer}>
        <View style={styles.statTopLine}>
          <Text style={[styles.statValueLeft, { color: textPrimary, fontSize: fontFn(13.5) }]}>
            {item.homeValue}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.statLabelCenter, { color: textSecondary, fontSize: fontFn(13) }]}
          >
            {item.label}
          </Text>
          <Text style={[styles.statValueRight, { color: textPrimary, fontSize: fontFn(13.5) }]}>
            {item.awayValue}
          </Text>
        </View>

        {/* Barres de progression opposées depuis le centre : Vert (#48B254) à gauche, Bleu (#2BA5E0) à droite */}
        <View style={styles.statBarsRow}>
          <View style={[styles.statTrackLeft, { backgroundColor: trackColor }]}>
            <View
              style={[
                styles.statFillLeft,
                {
                  width: `${homePct}%`,
                  backgroundColor: '#48B254',
                },
              ]}
            />
          </View>
          <View style={[styles.statTrackRight, { backgroundColor: trackColor }]}>
            <View
              style={[
                styles.statFillRight,
                {
                  width: `${awayPct}%`,
                  backgroundColor: '#2BA5E0',
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }
);

type TopSectionTabKey = 'summary' | 'duels' | 'standings';

const TOP_SECTION_TABS: { key: TopSectionTabKey; label: string }[] = [
  { key: 'summary', label: 'Résumé du match' },
  { key: 'duels', label: 'Duels' },
  { key: 'standings', label: 'Classements' },
];

export const MatchStatisticsScreen: React.FC<{ route?: any; navigation?: any }> = ({
  route,
  navigation,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const {
    insets,
    isSmallDevice,
    isTablet,
    isLandscape,
    font,
    contentContainerStyle,
  } = useResponsive();

  const eventParam = route?.params?.event || route?.params?.match;
  const statsData = useMemo(() => buildMatchStatisticsFromEvent(eventParam), [eventParam]);

  const [selectedTopTab, setSelectedTopTab] = useState<TopSectionTabKey>('summary');
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriodKey>('match');
  const [isStatsCardExpanded, setIsStatsCardExpanded] = useState<boolean>(true);
  const [isPeriodLoading, setIsPeriodLoading] = useState<boolean>(false);
  const [activeInfoModal, setActiveInfoModal] = useState<AdditionalInfoItem | null>(null);

  const handleSelectPeriod = useCallback(
    (period: StatsPeriodKey) => {
      if (period === selectedPeriod) return;
      try {
        Haptics.selectionAsync();
      } catch {
        // Ignoré sur web
      }
      setSelectedPeriod(period);
      setIsPeriodLoading(true);
      setTimeout(() => {
        setIsPeriodLoading(false);
      }, 220);
    },
    [selectedPeriod]
  );

  // Couleurs dynamiques multi-thèmes (1xBet/Paripesa = #4A8FD6, Melbet = #DF9F28, etc.)
  const isDark = Boolean(currentTheme.isDark);
  const isMelbet =
    brandChoice === 'melbet' || (currentTheme.name || '').toLowerCase().includes('melbet');
  const accentColor = isMelbet ? '#DF9F28' : currentTheme.primary || '#4A8FD6';
  const sheetOuterBg = isDark ? currentTheme.background || '#0F172A' : '#EBEEF3';
  const cardBg = isDark ? currentTheme.cardBackground || '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? currentTheme.textPrimary || '#F8FAFC' : '#00325E';
  const textSecondary = isDark ? currentTheme.textSecondary || '#94A3B8' : '#5C7690';
  const trackColor = isDark ? 'rgba(255,255,255,0.10)' : '#EAEFF5';
  const dividerColor = isDark ? currentTheme.border || 'rgba(255,255,255,0.08)' : '#E8EEF3';
  const inactivePillBg = isDark ? 'rgba(255,255,255,0.08)' : '#EBEEF3';
  const subSurfaceBg = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset =
    insets.bottom > 0
      ? Math.max(insets.bottom, androidBottomPad)
      : Platform.OS === 'ios'
      ? 20
      : androidBottomPad;
  const bottomBarHeight = 56 + bottomInset;
  const topSafePad = insets.top > 0 ? insets.top : Platform.OS === 'android' ? 28 : 16;

  const activeStatsList = statsData.periods[selectedPeriod] || statsData.periods.match;
  const crestSize = isSmallDevice ? 44 : isTablet ? 54 : 50;

  const formattedMatchDate = useMemo(
    () => formatFrenchEventDate(statsData.matchDate),
    [statsData.matchDate]
  );

  return (
    <View style={[styles.screenRoot, { backgroundColor: sheetOuterBg }]}>
      <StatusBar
        animated
        barStyle="light-content"
        {...({ translucent: true, backgroundColor: 'transparent' } as any)}
      />

      {/* =====================================================================
          HEADER STADE PLEINE LARGEUR (identique à la capture de référence)
          ===================================================================== */}
      <ImageBackground
        source={STADIUM_HEADER_BG}
        style={[styles.stadiumHeaderBg, { paddingTop: topSafePad }]}
        resizeMode="cover"
      >
        <View style={(isTablet || isLandscape) ? styles.centeredMaxWidth : undefined}>
          {/* AppBar : ChevronLeft + Titre « Statistiques » */}
          <View style={styles.appBar}>
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              style={styles.backButton}
              activeOpacity={0.75}
              accessibilityLabel="Retour"
            >
              <BackArrowIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={[styles.appBarTitle, { fontSize: font(17) }]} numberOfLines={1}>
              Statistiques
            </Text>

            <View style={styles.appBarSpacer} />
          </View>

          {/* Nom du sport et du championnat */}
          <Text
            style={[styles.leagueCaption, { fontSize: font(12.5) }]}
            numberOfLines={1}
          >
            {statsData.sportHeader}
          </Text>

          {/* Zone d'affrontement : Logo au-dessus du nom de chaque équipe + Score final au centre */}
          <View style={styles.teamsScoreRow}>
            <View style={styles.teamColumn}>
              <TeamCrest
                uri={statsData.homeTeam.logo}
                teamName={statsData.homeTeam.name}
                leagueName={statsData.sportHeader}
                size={crestSize}
              />
              <Text
                style={[styles.teamNameText, { fontSize: font(13.5) }]}
                numberOfLines={2}
              >
                {statsData.homeTeam.name}
              </Text>
            </View>

            <View style={styles.scoreCenterBox}>
              <Text style={[styles.scoreCenterText, { fontSize: font(27) }]}>
                {statsData.finalScore}
              </Text>
            </View>

            <View style={styles.teamColumn}>
              <TeamCrest
                uri={statsData.awayTeam.logo}
                teamName={statsData.awayTeam.name}
                leagueName={statsData.sportHeader}
                size={crestSize}
              />
              <Text
                style={[styles.teamNameText, { fontSize: font(13.5) }]}
                numberOfLines={2}
              >
                {statsData.awayTeam.name}
              </Text>
            </View>
          </View>

          {/* Date et heure du match sur la pelouse */}
          <Text style={[styles.matchDateCaption, { fontSize: font(12) }]}>
            {formattedMatchDate}
          </Text>
        </View>
      </ImageBackground>

      {/* =====================================================================
          CONTENEUR PRINCIPAL ARRONDI (#EBEEF3) chevauchant le bas du stade
          ===================================================================== */}
      <View
        style={[
          styles.mainRoundedContainer,
          { backgroundColor: sheetOuterBg },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            { paddingBottom: bottomBarHeight + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Pilules de navigation supérieures : Résumé du match | Duels | Classements */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topSectionPillsRow}
          >
            {TOP_SECTION_TABS.map((tab) => {
              const isActive = selectedTopTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.85}
                  onPress={() => setSelectedTopTab(tab.key)}
                  style={[
                    styles.topSectionPill,
                    {
                      backgroundColor: isActive ? accentColor : cardBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.topSectionPillText,
                      {
                        color: isActive ? '#FFFFFF' : textPrimary,
                        fontWeight: isActive ? '500' : '400',
                        fontSize: font(13.5),
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 1. CARTE STATISTIQUES DE MATCH + SÉLECTEUR DE PÉRIODE */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: cardBg,
                borderColor: isDark ? dividerColor : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            {/* En-tête de la carte : Icône 3 barres + "Statistiques de match" + bouton chevron rond */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsStatsCardExpanded((v) => !v)}
              style={styles.statsCardHeaderRow}
            >
              <View style={styles.statsCardHeaderLeft}>
                <MatchStatsBarIcon color={accentColor} size={20} />
                <Text
                  style={[
                    styles.sectionTitlePrimary,
                    { color: textPrimary, fontSize: font(14.5) },
                  ]}
                >
                  Statistiques de match
                </Text>
              </View>

              <View
                style={[
                  styles.collapseCircleBtn,
                  { backgroundColor: inactivePillBg },
                ]}
              >
                <Ionicons
                  name={isStatsCardExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={accentColor}
                />
              </View>
            </TouchableOpacity>

            {isStatsCardExpanded && (
              <>
                {/* Segmented Control / Pills : Match | 1 Mi-temps | 2 Mi-temps */}
                <View style={styles.periodPillsRow}>
                  {STATS_PERIOD_TABS.map((tab) => {
                    const isActive = selectedPeriod === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        activeOpacity={0.82}
                        onPress={() => handleSelectPeriod(tab.key)}
                        style={[
                          styles.periodPill,
                          {
                            backgroundColor: isActive ? accentColor : inactivePillBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.periodPillText,
                            {
                              color: isActive ? '#FFFFFF' : textPrimary,
                              fontWeight: isActive ? '500' : '400',
                              fontSize: font(13.5),
                            },
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Liste des statistiques */}
                {isPeriodLoading ? (
                  <SkeletonLoader variant="statistics-rows" count={8} />
                ) : (
                  <View style={styles.statsListWrap}>
                    {activeStatsList.map((metric, idx) => (
                      <StatRow
                        key={`${selectedPeriod}-${metric.id}-${idx}`}
                        item={metric}
                        textPrimary={textPrimary}
                        textSecondary={textSecondary}
                        trackColor={trackColor}
                        fontFn={font}
                      />
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {/* 2. CARTE « SCORE, CLASSEMENT » */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: cardBg,
                borderColor: isDark ? dividerColor : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionSubtitleMuted,
                { color: textSecondary, fontSize: font(14) },
              ]}
            >
              Score, classement
            </Text>

            <View
              style={[
                styles.scoreTableBox,
                {
                  backgroundColor: subSurfaceBg,
                  borderColor: dividerColor,
                },
              ]}
            >
              <View style={styles.scoreTableHeaderRow}>
                <Text
                  style={[
                    styles.scoreColTeamHeader,
                    { color: textSecondary, fontSize: font(12) },
                  ]}
                >
                  Mi-temps
                </Text>
                <Text
                  style={[
                    styles.scoreColHalfHeader,
                    { color: textSecondary, fontSize: font(12) },
                  ]}
                >
                  1
                </Text>
                <Text
                  style={[
                    styles.scoreColHalfHeader,
                    { color: textSecondary, fontSize: font(12) },
                  ]}
                >
                  2
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.scoreColResultHeader,
                    { color: textSecondary, fontSize: font(12) },
                  ]}
                >
                  Résultat
                </Text>
              </View>

              {statsData.scoreTable.map((row, index) => (
                <View
                  key={`score-row-${index}`}
                  style={[
                    styles.scoreTableTeamRow,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: dividerColor,
                    },
                  ]}
                >
                  <View style={styles.scoreTeamIdentity}>
                    <TeamLogo
                      teamName={row.teamName}
                      logoUrl={row.teamLogo}
                      leagueName={statsData.sportHeader}
                      size={24}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scoreTeamNameText,
                        { color: textPrimary, fontSize: font(13.5) },
                      ]}
                    >
                      {row.teamName}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.scoreCellValue,
                      { color: textPrimary, fontSize: font(13.5) },
                    ]}
                  >
                    {row.firstHalf}
                  </Text>
                  <Text
                    style={[
                      styles.scoreCellValue,
                      { color: textPrimary, fontSize: font(13.5) },
                    ]}
                  >
                    {row.secondHalf}
                  </Text>
                  <Text
                    style={[
                      styles.scoreCellResultValue,
                      { color: textPrimary, fontSize: font(14) },
                    ]}
                  >
                    {row.result}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3. SECTION « INFORMATIONS SUPPLÉMENTAIRES » */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: cardBg,
                borderColor: isDark ? dividerColor : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionSubtitleMuted,
                { color: textSecondary, fontSize: font(14) },
              ]}
            >
              Informations supplémentaires
            </Text>

            <View style={styles.additionalInfoList}>
              {statsData.additionalInfo.map((info) => (
                <TouchableOpacity
                  key={info.id}
                  activeOpacity={0.75}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {
                      // Ignoré sur web
                    }
                    setActiveInfoModal(info);
                  }}
                  style={[
                    styles.additionalInfoRow,
                    {
                      backgroundColor: subSurfaceBg,
                      borderColor: dividerColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.infoCircleBadge,
                      { backgroundColor: hexToRgba(accentColor, isDark ? 0.22 : 0.16) },
                    ]}
                  >
                    {info.iconFamily === 'mci' ? (
                      <MaterialCommunityIcons
                        name={info.iconName as any}
                        size={19}
                        color={accentColor}
                      />
                    ) : (
                      <Ionicons
                        name={info.iconName as any}
                        size={18}
                        color={accentColor}
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.additionalInfoLabel,
                      { color: textPrimary, fontSize: font(14) },
                    ]}
                    numberOfLines={2}
                  >
                    {info.label}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={textSecondary}
                    style={{ opacity: 0.6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Modale d'aperçu au clic sur une ligne « Informations supplémentaires » */}
      <Modal
        visible={Boolean(activeInfoModal)}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveInfoModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setActiveInfoModal(null)}
        >
          <Pressable
            style={[
              styles.modalCard,
              {
                backgroundColor: cardBg,
                borderColor: dividerColor,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {activeInfoModal && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View
                    style={[
                      styles.infoCircleBadge,
                      { backgroundColor: hexToRgba(accentColor, 0.18) },
                    ]}
                  >
                    {activeInfoModal.iconFamily === 'mci' ? (
                      <MaterialCommunityIcons
                        name={activeInfoModal.iconName as any}
                        size={20}
                        color={accentColor}
                      />
                    ) : (
                      <Ionicons
                        name={activeInfoModal.iconName as any}
                        size={19}
                        color={accentColor}
                      />
                    )}
                  </View>
                  <View style={styles.modalHeaderTexts}>
                    <Text
                      style={[
                        styles.modalTitleText,
                        { color: textPrimary, fontSize: font(15.5) },
                      ]}
                    >
                      {activeInfoModal.label}
                    </Text>
                    <Text
                      style={[
                        styles.modalSubtitleText,
                        { color: textSecondary, fontSize: font(12.5) },
                      ]}
                    >
                      {activeInfoModal.detailTitle}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setActiveInfoModal(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={22} color={textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBodyLines}>
                  {activeInfoModal.detailLines.map((line, idx) => (
                    <View
                      key={`line-${idx}`}
                      style={[
                        styles.modalLineItem,
                        { backgroundColor: subSurfaceBg, borderColor: dividerColor },
                      ]}
                    >
                      <View
                        style={[styles.modalBulletDot, { backgroundColor: accentColor }]}
                      />
                      <Text
                        style={[
                          styles.modalLineText,
                          { color: textPrimary, fontSize: font(13.5) },
                        ]}
                      >
                        {line}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingBottom: 24,
    backgroundColor: '#0E351A',
  },
  appBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  appBarSpacer: {
    width: 38,
  },
  leagueCaption: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  teamsScoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 18,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamNameText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  fallbackCrestCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  scoreCenterBox: {
    paddingHorizontal: 12,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenterText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  matchDateCaption: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 12,
  },
  mainRoundedContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -12,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96,
  },
  topSectionPillsRow: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
    alignItems: 'center',
  },
  topSectionPill: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSectionPillText: {
    letterSpacing: 0.1,
  },
  sectionCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  statsCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statsCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  sectionTitlePrimary: {
    fontWeight: '600',
  },
  collapseCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSubtitleMuted: {
    fontWeight: '600',
    marginBottom: 12,
  },
  periodPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  periodPill: {
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPillText: {
    letterSpacing: 0.1,
  },
  statsListWrap: {
    marginTop: 2,
  },
  statRowContainer: {
    paddingVertical: 9,
  },
  statTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  statValueLeft: {
    minWidth: 46,
    fontWeight: '600',
    textAlign: 'left',
  },
  statLabelCenter: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: 8,
  },
  statValueRight: {
    minWidth: 46,
    fontWeight: '600',
    textAlign: 'right',
  },
  statBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statTrackLeft: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  statFillLeft: {
    height: '100%',
    borderRadius: 3,
  },
  statTrackRight: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  statFillRight: {
    height: '100%',
    borderRadius: 3,
  },
  scoreTableBox: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  scoreTableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  scoreColTeamHeader: {
    flex: 1,
    fontWeight: '500',
  },
  scoreColHalfHeader: {
    width: 34,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreColResultHeader: {
    width: 58,
    textAlign: 'right',
    fontWeight: '500',
  },
  scoreTableTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  scoreTeamIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingRight: 8,
  },
  scoreTeamMiniLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  scoreTeamNameText: {
    flex: 1,
    fontWeight: '600',
  },
  scoreCellValue: {
    width: 34,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreCellResultValue: {
    width: 58,
    textAlign: 'right',
    fontWeight: '700',
  },
  additionalInfoList: {
    gap: 8,
  },
  additionalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  infoCircleBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalInfoLabel: {
    flex: 1,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    padding: 14,
  },
  modalCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  modalHeaderTexts: {
    flex: 1,
  },
  modalTitleText: {
    fontWeight: '700',
  },
  modalSubtitleText: {
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBodyLines: {
    gap: 8,
  },
  modalLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modalBulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  modalLineText: {
    flex: 1,
    fontWeight: '500',
  },
});

export default MatchStatisticsScreen;
