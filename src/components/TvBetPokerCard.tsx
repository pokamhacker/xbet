import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchEvent } from '../types/bet';
import { Colors, Typography } from '../theme/theme';
import { generateWinningPokerDraw, renderCardsWithSuits } from '../utils/pokerGenerator';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { formatBetDate } from '../utils/dateFormatter';

export interface TvBetPokerCardProps {
  event: MatchEvent;
  isWon?: boolean;
  onPress?: () => void;
}

export const TvBetPokerCard: React.FC<TvBetPokerCardProps> = ({
  event,
  isWon = false,
  onPress,
}) => {
  const { currentTheme } = useThemeStore();
  const { font, scale, verticalScale, moderateScale, isTablet } = useResponsive();
  const isEventWon = event.status === 'Gain' || event.status === 'Gagné' || isWon;
  const isEventLost = event.status === 'Perdu';

  // Formatage date et heure
  const dateDisplay = formatBetDate(event.date || '05.09.2026 (01:50)');

  // Formatage de la cote (ex: 1000 ou 5.00)
  const oddDisplay =
    typeof event.odd === 'number'
      ? Number.isInteger(event.odd)
        ? event.odd.toString()
        : event.odd.toFixed(2)
      : event.odd || '1.00';

  // Tirage poker dynamique basé sur la combinaison du pronostic
  const pokerDraw = React.useMemo(() => {
    if (event.pokerResult && event.pokerResult.hands && event.pokerResult.hands.length === 6) {
      return {
        hand1: event.pokerResult.hands[0]?.cards || 'K♠, A♠',
        hand2: event.pokerResult.hands[1]?.cards || '4♦, 4♣',
        hand3: event.pokerResult.hands[2]?.cards || '7♥, 2♦',
        hand4: event.pokerResult.hands[3]?.cards || '10♥, Q♣',
        hand5: event.pokerResult.hands[4]?.cards || '2♥, J♦',
        hand6: event.pokerResult.hands[5]?.cards || 'A♣, 9♦',
        table: event.pokerResult.board || '10♠, J♣, Q♠, 3♥, 6♣',
        winnerHand: 1,
        combinationName: event.prediction || 'Quinte flush',
      };
    }
    return generateWinningPokerDraw(event.prediction || 'Quinte flush');
  }, [event.pokerResult, event.prediction]);

  const cleanCombinationName = React.useMemo(() => {
    const raw = pokerDraw.combinationName || 'Quinte flush';
    return raw.replace(/^Combinaison gagnante\.\s*/i, '').trim();
  }, [pokerDraw.combinationName]);

  // Dynamic colors for Texas Hold'em cards & labels
  const labelPrefixColor = currentTheme.name.startsWith('melbet') ? '#94A3B8' : '#64748B';
  const cardTextColor = currentTheme.name.startsWith('melbet') ? '#94A3B8' : '#334155';
  const redCardStyle = { color: '#EF4444', fontWeight: '700' as const };
  const baseCardTextStyle = [
    styles.pokerLine,
    {
      fontSize: font(13),
      color: cardTextColor,
      fontWeight: '600' as const,
    },
  ];
  const accordionColor = currentTheme.name.startsWith('melbet') ? '#E58B05' : currentTheme.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.cardContainer,
        {
          paddingHorizontal: moderateScale(10),
          paddingVertical: verticalScale(14),
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
                width: moderateScale(20),
                height: moderateScale(20),
                tintColor: currentTheme.textSecondary,
              },
            ]}
            resizeMode="contain"
          />
          <View style={styles.headerTextGroup}>
            <Text style={[styles.disciplineTitle, { color: currentTheme.textSecondary, fontSize: font(12.5) }]}>TvBet. POKER</Text>
            <Text style={[styles.dateSubtitle, { color: currentTheme.textSecondary, fontSize: font(12) }]}>{dateDisplay}</Text>
          </View>
        </View>
      </View>

      {/* 2. BLOC CENTRAL SELON L'ÉTAT DU PARI */}
      {!isEventWon ? (
        /* État 1 : « Accepté » (En cours) */
        <View style={styles.pendingCenterBox}>
          <Text style={[styles.pokerTitle, { color: currentTheme.textPrimary }]}>POKER</Text>
        </View>
      ) : (
        /* État 2 : « Validé Gagné » (Formatage strict pixel-perfect mobile) */
        <View style={styles.pokerDrawContainer}>
          <Text style={[styles.pokerTitle, { color: currentTheme.textPrimary }]}>POKER</Text>

          <Text style={baseCardTextStyle}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Main 1 : </Text>
            {renderCardsWithSuits(pokerDraw.hand1, baseCardTextStyle, redCardStyle)}
          </Text>
          <Text style={baseCardTextStyle}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Main 2 : </Text>
            {renderCardsWithSuits(pokerDraw.hand2, baseCardTextStyle, redCardStyle)}
          </Text>
          <Text style={baseCardTextStyle}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Main 3 : </Text>
            {renderCardsWithSuits(pokerDraw.hand3, baseCardTextStyle, redCardStyle)}
          </Text>
          <Text style={baseCardTextStyle}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Main 4 : </Text>
            {renderCardsWithSuits(pokerDraw.hand4, baseCardTextStyle, redCardStyle)}
          </Text>
          <Text style={baseCardTextStyle}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Main 5 : </Text>
            {renderCardsWithSuits(pokerDraw.hand5, baseCardTextStyle, redCardStyle)}
          </Text>
          <Text style={baseCardTextStyle}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Main 6 : </Text>
            {renderCardsWithSuits(pokerDraw.hand6, baseCardTextStyle, redCardStyle)}
          </Text>

          <Text style={[styles.pokerLine, styles.tableLine, { color: cardTextColor }]}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Table : </Text>
            {renderCardsWithSuits(pokerDraw.table, baseCardTextStyle, redCardStyle)}
          </Text>

          <Text style={[styles.pokerLine, styles.winnerLine, { color: labelPrefixColor }]}>
            <Text style={[styles.labelPrefix, { color: labelPrefixColor }]}>Gagnant : </Text>
            {pokerDraw.winnerHand} ({cleanCombinationName})
          </Text>
        </View>
      )}

      {/* 3. PRONOSTIC / SÉLECTION DU MARCHÉ & COTE */}
      <View style={styles.marketSelectionRow}>
        <View style={styles.marketSelectionLeft}>
          <Text
            style={[styles.marketSelectionText, { color: currentTheme.textPrimary, fontSize: font(13) }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {event.prediction || 'Combinaison gagnante. Deux Paires'}
          </Text>
        </View>

        <View style={styles.marketOddsRight}>
          <Text
            style={[styles.marketOddsText, { color: currentTheme.textPrimary, fontSize: font(13.5) }]}
          >
            {oddDisplay}
          </Text>
        </View>
      </View>

      {/* 4. STATUT */}
      <View style={styles.statusRow}>
        <Text style={[styles.statusLabel, { color: currentTheme.textSecondary, fontSize: font(13) }]}>Statut :</Text>
        {isEventWon ? (
          <View style={styles.gainStatusWrap}>
            <View style={[styles.greenCheckCircle, { backgroundColor: currentTheme.status.paye, width: moderateScale(18), height: moderateScale(18), borderRadius: moderateScale(9) }]}>
              <Ionicons name="checkmark" size={moderateScale(11)} color={currentTheme.isDark ? '#000000' : '#FFFFFF'} />
            </View>
            <Text style={[styles.gainStatusText, { color: currentTheme.status.paye, fontSize: font(13.5) }]}>Gain</Text>
          </View>
        ) : isEventLost ? (
          <View style={styles.lostStatusWrap}>
            <View style={[styles.redCloseCircle, { backgroundColor: currentTheme.status.perdu, width: moderateScale(16), height: moderateScale(16), borderRadius: moderateScale(8) }]}>
              <Ionicons name="close" size={moderateScale(11)} color="#FFFFFF" />
            </View>
            <Text style={[styles.lostStatusText, { color: currentTheme.status.perdu, fontSize: font(13) }]}>Perdu</Text>
          </View>
        ) : (
          <View style={styles.acceptStatusWrap}>
            <View style={[styles.blueCheckCircle, { backgroundColor: currentTheme.status.accepte, width: moderateScale(16), height: moderateScale(16), borderRadius: moderateScale(8) }]}>
              <Ionicons name="checkmark" size={moderateScale(10)} color={currentTheme.isDark ? '#000000' : '#FFFFFF'} />
            </View>
            <Text style={[styles.acceptStatusText, { color: currentTheme.status.accepte, fontSize: font(12.5) }]}>Accepté</Text>
          </View>
        )}
      </View>

      {/* 5. INFORMATIONS SUPPLÉMENTAIRES */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoLabel, { color: accordionColor, fontSize: font(12) }]}>
          Informations supplémentaires :
        </Text>
        <Text style={[styles.infoValue, { color: currentTheme.textPrimary, fontSize: font(13) }]}>
          {event.roundCode || 'PB781011'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TvBetPokerCard;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 10,
    paddingVertical: 14,
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
    height: 20,
    marginRight: 8,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  disciplineTitle: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#7C8B99',
    fontFamily: Typography.fontFamily,
  },
  dateSubtitle: {
    fontSize: 12,
    color: '#7C8B99',
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roundCodeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roundCodeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: Typography.fontFamily,
  },
  liveBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.3,
  },

  // Bloc Central « Accepté » (En cours)
  pendingCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bloc Central « Validé Gagné » (Formatage strict pixel-perfect mobile)
  pokerDrawContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  pokerTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
    fontFamily: Typography.fontFamily,
  },
  pokerLine: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  redCard: {
    color: '#EF4444',
    fontWeight: '700',
  },
  labelPrefix: {
    color: '#7C8B99',
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
    color: '#7C8B99',
  },

  // Pronostic / Sélection du marché & Cote
  marketSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  marketSelectionLeft: {
    flex: 1,
    paddingRight: 8,
  },
  marketSelectionText: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  marketOddsRight: {
    alignItems: 'flex-end',
  },
  marketOddsText: {
    fontSize: 13.5,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  predictionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
    paddingRight: 8,
  },
  oddText: {
    fontSize: 13.5,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
  },

  // Statut
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: '#7C8B99',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  gainStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  gainStatusText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#22C55E',
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
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lostStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: Typography.fontFamily,
  },
  acceptStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  blueCheckCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptStatusText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Typography.fontFamily,
  },
  infoSection: {
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
});
