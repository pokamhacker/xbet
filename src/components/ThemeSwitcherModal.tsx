import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore, BrandKey, BRAND_THEMES } from '../store/themeStore';
import { BrandLogo } from './common/BrandLogo';

interface ThemeSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  visible,
  onClose,
}) => {
  const { currentBrand, setBrand, setTheme, theme, currentTheme } = useThemeStore();

  const brandList: BrandKey[] = ['1xbet', '1xbet-dark', 'melbet', 'melbet-light', 'paripesa'];

  const handleSelectBrand = (brand: BrandKey) => {
    setTheme(brand);
    setBrand(brand);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.modalBackground || (theme.isDark ? '#243242' : '#FFFFFF'),
              borderColor: theme.border || (theme.isDark ? '#2C3A4B' : '#E2E8F0'),
            },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleWrap}>
              <Ionicons
                name="color-palette-outline"
                size={22}
                color={theme.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                Thème & Marque White-Label
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Fermer"
            >
              <Ionicons
                name="close"
                size={22}
                color={theme.isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.modalSubtitle,
              { color: theme.isDark ? '#94A3B8' : '#64748B' },
            ]}
          >
            Sélectionnez l'identité visuelle de votre application. La barre de navigation et les palettes se reconfigurent instantanément.
          </Text>

          <ScrollView style={styles.brandList} showsVerticalScrollIndicator={false}>
            {brandList.map((brandKey) => {
              const b = BRAND_THEMES[brandKey];
              const isSelected = currentBrand === brandKey;

              return (
                <TouchableOpacity
                  key={brandKey}
                  style={[
                    styles.brandCard,
                    {
                      backgroundColor: theme.isDark ? (theme.cardBackground || '#212D3B') : '#F8FAFC',
                      borderColor: isSelected
                        ? b.primary
                        : theme.isDark
                        ? (theme.border || '#2C3A4B')
                        : '#E2E8F0',
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectBrand(brandKey)}
                >
                  <View style={styles.brandCardHeader}>
                    <View style={styles.brandTitleRow}>
                      <BrandLogo brand={brandKey} size={16} variant="header" isDark={b.isDark} />
                      <Text
                        style={[
                          styles.brandName,
                          { color: theme.isDark ? '#F8FAFC' : '#0F172A', marginLeft: 8 },
                        ]}
                      >
                        ({b.displayName})
                      </Text>
                      {isSelected && (
                        <View
                          style={[
                            styles.activePill,
                            { backgroundColor: b.badgeBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activePillText,
                              { color: b.primary },
                            ]}
                          >
                            Actif
                          </Text>
                        </View>
                      )}
                    </View>

                    <Ionicons
                      name={
                        isSelected ? 'checkmark-circle' : 'ellipse-outline'
                      }
                      size={22}
                      color={
                        isSelected
                          ? b.primary
                          : theme.isDark
                          ? '#475569'
                          : '#CBD5E1'
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.brandTagline,
                      { color: theme.isDark ? '#94A3B8' : '#64748B' },
                    ]}
                  >
                    {b.tagline}
                  </Text>

                  {/* Swatches preview */}
                  <View style={styles.swatchRow}>
                    <View style={styles.swatchItem}>
                      <View
                        style={[
                          styles.swatchCircle,
                          { backgroundColor: b.primary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.swatchLabel,
                          { color: theme.isDark ? '#64748B' : '#94A3B8' },
                        ]}
                      >
                        Primaire
                      </Text>
                    </View>

                    <View style={styles.swatchItem}>
                      <View
                        style={[
                          styles.swatchCircle,
                          {
                            backgroundColor: b.barBg,
                            borderWidth: 1,
                            borderColor: b.barBorder,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.swatchLabel,
                          { color: theme.isDark ? '#64748B' : '#94A3B8' },
                        ]}
                      >
                        Barre
                      </Text>
                    </View>

                    <View style={styles.swatchItem}>
                      <View
                        style={[
                          styles.swatchCircle,
                          { backgroundColor: b.inactive },
                        ]}
                      />
                      <Text
                        style={[
                          styles.swatchLabel,
                          { color: theme.isDark ? '#64748B' : '#94A3B8' },
                        ]}
                      >
                        Inactif
                      </Text>
                    </View>

                    <View style={styles.swatchItem}>
                      <View
                        style={[
                          styles.swatchCircle,
                          {
                            backgroundColor: b.centerBg,
                            borderWidth: 1,
                            borderColor: b.centerTint,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.swatchLabel,
                          { color: theme.isDark ? '#64748B' : '#94A3B8' },
                        ]}
                      >
                        Coupon
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Confirm button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              { backgroundColor: theme.primary },
            ]}
            activeOpacity={0.85}
            onPress={onClose}
          >
            <Text
              style={[
                styles.confirmBtnText,
                { color: theme.name.startsWith('melbet') ? '#000000' : '#FFFFFF' },
              ]}
            >
              Appliquer et Fermer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  brandList: {
    marginBottom: 16,
  },
  brandCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  brandCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandColorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  brandTagline: {
    fontSize: 12.5,
    marginBottom: 12,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  swatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatchCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  swatchLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  confirmBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
