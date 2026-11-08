import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import {
  SaveCouponActionIcon,
  LoadCouponActionIcon,
  CreateCouponActionIcon,
} from '../common/CouponIcons';

export interface CouponActionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaveCoupon: () => void;
  onLoadCoupon: () => void;
  onCreateCoupon?: () => void;
  onClearAll?: () => void;
}

export const CouponActionsBottomSheet: React.FC<CouponActionsBottomSheetProps> = ({
  visible,
  onClose,
  onSaveCoupon,
  onLoadCoupon,
  onCreateCoupon,
}) => {
  const { currentTheme, setBottomBarHidden } = useThemeStore();
  const isDark = currentTheme?.isDark ?? false;

  const sheetBg = isDark ? (currentTheme?.cardBackground || '#1E293B') : '#FFFFFF';
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const titleColor = isDark ? '#F8FAFC' : '#0F172A';
  const iconColor = isDark ? '#94A3B8' : '#567994';
  const borderColor = isDark ? '#334155' : '#F1F5F9';
  const handleColor = isDark ? '#475569' : '#CBD5E1';

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
              onClose();
              onSaveCoupon();
            }}
          >
            <View style={styles.iconWrapper}>
              <SaveCouponActionIcon color={iconColor} size={24} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>Enregistrer le coupon de pari</Text>
          </TouchableOpacity>

          {/* Option 2: Charger */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomColor: borderColor }]}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onLoadCoupon();
            }}
          >
            <View style={styles.iconWrapper}>
              <LoadCouponActionIcon color={iconColor} size={24} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>Charger le coupon de pari</Text>
          </TouchableOpacity>

          {/* Option 3: Créer */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              if (onCreateCoupon) onCreateCoupon();
            }}
          >
            <View style={styles.iconWrapper}>
              <CreateCouponActionIcon color={iconColor} size={24} />
            </View>
            <Text style={[styles.optionText, { color: textColor }]}>Créer un coupon de pari</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
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
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
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
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.1,
  },
});

export default CouponActionsBottomSheet;
