import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  BetHistoryTopBar,
  BetHistoryCollapsibleHeader,
  TOP_BAR_HEIGHT,
} from './BetHistoryHeader';
import { BetHistoryCard } from '../../components/history/BetHistoryCard';
import { FilterFunnelIcon, CouponScanHeaderIcon } from '../../components/icons/HistoryHeaderIcons';
import { BetTypeIcon, SportCategory } from '../../components/history/BetTypeIcon';
import { LiveBadge } from '../../components/history/LiveBadge';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useBetStore } from '../../store/useBetStore';
import { navigate } from '../../navigation/navigationRef';
import { getBetTypeIcon } from '../../utils/getBetIcon';
import { ScoreEditorModal } from '../../components/ScoreEditorModal';
import { BetSlip } from '../../types/bet';
import { useResponsive } from '../../utils/responsive';
import { formatBetDate } from '../../utils/dateFormatter';

export interface BetItem {
  id: string;
  date: string;
  ticketNumber: string;
  type: string;
  eventsCount: number;
  category?: SportCategory | string;
  isLive?: boolean;
  odds: string;
  stake: string;
  potentialGain: string;
  status: 'Accepté' | 'Payé' | 'Perdu';
}

const mockBets: BetItem[] = [
  {
    id: '86037893293',
    date: '27.09.2026 (08:30)',
    ticketNumber: '86037893293',
    type: 'Simple',
    eventsCount: 1,
    category: 'fifa',
    isLive: false,
    odds: '58',
    stake: '5000 ₣',
    potentialGain: '290000 ₣',
    status: 'Accepté',
  },
  {
    id: '86180587255',
    date: '26.09.2026 (12:48)',
    ticketNumber: '86180587255',
    type: 'Simple',
    eventsCount: 1,
    category: 'football',
    isLive: false,
    odds: '58',
    stake: '5000 ₣',
    potentialGain: '290000 ₣',
    status: 'Accepté',
  },
  {
    id: '86799754787',
    date: '26.09.2026 (12:45)',
    ticketNumber: '86799754787',
    type: 'Combiné',
    eventsCount: 3,
    category: 'football',
    isLive: false,
    odds: '28152',
    stake: '500 ₣',
    potentialGain: '14076000 ₣',
    status: 'Payé',
  },
  {
    id: '86856631156',
    date: '23.09.2026 (13:35)',
    ticketNumber: '86856631156',
    type: 'Combiné',
    eventsCount: 2,
    category: 'football',
    isLive: false,
    odds: '4224',
    stake: '1000 ₣',
    potentialGain: '4224000 ₣',
    status: 'Payé',
  },
];

