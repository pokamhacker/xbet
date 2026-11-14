import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Image,
  Platform,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import { useResponsive } from '../utils/responsive';
import { useThemeStore } from '../store/themeStore';
import {
  getHeaderBgColor,
  getScreenBgColor,
  getStatusBarStyleForTheme,
} from '../theme/themes';
import { useBetStore } from '../store/useBetStore';
import { useCouponStore } from '../store/couponStore';
import { useAuthStore } from '../store/authStore';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { EventCard, OddTrendDirection } from '../components/coupon/EventCard';
import { BetBottomSheet } from '../components/coupon/BetBottomSheet';
import {
  SaveCouponModal,
  ClearCouponConfirmModal,
} from '../components/coupon/SaveCouponModal';
import { CouponActionSheet } from '../components/coupon/CouponActionSheet';
import { EmptyCouponActions } from '../components/coupon/EmptyCouponActions';
import { LoadCouponModal } from '../components/coupon/LoadCouponModal';
import { BrandLogo } from '../components/common/BrandLogo';
import {
  TrashBinIcon,
  CouponMenuDotsIcon,
} from '../components/common/CouponIcons';
import {
  createAppRefreshControl,
  useAppRefresh,
} from '../components/common/AppRefreshControl';

export default function CouponScreen({ navigation }: any) {
  const { theme, currentTheme: rawCurrentTheme, currentBrand } = useThemeStore();
  const currentTheme = rawCurrentTheme || theme;
  const { balance, deposit } = useBetStore();
  const { currentUser } = useAuthStore();
  const isFocused = useIsFocused();
  const { font, moderateScale, isTablet, insets, contentContainerStyle } = useResponsive();
  const { refreshing, onRefresh } = useAppRefresh();

  const {
    activeEvents,
    currentSelections: storeSelections,
    ticketType,
    setTicketType,
    stake,
    setStake,
    isLoadSheetVisible,
    setLoadSheetVisible,
    isBetSheetVisible,
    setBetSheetVisible,
    removeEvent,
    clearSlip,
    clearCoupon,
    loadByCode,
    placeBet,
    saveCouponCode,
    getTotalOdds,
    getPotentialPayout,
  } = useCouponStore();

  // Liste active garantie
  const currentSelections = useMemo(() => {
    return storeSelections && storeSelections.length > 0
      ? storeSelections
      : activeEvents || [];
  }, [storeSelections, activeEvents]);

  const hasSelections = currentSelections.length > 0;
  const totalOdds = getTotalOdds();
  const potentialPayout = getPotentialPayout();

  // État d'expansion du BottomSheet amovible
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const isExpanded = localIsExpanded || isBetSheetVisible;
  const setIsExpanded = (val: boolean) => {
    setLocalIsExpanded(val);
    setBetSheetVisible(val);
  };

  // Modales & Menus
  const [showTicketTypeMenu, setShowTicketTypeMenu] = useState(false);
  const [show3DotsMenu, setShow3DotsMenu] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [isClearConfirmVisible, setIsClearConfirmVisible] = useState(false);
  const [savedCouponCode, setSavedCouponCode] = useState('');
  const [isBoosterDismissed, setIsBoosterDismissed] = useState(false);

  // Panneau de Pari (3 Onglets) : Mise | Code promo | Cote de référence
  const [betTab, setBetTab] = useState<'Mise' | 'Code promo' | 'Cote de référence'>('Mise');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [oddsPolicy, setOddsPolicy] = useState<'ask' | 'up' | 'any'>('ask');

  // Modale Recharger Compte
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');

  // Réaffiche le Booster de Combiné si l'utilisateur vide puis regarnit le coupon
  useEffect(() => {
    if (!hasSelections) {
      setIsBoosterDismissed(false);
    }
  }, [hasSelections]);

  // Suivi dynamique temps réel des variations de cotes (hausse verte / baisse rouge + ancienne cote barrée)
  const [liveEventOdds, setLiveEventOdds] = useState<
    Record<string, { odd: number; trend: OddTrendDirection }>
  >({});
  const [totalOddsTrend, setTotalOddsTrend] = useState<OddTrendDirection>('stable');
  const [previousTotalOddsStr, setPreviousTotalOddsStr] = useState<string | null>(null);
  const tickStepRef = useRef<number>(0);

  // Synchronise les cotes de base dès que la liste des sélections change
  useEffect(() => {
    if (!hasSelections) {
      setLiveEventOdds({});
      setTotalOddsTrend('stable');
      setPreviousTotalOddsStr(null);
      return;
    }
    setLiveEventOdds((prev) => {
      const next: Record<string, { odd: number; trend: OddTrendDirection }> = {};
      currentSelections.forEach((ev) => {
        if (prev[ev.id]) {
          next[ev.id] = prev[ev.id];
        } else {
          next[ev.id] = { odd: Number(ev.odd) || 1.5, trend: 'stable' };
        }
      });
      return next;
    });
  }, [hasSelections, currentSelections]);

  const effectiveTotalOdds = useMemo(() => {
    if (!hasSelections) return 1;
    if (ticketType === 'Simple') {
      const first = currentSelections[0];
      return liveEventOdds[first.id]?.odd ?? (Number(first.odd) || 1);
    }
    return currentSelections.reduce((acc, ev) => {
      const o = liveEventOdds[ev.id]?.odd ?? (Number(ev.odd) || 1);
      return acc * o;
    }, 1);
  }, [hasSelections, currentSelections, liveEventOdds, ticketType]);

  // Simulation réaliste d'oscillations de cotes en direct tant que l'écran Coupon est actif
  useEffect(() => {
    if (!isFocused || !hasSelections) return;

    let strikeClearTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      tickStepRef.current += 1;
      const step = tickStepRef.current;

      setLiveEventOdds((prev) => {
        const ids = currentSelections.map((e) => e.id);
        if (ids.length === 0) return prev;
        const targetId = ids[step % ids.length];
        const baseEv = currentSelections.find((e) => e.id === targetId);
        const currentVal = prev[targetId]?.odd ?? (Number(baseEv?.odd) || 1.8);

        // Alternance hausse / baisse réaliste
        const delta = step % 3 === 1 ? -0.02 : step % 3 === 2 ? 0.025 : -0.015;
        const updatedOdd = Math.max(1.05, Number((currentVal + delta).toFixed(3)));
        const direction: OddTrendDirection =
          updatedOdd > currentVal ? 'up' : updatedOdd < currentVal ? 'down' : 'stable';

        const prevProd = currentSelections.reduce((acc, ev) => {
          const val = prev[ev.id]?.odd ?? (Number(ev.odd) || 1);
          return acc * val;
        }, 1);

        const nextMap: Record<string, { odd: number; trend: OddTrendDirection }> = {};
        currentSelections.forEach((ev) => {
          if (ev.id === targetId) {
            nextMap[ev.id] = { odd: updatedOdd, trend: direction };
          } else {
            nextMap[ev.id] = prev[ev.id] || { odd: Number(ev.odd) || 1.5, trend: 'stable' };
          }
        });

        const nextProd = currentSelections.reduce((acc, ev) => {
          return acc * (nextMap[ev.id]?.odd ?? 1);
        }, 1);

        if (nextProd < prevProd) {
          setPreviousTotalOddsStr(formatCleanOdds(prevProd));
          setTotalOddsTrend('down');
          if (strikeClearTimer) clearTimeout(strikeClearTimer);
          strikeClearTimer = setTimeout(() => {
            setPreviousTotalOddsStr(null);
          }, 3200);
        } else if (nextProd > prevProd) {
          setPreviousTotalOddsStr(null);
          setTotalOddsTrend('up');
        }

        return nextMap;
      });
    }, 4200);

    return () => {
      clearInterval(interval);
      if (strikeClearTimer) clearTimeout(strikeClearTimer);
    };
  }, [isFocused, hasSelections, currentSelections]);

  // Formatage de la cote globale pour l'affichage
  const totalOddsDisplay = useMemo(() => {
    if (!hasSelections) return '1';
    return formatCleanOdds(effectiveTotalOdds);
  }, [hasSelections, effectiveTotalOdds]);

  const effectivePotentialPayout = useMemo(() => {
    if (!hasSelections) return potentialPayout;
    return Math.round((stake || 0) * effectiveTotalOdds * 100) / 100;
  }, [hasSelections, stake, effectiveTotalOdds, potentialPayout]);

  // Nombre de sélections qualifiées (cote >= 1.2) pour le Booster de Combiné
  const remainingBoosterSelections = useMemo(() => {
    const qualifying = currentSelections.filter((ev) => {
      const oddVal = liveEventOdds[ev.id]?.odd ?? Number(ev.odd ?? 0);
      return oddVal >= 1.2;
    }).length;
    return Math.max(0, 4 - qualifying);
  }, [currentSelections, liveEventOdds]);

  // Solde utilisateur actuel (avec support authStore ou betStore)
  const userBalance = currentUser?.balance ?? balance;

  // Partage natif du coupon
  const handleShareCoupon = async () => {
    const code = saveCouponCode() || savedCouponCode || 'LU631';
    setSavedCouponCode(code);
    try {
      await Share.share({
        message: `Voici mon code de coupon de pari : ${code}. Chargez-le dans l'application pour jouer ensemble !`,
      });
    } catch {
      setIsSaveModalVisible(true);
    }
  };

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  // Sauvegarder le coupon de pari
  const handleSaveCoupon = () => {
    // 1. Génération ou récupération du code (ex: 'E9CN9')
    const code = saveCouponCode();
    if (code) {
      setSavedCouponCode(code);
      // 2. Fermer le Bottom Sheet d'options s'il est ouvert et replier le tiroir de mise
      setShow3DotsMenu(false);
      setIsExpanded(false);
      // 3. Afficher UNIQUEMENT la nouvelle SaveCouponModal
      setIsSaveModalVisible(true);
    } else {
      Alert.alert('Erreur', 'Aucun événement dans le coupon à enregistrer.');
    }
  };

  // Vider immédiatement le coupon
  const handleClearAll = () => {
    clearCoupon();
    setShow3DotsMenu(false);
    setIsExpanded(false);
  };

  const handleClearSlip = handleClearAll;

  // Valider et placer le pari
  const handleConfirmBet = () => {
    if (betTab === 'Code promo') {
      if (!promoCodeInput.trim()) {
        Alert.alert('Code promo requis', 'Veuillez saisir un code promo valide.');
        return;
      }
    }

    const result = placeBet();
    if (result.success) {
      setIsExpanded(false);
      Alert.alert('Pari Enregistré !', result.message, [
        {
          text: 'Consulter dans l\'historique',
          onPress: () => {
            if (result.newCouponId) {
              navigation.navigate('BetDetailTicket', { couponId: result.newCouponId });
            } else {
              navigation.navigate('Historique');
            }
          },
        },
        { text: 'OK' },
      ]);
    } else {
      Alert.alert('Impossible de placer le pari', result.message);
    }
  };

  // Charger le coupon par code via LoadCouponModal
  const handleLoadCouponByCode = (code: string) => {
    const res = loadByCode(code.trim().toUpperCase());
    if (res.success) {
      setLoadSheetVisible(false);
      Alert.alert('Coupon chargé !', res.message);
    } else {
      Alert.alert('Erreur', res.message || 'Code de coupon invalide.');
    }
    return res;
  };

  // Recharger le compte
  const handleDeposit = () => {
    const val = parseFloat(depositAmount);
    if (!isNaN(val) && val > 0) {
      deposit(val);
      setShowDepositModal(false);
      Alert.alert(
        'Dépôt effectué !',
        `Votre solde a été crédité de ${val.toLocaleString('fr-FR')} ₣.`
      );
    }
  };

  // ---------------------------------------------------------------------------
  // RENDU PRINCIPAL
  // ---------------------------------------------------------------------------

  const isDark = Boolean(currentTheme.isDark);
  const themeName = String(
    currentTheme?.name || currentTheme?.key || currentBrand || '1xbet'
  ).toLowerCase();
  const isParipesa = themeName.includes('paripesa');
  const isMegaPari = themeName.includes('megapari');
  const isMelbet = themeName.includes('melbet');
  const isBlack = themeName.includes('black');

  const rawScreenBg = getScreenBgColor(currentTheme);
  const rawHeaderBg = getHeaderBgColor(currentTheme);
  const screenBg = isMelbet && isDark ? '#21262C' : rawScreenBg;
  const headerBg = isMelbet && isDark ? '#21262C' : hasSelections && isDark ? screenBg : rawHeaderBg;
  const statusBarStyle = getStatusBarStyleForTheme(currentTheme, headerBg);

  const textPrimary = currentTheme.textPrimary || (isDark ? '#FFFFFF' : '#00325E');
  const textSecondary = currentTheme.textSecondary || (isDark ? '#8FA2B6' : '#6E849B');

  // Couleur pour le sélecteur "Combiné ⌄" (#9BA3AE) et les icônes Corbeille / Menu (#7E8791)
  const headerSelectorColor = isDark ? '#9BA3AE' : '#557089';
  const headerIconsColor = isDark ? '#7E8791' : '#557089';
  const boosterAccentColor = isMelbet
    ? '#D89228'
    : (currentTheme as any).accent || currentTheme.primary || '#D89228';

  const eligibleBoosterCount = currentSelections.filter(
    (ev) => (Number(ev.odd) || 0) >= 1.2
  ).length;
  const neededForBoosterBonus = Math.max(0, 4 - eligibleBoosterCount);

  const effectiveTicketLabel =
    currentSelections.length > 1 && ticketType === 'Simple'
      ? 'Combiné'
      : ticketType === 'Simple'
        ? 'Pari simple'
        : ticketType;

  const topSafeInset =
    (insets?.top ?? 0) > 0
      ? insets.top
      : Platform.OS === 'android'
        ? StatusBar.currentHeight || 0
        : 0;

  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomSafeInset =
    (insets?.bottom ?? 0) > 0
      ? Math.max(insets.bottom, androidBottomPad)
      : Platform.OS === 'ios'
        ? 20
        : androidBottomPad;
  const bottomTabBarHeight = 56 + bottomSafeInset;

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: screenBg,
        },
      ]}
    >
      <StatusBar
        animated
        barStyle={statusBarStyle}
        {...({ translucent: true, backgroundColor: 'transparent' } as any)}
      />
      <View
        style={[
          styles.mainContainer,
          {
            backgroundColor: screenBg,
            paddingBottom: bottomTabBarHeight,
          },
        ]}
      >
        {/* ===================================================================== */}
        {/* 1. BARRE SUPÉRIEURE (HEADER — Fusionné avec le fond #21262C)          */}
        {/* ===================================================================== */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: headerBg,
              borderBottomWidth: 0,
              paddingTop: topSafeInset,
              height: 52 + topSafeInset,
            },
          ]}
        >
          {hasSelections ? (
            <>
              {/* Titre centré : Texte Combiné (16.5px, 500, #9BA3AE) avec chevron ⌄ (#9BA3AE) */}
              <View style={[styles.headerCenterTitleWrap, { top: topSafeInset }]} pointerEvents="box-none">
                <TouchableOpacity
                  style={styles.ticketTypeDropdown}
                  onPress={() => setShowTicketTypeMenu(true)}
                  activeOpacity={0.7}
                  accessibilityLabel="Type de pari"
                  accessibilityRole="button"
                >
                  <Text style={[styles.ticketTypeDropdownText, { color: headerSelectorColor }]}>
                    {effectiveTicketLabel}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={15}
                    color={headerSelectorColor}
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Espace gauche pour le centrage horizontal strict */}
              <View style={{ width: 44 }} />

              {/* Icônes d'actions (droite) : Corbeille (#7E8791, 20x20) + Menu ••• (#7E8791, gap: 18) */}
              <View style={styles.headerRightActions}>
                <TouchableOpacity
                  onPress={() => setIsClearConfirmVisible(true)}
                  style={styles.headerActionBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Vider le coupon"
                >
                  <TrashBinIcon
                    size={20}
                    color={headerIconsColor}
                    cutoutColor={headerBg}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.headerActionBtn}
                  onPress={() => {
                    setIsExpanded(false);
                    setShow3DotsMenu(true);
                  }}
                  accessibilityLabel="Options du coupon"
                  activeOpacity={0.7}
                >
                  <CouponMenuDotsIcon
                    size={20}
                    color={headerIconsColor}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyHeaderContainer}>
              <Text
                style={[
                  styles.emptyHeaderTitle,
                  {
                    color: isDark
                      ? (currentTheme?.textPrimary || '#FFFFFF')
                      : (currentTheme?.primary || currentTheme?.colors?.primary || '#376996'),
                  },
                ]}
              >
                Coupon
              </Text>
            </View>
          )}
        </View>

        {/* ===================================================================== */}
        {/* 2. CONTENU PRINCIPAL (SCROLLVIEW)                                     */}
        {/* ===================================================================== */}
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={[
            styles.contentScrollView,
            styles.scrollContent,
            contentContainerStyle,
            hasSelections && {
              paddingBottom: isExpanded ? 460 : 145,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={createAppRefreshControl({
            refreshing,
            onRefresh,
            theme: currentTheme,
            progressViewOffset: 15,
          })}
        >
          {!hasSelections ? (
            /* ================================================================= */
            /* ÉTAT VIDE : LES 5 CARTES D'ACTIONS (EmptyCouponActions)           */
            /* ================================================================= */
            <View style={{ paddingHorizontal: 12 }}>
              <EmptyCouponActions
                navigation={navigation}
                userBalance={
                  typeof userBalance === 'number'
                    ? `${Math.round(userBalance)} F`
                    : `${userBalance} F`
                }
                onDeposit={() => setShowDepositModal(true)}
                onSearch={() => navigation.navigate('Populaire')}
                onCombine={() => {
                  Alert.alert(
                    'Pari combiné du jour 🚀',
                    'Charger le combiné exclusif boosté (Cote : 4.01) ?',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Charger', onPress: () => loadByCode('LR5CP') },
                    ]
                  );
                }}
                onCreateCoupon={() => navigation.navigate('StudioCreation')}
                onLoadCoupon={() => setLoadSheetVisible(true)}
              />
            </View>
          ) : (
            /* ================================================================= */
            /* ÉTAT ACTIF : BOOSTER DE COMBINÉ + CARTES DES ÉVÉNEMENTS ACTIFS     */
            /* ================================================================= */
            <View style={styles.activeListContainer}>
              {currentSelections.length > 1 && !isBoosterDismissed && (
                <View
                  style={[
                    styles.boosterCard,
                    {
                      backgroundColor: isDark ? '#262C33' : '#FFFFFF',
                      borderColor: boosterAccentColor,
                    },
                  ]}
                >
                  {/* Ligne 1 : ⚡ + Booster de Combiné + ⓘ | ✕ */}
                  <View style={styles.boosterHeaderRow}>
                    <View style={styles.boosterTitleGroup}>
                      {/* Icône éclair plein ⚡ (15x15) */}
                      <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M13 2L4.5 13.5H11.5L10.5 22L19.5 10.5H12.5L13 2Z"
                          fill={boosterAccentColor}
                          stroke={boosterAccentColor}
                          strokeWidth={1.2}
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text
                        style={[
                          styles.boosterTitleText,
                          { color: isDark ? '#E2E6EA' : '#1E242B' },
                        ]}
                      >
                        Booster de Combiné
                      </Text>
                      {/* Icône info ⓘ (#7E8791, 15x15) */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          Alert.alert(
                            'Booster de Combiné',
                            'Ajoutez au moins 4 sélections avec une cote supérieure ou égale à 1.2 pour recevoir un bonus sur la cote totale de votre combiné.'
                          )
                        }
                        style={{ marginLeft: 6 }}
                      >
                        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                          <Circle
                            cx="12"
                            cy="12"
                            r="9.5"
                            stroke="#7E8791"
                            strokeWidth={1.8}
                          />
                          <Path
                            d="M12 11V16.5"
                            stroke="#7E8791"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                          />
                          <Circle cx="12" cy="7.8" r="1.1" fill="#7E8791" />
                        </Svg>
                      </TouchableOpacity>
                    </View>

                    {/* Bouton croix ✕ en #D89228 (14x14) */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setIsBoosterDismissed(true)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M5 5L19 19M19 5L5 19"
                          stroke={boosterAccentColor}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>

                  {/* Ligne 2 : Cas A (Bonus non encore atteint) vs Cas B (Bonus actif) */}
                  {neededForBoosterBonus > 0 ? (
                    <Text style={styles.boosterBodyText}>
                      Ajoutez plus de sélections avec une cote supérieure ou égale à 1.2 pour bénéficier du bonus. Nombre de sélections que vous devez ajouter : {neededForBoosterBonus}
                    </Text>
                  ) : (
                    <View style={styles.boosterActiveOddsRow}>
                      <Text style={styles.boosterActiveLabel}>Cote</Text>
                      <Text
                        style={[
                          styles.boosterActiveValue,
                          { color: isDark ? '#FFFFFF' : '#1E242B' },
                        ]}
                      >
                        1.03
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {currentSelections.map((event) => {
                const liveInfo = liveEventOdds[event.id];
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    liveOdd={liveInfo?.odd}
                    oddTrend={liveInfo?.trend || 'stable'}
                    onRemove={removeEvent}
                    theme={currentTheme}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* ===================================================================== */}
        {/* 3. PANNEAU DE MISE INFERIEUR (BetBottomSheet AMOVIBLE)                */}
        {/* ===================================================================== */}
        {hasSelections && (
          <BetBottomSheet
            eventsCount={currentSelections.length}
            totalOdds={totalOddsDisplay}
            stake={stake}
            onStakeChange={setStake}
            userBalance={userBalance}
            potentialPayout={effectivePotentialPayout}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
            onPlaceBet={handleConfirmBet}
            onOpenDeposit={() => setShowDepositModal(true)}
            betTab={betTab}
            onBetTabChange={setBetTab}
            promoCode={promoCodeInput}
            onPromoCodeChange={setPromoCodeInput}
            oddsPolicy={oddsPolicy}
            onOddsPolicyChange={setOddsPolicy}
            oddsTrend={totalOddsTrend}
            previousTotalOdds={previousTotalOddsStr}
            theme={currentTheme}
          />
        )}
      </View>

      {/* ===================================================================== */}
      {/* 4. MODALE DROPDOWN : TYPE DE TICKET (Pari simple / Combiné / Système) */}
      {/* ===================================================================== */}
      <Modal
        visible={showTicketTypeMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTicketTypeMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowTicketTypeMenu(false)}
        >
          <View
            style={[
              styles.dropdownMenuCard,
              {
                backgroundColor: currentTheme.cardBackground || theme.cardBackground,
                borderColor: currentTheme.border || theme.border,
              },
            ]}
          >
            <Text style={[styles.dropdownHeaderTitle, { color: textSecondary }]}>
              TYPE DE TICKET
            </Text>

            {(['Simple', 'Combiné', 'Système'] as const).map((type) => {
              const isSelected = ticketType === type;
              const label = type === 'Simple' ? 'Pari simple' : type;
              const subtitle =
                type === 'Simple'
                  ? 'Pari portant sur un événement unique'
                  : type === 'Combiné'
                    ? 'Plusieurs sélections dépendantes'
                    : 'Combinaisons multiples de sélections';

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.dropdownMenuItem,
                    isSelected && {
                      backgroundColor: currentTheme.primarySoft || (isDark ? '#2A2E39' : '#EFF6FF'),
                    },
                  ]}
                  onPress={() => {
                    setTicketType(type);
                    setShowTicketTypeMenu(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.dropdownItemTitle,
                        { color: isSelected ? currentTheme.primary : textPrimary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {label}
                    </Text>
                    <Text style={[styles.dropdownItemSubtitle, { color: textSecondary }]}>
                      {subtitle}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={currentTheme.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===================================================================== */}
      {/* 5. MENU ACTIONS 3 POINTS (Bottom Sheet - Choisissez une action)       */}
      {/* ===================================================================== */}
      <CouponActionSheet
        visible={show3DotsMenu}
        onClose={() => setShow3DotsMenu(false)}
        onSaveCoupon={handleSaveCoupon}
        onLoadCoupon={() => setLoadSheetVisible(true)}
        onCreateCoupon={() => navigation.navigate('StudioCreation')}
        onShareCoupon={handleShareCoupon}
      />

      {/* ===================================================================== */}
      {/* 6. MODALE RECHARGER LE COMPTE (`showDepositModal`)                     */}
      {/* ===================================================================== */}
      <Modal
        visible={showDepositModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.depositCard,
              {
                backgroundColor: currentTheme.cardBackground || headerBg,
                borderColor: currentTheme.border || screenBg,
              },
            ]}
          >
            <View style={styles.sheetHeaderRow}>
              <Text style={[styles.sheetHeaderTitle, { color: textPrimary }]}>
                Recharger le compte
              </Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.tabSectionHint, { color: textSecondary }]}>
              Solde actuel :{' '}
              <Text style={{ fontWeight: '700', color: currentTheme.primary }}>
                {userBalance.toLocaleString('fr-FR')} ₣
              </Text>
            </Text>

            <View style={styles.quickStakePillRow}>
              {['50000', '100000', '500000'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickStakePill,
                    depositAmount === amt && {
                      borderColor: currentTheme.primary,
                      backgroundColor: currentTheme.primarySoft || (isDark ? '#2A2E39' : '#EFF6FF'),
                    },
                  ]}
                  onPress={() => setDepositAmount(amt)}
                >
                  <Text
                    style={[
                      styles.quickStakePillText,
                      depositAmount === amt && {
                        color: currentTheme.primary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {parseInt(amt, 10).toLocaleString('fr-FR')} ₣
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[
                styles.stakeInputContainer,
                styles.promoTextInput,
                {
                  backgroundColor: isDark ? currentTheme.background : '#F8FAFC',
                  borderColor: currentTheme.border || theme.border,
                  color: textPrimary,
                  marginTop: 10,
                },
              ]}
              placeholder="Montant en ₣"
              placeholderTextColor="#94A3B8"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
            />

            <View style={styles.depositBtnRow}>
              <TouchableOpacity
                style={[styles.depositCancelBtn, { borderColor: currentTheme.border || theme.border }]}
                onPress={() => setShowDepositModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.depositCancelText, { color: textSecondary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.depositSubmitBtn, { backgroundColor: currentTheme.primary }]}
                onPress={handleDeposit}
                activeOpacity={0.85}
              >
                <Text style={styles.depositSubmitText}>Recharger</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================================================================== */}
      {/* 8. RENDER UNIQUE - MODALE DE SAUVEGARDE DE COUPON                      */}
      {/* ===================================================================== */}
      <SaveCouponModal
        visible={isSaveModalVisible}
        couponCode={savedCouponCode}
        onClose={() => setIsSaveModalVisible(false)}
      />

      <ClearCouponConfirmModal
        visible={isClearConfirmVisible}
        onCancel={() => setIsClearConfirmVisible(false)}
        onConfirm={() => {
          setIsClearConfirmVisible(false);
          handleClearAll();
        }}
      />

      {/* ===================================================================== */}
      {/* 9. MODALE DE CHARGEMENT DE COUPON (LoadCouponModal)                   */}
      {/* ===================================================================== */}
      <LoadCouponModal
        visible={isLoadSheetVisible}
        onClose={() => setLoadSheetVisible(false)}
        onLoadCoupon={handleLoadCouponByCode}
      />
    </View>
  );
}

export { CouponScreen };

// -----------------------------------------------------------------------------
// STYLES PIXEL-PERFECT
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    width: '100%',          // 100% de la largeur disponible
    height: '100%',         // 100% de la hauteur disponible
    paddingHorizontal: 0,
    justifyContent: 'space-between',
  },
  contentScrollView: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 24,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    zIndex: 5,
  },
  headerCenterTitleWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketTypeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  ticketTypeDropdownText: {
    fontSize: 16.5,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  headerActionBtn: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeaderContainer: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeaderTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  activeListContainer: {
    paddingTop: 4,
  },
  boosterCard: {
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderColor: '#D89228',
    borderRadius: 12,
    backgroundColor: '#262C33',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  boosterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boosterTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  boosterTitleText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#E2E6EA',
    marginLeft: 6,
  },
  boosterBodyText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#7E8791',
    fontWeight: '400',
    marginTop: 6,
  },
  boosterActiveOddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  boosterActiveLabel: {
    fontSize: 13.5,
    color: '#8A949E',
    fontWeight: '400',
  },
  boosterActiveValue: {
    fontSize: 14.5,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Empty State */
  emptyContainer: {
    paddingTop: 14,
  },
  noticeContainer: {
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  noticeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  cardStack: {
    gap: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  boldSubtitle: {
    fontWeight: '700',
    color: '#D97706',
  },

  /* Modal & Sheet Common */
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dropdownMenuCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  dropdownHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    paddingHorizontal: 18,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  dropdownItemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetHeaderTitle: {
    fontSize: 16.5,
    fontWeight: '700',
  },
  sheetActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  sheetActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sheetActionTextWrap: {
    flex: 1,
  },
  sheetActionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  sheetActionSubtitle: {
    fontSize: 12,
  },
  quickTagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  quickTagBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabSectionHint: {
    fontSize: 13,
    marginBottom: 8,
  },
  promoTextInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  stakeInputContainer: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  greenPariBtnFull: {
    backgroundColor: '#34A853',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  greenPariBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  depositCard: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
  },
  quickStakePillRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  quickStakePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStakePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  depositBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  depositCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  depositSubmitBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
