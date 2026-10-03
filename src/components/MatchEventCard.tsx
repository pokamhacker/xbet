import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MatchEvent } from '../types/bet';
import { Colors, Typography } from '../theme/theme';
import { getTeamById } from '../data/sportsCatalog';
import { useThemeStore } from '../stores/themeStore';
import { MatchScoreView } from './MatchScoreView';
import { useResponsive } from '../utils/responsive';
import { formatBetDate } from '../utils/dateFormatter';

interface MatchEventCardProps {
  event: MatchEvent;
  isWon?: boolean;
  onPress?: () => void;
}

export const MatchEventCard: React.FC<MatchEventCardProps> = ({
  event,
  isWon = false,
  onPress,
}) => {
  const { currentTheme } = useThemeStore();
  const { font, moderateScale, isSmallDevice } = useResponsive();
  const eventIsWon = event.status === 'Gain' || event.status === 'Gagné' || isWon;
  const eventIsLost = event.status === 'Perdu';

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
    const cleanLeague = (event.league || 'Vietnam. V-League')
      .replace(/\s*-\s*/g, '. ')
      .replace(/\s*·\s*/g, '. ')
      .trim();
    formattedHeader = `${event.sport || 'Football'} . ${cleanLeague}`;
  }

  // Récupération dynamique des logos des équipes depuis le catalogue API-Football
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

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.container, { paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(12) }]}
    >
      {/* 1. En-tête : Ligne 1 : [FIFA / Icône] [Nom] / Ligne 2 : Date et Heure + Badge En direct */}
      <View style={styles.headerSection}>
        {isFifa ? (
          <Text style={[styles.fifaTextBadge, { fontSize: font(11) }]}>FIFA</Text>
        ) : (
          <Image
            source={require('../../assets/icons/ic_football.png')}
            style={[styles.sportIcon, { width: moderateScale(16), height: moderateScale(16) }]}
          />
        )}
        <View style={styles.headerTextCol}>
          <Text
            style={[
              styles.leagueText,
              { color: currentTheme.isDark ? currentTheme.textSecondary : '#5A738E', fontSize: font(12.5) },
            ]}
            numberOfLines={1}
          >
            {formattedHeader.replace(/^FIFA\s*[\.\-·:]\s*/i, '')}
          </Text>
          <View style={styles.dateTimeLiveRow}>
            <Text style={[styles.dateText, { color: currentTheme.textSecondary, fontSize: font(12) }]}>{formatBetDate(event.date)}</Text>
            {event.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>En direct</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 2. Confrontation Pixel-Perfect : [Nom Domicile] ➔ [Logo Domicile] ➔ [Score/VS] ➔ [Logo Extérieur] ➔ [Nom Extérieur] */}
      {event.homeTeam?.name && event.awayTeam?.name && (
        <MatchScoreView
          homeTeamName={event.homeTeam.name}
          homeTeamLogo={homeLogoUri}
          awayTeamName={event.awayTeam.name}
          awayTeamLogo={awayLogoUri}
          mainScore={event.actualScore ? event.actualScore.replace(/\s*[:\-]\s*/g, ' : ') : 'VS'}
          detailedScore={
            event.actualScore && event.halftimeScore
              ? event.halftimeScore.includes('(')
                ? event.halftimeScore
                : `(${event.halftimeScore})`
              : undefined
          }
          textColor={currentTheme.textPrimary}
          detailedScoreColor={currentTheme.textSecondary}
        />
      )}

      {/* POKER outcome si TVBet & gagné */}
      {isWon && event.pokerResult && (
        <View style={[styles.pokerContainer, currentTheme.isDark && { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border }]}>
          <Text style={[styles.pokerHeader, { color: currentTheme.primary }]}>POKER</Text>
          {event.pokerResult.hands.map((h) => (
            <Text key={h.id} style={[styles.pokerLine, { color: currentTheme.textSecondary }]}>
              Main {h.id} : <Text style={[styles.boldText, { color: currentTheme.textPrimary }]}>{h.cards}</Text>
            </Text>
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
            <Text key={r.roundNum} style={[styles.mkLine, { color: currentTheme.textSecondary }]}>
              Round {r.roundNum} : {r.winner} ({r.victoryType})
            </Text>
          ))}
          <Text style={[styles.mkWinner, { color: currentTheme.status.paye }]}>Vainqueur : {event.mkResult.finalWinner}</Text>
        </View>
      )}

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

      {/* 4. Statut de l'événement */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: currentTheme.textSecondary, fontSize: font(13) }]}>Statut :</Text>
        {eventIsWon ? (
          <View style={styles.statusBadgeWon}>
            <View style={[styles.greenCheckCircle, { backgroundColor: currentTheme.status.paye }]}>
              <Ionicons name="checkmark" size={11} color="#FFFFFF" />
            </View>
            <Text style={[styles.statusWonText, { color: currentTheme.status.paye, fontSize: font(13.5) }]}>Gain</Text>
          </View>
        ) : eventIsLost ? (
          <View style={styles.statusBadgeLost}>
            <Ionicons name="close-circle" size={15} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={[styles.statusLostText, { fontSize: font(13.5) }]}>Perte</Text>
          </View>
        ) : (
          <Text style={[styles.statusAcceptText, { color: currentTheme.status.accepte, fontSize: font(13.5) }]}>Accepté</Text>
        )}
      </View>

      {/* 5. Informations supplémentaires (masqué sur le football standard) */}
      {event.roundCode && event.sport !== 'Football' && event.gameCategory !== 'sports' && (
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: currentTheme.name.startsWith('melbet') ? '#F49C00' : currentTheme.primary }]}>Informations supplémentaires :</Text>
          <Text style={[styles.infoValue, { color: currentTheme.textPrimary }]}>{event.roundCode}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  headerSection: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fifaTextBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8FA2B6',
    letterSpacing: 0.5,
    marginRight: 10,
    fontFamily: Typography.fontFamily,
  },
  sportIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 8,
  },
  headerTextCol: {
    flex: 1,
  },
  leagueText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#5A738E',
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
  },
  dateTimeLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#7E95AC',
    fontWeight: '400',
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
    fontSize: 10,
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
    fontSize: 13.5,
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
    fontSize: 13.5,
    fontWeight: '500',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    textAlign: 'right',
    marginRight: 10,
    flex: 1,
  },
  awayTeamName: {
    fontSize: 13.5,
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
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    letterSpacing: 1.5,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 24,
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
    fontSize: 13.5,
    fontWeight: '600',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  marketOddsRight: {
    alignItems: 'flex-end',
  },
  marketOddsText: {
    fontSize: 14,
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
    fontSize: 13.5,
    fontWeight: '600',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginRight: 8,
  },
  oddText: {
    fontSize: 14,
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
    fontSize: 13.5,
    color: '#64748B',
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
    fontSize: 13.5,
    fontWeight: '600',
    color: '#16A34A',
    fontFamily: Typography.fontFamily,
  },
  statusBadgeLost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLostText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#E53935',
    fontFamily: Typography.fontFamily,
  },
  statusAcceptText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2A75E6',
    fontFamily: Typography.fontFamily,
  },
  infoRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginRight: 4,
  },
  infoValue: {
    fontSize: 11.5,
    fontWeight: '600',
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
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  pokerLine: {
    fontSize: 12.5,
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
    fontSize: 12.5,
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
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  mkLine: {
    fontSize: 12,
    color: '#334155',
    marginVertical: 1,
  },
  mkWinner: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 4,
  },
});

export default MatchEventCard;