export const BetHistoryScreen: React.FC<{ navigation?: any }> = ({ navigation: propNavigation }) => {
  const hookNavigation = useNavigation<any>();
  const navigation = hookNavigation || propNavigation;

  const { currentTheme, themeName, isDark } = useThemeStore();
  const isMelbet = (themeName || '').toLowerCase().includes('melbet');
  const { currentUser } = useAuthStore();
  const { balance: betBalance, coupons, deposit } = useBetStore();
  const { font, moderateScale, isTablet, contentContainerStyle } = useResponsive();

  const userBalance = currentUser?.balance ?? betBalance ?? 470307550;
  const formattedBalance = Math.round(userBalance).toLocaleString('fr-FR');

  const colors = {
    bg: currentTheme.background,
    cardBg: currentTheme.cardBackground,
    headerBg: currentTheme.headerBackground,
    textPrimary: currentTheme.textPrimary,
    textSecondary: currentTheme.textSecondary,
    accentPrimary: currentTheme.primary,
    primarySoft: currentTheme.primarySoft || (isDark ? 'rgba(229, 139, 5, 0.22)' : '#DBEAFE'),
    accentGreen: currentTheme.depositButton?.bg || currentTheme.colors?.accentGreen || '#28A745',
    depositBtnText: currentTheme.depositButton?.text || '#FFFFFF',
    statusAccepted: currentTheme.status?.accepte || '#1E5EB8',
    actionCardBg: isDark ? (currentTheme.colors?.filterChipBg || currentTheme.cardBackground || '#212D3B') : (currentTheme.colors?.filterChipBg || '#ECEFF4'),
    actionCardText: isDark ? (currentTheme.colors?.filterChipText || '#FFFFFF') : (currentTheme.colors?.filterChipText || '#475569'),
    border: currentTheme.border,
  };

  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<BetSlip | null>(null);

  // Filtres
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1 mois');
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  const [isSaleActive, setIsSaleActive] = useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [periodModalVisible, setPeriodModalVisible] = useState<boolean>(false);

  // Dépôt
  const [depositModalVisible, setDepositModalVisible] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('50000');

  // Animation de défilement pour le Sticky Header (60/120 FPS Native Driver)
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentUser?.id) {
      useBetStore.getState().syncUserBets(currentUser.id);
    }
  }, [currentUser?.id]);

  const handleDepositSubmit = () => {
    const num = parseFloat(depositAmount.replace(/[^0-9]/g, '')) || 0;
    if (num > 0) {
      deposit(num);
      if (currentUser) {
        useAuthStore.getState().updateUserBalance(currentUser.id, (currentUser.balance || 0) + num);
      }
      setDepositModalVisible(false);
      Alert.alert('Dépôt réussi !', `Votre compte a été crédité de ${num.toLocaleString('fr-FR')} ₣.`);
    }
  };

  const openScoreEntryModal = (item: BetItem) => {
    let coupon = coupons.find((c) => c.id === item.ticketNumber || c.id === item.id);
    if (!coupon) {
      const stakeNum = parseInt(item.stake.replace(/[^0-9]/g, ''), 10) || 5000;
      const payoutNum = parseInt(item.potentialGain.replace(/[^0-9]/g, ''), 10) || 290000;
      const oddsNum = parseFloat(item.odds) || 58;
      const isSimple = item.type === 'Simple';

      coupon = {
        id: item.ticketNumber || item.id,
        createdAt: formatBetDate(item.date),
        type: (item.type as any) || 'Simple',
        eventsCount: item.eventsCount,
        completedCount: item.status === 'Payé' ? item.eventsCount : 0,
        totalOdds: oddsNum,
        stake: stakeNum,
        potentialPayout: payoutNum,
        actualPayout: item.status === 'Payé' ? payoutNum : undefined,
        status: item.status as any,
        isLive: item.isLive,
        events: Array.from({ length: item.eventsCount || (isSimple ? 1 : 2) }).map((_, idx) => ({
          id: `ev-${item.id}-${idx + 1}`,
          sport: item.category === 'fifa' ? 'FIFA' : 'Football',
          league: item.category === 'fifa' ? 'FC 25. 3x3. Champions League' : 'Matchs amicaux des clubs',
          date: formatBetDate(item.date),
          homeTeam: { name: 'Johnstone Burgh' },
          awayTeam: { name: '07 Diefflen' },
          prediction: 'Score exact. 7-7',
          odd: oddsNum,
          actualScore: '7-7',
          status: item.status === 'Payé' ? ('Gain' as any) : ('Accepté' as any),
          isLive: item.isLive,
        })),
      };
    }
    setSelectedTicket(coupon);
    setScoreModalVisible(true);
  };

  const handleOpenDetail = (couponId: string) => {
    try {
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('BetDetails', { ticketId: couponId, couponId });
        return;
      }
    } catch (e) {
      // Ignorer
    }
    navigate('BetDetails', { ticketId: couponId, couponId });
  };

  // Liste des paris fusionnée et filtrée
  const displayBets: BetItem[] = useMemo(() => {
    const userCoupons = coupons.filter((c) => {
      if (!currentUser?.id) return true;
      return !c.userId || c.userId === currentUser.id || c.userId === 'user-demo-1';
    });

    const storeMapped: BetItem[] = (userCoupons || []).map((c) => {
      const isSimple = (c.type as string) === 'Simple' || (c.events && c.events.length <= 1);
      const isPaye = c.status === 'Payé' || c.status === 'Gagné' || c.status === 'Gain';
      const payout = isPaye && c.actualPayout ? c.actualPayout : c.potentialPayout || (c.stake * (c.totalOdds || 2));
      const oddsStr = typeof c.totalOdds === 'number' ? Math.round(c.totalOdds).toString() : (parseFloat(c.totalOdds as any) || 2).toString();

      const firstEvent = c.events?.[0];
      const sportName = (firstEvent?.sport || '').toLowerCase();
      const leagueName = (firstEvent?.league || '').toLowerCase();
      const badge = (firstEvent?.badge || '').toLowerCase();
      const gameCat = (c.gameCategory || firstEvent?.gameCategory || '').toLowerCase();

      let category: SportCategory = 'football';
      if (gameCat.includes('poker') || sportName.includes('poker') || leagueName.includes('poker') || leagueName.includes('tvbet')) {
        category = 'poker';
      } else if (badge.includes('fifa') || sportName.includes('fifa') || leagueName.includes('fifa')) {
        category = 'fifa';
      } else if (gameCat.includes('apple') || sportName.includes('apple')) {
        category = 'apple_of_fortune';
      } else if (sportName.includes('tennis')) {
        category = 'tennis';
      } else if (sportName.includes('basket')) {
        category = 'basketball';
      }

      return {
        id: c.id,
        date: formatBetDate(c.createdAt || '27.09.2026 (08:30)'),
        ticketNumber: c.id,
        type: isSimple ? 'Simple' : 'Combiné',
        eventsCount: c.events?.length || c.eventsCount || (isSimple ? 1 : 2),
        category,
        isLive: c.events?.some((e) => e.isLive) || c.isLive || false,
        odds: oddsStr,
        stake: `${(c.stake || 5000).toLocaleString('fr-FR')} ₣`,
        potentialGain: `${payout.toLocaleString('fr-FR')} ₣`,
        status: (isPaye ? 'Payé' : c.status === 'Perdu' ? 'Perdu' : 'Accepté') as any,
      };
    });

    const existingIds = new Set(storeMapped.map((b) => b.ticketNumber));
    const extraMocks = mockBets.filter((b) => !existingIds.has(b.ticketNumber));
    let baseList = storeMapped.length > 0 ? [...storeMapped, ...extraMocks] : mockBets;

    // 1. Filtrage Vente
    if (isSaleActive) {
      baseList = baseList.filter((item) => {
        const c = coupons.find((x) => x.id === item.ticketNumber || x.id === item.id);
        return c?.isForSale || c?.status === 'Vendu' || ((c?.cashoutAmount ?? 0) > 0);
      });
    }

    // 2. Filtrage Statut / Type
    if (selectedFilter) {
      if (selectedFilter === 'En direct') {
        baseList = baseList.filter((item) => item.isLive);
      } else if (selectedFilter === 'Payé' || selectedFilter === 'Gagné') {
        baseList = baseList.filter((item) => item.status === 'Payé');
      } else if (selectedFilter === 'Perdu') {
        baseList = baseList.filter((item) => item.status === 'Perdu');
      } else if (selectedFilter === 'Simple') {
        baseList = baseList.filter((item) => item.type === 'Simple');
      } else if (selectedFilter === 'Combiné') {
        baseList = baseList.filter((item) => item.type === 'Combiné');
      }
    }

    return baseList;
  }, [coupons, currentUser?.id, isSaleActive, selectedFilter]);

  const totalBetsCount = displayBets.length;
  const totalBetsAmount = useMemo(() => {
    return displayBets.reduce((sum, b) => {
      const val = parseInt(b.stake.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + val;
    }, 0);
  }, [displayBets]);

  // ---------------------------------------------------------------------------
  // LIST HEADER (Lignes 2 & 3 Défilantes + Statistiques)
  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // LIST HEADER (Lignes 2 & 3 Défilantes + Statistiques)
  // ---------------------------------------------------------------------------
  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* 1. Lignes 2 & 3 défilantes : Solde + Dépôt + Filtres 1 mois / Vente */}
      <View style={styles.collapsibleBleedWrapper}>
        <BetHistoryCollapsibleHeader
          balance={userBalance}
          currencySymbol="₣"
          selectedPeriod={selectedPeriod}
          isSaleActive={isSaleActive}
          onAccountSelect={() => {}}
          onDepositPress={() => setDepositModalVisible(true)}
          onPeriodPress={() => setPeriodModalVisible(true)}
          onSalePress={() => setIsSaleActive((prev) => !prev)}
        />
      </View>

      {/* 2. Carte Statistiques pour la période (espacement 8px dessus et dessous) */}
      <TouchableOpacity
        style={[styles.statsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
        activeOpacity={0.8}
      >
        <View>
          <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>
            Statistiques pour la période
          </Text>
          <Text style={[styles.statsSub, { color: colors.textSecondary }]}>
            Paris : <Text style={[styles.statsSubBold, { color: colors.textPrimary }]}>{totalBetsCount} · {totalBetsAmount.toLocaleString('fr-FR')} ₣</Text>
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // ---------------------------------------------------------------------------
  // CARTE DE TICKET (Pixel-Perfect avec BetHistoryCard)
  // ---------------------------------------------------------------------------
  const renderBetCard = ({ item: bet }: { item: BetItem }) => {
    const iconSource = getBetTypeIcon({
      id: bet.ticketNumber || bet.id,
      type: bet.type,
      sportCategory: bet.category,
      category: bet.category,
      eventsCount: bet.eventsCount || (bet.type === 'Combiné' ? 2 : 1),
    });

    return (
      <BetHistoryCard
        key={bet.id}
        ticketNumber={bet.ticketNumber || bet.id}
        date={formatBetDate(bet.date)}
        type={bet.type}
        eventsCount={bet.eventsCount || (bet.type === 'Combiné' ? 2 : 1)}
        sportCategory={bet.category}
        sportLogo={iconSource}
        odds={bet.odds}
        stake={bet.stake}
        potentialGain={bet.potentialGain}
        status={bet.status}
        onPress={() => handleOpenDetail(bet.ticketNumber || bet.id)}
        onBellPress={() => {
          Alert.alert('Notification', `Alertes activées pour le ticket N° ${bet.ticketNumber}`);
        }}
        onOptionsPress={() => openScoreEntryModal(bet)}
      />
    );
  };

  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || insets.top || 0) : insets.top;
  const topPadding = TOP_BAR_HEIGHT + statusBarHeight;
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 20 : (Platform.OS === 'android' ? 12 : 0));
  const bottomScrollPad = 100 + bottomInset;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        backgroundColor={colors.headerBg || '#FFFFFF'}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={Platform.OS === 'android'}
      />

      {/* 1. TOP BAR ÉPINGLÉE / STICKY AU SOMMET (Ne défile JAMAIS, zIndex: 100, fond #FFFFFF pur) */}
      <BetHistoryTopBar
        title="Historique des paris"
        scrollY={scrollY}
        isFilterActive={isFilterActive}
        onTitlePress={() => {}}
        onFilterPress={() => setFilterModalVisible(true)}
        onWalletPress={() => {}}
      />

      {/* 2. LISTE DÉROULANTE (Solde, Boutons, Stats & Tickets défilent et passent SOUS la Top Bar) */}
      <Animated.FlatList
        data={displayBets}
        keyExtractor={(item) => item.id}
        renderItem={renderBetCard}
        ItemSeparatorComponent={() => <View style={styles.cardSeparator} />}
        ListHeaderComponent={renderListHeader}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        style={[styles.scrollList, { backgroundColor: colors.bg }]}
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
          { paddingTop: topPadding, paddingBottom: bottomScrollPad },
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* MODALE DE FILTRAGE DES PARIS */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={[styles.filterModalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.filterModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.filterModalTitle, { color: colors.textPrimary }]}>Filtres de l'Historique</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>Statut & Type de Pari</Text>
            <View style={styles.filterChipsContainer}>
              {[
                { label: 'Tous (Neutre)', value: null },
                { label: 'En direct', value: 'En direct' },
                { label: 'Gagné', value: 'Payé' },
                { label: 'Perdu', value: 'Perdu' },
                { label: 'Simple', value: 'Simple' },
                { label: 'Combiné', value: 'Combiné' },
              ].map((opt) => {
                const isSelected = selectedFilter === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.filterChipItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primarySoft
                          : colors.actionCardBg,
                        borderColor: isSelected ? colors.accentPrimary : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedFilter(opt.value);
                      setIsFilterActive(opt.value !== null);
                    }}
                  >
                    <Text
                      style={[
                        styles.filterChipItemText,
                        { color: isSelected ? colors.accentPrimary : colors.textPrimary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.filterActionsRow, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.filterResetBtn, { backgroundColor: colors.actionCardBg, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedFilter(null);
                  setIsFilterActive(false);
                  setIsSaleActive(false);
                  setFilterModalVisible(false);
                }}
              >
                <Text style={[styles.filterResetBtnText, { color: colors.textSecondary }]}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterApplyBtn, { backgroundColor: colors.accentPrimary }]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={[styles.filterApplyBtnText, { color: currentTheme.colors?.primaryText || '#FFFFFF' }]}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODALE CHOIX DE PÉRIODE */}
      <Modal
        visible={periodModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPeriodModalVisible(false)}
        >
          <View style={[styles.periodModalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.filterModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.filterModalTitle, { color: colors.textPrimary }]}>Sélectionner la période</Text>
              <TouchableOpacity onPress={() => setPeriodModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 10 }}>
              {['1 jour', '7 jours', '1 mois', '3 mois', 'Toutes les dates'].map((p) => {
                const isSelected = selectedPeriod === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.periodChoiceRow,
                      isSelected && { backgroundColor: colors.primarySoft },
                    ]}
                    onPress={() => {
                      setSelectedPeriod(p);
                      setPeriodModalVisible(false);
                    }}
                  >
                    <Text style={[styles.periodChoiceText, { color: isSelected ? colors.accentPrimary : colors.textPrimary }, isSelected && { fontWeight: '700' }]}>
                      {p}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={18} color={colors.accentPrimary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODALE EFFECTUER UN DÉPÔT */}
      <Modal
        visible={depositModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDepositModalVisible(false)}
        >
          <View style={[styles.depositModalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]} onStartShouldSetResponder={() => true}>
            <View style={[styles.filterModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.filterModalTitle, { color: colors.textPrimary }]}>Effectuer un dépôt</Text>
              <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.depositModalLabel, { color: colors.textSecondary }]}>Montant du dépôt (₣)</Text>
            <TextInput
              style={[styles.depositInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.actionCardBg }]}
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              placeholder="50 000"
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.quickDepositChipsRow}>
              {['10000', '25000', '50000', '100000'].map((amt) => {
                const isSelected = depositAmount === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickDepositChip,
                      {
                        backgroundColor: isSelected ? colors.primarySoft : colors.actionCardBg,
                        borderColor: isSelected ? colors.accentPrimary : colors.border,
                      },
                    ]}
                    onPress={() => setDepositAmount(amt)}
                  >
                    <Text
                      style={[
                        styles.quickDepositChipText,
                        { color: isSelected ? colors.accentPrimary : colors.textPrimary },
                      ]}
                    >
                      {parseInt(amt, 10).toLocaleString('fr-FR')} ₣
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.confirmDepositBtn, { backgroundColor: colors.accentGreen }]}
              activeOpacity={0.88}
              onPress={handleDepositSubmit}
            >
              <Text style={[styles.confirmDepositBtnText, { color: colors.depositBtnText }]}>Recharger le compte</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal CRUD / Saisie des scores */}
      <ScoreEditorModal
        visible={scoreModalVisible}
        coupon={selectedTicket}
        onClose={() => {
          setScoreModalVisible(false);
          setSelectedTicket(null);
        }}
      />
    </View>
  );
};

