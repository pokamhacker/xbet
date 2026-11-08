import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { MatchEvent } from '../types/bet';
import { Colors, Typography } from '../theme/theme';
import { getTeamById } from '../data/sportsCatalog';
import { useThemeStore } from '../stores/themeStore';
import { MatchScoreView } from './MatchScoreView';
import { useResponsive } from '../utils/responsive';
import { formatBetDate, combineDateAndTime, formatFrenchEventDate, formatFootballHeader } from '../utils/dateFormatter';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { LiveBadge } from './LiveBadge';
import { getEffectiveEventScore } from '../utils/scoreAdapter';

interface MatchEventCardProps {
  event: MatchEvent;
  isWon?: boolean;
  isLive?: boolean;
  onPress?: () => void;
}

const getCompetitionPillLabel = (event: MatchEvent): string | null => {
  const raw = `${event.league || ''} ${event.tournamentName || ''} ${event.badge || ''}`.toLowerCase();
  if (raw.includes('la liga') || raw.includes('laliga')) return 'LaLiga';
  if (raw.includes('série a') || raw.includes('serie a')) return 'Serie A';
  return null;
};

export const MatchEventCard: React.FC<MatchEventCardProps> = ({
  event,
  isWon = false,
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
  const eventIsWon = event.status === 'Gain' || event.status === 'Gagné' || isWon;
  const eventIsLost = event.status === 'Perdu';

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

  // Chronomètre temps écoulé en direct (MM:SS) pour les matchs EN DIRECT
  const initialSeconds = React.useMemo(() => {
    const customSec = (event as any).elapsedSeconds;
    if (typeof customSec === 'number' && customSec >= 0) return customSec;
    if (typeof event.elapsed === 'number' && event.elapsed > 0) {
      return isFifa ? event.elapsed : event.elapsed * 60 + 43;
    }
    return isFifa ? 223 : 1483; // 03:43 par défaut sur FIFA Rush, 24:43 sur Football
  }, [event, isFifa]);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialSeconds);

  useEffect(() => {
    setElapsedSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!showLiveBadge) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showLiveBadge]);

  const formattedElapsed = React.useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Score effectif dynamique : VS avant le début, score live ou adapté dès le début
  const rawScoreData = getEffectiveEventScore(event, isWon);
  const mainScoreDisplay =
    showLiveBadge && rawScoreData.mainScore === 'VS' && event.actualScore
      ? event.actualScore.replace(/\s*[:\-]\s*/g, ' : ')
      : rawScoreData.mainScore;
  const detailedScoreDisplay =
    showLiveBadge && !rawScoreData.detailedScore && event.halftimeScore
      ? event.halftimeScore
      : rawScoreData.detailedScore;

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

  // Récupération dynamique des logos des équipes (supportant maillots, silhouettes ou blasons officiels)
  const homeRawLogo = event.homeTeam?.logo;
  const awayRawLogo = event.awayTeam?.logo;
  const homeCatalog = getTeamById(event.homeTeam?.name || '');
  const awayCatalog = getTeamById(event.awayTeam?.name || '');

  const homeLogoUri =
    (homeRawLogo && (homeRawLogo.startsWith('jersey:') || homeRawLogo === 'generic-player'))
      ? (homeCatalog?.logo || homeRawLogo)
      : (homeRawLogo && !homeRawLogo.includes('ui-avatars') ? homeRawLogo : null) ||
        homeCatalog?.logo ||
        'generic-player';

  const awayLogoUri =
    (awayRawLogo && (awayRawLogo.startsWith('jersey:') || awayRawLogo === 'generic-player'))
      ? awayRawLogo
      : (awayRawLogo && !awayRawLogo.includes('ui-avatars') ? awayRawLogo : null) ||
        awayCatalog?.logo ||
        'generic-player';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.container, { paddingHorizontal: moderateScale(12), paddingVertical: moderateScale(9) }]}
    >
      {/* 1. En-tête : Ligne 1 : [FIFA / Icône] [Nom Compétition] / Ligne 2 : Date et Heure + Badge */}
      <View style={styles.headerSection}>
        {isFifa ? (
          <Image
            source={require('../../assets/icons/fifa.png')}
            style={[
              styles.sportIcon,
              { width: moderateScale(22), height: moderateScale(9) },
            ]}
            resizeMode="contain"
          />
        ) : isPoker ? (
          <Image
            source={require('../../assets/icons/poker.png')}
            style={[
              styles.sportIcon,
              {
                width: moderateScale(18),
                height: moderateScale(18),
                tintColor: isMelbet
                  ? '#1B365D'
                  : isMegaPari
                    ? detailPokerColor
                    : currentTheme.textSecondary ||
                      currentTheme.colors?.textSecondary ||
                      currentTheme.primary,
              },
            ]}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../assets/icons/ic_football.png')}
            style={[
              styles.sportIcon,
              {
                width: moderateScale(22),
                height: moderateScale(22),
                tintColor: currentTheme.textSecondary || '#6E849B',
              },
            ]}
            resizeMode="contain"
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

      {/* 2. Confrontation Pixel-Perfect : [Nom Domicile] ➔ [Logo 40x40] ➔ [Score 22px] ➔ [Logo 40x40] ➔ [Nom Extérieur] */}
      {event.homeTeam?.name && event.awayTeam?.name && (
        <MatchScoreView
          homeTeamName={event.homeTeam.name}
          homeTeamLogo={homeLogoUri}
          awayTeamName={event.awayTeam.name}
          awayTeamLogo={awayLogoUri}
          mainScore={mainScoreDisplay}
          detailedScore={detailedScoreDisplay}
          textColor={currentTheme.isDark ? currentTheme.textPrimary : '#1E242B'}
          detailedScoreColor={currentTheme.isDark ? currentTheme.textSecondary : '#7F8C8D'}
        />
      )}

      {/* POKER outcome si TVBet & gagné */}
      {isWon && event.pokerResult && (
        <View style={[styles.pokerContainer, currentTheme.isDark && { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border }]}>
          <Text style={[styles.pokerHeader, { color: currentTheme.primary }]}>POKER</Text>
          {event.pokerResult.hands.map((h) => (
            <React.Fragment key={h.id}>
              <Text style={[styles.pokerLine, { color: currentTheme.textSecondary }]}>
                Main {h.id} : <Text style={[styles.boldText, { color: currentTheme.textPrimary }]}>{h.cards}</Text>
              </Text>
            </React.Fragment>
          ))}
          <Text style={[styles.pokerLine, styles.pokerTableLine, { color: currentTheme.textSecondary, borderTopColor: currentTheme.border }]}>
            Table : <Text style={[styles.boldText, { color: currentTheme.textPrimary }]}>{event.pokerResult.board}</Text>
          </Text>
          <Text style={[styles.pokerWinner, { color: '#9CA3AF' }]}>Gagnant : {event.pokerResult.winnerLabel}</Text>
        </View>
      )}

      {/* MORTAL KOMBAT outcome si MK & gagné */}
      {isWon && event.mkResult && (
        <View style={[styles.mkContainer, currentTheme.isDark && { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border }]}>
          <Text style={styles.mkHeader}>RÉSULTAT DU COMBAT</Text>
          {event.mkResult.rounds.map((r) => (
            <React.Fragment key={r.roundNum}>
              <Text style={[styles.mkLine, { color: currentTheme.textSecondary }]}>
                Round {r.roundNum} : {r.winner} ({r.victoryType})
              </Text>
            </React.Fragment>
          ))}
          <Text style={[styles.mkWinner, { color: currentTheme.status.paye }]}>Vainqueur : {event.mkResult.finalWinner}</Text>
        </View>
      )}

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

      {/* 4. Ligne EN DIRECT + temps écoulé (si match en direct) */}
      {showLiveBadge && (
        <View style={styles.liveElapsedRow}>
          <Text style={[styles.liveElapsedLeft, { color: currentTheme.isDark ? currentTheme.textSecondary : '#7F8C8D', fontSize: font(13.5) }]}>
            EN DIRECT
          </Text>
          <Text style={[styles.liveElapsedRight, { color: currentTheme.isDark ? currentTheme.textPrimary : '#1E242B', fontSize: font(13.5) }]}>
            temps écoulé : {formattedElapsed}
          </Text>
        </View>
      )}

      {/* 5. Statut de l'événement */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: currentTheme.isDark ? currentTheme.textSecondary : '#7F8C8D', fontSize: font(14) }]}>
          Statut :
        </Text>
        {eventIsWon ? (
          <View style={styles.statusBadgeWon}>
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
            <Text style={[styles.statusWonText, { color: '#27AE60', fontSize: font(14.5) }]}>Gain</Text>
          </View>
        ) : eventIsLost ? (
          <View style={styles.statusBadgeLost}>
            <Ionicons name="close-circle" size={16} color="#E74C3C" style={{ marginRight: 4 }} />
            <Text style={[styles.statusLostText, { color: '#E74C3C', fontSize: font(14.5) }]}>Perdu</Text>
          </View>
        ) : (
          <View style={styles.statusBadgeAccept}>
            <Text style={[styles.statusAcceptText, { color: '#DFA824', fontSize: font(14.5) }]}>Accepté</Text>
          </View>
        )}
      </View>

      {/* 6. Informations supplémentaires (masqué sur le football / FIFA standard) */}
      {event.roundCode && !isFifa && event.sport !== 'Football' && event.gameCategory !== 'sports' && (
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: currentTheme.primary, fontSize: font(14) }]}>Informations supplémentaires :</Text>
          <Text style={[styles.infoValue, { color: currentTheme.textPrimary, fontSize: font(14.5) }]}>{event.roundCode}</Text>
        </View>
      )}
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
    fontSize: 13,
    fontWeight: '800',
    color: '#8FA2B6',
    letterSpacing: 0.5,
    marginRight: 10,
    fontFamily: Typography.fontFamily,
  },
  sportIcon: {
    width: 19,
    height: 19,
    resizeMode: 'contain',
    marginRight: 8,
  },
  headerTextCol: {
    flex: 1,
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
  liveElapsedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 3,
  },
  liveElapsedLeft: {
    fontSize: 13.5,
    color: '#7F8C8D',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  liveElapsedRight: {
    fontSize: 13.5,
    color: '#1E242B',
    fontWeight: '600',
    fontFamily: Typography.fontFamily,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  confrontationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    marginVertical: 2,
  },
  matchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 6,
    marginVertical: 2,
    width: '100%',
  },
  homeTeamSide: {
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
  awayTeamSide: {
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
    fontWeight: '500',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  teamNameHome: {
    textAlign: 'right',
    marginRight: 10,
  },
  teamNameAway: {
    textAlign: 'left',
    marginLeft: 10,
  },
  homeTeamName: {
    fontSize: 15.5,
    fontWeight: '500',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    textAlign: 'right',
    marginRight: 10,
    flex: 1,
  },
  awayTeamName: {
    fontSize: 15.5,
    fontWeight: '500',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    textAlign: 'left',
    marginLeft: 10,
    flex: 1,
  },
  teamLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  teamLogoBadgeHome: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoBadgeAway: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoImage: {
    width: 36,
    height: 36,
  },
  vsContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.5,
  },
  centralScoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 64,
  },
  scoreCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 64,
  },
  mainScoreText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    letterSpacing: 1.5,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 26,
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
  marketSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  marketSelectionLeft: {
    flex: 1,
    paddingRight: 8,
  },
  marketSelectionText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  marketOddsRight: {
    alignItems: 'flex-end',
  },
  marketOddsText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#101E33',
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
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginRight: 8,
  },
  oddText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  statusBadgeWon: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusWonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: Typography.fontFamily,
  },
  statusBadgeLost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLostText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#E53935',
    fontFamily: Typography.fontFamily,
  },
  statusBadgeAccept: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2A75E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusAcceptText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#2A75E6',
    fontFamily: Typography.fontFamily,
  },
  infoRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13.5,
    color: '#94A3B8',
    marginRight: 4,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  pokerContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pokerHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  pokerLine: {
    fontSize: 14.5,
    color: '#334155',
    marginVertical: 1,
  },
  pokerTableLine: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
  },
  pokerWinner: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#9CA3AF',
    marginTop: 4,
  },
  mkContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  mkHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  mkLine: {
    fontSize: 14,
    color: '#334155',
    marginVertical: 1,
  },
  mkWinner: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 4,
  },
});

export default MatchEventCard;
