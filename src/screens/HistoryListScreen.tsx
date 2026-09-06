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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { HistoryBetCard } from '../components/HistoryBetCard';
import { BetOptionsBottomSheet } from '../components/BetOptionsBottomSheet';
import { BetSlip } from '../types/bet';

export default function HistoryListScreen({ navigation }: any) {
  const { balance, coupons, deposit } = useBetStore();

  // Quick filters state matching reference screenshot
  const [periodFilter, setPeriodFilter] = useState<'1 mois' | '1 semaine' | '1 jour' | 'Tous'>('1 mois');
  const [saleFilterActive, setSaleFilterActive] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('50000');

  // Contextual options sheet
  const [selectedCoupon, setSelectedCoupon] = useState<BetSlip | null>(null);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (saleFilterActive && !c.isForSale && c.status !== 'Vendu') return false;
      return true;
    });
  }, [coupons, saleFilterActive]);

  // Aggregate stats
  const totalStakes = useMemo(() => {
    return filteredCoupons.reduce((sum, c) => sum + c.stake, 0);
  }, [filteredCoupons]);

  const handleOpenDetail = (coupon: BetSlip) => {
    navigation.navigate('BetDetailTicket', { couponId: coupon.id });
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
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Historique des</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.topIconBtn} accessibilityLabel="Filtres">
            <Ionicons name="funnel-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={() => setShowDepositModal(!showDepositModal)}
            accessibilityLabel="Solde & Portefeuille"
          >
            <Ionicons name="wallet-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. Encart Compte Principal & Solde */}
        <View style={styles.accountCard}>
          <View style={styles.accountLeft}>
            <View style={styles.accountDropdownRow}>
              <Text style={styles.accountLabel}>Compte principal</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textMuted} style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.accountBalance}>
              {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
              <Text style={styles.currency}>₣</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.depositBtn}
            onPress={() => setShowDepositModal(!showDepositModal)}
            activeOpacity={0.8}
          >
            <Text style={styles.depositBtnText}>+ Effectuer un dépôt</Text>
          </TouchableOpacity>
        </View>

        {/* Modal/Input dépôt rapide si ouvert */}
        {showDepositModal && (
          <View style={styles.depositBox}>
            <Text style={styles.depositBoxTitle}>Créditer le compte principal</Text>
            <View style={styles.depositInputRow}>
              <TextInput
                style={styles.depositInput}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
                placeholder="Montant"
              />
              <TouchableOpacity style={styles.depositConfirmBtn} onPress={handleDeposit}>
                <Text style={styles.depositConfirmText}>Recharger</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 3. Filtres Rapides Horizontaux */}
        <View style={styles.quickFiltersRow}>
          {/* Badge Période (ex: 📅 1 mois) */}
          <TouchableOpacity
            style={[styles.quickFilterBadge, styles.badgeActive]}
            onPress={() => {
              const next =
                periodFilter === '1 mois'
                  ? '1 semaine'
                  : periodFilter === '1 semaine'
                  ? '1 jour'
                  : periodFilter === '1 jour'
                  ? 'Tous'
                  : '1 mois';
              setPeriodFilter(next);
            }}
          >
            <Ionicons name="calendar-outline" size={13} color="#fff" style={{ marginRight: 5 }} />
            <Text style={[styles.quickFilterText, styles.filterTextActive]}>{periodFilter}</Text>
          </TouchableOpacity>

          {/* Badge Type (ex: 🏷️ Vente) */}
          <TouchableOpacity
            style={[styles.quickFilterBadge, saleFilterActive ? styles.badgeActive : styles.badgeInactive]}
            onPress={() => setSaleFilterActive(!saleFilterActive)}
          >
            <Ionicons
              name="pricetag-outline"
              size={13}
              color={saleFilterActive ? '#fff' : Colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.quickFilterText,
                saleFilterActive ? styles.filterTextActive : styles.filterTextInactive,
              ]}
            >
              Vente
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Card Statistiques Période */}
        <TouchableOpacity
          style={styles.statsCard}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.statsTitle}>Statistiques pour la période</Text>
            <Text style={styles.statsSubtitle}>
              Paris : <Text style={styles.statsBold}>{filteredCoupons.length}</Text> ·{' '}
              <Text style={styles.statsBold}>{totalStakes.toLocaleString('fr-FR')} ₣</Text>
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 5. Liste des Cards de Coupon */}
        {filteredCoupons.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="ticket-outline" size={44} color={Colors.textSubtle} />
            <Text style={styles.emptyTitle}>Aucun coupon trouvé</Text>
            <Text style={styles.emptySub}>
              Aucun pari enregistré avec ces filtres. Créez un nouveau coupon ou ajustez la période.
            </Text>
          </View>
        ) : (
          filteredCoupons.map((coupon) => (
            <HistoryBetCard
              key={coupon.id}
              coupon={coupon}
              onPress={() => handleOpenDetail(coupon)}
              onOptionsPress={() => setSelectedCoupon(coupon)}
              onNotificationPress={() => {}}
            />
          ))
        )}
      </ScrollView>

      {/* Options Bottom Sheet */}
      <BetOptionsBottomSheet
        visible={!!selectedCoupon}
        coupon={selectedCoupon}
        onClose={() => setSelectedCoupon(null)}
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
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topIconBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 88,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  accountLeft: {
    flex: 1,
  },
  accountDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  accountLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  currency: {
    fontSize: 14,
    fontWeight: '700',
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
    marginBottom: 10,
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
  quickFiltersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  quickFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  badgeInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterTextInactive: {
    color: Colors.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  statsSubtitle: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statsBold: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
});