export { BetHistoryScreen as MainHistoryScreen };
export default BetHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    padding: 4,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 110,
  },
  cardSeparator: {
    height: 8,
  },
  listHeaderContainer: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  collapsibleBleedWrapper: {
    marginHorizontal: -8,
  },
  accountCard: {
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 0,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  balanceDepositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  balanceLeftCol: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '400',
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9.5,
    borderRadius: 10,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statsTitle: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '400',
  },
  statsSub: {
    fontSize: 12.5,
    fontWeight: '400',
  },
  statsSubBold: {
    fontWeight: '700',
  },
  betCard: {
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1.5,
  },
  cardTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTopMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketMetaText: {
    fontSize: 11.5,
    fontWeight: '400',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeWrap: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  layersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 8,
  },
  layersIcon: {
    width: 13,
    height: 13,
    tintColor: '#7E95AC',
  },
  eventsCountText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  cardDetails: {
    gap: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Modale */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  filterModalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 18,
    maxHeight: '85%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 14,
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChipItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipItemText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  filterActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
  },
  filterResetBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  filterResetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterApplyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Période Modal */
  periodModalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 18,
  },
  periodChoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  periodChoiceText: {
    fontSize: 14,
  },

  /* Dépôt Modal */
  depositModalCard: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 18,
  },
  depositModalLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  depositInput: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  quickDepositChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickDepositChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickDepositChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  confirmDepositBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDepositBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
