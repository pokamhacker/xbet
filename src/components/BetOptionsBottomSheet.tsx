import React, { useState } from 'react';
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
import { useResponsive } from '../utils/responsive';
import { ScoreEditorModal } from './ScoreEditorModal';

interface BetOptionsBottomSheetProps {
  visible: boolean;
  coupon: BetSlip | null;
  onClose: () => void;
  onViewDetail: (coupon: BetSlip) => void;
  onSaveCoupon?: () => void;
}

export const BetOptionsBottomSheet: React.FC<BetOptionsBottomSheetProps> = ({
  visible,
  coupon,
  onClose,
  onViewDetail,
  onSaveCoupon,
}) => {
  const { currentTheme } = useThemeStore();
  const { toggleCashout, deleteCoupon } = useBetStore();
  const { isTablet, isDesktop, font, moderateScale, insets } = useResponsive();
  const [scoreModalVisible, setScoreModalVisible] = useState(false);

  if (!coupon) return null;

  const isWon = coupon.status === 'Payé' || coupon.status === 'Gagné' || coupon.status === 'Gain';
  const isDark = currentTheme.isDark;
  const cardBg = currentTheme.modalBackground || currentTheme.colors?.modalBackground || currentTheme.colors?.cardBackground || currentTheme.cardBackground || '#FFFFFF';
  const textPrimary = currentTheme.colors?.textPrimary || currentTheme.textPrimary || '#0F172A';
  const textSecondary = currentTheme.colors?.textSecondary || currentTheme.textSecondary || '#64748B';
  const borderColor = currentTheme.colors?.cardBorder || currentTheme.border || '#E2E8F0';
  const primaryColor = currentTheme.primary || '#2563EB';
  const primarySoft = currentTheme.primarySoft || (isDark ? '#1E293B' : '#EFF6FF');

  const handleOpenScoreModal = () => {
    onClose();
    setTimeout(() => {
      setScoreModalVisible(true);
    }, 200);
  };

  const handleToggleSale = () => {
    toggleCashout(coupon.id);
    onClose();
    Alert.alert(
      'Option Vente (Cashout)',
      coupon.isForSale
        ? 'La vente a été désactivée pour ce coupon.'
        : 'La vente a été activée ! Le bandeau de rachat apparaît désormais sur le billet.'
    );
  };

  const handleShare = () => {
    onClose();
    if (onSaveCoupon) {
      onSaveCoupon();
    } else {
      Alert.alert(
        'Partager le coupon',
        `Code du coupon : ${coupon.shareCode || 'A8KF2'}\n\nTransmettez ce code pour importer ce coupon avec toutes ses sélections sur un autre téléphone.`
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce coupon ?',
      'Ce coupon sera définitivement retiré de votre historique. Cette action est irréversible.',
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
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            (isTablet || isDesktop) && styles.modalOverlayTablet,
          ]}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: cardBg,
                paddingBottom: Math.max(24, insets.bottom + 12),
              },
              (isTablet || isDesktop) && styles.sheetContainerTablet,
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? '#475569' : '#CBD5E1' }]} />
            <Text style={[styles.sheetTitle, { color: textPrimary, fontSize: font(15) }]} numberOfLines={1} adjustsFontSizeToFit>
              Options du coupon № {coupon.id}
            </Text>

            {/* Action 1 : Voir le détail */}
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

            {/* Action 2 : Saisir les scores */}
            <TouchableOpacity style={[styles.sheetItem, { borderBottomColor: borderColor }]} onPress={handleOpenScoreModal}>
              <View style={[styles.iconCircle, { backgroundColor: isWon ? (isDark ? '#064E3B' : '#DCFCE7') : primarySoft }]}>
                <Ionicons
                  name="pencil-outline"
                  size={20}
                  color={isWon ? (currentTheme.status?.paye || '#16A34A') : primaryColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: textPrimary }, isWon && { color: currentTheme.status?.paye || '#16A34A' }]}>
                  Saisir les scores
                </Text>
                <Text style={[styles.itemSub, { color: textSecondary }]}>
                  Renseigner les scores des matchs et mettre à jour le coupon
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textSecondary} />
            </TouchableOpacity>

            {/* Action 3 : Définir la vente */}
            <TouchableOpacity style={[styles.sheetItem, { borderBottomColor: borderColor }]} onPress={handleToggleSale}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: coupon.isForSale ? (isDark ? '#78350F' : '#FEF3C7') : primarySoft },
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={coupon.isForSale ? (currentTheme.status?.accepte || '#F59E0B') : primaryColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: textPrimary }]}>
                  {coupon.isForSale ? 'Désactiver la vente' : 'Définir la vente'}
                </Text>
                <Text style={[styles.itemSub, { color: textSecondary }]}>
                  {coupon.isForSale ? 'Bandeau de rachat actif' : 'Activer/configurer la possibilité de vendre'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textSecondary} />
            </TouchableOpacity>

            {/* Action 4 : Partager le coupon */}
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

            {/* Action 5 : Supprimer de l'historique */}
            <TouchableOpacity
              style={[styles.sheetItem, { borderBottomWidth: 0 }]}
              onPress={handleDelete}
            >
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: '#EF4444' }]}>
                  Supprimer de l'historique
                </Text>
                <Text style={[styles.itemSub, { color: textSecondary }]}>Retirer définitivement ce coupon de l'historique</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Score Editor Modal */}
      <ScoreEditorModal
        visible={scoreModalVisible}
        coupon={coupon}
        onClose={() => setScoreModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.darkOverlay,
    justifyContent: 'flex-end',
  },
  modalOverlayTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    width: '100%',
  },
  sheetContainerTablet: {
    maxWidth: 520,
    borderRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
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

export default BetOptionsBottomSheet;
