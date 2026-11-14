import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MatchEvent } from '../../types/bet';
import { formatBetDate } from '../../utils/dateFormatter';
import { formatCleanOdds } from '../../utils/oddsFormatter';
import { useThemeStore } from '../../store/themeStore';

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
 * Structure exacte des Captures 3 & 4 et de la Vidéo 1 :
 * - Sans drapeaux/logos, sans icône ballon et sans texte VS
 * - Ligne 1 : Équipe 1 - Équipe 2 (blanc 14.5px 500) + Croix ✕ (14x14, #D89228 sur Melbet)
 * - Ligne 2 : JJ.MM.AAAA (HH:mm), Temps réglementaire (#7E8791, 12.5px)
 * - Ligne 3 : Barre encastrée (#20252B) avec marché court (#8A949E, 13.5px) et cote (#FFFFFF, 14.5px, 700)
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

  // 1. Horodatage au format numérique exact JJ.MM.AAAA (HH:mm)
  const formattedDotDate = useMemo(() => {
    const rawSource =
      event.date ||
      (event.matchDate && event.matchTime
        ? `${event.matchDate} (${event.matchTime})`
        : event.matchDate) ||
      event.startDate ||
      '14.11.2026 (18:00)';
    return formatBetDate(rawSource);
  }, [event.matchDate, event.matchTime, event.date, event.startDate]);

  // 2. Formatage marché encastré (sans répéter « Temps réglementaire »)
  const shortMarketDisplay = useMemo(() => {
    const raw = (event.prediction || 'Temps réglementaire, 1X2: V1').trim();
    const cleanedShort = raw
      .replace(/^temps\s+r[ée]glementaire\s*[.,:-]?\s*/i, '')
      .replace(/^([^:.]+)\.\s*/, '$1: ')
      .trim();
    return cleanedShort.includes(':')
      ? cleanedShort
      : `1X2: ${cleanedShort || 'V1'}`;
  }, [event.prediction]);

  // 3. Cote affichée
  const effectiveOdd = liveOdd !== undefined ? liveOdd : (event.odd || 4.98);
  const oddDisplay = useMemo(() => formatCleanOdds(effectiveOdd), [effectiveOdd]);

  // 4. Noms des équipes
  const homeName =
    typeof event.homeTeam === 'string'
      ? event.homeTeam
      : event.homeTeam?.name || 'Lokomotiv';
  const awayName =
    typeof event.awayTeam === 'string'
      ? event.awayTeam
      : event.awayTeam?.name || 'Shanghai Dragons';

  // 5. Palette dynamique (Melbet & 1xBet)
  const cardBg = isDark
    ? isMelbet
      ? '#2B3138'
      : isBlack
        ? '#0B0F14'
        : activeTheme?.couponCardBg || '#2B3138'
    : '#FFFFFF';

  const titleColor = isDark ? '#FFFFFF' : '#1E242C';
  const dateSubtitleColor = isDark ? '#7E8791' : '#64748B';
  const marketTextColor = isDark ? '#8A949E' : '#5E7396';

  const closeIconColor = isMelbet
    ? '#D89228'
    : isParipesa
      ? '#4460F2'
      : isMegaPari
        ? '#CB3222'
        : isWinWin
          ? '#7CBD17'
          : isBetWinner
            ? '#008E5A'
            : activeTheme?.accent || activeTheme?.primary || '#589BD8';

  const subBoxBg = isDark
    ? isMelbet
      ? '#20252B'
      : isBlack
        ? '#121720'
        : '#20252B'
    : '#EBEEF3';

  return (
    <View style={[styles.cardContainer, { backgroundColor: cardBg }]}>
      {/* Ligne 1 : Noms des deux équipes séparés par " - " à gauche | Croix ✕ (14x14) à droite */}
      <View style={styles.topRow}>
        <Text
          style={[styles.teamsTitle, { color: titleColor }]}
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
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 5L19 19M19 5L5 19"
              stroke={closeIconColor}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Ligne 2 : Date, Heure & Période (JJ.MM.AAAA (HH:mm), Temps réglementaire) */}
      <Text
        style={[styles.dateSubtitle, { color: dateSubtitleColor }]}
        numberOfLines={1}
      >
        {formattedDotDate}, Temps réglementaire
      </Text>

      {/* Ligne 3 : Barre encastrée de Marché & Cote */}
      <View style={[styles.marketBanner, { backgroundColor: subBoxBg }]}>
        <Text
          style={[styles.marketText, { color: marketTextColor }]}
          numberOfLines={1}
        >
          {shortMarketDisplay}
        </Text>
        <Text style={[styles.oddValue, { color: titleColor }]}>
          {oddDisplay}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#2B3138',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamsTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '500',
    marginRight: 8,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSubtitle: {
    color: '#7E8791',
    fontSize: 12.5,
    fontWeight: '400',
    marginTop: 4,
    marginBottom: 10,
  },
  marketBanner: {
    backgroundColor: '#20252B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketText: {
    color: '#8A949E',
    fontSize: 13.5,
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  oddValue: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});

export default EventCard;
export { EventCard as ActiveCouponCard };
