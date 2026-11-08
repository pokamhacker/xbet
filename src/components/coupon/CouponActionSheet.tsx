import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import {
  SaveCouponActionIcon,
  LoadCouponActionIcon,
  CreateCouponActionIcon,
} from '../common/CouponIcons';

const ShareCouponActionIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#567994',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 5 L20 11 L14 17"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 11 H11.5 C7.5 11 4.5 14 4.5 18 V19"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface CouponActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaveCoupon: () => void;
  onLoadCoupon: () => void;
  onCreateCoupon: () => void;
  onShareCoupon?: () => void;
}

export const CouponActionSheet: React.FC<CouponActionSheetProps> = ({
  visible,
  onClose,
  onSaveCoupon,
  onLoadCoupon,
  onCreateCoupon,
  onShareCoupon,
}) => {
  const { currentTheme, setBottomBarHidden } = useThemeStore();
  const isDark = currentTheme?.isDark ?? false;

  const sheetBg = currentTheme?.cardBackground || (isDark ? '#1E293B' : '#FFFFFF');
  const textColor = currentTheme?.textPrimary || (isDark ? '#F8FAFC' : '#1E242B');
  const titleColor = currentTheme?.textPrimary || (isDark ? '#F8FAFC' : '#1E242B');
  const iconColor = isDark ? '#94A3B8' : '#567994';
  const borderColor = currentTheme?.border || (isDark ? '#334155' : '#F0F2F5');
  const handleColor = isDark ? '#475569' : '#CBD5E1';

  // Masquer la barre de navigation globale dès que l'interface "Choisissez une action" est ouverte
  useEffect(() => {
    if (visible) {
      setBottomBarHidden(true);
    }
    return () => {
      setBottomBarHidden(false);
    };
  }, [visible, setBottomBarHidden]);

  const handleClose = () => {
    setBottomBarHidden(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={handleClose}
      transparent
      visible={visible}
      statusBarTranslucent={true}
    >
      <TouchableOpacity activeOpacity={1} onPress={handleClose} style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.sheetContainer, { backgroundColor: sheetBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Poignée du Bottom Sheet */}
          <View style={[styles.handle, { backgroundColor: handleColor }]} />

          {/* Titre centré */}
          <Text style={[styles.title, { color: titleColor }]}>Choisissez une action</Text>

          {/* Option 1: Enregistrer */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: borderColor }]}
            activeOpacity={0.7}
            onPress={() => {
              handleClose();
              onSaveCoupon();
            }}
          >
            <View style={styles.iconWrapper}>
              <SaveCouponActionIcon color={iconColor} size={22} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>
              Enregistrer le coupon de pari
            </Text>
          </TouchableOpacity>

          {/* Option 2: Charger */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: borderColor }]}
            activeOpacity={0.7}
            onPress={() => {
              handleClose();
              onLoadCoupon();
            }}
          >
            <View style={styles.iconWrapper}>
              <LoadCouponActionIcon color={iconColor} size={22} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>
              Charger le coupon de pari
            </Text>
          </TouchableOpacity>

          {/* Option 3: Créer */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: borderColor }]}
            activeOpacity={0.7}
            onPress={() => {
              handleClose();
              onCreateCoupon();
            }}
          >
            <View style={styles.iconWrapper}>
              <CreateCouponActionIcon color={iconColor} size={22} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>
              Créer coupon de pari
            </Text>
          </TouchableOpacity>

          {/* Option 4: Partage */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={() => {
              handleClose();
              if (onShareCoupon) {
                onShareCoupon();
              } else {
                onSaveCoupon();
              }
            }}
          >
            <View style={styles.iconWrapper}>
              <ShareCouponActionIcon color={iconColor} size={22} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>
              Partage de votre coupon de pari
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
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
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 32 : 22,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E242B',
    textAlign: 'center',
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  iconWrapper: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E242B',
  },
});

export default CouponActionSheet;
