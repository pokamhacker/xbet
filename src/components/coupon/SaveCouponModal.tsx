import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
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
  couponCode = 'LU631',
  onClose,
}) => {
  const { currentTheme, isDark: storeIsDark, setBottomBarHidden } = useThemeStore();
  const isDark = Boolean(currentTheme?.isDark ?? storeIsDark);

  const goldAccent =
    currentTheme?.primary ||
    currentTheme?.colors?.primary ||
    (isDark ? '#589BD8' : '#4A8FD6');
  const cardBgColor =
    currentTheme?.modalBackground ||
    currentTheme?.cardBackground ||
    (isDark ? '#263547' : '#FFFFFF');
  const textColor = currentTheme?.textPrimary || (isDark ? '#F8FAFC' : '#1E242B');
  const dividerColor = currentTheme?.border || (isDark ? '#334155' : '#EBEEF2');

  // Conserver la barre de navigation visible sous le fond sombre lors de l'affichage du code du coupon
  useEffect(() => {
    if (visible) {
      setBottomBarHidden(false);
    }
  }, [visible, setBottomBarHidden]);

  const handleClose = () => {
    onClose();
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(couponCode || 'LU631');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignorer silencieusement sur web / appareils non supportés
    }
    handleClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      visible={visible}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
    >
      <Pressable onPress={handleClose} style={styles.backdrop}>
        <Pressable
          style={[styles.card, { backgroundColor: cardBgColor }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Titre jaune/or "Sauvegarder" */}
          <Text style={[styles.title, { color: goldAccent }]}>
            Sauvegarder
          </Text>

          {/* Paragraphe centré avec le code généré */}
          <Text style={[styles.messageText, { color: textColor }]}>
            Coupon de pari enregistré avec succès avec le code{' '}
            <Text style={[styles.codeSpan, { color: textColor }]}>
              {couponCode}
            </Text>
            . Vous pouvez charger votre coupon de pari à l'aide de ce code afin de le partager avec vos amis et de jouer ensemble !
          </Text>

          {/* Boutons empilés Copier / Annuler en jaune/or */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          <TouchableOpacity activeOpacity={0.7} onPress={handleCopy} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: goldAccent }]}>Copier</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
          <TouchableOpacity activeOpacity={0.7} onPress={handleClose} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: goldAccent }]}>Annuler</Text>
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
    paddingHorizontal: 28,
    width: '100%',
    height: '100%',
    zIndex: 999999,
    ...(Platform.OS === 'web'
      ? ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
        } as any)
      : {}),
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingTop: 20,
    paddingBottom: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
    fontWeight: '400',
  },
  codeSpan: {
    fontWeight: '400',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15.5,
    fontWeight: '600',
  },
});
