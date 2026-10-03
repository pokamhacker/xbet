import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchEvent } from '../types/bet';
import { Colors, Typography } from '../theme/theme';
import { getTeamById } from '../data/sportsCatalog';
import { useThemeStore } from '../stores/themeStore';
import { MatchScoreView } from './MatchScoreView';
import { useResponsive } from '../utils/responsive';
import { formatBetDate } from '../utils/dateFormatter';

interface WonMatchEventCardProps {
  event: MatchEvent;
  onPress?: () => void;
}

/**
 * WonMatchEventCard : Composant pour l'affichage d'un match terminé et gagné (Statut Payé / Gain)
 * Conformité Pixel-Perfect :
 * 1. Score central 22sp (font-weight: 800) encadré par les blasons
 * 2. Récapitulatif par mi-temps en gris atténué #64748B (ex: 2:2 (1:1, 1:1))
 * 3. Équipes : [Nom Domicile (aligné droite)] [Logo 1] [Score Central] [Logo 2] [Nom Extérieur (aligné gauche)]
 *    (Aucune mention "CONTRE" ni badge superflu)
 * 4. Discipline & Championnat séparés strictement par des points (ex: Football . Koweït. Championnat du Koweït)
 * 5. Date inférieure en gris (ex: 02.09.2026 (14:00))
 * 6. Statut événement : Pastille pleine verte avec coche blanche "✔ Gain" (#22C55E, font-weight: 700)
 */
