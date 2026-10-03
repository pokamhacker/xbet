import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsive } from '../utils/responsive';
import { useThemeStore } from '../store/themeStore';
import { useBetStore } from '../store/useBetStore';
import { useCouponStore } from '../store/couponStore';
import { useAuthStore } from '../store/authStore';
import { EventCard } from '../components/coupon/EventCard';
import { BetBottomSheet } from '../components/coupon/BetBottomSheet';
import { SaveCouponModal } from '../components/coupon/SaveCouponModal';
import { CouponActionSheet } from '../components/coupon/CouponActionSheet';
import { EmptyCouponActions } from '../components/coupon/EmptyCouponActions';
import { LoadCouponModal } from '../components/coupon/LoadCouponModal';
import { BrandLogo } from '../components/common/BrandLogo';

export default function CouponScreen({ navigation }: any) {
  const { theme, currentTheme: rawCurrentTheme } = useThemeStore();
  const currentTheme = rawCurrentTheme || theme;
  const { balance, deposit } = useBetStore();
  const { currentUser } = useAuthStore();
  const { font, moderateScale, isTablet, contentContainerStyle } = useResponsive();

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
  const [savedCouponCode, setSavedCouponCode] = useState('');

  // Panneau de Pari (3 Onglets) : Mise | Code promo | Cote de référence
  const [betTab, setBetTab] = useState<'Mise' | 'Code promo' | 'Cote de référence'>('Mise');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [oddsPolicy, setOddsPolicy] = useState<'ask' | 'up' | 'any'>('ask');

  // Modale Recharger Compte
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');

  // Formatage de la cote globale pour l'affichage (ex: 8800 ou 3.98)
  const totalOddsDisplay = useMemo(() => {
    if (!hasSelections) return '1.00';
    return Number.isInteger(totalOdds) ? totalOdds.toString() : totalOdds.toFixed(2);
  }, [hasSelections, totalOdds]);

  // Solde utilisateur actuel (avec support authStore ou betStore)
  const userBalance = currentUser?.balance ?? balance;

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  // Sauvegarder le coupon de pari
  const handleSaveCoupon = () => {
    // 1. Génération ou récupération du code (ex: 'E9CN9')
    const code = saveCouponCode();
    if (code) {
      setSavedCouponCode(code);
      // 2. Fermer le Bottom Sheet d'options s'il est ouvert
      setShow3DotsMenu(false);
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

  const isDark = currentTheme.isDark;
  const screenBg = currentTheme.background;
  const headerBg = currentTheme.headerBackground;
  const textPrimary = currentTheme.textPrimary;
  const textSecondary = currentTheme.textSecondary;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={headerBg || '#FFFFFF'}
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.mainContainer}>
        {/* ===================================================================== */}
        {/* 1. BARRE SUPÉRIEURE (HEADER)                                          */}
        {/* ===================================================================== */}
        <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: theme.barBorder }]}>
          {/* Titre centré : Texte Combiné centré horizontalement avec chevron vers le bas */}
          {hasSelections && (
            <View style={styles.headerCenterTitleWrap} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.ticketTypeDropdown}
                onPress={() => setShowTicketTypeMenu(true)}
                activeOpacity={0.7}
                accessibilityLabel="Type de pari"
                accessibilityRole="button"
              >
                <Text style={[styles.ticketTypeDropdownText, { color: textPrimary }]}>
                  {ticketType === 'Simple' ? 'Pari simple' : ticketType}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Espace gauche pour le centrage horizontal strict */}
          <View style={{ width: 44 }} />

          {/* Icônes d'actions (droite) : trash-can-outline + dots-vertical */}
          {hasSelections ? (
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.headerActionBtn}
                activeOpacity={0.7}
                accessibilityLabel="Vider le coupon"
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color={textSecondary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerActionBtn}
                onPress={() => setShow3DotsMenu(true)}
                accessibilityLabel="Options du coupon"
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
                  size={22}
                  color={textPrimary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyHeaderWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <BrandLogo size={18} variant="compact" />
                <Text style={[styles.emptyHeaderTitle, { color: textPrimary }]}>
                  Coupon
                </Text>
              </View>
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
              paddingBottom: isExpanded ? 460 : 130,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {!hasSelections ? (
            /* ================================================================= */
            /* ÉTAT VIDE : LES 5 CARTES D'ACTIONS (EmptyCouponActions)           */
            /* ================================================================= */
            <EmptyCouponActions
              navigation={navigation}
              userBalance={`${userBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣`}
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
          ) : (
            /* ================================================================= */
            /* ÉTAT ACTIF : CARTES DES ÉVÉNEMENTS ACTIFS (EventCard)             */
            /* ================================================================= */
            <View style={styles.activeListContainer}>
              {currentSelections.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRemove={removeEvent}
                  theme={theme}
                />
              ))}
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
            potentialPayout={potentialPayout}
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
            theme={theme}
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
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
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
                        { color: isSelected ? theme.primary : textPrimary },
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
                      color={theme.primary}
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
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
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
              <Text style={{ fontWeight: '700', color: theme.primary }}>
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
                        color: theme.primary,
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
                  backgroundColor: isDark ? theme.background : '#F8FAFC',
                  borderColor: theme.border,
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
                style={[styles.depositCancelBtn, { borderColor: theme.border }]}
                onPress={() => setShowDepositModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.depositCancelText, { color: textSecondary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.depositSubmitBtn, { backgroundColor: theme.primary }]}
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

      {/* ===================================================================== */}
      {/* 9. MODALE DE CHARGEMENT DE COUPON (LoadCouponModal)                   */}
      {/* ===================================================================== */}
      <LoadCouponModal
        visible={isLoadSheetVisible}
        onClose={() => setLoadSheetVisible(false)}
        onLoadCoupon={handleLoadCouponByCode}
      />
    </SafeAreaView>
  );
}

export { CouponScreen };

// -----------------------------------------------------------------------------
// STYLES PIXEL-PERFECT
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fond d'écran principal
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  mainContainer: {
    flex: 1,
    width: '100%',          // 100% de la largeur disponible
    height: '100%',         // 100% de la hauteur disponible
    paddingHorizontal: 8,   // Marges latérales réduites à 8px pour coller aux bords
    justifyContent: 'space-between',
  },
  contentScrollView: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 110,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 52,
    marginHorizontal: -8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  activeListContainer: {
    paddingTop: 12,
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      },
    }),
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
