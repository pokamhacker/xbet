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
 * Triangle d'attention 3D jaune/ambre chaud droit avec perspective 3D douce vers la gauche
 * et grand point d'exclamation (!) gris anthracite (#262B31) centré (width: 96, height: 96)
 */
const WarningTriangle3DIcon: React.FC = () => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={{
        width: 96,
        height: 96,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
        {/* Ombre portée douce sous la base du triangle 3D */}
        <Path
          d="M18 84C18 80.5 31 78 48 78C65 78 78 80.5 78 84C78 87.5 65 90 48 90C31 90 18 87.5 18 84Z"
          fill="#000000"
          fillOpacity={0.22}
        />

        {/* Tranche 3D inférieure/gauche (#D98218) donnant l'épaisseur en perspective douce */}
        <Path
          d="M37.8 17.5C42.6 9.2 54.6 9.2 59.4 17.5L83.2 58.8C88.0 67.1 82.0 77.5 72.4 77.5H24.8C15.2 77.5 9.2 67.1 14.0 58.8L37.8 17.5Z"
          fill="#D98218"
          transform="translate(-3.5, 4.5)"
        />

        {/* Face avant principale ambre chaud (#F5A623) aux coins très arrondis */}
        <Path
          d="M39.2 16.0C44.0 7.7 56.0 7.7 60.8 16.0L84.6 57.3C89.4 65.6 83.4 76.0 73.8 76.0H26.2C16.6 76.0 10.6 65.6 15.4 57.3L39.2 16.0Z"
          fill="#F5A623"
        />

        {/* Dégradé supérieur jaune doré lumineux (#FFE047) */}
        <Path
          d="M40.2 17.2C44.5 9.8 55.5 9.8 59.8 17.2L79.5 51.4C64.0 56.5 36.0 56.5 20.5 51.4L40.2 17.2Z"
          fill="#FFE047"
          fillOpacity={0.78}
        />

        {/* Dôme de brillance supérieur glossy */}
        <Path
          d="M42.0 19.0C45.5 13.0 54.5 13.0 58.0 19.0L70.5 40.6C58.0 37.2 42.0 37.2 29.5 40.6L42.0 19.0Z"
          fill="#FFFFFF"
          fillOpacity={0.35}
        />

        {/* Grand point d'exclamation (!) gris anthracite (#262B31) centré */}
        <Rect
          x="45.8"
          y="28.5"
          width="7.4"
          height="23.5"
          rx="3.7"
          fill="#262B31"
        />
        <Circle cx="49.5" cy="61.5" r="4.3" fill="#262B31" />
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
    ? '#D89228'
    : currentTheme.colors.primary || '#228BE6';

  const dialogBg = isMelbet
    ? isDark
      ? '#353B43'
      : '#FFFFFF'
    : isDark
      ? '#353B43'
      : '#FFFFFF';

  const buttonBg = isDark
    ? isMelbet
      ? '#48453E'
      : '#383E47'
    : '#F1F5F9';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const messageColor = isDark ? '#A5AEB7' : '#64748B';

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
              {/* Icône 3D Triangle d'attention jaune/ambre (96x96, marginBottom: 20) */}
              <View style={styles.iconWrapper}>
                <WarningTriangle3DIcon />
              </View>

              {/* Titre Enregistrer */}
              <Text style={[styles.title, { color: titleColor }]}>
                Enregistrer
              </Text>

              {/* Message explicatif avec code (même police, graisse 400 et couleur #A5AEB7) */}
              <Text style={[styles.message, { color: messageColor }]}>
                {`Coupon de pari enregistré avec succès avec le code ${couponCode}. Vous pouvez charger votre coupon de pari à l'aide de ce code ou le partager avec vos amis afin de jouer ensemble !`}
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
                      { color: accentColor, fontWeight: '600' },
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
              <View style={[styles.iconWrapper, { marginBottom: 16 }]}>
                <InfoCushion3DIcon />
              </View>

              {/* Titre Coupon */}
              <Text style={[styles.title, { color: titleColor }]}>Coupon</Text>

              {/* Sous-titre Code copié */}
              <Text style={[styles.message, { color: messageColor }]}>
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
                    { color: accentColor, fontWeight: '600' },
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
    ? '#D89228'
    : currentTheme.colors.primary || '#228BE6';

  const dialogBg = isDark ? '#353B43' : '#FFFFFF';
  const buttonBg = isDark
    ? isMelbet
      ? '#48453E'
      : '#383E47'
    : '#F1F5F9';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const messageColor = isDark ? '#A5AEB7' : '#64748B';

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
          <View style={[styles.iconWrapper, { marginBottom: 16 }]}>
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
                  { color: accentColor, fontWeight: '600' },
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
  },
  dialogContainer: {
    width: '82%',
    maxWidth: 320,
    backgroundColor: '#353B43',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
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
    fontSize: 17.5,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14.5,
    fontWeight: '400',
    color: '#A5AEB7',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  sideBySideButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  halfButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#48453E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullButton: {
    width: '100%',
    height: 42,
    borderRadius: 10,
    backgroundColor: '#48453E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SaveCouponModal;
