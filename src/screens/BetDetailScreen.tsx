import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { CutoutTicketCard, TicketCutoutDivider } from '../components/CutoutTicketCard';
import { ActionBottomSheet } from '../components/ActionBottomSheet';
import { StatusBadge } from '../components/StatusBadge';

export default function BetDetailScreen({ route, navigation }: any) {
  const couponId = route?.params?.couponId || '85517683766';
  const { coupons, validateCouponWithResult, executeCashout, duplicateCoupon } = useBetStore();

  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  // Find the active coupon
  const coupon = coupons.find((c) => c.id === couponId) || coupons[0];

  if (!coupon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du pari</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Coupon introuvable ou supprimé.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isWon = coupon.status === 'Payé' || coupon.status === 'Gagné';

  const handleToggleWinLoss = () => {
    validateCouponWithResult(coupon.id, !isWon);
  };

  const handleCashout = () => {
    const amount = coupon.cashoutAmount || Math.round(coupon.stake * 0.95);
    Alert.alert(
      'Confirmer la vente (Cashout)',
      `Vendre ce coupon immédiatement pour ${amount.toLocaleString('fr-FR')} F ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vendre',
          style: 'default',
          onPress: () => {
            executeCashout(coupon.id);
            Alert.alert('Vente effectuée', `Votre compte a été crédité de ${amount.toLocaleString('fr-FR')} F.`);
          },
        },
      ]
    );
  };

  const handleDuplicate = () => {
    duplicateCoupon(coupon.id);
    Alert.alert(
      'Coupon dupliqué !',
      'Toutes les sélections ont été rechargées dans votre panier de paris.',
      [
        {
          text: 'Voir le studio',
          onPress: () => navigation.navigate('StudioCreation'),
        },
        { text: 'OK' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du pari</Text>
        <View style={styles.headerActions}>
          {/* Quick Win/Accept Toggle for testing & demo */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleToggleWinLoss}
            accessibilityLabel="Basculer statut"
          >
            <Ionicons
              name={isWon ? 'refresh-circle' : 'checkmark-circle'}
              size={24}
              color={isWon ? Colors.primaryAccent : Colors.success}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setActionSheetVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Ticket Card Container */}
        <CutoutTicketCard style={styles.ticketCard}>
          {/* Header Summary Section */}
          <View style={styles.summarySection}>
            <Text style={styles.createdDate}>{coupon.createdAt}</Text>
            <Text style={styles.betTitle}>
              {coupon.type} <Text style={styles.betNumber}>№ {coupon.id}</Text>
            </Text>

            <View style={styles.divider} />

            {/* Event Count Row */}
            <View style={styles.rowBetween}>
              <View style={styles.iconLabel}>
                <Ionicons name="receipt-outline" size={16} color={Colors.primaryAccent} />
                <Text style={styles.labelText}>Nombre d'événements : {coupon.eventsCount}</Text>
              </View>
              <Text style={styles.subInfoText}>
                {coupon.completedCount} de {coupon.eventsCount} terminés
              </Text>
            </View>

            {/* Odds Row */}
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>Cote :</Text>
              <Text style={styles.boldValue}>{coupon.totalOdds.toLocaleString('fr-FR')}</Text>
            </View>

            {/* Stake Row */}
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>Mise :</Text>
              <Text style={styles.boldValue}>{coupon.stake.toLocaleString('fr-FR')} F</Text>
            </View>

            {/* Payout Row */}
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>{isWon ? 'Gains :' : 'Gains potentiels :'}</Text>
              <Text style={[styles.boldValue, isWon && { color: Colors.success, fontSize: 16 }]}>
                {(isWon && coupon.actualPayout ? coupon.actualPayout : coupon.potentialPayout).toLocaleString(
                  'fr-FR'
                )}{' '}
                F
              </Text>
            </View>

            {/* Status Row */}
            <View style={styles.rowBetween}>
              <Text style={styles.labelText}>Statut :</Text>
              <StatusBadge status={coupon.status} />
            </View>
          </View>

          {/* Perforated Divider */}
          <TicketCutoutDivider />

          {/* List of Events / Manches */}
          {coupon.events.map((event, index) => (
            <React.Fragment key={event.id}>
              <View style={styles.eventSection}>
                {/* Event Header */}
                <View style={styles.eventHeader}>
                  <MaterialCommunityIcons
                    name={
                      event.gameCategory === 'poker'
                        ? 'gamepad-variant-outline'
                        : event.gameCategory === 'mortalkombat'
                        ? 'sword-cross'
                        : 'soccer'
                    }
                    size={22}
                    color={Colors.primaryAccent}
                  />
                  <View style={styles.eventTitles}>
                    <Text style={styles.eventGame}>{event.league}</Text>
                    <Text style={styles.eventDate}>{event.date}</Text>
                  </View>
                </View>

                {/* Team Names if Sports / MK */}
                {event.homeTeam?.name && event.awayTeam?.name && (
                  <View style={styles.teamsRow}>
                    <Text style={styles.teamName}>{event.homeTeam.name}</Text>
                    <Text style={styles.vsBadge}>VS</Text>
                    <Text style={styles.teamName}>{event.awayTeam.name}</Text>
                  </View>
                )}

                {/* Optional Central Badge (e.g. POKE) */}
                {event.badge && !isWon && (
                  <View style={styles.badgeCenterWrap}>
                    <Text style={styles.gamePill}>{event.badge}</Text>
                  </View>
                )}

                {/* IF WON & POKER : Display Realistic Hands & Board */}
                {isWon && event.pokerResult && (
                  <View style={styles.pokerDrawContainer}>
                    <Text style={styles.pokeHeader}>POKE</Text>
                    {event.pokerResult.hands.map((h) => (
                      <Text key={h.id} style={styles.pokerHandLine}>
                        Main {h.id} : {h.cards}
                      </Text>
                    ))}
                    <Text style={[styles.pokerHandLine, styles.pokerTableLine]}>
                      Table : {event.pokerResult.board}
                    </Text>
                    <Text style={[styles.pokerHandLine, styles.pokerWinnerLine]}>
                      Gagnant : {event.pokerResult.winnerLabel}
                    </Text>
                  </View>
                )}

                {/* IF WON & MK : Display Realistic Rounds */}
                {isWon && event.mkResult && (
                  <View style={styles.mkResultContainer}>
                    <Text style={styles.mkHeader}>RÉSULTAT DU COMBAT</Text>
                    {event.mkResult.rounds.map((r) => (
                      <Text key={r.roundNum} style={styles.mkRoundLine}>
                        Round {r.roundNum} : {r.winner} ({r.victoryType})
                      </Text>
                    ))}
                    <Text style={styles.mkWinnerLine}>Vainqueur : {event.mkResult.finalWinner}</Text>
                  </View>
                )}

                {/* Prediction & Odd */}
                <View style={styles.rowBetween}>
                  <Text style={styles.predictionText}>{event.prediction}</Text>
                  <Text style={styles.oddText}>{event.odd}</Text>
                </View>

                {/* Event Status */}
                <View style={styles.rowBetween}>
                  <Text style={styles.eventLabel}>Statut :</Text>
                  <Text
                    style={[
                      styles.eventStatusText,
                      { color: isWon ? Colors.success : Colors.primaryAccent },
                    ]}
                  >
                    {isWon ? 'Gain' : event.status}
                  </Text>
                </View>

                {/* Supplementary Info (PB code, etc.) */}
                {event.roundCode && (
                  <View style={styles.infoSuppBlock}>
                    <Text style={styles.infoSuppLabel}>Informations supplémentaires :</Text>
                    <Text style={styles.roundCode}>{event.roundCode}</Text>
                  </View>
                )}
              </View>

              {/* Separator between items */}
              {index < coupon.events.length - 1 && <TicketCutoutDivider />}
            </React.Fragment>
          ))}
        </CutoutTicketCard>

        {/* Cashout Button if Available */}
        {coupon.isForSale && coupon.status === 'Accepté' && (
          <TouchableOpacity style={styles.cashoutBtn} onPress={handleCashout}>
            <Ionicons name="pricetag" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.cashoutBtnText}>
              VENDRE LE COUPON POUR {(coupon.cashoutAmount || coupon.stake * 0.95).toLocaleString('fr-FR')} F
            </Text>
          </TouchableOpacity>
        )}

        {/* Duplicate Button */}
        <TouchableOpacity style={styles.duplicateButton} onPress={handleDuplicate}>
          <Ionicons name="copy-outline" size={18} color={Colors.primaryAccent} style={{ marginRight: 6 }} />
          <Text style={styles.duplicateButtonText}>DUPLIQUER LE COUPON DE PARI</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Action Bottom Sheet */}
      <ActionBottomSheet
        visible={actionSheetVisible}
        coupon={coupon}
        onClose={() => setActionSheetVisible(false)}
        onViewDetail={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollArea: {
    padding: 16,
    paddingBottom: 50,
  },
  ticketCard: {
    marginBottom: 16,
  },
  summarySection: {
    padding: 16,
  },
  createdDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  betTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  betNumber: {
    fontWeight: '600',
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  subInfoText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  boldValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  eventSection: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventTitles: {
    flex: 1,
  },
  eventGame: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  eventDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vsBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSubtle,
  },
  badgeCenterWrap: {
    alignItems: 'center',
    marginVertical: 6,
  },
  gamePill: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  pokerDrawContainer: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  pokeHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pokerHandLine: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    fontWeight: '500',
  },
  pokerTableLine: {
    marginTop: 4,
    fontWeight: '700',
  },
  pokerWinnerLine: {
    marginTop: 2,
    fontWeight: '700',
    color: Colors.success,
  },
  mkResultContainer: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  mkHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.dangerDark,
    letterSpacing: 1,
    marginBottom: 4,
  },
  mkRoundLine: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
    fontWeight: '600',
  },
  mkWinnerLine: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.success,
    marginTop: 4,
  },
  predictionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  oddText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  eventLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  eventStatusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoSuppBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoSuppLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  roundCode: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  cashoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  cashoutBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  duplicateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    paddingVertical: 14,
  },
  duplicateButtonText: {
    color: Colors.primaryAccent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
