import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  Alert,
  Image,
  Animated,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useBetStore } from '../../store/useBetStore';
import { useCouponStore } from '../../store/couponStore';
import { useThemeStore } from '../../stores/themeStore';
import { BetSlip } from '../../types/bet';
import { getEventLiveProgress } from '../../utils/dateFormatter';

// ============================================================================
// ICÔNES LOCALES DEPUIS LE DOSSIER ASSETS
// ============================================================================
export const ASSET_ICONS = {
  combine: require('../../../assets/icons/cvv1.png'),
  combineAlt: require('../../../assets/icons/ic_combine.png'),
  football: require('../../../assets/icons/football.png'),
  fifa: require('../../../assets/icons/fifa.png'),
  poker: require('../../../assets/icons/poker.png'),
  cloche: require('../../../assets/icons/cloche.png'),
  filter: require('../../../assets/icons/filter.png'),
  layers: require('../../../assets/icons/ic_events_layers.png'),
  coupon: require('../../../assets/icons/coupon.png'),
  paye: require('../../../assets/icons/paye.png'),
};

// 1. Icône Entonnoir Filtre (barre supérieure détachée + cône biseauté exactement comme sur la vidéo)
export const OfficialFilterIcon: React.FC<{
  size?: number;
  color?: string;
  showBadge?: boolean;
}> = ({ size = 22, color = '#577089', showBadge = false }) => (
  <View style={{ width: size + 4, height: size + 2, justifyContent: 'center', alignItems: 'center' }}>
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Barre horizontale supérieure séparée */}
      <Rect x="3" y="4" width="18" height="2.4" rx="1" fill={color} />
      {/* Cône de l'entonnoir avec tige biseautée */}
      <Path
        d="M3.6 7.8H20.4L13.8 14.3V18.8L10.2 21V14.3L3.6 7.8Z"
        fill={color}
      />
    </Svg>
    {showBadge && (
      <View style={styles.filterBadge}>
        <Svg width={7} height={7} viewBox="0 0 12 12" fill="none">
          <Path
            d="M2.5 6.2L5 8.6L9.6 3.6"
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    )}
  </View>
);

// 2. Icône Relevé / Carte à côté du filtre (ligne haut + carte centrale à 2 traits blancs + ligne bas)
export const OfficialStatementCardIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 22, color = '#577089' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Ligne supérieure fine */}
    <Rect x="2.5" y="3" width="19" height="1.9" rx="0.9" fill={color} />
    {/* Carte centrale arrondie */}
    <Rect x="2.5" y="6.4" width="19" height="11.2" rx="2.2" fill={color} />
    {/* Deux traits blancs alignés à gauche dans la carte */}
    <Rect x="5.8" y="9.4" width="6.5" height="1.8" rx="0.8" fill="#FFFFFF" />
    <Rect x="5.8" y="12.8" width="6.5" height="1.8" rx="0.8" fill="#FFFFFF" />
    {/* Ligne inférieure fine */}
    <Rect x="2.5" y="19.1" width="19" height="1.9" rx="0.9" fill={color} />
  </Svg>
);

// 3. Icône Cloche officielle (dôme arrondi lisse + battant plein détaché en demi-lune)
export const OfficialBellIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 20, color = '#577089' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }}>
    <Path
      d="M6.5 10C6.5 6.8 8.9 4.5 12 4.5C15.1 4.5 17.5 6.8 17.5 10V13.2C17.5 14.5 18.4 15.5 19.3 16.3H4.7C5.6 15.5 6.5 14.5 6.5 13.2V10Z"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.7 18.6C9.9 20 10.8 20.8 12 20.8C13.2 20.8 14.1 20 14.3 18.6H9.7Z"
      fill={color}
    />
  </Svg>
);

// 4. Icône 3 Calques empilés (losange supérieur plein + 2 chevrons inférieurs)
export const OfficialLayersIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 15, color = '#6E849B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }}>
    <Path
      d="M11.1 2.9L3.3 7.1C2.5 7.5 2.5 8.5 3.3 8.9L11.1 13.1C11.7 13.4 12.3 13.4 12.9 13.1L20.7 8.9C21.5 8.5 21.5 7.5 20.7 7.1L12.9 2.9C12.3 2.6 11.7 2.6 11.1 2.9Z"
      fill={color}
    />
    <Path
      d="M3.2 12.4L11.2 16.7C11.7 17 12.3 17 12.8 16.7L20.8 12.4"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.2 16.9L11.2 21.2C11.7 21.5 12.3 21.5 12.8 21.2L20.8 16.9"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 5. Trois points horizontaux vectoriels (•••)
export const OfficialThreeDotsIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 18, color = '#577089' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ width: size, height: size }}>
    <Circle cx="5" cy="12" r="2.1" fill={color} />
    <Circle cx="12" cy="12" r="2.1" fill={color} />
    <Circle cx="19" cy="12" r="2.1" fill={color} />
  </Svg>
);