export const WonMatchEventCard: React.FC<WonMatchEventCardProps> = ({
  event,
  onPress,
}) => {
  const { currentTheme } = useThemeStore();
  const { font, moderateScale, isSmallDevice } = useResponsive();

  // Détection stricte FIFA
  const isFifa =
    (event.sport && event.sport.toUpperCase() === 'FIFA') ||
    (event.league && event.league.toUpperCase().startsWith('FIFA'));

  // Formatage strict du libellé selon sport (FIFA. [Compétition] vs Football . [Compétition])
  let formattedHeader = '';
  if (isFifa) {
    let compName = event.league || 'Ligue des Champions';
    compName = compName.replace(/^FIFA\s*[\.\-·:]\s*/i, '').trim();
    formattedHeader = `FIFA. ${compName}`;
  } else {
    const cleanLeague = (event.league || 'Koweït. Championnat du Koweït')
      .replace(/\s*-\s*/g, '. ')
      .replace(/\s*·\s*/g, '. ')
      .trim();
    formattedHeader = `${event.sport || 'Football'} . ${cleanLeague}`;
  }

  // Récupération des blasons d'équipes via le catalogue centralisé API-Football
  const homeCatalog = getTeamById(event.homeTeam?.name || '');
  const awayCatalog = getTeamById(event.awayTeam?.name || '');
  const homeLogoUri =
    (event.homeTeam?.logo && !event.homeTeam.logo.includes('ui-avatars') ? event.homeTeam.logo : null) ||
    homeCatalog?.logo ||
    event.homeTeam?.logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(event.homeTeam?.name || 'DOM')}&background=2563EB&color=FFFFFF&size=128&bold=true&rounded=true`;
  const awayLogoUri =
    (event.awayTeam?.logo && !event.awayTeam.logo.includes('ui-avatars') ? event.awayTeam.logo : null) ||
    awayCatalog?.logo ||
    event.awayTeam?.logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(event.awayTeam?.name || 'EXT')}&background=EA580C&color=FFFFFF&size=128&bold=true&rounded=true`;

  // Score central grand format
  const rawScore = event.actualScore || '2-2';
  const cleanScore = rawScore.replace(/\s*[:\-]\s*/g, ' : ');

  // Récapitulatif mi-temps (ex: "2:2 (1:1, 1:1)" ou "8:8 (5:6, 3:2)")
  const halftimeText = event.halftimeScore || (() => {
    const parts = rawScore.split(/[-:]/).map((s) => parseInt(s.trim(), 10) || 0);
    const h1 = Math.floor(parts[0] / 2);
    const h2 = parts[0] - h1;
    const a1 = Math.floor(parts[1] / 2);
    const a2 = parts[1] - a1;
    return `(${h1}:${a1}, ${h2}:${a2})`;
  })();

  const detailedScore = event.halftimeScore
    ? event.halftimeScore.includes('(')
      ? event.halftimeScore
      : `${cleanScore.replace(/\s+/g, '')} (${event.halftimeScore})`
    : `${cleanScore.replace(/\s+/g, '')} ${halftimeText.startsWith('(') ? halftimeText : `(${halftimeText})`}`;

  const homeName = typeof event.homeTeam === 'string' ? event.homeTeam : event.homeTeam?.name || 'Al-Salmiya';
  const awayName = typeof event.awayTeam === 'string' ? event.awayTeam : event.awayTeam?.name || 'Al-Arabi Kuwait';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.container, { paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(12) }]}
    >
      {/* 1. En-tête : Ligne 1 : [Icône] FIFA. [Nom] / Ligne 2 : Date et Heure + Badge EN DIRECT */}
      <View style={styles.headerSection}>
        <View style={styles.leagueRow}>
          {isFifa ? (
            <Image
              source={require('../../assets/icons/fifa_badge.png')}
              style={{ width: moderateScale(22), height: moderateScale(16), resizeMode: 'contain', marginRight: 6 }}
            />
          ) : (
            <Image
              source={require('../../assets/icons/ic_football.png')}
              style={{ width: moderateScale(16), height: moderateScale(16), resizeMode: 'contain', marginRight: 6 }}
            />
          )}
          <Text
            style={[
              styles.leagueText,
              { color: currentTheme.isDark ? currentTheme.textSecondary : '#5A738E', fontSize: font(13) },
            ]}
            numberOfLines={1}
          >
            {formattedHeader}
          </Text>
        </View>
        <View style={styles.dateTimeLiveRow}>
          <Text style={[styles.dateText, { color: currentTheme.textSecondary, fontSize: font(12) }]}>{formatBetDate(event.date)}</Text>
          {event.isLive && (
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>EN DIRECT</Text>
            </View>
          )}
        </View>
      </View>

      {/* 2. Confrontation Pixel-Perfect :
          Ligne Principale : [Nom Équipe Domicile] ➔ [Logo Domicile] ➔ [Score Principal] ➔ [Logo Extérieur] ➔ [Nom Équipe Extérieure]
          Ligne Secondaire : Score détaillé centré en dessous */}
      <MatchScoreView
        homeTeamName={homeName}
        homeTeamLogo={homeLogoUri}
        awayTeamName={awayName}
        awayTeamLogo={awayLogoUri}
        mainScore={cleanScore}
        detailedScore={detailedScore}
        textColor={currentTheme.textPrimary}
        detailedScoreColor={currentTheme.textSecondary}
      />

      {/* 3. Pronostic & Cote */}
      <View style={styles.marketSelectionRow}>
        <View style={styles.marketSelectionLeft}>
          <Text
            style={[styles.marketSelectionText, { color: currentTheme.textPrimary, fontSize: font(13.5) }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {event.prediction}
          </Text>
        </View>
        <View style={styles.marketOddsRight}>
          <Text style={[styles.marketOddsText, { color: currentTheme.textPrimary, fontSize: font(15) }]}>{event.odd}</Text>
        </View>
      </View>

      {/* 4. Statut individuel du match : Pastille circulaire verte avec coche ✓ + Gain */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: currentTheme.textSecondary, fontSize: font(13) }]}>Statut :</Text>
        <View style={styles.gainStatusWrap}>
          <View style={[styles.greenCheckCircle, { backgroundColor: currentTheme.status.paye }]}>
            <Ionicons name="checkmark" size={11} color={currentTheme.name === 'melbet' ? '#000000' : '#FFFFFF'} />
          </View>
          <Text style={[styles.gainStatusText, { color: currentTheme.status.paye, fontSize: font(13.5) }]}>Gain</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  headerSection: {
    marginBottom: 8,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  leagueText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.1,
  },
  dateTimeLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 22,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  liveBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  confrontationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    marginVertical: 4,
    width: '100%',
  },
  matchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    marginVertical: 4,
    width: '100%',
  },
  homeSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  teamContainerHome: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  awaySide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamContainerAway: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  teamNameHome: {
    textAlign: 'right',
    marginRight: 8,
  },
  teamNameAway: {
    textAlign: 'left',
    marginLeft: 8,
  },
  homeTeamName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
  },
  awayTeamName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    textAlign: 'left',
    marginLeft: 8,
    flex: 1,
  },
  teamLogo: {
    width: 28,
    height: 28,
  },
  teamLogoHome: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoAway: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  centralScoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 68,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  scoreCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 68,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  mainScoreText: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    letterSpacing: 1.5,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 25,
  },
  halfTimeScoreText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 13,
  },
  halftimeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 13,
  },
  marketSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  marketSelectionLeft: {
    flex: 1,
    paddingRight: 8,
  },
  marketSelectionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
  },
  marketOddsRight: {
    alignItems: 'flex-end',
  },
  marketOddsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  predictionText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginRight: 8,
  },
  oddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  gainStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  greenCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  gainStatusText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#16A34A',
    fontFamily: Typography.fontFamily,
  },
});

export default WonMatchEventCard;
