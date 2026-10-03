import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BetSlip } from '../types/bet';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { useThemeStore } from '../stores/themeStore';

interface ActionBottomSheetProps {
  visible: boolean;
  coupon: BetSlip | null;
  onClose: () => void;
  onViewDetail: (coupon: BetSlip) => void;
}

export const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  visible,
  coupon,
  onClose,
  onViewDetail,
}) => {
  const { currentTheme } = useThemeStore();
  const { validateCouponWithResult, toggleCashout, deleteCoupon } = useBetStore();

  if (!coupon) return null;

  const isWon = coupon.status === 'Payé' || coupon.status === 'Gagné' || coupon.status === 'Gain';
  const isDark = currentTheme.isDark;
  const cardBg = currentTheme.colors?.cardBackground || currentTheme.cardBackground || '#FFFFFF';
  const textPrimary = currentTheme.colors?.textPrimary || currentTheme.textPrimary || '#0F172A';
  const textSecondary = currentTheme.colors?.textSecondary || currentTheme.textSecondary || '#64748B';
  const borderColor = currentTheme.colors?.cardBorder || currentTheme.border || '#E2E8F0';
  const primaryColor = currentTheme.primary || '#2563EB';
  const primarySoft = currentTheme.primarySoft || (isDark ? '#1E293B' : '#EFF6FF');

  const handleToggleStatus = () => {
    validateCouponWithResult(coupon.id, !isWon);
    onClose();
  };

  const handleToggleSale = () => {
    toggleCashout(coupon.id);
    onClose();
    Alert.alert(
      'Option Vente',
      coupon.isForSale
        ? 'La vente (cashout) a été désactivée pour ce coupon.'
        : 'La vente (cashout) a été activée ! Un bouton apparaîtra sur le détail.'
    );
  };

  const handleShare = () => {
    onClose();
    Alert.alert(
      'Partager le coupon',
      `Code de partage : ${coupon.shareCode || 'A8KF2'}\n\nCe code permet d'importer ce coupon sur un autre appareil.`
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce coupon ?',
      'Ce coupon sera retiré de votre historique. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteCoupon(coupon.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.sheetContainer, { backgroundColor: cardBg }]} onStartShouldSetResponder={() => true}>
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
          <Text style={[styles.sheetTitle, { color: textPrimary }]}>Options du coupon № {coupon.id}</Text>

          {/* Action 1: Voir le détail */}
          <TouchableOpacity
            style={[styles.sheetItem, { borderBottomColor: borderColor }]}
            onPress={() => {
              onClose();
              onViewDetail(coupon);
            }}
          >
            <View style={[styles.iconCircle, { backgroundColor: primarySoft }]}>
              <Ionicons name="receipt-outline" size={20} color={primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: textPrimary }]}>Voir le détail</Text>
              <Text style={[styles.itemSub, { color: textSecondary }]}>Consulter les événements et le billet complet</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textSecondary} />
          </TouchableOpacity>

          {/* Action 2: Saisir les scores / Valider */}
          <TouchableOpacity style={[styles.sheetItem, { borderBottomColor: borderColor }]} onPress={handleToggleStatus}>
            <View style={[styles.iconCircle, { backgroundColor: isWon ? primarySoft : (isDark ? '#064E3B' : '#DCFCE7') }]}>
              <Ionicons
                name={isWon ? 'refresh-outline' : 'checkmark-done-circle-outline'}
                size={20}
                color={isWon ? primaryColor : (currentTheme.status?.paye || '#16A34A')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: textPrimary }, !isWon && { color: currentTheme.status?.paye || '#16A34A' }]}>
                {isWon ? 'Repasser en Accepté' : 'Saisir les scores (Valider Gain)'}
              </Text>
              <Text style={[styles.itemSub, { color: textSecondary }]}>
                {isWon ? 'Réinitialise le tirage et le solde' : 'Attribue les gains et affiche les résultats'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textSecondary} />
          </TouchableOpacity>

          {/* Action 3: Définir la vente (Cashout) */}
          <TouchableOpacity style={[styles.sheetItem, { borderBottomColor: borderColor }]} onPress={handleToggleSale}>
            <View style={[styles.iconCircle, { backgroundColor: coupon.isForSale ? (isDark ? '#78350F' : '#FEF3C7') : primarySoft }]}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={coupon.isForSale ? (currentTheme.status?.accepte || '#F59E0B') : primaryColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: textPrimary }]}>
                {coupon.isForSale ? 'Désactiver la vente' : 'Définir la vente (Cashout)'}
              </Text>
              <Text style={[styles.itemSub, { color: textSecondary }]}>
                {coupon.isForSale ? 'Bouton de rachat actif' : 'Activer le bouton de rachat immédiat'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textSecondary} />
          </TouchableOpacity>

          {/* Action 4: Partager */}
          <TouchableOpacity style={[styles.sheetItem, { borderBottomColor: borderColor }]} onPress={handleShare}>
            <View style={[styles.iconCircle, { backgroundColor: primarySoft }]}>
              <Ionicons name="share-social-outline" size={20} color={primaryColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: textPrimary }]}>Partager le coupon</Text>
              <Text style={[styles.itemSub, { color: textSecondary }]}>Générer le code alphanumérique d'import</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textSecondary} />
          </TouchableOpacity>

          {/* Action 5: Supprimer */}
          <TouchableOpacity style={[styles.sheetItem, { borderBottomWidth: 0 }]} onPress={handleDelete}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: '#EF4444' }]}>Supprimer de l'historique</Text>
              <Text style={[styles.itemSub, { color: textSecondary }]}>Action destructrice définitive</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.darkOverlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.borderDark,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
