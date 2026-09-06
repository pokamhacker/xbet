import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchEvent } from '../types/bet';
import { Colors } from '../theme/theme';

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
  // Formatage strict avec des points : ex "Football . Koweït. Championnat du Koweït"
  const cleanLeague = (event.league || 'Koweït. Championnat du Koweït')
    .replace(/\s*-\s*/g, '. ')
    .replace(/\s*·\s*/g, '. ')
    .trim();
  const formattedHeader = `${event.sport || 'Football'} . ${cleanLeague}`;

  // Score central grand format (22sp)
  const rawScore = event.actualScore || '2-2';
  const cleanScore = rawScore.replace(/\s*[:\-]\s*/g, ' : ');

  // Récapitulatif mi-temps en gris atténué #64748B (ex: "2:2 (1:1, 1:1)")
  const halftimeText = event.halftimeScore || (() => {
    const parts = rawScore.split(/[-:]/).map((s) => parseInt(s.trim(), 10) || 0);
    const h1 = Math.floor(parts[0] / 2);
    const h2 = parts[0] - h1;
    const a1 = Math.floor(parts[1] / 2);
    const a2 = parts[1] - a1;
    return `${parts[0]}:${parts[1]} (${h1}:${a1}, ${h2}:${a2})`;
  })();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.container}
    >
      {/* 1. En-tête : Icône Football + Libellé exact avec points + Date en dessous */}
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

      {/* 2. Confrontation & Tableau d'affichage central :
          [Nom Équipe 1 (droite)] [Logo 1 (32x32)] [Score Central 2 : 2] [Logo 2 (32x32)] [Nom Équipe 2 (gauche)] */}
      <View style={styles.confrontationWrapper}>
        {/* Équipe Domicile */}
        <View style={styles.homeSide}>
          <Text style={styles.homeTeamName} numberOfLines={2}>
            {event.homeTeam?.name || 'Al-Salmiya'}
          </Text>
          <View style={styles.teamLogoHome}>
            {event.homeTeam?.logo ? (
              <Image source={{ uri: event.homeTeam.logo }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <Ionicons name="shield" size={17} color="#2563EB" />
            )}
          </View>
        </View>

        {/* Score Central 22sp avec récapitulatif par mi-temps */}
        <View style={styles.centralScoreBox}>
          <Text style={styles.mainScoreText}>{cleanScore}</Text>
          <Text style={styles.halftimeText}>{halftimeText}</Text>
        </View>

        {/* Équipe Extérieur */}
        <View style={styles.awaySide}>
          <View style={styles.teamLogoAway}>
            {event.awayTeam?.logo ? (
              <Image source={{ uri: event.awayTeam.logo }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <Ionicons name="shield" size={17} color="#EA580C" />
            )}
          </View>
          <Text style={styles.awayTeamName} numberOfLines={2}>
            {event.awayTeam?.name || 'Al-Arabi Kuwait'}
          </Text>
        </View>
      </View>

      {/* 3. Pronostic & Cote */}
      <View style={styles.predictionRow}>
        <Text style={styles.predictionText} numberOfLines={2}>
          {event.prediction}
        </Text>
        <Text style={styles.oddText}>{event.odd}</Text>
      </View>

      {/* 4. Statut individuel du match : Layout transparent à plat sans fond */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Statut :</Text>
        <View style={styles.gainStatusWrap}>
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" style={{ marginRight: 4 }} />
          <Text style={styles.gainStatusText}>Gain</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
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
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  homeSide: {
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
  homeTeamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
  },
  awayTeamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'left',
    marginLeft: 8,
    flex: 1,
  },
  teamLogoHome: {
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
  teamLogoAway: {
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
  logoImage: {
    width: 22,
    height: 22,
  },
  centralScoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 74,
  },
  mainScoreText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  halftimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
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
  gainStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  gainStatusText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#22C55E', // Texte vert pur sans fond
  },
});

export default WonMatchEventCard;
