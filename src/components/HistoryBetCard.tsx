import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BetSlip } from '../types/bet';

export interface HistoryBetCardProps {
  coupon: BetSlip;
  onPress: () => void;
  onOptionsPress?: () => void;
  onNotificationPress?: () => void;
}

/**
 * HistoryBetCard : Carte de coupon dans l'historique des paris (Pixel-Perfect)
 * 1. Coins arrondis compacts borderRadius: 8, contour 1px #E2E8F0, aucune ombre
 * 2. En-tête : ticket-confirmation-outline #2563EB (18dp) + "Date · N° ID" + cloche & menu #2563EB (17dp)
 * 3. Typologie : Combiné + layers-outline + nombre d'événements
 * 4. Filet discret de 1px (#F1F5F9, marginVertical: 6)
 * 5. Bloc chiffré dense (Cote, Mise, Gains potentiels/Gains, Statut brut transparent sans fond)
 */
export const HistoryBetCard: React.FC<HistoryBetCardProps> = ({
  coupon,
  onPress,
  onOptionsPress,
  onNotificationPress,
}) => {
  const isPaye = coupon.status === 'Payé' || coupon.status === 'Gagné' || coupon.status === 'Gain';
  const isAccepte = coupon.status === 'Accepté';

  // Formatage officiel du numéro : "03.09.2026 (13:00) · N° 85435548340"
  const headerMeta = `${coupon.createdAt} · N° ${coupon.id}`;

  // Orthographe stricte "Combiné" avec accent aigu
  const rawType = (coupon.type as string) || 'Combiné';
  const typeLabel = rawType === 'Combiner' ? 'Combiné' : rawType;

  // Calcul du montant selon statut
  const payoutAmount = isPaye && coupon.actualPayout ? coupon.actualPayout : coupon.potentialPayout;

  // Statut texte brut transparent
  const statusLabel = isPaye ? 'Payé' : coupon.status;
  const statusColor = isPaye
    ? '#22C55E' // Vert vif
    : isAccepte
    ? '#1E40AF' // Bleu institutionnel
    : coupon.status === 'Perdu'
    ? '#DC2626' // Rouge perte
    : '#1E40AF';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      {/* 1. En-tête : Icône Ticket à gauche + (Date/N° & Typologie) au centre + Actions à droite */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="ticket-confirmation-outline"
            size={18}
            color="#2563EB"
            style={styles.ticketIcon}
          />
          <View style={styles.metaCol}>
            {/* Ligne 1 : Date et Numéro */}
            <Text style={styles.metaText} numberOfLines={1}>
              {headerMeta}
            </Text>

            {/* Ligne 2 : Typologie Combiné ≚ 3 */}
            <View style={styles.typeRow}>
              <Text style={styles.typeText}>{typeLabel}</Text>
              <View style={styles.selectionsBadge}>
                <MaterialCommunityIcons
                  name="layers-outline"
                  size={14}
                  color="#64748B"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.selectionsCount}>{coupon.eventsCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions à droite : 🔔 et ••• */}
        <View style={styles.actionsRight}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onNotificationPress}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={17} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onOptionsPress}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel="Options du coupon"
          >
            <Ionicons name="ellipsis-horizontal" size={17} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Ligne de démarcation interne : filet discret de 1px */}
      <View style={styles.divider} />

      {/* 3. Bloc Chiffré Dense */}
      <View style={styles.financialSection}>
        {/* Cote */}
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Cote :</Text>
          <Text style={styles.financeValue}>{coupon.totalOdds.toLocaleString('fr-FR')}</Text>
        </View>

        {/* Mise */}
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Mise :</Text>
          <Text style={styles.financeValue}>{coupon.stake.toLocaleString('fr-FR')} ₣</Text>
        </View>

        {/* Gains potentiels / Gains */}
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>{isPaye ? 'Gains :' : 'Gains potentiels :'}</Text>
          <Text style={[styles.financeValue, isPaye && styles.gainsPayeValue]}>
            {payoutAmount.toLocaleString('fr-FR')} ₣
          </Text>
        </View>

        {/* Statut brut sans fond ni coche */}
        <View style={styles.financeRow}>
          <Text style={styles.financeLabel}>Statut :</Text>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  ticketIcon: {
    marginRight: 8,
  },
  metaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 5,
  },
  selectionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  financialSection: {
    gap: 2,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  financeLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '400',
  },
  financeValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
  },
  gainsPayeValue: {
    color: '#22C55E',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: 'transparent',
    textAlign: 'right',
  },
});

export default HistoryBetCard;
