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
import { TicketPerforation } from '../components/TicketPerforation';
import { MatchEventCard } from '../components/MatchEventCard';
import { WonMatchEventCard } from '../components/WonMatchEventCard';
import { BetOptionsBottomSheet } from '../components/BetOptionsBottomSheet';
import { ScoreEditorModal } from '../components/ScoreEditorModal';
import { MatchEvent } from '../types/bet';

export default function BetDetailTicketScreen({ route, navigation }: any) {
  const couponId = route?.params?.couponId;
  const { coupons, executeCashout, duplicateCoupon } = useBetStore();

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);

  // Find active coupon or fallback to first
  const coupon = coupons.find((c) => c.id === couponId) || coupons[0];

  if (!coupon) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Coupon introuvable ou supprimé.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isWon =
    coupon.status === 'Payé' ||
    coupon.status === 'Gagné' ||
    coupon.status === 'Gain' ||
    (coupon.completedCount === coupon.eventsCount &&
      coupon.events.length > 0 &&
      coupon.events.every((e) => e.status === 'Gain' || e.status === 'Gagné'));

  const handleNotificationPress = () => {
    Alert.alert(
      'Notification activée',
      `Vous recevrez des alertes en direct pour les résultats du coupon № ${coupon.id}.`
    );
  };

  const handleCashout = () => {
    const amount = coupon.cashoutAmount || Math.round(coupon.stake * 0.95);
    Alert.alert(
      'Confirmer la vente (Cashout)',
      `Vendre ce coupon immédiatement pour ${amount.toLocaleString('fr-FR')} ₣ ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vendre',
          style: 'default',
          onPress: () => {
            executeCashout(coupon.id);
            Alert.alert('Vente effectuée', `Votre compte a été crédité de ${amount.toLocaleString('fr-FR')} ₣.`);
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

  const handleEventPress = (event: MatchEvent) => {
    setSelectedEvent(event);
    setScoreModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Top Bar Header : Titre exact "Détails du", pas de cloche si payé/terminé */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Détails du</Text>

        <View style={styles.headerActions}>
          {/* Uniquement si le pari n'est pas encore dénoué, afficher la cloche */}
          {!isWon && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleNotificationPress}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={21} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}

          {/* Menu contextuel vertical ⋮ toujours accessible */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setOptionsVisible(true)}
            accessibilityLabel="Options du coupon"
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* 2. White Perforated Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Section Résumé du Billet */}
          <View style={styles.summarySection}>
            <Text style={styles.createdDate}>{coupon.createdAt}</Text>
            <Text style={styles.betTitle}>
              {coupon.type} <Text style={styles.betNumber}>№ {coupon.id}</Text>
            </Text>

            <View style={styles.separatorLine} />

            {/* Nombre d'événements avec compteur exact "2 de 2 terminés" ou "0 de 2 terminés" */}
            <View style={styles.summaryRow}>
              <View style={styles.rowLeftWithIcon}>
                <MaterialCommunityIcons
                  name="layers-outline"
                  size={16}
                  color={Colors.primaryAccent}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.summaryLabel}>Nombre d'événements : {coupon.eventsCount}</Text>
              </View>
              <Text style={styles.subInfoText}>
                {coupon.completedCount} de {coupon.eventsCount} terminés
              </Text>
            </View>

            {/* Cote */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cote :</Text>
              <Text style={styles.boldValue}>{coupon.totalOdds.toLocaleString('fr-FR')}</Text>
            </View>

            {/* Mise */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mise :</Text>
              <Text style={styles.boldValue}>{coupon.stake.toLocaleString('fr-FR')} ₣</Text>
            </View>

            {/* Gains / Gains potentiels : Libellé "Gains :" en vert vif si payé */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isWon ? 'Gains :' : 'Gains potentiels :'}</Text>
              <Text style={[styles.boldValue, isWon && styles.wonPayoutText]}>
                {(isWon && coupon.actualPayout ? coupon.actualPayout : coupon.potentialPayout).toLocaleString(
                  'fr-FR'
                )}{' '}
                ₣
              </Text>
            </View>

            {/* Statut du coupon : Layout transparent à plat sans fond */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Statut :</Text>
              {isWon ? (
                <View style={styles.statusPayeWrap}>
                  <Ionicons name="checkmark-circle" size={16} color="#22C55E" style={{ marginRight: 4 }} />
                  <Text style={styles.statusPayeText}>Payé</Text>
                </View>
              ) : (
                <View style={styles.statusBadgeAcceptWrap}>
                  <Ionicons name="checkmark-circle" size={16} color="#1E40AF" style={{ marginRight: 5 }} />
                  <Text style={styles.statusAcceptText}>Accepté</Text>
                </View>
              )}
            </View>
          </View>

          {/* Perforation avec encoches concaves parfaitement connectées */}
          <TicketPerforation
            backgroundColor="#F1F5F9"
            ticketColor="#FFFFFF"
            notchSize={18}
          />

          {/* 3. Liste des Sélections / Événements Sportifs */}
          {coupon.events.map((event, index) => (
            <React.Fragment key={event.id}>
              {isWon ? (
                <WonMatchEventCard
                  event={event}
                  onPress={() => handleEventPress(event)}
                />
              ) : (
                <MatchEventCard
                  event={event}
                  isWon={isWon}
                  onPress={() => handleEventPress(event)}
                />
              )}

              {/* Perforation Divider between events */}
              {index < coupon.events.length - 1 && (
                <TicketPerforation
                  backgroundColor="#F1F5F9"
                  ticketColor="#FFFFFF"
                  notchSize={18}
                />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* 4. Cashout / Vente Section (uniquement si le pari est accepté et non payé) */}
        {coupon.isForSale && coupon.status === 'Accepté' && (
          <TouchableOpacity style={styles.cashoutBtn} onPress={handleCashout} activeOpacity={0.85}>
            <Ionicons name="pricetag" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.cashoutBtnText}>
              VENDRE LE COUPON POUR {(coupon.cashoutAmount || coupon.stake * 0.95).toLocaleString('fr-FR')} ₣
            </Text>
          </TouchableOpacity>
        )}

        {/* 5. Bouton d'action « Dupliquer » : masqué sur un coupon terminé / Payé */}
        {!isWon && coupon.status !== 'Payé' && (
          <TouchableOpacity
            style={styles.duplicateButton}
            onPress={handleDuplicate}
            activeOpacity={0.85}
          >
            <Text style={styles.duplicateButtonText}>DUPLIQUER LE COUPON DE PARI</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Contextual Options Bottom Sheet */}
      <BetOptionsBottomSheet
        visible={optionsVisible}
        coupon={coupon}
        onClose={() => setOptionsVisible(false)}
        onViewDetail={() => setOptionsVisible(false)}
      />

      {/* Score Editor Modal */}
      <ScoreEditorModal
        visible={scoreModalVisible}
        coupon={coupon}
        onClose={() => setScoreModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Gris bleuté clair fidèle aux captures
  },
  header: {
    height: 52,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
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
  scrollArea: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 88, // Calibré pour ne pas être masqué par la barre fixe persistante
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 14,
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  createdDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  betNumber: {
    fontWeight: '700',
    color: '#0F172A',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4.5,
  },
  rowLeftWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  subInfoText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  boldValue: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#0F172A',
  },
  wonPayoutText: {
    color: '#22C55E', // Vert pur #22C55E
    fontSize: 14.5,
    fontWeight: '500', // Poids moyen 500 identique à la cote et la mise
  },
  statusPayeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusPayeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22C55E', // Texte vert pur sur fond transparent
  },
  statusBadgeAcceptWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAcceptText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  cashoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cashoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
    letterSpacing: 0.3,
  },
  duplicateButton: {
    backgroundColor: '#DBEAFE', // Fond bleu pastel exact
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
    marginBottom: 12,
  },
  duplicateButtonText: {
    color: '#1E40AF', // Texte bleu roi en majuscules sans icône
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
