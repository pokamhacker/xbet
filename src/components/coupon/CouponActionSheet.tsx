import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { CreateCouponActionIcon } from '../common/CouponIcons';

interface CouponActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onSaveCoupon: () => void;
  onLoadCoupon: () => void;
  onCreateCoupon: () => void;
  onShareCoupon: () => void;
  hasEvents?: boolean;
  theme?: any;
}

export const CouponActionSheet: React.FC<CouponActionSheetProps> = ({
  visible,
  onClose,
  onSaveCoupon,
  onLoadCoupon,
  onCreateCoupon,
  onShareCoupon,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark;
  const isMelbet = currentTheme.name.toLowerCase().includes('melbet');

  const sheetBg = isMelbet
    ? isDark
      ? '#262B31'
      : '#FFFFFF'
    : isDark
      ? currentTheme.colors.cardBackground || '#1E2733'
      : '#FFFFFF';

  const handleColor = isDark ? '#545B64' : '#CBD5E1';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const itemTextColor = isDark ? '#E5E7EB' : '#1F2937';
  const iconColor = isDark ? '#8A949E' : '#64748B';
  const dividerColor = isDark
    ? 'rgba(255, 255, 255, 0.06)'
    : 'rgba(0, 0, 0, 0.07)';

  const actions = [
    {
      id: 'save',
      label: 'Enregistrer le coupon de pari',
      onPress: () => {
        onClose();
        setTimeout(() => onSaveCoupon(), 120);
      },
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4V15M12 15L8 11M12 15L16 11"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M4 16V18.5C4 19.6 4.9 20.5 6 20.5H18C19.1 20.5 20 19.6 20 18.5V16"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
    },
    {
      id: 'load',
      label: 'Charger le coupon de pari',
      onPress: () => {
        onClose();
        setTimeout(() => onLoadCoupon(), 120);
      },
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15V4M12 4L8 8M12 4L16 8"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M4 16V18.5C4 19.6 4.9 20.5 6 20.5H18C19.1 20.5 20 19.6 20 18.5V16"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
    },
    {
      id: 'create',
      label: 'Créer un coupon de pari',
      onPress: () => {
        onClose();
        setTimeout(() => onCreateCoupon(), 120);
      },
      renderIcon: () => <CreateCouponActionIcon size={20} color={iconColor} />,
    },
    {
      id: 'share',
      label: 'Share your bet slip',
      onPress: () => {
        onClose();
        setTimeout(() => onShareCoupon(), 120);
      },
      renderIcon: () => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15V4M12 4L8 8M12 4L16 8"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6 12H5C3.89543 12 3 12.8954 3 14V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V14C21 12.8954 20.1046 12 19 12H18"
            stroke={iconColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheetContainer, { backgroundColor: sheetBg }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Poignée supérieure */}
          <View style={styles.handleWrapper}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>

          {/* Titre centré */}
          <Text style={[styles.sheetTitle, { color: titleColor }]}>
            Choisissez une action
          </Text>

          {/* Liste des 4 actions */}
          <View style={styles.actionsList}>
            {actions.map((item, idx) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  style={styles.actionRow}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                >
                  <View style={styles.iconBox}>{item.renderIcon()}</View>
                  <Text style={[styles.actionLabel, { color: itemTextColor }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
                {idx < actions.length - 1 && (
                  <View
                    style={[styles.separator, { backgroundColor: dividerColor }]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 28,
    paddingHorizontal: 16,
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 34,
    height: 4,
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  actionsList: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionLabel: {
    fontSize: 14.5,
    fontWeight: '400',
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});

export default CouponActionSheet;
