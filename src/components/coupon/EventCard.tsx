import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchEvent } from '../../types/bet';
import { formatFrenchEventDate, formatBetDate } from '../../utils/dateFormatter';
import { formatCleanOdds } from '../../utils/oddsFormatter';
import { useThemeStore } from '../../store/themeStore';
import { TeamLogo } from '../common/TeamLogo';
import { SoccerBallCouponIcon } from '../common/CouponIcons';

export type OddTrendDirection = 'up' | 'down' | 'stable';

interface EventCardProps {
  event: MatchEvent;
  onRemove: (eventId: string) => void;
  theme?: any;
  liveOdd?: number;
  oddTrend?: OddTrendDirection;
}

/**
 * Carte de Sélection du Coupon (CouponMatchCard)
 * S'adapte au pixel près selon la marque et le thème actif :
 * - 1xBet / Melbet / WinWin / BetWinner : Carte avec blasons face-à-face (Team 1 [Logo] VS [Logo] Team 2)
 * - PariPesa / MegaPari : Carte compacte (Team 1 - Team 2, Date + Temps réglementaire, Bannière 1X2: V1 | Cote)
 */
export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRemove,
  theme,
  liveOdd,
}) => {
  const { currentTheme: storeTheme, currentBrand } = useThemeStore();
  const activeTheme = theme || storeTheme;
  const isDark = Boolean(activeTheme?.isDark);

  const themeName = String(
    activeTheme?.name || activeTheme?.key || currentBrand || '1xbet'
  ).toLowerCase();

  const isParipesa = themeName.includes('paripesa');
  const isMegaPari = themeName.includes('megapari');
  const isMelbet = themeName.includes('melbet');
  const isWinWin = themeName.includes('winwin');
  const isBetWinner = themeName.includes('betwinner');
  const isBlack = themeName.includes('black');
  const isCompactBrand = isParipesa || isMegaPari;

  // 1. Horodatage formaté selon la marque
  const formattedFrenchDate = useMemo(() => {
    return formatFrenchEventDate(
      event.matchDate || event.date || event.startDate || '03 nov. 2026 (21:00)',
      event.matchTime
    );
  }, [event.matchDate, event.matchTime, event.date, event.startDate]);

  const formattedDotDate = useMemo(() => {
    const rawSource =
      event.date ||
      (event.matchDate && event.matchTime
        ? `${event.matchDate} (${event.matchTime})`
        : event.matchDate) ||
      event.startDate ||
      '01.11.2026 (17:30)';
    return formatBetDate(rawSource);
  }, [event.matchDate, event.matchTime, event.date, event.startDate]);

  // 2. Formatage marché encastré
  const { fullMarketDisplay, shortMarketDisplay } = useMemo(() => {
    const raw = (event.prediction || 'Temps réglementaire, 1X2: V1').trim();
    const cleanedShort = raw
      .replace(/^temps\s+r[ée]glementaire\s*[.,:-]?\s*/i, '')
      .replace(/^([^:.]+)\.\s*/, '$1: ')
      .trim();
    const shortText = cleanedShort.includes(':')
      ? cleanedShort
      : `1X2: ${cleanedShort || 'V1'}`;

    const fullText = raw.toLowerCase().includes('temps réglementaire')
      ? raw
      : `Temps réglementaire, ${shortText}`;

    return {
      fullMarketDisplay: fullText,
      shortMarketDisplay: shortText,
    };
  }, [event.prediction]);

  // 3. Cote affichée
  const effectiveOdd = liveOdd !== undefined ? liveOdd : (event.odd || 4.98);
  const oddDisplay = useMemo(() => formatCleanOdds(effectiveOdd), [effectiveOdd]);

  // 4. Équipes et blasons
  const homeName =
    typeof event.homeTeam === 'string'
      ? event.homeTeam
      : event.homeTeam?.name || 'Villarreal';
  const awayName =
    typeof event.awayTeam === 'string'
      ? event.awayTeam
      : event.awayTeam?.name || 'Paris Saint-Germain';
  const homeLogoUri =
    typeof event.homeTeam === 'object' ? event.homeTeam?.logo : undefined;
  const awayLogoUri =
    typeof event.awayTeam === 'object' ? event.awayTeam?.logo : undefined;

  const isHomeVillarreal = homeName.toLowerCase().includes('villarreal');
  const isAwayPsg =
    awayName.toLowerCase().includes('paris') ||
    awayName.toLowerCase().includes('psg');

  // ===========================================================================
  // RENDU A : CARTE COMPACTE PARIPESA & MEGAPARI (Fidèle aux captures 12.29.00 & 12.29.01)
  // ===========================================================================
  if (isCompactBrand) {
    const compactCardBg = isParipesa
      ? isDark
        ? isBlack
          ? '#0C0E13'
          : '#282F39'
        : '#FFFFFF'
      : isDark
        ? isBlack
          ? '#0B0E12'
          : '#1A1F25'
        : '#FFFFFF';

    const compactTitleColor = isDark
      ? '#FFFFFF'
      : isParipesa
        ? '#0B1A33'
        : '#1E242C';

    const compactSubtitleColor = isParipesa
      ? isDark
        ? '#8E99AB'
        : '#5E7396'
      : isDark
        ? '#8A939E'
        : '#64748B';

    const compactCloseColor = isParipesa
      ? isDark
        ? '#4460F2'
        : '#2E45CF'
      : '#CB3222';

    const compactSubBoxBg = isParipesa
      ? isDark
        ? isBlack
          ? '#14171F'
          : '#1D212A'
        : '#EBEEF3'
      : isDark
        ? isBlack
          ? '#050608'
          : '#111111'
        : '#EEF0F4';

    const dateLineText = isParipesa
      ? `${formattedDotDate}, Temps réglementaire`
      : `${formattedFrenchDate}, Temps réglementaire`;

    return (
      <View style={[styles.compactCardContainer, { backgroundColor: compactCardBg }]}>
        {/* Ligne 1 : Équipe 1 - Équipe 2 à gauche | Croix X à droite */}
        <View style={styles.compactTopRow}>
          <Text
            style={[styles.compactTeamsTitle, { color: compactTitleColor }]}
            numberOfLines={1}
          >
            {homeName} - {awayName}
          </Text>

          <TouchableOpacity
            onPress={() => onRemove(event.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
            accessibilityLabel="Supprimer du coupon"
          >
            <Ionicons name="close" size={19} color={compactCloseColor} />
          </TouchableOpacity>
        </View>

        {/* Ligne 2 : Date + Temps réglementaire */}
        <Text
          style={[styles.compactDateSubtitle, { color: compactSubtitleColor }]}
          numberOfLines={1}
        >
          {dateLineText}
        </Text>

        {/* Ligne 3 : Bannière encastrée (1X2: V1 | Cote) */}
        <View style={[styles.compactMarketBanner, { backgroundColor: compactSubBoxBg }]}>
          <Text
            style={[styles.compactMarketText, { color: compactSubtitleColor }]}
            numberOfLines={1}
          >
            {shortMarketDisplay}
          </Text>
          <Text style={[styles.compactOddValue, { color: compactTitleColor }]}>
            {oddDisplay}
          </Text>
        </View>
      </View>
    );
  }

  // ===========================================================================
  // RENDU B : CARTE BLASONS FACE-À-FACE 1XBET / MELBET / WINWIN / BETWINNER
  // ===========================================================================
  const cardBg = isDark
    ? isBlack
      ? activeTheme?.cardBackground || '#0B0F14'
      : isMelbet
        ? '#30353B'
        : activeTheme?. couponCardBg || '#2A3F54'
    : '#FFFFFF';

  const textNavyOrWhite = isDark ? '#FFFFFF' : '#00325E';
  const textMuted = isDark
    ? isMelbet
      ? '#878C92'
      : '#8FA2B6'
    : '#6E849B';
  const iconMutedColor = isDark
    ? isMelbet
      ? '#878C92'
      : '#8FA2B6'
    : '#5C7690';

  const closeIconColor = isMelbet
    ? isDark
      ? '#B9711A'
      : '#E7B12C'
    : isWinWin
      ? '#7CBD17'
      : isBetWinner
        ? isDark
          ? '#008E5A'
          : '#007348'
        : isDark
          ? '#589BD8'
          : '#4A8FD6';

  const subBoxBg = isDark
    ? isBlack
      ? '#121720'
      : isMelbet
        ? '#24292F'
        : '#222F3F'
    : '#EBEEF3';

  return (
    <View style={[styles.cardContainer, { backgroundColor: cardBg }]}>
      {/* Ligne 1 : Icône Ballon + Date à gauche | Bouton croix à droite */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <SoccerBallCouponIcon size={16} color={iconMutedColor} />
          <Text style={[styles.headerDateText, { color: textMuted }]}>
            {formattedFrenchDate}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(event.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
          accessibilityLabel="Supprimer du coupon"
        >
          <Ionicons name="close" size={17} color={closeIconColor} />
        </TouchableOpacity>
      </View>

      {/* Ligne 2 : Zone d'affrontement (Équipe 1 - Blason - VS - Blason - Équipe 2) */}
      <View style={styles.faceoffRow}>
        <Text
          style={[styles.teamNameLeft, { color: textNavyOrWhite }]}
          numberOfLines={2}
        >
          {homeName}
        </Text>

        <View style={styles.teamLogoWrap}>
          {isHomeVillarreal ? (
            <Image
              source={require('../../../assets/icons/team_villarreal.png')}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <TeamLogo teamName={homeName} logoUrl={homeLogoUri} size={30} />
          )}
        </View>

        <Text style={[styles.vsText, { color: textNavyOrWhite }]}>VS</Text>

        <View style={styles.teamLogoWrap}>
          {isAwayPsg ? (
            <Image
              source={require('../../../assets/icons/team_psg.png')}
              style={styles.teamLogo}
              resizeMode="contain"
            />
          ) : (
            <TeamLogo teamName={awayName} logoUrl={awayLogoUri} size={30} />
          )}
        </View>

        <Text
          style={[styles.teamNameRight, { color: textNavyOrWhite }]}
          numberOfLines={2}
        >
          {awayName}
        </Text>
      </View>

      {/* Ligne 3 : Bannière encastrée Marché & Cote */}
      <View style={[styles.marketBanner, { backgroundColor: subBoxBg }]}>
        <Text
          style={[styles.marketText, { color: textMuted }]}
          numberOfLines={1}
        >
          {fullMarketDisplay}
        </Text>
        <Text style={[styles.oddValue, { color: textNavyOrWhite }]}>
          {oddDisplay}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDateText: {
    fontSize: 12.5,
    fontWeight: '400',
    marginLeft: 6,
  },
  closeBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  teamNameLeft: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  teamNameRight: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  teamLogoWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogo: {
    width: 30,
    height: 30,
  },
  vsText: {
    fontSize: 15,
    fontWeight: '800',
    marginHorizontal: 10,
  },
  marketBanner: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketText: {
    fontSize: 12.5,
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  oddValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Styles Carte Compacte (PariPesa & MegaPari)
  compactCardContainer: {
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  compactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactTeamsTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: -0.2,
  },
  compactDateSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    marginBottom: 10,
  },
  compactMarketBanner: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactMarketText: {
    fontSize: 13.5,
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  compactOddValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default EventCard;
export { EventCard as ActiveCouponCard };
