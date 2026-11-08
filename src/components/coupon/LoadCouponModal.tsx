import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { useResponsive } from '../../utils/responsive';
import { Typography } from '../../theme/theme';

export interface LoadCouponModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadCoupon: (code: string) => boolean | { success: boolean; message?: string } | void;
}

export const LoadCouponModal: React.FC<LoadCouponModalProps> = ({
  visible,
  onClose,
  onLoadCoupon,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { currentTheme, currentBrand, setBottomBarHidden } = useThemeStore();
  const { font, moderateScale, isTablet } = useResponsive();

  const isDark = Boolean(currentTheme?.isDark || currentBrand === 'melbet' || currentTheme?.name === 'melbet');

  // Réinitialiser les états lors de l'ouverture / fermeture et masquer la barre de navigation
  useEffect(() => {
    if (visible) {
      setErrorText('');
      setBottomBarHidden(true);
    } else {
      setCouponCode('');
      setErrorText('');
      setIsFocused(false);
      setBottomBarHidden(false);
    }
    return () => {
      setBottomBarHidden(false);
    };
  }, [visible, setBottomBarHidden]);

  const handleTextChange = (text: string) => {
    setCouponCode(text.toUpperCase());
    if (errorText) {
      setErrorText('');
    }
  };

  const handleClear = () => {
    setCouponCode('');
    setErrorText('');
  };

  const handleDownload = () => {
    const cleanCode = couponCode.trim().toUpperCase();
    if (cleanCode.length === 0) return;

    const result = onLoadCoupon(cleanCode);

    // Si la fonction retourne false ou { success: false }
    if (result === false || (typeof result === 'object' && result?.success === false)) {
      setErrorText(
        typeof result === 'object' && result?.message
          ? result.message
          : 'Code de coupon invalide ou introuvable.'
      );
    } else {
      // Succès : fermeture et réinitialisation
      setErrorText('');
      setCouponCode('');
      onClose();
    }
  };

  const isButtonDisabled = couponCode.trim().length === 0;

  // Couleurs de thème dynamiques
  const primaryColor = currentTheme?.colors?.primary || currentTheme?.primary || '#2563EB';
  const sheetBg = currentTheme?.cardBackground || (isDark ? '#212D3B' : '#FFFFFF');
  const textColor = currentTheme?.textPrimary || (isDark ? '#FFFFFF' : '#101E33');
  const subtitleColor = currentTheme?.textSecondary || (isDark ? '#8E9CAE' : '#64748B');
  const borderColor = isDark ? (currentTheme?.border || '#2C3A4B') : '#E2E8F0';
  const handleColor = isDark ? '#475569' : '#CBD5E1';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';

  const inputBorderColor = errorText
    ? '#EF4444'
    : isFocused
    ? primaryColor
    : couponCode.length > 0
    ? (isDark ? '#64748B' : '#94A3B8')
    : borderColor;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Backdrop tactile pour fermer */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Fermer la modale"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheetContainer,
              isTablet && styles.tabletSheet,
              {
                backgroundColor: sheetBg,
                borderTopColor: isDark ? borderColor : 'transparent',
                borderTopWidth: isDark ? 1 : 0,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Poignée de glissement */}
            <View style={[styles.handle, { backgroundColor: handleColor }]} />

            {/* En-tête avec Titre et Bouton Fermer */}
            <View style={styles.headerRow}>
              <Text
                style={[
                  styles.title,
                  { color: textColor, fontSize: font(18) },
                ]}
              >
                Charger le coupon de pari
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.closeBtn}
                accessibilityLabel="Fermer"
              >
                <Ionicons
                  name="close"
                  size={moderateScale(22)}
                  color={subtitleColor}
                />
              </TouchableOpacity>
            </View>

            {/* Sous-titre explicatif */}
            <Text
              style={[
                styles.subtitle,
                { color: subtitleColor, fontSize: font(13.5) },
              ]}
            >
              Saisissez le code du coupon de pari
            </Text>

            {/* Champ de saisie avec bouton effacer (✕) */}
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: inputBorderColor,
                  borderBottomColor: inputBorderColor,
                },
              ]}
            >
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                onChangeText={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                value={couponCode}
                returnKeyType="done"
                onSubmitEditing={handleDownload}
                underlineColorAndroid="transparent"
                style={[
                  styles.input,
                  {
                    color: textColor,
                    fontSize: font(16.5),
                  },
                  Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                ]}
              />

              {couponCode.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Effacer le code"
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={moderateScale(19)}
                    color={subtitleColor}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Message d'erreur inline si code invalide */}
            {Boolean(errorText) && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.errorText, { fontSize: font(12.5) }]}>
                  {errorText}
                </Text>
              </View>
            )}

            {/* Bouton Télécharger (aucun ombrage) */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isButtonDisabled}
              onPress={handleDownload}
              style={[
                styles.downloadButton,
                {
                  backgroundColor: isButtonDisabled
                    ? (isDark ? '#2C3A4B' : '#E2E8F0')
                    : primaryColor,
                  paddingVertical: moderateScale(14),
                  marginTop: errorText ? moderateScale(12) : moderateScale(20),
                },
              ]}
            >
              <Text
                style={[
                  styles.downloadButtonText,
                  {
                    color: isButtonDisabled
                      ? (isDark ? '#64748B' : '#94A3B8')
                      : '#FFFFFF',
                    fontSize: font(15.5),
                  },
                ]}
              >
                Télécharger
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
    zIndex: 99999,
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
  keyboardAvoid: {
    width: '100%',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 26,
  },
  tabletSheet: {
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 22,
    marginBottom: 20,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
  },
  subtitle: {
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingBottom: 4,
  },
  input: {
    flex: 1,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
    letterSpacing: 1,
  },
  clearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#EF4444',
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  downloadButton: {
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
});

export default LoadCouponModal;
