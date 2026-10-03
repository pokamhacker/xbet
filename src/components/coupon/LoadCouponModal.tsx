import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useThemeStore } from '../../stores/themeStore';

export interface LoadCouponModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadCoupon: (code: string) => void;
}

export const LoadCouponModal: React.FC<LoadCouponModalProps> = ({
  visible,
  onClose,
  onLoadCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme?.isDark || currentTheme?.name === 'melbet';

  const handleDownload = () => {
    if (couponCode.trim().length > 0) {
      onLoadCoupon(couponCode.trim());
      setCouponCode('');
      onClose();
    }
  };

  const isButtonDisabled = couponCode.trim().length === 0;
  const primaryColor = currentTheme?.primary || '#2563EB';

  const inputTextColor = currentTheme?.textPrimary || (isDark ? '#FFFFFF' : '#0F172A');
  const inputBorderColor = couponCode.length > 0 ? primaryColor : (isDark ? '#475569' : '#94A3B8');

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
      visible={visible}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={[
                  styles.sheetContainer,
                  { backgroundColor: currentTheme?.cardBackground || (isDark ? '#1E293B' : '#FFFFFF') },
                ]}
              >
                {/* Poignée de glissement */}
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: isDark ? '#475569' : '#CBD5E1' },
                  ]}
                />

                {/* Titre centré */}
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}
                >
                  Charger le coupon de pari
                </Text>

                {/* Label / Subtitle */}
                <Text
                  style={[
                    styles.subtitle,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}
                >
                  Saisissez le code du coupon de pari
                </Text>

                {/* Champ de saisie souligné épuré (sans second fond ni bordure orange web) */}
                <TextInput
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus={true}
                  onChangeText={setCouponCode}
                  placeholder=""
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={couponCode}
                  style={[
                    styles.input,
                    {
                      color: inputTextColor,
                      borderBottomColor: inputBorderColor,
                    },
                    Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                  ]}
                />

                {/* Bouton Télécharger */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isButtonDisabled}
                  onPress={handleDownload}
                  style={[
                    styles.downloadButton,
                    isButtonDisabled
                      ? (isDark ? { backgroundColor: '#334155' } : styles.disabledButton)
                      : { backgroundColor: primaryColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.downloadButtonText,
                      isButtonDisabled
                        ? styles.disabledButtonText
                        : { color: '#FFFFFF' },
                    ]}
                  >
                    Télécharger
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardAvoid: {
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 28,
  },
  downloadButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
});

export default LoadCouponModal;
