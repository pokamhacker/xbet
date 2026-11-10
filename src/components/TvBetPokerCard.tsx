import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchEvent } from '../types/bet';
import { Typography } from '../theme/theme';
import { generateWinningPokerDraw, renderCardsWithSuits, getStableRandomHand } from '../utils/pokerGenerator';
import { PokerFormattedLine } from './poker/PokerSuit3DIcon';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { formatBetDate, combineDateAndTime, replaceMonthNamesWithNumbers } from '../utils/dateFormatter';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { LiveBadge } from './LiveBadge';

export interface TvBetPokerCardProps {
  event: MatchEvent;
  isWon?: boolean;
  couponStatus?: string;
  isLive?: boolean;
  onPress?: () => void;
}

const formatTvBetNumericDate = (dateInput?: any, timeOverride?: string): string => {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  // Remplacement immédiat des mois textuels par des chiffres (ex: "21 oct 2026" -> "21.10.2026")
  const withNumericMonths = replaceMonthNamesWithNumbers(str);
  if (timeOverride && timeOverride.trim()) {
    return combineDateAndTime(withNumericMonths, timeOverride.trim()).formatted;
  }
  // Si déjà sous forme "JJ.MM.AAAA (HH:mm)" ou "JJ.MM.AAAA"
  if (/^\d{1,2}\.\d{1,2}\.\d{4}(\s*\(\d{1,2}:\d{2}\))?$/.test(withNumericMonths)) {
    return withNumericMonths;
  }
  return formatBetDate(withNumericMonths, timeOverride);
};

