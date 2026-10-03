import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useThemeStore } from '../../stores/themeStore';

export interface SaveCouponModalProps {
  visible: boolean;
  couponCode: string;
  onClose: () => void;
}

export const SaveCouponModal: React.FC<SaveCouponModalProps> = ({
  visible,
  couponCode = 'K8U9M',
  onClose,
}) => {
  // Extraction du thème actif depuis le Store
  const { currentTheme, isDark } = useThemeStore();

  const primaryAccent = currentTheme.primary;
  const cardBgColor = currentTheme.modalBackground || currentTheme.cardBackground;
  const textColor = currentTheme.textPrimary;
  const dividerColor = currentTheme.divider || currentTheme.border || (isDark ? '#334155' : '#E2E8F0');

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(couponCode || 'K8U9M');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Ignorer silencieusement
    }
    onClose();
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable
          style={[styles.card, { backgroundColor: cardBgColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Titre "Sauvegarder" réactif au thème Melbet/1xBet */}
          <Text style={[styles.title, { color: primaryAccent }]}>
            Sauvegarder
          </Text>

          {/* Paragraphe avec le Code du coupon strictement normal (NON GRAS) */}
          <Text style={[styles.messageText, { color: textColor }]}>
            Coupon de pari enregistré avec succès avec le code{' '}
            <Text style={[styles.codeSpan, { color: textColor }]}>
              {couponCode}
            </Text>
            . Vous pouvez charger votre coupon de pari à l'aide de ce code afin de le partager avec vos amis et de jouer ensemble !
          </Text>

          {/* Séparateur */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Action : Copier */}
          <TouchableOpacity activeOpacity={0.7} onPress={handleCopy} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: primaryAccent }]}>
              Copier
            </Text>
          </TouchableOpacity>

          {/* Séparateur */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Action : Annuler */}
          <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: primaryAccent }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SaveCouponModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 18,
    paddingTop: 20,
    paddingBottom: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    fontWeight: '400', // Police normale pour tout le paragraphe
  },
  codeSpan: {
    fontWeight: '400', // STRICTEMENT NON GRAS : hérite du texte standard
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
