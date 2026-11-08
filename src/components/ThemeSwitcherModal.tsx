import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackArrowIcon } from './common/BackArrowIcon';
import { useThemeStore } from '../stores/themeStore';
import {
  BrandChoice,
  ModeChoice,
  DispositionType,
  SaveModalStyleType,
  getAppTheme,
} from '../theme/themes';

export interface ThemeSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    currentTheme,
    isDark,
    disposition,
    setDisposition,
    saveModalStyle,
    setSaveModalStyle,
    brandChoice,
    setBrandChoice,
    modeChoice,
    setModeChoice,
    deviceInterface,
    setDeviceInterface,
  } = useThemeStore();

  const brandPrimaryColor =
    currentTheme?.primary ||
    (brandChoice === 'melbet'
      ? '#E7B12C'
      : brandChoice === 'winwin'
      ? '#7CBD17'
      : brandChoice === 'betwinner'
      ? '#007348'
      : brandChoice === 'paripesa'
      ? '#1E5BBB'
      : brandChoice === 'megaparis' || brandChoice === 'megapari'
      ? '#D3242A'
      : '#2B78C9');

  const activeBorderColor = brandPrimaryColor;
  const activeBgColor = isDark ? '#1C293A' : '#EDF5FD';
  const inactiveBorderColor = isDark ? '#263342' : '#E8EDF3';
  const inactiveBgColor = isDark ? '#16202C' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#1E293B';
  const sectionTitleColor = isDark ? '#94A3B8' : '#5A738E';
  const screenBg = isDark ? currentTheme?.background || '#0F172A' : '#F8FAFC';

  // Helper pour les 3 capsules d'échantillons de couleur
  const renderSwatches = (c1: string, c2: string, c3: string) => (
    <View style={styles.swatchRow}>
      <View style={[styles.swatchPill, { backgroundColor: c1 }]} />
      <View
        style={[
          styles.swatchPill,
          {
            backgroundColor: c2,
            borderWidth: c2 === '#FFFFFF' ? 1 : 0,
            borderColor: '#E2E8F0',
          },
        ]}
      />
      <View style={[styles.swatchPill, { backgroundColor: c3 }]} />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: screenBg }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />

        {/* Barre Supérieure / Header */}
        <View style={[styles.headerBar, { borderBottomColor: inactiveBorderColor }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Retour"
          >
            <BackArrowIcon size={24} color={textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Apparence</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ===================================================================== */}
          {/* 1. DISPOSITION                                                        */}
          {/* ===================================================================== */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>DISPOSITION</Text>

          {([
            { id: 'local', label: 'Local' },
            { id: 'global', label: 'Global' },
            { id: 'originale', label: 'Originale' },
          ] as const).map((disp) => {
            const isSelected = disposition === disp.id;
            return (
              <TouchableOpacity
                key={disp.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                    borderColor: isSelected ? activeBorderColor : inactiveBorderColor,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setDisposition(disp.id)}
              >
                {renderSwatches('#EDF2F7', '#FFFFFF', brandPrimaryColor)}
                <Text style={[styles.optionLabel, { color: textPrimary }]}>{disp.label}</Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={activeBorderColor}
                    style={styles.checkmarkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {/* ===================================================================== */}
          {/* STYLE DE L\'INTERFACE D\'APPAREIL */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            STYLE D'INTERFACE (IPHONE / ANDROID)
          </Text>
          <View style={styles.modalSaveRow}>
            {([
              { id: 'auto', label: 'Auto (D?tection)' },
              { id: 'iphone', label: 'iPhone (iOS)' },
              { id: 'android', label: 'Android' },
            ] as const).map((dev) => {
              const isSelected = deviceInterface === dev.id;
              return (
                <TouchableOpacity
                  key={dev.id}
                  style={[
                    styles.modalSaveCard,
                    {
                      backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                      borderColor: isSelected ? activeBorderColor : inactiveBorderColor,
                      borderWidth: isSelected ? 2 : 1,
                      flex: 1,
                      marginHorizontal: 3,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setDeviceInterface(dev.id)}
                >
                  <Text style={[styles.cardBottomLabel, { color: textPrimary, fontSize: 11 }]}>
                    {dev.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={activeBorderColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. MODALE SAUVEGARDER                                                 */}
          {/* ===================================================================== */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            MODALE SAUVEGARDER
          </Text>

          <View style={styles.modalSaveRow}>
            {/* Carte 1 : Local */}
            <TouchableOpacity
              style={[
                styles.modalSaveCard,
                {
                  backgroundColor: saveModalStyle === 'local' ? activeBgColor : inactiveBgColor,
                  borderColor: saveModalStyle === 'local' ? activeBorderColor : inactiveBorderColor,
                  borderWidth: saveModalStyle === 'local' ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setSaveModalStyle('local')}
            >
              <View style={[styles.previewBox, { backgroundColor: isDark ? '#22303E' : '#EDF4FA' }]}>
                <Text style={[styles.previewTitle, { color: brandPrimaryColor }]}>Sauvegarder</Text>
                <Text style={[styles.previewLink, { color: brandPrimaryColor }]}>Copier</Text>
                <Text style={[styles.previewLink, { color: brandPrimaryColor }]}>Annuler</Text>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={[styles.cardBottomLabel, { color: textPrimary }]}>Local</Text>
                {saveModalStyle === 'local' && (
                  <Ionicons name="checkmark" size={14} color={activeBorderColor} style={{ marginLeft: 3 }} />
                )}
              </View>
            </TouchableOpacity>

            {/* Carte 2 : Global */}
            <TouchableOpacity
              style={[
                styles.modalSaveCard,
                {
                  backgroundColor: saveModalStyle === 'global' ? activeBgColor : inactiveBgColor,
                  borderColor: saveModalStyle === 'global' ? activeBorderColor : inactiveBorderColor,
                  borderWidth: saveModalStyle === 'global' ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setSaveModalStyle('global')}
            >
              <View style={[styles.previewBox, { backgroundColor: isDark ? '#22303E' : '#EDF4FA' }]}>
                <Text style={[styles.previewTitle, { color: textPrimary }]}>Sauvegarder</Text>
                <View style={styles.previewBtnRow}>
                  <Text style={[styles.previewGhostBtn, { color: isDark ? '#94A3B8' : '#64748B' }]}>Annuler</Text>
                  <View style={[styles.previewSolidBtn, { backgroundColor: brandPrimaryColor }]}>
                    <Text style={styles.previewSolidBtnText}>Copier</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={[styles.cardBottomLabel, { color: textPrimary }]}>Global</Text>
                {saveModalStyle === 'global' && (
                  <Ionicons name="checkmark" size={14} color={activeBorderColor} style={{ marginLeft: 3 }} />
                )}
              </View>
            </TouchableOpacity>

            {/* Carte 3 : Originale */}
            <TouchableOpacity
              style={[
                styles.modalSaveCard,
                {
                  backgroundColor: saveModalStyle === 'originale' ? activeBgColor : inactiveBgColor,
                  borderColor: saveModalStyle === 'originale' ? activeBorderColor : inactiveBorderColor,
                  borderWidth: saveModalStyle === 'originale' ? 2 : 1,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setSaveModalStyle('originale')}
            >
              <View style={[styles.previewBox, { backgroundColor: isDark ? '#22303E' : '#EDF4FA' }]}>
                <View style={[styles.previewDot, { backgroundColor: brandPrimaryColor }]} />
                <Text style={[styles.previewTitle, { color: textPrimary, marginTop: 2 }]}>Sauvegarder</Text>
                <View style={styles.previewLinksRow}>
                  <Text style={[styles.previewGhostBtn, { color: isDark ? '#94A3B8' : '#64748B' }]}>Annuler</Text>
                  <Text style={[styles.previewLink, { color: brandPrimaryColor }]}>Copier</Text>
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={[styles.cardBottomLabel, { color: textPrimary }]}>Originale</Text>
                {saveModalStyle === 'originale' && (
                  <Ionicons name="checkmark" size={14} color={activeBorderColor} style={{ marginLeft: 3 }} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* ===================================================================== */}
          {/* 3. MARQUE                                                             */}
          {/* ===================================================================== */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>MARQUE</Text>

          {[
            { id: '1xbet', label: '1xbet', color: '#2B78C9' },
            { id: 'melbet', label: 'Melbet', color: '#E7B12C' },
            { id: 'winwin', label: 'WinWin', color: '#7CBD17' },
            { id: 'betwinner', label: 'BetWinner', color: '#007348' },
            { id: 'paripesa', label: 'PariPesa', color: '#1E5BBB' },
            { id: 'megaparis', label: 'MegaPari', color: '#D3242A' },
          ].map((item) => {
            const isSelected = brandChoice === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                    borderColor: isSelected ? activeBorderColor : inactiveBorderColor,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setBrandChoice(item.id as BrandChoice)}
              >
                {renderSwatches('#EDF2F7', '#FFFFFF', item.color)}
                <Text style={[styles.optionLabel, { color: textPrimary }]}>{item.label}</Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={activeBorderColor}
                    style={styles.checkmarkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}

          {/* ===================================================================== */}
          {/* 4. MODE                                                               */}
          {/* ===================================================================== */}
          <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>MODE</Text>

          {([
            { id: 'clair', label: 'Clair' },
            { id: 'sombre', label: 'Sombre' },
            { id: 'noir', label: 'Noir' },
          ] as const).map((item) => {
            const isSelected = modeChoice === item.id;
            const modeTheme = getAppTheme(brandChoice, item.id);
            const swatch1 = modeTheme.background;
            const swatch2 = modeTheme.cardBackground;
            const swatch3 = modeTheme.primary;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? activeBgColor : inactiveBgColor,
                    borderColor: isSelected ? activeBorderColor : inactiveBorderColor,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => setModeChoice(item.id as ModeChoice)}
              >
                {renderSwatches(swatch1, swatch2, swatch3)}
                <Text style={[styles.optionLabel, { color: textPrimary }]}>{item.label}</Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={activeBorderColor}
                    style={styles.checkmarkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default ThemeSwitcherModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 9,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 14,
  },
  swatchPill: {
    width: 14,
    height: 24,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    flex: 1,
  },
  checkmarkIcon: {
    marginLeft: 8,
  },

  /* Modale Sauvegarder Styles */
  modalSaveRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 4,
  },
  modalSaveCard: {
    flex: 1,
    borderRadius: 15,
    padding: 8,
    alignItems: 'center',
  },
  previewBox: {
    width: '100%',
    height: 94,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  previewLink: {
    fontSize: 9.5,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 2,
  },
  previewBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  previewGhostBtn: {
    fontSize: 9,
    fontWeight: '500',
  },
  previewSolidBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  previewSolidBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  previewDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    marginBottom: 3,
  },
  previewLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottomLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
