import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { BetLayersIcon } from '../icons/BetLayersIcon';
import { useResponsive } from '../../utils/responsive';

interface BetBottomSheetProps {
  eventsCount: number;
  totalOdds: string;
  stake: number;
  onStakeChange: (stake: number) => void;
  userBalance: number;
  potentialPayout: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPlaceBet: () => void;
  onOpenDeposit: () => void;
  betTab: 'Mise' | 'Code promo' | 'Cote de référence';
  onBetTabChange: (tab: 'Mise' | 'Code promo' | 'Cote de référence') => void;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  oddsPolicy: 'ask' | 'up' | 'any';
  onOddsPolicyChange: (policy: 'ask' | 'up' | 'any') => void;
  theme?: any;
}

export const BetBottomSheet: React.FC<BetBottomSheetProps> = ({
  eventsCount,
  totalOdds,
  stake,
  onStakeChange,
  userBalance,
  potentialPayout,
  isExpanded,
  onToggleExpand,
  onPlaceBet,
  onOpenDeposit,
  betTab,
  onBetTabChange,
  promoCode,
  onPromoCodeChange,
  oddsPolicy,
  onOddsPolicyChange,
  theme,
}) => {
  const { currentTheme } = useThemeStore();
  const activeTheme = theme || currentTheme;
  const isDark = activeTheme?.isDark;
  const bg = isDark ? (activeTheme?.cardBackground || '#2C353D') : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  const { width, isTablet, isDesktop, insets, font, scale, verticalScale, moderateScale } = useResponsive();

  // Formatage des montants
  const balanceDisplay = Math.round(userBalance).toString();
  const payoutDisplay = Math.round(potentialPayout).toString();

  // Limite largeur & centrage pour tablettes / desktop
  const sheetMaxWidth = isDesktop ? 680 : isTablet ? 580 : width;
  const sideInset = Math.max(0, (width - sheetMaxWidth) / 2);
  const bottomDockOffset = insets.bottom > 0
    ? (Platform.OS === 'ios' ? 56 + insets.bottom : 56 + insets.bottom)
    : (Platform.OS === 'ios' ? 76 : 56);

  return (
    <>
      {/* Backdrop sombre lorsque le panneau est ouvert */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onToggleExpand}
        />
      )}

      <View
        style={[
          styles.container,
          isExpanded ? styles.containerExpanded : styles.containerCollapsed,
          {
            backgroundColor: bg,
            borderTopColor: isDark ? activeTheme?.border || '#334155' : '#E2E8F0',
            left: sideInset,
            right: sideInset,
            bottom: bottomDockOffset,
            ...(isTablet || isDesktop
              ? {
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: isDark ? activeTheme?.border || '#334155' : '#E2E8F0',
                }
              : {}),
            paddingBottom: isExpanded
              ? Math.max(22, insets.bottom + 8)
              : Math.max(10, insets.bottom > 0 ? 8 : 10),
          },
        ]}
      >
        {/* A. Poignée (Handle) */}
        <TouchableOpacity
          style={styles.handleTouchable}
          onPress={onToggleExpand}
          activeOpacity={0.7}
          accessibilityLabel="Ouvrir ou fermer le panneau de mise"
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {!isExpanded ? (
          /* ================================================================= */
          /* ÉTAT REPLIÉ (Barre Réduite)                                       */
          /* ================================================================= */
          <TouchableOpacity
            style={styles.collapsedRow}
            activeOpacity={0.9}
            onPress={onToggleExpand}
          >
            {/* À gauche : Nombre d'événements avec icône de calques 7383 */}
            <View style={styles.collapsedLeft}>
              <BetLayersIcon
                size={moderateScale(18)}
                color={isDark ? '#CBD5E1' : '#64748B'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.collapsedEventsText, { color: textPrimary, fontSize: font(14) }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {eventsCount} Événement{eventsCount > 1 ? 's' : ''}
              </Text>
            </View>

            {/* Au milieu : Cote totale du coupon */}
            <View style={styles.collapsedCenter}>
              <Text
                style={[styles.collapsedOddsText, { color: textPrimary, fontSize: font(15) }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {totalOdds}{' '}
                <Text style={[styles.collapsedOddsLabel, { color: textSecondary, fontSize: font(12.5) }]}>Cote</Text>
              </Text>
            </View>

            {/* À droite : Bouton uni « Pari » */}
            <TouchableOpacity
              style={[
                styles.collapsedPariBtn,
                {
                  backgroundColor: activeTheme?.depositButton?.bg || activeTheme?.primary || '#34A853',
                  paddingHorizontal: moderateScale(22),
                  paddingVertical: verticalScale(9),
                },
              ]}
              activeOpacity={0.88}
              onPress={onToggleExpand}
            >
              <Text
                style={[
                  styles.collapsedPariBtnText,
                  { color: activeTheme?.depositButton?.text || '#FFFFFF', fontSize: font(15) },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Pari
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          /* ================================================================= */
          /* ÉTAT DÉPLIÉ (Panneau Complet de Mise)                             */
          /* ================================================================= */
          <View style={styles.expandedContent}>
            {/* B. Header de Synthèse (Nombre & Cote) */}
            <View style={styles.summaryHeaderRow}>
              {/* À gauche : Événements / Cote */}
              <View style={styles.summaryLeft}>
                <Text style={[styles.summaryLabel, { fontSize: font(13) }]}>Événements</Text>
                <Text style={[styles.summaryLabel, { fontSize: font(13) }]}>Cote</Text>
              </View>

              {/* À droite : Icône 7383 calques empilés + badge nombre + cote en gros */}
              <View style={styles.summaryRight}>
                <View style={styles.summaryEventsRow}>
                  <BetLayersIcon
                    size={moderateScale(16)}
                    color="#64748B"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.summaryCountText, { color: textPrimary, fontSize: font(13.5) }]}>
                    {eventsCount}
                  </Text>
                </View>
                <Text style={[styles.summaryBigOdds, { color: textPrimary, fontSize: font(18) }]} numberOfLines={1} adjustsFontSizeToFit>
                  {totalOdds}
                </Text>
              </View>
            </View>

            {/* C. Ligne Paramètres de Cotes */}
            <View style={styles.oddsSettingRow}>
              <View style={styles.oddsSettingTextWrap}>
                <Text style={[styles.oddsSettingTitle, { color: textPrimary, fontSize: font(13.5) }]} numberOfLines={1} adjustsFontSizeToFit>
                  Quand les cotes changent
                </Text>
                <Text style={[styles.oddsSettingSubtitle, { fontSize: font(12) }]}>
                  {oddsPolicy === 'up'
                    ? 'Accepter si la cote augmente'
                    : oddsPolicy === 'any'
                      ? 'Accepter tout changement de cote'
                      : 'Me demander de confirmer'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  onOddsPolicyChange(oddsPolicy === 'ask' ? 'up' : oddsPolicy === 'up' ? 'any' : 'ask');
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.settingsBlueLink, { color: activeTheme?.primary || '#2563EB', fontSize: font(13) }]}>Paramètres &gt;</Text>
              </TouchableOpacity>
            </View>

            {/* D. Barre d'Onglets (3 Pilules) */}
            <View style={[styles.tabPillsBar, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <TouchableOpacity
                style={[
                  styles.tabPill,
                  betTab === 'Mise' && [styles.tabPillActive, { backgroundColor: activeTheme?.filterPill?.activeBg || activeTheme?.primary || '#2563EB' }],
                ]}
                onPress={() => onBetTabChange('Mise')}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    betTab === 'Mise' ? [styles.tabPillTextActive, { color: activeTheme?.filterPill?.activeText || activeTheme?.primaryText || '#FFFFFF' }] : { color: textSecondary },
                  ]}
                >
                  Mise
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabPill,
                  betTab === 'Code promo' && [styles.tabPillActive, { backgroundColor: activeTheme?.filterPill?.activeBg || activeTheme?.primary || '#2563EB' }],
                ]}
                onPress={() => onBetTabChange('Code promo')}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    betTab === 'Code promo' ? [styles.tabPillTextActive, { color: activeTheme?.filterPill?.activeText || activeTheme?.primaryText || '#FFFFFF' }] : { color: textSecondary },
                  ]}
                >
                  Code promo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabPill,
                  betTab === 'Cote de référence' && [styles.tabPillActive, { backgroundColor: activeTheme?.filterPill?.activeBg || activeTheme?.primary || '#2563EB' }],
                ]}
                onPress={() => onBetTabChange('Cote de référence')}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    betTab === 'Cote de référence' ? [styles.tabPillTextActive, { color: activeTheme?.filterPill?.activeText || activeTheme?.primaryText || '#FFFFFF' }] : { color: textSecondary },
                  ]}
                >
                  Cote de référence
                </Text>
              </TouchableOpacity>
            </View>

            {betTab === 'Mise' && (
              <>
                {/* E. Zone Solde */}
                <View style={styles.balanceSection}>
                  <View style={styles.balanceLeftWrap}>
                    <TouchableOpacity
                      style={[
                        styles.greenPlusCircle,
                        { backgroundColor: activeTheme?.depositButton?.bg || activeTheme?.primary || '#22C55E' },
                      ]}
                      onPress={onOpenDeposit}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={18} color={activeTheme?.depositButton?.text || '#FFFFFF'} />
                    </TouchableOpacity>
                    <Text style={[styles.balanceAmountText, { color: textPrimary, fontSize: font(14) }]}>
                      Solde <Text style={[styles.balanceNumberText, { fontSize: font(15) }]}>{balanceDisplay} F</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onOpenDeposit}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.rechargerLink, { color: activeTheme?.primary || '#2563EB', fontSize: font(13) }]}>Recharger le compte &gt;</Text>
                  </TouchableOpacity>
                </View>

                {/* F. Champ Saisie & Bouton de Pari */}
                <View style={styles.stakePariRow}>
                  {/* Input avec - et + */}
                  <View
                    style={[
                      styles.inputBox,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.calcBtn}
                      onPress={() => onStakeChange(Math.max(25, (stake || 1000) - 500))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.calcBtnText, { color: textPrimary }]}>−</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.inputField, { color: textPrimary, fontSize: font(16) }]}
                      value={stake ? stake.toString() : ''}
                      onChangeText={(txt) => {
                        const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
                        onStakeChange(isNaN(num) ? 0 : num);
                      }}
                      keyboardType="numeric"
                      placeholder="500"
                      placeholderTextColor="#94A3B8"
                    />

                    <TouchableOpacity
                      style={styles.calcBtn}
                      onPress={() => onStakeChange((stake || 0) + 500)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.calcBtnText, { color: textPrimary }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Bouton Pari */}
                  <TouchableOpacity
                    style={[
                      styles.pariGreenBtn,
                      {
                        backgroundColor: activeTheme?.depositButton?.bg || activeTheme?.primary || '#34A853',
                        paddingHorizontal: moderateScale(28),
                      },
                    ]}
                    onPress={onPlaceBet}
                    activeOpacity={0.88}
                  >
                    <Text
                      style={[styles.pariGreenBtnText, { color: activeTheme?.depositButton?.text || '#FFFFFF', fontSize: font(16) }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      Pari
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* G. Détails Financiers & Advancebet */}
                <View style={styles.financialBlock}>
                  {/* Ligne 1 : Limites */}
                  <Text style={[styles.limitsText, { fontSize: font(12) }]}>
                    25 F – 679 000 F
                  </Text>

                  {/* Ligne 2 : Gains potentiels */}
                  <Text style={[styles.payoutText, { color: textPrimary, fontSize: font(13.5) }]} numberOfLines={1} adjustsFontSizeToFit>
                    Gains potentiels :{' '}
                    <Text style={[styles.payoutGreenText, { color: activeTheme?.colors?.accentGreen || activeTheme?.status?.paye || '#22C55E' }]}>{payoutDisplay} F</Text>
                  </Text>

                  {/* Ligne 3 : Advancebet disponible */}
                  <View style={styles.advancebetLine}>
                    <Text style={[styles.advancebetLeftText, { fontSize: font(12) }]}>
                      Advancebet disponible : -
                    </Text>
                    <TouchableOpacity
                      style={styles.advancebetAction}
                      onPress={() => {
                        Alert.alert('Advancebet', 'Aucun Advancebet disponible pour le moment.');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.advancebetActionText, { color: activeTheme?.primary || '#2563EB', fontSize: font(12.5) }]}>Demander</Text>
                      <Ionicons name="refresh" size={moderateScale(13)} color={activeTheme?.primary || '#2563EB'} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* H. Paris Rapides */}
                <View style={styles.quickBetsContainer}>
                  <Text style={[styles.quickBetsTitle, { color: textPrimary, fontSize: font(14) }]}>
                    Paris rapides
                  </Text>
                  <Text style={[styles.quickBetsSubtitle, { fontSize: font(12) }]}>
                    Sélectionnez un montant de mise pour placer un pari
                  </Text>

                  <View style={styles.quickBetsButtonsRow}>
                    {[90, 1000, 2500].map((amt) => {
                      const isSelected = stake === amt;
                      return (
                        <TouchableOpacity
                          key={amt}
                          style={[
                            styles.quickBlueBtn,
                            { backgroundColor: activeTheme?.primary || '#2563EB' },
                            isSelected && styles.quickBlueBtnSelected,
                          ]}
                          onPress={() => onStakeChange(amt)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[styles.quickBlueBtnText, { color: activeTheme?.primaryText || '#FFFFFF', fontSize: font(13.5) }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {amt} F
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {betTab === 'Code promo' && (
              <View style={styles.promoWrap}>
                <Text style={styles.quickBetsSubtitle}>
                  Saisissez votre code promo :
                </Text>
                <TextInput
                  style={[
                    styles.promoInput,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      color: textPrimary,
                    },
                  ]}
                  placeholder="Ex : PROMO2026"
                  placeholderTextColor="#94A3B8"
                  value={promoCode}
                  onChangeText={onPromoCodeChange}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[
                    styles.pariGreenBtnFull,
                    { backgroundColor: activeTheme?.depositButton?.bg || activeTheme?.primary || '#34A853' },
                  ]}
                  onPress={onPlaceBet}
                  activeOpacity={0.88}
                >
                  <Text style={[styles.pariGreenBtnText, { color: activeTheme?.depositButton?.text || '#FFFFFF' }]}>Appliquer & Parier</Text>
                </TouchableOpacity>
              </View>
            )}

            {betTab === 'Cote de référence' && (
              <View style={styles.oddsPolicyWrap}>
                {[
                  { id: 'up', label: 'Accepter si la cote augmente', desc: 'Recommandé' },
                  { id: 'any', label: 'Accepter tout changement de cote', desc: 'Sans confirmation' },
                  { id: 'ask', label: 'Toujours demander confirmation', desc: 'Sécurisé' },
                ].map((item) => {
                  const isChecked = oddsPolicy === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.policyRow,
                        isChecked && [styles.policyRowChecked, { borderColor: activeTheme?.primary || '#2563EB' }],
                        {
                          backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                        },
                      ]}
                      onPress={() => onOddsPolicyChange(item.id as any)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isChecked ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={isChecked ? (activeTheme?.primary || '#2563EB') : '#94A3B8'}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.policyLabel,
                            { color: textPrimary },
                            isChecked && { fontWeight: '700', color: activeTheme?.primary || '#2563EB' },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={styles.policyDesc}>{item.desc}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 15,
  },
  container: {
    position: 'absolute',
    zIndex: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 12,
      },
      default: {
        boxShadow: '0 -3px 12px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  containerCollapsed: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  containerExpanded: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 22,
  },

  /* A. Handle */
  handleTouchable: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginVertical: 8,
  },

  /* Collapsed State */
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedEventsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  collapsedCenter: {
    alignItems: 'center',
  },
  collapsedOddsText: {
    fontSize: 15,
    fontWeight: '800',
  },
  collapsedOddsLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  collapsedPariBtn: {
    backgroundColor: '#34A853',
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedPariBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Expanded Content */
  expandedContent: {
    paddingTop: 2,
  },

  /* B. Header de Synthèse */
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 2,
  },
  summaryLeft: {
    gap: 3,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  summaryRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  summaryEventsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryCountText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  summaryBigOdds: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  /* C. Réglage des Cotes */
  oddsSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 4,
  },
  oddsSettingTextWrap: {
    flex: 1,
  },
  oddsSettingTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 1,
  },
  oddsSettingSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  settingsBlueLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  /* D. Barre d'Onglets (3 Pilules) */
  tabPillsBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#2563EB',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* E. Zone Solde */
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenPlusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  balanceAmountText: {
    fontSize: 14,
    color: '#64748B',
  },
  balanceNumberText: {
    fontWeight: '700',
    fontSize: 15,
  },
  rechargerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  /* F. Champ Saisie & Bouton de Pari */
  stakePariRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  calcBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcBtnText: {
    fontSize: 22,
    fontWeight: '600',
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
    paddingLeft: 12,
    paddingVertical: 0,
  },
  pariGreenBtn: {
    backgroundColor: '#34A853',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pariGreenBtnFull: {
    backgroundColor: '#34A853',
    borderRadius: 8,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  pariGreenBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* G. Détails Financiers & Advancebet */
  financialBlock: {
    marginBottom: 14,
    gap: 3,
  },
  limitsText: {
    fontSize: 12,
    color: '#94A3B8', // Gris clair
  },
  payoutText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  payoutGreenText: {
    color: '#22C55E',
    fontWeight: '700',
  },
  advancebetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  advancebetLeftText: {
    fontSize: 12,
    color: '#64748B',
  },
  advancebetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  advancebetActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563EB',
  },

  /* H. Paris Rapides */
  quickBetsContainer: {
    marginTop: 2,
  },
  quickBetsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 1,
  },
  quickBetsSubtitle: {
    fontSize: 12,
    color: '#64748B', // Gris ardoise
    marginBottom: 10,
  },
  quickBetsButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBlueBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBlueBtnSelected: {
    opacity: 0.9,
  },
  quickBlueBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* Code promo & Cote de référence tabs */
  promoWrap: {
    paddingVertical: 8,
  },
  promoInput: {
    height: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  oddsPolicyWrap: {
    paddingVertical: 6,
    gap: 8,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  policyRowChecked: {
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  policyLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  policyDesc: {
    fontSize: 11.5,
    color: '#64748B',
  },
});

export default BetBottomSheet;
