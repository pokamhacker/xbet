import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { MatchEvent } from '../../types/bet';
import { formatBetDate } from '../../utils/dateFormatter';

interface EventCardProps {
  event: MatchEvent;
  onRemove: (eventId: string) => void;
  theme?: any;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRemove,
  theme,
}) => {
  // 1. Championnat (ex: "Matchs amicaux des clubs")
  let leagueTitle = event.league || 'Matchs amicaux des clubs';
  if (leagueTitle.toUpperCase().startsWith('FIFA.')) {
    leagueTitle = leagueTitle.replace(/^FIFA\.\s*/i, '').trim();
  }

  // 2. Horodatage format exact : DD.MM.YYYY (HH:mm)
  const formattedDate = React.useMemo(() => {
    return formatBetDate(event.date || '13.09.2026 (04:00)');
  }, [event.date]);

  // 3. Formatage de la cote (100, 88 ou 2.15)
  const oddDisplay = React.useMemo(() => {
    if (typeof event.odd === 'number') {
      return Number.isInteger(event.odd) ? event.odd.toString() : event.odd.toFixed(2);
    }
    return event.odd || '100';
  }, [event.odd]);

  const cardBg = theme?.isDark ? theme.cardBackground : '#FFFFFF';
  const textPrimary = theme?.isDark ? '#F8FAFC' : '#0F172A';

  return (
    <View style={[styles.cardContainer, { backgroundColor: cardBg }]}>
      {/* Ligne 1 (Entête) : Ballon de foot + Texte compétition + Bouton suppression ✕ */}
      <View style={styles.headerRow}>
        <View style={styles.leagueWrap}>
          <Image
            source={require('../../../assets/icons/ic_football.png')}
            style={styles.soccerIcon}
            resizeMode="contain"
          />
          <Text style={styles.leagueText} numberOfLines={1}>
            {leagueTitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onRemove(event.id)}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Supprimer la sélection"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={17} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Ligne 2 (Affiche) : Nom des équipes en gras */}
      <Text style={[styles.teamsText, { color: textPrimary }]} numberOfLines={2}>
        {event.homeTeam?.name || 'Équipe 1'} - {event.awayTeam?.name || 'Équipe 2'}
      </Text>

      {/* Ligne 3 (Horodatage) : Date et heure au format DD.MM.YYYY (HH:mm) */}
      <Text style={styles.dateText}>
        {formattedDate}
      </Text>

      {/* Ligne 4 (Pari & Cote) : Pronostic à gauche et Cote en gros & gras à droite */}
      <View style={styles.predictionRow}>
        <Text style={[styles.predictionText, { color: textPrimary }]} numberOfLines={2}>
          {event.prediction || 'Score exact: 6-3'}
        </Text>
        <Text style={[styles.oddValue, { color: textPrimary }]}>
          {oddDisplay}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  leagueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  soccerIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  leagueText: {
    fontSize: 12,
    color: '#64748B', // Gris ardoise
    fontWeight: '500',
    flexShrink: 1,
  },
  closeBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 11.5,
    color: '#94A3B8', // Gris moyen
    marginBottom: 8,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  predictionText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  oddValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
});

export default EventCard;
export { EventCard as ActiveCouponCard };
