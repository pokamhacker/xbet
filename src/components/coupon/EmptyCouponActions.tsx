import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { useBetStore } from '../../store/useBetStore';
import {
  CreateCouponActionIcon,
  LoadCouponActionIcon,
  TrophyCupIcon,
} from '../common/CouponIcons';

export interface EmptyCouponActionsProps {
  navigation?: any;
  userBalance?: string;
  onDeposit?: () => void;
  onSearch?: () => void;
  onCombine?: () => void;
  onCreateCoupon?: () => void;
  onLoadCoupon?: () => void;
  onRechargeAccount?: () => void;
  onEventSearch?: () => void;
  onDailyAccumulator?: () => void;
  onGenerateCoupon?: () => void;
  onCreateManualCoupon?: () => void;
}

export const EmptyCouponActions: React.FC<EmptyCouponActionsProps> = ({
  userBalance: propUserBalance,
  onDeposit,
  onSearch,
  onCombine,
  onCreateCoupon,
  onLoadCoupon,
  onRechargeAccount,
  onEventSearch,
  onDailyAccumulator,
  onGenerateCoupon,
}) => {
  const { currentTheme } = useThemeStore();
  const balance = useBetStore((state) => state.balance);
  const [favoriteExpanded, setFavoriteExpanded] = useState(false);

  const isDark = currentTheme.isDark;
  const isMelbet = currentTheme.name.toLowerCase().includes('melbet');

  // Couleurs calibrées multi-thèmes (1xBet & Melbet)
  const accentColor = isMelbet
    ? '#E58E26'
    : currentTheme.colors.primary || '#228BE6';

  const cardBg = isMelbet
    ? isDark
      ? '#262B31'
      : currentTheme.colors.cardBackground || '#FFFFFF'
    : isDark
      ? currentTheme.colors.cardBackground || '#1E2733'
      : '#FFFFFF';

  const iconCircleBg = isMelbet
    ? isDark
      ? '#323840'
      : '#ECEFF3'
    : isDark
      ? '#2B3647'
      : '#EEF2F7';

  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const subtitleColor = isDark ? '#8A949E' : '#64748B';

  const formattedBalance =
    propUserBalance ||
    `${Number(balance || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })} F`;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Titre et sous-titre calibrés comme Vidéo 1 (marginTop: 28, marginBottom: 18) */}
      <View style={styles.emptyHeaderContainer}>
        <Text style={[styles.emptyTitle, { color: titleColor }]}>
          Votre coupon de pari est vide
        </Text>
        <Text style={[styles.emptySubtitle, { color: subtitleColor }]}>
          Ajoutez un événement au coupon de pari ou choisissez l'une des options
        </Text>
      </View>

      {/* Liste des cartes d'options compactes */}
      <View style={styles.cardsList}>
        {/* 1. Recharger le compte */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: cardBg }]}
          activeOpacity={0.75}
          onPress={onDeposit || onRechargeAccount}
        >
          <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 5V19M5 12H19"
                stroke={isMelbet && isDark ? '#1A1E23' : '#FFFFFF'}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
              Recharger le compte
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>
              Votre solde: {formattedBalance}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 2. Recherche d'événement */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: cardBg }]}
          activeOpacity={0.75}
          onPress={onSearch || onEventSearch}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="11"
                cy="11"
                r="6.5"
                stroke={accentColor}
                strokeWidth={2.2}
              />
              <Path
                d="M16 16L20.5 20.5"
                stroke={accentColor}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
              Recherche d'événement
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>
              Uniquement pour vous
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3. Combiné du jour */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: cardBg }]}
          activeOpacity={0.75}
          onPress={onCombine || onDailyAccumulator}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Rect
                x="3.5"
                y="6"
                width="14"
                height="10"
                rx="2"
                stroke={accentColor}
                strokeWidth={2}
              />
              <Path
                d="M7.5 19H18.5C19.6 19 20.5 18.1 20.5 17V9"
                stroke={accentColor}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
              Combiné du jour
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>
              Meilleures offres du jour
            </Text>
          </View>
        </TouchableOpacity>

        {/* 4. Créer un coupon de pari */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: cardBg }]}
          activeOpacity={0.75}
          onPress={onCreateCoupon || onGenerateCoupon}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>
            <CreateCouponActionIcon size={18} color={accentColor} />
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
              Créer un coupon de pari
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>
              Générez votre coupon de pari
            </Text>
          </View>
        </TouchableOpacity>

        {/* 5. Charger le coupon de pari */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: cardBg }]}
          activeOpacity={0.75}
          onPress={onLoadCoupon}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>
            <LoadCouponActionIcon size={18} color={accentColor} />
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.cardTitle, { color: titleColor }]} numberOfLines={1}>
              Charger le coupon de pari
            </Text>
            <Text style={[styles.cardSubtitle, { color: subtitleColor }]} numberOfLines={1}>
              Chargez votre coupon de pari
            </Text>
          </View>
        </TouchableOpacity>

        {/* 6. Bet on the favorite — EXCLUSIVEMENT SUR MELBET */}
        {isMelbet && (
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: cardBg }]}
            activeOpacity={0.75}
            onPress={() => setFavoriteExpanded((prev) => !prev)}
          >
            <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>
              <TrophyCupIcon size={18} color="#E58E26" />
            </View>
            <Text
              style={[styles.favoriteTitle, { color: titleColor }]}
              numberOfLines={1}
            >
              Bet on the favorite
            </Text>
            <View style={[styles.favoriteCountBadge, { backgroundColor: iconCircleBg }]}>
              <Text style={styles.favoriteCountText}>3</Text>
            </View>
            <View style={[styles.favoriteChevronBtn, { backgroundColor: iconCircleBg }]}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d={favoriteExpanded ? 'M6 15L12 9L18 15' : 'M6 9L12 15L18 9'}
                  stroke="#8A949E"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 2,
    paddingBottom: 120,
  },
  emptyHeaderContainer: {
    marginTop: 28,
    marginBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardsList: {
    width: '100%',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  favoriteTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
  },
  favoriteCountBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteCountText: {
    color: '#E58E26',
    fontSize: 12.5,
    fontWeight: '700',
  },
  favoriteChevronBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EmptyCouponActions;
