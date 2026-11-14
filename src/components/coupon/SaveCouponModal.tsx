import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Rect,
  G,
} from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';

export interface SaveCouponModalProps {
  visible: boolean;
  couponCode: string;
  onClose: () => void;
}

export interface ClearCouponConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Triangle d'attention 3D jaune/ambre incliné avec point d'exclamation (!)
 * Reproduit fidèlement l'icône 3D de la Vidéo 1 à 00:11 (width: 64, height: 64)
 */
const WarningTriangle3DIcon: React.FC = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim, scaleAnim]);

  return (
    <Animated.View
      style={{
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
      }}
    >
      <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
        <Defs>
          <LinearGradient id="warn3dDepth" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#92400E" />
          </LinearGradient>
          <LinearGradient id="warn3dFront" x1="15%" y1="5%" x2="85%" y2="95%">
            <Stop offset="0%" stopColor="#FDE047" />
            <Stop offset="45%" stopColor="#FBBF24" />
            <Stop offset="100%" stopColor="#F59E0B" />
          </LinearGradient>
          <LinearGradient id="warn3dGloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <G transform="rotate(-8 32 32)">
          {/* Tranche 3D arrière / extrusion */}
          <Path
            d="M36.5 11C39.2 6.3 45.8 6.3 48.5 11L61.2 33.5C63.9 38.2 60.5 44 55.1 44H22.9C17.5 44 14.1 38.2 16.8 33.5L36.5 11Z"
            fill="url(#warn3dDepth)"
            transform="translate(-4, 8)"
          />
          {/* Face avant bombée jaune/ambre */}
          <Path
            d="M27.2 10.5C30.1 5.4 37.5 5.4 40.4 10.5L56.4 38.5C59.3 43.6 55.6 50 49.8 50H17.8C12 50 8.3 43.6 11.2 38.5L27.2 10.5Z"
            fill="url(#warn3dFront)"
          />
          {/* Reflet supérieur glossy */}
          <Path
            d="M28.6 12.2C30.9 8.2 36.7 8.2 39 12.2L49.5 30.5C40 27 26 27 18.2 30.5L28.6 12.2Z"
            fill="url(#warn3dGloss)"
          />
          {/* Point d'exclamation (!) sombre creusé */}
          <Rect
            x="31.3"
            y="20"
            width="5"
            height="14.5"
            rx="2.5"
            fill="#2B2D38"
          />
          <Circle cx="33.8" cy="40.5" r="2.8" fill="#2B2D38" />
        </G>
      </Svg>
    </Animated.View>
  );
};

/**
 * Coussin / Losange 3D Bleu-Violet animé qui pivote et affiche "i"
 * Reproduit fidèlement l'icône 3D de la Vidéo 1 à 00:12 et 00:14 (width: 64, height: 64)
 */
export const InfoCushion3DIcon: React.FC = () => {
  const rotAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 85,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(rotAnim, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [rotAnim, scaleAnim]);

  const rotateZ = rotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-28deg', '-10deg'],
  });

  return (
    <Animated.View
      style={{
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }, { rotate: rotateZ }],
      }}
    >
      <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
        <Defs>
          <LinearGradient id="cushionSide" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4338CA" />
            <Stop offset="100%" stopColor="#312E81" />
          </LinearGradient>
          <LinearGradient id="cushionFront" x1="10%" y1="5%" x2="90%" y2="95%">
            <Stop offset="0%" stopColor="#93C5FD" />
            <Stop offset="45%" stopColor="#6366F1" />
            <Stop offset="100%" stopColor="#4F46E5" />
          </LinearGradient>
          <RadialGradient id="cushionHighlight" cx="35%" cy="28%" r="55%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Extrusion 3D latérale */}
        <Rect
          x="15"
          y="15"
          width="38"
          height="38"
          rx="12"
          fill="url(#cushionSide)"
          transform="rotate(28 34 34)"
        />
        {/* Face avant du coussin 3D */}
        <Rect
          x="11"
          y="11"
          width="38"
          height="38"
          rx="12"
          fill="url(#cushionFront)"
          transform="rotate(28 30 30)"
        />
        {/* Reflet bombé 3D */}
        <Rect
          x="11"
          y="11"
          width="38"
          height="38"
          rx="12"
          fill="url(#cushionHighlight)"
          transform="rotate(28 30 30)"
        />
        {/* Symbole "i" au centre */}
        <G transform="rotate(10 30 30)">
          <Circle cx="30" cy="21.5" r="2.5" fill="#1E1B4B" />
          <Rect x="27.6" y="26.5" width="4.8" height="12.5" rx="2.4" fill="#1E1B4B" />
        </G>
      </Svg>
    </Animated.View>
  );
};

