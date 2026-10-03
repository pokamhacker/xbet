import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// Imports projet
import { AppTheme } from './src/theme/themes';
import { useThemeStore } from './src/stores/themeStore';
import { useBetStore } from './src/store/useBetStore';
import { useCouponStore } from './src/store/couponStore';
import { BetSlip, MatchEvent } from './src/types/bet';
import { TicketDivider } from './src/components/TicketDivider';
import { TicketPerforation } from './src/components/TicketPerforation';
import { MatchScoreView } from './src/components/MatchScoreView';
import { useResponsive } from './src/utils/responsive';
import { formatBetDate } from './src/utils/dateFormatter';
import { DuplicateCouponButton } from './src/components/DuplicateCouponButton';

// ---------------------------------------------------------------------------
// Types de données
// ---------------------------------------------------------------------------

export interface BetEventSelection {
  league: string; // "Football . Espagne. La Liga"
  date: string; // "31 août 2026 (18:30)"
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  scoreFinal: string; // "1:0"
  scoreDetail?: string; // "(1:0,0:0)"
  market: string; // "Deux équipes vont marquer. Non"
  odd: string; // "1.523"
  status: 'gagne' | 'perdu' | 'en_cours';
}

export interface BetTicket {
  placedAt: string; // "31.08.2026 (10:02)"
  type: string; // "Combiné"
  ticketNumber: string; // "86446782967"
  eventsCount: number;
  eventsFinished: number;
  totalOdd: string; // "2.223"
  stake: string; // "500 000 ₣"
  winnings: string; // "1 111 790 ₣"
  status: 'paye' | 'en_attente' | 'perdu';
  selections: BetEventSelection[];
}

export interface Props {
  theme?: AppTheme;
  ticket?: BetTicket;
  onBack?: () => void;
  onMore?: () => void;
  route?: any;
  navigation?: any;
}

// ---------------------------------------------------------------------------
// Mappeur de données : BetSlip (du projet) -> BetTicket (du composant)
// ---------------------------------------------------------------------------

export function mapBetSlipToBetTicket(slip: BetSlip): BetTicket {
  const isWon =
    slip.status === 'Payé' ||
    slip.status === 'Gagné' ||
    slip.status === 'Gain';
  const isLost = slip.status === 'Perdu';

  const ticketStatus: BetTicket['status'] = isWon
    ? 'paye'
    : isLost
      ? 'perdu'
      : 'en_attente';

  const selections: BetEventSelection[] = (slip.events || []).map((ev: MatchEvent) => {
    const isEventWon =
      ev.status === 'Payé' || ev.status === 'Gagné' || ev.status === 'Gain';
    const isEventLost = ev.status === 'Perdu';
    const status: BetEventSelection['status'] = isEventWon
      ? 'gagne'
      : isEventLost
        ? 'perdu'
        : 'en_cours';

    const homeName =
      typeof ev.homeTeam === 'string'
        ? ev.homeTeam
        : ev.homeTeam?.name || 'Équipe 1';
    const awayName =
      typeof ev.awayTeam === 'string'
        ? ev.awayTeam
        : ev.awayTeam?.name || 'Équipe 2';
    const homeLogo = typeof ev.homeTeam === 'object' ? ev.homeTeam?.logo : undefined;
    const awayLogo = typeof ev.awayTeam === 'object' ? ev.awayTeam?.logo : undefined;

    return {
      league: `${ev.sport ? ev.sport + ' . ' : ''}${ev.league || ''}`,
      date: formatBetDate(ev.date || ''),
      homeTeam: homeName,
      awayTeam: awayName,
      homeCrest: homeLogo,
      awayCrest: awayLogo,
      scoreFinal: ev.actualScore || '-:-',
      scoreDetail: ev.halftimeScore,
      market: ev.prediction || '',
      odd: typeof ev.odd === 'number' ? ev.odd.toFixed(3) : String(ev.odd || '1.000'),
      status,
    };
  });

  return {
    placedAt: formatBetDate(slip.createdAt || ''),
    type: slip.type || (selections.length > 1 ? 'Combiné' : 'Simple'),
    ticketNumber: slip.id || '',
    eventsCount: slip.eventsCount || selections.length,
    eventsFinished:
      slip.completedCount ??
      selections.filter((s) => s.status !== 'en_cours').length,
    totalOdd:
      typeof slip.totalOdds === 'number'
        ? slip.totalOdds.toFixed(3)
        : String(slip.totalOdds || '1.000'),
    stake: `${Number(slip.stake || 0).toLocaleString('fr-FR')} ₣`,
    winnings: `${Number(
      slip.actualPayout || slip.potentialPayout || 0
    ).toLocaleString('fr-FR')} ₣`,
    status: ticketStatus,
    selections,
  };
}

