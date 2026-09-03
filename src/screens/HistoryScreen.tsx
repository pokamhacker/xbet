import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { CutoutTicketCard, TicketCutoutDivider } from '../components/CutoutTicketCard';
import { StatusBadge } from '../components/StatusBadge';
import { ActionBottomSheet } from '../components/ActionBottomSheet';
import { BetSlip } from '../types/bet';

export default function HistoryScreen({ navigation }: any) {
  const { balance, coupons, deposit } = useBetStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'1 jour' | '1 semaine' | '1 mois' | 'Tous'>('1 mois');
  const [selectedType, setSelectedType] = useState<'Tous' | 'Vente' | 'Gagné' | 'Perdu' | 'Accepté'>('Tous');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');

  // Bottom Sheet state
  const [activeSheetCoupon, setActiveSheetCoupon] = useState<BetSlip | null>(null);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (selectedType === 'Tous') return true;
      if (selectedType === 'Vente') return c.isForSale || c.status === 'Vendu';
      if (selectedType === 'Gagné') return c.status === 'Payé' || c.status === 'Gagné';
      if (selectedType === 'Perdu') return c.status === 'Perdu';
      if (selectedType === 'Accepté') return c.status === 'Accepté' || c.status === 'En cours';
      return true;
    });
  }, [coupons, selectedType]);

  // Aggregate statistics
  const totalStakes = useMemo(() => {
    return filteredCoupons.reduce((sum, c) => sum + c.stake, 0);
  }, [filteredCoupons]);

  const handleOpenDetail = (coupon: BetSlip) => {
    navigation.navigate('BetDetail', { couponId: coupon.id });
  };

  const handleDeposit = () => {
    const num = parseFloat(depositAmount) || 0;
    if (num > 0) {
      deposit(num);
      setShowDepositModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Historique des paris</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.topIconBtn}>
            <Ionicons name="filter-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topIconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Balance Card with Deposit */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Compte principal</Text>
            <Text style={styles.balanceValue}>
              {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} F
            </Text>
          </View>
          <TouchableOpacity
            style={styles.depositBtn}
            onPress={() => setShowDepositModal(!showDepositModal)}
          >
            <Text style={styles.depositBtnText}>+ Effectuer un dépôt</Text>
          </TouchableOpacity>
        </View>

        {/* Inline Deposit Dropdown if open */}
        {showDepositModal && (
          <View style={styles.depositBox}>
            <Text style={styles.depositBoxTitle}>Recharger le solde principal</Text>
            <View style={styles.depositInputRow}>
              <TextInput
                style={styles.depositInput}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
                placeholder="Montant"
              />
              <TouchableOpacity style={styles.depositConfirmBtn} onPress={handleDeposit}>
                <Text style={styles.depositConfirmText}>Créditer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Filter: Period */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>Période :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['1 jour', '1 semaine', '1 mois', 'Tous'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.filterPill, selectedPeriod === p && styles.filterPillActive]}
                onPress={() => setSelectedPeriod(p)}
              >
                <Text style={[styles.filterPillText, selectedPeriod === p && styles.filterPillTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Filter: Type */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionLabel}>Type :</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {(['Tous', 'Vente', 'Gagné', 'Perdu', 'Accepté'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.filterPill, selectedType === t && styles.filterPillActive]}
                onPress={() => setSelectedType(t)}
              >
                <Text style={[styles.filterPillText, selectedType === t && styles.filterPillTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Aggregated Statistics Summary */}
        <View style={styles.statsCard}>
          <View style={styles.statsIconBox}>
            <Ionicons name="bar-chart-outline" size={18} color={Colors.primaryAccent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statsTitle}>Statistiques pour la période</Text>
            <Text style={styles.statsData}>
              Paris : <Text style={styles.statsHighlight}>{filteredCoupons.length}</Text> · Mise totale :{' '}
              <Text style={styles.statsHighlight}>{totalStakes.toLocaleString('fr-FR')} F</Text>
            </Text>
          </View>
        </View>

        {/* List of Coupons with CutoutTicketCard */}
        {filteredCoupons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textSubtle} />
            <Text style={styles.emptyTitle}>Aucun coupon trouvé</Text>
            <Text style={styles.emptySub}>
              Aucun ticket ne correspond aux filtres actuels. Modifie tes critères ou crée un nouveau pari.
            </Text>
          </View>
        ) : (
          filteredCoupons.map((coupon) => {
            const isWon = coupon.status === 'Payé' || coupon.status === 'Gagné';
            return (
              <CutoutTicketCard key={coupon.id} style={styles.ticketMargin}>
                {/* Upper Ticket Section */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetail(coupon)}
                  style={styles.ticketTopSection}
                >
                  <View style={styles.ticketDateRow}>
                    <Text style={styles.ticketDateText}>{coupon.createdAt}</Text>
                    <View style={styles.ticketActionIcons}>
                      <TouchableOpacity
                        style={styles.actionCircleBtn}
                        onPress={() => setActiveSheetCoupon(coupon)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.ticketNumberRow}>
                    <Text style={styles.ticketType}>{coupon.type}</Text>
                    <Text style={styles.ticketIdText}>№ {coupon.id}</Text>
                  </View>
                </TouchableOpacity>

                {/* Perforated Divider */}
                <TicketCutoutDivider />

                {/* Lower Ticket Financial Summary */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleOpenDetail(coupon)}
                  style={styles.ticketBottomSection}
                >
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Cote :</Text>
                    <Text style={styles.financeValue}>{coupon.totalOdds.toLocaleString('fr-FR')}</Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Mise :</Text>
                    <Text style={styles.financeValue}>{coupon.stake.toLocaleString('fr-FR')} F</Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>{isWon ? 'Gains :' : 'Gains potentiels :'}</Text>
                    <Text style={[styles.financeValue, isWon && { color: Colors.success, fontWeight: '800' }]}>
                      {(isWon && coupon.actualPayout
                        ? coupon.actualPayout
                        : coupon.potentialPayout
                      ).toLocaleString('fr-FR')}{' '}
                      F
                    </Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Statut :</Text>
                    <StatusBadge status={coupon.status} />
                  </View>

                  {/* Cashout Notice if Available */}
                  {coupon.isForSale && coupon.status === 'Accepté' && (
                    <View style={styles.cashoutBanner}>
                      <Ionicons name="pricetag" size={14} color="#7C3AED" />
                      <Text style={styles.cashoutBannerText}>
                        Rachat disponible pour {(coupon.cashoutAmount || coupon.stake * 0.95).toLocaleString('fr-FR')} F
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </CutoutTicketCard>
            );
          })
        )}
      </ScrollView>

      {/* Action Bottom Sheet for Selected Coupon */}
      <ActionBottomSheet
        visible={!!activeSheetCoupon}
        coupon={activeSheetCoupon}
        onClose={() => setActiveSheetCoupon(null)}
        onViewDetail={handleOpenDetail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topIconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  depositBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  depositBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  depositBox: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  depositBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  depositInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  depositInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  depositConfirmBtn: {
    backgroundColor: Colors.success,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  depositConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    width: 65,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    marginVertical: 10,
    gap: 10,
  },
  statsIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  statsData: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  statsHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  ticketMargin: {
    marginBottom: 14,
  },
  ticketTopSection: {
    padding: 14,
  },
  ticketDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  ticketActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionCircleBtn: {
    padding: 4,
  },
  ticketNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    gap: 6,
  },
  ticketType: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ticketIdText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  ticketBottomSection: {
    padding: 14,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  financeLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  financeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cashoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  cashoutBannerText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});