export const SaveCouponModal: React.FC<SaveCouponModalProps> = ({
  visible,
  couponCode,
  onClose,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark;
  const isMelbet = currentTheme.name.toLowerCase().includes('melbet');

  const [step, setStep] = useState<'save' | 'copied'>('save');

  useEffect(() => {
    if (visible) {
      setStep('save');
    }
  }, [visible, couponCode]);

  const accentColor = isMelbet
    ? '#E58E26'
    : currentTheme.colors.primary || '#228BE6';

  const dialogBg = isMelbet
    ? isDark
      ? '#2B3037'
      : '#FFFFFF'
    : isDark
      ? currentTheme.colors.cardBackground || '#1E2733'
      : '#FFFFFF';

  const buttonBg = isDark ? '#383E47' : '#F1F5F9';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const messageColor = isDark ? '#A0AAB4' : '#64748B';

  const handleCopy = async () => {
    if (!couponCode) return;
    try {
      await Clipboard.setStringAsync(couponCode);
    } catch {
      // Fallback silencieux
    }
    setStep('copied');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.dialogContainer, { backgroundColor: dialogBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {step === 'save' ? (
            <>
              {/* Icône 3D Triangle d'attention jaune/ambre */}
              <View style={styles.iconWrapper}>
                <WarningTriangle3DIcon />
              </View>

              {/* Titre Enregistrer */}
              <Text style={[styles.title, { color: titleColor }]}>
                Enregistrer
              </Text>

              {/* Message explicatif avec code */}
              <Text style={[styles.message, { color: messageColor }]}>
                Coupon de pari enregistré avec succès avec le code{' '}
                <Text style={{ color: titleColor, fontWeight: '700' }}>
                  {couponCode}
                </Text>
                . Vous pouvez charger votre coupon de pari à l'aide de ce code
                ou le partager avec vos amis afin de jouer ensemble !
              </Text>

              {/* Boutons Annuler et Copier CÔTE À CÔTE */}
              <View style={styles.sideBySideButtons}>
                <TouchableOpacity
                  style={[styles.halfButton, { backgroundColor: buttonBg }]}
                  activeOpacity={0.8}
                  onPress={onClose}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: accentColor, fontWeight: '600' },
                    ]}
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.halfButton, { backgroundColor: buttonBg }]}
                  activeOpacity={0.8}
                  onPress={handleCopy}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: accentColor, fontWeight: '700' },
                    ]}
                  >
                    Copier
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Icône 3D Coussin bleu-violet avec "i" */}
              <View style={styles.iconWrapper}>
                <InfoCushion3DIcon />
              </View>

              {/* Titre Coupon */}
              <Text style={[styles.title, { color: titleColor }]}>Coupon</Text>

              {/* Sous-titre Code copié */}
              <Text style={[styles.message, { color: messageColor, marginVertical: 10 }]}>
                Code copié
              </Text>

              {/* Bouton OK pleine largeur */}
              <TouchableOpacity
                style={[styles.fullButton, { backgroundColor: buttonBg }]}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: accentColor, fontWeight: '700' },
                  ]}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/**
 * Modale 3D de confirmation de suppression du coupon (Vidéo 1 à 00:14)
 */
export const ClearCouponConfirmModal: React.FC<ClearCouponConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark;
  const isMelbet = currentTheme.name.toLowerCase().includes('melbet');

  const accentColor = isMelbet
    ? '#E58E26'
    : currentTheme.colors.primary || '#228BE6';

  const dialogBg = isMelbet
    ? isDark
      ? '#2B3037'
      : '#FFFFFF'
    : isDark
      ? currentTheme.colors.cardBackground || '#1E2733'
      : '#FFFFFF';

  const buttonBg = isDark ? '#383E47' : '#F1F5F9';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const messageColor = isDark ? '#A0AAB4' : '#64748B';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.dialogContainer, { backgroundColor: dialogBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.iconWrapper}>
            <InfoCushion3DIcon />
          </View>

          <Text style={[styles.title, { color: titleColor }]}>
            Vider le coupon de pari
          </Text>

          <Text style={[styles.message, { color: messageColor }]}>
            Êtes-vous sûr(e) de vouloir effacer cette liste ?
          </Text>

          <View style={styles.sideBySideButtons}>
            <TouchableOpacity
              style={[styles.halfButton, { backgroundColor: buttonBg }]}
              activeOpacity={0.8}
              onPress={onCancel}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: accentColor, fontWeight: '600' },
                ]}
              >
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.halfButton, { backgroundColor: buttonBg }]}
              activeOpacity={0.8}
              onPress={onConfirm}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: accentColor, fontWeight: '700' },
                ]}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 336,
    borderRadius: 18,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  message: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: 12,
  },
  sideBySideButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  halfButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButton: {
    width: '100%',
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 15,
  },
});

export default SaveCouponModal;