// Ticket de secours par défaut si aucun n'est trouvé
const DEFAULT_FALLBACK_TICKET: BetTicket = {
  placedAt: '31.08.2026 (10:02)',
  type: 'Combiné',
  ticketNumber: '86446782967',
  eventsCount: 2,
  eventsFinished: 2,
  totalOdd: '2.223',
  stake: '500 000 ₣',
  winnings: '1 111 790 ₣',
  status: 'paye',
  selections: [
    {
      league: 'Football . Espagne. La Liga',
      date: '31 août 2026 (18:30)',
      homeTeam: 'Real Madrid',
      awayTeam: 'FC Barcelone',
      scoreFinal: '1:0',
      scoreDetail: '(1:0,0:0)',
      market: 'Deux équipes vont marquer. Non',
      odd: '1.523',
      status: 'gagne',
    },
    {
      league: 'Football . Angleterre. Premier League',
      date: '31 août 2026 (20:45)',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      scoreFinal: '2:1',
      scoreDetail: '(1:0,1:1)',
      market: 'Victoire 1',
      odd: '1.459',
      status: 'gagne',
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers d'affichage du statut
// ---------------------------------------------------------------------------

function statusColor(theme: AppTheme, status: BetEventSelection['status'] | BetTicket['status']) {
  switch (status) {
    case 'gagne':
    case 'paye':
      return theme.status.gagne;
    case 'perdu':
      return theme.status.perdu;
    default:
      return theme.status.accepte;
  }
}

function statusLabel(status: BetEventSelection['status'] | BetTicket['status']) {
  switch (status) {
    case 'gagne':
      return 'Gagné';
    case 'paye':
      return 'Payé';
    case 'perdu':
      return 'Perdu';
    case 'en_attente':
      return 'Accepté';
    default:
      return 'En cours';
  }
}

// ---------------------------------------------------------------------------
// Composant Principal
// ---------------------------------------------------------------------------

export default function BetDetailScreen({
  theme: propTheme,
  ticket: propTicket,
  onBack,
  onMore,
  route,
  navigation,
}: Props) {
  // 1. Thème dynamique depuis le store
  const storeTheme = useThemeStore((state) => state.currentTheme);
  const theme = propTheme || storeTheme;
  const { insets, isSmallDevice, isTablet, isLandscape, font, moderateScale, scale, contentContainerStyle } = useResponsive();
  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset = insets.bottom > 0 ? Math.max(insets.bottom, androidBottomPad) : (Platform.OS === 'ios' ? 20 : androidBottomPad);
  const bottomBarHeight = 56 + bottomInset;

  // 2. Stores de données du projet
  const { coupons, duplicateCoupon, executeCashout } = useBetStore();
  const { duplicateFromCoupon } = useCouponStore();

  // 3. Résolution du ticket actuel
  const ticket: BetTicket = React.useMemo(() => {
    if (propTicket) return propTicket;
    if (route?.params?.ticket) return route.params.ticket;

    const couponId = route?.params?.couponId;
    const foundCoupon =
      (couponId ? coupons.find((c) => c.id === couponId) : null) || coupons[0];

    if (foundCoupon) {
      return mapBetSlipToBetTicket(foundCoupon);
    }

    return DEFAULT_FALLBACK_TICKET;
  }, [propTicket, route?.params, coupons]);

  // 4. Handlers d'interaction
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const handleDuplicate = () => {
    const couponId = ticket.ticketNumber;
    const foundCoupon = coupons.find((c) => c.id === couponId);
    if (foundCoupon) {
      duplicateCoupon(foundCoupon.id);
      duplicateFromCoupon(foundCoupon);
    }
    navigation?.navigate?.('MainTabs', { screen: 'CouponTab' });
  };

  const handleDuplicateCoupon = handleDuplicate;

  const foundCoupon = React.useMemo(() => {
    const couponId = route?.params?.couponId || ticket.ticketNumber;
    return (couponId ? coupons.find((c) => c.id === couponId) : null) || coupons[0];
  }, [route?.params, ticket.ticketNumber, coupons]);

  const handleSellCoupon = () => {
    if (!foundCoupon) return;
    const rawAmount = (foundCoupon as any).sellPrice || foundCoupon.cashoutAmount || Math.round(foundCoupon.stake * 0.95);
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
            executeCashout(foundCoupon.id);
            Alert.alert('Vente effectuée', `Votre compte a été crédité de ${amountStr} ₣.`);
          },
        },
      ]
    );
  };

  const coupon = React.useMemo(() => {
    const canSell = (ticket as any).canSell !== undefined
      ? (ticket as any).canSell
      : Boolean(foundCoupon?.isForSale && foundCoupon?.status === 'Accepté');
    const sellPrice = (ticket as any).sellPrice || (foundCoupon?.cashoutAmount ? foundCoupon.cashoutAmount.toLocaleString('fr-FR') : (foundCoupon?.stake ? Math.round(foundCoupon.stake * 0.95).toLocaleString('fr-FR') : '15000'));
    return {
      canSell,
      sellPrice,
    };
  }, [ticket, foundCoupon]);

  const isTicketLive = Boolean(
    foundCoupon?.isLive ||
    foundCoupon?.events?.some((e) => e.isLive) ||
    (ticket as any)?.isLive
  );

  const handleMore = () => {
    if (onMore) {
      onMore();
      return;
    }

    Alert.alert(
      `Coupon № ${ticket.ticketNumber}`,
      'Que souhaitez-vous faire ?',
      [
        {
          text: 'Copier le numéro de coupon',
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(ticket.ticketNumber);
              Alert.alert('Copié', 'Numéro de coupon copié dans le presse-papier.');
            } catch {
              // noop
            }
          },
        },
        {
          text: 'Dupliquer le coupon',
          onPress: handleDuplicate,
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.screen, { marginBottom: bottomBarHeight }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBtn}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Détails du pari</Text>

        <TouchableOpacity
          onPress={handleMore}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBtn}
          accessibilityLabel="Options"
        >
          <Ionicons name="ellipsis-vertical" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Contenu Défilant */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {/* Carte d'en-tête du coupon */}
        <View style={styles.ticketHeaderCard}>
          <View style={styles.ticketHeaderRow}>
            <View style={styles.ticketIconBubble}>
              {ticket.type === 'Combiné' ? (
                <Image
                  source={require('./assets/icons/cvv1.png')}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="receipt-outline" size={22} color={theme.textSecondary} />
              )}
              {ticket.status === 'paye' && (
                <View style={[styles.checkBadge, { backgroundColor: theme.status.gagne }]}>
                  <Ionicons name="checkmark" size={11} color={theme.textWhite} />
                </View>
              )}
              {ticket.status === 'en_attente' && (
                <View style={[styles.checkBadge, { backgroundColor: theme.status.accepte }]}>
                  <Ionicons name="checkmark" size={11} color={theme.textWhite} />
                </View>
              )}
            </View>

            <View style={styles.ticketInfoCol}>
              <View style={styles.topDateRow}>
                <Text style={styles.ticketMeta}>{formatBetDate(ticket.placedAt)}</Text>
                {isTicketLive && (
                  <View style={styles.liveHeaderBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveHeaderBadgeText}>En direct</Text>
                  </View>
                )}
              </View>
              <Text style={styles.ticketType}>{ticket.type}</Text>
              <Text style={styles.ticketMeta} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                Nº {ticket.ticketNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Séparateur 1 : Entre le bloc supérieur et le résumé du ticket */}
        <TicketDivider
          backgroundColor={theme.background}
          dotColor={theme.isDark ? theme.border : '#CBD5E1'}
          notchSize={12}
        />

        {/* Bloc Résumé Financier */}
        <View style={styles.summaryBlock}>
          {ticket.type === 'Combiné' && (
            <SummaryRow
              theme={theme}
              customIcon={
                <Image
                  source={require('./assets/icons/cvv1.png')}
                  style={{ width: 22, height: 22, marginRight: 8 }}
                  resizeMode="contain"
                />
              }
              label="Nombre d'événements :"
              value={`${ticket.eventsFinished} sur ${ticket.eventsCount} terminés`}
              labelBold
              valueBold
              fontSize={16}
            />
          )}
          <SummaryRow theme={theme} label="Cotes :" value={ticket.totalOdd} valueBold />
          <SummaryRow theme={theme} label="Mise :" value={ticket.stake} valueBold />
          {ticket.status !== 'perdu' && (
            <SummaryRow
              theme={theme}
              label={ticket.status === 'paye' ? 'Gain :' : 'Gains potentiels :'}
              value={ticket.winnings}
              valueColor={ticket.status === 'paye' ? (theme.status.gagne || theme.status.paye || '#22C55E') : theme.textPrimary}
              valueBold
            />
          )}
          <SummaryRow
            theme={theme}
            label="Statut :"
            value={statusLabel(ticket.status)}
            valueColor={statusColor(theme, ticket.status)}
            valueBold
            noDivider
            badgeIcon="checkmark-circle"
          />
        </View>

        {/* Séparateur 2 & Section Cartes par événement (adaptés selon le nombre d'événements) */}
        {ticket.selections && ticket.selections.length > 0 && (
          <>
            {/* Séparateur 2 : Entre le résumé du ticket et le 1er match */}
            <TicketDivider
              backgroundColor={theme.background}
              dotColor={theme.isDark ? theme.border : '#CBD5E1'}
              notchSize={14}
            />

            {ticket.selections.map((sel, idx) => (
              <React.Fragment key={idx}>
                <View style={styles.eventCard}>
                  {/* Ligne Ligue + Date */}
                  <View style={styles.eventCardTop}>
                    <Ionicons name="football-outline" size={18} color={theme.textMuted} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={styles.eventLeague} numberOfLines={1}>
                        {sel.league}
                      </Text>
                      <Text style={styles.eventDate}>{formatBetDate(sel.date)}</Text>
                    </View>
                  </View>

                  {/* Ligne Match Pixel-Perfect avec Score et Logos rigoureusement alignés */}
                  <MatchScoreView
                    homeTeamName={sel.homeTeam}
                    homeTeamLogo={sel.homeCrest}
                    awayTeamName={sel.awayTeam}
                    awayTeamLogo={sel.awayCrest}
                    mainScore={sel.scoreFinal ? sel.scoreFinal.replace(/\s*[:\-]\s*/g, ' : ') : '- : -'}
                    detailedScore={
                      sel.scoreDetail
                        ? sel.scoreDetail.includes('(')
                          ? sel.scoreDetail
                          : `(${sel.scoreDetail})`
                        : undefined
                    }
                    textColor={theme.textPrimary}
                    detailedScoreColor={theme.textMuted}
                  />

                  {/* Pronostic & Cote */}
                  <View style={styles.marketRow}>
                    <Text style={styles.marketLabel} numberOfLines={2}>
                      {sel.market}
                    </Text>
                    <Text style={styles.marketOdd}>{sel.odd}</Text>
                  </View>

                  {/* Statut Événement */}
                  <View style={styles.marketRow}>
                    <Text style={styles.marketLabel}>Statut :</Text>
                    <Text style={[styles.marketOdd, { color: statusColor(theme, sel.status) }]}>
                      {statusLabel(sel.status)}
                    </Text>
                  </View>
                </View>

                {/* Séparateur entre les matchs uniquement si idx < ticket.selections.length - 1 */}
                {idx < ticket.selections.length - 1 && (
                  <TicketDivider
                    backgroundColor={theme.background}
                    dotColor={theme.isDark ? theme.border : '#CBD5E1'}
                    notchSize={12}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </ScrollView>

      {/* Dock fixe ancré au bas de l'écran, au-dessus de la barre de navigation */}
      {(coupon.canSell || (ticket.status !== 'paye' && ticket.status !== 'perdu')) && (
        <View style={[styles.bottomDockWrapper, { bottom: bottomBarHeight }]}>
          <View
            style={[
              styles.bottomDockContainer,
              {
                backgroundColor: theme.isDark ? (theme.cardBackground || '#212D3B') : '#FFFFFF',
                borderTopColor: theme.isDark ? (theme.border || '#2C3A4B') : '#EFF2F6',
                shadowOpacity: theme.isDark ? 0 : 0.05,
                elevation: theme.isDark ? 0 : 8,
              },
            ]}
          >
            {/* 1. Bouton Vendre le coupon (Bleu foncé, positionné AU-DESSUS) */}
            {coupon.canSell && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSellCoupon}
                style={[
                  styles.sellButton,
                  { backgroundColor: theme.cashoutButton?.bg || (theme.isDark ? '#22C55E' : '#1E4BB5') },
                ]}
              >
                <Text
                  style={[
                    styles.sellButtonText,
                    { color: theme.cashoutButton?.text || '#FFFFFF' },
                  ]}
                >
                  Vendre pour : {coupon.sellPrice || '15000'} ₣
                </Text>
              </TouchableOpacity>
            )}

            {/* 2. Bouton Dupliquer le coupon (Masqué si statut Payé / Gagné / Perdu) */}
            {ticket.status !== 'paye' && ticket.status !== 'perdu' && (
              <DuplicateCouponButton
                onPress={handleDuplicateCoupon}
                theme={theme}
              />
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}


// ---------------------------------------------------------------------------
// Sous-composant : Ligne du bloc résumé
// ---------------------------------------------------------------------------

function SummaryRow({
  theme,
  icon,
  customIcon,
  label,
  value,
  valueColor,
  valueBold,
  noDivider,
  badgeIcon,
  labelBold,
  fontSize,
  labelColor,
}: {
  theme: AppTheme;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  customIcon?: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  valueBold?: boolean;
  noDivider?: boolean;
  badgeIcon?: React.ComponentProps<typeof Ionicons>['name'];
  labelBold?: boolean;
  fontSize?: number;
  labelColor?: string;
}) {
  return (
    <View
      style={[
        rowStyles.row,
        {
          borderBottomColor: theme.divider,
          borderBottomWidth: noDivider ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={rowStyles.labelWrap}>
        {customIcon ? (
          customIcon
        ) : icon ? (
          <Ionicons
            name={icon}
            size={16}
            color={theme.textMuted}
            style={{ marginRight: 6 }}
          />
        ) : null}
        <Text
          style={[
            rowStyles.label,
            { color: labelColor ?? (labelBold ? theme.textPrimary : theme.textSecondary) },
            labelBold ? { fontWeight: '700' } : null,
            fontSize ? { fontSize } : null,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {label}
        </Text>
      </View>

      <View style={rowStyles.valueWrap}>
        {badgeIcon && (
          <Ionicons
            name={badgeIcon}
            size={16}
            color={valueColor ?? theme.textPrimary}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={[
            rowStyles.value,
            {
              color: valueColor ?? theme.textPrimary,
              fontWeight: valueBold ? '700' : '400',
            },
            fontSize ? { fontSize } : null,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4, // Alignement propre du texte interne
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4, // Alignement propre du texte interne
  },
  labelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 15,
  },
});

// ---------------------------------------------------------------------------
// Styles Pilotés par le Thème
// ---------------------------------------------------------------------------

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: theme.background || '#F2F4F7',
      overflow: 'hidden',
      position: 'relative',
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 6 : 14,
      paddingBottom: 12,
      backgroundColor: theme.headerBackground,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    headerBtn: {
      padding: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      color: theme.primary,
      fontSize: 17,
      fontWeight: '700',
    },
    scrollContent: {
      paddingHorizontal: 8, // Réduit de 16px/12px à 8px pour coller davantage aux bords
      paddingTop: 10,
      paddingBottom: 20,
    },
    // 2. CARTE BLANCHE PRINCIPALE (Padding interne réduit)
    whiteMainCard: {
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      paddingHorizontal: 10, // Réduction du padding interne gauche/droite (passé de 16px/18px à 10px)
      paddingVertical: 14,   // Conservation du padding haut/bas
      // Effet d'encoche/ticket si applicable
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    // 3. LIGNES D'INFORMATIONS (Cote, Mise, Gains, Statut)
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 4, // Alignement propre du texte interne
    },
    ticketHeaderCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 14,
      marginBottom: 14,
      borderWidth: 0,
      borderColor: 'transparent',
      elevation: 0,
      shadowColor: 'transparent',
    },
    ticketHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ticketIconBubble: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      position: 'relative',
    },
    checkBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    ticketInfoCol: {
      flex: 1,
    },
    topDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    liveHeaderBadge: {
      backgroundColor: '#E53E3E',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
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
    ticketMeta: {
      color: theme.textSecondary,
      fontSize: 12.5,
    },
    ticketType: {
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginVertical: 2,
    },
    summaryBlock: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginBottom: 14,
      borderWidth: 0,
      borderColor: 'transparent',
      elevation: 0,
      shadowColor: 'transparent',
    },
    eventCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 14,
      marginBottom: 14,
      borderWidth: 0,
      borderColor: 'transparent',
      elevation: 0,
      shadowColor: 'transparent',
    },
    eventCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    eventLeague: {
      color: theme.textMuted,
      fontSize: 12,
    },
    eventDate: {
      color: theme.textMuted,
      fontSize: 12,
    },
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    matchScoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
      width: '100%',
    },
    teamContainerHome: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    teamContainerAway: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    teamName: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: '500',
    },
    teamNameHome: {
      textAlign: 'right',
      marginRight: 8,
    },
    teamNameAway: {
      textAlign: 'left',
      marginLeft: 8,
    },
    teamLogo: {
      width: 26,
      height: 26,
      marginHorizontal: 4,
    },
    scoreCenterContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      minWidth: 64,
    },
    mainScoreText: {
      color: theme.textPrimary,
      fontSize: 19,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 1.2,
      lineHeight: 23,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    halfTimeScoreText: {
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 1,
      lineHeight: 13,
    },
    crestPlaceholder: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.border,
      marginHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    crestImage: {
      width: 26,
      height: 26,
      marginHorizontal: 8,
    },
    scoreText: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: '400',
      marginHorizontal: 4,
      minWidth: 36,
      textAlign: 'center',
    },
    scoreDetail: {
      color: theme.textMuted,
      fontSize: 12,
      textAlign: 'center',
      marginTop: 6,
    },
    marketRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.divider,
      paddingTop: 10,
      marginTop: 10,
    },
    marketLabel: {
      color: theme.textPrimary,
      fontSize: 13,
      fontWeight: '500',
      flex: 1,
      paddingRight: 8,
    },
    marketOdd: {
      color: theme.textPrimary,
      fontSize: 13.5,
      fontWeight: '500',
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
      backgroundColor: theme.isDark ? (theme.cardBackground || '#212D3B') : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? (theme.border || '#2C3A4B') : '#EFF2F6',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 5,
      elevation: theme.isDark ? 0 : 8,
    },
    sellButton: {
      backgroundColor: '#1E4BB5', // Bleu foncé officiel
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 10,
    },
    sellButtonText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '700',
      letterSpacing: 0.3,
      textAlign: 'center',
    },
    duplicateButton: {
      backgroundColor: '#E8F1FD', // Bleu pastel / très clair officiel
      borderRadius: 12,           // Bords arrondis doux
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    duplicateButtonText: {
      color: '#2563EB',           // Bleu vif officiel 1xBet
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    standardDivider: {
      height: 1,
      backgroundColor: '#E2E8F0',
      marginVertical: 12,
      width: '100%',
    },
  });
}
