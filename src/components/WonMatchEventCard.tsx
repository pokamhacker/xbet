import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { MatchEvent } from '../types/bet';
import { Colors, Typography } from '../theme/theme';
import { getTeamById } from '../data/sportsCatalog';
import { isNationalTeamEntity } from '../data/nationalTeams';
import { useThemeStore } from '../stores/themeStore';
import { MatchScoreView } from './MatchScoreView';
import { useResponsive } from '../utils/responsive';
import { formatBetDate, combineDateAndTime, formatFrenchEventDate, formatFootballHeader } from '../utils/dateFormatter';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { LiveBadge } from './LiveBadge';
import { getEffectiveEventScore } from '../utils/scoreAdapter';

interface WonMatchEventCardProps {
  event: MatchEvent;
  isLive?: boolean;
  onPress?: () => void;
}

const getCompetitionPillLabel = (event: MatchEvent): string | null => {
  const raw = `${event.league || ''} ${event.tournamentName || ''} ${event.badge || ''}`.toLowerCase();
  if (raw.includes('la liga') || raw.includes('laliga')) return 'LaLiga';
  if (raw.includes('série a') || raw.includes('serie a')) return 'Serie A';
  return null;
};

/**
 * WonMatchEventCard : Composant pour l'affichage d'un match terminé et gagné (Statut Payé / Gain)
 * Conformité Pixel-Perfect :
 * 1. Score central 22sp (font-weight: 800) encadré par les blasons 40x40
 * 2. Récapitulatif par mi-temps en gris atténué #7F8C8D (ex: 1:0 (0:0,1:0))
 * 3. Équipes : [Nom Domicile (aligné droite)] [Logo 1] [Score Central] [Logo 2] [Nom Extérieur (aligné gauche)]
 *    (Aucune mention "CONTRE" ni badge superflu)
 * 4. Discipline & Championnat séparés strictement par des points (ex: Football . Allemagne. Bundesliga)
 * 5. Date inférieure en gris + badge bleu (ex: LaLiga)
 * 6. Statut événement : Pastille pleine verte avec coche blanche "✔ Gain" (#27AE60, font-weight: 700)
 */
