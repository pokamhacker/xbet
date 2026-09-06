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
  const { validateCouponWithResult, toggleCashout, deleteCoupon } = useBetStore();

  if (!coupon) return null;

  const isWon = coupon.status === 'Payé' || coupon.status === 'Gagné' || coupon.status === 'Gain';

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
        <View style={styles.sheetContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Options du coupon № {coupon.id}</Text>

          {/* Action 1: Voir le détail */}
          <TouchableOpacity
            style={styles.sheetItem}
            onPress={() => {
              onClose();
              onViewDetail(coupon);
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primaryAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Voir le détail</Text>
              <Text style={styles.itemSub}>Consulter les événements et le billet complet</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          {/* Action 2: Saisir les scores / Valider */}
          <TouchableOpacity style={styles.sheetItem} onPress={handleToggleStatus}>
            <View style={[styles.iconCircle, { backgroundColor: isWon ? Colors.primarySoft : Colors.successSoft }]}>
              <Ionicons
                name={isWon ? 'refresh-outline' : 'checkmark-done-circle-outline'}
                size={20}
                color={isWon ? Colors.primaryAccent : Colors.success}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, !isWon && { color: Colors.success }]}>
                {isWon ? 'Repasser en Accepté' : 'Saisir les scores (Valider Gain)'}
              </Text>
              <Text style={styles.itemSub}>
                {isWon ? 'Réinitialise le tirage et le solde' : 'Attribue les gains et affiche les résultats'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          {/* Action 3: Définir la vente (Cashout) */}
          <TouchableOpacity style={styles.sheetItem} onPress={handleToggleSale}>
            <View style={[styles.iconCircle, { backgroundColor: coupon.isForSale ? '#FEF3C7' : Colors.surfaceSecondary }]}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={coupon.isForSale ? Colors.warning : Colors.primaryAccent}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {coupon.isForSale ? 'Désactiver la vente' : 'Définir la vente (Cashout)'}
              </Text>
              <Text style={styles.itemSub}>
                {coupon.isForSale ? 'Bouton de rachat actif' : 'Activer le bouton de rachat immédiat'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          {/* Action 4: Partager */}
          <TouchableOpacity style={styles.sheetItem} onPress={handleShare}>
            <View style={styles.iconCircle}>
              <Ionicons name="share-social-outline" size={20} color={Colors.primaryAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Partager le coupon</Text>
              <Text style={styles.itemSub}>Générer le code alphanumérique d'import</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          {/* Action 5: Supprimer */}
          <TouchableOpacity style={[styles.sheetItem, { borderBottomWidth: 0 }]} onPress={handleDelete}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.dangerSoft }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: Colors.danger }]}>Supprimer de l'historique</Text>
              <Text style={styles.itemSub}>Action destructrice définitive</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
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