// Badge d'avatar avec pastille de vérification superposée (adaptée à tous les thèmes)
export const HistoryAvatarBadge: React.FC<{
  type: string;
  status: any;
  sport?: string;
  league?: string;
  gameCategory?: string;
  size?: number;
}> = ({ type, status, sport, league, gameCategory }) => {
  const { currentTheme } = useThemeStore();
  const statusStr = String(status || '').toLowerCase();
  const isPaid =
    statusStr.includes('pay') ||
    statusStr.includes('gagn') ||
    statusStr.includes('gain') ||
    statusStr === 'paid';
  const isLost = statusStr.includes('perdu') || statusStr === 'lost';
  const isAccepted = !isPaid && !isLost;

  const typeStr = String(type || '').toLowerCase();
  const sportStr = String(sport || '').toLowerCase();
  const leagueStr = String(league || '').toLowerCase();
  const catStr = String(gameCategory || '').toLowerCase();

  const isCombine = typeStr.includes('combin') || typeStr.includes('multi');
  const isPoker =
    !isCombine &&
    (catStr === 'poker' ||
      sportStr.includes('poker') ||
      sportStr.includes('tvbet') ||
      leagueStr.includes('poker') ||
      typeStr.includes('poker'));
  const isFifa =
    !isCombine &&
    !isPoker &&
    (typeStr.includes('fifa') ||
      sportStr.includes('fifa') ||
      leagueStr.includes('fifa') ||
      leagueStr.includes('fc 24') ||
      leagueStr.includes('fc 25') ||
      leagueStr.includes('fc 26') ||
      leagueStr.includes('5x5 rush'));

  // Couleurs adaptées dynamiquement à tous les thèmes
  const badgeBg = isPaid
    ? (currentTheme.status?.paye || currentTheme.status?.gagne || '#52B76E')
    : isLost
    ? (currentTheme.status?.perdu || '#E74C3C')
    : (currentTheme.status?.accepte || currentTheme.primary || '#4A89DC');

  const badgeBorderColor = currentTheme.cardBackground || '#FFFFFF';
  const iconTint = currentTheme.textSecondary || (currentTheme.isDark ? '#8A9DB0' : '#6E849B');

  return (
    <View style={styles.avatarWrapNoBg}>
      {isCombine ? (
        <Image
          source={ASSET_ICONS.combine}
          style={[styles.avatarIconCombineDirect, { tintColor: iconTint }]}
          resizeMode="contain"
        />
      ) : isPoker ? (
        <Image
          source={ASSET_ICONS.poker}
          style={[styles.avatarIconPokerDirect, { tintColor: iconTint }]}
          resizeMode="contain"
        />
      ) : isFifa ? (
        <Image
          source={ASSET_ICONS.fifa}
          style={[styles.avatarIconFifaDirect, { tintColor: iconTint }]}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={ASSET_ICONS.football}
          style={[styles.avatarIconFootballDirect, { tintColor: iconTint }]}
          resizeMode="contain"
        />
      )}

      {/* Badge de vérification superposé en bas à droite avec coche vectorielle arrondie */}
      <View
        style={[
          styles.statusMiniDotDirect,
          {
            backgroundColor: badgeBg,
            borderColor: badgeBorderColor,
          },
        ]}
      >
        {(isAccepted || isPaid) && (
          <Svg width={9.5} height={9.5} viewBox="0 0 12 12" fill="none">
            <Path
              d="M2.5 6.2L5 8.6L9.6 3.6"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
        {isLost && (
          <Svg width={9} height={9} viewBox="0 0 12 12" fill="none">
            <Rect x="2.5" y="5" width="7" height="2" rx="1" fill="#FFFFFF" />
          </Svg>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// COMPOSANT CARTE DE PARI HISTORIQUE (HistoryCard)
// ============================================================================
interface HistoryCardProps {
  coupon: BetSlip;
  onPress: () => void;
  onPressOptions?: () => void;
  onLongPress?: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  coupon,
  onPress,
  onPressOptions,
  onLongPress,
  isSelectionMode = false,
  isSelected = false,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = Boolean(currentTheme?.isDark);

  const statusStr = String(coupon.status || 'Accepté').toLowerCase();
  const isPaid =
    statusStr.includes('pay') ||
    statusStr.includes('gagn') ||
    statusStr.includes('gain') ||
    statusStr === 'paid';
  const isLost = statusStr.includes('perdu') || statusStr === 'lost';
  const isAccepted = !isPaid && !isLost;

  const isPoker =
    coupon.gameCategory === 'poker' ||
    String(coupon.sport || '').toLowerCase().includes('poker') ||
    String(coupon.league || '').toLowerCase().includes('poker') ||
    coupon.badge === 'POKE';

  const isFifa =
    !isPoker &&
    (String(coupon.sport || '').toLowerCase().includes('fifa') ||
      String(coupon.league || '').toLowerCase().includes('fifa') ||
      String(coupon.league || '').toLowerCase().includes('fc 2') ||
      String(coupon.league || '').toLowerCase().includes('5x5 rush') ||
      Boolean(
        coupon.events?.some(
          (ev: any) =>
            Boolean(ev?.isFifa) ||
            String(ev?.sport || '').toLowerCase().includes('fifa') ||
            String(ev?.league || '').toLowerCase().includes('fifa') ||
            String(ev?.league || '').toLowerCase().includes('fc 2') ||
            String(ev?.league || '').toLowerCase().includes('5x5 rush')
        )
      ));

  const isLive = Boolean(
    isAccepted &&
      (coupon.events && coupon.events.length > 0
        ? coupon.events.some((ev: any) => getEventLiveProgress(ev).isLive)
        : getEventLiveProgress(coupon).isLive)
  );
  const statusLabel = isAccepted ? 'Accepté' : isPaid ? 'Payé' : 'Perdu';
  const statusColor = isPaid
    ? (currentTheme.status?.paye || currentTheme.status?.gagne || '#4EBA6F')
    : isLost
    ? (currentTheme.status?.perdu || '#E74C3C')
    : (currentTheme.status?.accepte || currentTheme.primary || '#4A83C4');

  const isCombine =
    (coupon.events && coupon.events.length > 1) ||
    coupon.type === 'Combiné' ||
    String(coupon.type || '').toLowerCase().includes('combin');
  const typeLabel = isCombine ? 'Combiné' : 'Simple';
  const eventsCount = coupon.eventsCount || coupon.events?.length || (isCombine ? 2 : 1);

  const dateStr = coupon.matchTime && coupon.matchDate
    ? `${coupon.matchDate} (${coupon.matchTime})`
    : coupon.createdAt
    ? new Date(coupon.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ` (${new Date(coupon.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})`
    : '29.10.2026 (22:23)';

  const ticketNumber = coupon.id || (coupon as any).ticketNumber || '89755801725';

  const totalOddsStr = Number(coupon.totalOdds || 1.921).toFixed(3).replace(/\.?0+$/, '');
  const stakeRounded = Math.round(Number(coupon.stake || 500));
  const stakeStr = `${stakeRounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₣`;

  const potentialGainNum = Math.round(
    Number(coupon.potentialPayout || (coupon as any).potentialGain || 961)
  );
  const potentialGainStr = `${potentialGainNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₣`;

  const actualGainNum = Math.round(
    Number(coupon.actualPayout || (coupon as any).actualGain || 131)
  );
  const actualGainStr = `${actualGainNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₣`;

  const pillBadgeText =
    coupon.badge === 'Serie A' || coupon.league === 'Serie A'
      ? 'Serie A'
      : String(coupon.league || coupon.badge || '').includes('Principaux événements')
      ? String(coupon.league || coupon.badge)
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.cardContainer,
        {
          backgroundColor: currentTheme.cardBackground,
          borderColor: isSelected
            ? (currentTheme.primary || '#4A83C4')
            : (currentTheme.border || '#E6ECF2'),
          borderWidth: isSelected ? 1.5 : 0,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={260}
    >
      {/* 1. EN-TÊTE DE LA CARTE */}
      <View
        style={[
          styles.cardTopSection,
          { backgroundColor: currentTheme.cardBackground },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          {isSelectionMode && (
            <View
              style={[
                styles.selectCheckboxCircle,
                isSelected
                  ? {
                      backgroundColor: currentTheme.primary || '#4A83C4',
                      borderColor: currentTheme.primary || '#4A83C4',
                    }
                  : {
                      backgroundColor: 'transparent',
                      borderColor: currentTheme.textSecondary || '#94A3B8',
                    },
              ]}
            >
              {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          )}

          {/* Avatar avec badge */}
          <HistoryAvatarBadge
            type={typeLabel}
            status={coupon.status}
            sport={coupon.sport || coupon.events?.[0]?.sport}
            league={coupon.league || coupon.events?.[0]?.league}
            gameCategory={coupon.gameCategory}
            size={40}
          />

          {/* Informations centrales */}
          <View style={styles.cardCenterCol}>
            <Text
              style={[
                styles.cardDateNumText,
                { color: currentTheme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {dateStr} · № {ticketNumber}
            </Text>

            <View style={styles.cardTypeRow}>
              <Text
                style={[
                  styles.cardTypeText,
                  { color: currentTheme.textPrimary },
                ]}
              >
                {typeLabel}
              </Text>

              {isCombine && (
                <View style={styles.combineLayersGroup}>
                  <View style={{ marginRight: 4 }}>
                    <OfficialLayersIcon
                      size={14.5}
                      color={currentTheme.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.combineLayersCount,
                      { color: currentTheme.textPrimary },
                    ]}
                  >
                    {eventsCount}
                  </Text>
                </View>
              )}

              {Boolean(pillBadgeText) && (
                <View style={styles.serieABadge}>
                  <Text style={styles.serieABadgeText}>{pillBadgeText}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions à droite : Cloche et menu ••• */}
          <View style={styles.cardRightActions}>
            {isAccepted && !isPoker && (
              <TouchableOpacity
                style={styles.cardBellBtn}
                onPress={() =>
                  Alert.alert('Notifications', 'Notifications activées pour ce pari.')
                }
              >
                <OfficialBellIcon
                  size={20}
                  color={isDark ? currentTheme.textSecondary : (currentTheme.activeIcon || currentTheme.primary || '#4A83C4')}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cardActionIconBtn}
              onPress={onPressOptions || onPress}
            >
              <OfficialThreeDotsIcon
                size={18}
                color={isDark ? currentTheme.textSecondary : (currentTheme.activeIcon || currentTheme.primary || '#4A83C4')}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* SÉPARATEUR FIN PLEINE LARGEUR */}
      <View
        style={[
          styles.cardDivider,
          { backgroundColor: currentTheme.divider || currentTheme.border || '#F0F4F8' },
        ]}
      />

      {/* 2. CORPS DE LA CARTE */}
      <View
        style={[
          styles.cardBody,
          { backgroundColor: currentTheme.cardBackground },
        ]}
      >
        {/* Ligne Cotes */}
        <View style={styles.cardDataRow}>
          <Text
            style={[
              styles.cardDataLabel,
              { color: currentTheme.textSecondary },
            ]}
          >
            Cotes:
          </Text>
          <Text
            style={[
              styles.cardDataValueBold,
              { color: currentTheme.textPrimary },
            ]}
          >
            {totalOddsStr}
          </Text>
        </View>

        {/* Ligne Mise */}
        <View style={styles.cardDataRow}>
          <Text
            style={[
              styles.cardDataLabel,
              { color: currentTheme.textSecondary },
            ]}
          >
            Mise:
          </Text>
          <Text
            style={[
              styles.cardDataValueBold,
              { color: currentTheme.textPrimary },
            ]}
          >
            {stakeStr}
          </Text>
        </View>

        {/* Ligne Gains potentiels ou Gains */}
        {isAccepted && (
          <View style={styles.cardDataRow}>
            <Text
              style={[
                styles.cardDataLabel,
                { color: currentTheme.textSecondary },
              ]}
            >
              Gains potentiels:
            </Text>
            <Text
              style={[
                styles.cardDataValueBold,
                { color: currentTheme.textPrimary },
              ]}
            >
              {potentialGainStr}
            </Text>
          </View>
        )}

        {isPaid && (
          <View style={styles.cardDataRow}>
            <Text
              style={[
                styles.cardDataLabel,
                { color: currentTheme.textSecondary },
              ]}
            >
              Gains:
            </Text>
            <Text
              style={[
                styles.cardDataValueBold,
                { color: currentTheme.status?.paye || currentTheme.status?.gagne || '#4EBA6F' },
              ]}
            >
              {actualGainStr}
            </Text>
          </View>
        )}

        {/* Ligne Statut */}
        <View style={styles.cardDataRow}>
          <Text
            style={[
              styles.cardDataLabel,
              { color: currentTheme.textSecondary },
            ]}
          >
            Statut:
          </Text>
          <Text
            style={[
              styles.cardStatusValueText,
              { color: statusColor },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// ÉCRAN PRINCIPAL : HistoryListScreen / BetHistoryScreen
// ============================================================================
export default function HistoryListScreen() {
  const navigation = useNavigation<any>();
  const { coupons, balance, deposit, validateCouponWithResult, deleteCoupon, deleteCoupons } =
    useBetStore();
  const { currentTheme, brandChoice } = useThemeStore();
  const isDark = Boolean(currentTheme?.isDark);
  const isParipesa =
    brandChoice === 'paripesa' ||
    (currentTheme?.name || '').toLowerCase().includes('paripesa');

  // Scroll tracking pour le repli du solde
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // États pour les filtres, options et sélection multiple de suppression
  const [filterType, setFilterType] = useState<'all' | 'accepted' | 'paid' | 'lost'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Par mois');
  const [isPeriodModalVisible, setIsPeriodModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false);
  const [depositInputAmount, setDepositInputAmount] = useState('50000');
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [selectedCouponForOptions, setSelectedCouponForOptions] = useState<BetSlip | null>(null);
  const [isSaleActive, setIsSaleActive] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Solde principal formaté (par défaut 9 939 472.1 ₣ comme sur la capture)
  const balanceValue = typeof balance === 'number' && balance > 0 ? balance : 9939472.1;
  const balanceInteger = Math.floor(balanceValue).toLocaleString('fr-FR');
  const balanceCents = (balanceValue % 1).toFixed(1).substring(2) || '1';
  const formattedFullBalance = `${balanceInteger}.${balanceCents} ₣`;

  // Coupons filtrés
  const displayCoupons = useMemo(() => {
    let list = coupons || [];
    if (filterType === 'accepted') {
      list = list.filter((c) => c.status === 'Accepté');
    } else if (filterType === 'paid') {
      list = list.filter((c) => c.status === 'Payé' || c.status === 'Gagné' || c.status === 'Gain');
    } else if (filterType === 'lost') {
      list = list.filter((c) => c.status === 'Perdu');
    }
    return list;
  }, [coupons, filterType]);

  // Statistiques pour la période
  const periodStats = useMemo(() => {
    const totalBets = displayCoupons.length;
    const totalAmount = displayCoupons.reduce((sum, c) => sum + (Number(c.stake) || 0), 0);
    const displayAmount = totalAmount > 0 ? totalAmount : 33450440;
    const displayCount = totalBets > 0 ? totalBets : 151;
    return `Paris: ${displayCount} · ${displayAmount.toLocaleString('fr-FR')} ₣`;
  }, [displayCoupons]);

  // Suivi du scroll pour afficher le mini-solde dans le header fixe une fois le bloc supérieur défilé
  const [showMiniBalance, setShowMiniBalance] = useState(false);

  const miniHeaderBalanceOpacity = scrollY.interpolate({
    inputRange: [50, 95],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleTitlePress = () => {
    // Scroll fluide vers le sommet ou repli/dépli du bloc Compte principal
    if (showMiniBalance) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      setIsHeaderExpanded(true);
    } else {
      setIsHeaderExpanded((prev) => !prev);
    }
  };

  const handleConfirmDeposit = () => {
    const num = parseFloat(depositInputAmount.replace(/[^0-9]/g, '')) || 0;
    if (num > 0) {
      deposit(num);
      setIsDepositModalVisible(false);
      Alert.alert('Dépôt réussi !', `Votre compte a été crédité de ${num.toLocaleString('fr-FR')} ₣.`);
    }
  };

  const handleTicketPress = (coupon: BetSlip) => {
    navigation.navigate('BetDetailTicket', {
      coupon,
      couponId: coupon.id,
      ticketId: coupon.id,
      ticket: coupon,
    });
  };

  const handleOpenOptions = (coupon: BetSlip) => {
    setSelectedCouponForOptions(coupon);
    setIsOptionsModalVisible(true);
  };

  const toggleSelectCoupon = (couponId: string) => {
    const idStr = String(couponId);
    setSelectedIds((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    );
  };

  const handleToggleSelectAll = () => {
    const allIds = displayCoupons.map((c) => String(c.id));
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleDeleteSingleCoupon = (coupon: BetSlip) => {
    setIsOptionsModalVisible(false);
    if (Platform.OS === 'web') {
      const ok =
        typeof window !== 'undefined'
          ? window.confirm(`Voulez-vous vraiment supprimer le pari № ${coupon.id} de l'historique ?`)
          : true;
      if (ok) {
        deleteCoupon(String(coupon.id));
        setSelectedIds((prev) => prev.filter((id) => id !== String(coupon.id)));
      }
      return;
    }
    Alert.alert(
      'Supprimer le pari',
      `Voulez-vous vraiment supprimer le pari № ${coupon.id} de l'historique ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteCoupon(String(coupon.id));
            setSelectedIds((prev) => prev.filter((id) => id !== String(coupon.id)));
          },
        },
      ]
    );
  };

  const handleDeleteSelectedCoupons = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (Platform.OS === 'web') {
      const msg =
        count > 1
          ? `Voulez-vous vraiment supprimer ces ${count} paris de l'historique ?`
          : `Voulez-vous vraiment supprimer ce pari de l'historique ?`;
      const ok = typeof window !== 'undefined' ? window.confirm(msg) : true;
      if (ok) {
        deleteCoupons(selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
      }
      return;
    }
    Alert.alert(
      count > 1 ? 'Supprimer les paris sélectionnés' : 'Supprimer le pari sélectionné',
      count > 1
        ? `Voulez-vous vraiment supprimer ces ${count} paris de l'historique ?`
        : `Voulez-vous vraiment supprimer ce pari de l'historique ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteCoupons(selectedIds);
            setSelectedIds([]);
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: currentTheme.headerBackground || currentTheme.cardBackground || '#FFFFFF' },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ================================================================== */}
      {/* 1. HEADER FIXE SUPÉRIEUR                                           */}
      {/* ================================================================== */}
      <View
        style={[
          styles.fixedHeader,
          {
            backgroundColor: currentTheme.headerBackground || currentTheme.cardBackground || '#FFFFFF',
            borderBottomColor: currentTheme.divider || currentTheme.border || '#E6ECF2',
          },
        ]}
      >
        <View style={styles.headerLeftSpacer} />

        {/* Titre centré avec chevron et solde replié */}
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity
            style={styles.headerTitleRow}
            activeOpacity={0.7}
            onPress={handleTitlePress}
          >
            <Text
              style={[
                styles.headerTitleText,
                { color: currentTheme.textPrimary },
              ]}
            >
              Historique des paris
            </Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={isDark ? currentTheme.textSecondary : (currentTheme.activeIcon || '#557089')}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          {/* Solde réduit qui apparaît au scroll ou quand le bloc compte est replié */}
          {(showMiniBalance || !isHeaderExpanded) && (
            <Animated.Text
              style={[
                styles.miniHeaderBalanceText,
                { opacity: !isHeaderExpanded ? 1 : miniHeaderBalanceOpacity },
                { color: currentTheme.textPrimary },
              ]}
            >
              {formattedFullBalance}
            </Animated.Text>
          )}
        </View>

        {/* Boutons d'actions à droite : Entonnoir filtre + Relevé / Carte */}
        <View style={styles.headerRightActions}>
          {isSelectionMode && (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedIds([]);
              }}
              accessibilityLabel="Annuler la sélection"
            >
              <Ionicons
                name="close-circle"
                size={21}
                color={currentTheme.status?.perdu || '#E53935'}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsFilterModalVisible(true)}
            accessibilityLabel="Filtrer l'historique"
          >
            <OfficialFilterIcon
              size={22}
              color={
                filterType !== 'all'
                  ? (currentTheme.primary || '#4A84C4')
                  : (isDark ? currentTheme.textSecondary : (isParipesa ? currentTheme.primary : '#577089'))
              }
              showBadge={filterType !== 'all'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('CouponTab')}
            accessibilityLabel="Voir coupons"
          >
            <OfficialStatementCardIcon
              size={22}
              color={isDark ? currentTheme.textSecondary : (isParipesa ? currentTheme.primary : '#577089')}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================================================================== */}
      {/* BARRE DE SÉLECTION MULTIPLE (SUPPRESSION D'UN OU PLUSIEURS PARIS)  */}
      {/* ================================================================== */}
      {isSelectionMode && (
        <View
          style={[
            styles.selectionToolbar,
            {
              backgroundColor: currentTheme.cardBackground || '#FFFFFF',
              borderBottomColor: currentTheme.divider || currentTheme.border || '#E6ECF2',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.selectionToolbarLeft}
            activeOpacity={0.75}
            onPress={handleToggleSelectAll}
          >
            <View
              style={[
                styles.selectCheckboxCircle,
                {
                  marginRight: 8,
                  borderColor:
                    displayCoupons.length > 0 &&
                    displayCoupons.every((c) => selectedIds.includes(String(c.id)))
                      ? currentTheme.primary || '#3B79C4'
                      : currentTheme.textSecondary || '#8899AA',
                  backgroundColor:
                    displayCoupons.length > 0 &&
                    displayCoupons.every((c) => selectedIds.includes(String(c.id)))
                      ? currentTheme.primary || '#3B79C4'
                      : 'transparent',
                },
              ]}
            >
              {displayCoupons.length > 0 &&
                displayCoupons.every((c) => selectedIds.includes(String(c.id))) && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
            </View>
            <Text style={[styles.selectionToolbarText, { color: currentTheme.textPrimary }]}>
              {displayCoupons.length > 0 &&
              displayCoupons.every((c) => selectedIds.includes(String(c.id)))
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}{' '}
              ({selectedIds.length})
            </Text>
          </TouchableOpacity>

          <View style={styles.selectionToolbarRight}>
            <TouchableOpacity
              style={[
                styles.selectionCancelBtn,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#EEF2F6',
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedIds([]);
              }}
            >
              <Text style={[styles.selectionCancelText, { color: currentTheme.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectionDeleteBtn,
                {
                  backgroundColor:
                    selectedIds.length > 0
                      ? currentTheme.status?.perdu || '#E53935'
                      : isDark
                      ? 'rgba(229,57,53,0.35)'
                      : '#F5B7B1',
                },
              ]}
              activeOpacity={selectedIds.length > 0 ? 0.8 : 1}
              disabled={selectedIds.length === 0}
              onPress={handleDeleteSelectedCoupons}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.selectionDeleteText}>
                Supprimer{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================================================================== */}
      {/* 2. LISTE DE CARTES AVEC HEADER DÉFILANT                            */}
      {/* ================================================================== */}
      <Animated.FlatList
        ref={flatListRef}
        data={displayCoupons}
        keyExtractor={(item, index) => item.id || `coupon-${index}`}
        renderItem={({ item }) => (
          <HistoryCard
            coupon={item}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.includes(String(item.id))}
            onPress={() => {
              if (isSelectionMode) {
                toggleSelectCoupon(String(item.id));
              } else {
                handleTicketPress(item);
              }
            }}
            onLongPress={() => {
              if (!isSelectionMode) {
                setIsSelectionMode(true);
                setSelectedIds([String(item.id)]);
              } else {
                toggleSelectCoupon(String(item.id));
              }
            }}
            onPressOptions={() => handleOpenOptions(item)}
          />
        )}
        ListHeaderComponent={
          isHeaderExpanded ? (
            <View style={{ marginBottom: 6 }}>
              {/* BLOC SUPÉRIEUR : COMPTE PRINCIPAL + BOUTONS */}
              <View
                style={[
                  styles.collapsibleBalanceBlock,
                  { backgroundColor: currentTheme.cardBackground || '#FFFFFF' },
                ]}
              >
                {/* Ligne 1 : Intitulé compte */}
                <Text
                  style={[
                    styles.accountLabelText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  Compte principal
                </Text>

                {/* Ligne 2 : Montant en grand gras + bouton + Déposer vert */}
                <View style={styles.balanceAndDepositRow}>
                  <TouchableOpacity
                    style={styles.balanceValueRow}
                    activeOpacity={0.8}
                    onPress={() => setIsDepositModalVisible(true)}
                  >
                    <Text
                      style={[
                        styles.bigBalanceText,
                        { color: currentTheme.textPrimary },
                      ]}
                    >
                      {formattedFullBalance}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={isDark ? currentTheme.textSecondary : (currentTheme.activeIcon || '#557089')}
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>

                  {/* Bouton vert + Déposer (adapté au thème, ex: vert Paripesa #22C55E) */}
                  <TouchableOpacity
                    style={[
                      styles.depositGreenBtn,
                      {
                        backgroundColor: currentTheme.depositButton?.bg || '#2E7D32',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setIsDepositModalVisible(true)}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color={currentTheme.depositButton?.text || '#FFFFFF'}
                      style={{ marginRight: 3 }}
                    />
                    <Text
                      style={[
                        styles.depositBtnText,
                        { color: currentTheme.depositButton?.text || '#FFFFFF' },
                      ]}
                    >
                      Déposer
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Ligne 3 : Deux boutons Par mois & Vente */}
                <View style={styles.actionButtonsRow}>
                  {/* Bouton Par mois */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtnGray,
                      {
                        backgroundColor:
                          currentTheme.colors?.filterChipBg ||
                          (isDark ? currentTheme.cardBackground : '#F0F3F8'),
                        borderColor: currentTheme.border || '#E6ECF2',
                        borderWidth: 1,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setIsPeriodModalVisible(true)}
                  >
                    <Ionicons
                      name="calendar"
                      size={17}
                      color={currentTheme.primary || '#3B79C4'}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.actionBtnGrayText,
                        { color: currentTheme.textPrimary },
                      ]}
                    >
                      {selectedPeriod}
                    </Text>
                  </TouchableOpacity>

                  {/* Bouton Vente */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtnGray,
                      {
                        backgroundColor: isSaleActive
                          ? (currentTheme.primarySoft || '#D8E5F6')
                          : (currentTheme.colors?.filterChipBg || (isDark ? currentTheme.cardBackground : '#F0F3F8')),
                        borderColor: isSaleActive
                          ? (currentTheme.primary || '#3B79C4')
                          : (currentTheme.border || '#E6ECF2'),
                        borderWidth: 1,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setIsSaleActive((prev) => !prev);
                      setFilterType(filterType === 'accepted' ? 'all' : 'accepted');
                    }}
                  >
                    <Ionicons
                      name="pricetag"
                      size={17}
                      color={currentTheme.primary || '#3B79C4'}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.actionBtnGrayText,
                        {
                          color: isSaleActive
                            ? (currentTheme.primary || '#3B79C4')
                            : currentTheme.textPrimary,
                          fontWeight: isSaleActive ? '700' : '500',
                        },
                      ]}
                    >
                      Vente
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* CARTE BLANCHE : STATISTICS FOR THE PERIOD */}
              <TouchableOpacity
                style={[
                  styles.statsPeriodCard,
                  {
                    backgroundColor: currentTheme.cardBackground || '#FFFFFF',
                    borderColor: currentTheme.border || '#E6ECF2',
                    borderWidth: 1,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => setIsPeriodModalVisible(true)}
              >
                <View style={styles.statsPeriodTextCol}>
                  <Text
                    style={[
                      styles.statsPeriodSubtitle,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    Statistics for the period
                  </Text>
                  <Text
                    style={[
                      styles.statsPeriodNumbers,
                      { color: currentTheme.textPrimary },
                    ]}
                  >
                    {periodStats}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={currentTheme.textSecondary || '#557089'}
                />
              </TouchableOpacity>
            </View>
          ) : undefined
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              if (offsetY > 55 && !showMiniBalance) {
                setShowMiniBalance(true);
              } else if (offsetY <= 55 && showMiniBalance) {
                setShowMiniBalance(false);
              }
            },
          }
        )}
        scrollEventThrottle={16}
        style={[
          styles.flatList,
          { backgroundColor: currentTheme.background },
        ]}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ================================================================== */}
      {/* MODAL : FILTRES PAR STATUT                                         */}
      {/* ================================================================== */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: currentTheme.cardBackground || '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.textPrimary }]}>
              Filtrer l'historique
            </Text>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setFilterType('all');
                setIsFilterModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.textPrimary },
                  filterType === 'all' && [styles.modalOptionActiveText, { color: currentTheme.primary }],
                ]}
              >
                Tous les paris
              </Text>
              {filterType === 'all' && (
                <Ionicons name="checkmark" size={20} color={currentTheme.primary || '#E5B22B'} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setFilterType('accepted');
                setIsFilterModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.textPrimary },
                  filterType === 'accepted' && [styles.modalOptionActiveText, { color: currentTheme.primary }],
                ]}
              >
                Paris Acceptés (En cours / Cashout)
              </Text>
              {filterType === 'accepted' && (
                <Ionicons name="checkmark" size={20} color={currentTheme.primary || '#E5B22B'} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setFilterType('paid');
                setIsFilterModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.textPrimary },
                  filterType === 'paid' && [styles.modalOptionActiveText, { color: currentTheme.status?.paye || '#2ECC71' }],
                ]}
              >
                Paris Payés (Gagnés)
              </Text>
              {filterType === 'paid' && (
                <Ionicons name="checkmark" size={20} color={currentTheme.status?.paye || '#2ECC71'} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setFilterType('lost');
                setIsFilterModalVisible(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.textPrimary },
                  filterType === 'lost' && [styles.modalOptionActiveText, { color: currentTheme.status?.perdu || '#E74C3C' }],
                ]}
              >
                Paris Perdus
              </Text>
              {filterType === 'lost' && (
                <Ionicons name="checkmark" size={20} color={currentTheme.status?.perdu || '#E74C3C'} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setIsFilterModalVisible(false);
                setIsSelectionMode(true);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.status?.perdu || '#E53935', fontWeight: '600' },
                ]}
              >
                Sélectionner des paris à supprimer
              </Text>
              <Ionicons name="trash-outline" size={20} color={currentTheme.status?.perdu || '#E53935'} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================================================================== */}
      {/* MODAL : PÉRIODE                                                    */}
      {/* ================================================================== */}
      <Modal
        visible={isPeriodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPeriodModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPeriodModalVisible(false)}
        >
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: currentTheme.cardBackground || '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.textPrimary }]}>
              Sélectionner la période
            </Text>
            {['Aujourd\'hui', '24 dernières heures', 'Par mois', '3 derniers mois', 'Tout l\'historique'].map((period) => (
              <TouchableOpacity
                key={period}
                style={styles.modalOptionItem}
                onPress={() => {
                  setSelectedPeriod(period);
                  setIsPeriodModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: currentTheme.textPrimary },
                    selectedPeriod === period && [styles.modalOptionActiveText, { color: currentTheme.primary }],
                  ]}
                >
                  {period}
                </Text>
                {selectedPeriod === period && (
                  <Ionicons name="checkmark" size={20} color={currentTheme.primary || '#E5B22B'} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================================================================== */}
      {/* MODAL : DÉPÔT RAPIDE                                               */}
      {/* ================================================================== */}
      <Modal
        visible={isDepositModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDepositModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDepositModalVisible(false)}
        >
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: currentTheme.cardBackground || '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.textPrimary }]}>
              Effectuer un dépôt
            </Text>
            <Text style={{ fontSize: 13, color: currentTheme.textSecondary, marginBottom: 10 }}>
              Montant du dépôt (₣)
            </Text>
            <TextInput
              style={[
                styles.depositInput,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F0F3F8',
                  color: currentTheme.textPrimary,
                  borderColor: currentTheme.border,
                },
              ]}
              value={depositInputAmount}
              onChangeText={setDepositInputAmount}
              keyboardType="numeric"
              placeholder="Ex: 50 000"
              placeholderTextColor={currentTheme.textSecondary}
            />
            <View style={styles.quickDepositChipsRow}>
              {['10000', '50000', '100000', '500000'].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.quickDepositChip,
                    {
                      backgroundColor: currentTheme.colors?.filterChipBg || (isDark ? 'rgba(255,255,255,0.08)' : '#E9F0FA'),
                      borderColor: currentTheme.border || 'transparent',
                    },
                  ]}
                  onPress={() => setDepositInputAmount(val)}
                >
                  <Text style={[styles.quickDepositChipText, { color: currentTheme.primary }]}>
                    +{Number(val).toLocaleString('fr-FR')} ₣
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[
                styles.confirmDepositBtn,
                { backgroundColor: currentTheme.depositButton?.bg || '#2E7D32' },
              ]}
              onPress={handleConfirmDeposit}
            >
              <Text
                style={[
                  styles.confirmDepositBtnText,
                  { color: currentTheme.depositButton?.text || '#FFFFFF' },
                ]}
              >
                Confirmer le dépôt
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================================================================== */}
      {/* MODAL : OPTIONS DU COUPON (VALIDATION / ÉDITION)                   */}
      {/* ================================================================== */}
      <Modal
        visible={isOptionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOptionsModalVisible(false)}
        >
          <View
            style={[
              styles.modalSheetContainer,
              { backgroundColor: currentTheme.cardBackground || '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: currentTheme.textPrimary }]}>
              Pari № {selectedCouponForOptions?.id}
            </Text>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setIsOptionsModalVisible(false);
                if (selectedCouponForOptions) {
                  handleTicketPress(selectedCouponForOptions);
                }
              }}
            >
              <Text style={[styles.modalOptionText, { color: currentTheme.textPrimary }]}>
                Détails du pari
              </Text>
              <Ionicons name="eye-outline" size={20} color={currentTheme.primary || '#4A84C4'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                if (selectedCouponForOptions) {
                  validateCouponWithResult(selectedCouponForOptions.id, true);
                  setIsOptionsModalVisible(false);
                  Alert.alert('Succès', 'Le coupon a été validé comme Gagné (Payé) !');
                }
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.status?.paye || '#2ECC71', fontWeight: '600' },
                ]}
              >
                Valider le coupon (Gain / Payé)
              </Text>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={currentTheme.status?.paye || '#2ECC71'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                if (selectedCouponForOptions) {
                  validateCouponWithResult(selectedCouponForOptions.id, false);
                  setIsOptionsModalVisible(false);
                  Alert.alert('Statut mis à jour', 'Le coupon a été marqué comme Perdu.');
                }
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.status?.perdu || '#E74C3C', fontWeight: '600' },
                ]}
              >
                Marquer comme Perdu
              </Text>
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={currentTheme.status?.perdu || '#E74C3C'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                setIsOptionsModalVisible(false);
                setIsSelectionMode(true);
                if (selectedCouponForOptions) {
                  setSelectedIds([String(selectedCouponForOptions.id)]);
                }
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.primary || '#4A84C4', fontWeight: '600' },
                ]}
              >
                Sélectionner plusieurs paris
              </Text>
              <Ionicons
                name="checkbox-outline"
                size={20}
                color={currentTheme.primary || '#4A84C4'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOptionItem}
              onPress={() => {
                if (selectedCouponForOptions) {
                  handleDeleteSingleCoupon(selectedCouponForOptions);
                }
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.status?.perdu || '#E53935', fontWeight: '600' },
                ]}
              >
                Supprimer ce pari
              </Text>
              <Ionicons
                name="trash-outline"
                size={20}
                color={currentTheme.status?.perdu || '#E53935'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOptionItem, { borderBottomWidth: 0, marginTop: 8 }]}
              onPress={() => setIsOptionsModalVisible(false)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: currentTheme.textSecondary, textAlign: 'center', width: '100%' },
                ]}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// Re-exports pour compatibilité maximale
export const BetHistoryScreen = HistoryListScreen;
export const HistoryListScreenComponent = HistoryListScreen;
export const MainHistoryScreen = HistoryListScreen;
export type BetItem = any;

// ============================================================================
// STYLES PIXEL-PERFECT (Melbet Thème)
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F0F3F8',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // 1. Header supérieur fixe
  fixedHeader: {
    height: 52,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECF2',
  },
  headerLeftSpacer: {
    width: 96,
  },
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 16.5,
    fontWeight: '600',
    color: '#557089',
  },
  miniHeaderBalanceText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6A829A',
    marginTop: 2,
  },
  headerRightActions: {
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerIconBtn: {
    padding: 5,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconImage: {
    width: 22,
    height: 22,
    tintColor: '#50667C',
  },

  // 2. Bloc Compte principal défilant
  collapsibleBalanceBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    marginHorizontal: -12,
    marginTop: -8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  accountLabelText: {
    fontSize: 13,
    color: '#6E849B',
    marginBottom: 2,
  },
  balanceAndDepositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bigBalanceText: {
    fontSize: 23,
    fontWeight: '700',
    color: '#0D253F',
    letterSpacing: -0.3,
  },
  depositGreenBtn: {
    backgroundColor: '#47B267',
    borderRadius: 10,
    height: 36,
    paddingHorizontal: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionBtnGray: {
    flex: 1,
    height: 38,
    backgroundColor: '#E9EEF4',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionBtnGrayText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#557089',
  },

  // 3. Carte Statistics for the period
  statsPeriodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsPeriodTextCol: {
    flex: 1,
  },
  statsPeriodSubtitle: {
    fontSize: 12.5,
    color: '#6E849B',
    marginBottom: 2,
  },
  statsPeriodNumbers: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D253F',
  },

  // 4. HistoryCard (BetHistoriqueCard - Spécifications Pixel-Perfect)
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardTopSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 10,
  },
  avatarBaseCircle: {
    backgroundColor: '#EEF1F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIconCombine: {
    width: 22,
    height: 22,
  },
  avatarIconFootball: {
    width: 22,
    height: 22,
  },
  avatarIconPoker: {
    width: 22,
    height: 22,
  },
  avatarIconFifa: {
    width: 24,
    height: 18,
  },
  statusMiniDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusDotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 12,
  },

  cardCenterCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cardDateNumText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6E8299',
    marginBottom: 3,
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F2742',
    marginRight: 6,
  },
  combineLayersGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  combineLayersIcon: {
    width: 14.5,
    height: 14.5,
    marginRight: 4,
    tintColor: '#607D99',
  },
  combineLayersCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2742',
  },
  serieABadge: {
    backgroundColor: '#5973E8',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 2,
  },
  serieABadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBellBtn: {
    padding: 4,
    marginRight: 8,
  },
  cardBellIcon: {
    width: 19,
    height: 19,
    tintColor: '#4A83C4',
  },
  cardActionIconBtn: {
    padding: 4,
  },
  threeDotsBlueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A83C4',
    letterSpacing: 1,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0F3F8',
  },

  cardBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  cardDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 2.5,
  },
  cardDataLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#63788E',
  },
  cardDataValueBold: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F2742',
  },
  cardStatusValueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A83C4',
  },

  // Nouvelles classes Pixel-Perfect
  headerBalanceText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#6A829A',
    marginTop: 2,
  },
  filterIconWrap: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#4A84C4',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
    backgroundColor: '#EEF2F7',
  },
  flatListContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 110,
  },
  avatarWrapNoBg: {
    position: 'relative',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIconPokerDirect: {
    width: 28,
    height: 28,
    tintColor: '#607D99',
  },
  avatarIconFifaDirect: {
    width: 30,
    height: 19,
    tintColor: '#607D99',
  },
  avatarIconCombineDirect: {
    width: 28,
    height: 28,
  },
  avatarIconFootballDirect: {
    width: 28,
    height: 28,
  },
  statusMiniDotDirect: {
    position: 'absolute',
    bottom: -1,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.8,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1E293B',
  },
  modalOptionActiveText: {
    fontWeight: '700',
    color: '#E5B22B',
  },
  depositInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
  },
  quickDepositChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  quickDepositChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#EEF2F7',
  },
  quickDepositChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  confirmDepositBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDepositBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // 5. Sélection multiple & suppression
  selectCheckboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  selectionToolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionToolbarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectionToolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectionDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    justifyContent: 'center',
  },
  selectionDeleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