export const TvBetPokerCard: React.FC<TvBetPokerCardProps> = ({
  event,
  isWon = false,
  couponStatus,
  isLive,
  onPress,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const { font, moderateScale, verticalScale } = useResponsive();

  // Détection stricte des statuts
  const isEventWon = Boolean(
    isWon ||
    event.status === 'Gain' ||
    event.status === 'Gagné' ||
    event.status === 'Payé' ||
    couponStatus === 'Payé' ||
    couponStatus === 'Gagné' ||
    couponStatus === 'Gain'
  );
  const isEventLost = !isEventWon && (event.status === 'Perdu' || couponStatus === 'Perdu');
  const isCouponFinished = isEventWon || isEventLost || couponStatus === 'Annulé' || couponStatus === 'Vendu';

  // Le badge en direct disparaît dès que le coupon ou l'événement poker est validé / gagné / terminé
  const showLiveBadge = !isCouponFinished && Boolean(
    isLive !== undefined ? isLive : event.isLive
  );

  const isCouponAccepted = !isEventWon && !isEventLost;

  // Formatage date et heure précis en format numérique strict (ex: "21.10.2026 (17:25)" ou "21.10.2026")
  const dateDisplay = React.useMemo(() => {
    const rawDate = event.matchDate || event.startDate || event.date || event.eventDate;
    if (event.matchTime) {
      return formatTvBetNumericDate(rawDate, event.matchTime);
    }
    return formatTvBetNumericDate(rawDate);
  }, [event.matchTime, event.matchDate, event.startDate, event.date, event.eventDate]);

  // Formatage de la cote (ex: 5.8 sans zéros superflus)
  const oddDisplay = formatCleanOdds(event.odd);

  // Tirage poker dynamique basé sur la combinaison du pronostic (avec main gagnante aléatoire)
  const pokerDraw = React.useMemo(() => {
    const seed = event.id || event.roundCode || (event as any).additionalInfo || event.prediction || 'poker-seed';
    if (event.pokerResult && event.pokerResult.hands && event.pokerResult.hands.length === 6) {
      let resolvedWinner = getStableRandomHand(seed);
      if (event.pokerResult.winnerLabel) {
        const m = event.pokerResult.winnerLabel.match(/([1-6])/);
        if (m) resolvedWinner = parseInt(m[1], 10);
      }
      return {
        hand1: event.pokerResult.hands[0]?.cards || 'K♠, A♠',
        hand2: event.pokerResult.hands[1]?.cards || '4♦, 4♣',
        hand3: event.pokerResult.hands[2]?.cards || '7♥, 2♦',
        hand4: event.pokerResult.hands[3]?.cards || '10♥, Q♣',
        hand5: event.pokerResult.hands[4]?.cards || '2♥, J♦',
        hand6: event.pokerResult.hands[5]?.cards || 'A♣, 9♦',
        table: event.pokerResult.board || '10♠, J♣, Q♠, 3♥, 6♣',
        winnerHand: resolvedWinner,
        combinationName: event.prediction || 'Une Paire',
      };
    }
    return generateWinningPokerDraw(event.prediction || 'Une Paire', seed);
  }, [event.pokerResult, event.prediction, event.id, event.roundCode]);

  const cleanCombinationName = React.useMemo(() => {
    const raw = pokerDraw.combinationName || 'Une Paire';
    return raw.replace(/^Combinaison gagnante\.\s*/i, '').trim();
  }, [pokerDraw.combinationName]);

  // Couleurs conditionnelles adaptées à la marque et au thème
  const labelPrefixColor =
    currentTheme.textSecondary ||
    currentTheme.colors?.textSecondary ||
    (currentTheme.isDark ? '#8EA3B8' : (brandChoice === '1xbet' ? '#5B7B9A' : '#708A9E'));
  const cardTextColor = currentTheme.isDark ? '#E2E8F0' : '#334155';
  const redCardStyle = { color: '#EF4444', fontWeight: '700' as const };
  const baseCardTextStyle = [
    styles.pokerLine,
    {
      fontSize: font(13),
      color: cardTextColor,
      fontWeight: '600' as const,
    },
  ];
  const dividerColor = currentTheme.isDark ? '#2C3A4B' : '#E8EEF5';
  const mainTextColor = currentTheme.isDark ? currentTheme.textPrimary : '#0C2340';
  const additionalInfoColor = currentTheme.primary || '#3B82F6';
  const isMelbet = Boolean(
    brandChoice === 'melbet' ||
    (currentTheme?.name || '').toLowerCase().includes('melbet')
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.cardContainer,
        {
          paddingHorizontal: moderateScale(10),
          paddingVertical: verticalScale(10),
        },
      ]}
    >
      {/* 1. EN-TÊTE DE LA DISCIPLINE */}
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/icons/ic_tvbet_gamepad.png')}
            style={[
              styles.gamepadIcon,
              {
                width: 20,
                height: 18,
                tintColor: isMelbet ? '#1B365D' : '#507694',
              },
            ]}
            resizeMode="contain"
          />
          <View style={styles.headerTextGroup}>
            <Text style={[styles.disciplineTitle, { color: isMelbet ? '#1B365D' : '#507694', fontSize: font(12.5), fontWeight: '700' }]}>
              TvBet. POKER
            </Text>
            <View style={styles.dateTimeLiveRow}>
              <Text style={[styles.dateSubtitle, { color: isMelbet ? '#3A5070' : '#7B96AB', fontSize: font(12) }]}>
                {dateDisplay}
              </Text>
              {showLiveBadge && (
                <LiveBadge style={{ marginLeft: moderateScale(8) }} />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 2. BLOC CENTRAL : TITRE POKER TOUJOURS PRÉSENT (+ TIRAGE DÉTAILLÉ UNIQUEMENT SI GAGNANT) */}
      <View style={[styles.pokerCenterContainer, !isEventWon && styles.pokerAcceptedCenterSpacing]}>
        <Text style={[styles.pokerTitle, { color: mainTextColor, fontSize: font(14.5) }]}>
          POKER
        </Text>

        {isEventWon && (
          <View style={styles.pokerHandsBlock}>
            {[
              pokerDraw.hand1,
              pokerDraw.hand2,
              pokerDraw.hand3,
              pokerDraw.hand4,
              pokerDraw.hand5,
              pokerDraw.hand6,
            ].map((handCards, hIdx) => (
              <PokerFormattedLine
                key={`hand-${hIdx}`}
                label={`Main ${hIdx + 1} : `}
                text={handCards}
                color={currentTheme.isDark ? '#93A7BC' : labelPrefixColor}
              />
            ))}

            <PokerFormattedLine
              label="Table : "
              text={pokerDraw.table}
              color={currentTheme.isDark ? '#93A7BC' : labelPrefixColor}
            />

            <PokerFormattedLine
              label="Gagnant : "
              text={`${pokerDraw.winnerHand} (${cleanCombinationName})`}
              color={currentTheme.isDark ? '#93A7BC' : labelPrefixColor}
            />
          </View>
        )}
      </View>

      {/* SÉPARATEUR 1 */}
      <View style={[styles.cardDivider, { backgroundColor: dividerColor }]} />

      {/* 3. PRONOSTIC / SÉLECTION DU MARCHÉ & COTE */}
      <View style={styles.marketSelectionRow}>
        <View style={styles.marketSelectionLeft}>
          <Text
            style={[styles.marketSelectionText, { color: mainTextColor, fontSize: font(14) }]}
            numberOfLines={2}
          >
            {event.prediction || 'Combinaison gagnante. Une Paire'}
          </Text>
        </View>

        <View style={styles.marketOddsRight}>
          <Text
            style={[styles.marketOddsText, { color: mainTextColor, fontSize: font(12) }]}
          >
            {oddDisplay}
          </Text>
        </View>
      </View>

      {/* 4. STATUT */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: labelPrefixColor, fontSize: font(13.5) }]}>
          Statut:
        </Text>

        {isEventWon ? (
          <View style={styles.gainStatusWrap}>
            <View
              style={[
                styles.greenCheckCircle,
                {
                  backgroundColor: currentTheme.status?.paye || '#22C55E',
                  width: moderateScale(16),
                  height: moderateScale(16),
                  borderRadius: moderateScale(8),
                },
              ]}
            >
              <Ionicons name="checkmark" size={moderateScale(10)} color="#FFFFFF" />
            </View>
            <Text style={[styles.gainStatusText, { color: currentTheme.status?.paye || '#22C55E', fontSize: font(13.5) }]}>
              Gain
            </Text>
          </View>
        ) : isEventLost ? (
          <View style={styles.lostStatusWrap}>
            <View
              style={[
                styles.redCloseCircle,
                {
                  backgroundColor: currentTheme.status?.perdu || '#DC2626',
                  width: moderateScale(16),
                  height: moderateScale(16),
                  borderRadius: moderateScale(8),
                },
              ]}
            >
              <Ionicons name="close" size={moderateScale(10)} color="#FFFFFF" />
            </View>
            <Text style={[styles.lostStatusText, { color: currentTheme.status?.perdu || '#DC2626', fontSize: font(13) }]}>
              Perdu
            </Text>
          </View>
        ) : (
          <Text style={[styles.plainAcceptStatusText, { color: currentTheme.status?.accepte || currentTheme.primary, fontSize: font(13.5) }]}>
            Accepté
          </Text>
        )}
      </View>

      {/* SÉPARATEUR 2 */}
      <View style={[styles.cardDivider, { backgroundColor: dividerColor }]} />

      {/* 5. INFORMATIONS SUPPLÉMENTAIRES */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoLabel, { color: additionalInfoColor, fontSize: font(13) }]}>
          Informations supplémentaires :
        </Text>
        <Text style={[styles.infoValue, { color: mainTextColor, fontSize: font(14.5) }]}>
          {event.roundCode || (event as any).id || 'PB220781'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TvBetPokerCard;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  gamepadIcon: {
    width: 20,
    height: 18,
    marginRight: 7,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  disciplineTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  dateTimeLiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateSubtitle: {
    fontSize: 12,
    fontFamily: Typography.fontFamily,
  },

  // 2. Bloc Central : POKER
  pokerCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokerAcceptedCenterSpacing: {
    paddingVertical: 14,
  },
  pokerTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  pokerHandsBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  pokerLine: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  labelPrefix: {
    fontWeight: '400',
  },
  tableLine: {
    marginTop: 2,
    marginBottom: 2,
  },
  winnerLine: {
    marginTop: 2,
    marginBottom: 4,
    fontWeight: '400',
  },

  // Séparateurs horizontaux pleine largeur
  cardDivider: {
    height: 1,
    marginHorizontal: -10,
    marginVertical: 10,
  },

  // 3. Pronostic / Sélection du marché & Cote
  marketSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  marketSelectionLeft: {
    flex: 1,
    paddingRight: 10,
  },
  marketSelectionText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  marketOddsRight: {
    alignItems: 'flex-end',
  },
  marketOddsText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },

  // 4. Statut
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  plainAcceptStatusText: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  gainStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  gainStatusText: {
    fontSize: 13.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  lostStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  redCloseCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lostStatusText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },

  // 5. Informations supplémentaires
  infoSection: {
    marginTop: 2,
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  infoValue: {
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
    marginTop: 3,
  },
});
