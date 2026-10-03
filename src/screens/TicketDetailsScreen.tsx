import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Platform,
  RefreshControl,
  StatusBar,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import { useBetStore } from '../store/useBetStore';
import { TicketDivider } from '../components/TicketDivider';
import { TicketPerforation } from '../components/TicketPerforation';
import { MatchEventCard } from '../components/MatchEventCard';
import { WonMatchEventCard } from '../components/WonMatchEventCard';
import { TvBetPokerCard } from '../components/TvBetPokerCard';
import { BetOptionsBottomSheet } from '../components/BetOptionsBottomSheet';
import { MatchEvent } from '../types/bet';
import { useCouponStore } from '../store/couponStore';
import { NotificationBell } from '../components/common/NotificationBell';
import { useThemeStore } from '../stores/themeStore';
import { SaveCouponModal } from '../components/modals/SaveCouponModal';
import { ToggleCardIcon } from '../components/icons/ToggleCardIcon';
import { BetLayersIcon } from '../components/icons/BetLayersIcon';
import { formatBetDate } from '../utils/dateFormatter';
import { DuplicateCouponButton } from '../components/DuplicateCouponButton';

export default function TicketDetailsScreen({ route, navigation }: any) {
  const couponId = route?.params?.couponId || route?.params?.ticketId;
  const { coupons, executeCashout, duplicateCoupon } = useBetStore();
  const { duplicateFromCoupon } = useCouponStore();
  const { currentTheme } = useThemeStore();
  const { insets, isSmallDevice, isTablet, isLandscape, font, moderateScale, scale, contentContainerStyle } = useResponsive();
  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset = insets.bottom > 0 ? Math.max(insets.bottom, androidBottomPad) : (Platform.OS === 'ios' ? 20 : androidBottomPad);
  const bottomBarHeight = 56 + bottomInset;

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [savedCouponCode, setSavedCouponCode] = useState('');

  const handleSaveCoupon = () => {
    const code = coupon.shareCode || 'E9CN9';
    setSavedCouponCode(code);
    setOptionsVisible(false);
    setIsSaveModalVisible(true);
  };

  // Pull-to-refresh state & callback
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Ignore sur web / périphériques non supportés
    }
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Trouver le coupon actif ou prendre le premier par défaut
  const coupon = coupons.find((c) => c.id === couponId || (c as any).ticketNumber === couponId || (couponId === '1' && c.id === '482910481')) || coupons[0];

  if (!coupon) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.background }]}>
        <View style={[styles.mainContainer, { backgroundColor: currentTheme.background, marginBottom: bottomBarHeight }]}>
          <View style={[styles.header, { backgroundColor: currentTheme.headerBackground, borderBottomColor: currentTheme.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={currentTheme.isDark ? currentTheme.textPrimary : currentTheme.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>Détails du pari</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>Pari introuvable ou supprimé.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const ticket = coupon;
  const betData = coupon;
  const isTicketLive = Boolean(
    betData?.isLive ||
    betData?.events?.some((e) => e.isLive) ||
    (betData as any)?.selections?.some((s: any) => s.isLive)
  );

  const isWon =
    coupon.status === 'Payé' ||
    coupon.status === 'Gagné' ||
    coupon.status === 'Gain' ||
    (coupon.completedCount === coupon.eventsCount &&
      coupon.events.length > 0 &&
      coupon.events.every((e) => e.status === 'Gain' || e.status === 'Gagné'));

  const isLost = coupon.status === 'Perdu';

  // Standardisation des statuts pour fermeture stricte du ticket
  const isTicketFinished =
    coupon.status === 'Payé' ||
    coupon.status === 'Gagné' ||
    coupon.status === 'Gain' ||
    coupon.status === 'Perdu' ||
    coupon.status === 'Annulé' ||
    coupon.status === 'Vendu' ||
    (coupon.status as string) === 'Remboursé' ||
    (coupon as any).isSettled === true ||
    isWon ||
    isLost;

  const handleNotificationPress = () => {
    Alert.alert(
      'Notification activée',
      `Vous recevrez des alertes en direct pour les résultats du coupon № ${coupon.id}.`
    );
  };

  const handleCashout = () => {
    const rawAmount = coupon.sellPrice || coupon.cashoutAmount || Math.round(coupon.stake * 0.95);
    const amountStr = typeof rawAmount === 'number' ? rawAmount.toLocaleString('fr-FR') : rawAmount;
    Alert.alert(
      'Confirmer la vente (Cashout)',
      `Vendre ce coupon immédiatement pour ${amountStr} ₣ ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vendre',
          style: 'default',
          onPress: () => {
            executeCashout(coupon.id);
            Alert.alert('Vente effectuée', `Votre compte a été crédité de ${amountStr} ₣.`);
          },
        },
      ]
    );
  };

  const handleSellCoupon = handleCashout;

  const handleDuplicateCoupon = () => {
    duplicateCoupon(coupon.id);
    duplicateFromCoupon(coupon);
    navigation.navigate('MainTabs', { screen: 'CouponTab' });
  };

  const isSimple = coupon.type === 'Simple' || (coupon.events && coupon.events.length > 0 ? coupon.events.length <= 1 : coupon.eventsCount <= 1);
  const isCombine = !isSimple;

  const canSell = coupon.canSell !== undefined ? coupon.canSell : (coupon.isForSale && coupon.status === 'Accepté');
  const sellPrice = coupon.sellPrice || (coupon.cashoutAmount ? coupon.cashoutAmount.toLocaleString('fr-FR') : (coupon.stake ? Math.round(coupon.stake * 0.95).toLocaleString('fr-FR') : '15000'));
  const couponWithSell = {
    ...coupon,
    canSell,
    sellPrice,
  };

  // Masquage conditionnel : le bouton Dupliquer ne doit plus apparaître si le statut est Payé, Gagné ou Perdu
  const canDuplicate = !isWon && !isLost && !isTicketFinished;
  const canSellCoupon = couponWithSell.canSell && !isTicketFinished;
  const showBottomDock = Boolean(canSellCoupon || canDuplicate);

  const screenBg = currentTheme.background || '#EEF2F6';
  const cardBg = currentTheme.cardBackground || '#FFFFFF';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]}>
      <StatusBar
        barStyle={currentTheme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.headerBackground || '#FFFFFF'}
        translucent={Platform.OS === 'android'}
      />
      <View style={[styles.mainContainer, { backgroundColor: screenBg }]}>
        {/* 1. Header en haut */}
        <View style={[styles.header, { backgroundColor: currentTheme.headerBackground, borderBottomColor: currentTheme.border }]}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Retour"
          >
            <Ionicons name="arrow-back" size={24} color={currentTheme.isDark ? currentTheme.textPrimary : currentTheme.primary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer} pointerEvents="none">
            <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>Détails du pari</Text>
          </View>

          <View style={styles.headerActions}>
            {coupon.status === 'Accepté' && (
              <NotificationBell
                size={20}
                tintColor={currentTheme.isDark ? currentTheme.textSecondary : currentTheme.primary}
                onPress={handleNotificationPress}
              />
            )}
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setOptionsVisible(true)}
              accessibilityLabel="Options du coupon"
            >
              <Ionicons name="ellipsis-vertical" size={22} color={currentTheme.isDark ? currentTheme.textSecondary : currentTheme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. ScrollView contenant la carte du ticket */}
        <ScrollView

          style={[styles.scrollView, { backgroundColor: screenBg }]}
          contentContainerStyle={[
            styles.contentScrollView,
            styles.scrollContent,
            contentContainerStyle,
            {
              paddingBottom: (showBottomDock ? 110 : 24) + bottomBarHeight,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[currentTheme.primary]}
              tintColor={currentTheme.primary}
              progressBackgroundColor={currentTheme.cardBackground}
            />
          }
        >
          {/* Carte blanche de ticket avec perforations et bordures arrondies */}
          <View style={[styles.mainTicketCard, { backgroundColor: cardBg }]}>
            {/* --- Bloc supérieur : date + type + numéro de coupon --- */}
            <View style={styles.summarySection}>
              <View style={styles.topDateRow}>
                <Text style={[styles.createdDate, styles.ticketDateText, { color: currentTheme.textSecondary }]}>
                  {formatBetDate(coupon.createdAt || '27.09.2026 (08:30)')}
                </Text>

                {/* Badge En Direct */}
                {isTicketLive && (
                  <View style={styles.liveHeaderBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveHeaderBadgeText}>En direct</Text>
                  </View>
                )}
              </View>

              <View style={styles.typeHeaderRow}>
                <Text style={[styles.typeBold, { color: currentTheme.textPrimary }]}>
                  {coupon.type || (isCombine ? 'Combiné' : 'Simple')}
                </Text>
                <Text
                  style={[styles.idNumberText, { color: currentTheme.textPrimary }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {' '} № {coupon.id}
                </Text>
              </View>
            </View>

            {/* Séparateur 1 : Entre le bloc supérieur et le résumé du ticket */}
            <TicketDivider
              backgroundColor={screenBg}
              dotColor={currentTheme.isDark ? currentTheme.border : '#CBD5E1'}
              notchSize={12}
            />

            {/* --- Bloc résumé financier : cote / mise / gains / statut --- */}
            <View style={[styles.summarySection, styles.summarySectionBottom]}>
              {(ticket.type === 'Combiné' || isCombine) && (
                <View style={styles.eventCountRow}>
                  {/* Côté gauche : Logo cvv1 officiel 1xBet + Libellé + Nombre */}
                  <View style={styles.eventCountLeft}>
                    <Image
                      source={require('../../assets/icons/cvv1.png')}
                      style={styles.combineEventIcon}
                      resizeMode="contain"
                    />
                    <Text
                      style={[styles.eventCountLabel, { color: currentTheme.textPrimary }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      Nombre d'événements :
                    </Text>
                  </View>

                  {/* Côté droit : État d'avancement */}
                  <Text
                    style={[styles.eventCountStatus, { color: currentTheme.textPrimary }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {(ticket as any).finishedEventsCount || ticket.completedCount || 0} sur {ticket.eventsCount || (ticket as any).selections?.length || ticket.events?.length || 2} terminés
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>Cote :</Text>
                <Text style={[styles.boldValue, { color: currentTheme.textPrimary }]}>{coupon.totalOdds}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>Mise :</Text>
                <Text style={[styles.boldValue, { color: currentTheme.textPrimary }]}>
                  {Number(coupon.stake).toLocaleString('fr-FR').replace(/\s/g, ' ')} ₣
                </Text>
              </View>

              {/* Ligne Gain : affiché en vert si Gagné, ou Gains potentiels si en cours. Si Perdu, aucun gain n'est affiché */}
              {!isLost && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>
                    {isWon ? 'Gain :' : 'Gains potentiels :'}
                  </Text>
                  <Text
                    style={[
                      styles.boldValue,
                      {
                        color: isWon
                          ? (currentTheme.status?.paye || currentTheme.colors?.accentGreen || '#22C55E')
                          : currentTheme.textPrimary,
                      },
                    ]}
                  >
                    {isWon
                      ? `${Number(coupon.actualPayout || coupon.potentialPayout || (coupon.stake * (coupon.totalOdds || 1))).toLocaleString('fr-FR').replace(/\s/g, ' ')} ₣`
                      : `${Number(coupon.potentialPayout).toLocaleString('fr-FR').replace(/\s/g, ' ')} ₣`}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: currentTheme.textSecondary }]}>Statut :</Text>
                {isWon ? (
                  <View style={styles.statusPayeWrap}>
                    <View style={[styles.statusValidationCirclePaye, { backgroundColor: currentTheme.status.paye }]}>
                      <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.statusPayeText, { color: currentTheme.status.paye }]}>Payé</Text>
                  </View>
                ) : isLost ? (
                  <View style={styles.statusBadgeLostWrap}>
                    <View style={styles.statusValidationCircleLost}>
                      <Ionicons name="close" size={11} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statusLostText}>Perdu</Text>
                  </View>
                ) : (
                  <View style={styles.statusBadgeAcceptWrap}>
                    <View style={[styles.statusValidationCircle, { backgroundColor: currentTheme.status?.accepte || currentTheme.primary }]}>
                      <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.statusAcceptText, { color: currentTheme.status?.accepte || currentTheme.primary }]}>Accepté</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 3. Liste des Sélections / Événements Sportifs et Barres de séparation adaptatives */}
            {coupon.events && coupon.events.length > 0 && (
              <>
                {/* Séparateur 2 : Entre le résumé du ticket et le 1er match (uniquement si au moins 1 événement) */}
                <TicketDivider
                  backgroundColor={screenBg}
                  dotColor={currentTheme.isDark ? currentTheme.border : '#CBD5E1'}
                  notchSize={12}
                />

                {coupon.events.map((event, index) => {
                  const isPokerEvent =
                    event.gameCategory === 'poker' ||
                    (event.league && event.league.toUpperCase().includes('POKER')) ||
                    (event.sport && event.sport.toUpperCase().includes('POKER')) ||
                    event.badge === 'POKE';

                  return (
                    <React.Fragment key={event.id}>
                      {isPokerEvent ? (
                        <TvBetPokerCard
                          event={event}
                          isWon={isWon}
                        />
                      ) : isWon ? (
                        <WonMatchEventCard
                          event={event}
                        />
                      ) : (
                        <MatchEventCard
                          event={event}
                          isWon={isWon}
                        />
                      )}

                      {/* Séparateur uniquement ENTRE les matchs (si plus d'un événement, index < length - 1) */}
                      {index < coupon.events.length - 1 && (
                        <TicketDivider
                          backgroundColor={screenBg}
                          dotColor={currentTheme.isDark ? currentTheme.border : '#CBD5E1'}
                          notchSize={12}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>

        {/* Dock fixe ancré au bas de l'écran */}
        {showBottomDock && (
          <View style={[styles.bottomDockWrapper, { bottom: bottomBarHeight }]}>
            <View
              style={[
                styles.bottomDockContainer,
                {
                  backgroundColor: currentTheme.isDark
                    ? (currentTheme.cardBackground || '#212D3B')
                    : '#FFFFFF',
                  borderTopColor: currentTheme.isDark
                    ? (currentTheme.border || '#2C3A4B')
                    : '#EFF2F6',
                  shadowOpacity: currentTheme.isDark ? 0 : 0.05,
                  elevation: currentTheme.isDark ? 0 : 6,
                },
              ]}
            >
              {/* 1. Bouton Vendre le coupon (si actif) */}
              {canSellCoupon && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSellCoupon}
                  style={[
                    styles.sellButton,
                    { backgroundColor: currentTheme.cashoutButton?.bg || (currentTheme.isDark ? '#22C55E' : '#1E4BB5') },
                  ]}
                >
                  <Text
                    style={[
                      styles.sellButtonText,
                      { color: currentTheme.cashoutButton?.text || '#FFFFFF' },
                    ]}
                  >
                    Vendre pour : {couponWithSell.sellPrice || '15000'} ₣
                  </Text>
                </TouchableOpacity>
              )}

              {/* 2. Bouton Dupliquer le coupon - Masqué si statut Payé / Gagné / Perdu */}
              {canDuplicate && (
                <DuplicateCouponButton
                  onPress={handleDuplicateCoupon}
                  theme={currentTheme}
                />
              )}
            </View>
          </View>
        )}
      </View>

      {/* Options Bottom Sheet */}
      <BetOptionsBottomSheet
        visible={optionsVisible}
        coupon={coupon}
        onClose={() => setOptionsVisible(false)}
        onViewDetail={() => setOptionsVisible(false)}
        onSaveCoupon={handleSaveCoupon}
      />

      {/* Save Coupon Modal */}
      <SaveCouponModal
        visible={isSaveModalVisible}
        couponCode={savedCouponCode}
        onClose={() => setIsSaveModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export { TicketDetailsScreen as BetDetailTicketScreen };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2F6',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: 0,
    position: 'relative',
  },
  contentScrollView: {
    flexGrow: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#EEF2F6',
    overflow: 'hidden',
    position: 'relative',
  },
  screenRoot: {
    width: '100%',
    flex: 1,
    backgroundColor: '#EEF2F6',
    overflow: 'hidden',
    position: 'relative',
  },
  contentWrapper: {
    width: '100%',
    flex: 1,
    backgroundColor: '#EEF2F6',
    overflow: 'hidden',
    position: 'relative',
  },
  header: {
    height: 52,
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    zIndex: 10,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A2B49',
    letterSpacing: -0.2,
    fontFamily: Typography.fontFamily,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  typeBold: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  idNumberText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionBtn: {
    padding: 6,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 8, // Réduit de 16px/12px à 8px pour coller davantage aux bords
    paddingTop: 10,
    paddingBottom: 20,
  },
  // 2. CARTE PRINCIPALE (Sans bordure parasite pour un visuel épuré)
  whiteMainCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
  },
  mainTicketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    marginBottom: 16,
  },
  // 3. LIGNES D'INFORMATIONS (Cote, Mise, Gains, Statut)
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4, // Alignement propre du texte interne
  },
  summarySection: {
    paddingHorizontal: 10, // Réduction du padding interne gauche/droite (passé de 16px à 10px)
    paddingTop: 14,
    paddingBottom: 14,
  },
  summarySectionBottom: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  topDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  ticketDateText: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#7B8A9E',
    fontFamily: Typography.fontFamily,
  },
  liveHeaderBadge: {
    backgroundColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 8,
    gap: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  liveHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  createdDate: {
    fontSize: 12.5,
    fontWeight: '400',
    color: '#7B8A9E',
    fontFamily: Typography.fontFamily,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 4, // Alignement propre du texte interne
  },
  summaryLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontFamily: Typography.fontFamily,
    fontWeight: '400',
  },
  boldValue: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  wonPayoutText: {
    color: '#16A34A',
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  statusPayeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValidationCirclePaye: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusPayeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    fontFamily: Typography.fontFamily,
  },
  statusBadgeLostWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValidationCircleLost: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusLostText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
    fontFamily: Typography.fontFamily,
  },
  statusBadgeAcceptWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusValidationCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#2A75E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statusAcceptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A75E6',
    fontFamily: Typography.fontFamily,
  },
  lostPayoutText: {
    color: '#E53935',
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  eventCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  eventCountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  combineEventIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  eventCountLabel: {
    fontSize: 16,
    color: '#101E33',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
  },
  eventCountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101E33',
    fontFamily: Typography.fontFamily,
  },
  eventCountStatus: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    textAlign: 'right',
  },
  cashoutContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 14,
  },
  cashoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
    letterSpacing: 0.3,
    fontFamily: Typography.fontFamily,
  },
  bottomDockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  bottomDockContainer: {
    width: '100%',
    maxWidth: 600,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
  },
  sellButton: {
    backgroundColor: '#1E4BB5',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  sellButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  duplicateButton: {
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  duplicateButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
});
