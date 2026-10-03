import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';

export interface CouponActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaveCoupon: () => void;
  onLoadCoupon: () => void;
  onCreateCoupon: () => void;
}

export const CouponActionSheet: React.FC<CouponActionSheetProps> = ({
  visible,
  onClose,
  onSaveCoupon,
  onLoadCoupon,
  onCreateCoupon,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark;

  const sheetBg = currentTheme.cardBackground;
  const textColor = currentTheme.textPrimary;
  const titleColor = currentTheme.textPrimary;
  const iconColor = currentTheme.primary;
  const borderColor = currentTheme.border || (isDark ? '#334155' : '#F1F5F9');
  const handleColor = isDark ? '#475569' : '#CBD5E1';

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.overlay}>
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
            <Feather color={iconColor} name="download" size={24} style={styles.icon} />
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
            <Feather color={iconColor} name="upload" size={24} style={styles.icon} />
            <Text style={[styles.optionText, { color: textColor }]}>Charger le coupon de pari</Text>
          </TouchableOpacity>

          {/* Option 3: Créer */}
          <TouchableOpacity
            style={[styles.optionRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              onCreateCoupon();
            }}
          >
            <Feather color={iconColor} name="sliders" size={24} style={styles.icon} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
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
  icon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
});

export default CouponActionSheet;
