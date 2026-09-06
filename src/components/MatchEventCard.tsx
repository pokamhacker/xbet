import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MatchEvent } from '../types/bet';
import { Colors } from '../theme/theme';

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
  const eventIsWon = event.status === 'Gain' || event.status === 'Gagné' || isWon;
  const eventIsLost = event.status === 'Perdu';

  // Format header title: e.g. "Football . Vietnam. V-League"
  const formattedHeader = `${event.sport || 'Football'} . ${event.league || 'Vietnam. V-League'}`;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.container}
    >
      {/* 1. En-tête : Icône Football + Libellé exact + Date à la ligne en dessous */}
      <View style={styles.headerSection}>
        <View style={styles.leagueRow}>
          <Ionicons
            name="football-outline"
            size={16}
            color={Colors.primaryAccent}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.leagueText} numberOfLines={1}>
            {formattedHeader}
          </Text>
        </View>
        <Text style={styles.dateText}>{event.date}</Text>
      </View>

      {/* 2. Confrontation équilibrée : [Nom Domicile (droite)] [Logo 1 (32x32)] VS [Logo 2 (32x32)] [Nom Extérieur (gauche)] */}
      {event.homeTeam?.name && event.awayTeam?.name && (
        <View style={styles.confrontationWrapper}>
          {/* Équipe Domicile */}
          <View style={styles.homeTeamSide}>
            <Text style={styles.homeTeamName} numberOfLines={2}>
              {event.homeTeam.name}
            </Text>
            <View style={styles.teamLogoBadgeHome}>
              <Ionicons name="shield" size={17} color="#2563EB" />
            </View>
          </View>

          {/* Séparateur VS en gras #334155 */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Équipe Extérieur */}
          <View style={styles.awayTeamSide}>
            <View style={styles.teamLogoBadgeAway}>
              <Ionicons name="shield" size={17} color="#EA580C" />
            </View>
            <Text style={styles.awayTeamName} numberOfLines={2}>
              {event.awayTeam.name}
            </Text>
          </View>
        </View>
      )}

      {/* Score Réel si présent */}
      {event.actualScore && (
        <View style={styles.scorePillContainer}>
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>Score : {event.actualScore}</Text>
          </View>
        </View>
      )}

      {/* POKER outcome si TVBet & gagné */}
      {isWon && event.pokerResult && (
        <View style={styles.pokerContainer}>
          <Text style={styles.pokerHeader}>POKER</Text>
          {event.pokerResult.hands.map((h) => (
            <Text key={h.id} style={styles.pokerLine}>
              Main {h.id} : <Text style={styles.boldText}>{h.cards}</Text>
            </Text>
          ))}
          <Text style={[styles.pokerLine, styles.pokerTableLine]}>
            Table : <Text style={styles.boldText}>{event.pokerResult.board}</Text>
          </Text>
          <Text style={styles.pokerWinner}>Gagnant : {event.pokerResult.winnerLabel}</Text>
        </View>
      )}

      {/* MORTAL KOMBAT outcome si MK & gagné */}
      {isWon && event.mkResult && (
        <View style={styles.mkContainer}>
          <Text style={styles.mkHeader}>RÉSULTAT DU COMBAT</Text>
          {event.mkResult.rounds.map((r) => (
            <Text key={r.roundNum} style={styles.mkLine}>
              Round {r.roundNum} : {r.winner} ({r.victoryType})
            </Text>
          ))}
          <Text style={styles.mkWinner}>Vainqueur : {event.mkResult.finalWinner}</Text>
        </View>
      )}

      {/* 3. Pronostic & Cote */}
      <View style={styles.predictionRow}>
        <Text style={styles.predictionText} numberOfLines={2}>
          {event.prediction}
        </Text>
        <Text style={styles.oddText}>{event.odd}</Text>
      </View>

      {/* 4. Statut de l'événement */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Statut :</Text>
        {eventIsWon ? (
          <View style={styles.statusBadgeWon}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" style={{ marginRight: 4 }} />
            <Text style={styles.statusWonText}>Gain</Text>
          </View>
        ) : eventIsLost ? (
          <View style={styles.statusBadgeLost}>
            <Ionicons name="close-circle" size={15} color="#DC2626" style={{ marginRight: 4 }} />
            <Text style={styles.statusLostText}>Perte</Text>
          </View>
        ) : (
          <View style={styles.statusBadgeAccept}>
            <Ionicons name="checkmark-circle" size={15} color="#1E40AF" style={{ marginRight: 4 }} />
            <Text style={styles.statusAcceptText}>Accepté</Text>
          </View>
        )}
      </View>

      {/* 5. Informations supplémentaires (masqué sur le football standard) */}
      {event.roundCode && event.sport !== 'Football' && event.gameCategory !== 'sports' && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Informations supplémentaires :</Text>
          <Text style={styles.infoValue}>{event.roundCode}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerSection: {
    marginBottom: 10,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  leagueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 22,
  },
  confrontationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  homeTeamSide: {
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
  homeTeamName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
  },
  awayTeamName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'left',
    marginLeft: 8,
    flex: 1,
  },
  teamLogoBadgeHome: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  teamLogoBadgeAway: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  vsContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  scorePillContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  scorePill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2.5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scorePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  predictionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  oddText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadgeWon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusWonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#22C55E',
  },
  statusBadgeLost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLostText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  statusBadgeAccept: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAcceptText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E40AF',
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
    color: '#2563EB',
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
    color: '#16A34A',
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