export const WonMatchEventCard: React.FC<WonMatchEventCardProps> = ({
  event,
  isLive,
  onPress,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const isMelbet = Boolean(
    brandChoice === 'melbet' ||
    (currentTheme?.name || '').toLowerCase().includes('melbet')
  );
  const isMegaPari = Boolean(
    brandChoice === 'megaparis' ||
    brandChoice === 'megapari' ||
    (currentTheme?.name || '').toLowerCase().includes('megapari')
  );
  const detailPokerColor =
    currentTheme.textSecondary ||
    currentTheme.colors?.textSecondary ||
    (currentTheme.isDark ? '#8A96A3' : '#64748B');
  const { font, moderateScale } = useResponsive();
  const showLiveBadge = isLive !== undefined ? isLive : Boolean(event.isLive);

  // Détection stricte sport (FIFA, Poker, Football)
  const isPoker =
    (event.sport && (event.sport.toUpperCase().includes('POKER') || event.sport.toUpperCase().includes('TVBET'))) ||
    (event.league && (event.league.toUpperCase().includes('POKER') || event.league.toUpperCase().includes('TVBET'))) ||
    event.gameCategory === 'poker';

  const isFifa =
    Boolean((event as any).isFifa) ||
    (event.sport && event.sport.toUpperCase() === 'FIFA') ||
    (event.league &&
      (event.league.toUpperCase().startsWith('FIFA') ||
        event.league.toUpperCase().includes('FC 26') ||
        event.league.toUpperCase().includes('FC 25') ||
        event.league.toUpperCase().includes('FC 24') ||
        event.league.toUpperCase().includes('5X5 RUSH')));

  // Formatage strict du libellé selon sport (FIFA. [Compétition] vs TvBet. POKER vs Football . [Compétition])
  let formattedHeader = '';
  if (isFifa) {
    let compName = event.league || 'FC 26. 5x5 Rush. Superligue';
    compName = compName.replace(/^FIFA\s*[\.\-·:]\s*/i, '').trim();
    formattedHeader = `FIFA. ${compName}`;
  } else if (isPoker) {
    formattedHeader = event.league || 'TvBet. POKER';
  } else {
    formattedHeader = formatFootballHeader(event.sport, event.league);
  }

  const competitionPill = !showLiveBadge ? getCompetitionPillLabel(event) : null;

  // Récupération des blasons d'équipes (supportant maillots avec drapeau, silhouettes ou blasons officiels)
  const homeRawLogo = event.homeTeam?.logo;
  const awayRawLogo = event.awayTeam?.logo;
  const homeCatalog = getTeamById(event.homeTeam?.name || '');
  const awayCatalog = getTeamById(event.awayTeam?.name || '');
  const homeIsNational = isNationalTeamEntity(event.homeTeam?.name, event.league, homeRawLogo);
  const awayIsNational = isNationalTeamEntity(event.awayTeam?.name, event.league, awayRawLogo);

  const homeLogoUri =
    (homeRawLogo && (homeRawLogo.startsWith('jersey:') || homeRawLogo === 'generic-player'))
      ? (homeCatalog?.logo || homeRawLogo)
      : (homeIsNational && homeCatalog?.logo)
        ? homeCatalog.logo
        : (homeRawLogo && !homeRawLogo.includes('ui-avatars') ? homeRawLogo : null) ||
          homeCatalog?.logo ||
          'generic-player';

  const awayLogoUri =
    (awayRawLogo && (awayRawLogo.startsWith('jersey:') || awayRawLogo === 'generic-player'))
      ? (awayCatalog?.logo || awayRawLogo)
      : (awayIsNational && awayCatalog?.logo)
        ? awayCatalog.logo
        : (awayRawLogo && !awayRawLogo.includes('ui-avatars') ? awayRawLogo : null) ||
          awayCatalog?.logo ||
          'generic-player';

  // Score central effectif adapté au pronostic gagnant
  const scoreData = getEffectiveEventScore(event, true);
  const cleanScore = scoreData.mainScore;
  const detailedScore = scoreData.detailedScore;

  const homeName = typeof event.homeTeam === 'string' ? event.homeTeam : event.homeTeam?.name || 'Eintracht Frankfurt';
  const awayName = typeof event.awayTeam === 'string' ? event.awayTeam : event.awayTeam?.name || 'Cologne';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.container, { paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(9) }]}
    >
      {/* 1. En-tête : Icône à gauche + colonne [Compétition / Date + Badge] à droite */}
      <View style={styles.headerSection}>
        {isFifa ? (
          <Image
            source={require('../../assets/icons/fifa.png')}
            style={{
              width: moderateScale(22),
              height: moderateScale(9),
              resizeMode: 'contain',
              marginRight: 8,
            }}
          />
        ) : isPoker ? (
          <Image
            source={require('../../assets/icons/poker.png')}
            style={{
              width: moderateScale(18),
              height: moderateScale(18),
              resizeMode: 'contain',
              marginRight: 8,
              tintColor: isMelbet
                ? '#1B365D'
                : isMegaPari
                  ? detailPokerColor
                  : currentTheme.textSecondary ||
                    currentTheme.colors?.textSecondary ||
                    currentTheme.primary,
            }}
          />
        ) : (
          <Image
            source={require('../../assets/icons/ic_football.png')}
            style={{
              width: moderateScale(22),
              height: moderateScale(22),
              resizeMode: 'contain',
              marginRight: 8,
              tintColor: currentTheme.textSecondary || '#6E849B',
            }}
          />
        )}
        <View style={styles.headerTextCol}>
          <Text
            style={[
              styles.leagueText,
              {
                color: currentTheme.textSecondary || '#6E849B',
                fontSize: font(13),
                fontWeight: '400',
              },
            ]}
            numberOfLines={1}
          >
            {formattedHeader}
          </Text>
          <View style={styles.dateTimeLiveRow}>
            <Text
              style={[
                styles.dateText,
                {
                  color: currentTheme.textSecondary || '#6E849B',
                  fontSize: font(12.5),
                  marginTop: 2,
                },
              ]}
            >
              {formatFrenchEventDate(
                event.matchDate || event.startDate || event.date || event.eventDate,
                event.matchTime
              )}
            </Text>
            {showLiveBadge && (
              <LiveBadge style={{ marginLeft: 8 }} />
            )}
            {competitionPill && (
              <View style={styles.competitionPill}>
                <Text style={styles.competitionPillText}>{competitionPill}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 2. Confrontation Pixel-Perfect :
          Ligne Principale : [Nom Équipe Domicile] ➔ [Logo 40x40] ➔ [Score 22px] ➔ [Logo 40x40] ➔ [Nom Équipe Extérieure]
          Ligne Secondaire : Score détaillé centré en dessous */}
      <MatchScoreView
        homeTeamName={homeName}
        homeTeamLogo={homeLogoUri}
        awayTeamName={awayName}
        awayTeamLogo={awayLogoUri}
        mainScore={cleanScore}
        detailedScore={detailedScore}
        textColor={currentTheme.isDark ? currentTheme.textPrimary : '#1E242B'}
        detailedScoreColor={currentTheme.isDark ? currentTheme.textSecondary : '#7F8C8D'}
        leagueName={event.league}
      />

      {/* 3. Pronostic & Cote */}
      <View style={styles.marketSelectionRow}>
        <View style={styles.marketSelectionLeft}>
          <Text
            style={[styles.marketSelectionText, { color: currentTheme.isDark ? currentTheme.textPrimary : '#1E242B', fontSize: font(14.5) }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {event.prediction}
          </Text>
        </View>
        <View style={styles.marketOddsRight}>
          <Text style={[styles.marketOddsText, { color: currentTheme.isDark ? currentTheme.textPrimary : '#1E242B', fontSize: font(14.5) }]}>
            {formatCleanOdds(event.odd)}
          </Text>
        </View>
      </View>

      {/* 4. Statut individuel du match : Pastille circulaire verte avec coche ✓ + Gain */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: currentTheme.isDark ? currentTheme.textSecondary : '#7F8C8D', fontSize: font(14) }]}>
          Statut :
        </Text>
        <View style={styles.gainStatusWrap}>
          <View style={[styles.greenCheckCircle, { backgroundColor: '#2ECC71' }]}>
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
              <Path
                d="M 6.8 12.3 L 10.3 15.8 L 17.4 8.7"
                stroke="#FFFFFF"
                strokeWidth={3.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={[styles.gainStatusText, { color: '#27AE60', fontSize: font(14.5) }]}>Gain</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  headerSection: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fifaTextBadge: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#8FA2B6',
    letterSpacing: 0.4,
    marginRight: 10,
    fontFamily: Typography.fontFamily,
  },
  headerTextCol: {
    flex: 1,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  leagueText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6E849B',
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
  },
  dateTimeLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  dateText: {
    fontSize: 12.5,
    color: '#6E849B',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  competitionPill: {
    backgroundColor: '#4A7DFF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  competitionPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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
    fontSize: 12,
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
    fontSize: 15.5,
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
    fontSize: 15.5,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
  },
  awayTeamName: {
    fontSize: 15.5,
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
    fontSize: 23,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    letterSpacing: 1.5,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 27,
  },
  halfTimeScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 15,
  },
  halftimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 15,
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
    fontSize: 15.5,
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
    fontSize: 15.5,
    fontWeight: '700',
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
    fontSize: 14,
    color: '#7F8C8D',
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
    fontSize: 15.5,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: Typography.fontFamily,
  },
});

export default WonMatchEventCard;
