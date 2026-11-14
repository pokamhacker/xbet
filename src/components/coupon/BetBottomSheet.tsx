import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { BetLayersIcon } from '../icons/BetLayersIcon';
import { formatCleanOdds } from '../../utils/oddsFormatter';

export interface BetBottomSheetProps {
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
  oddsTrend?: 'up' | 'down' | 'stable';
  previousTotalOdds?: string | null;
  theme?: any;
}

const formatExactBalance = (val: number): string => {
  if (typeof val !== 'number' || Number.isNaN(val)) return '0';
  return Number.isInteger(val)
    ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    : val.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatExactPayout = (val: number): string => {
  if (typeof val !== 'number' || Number.isNaN(val)) return '0';
  const rounded = Math.round(val * 100) / 100;
  return Number.isInteger(rounded)
    ? rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    : rounded.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

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
  oddsTrend = 'stable',
  previousTotalOdds = null,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme.isDark;
  const isMelbet = currentTheme.name.toLowerCase().includes('melbet');

  // Animation fluide d'ouverture/fermeture
  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  // Couleurs calibrées dynamiquement (Melbet & 1xBet, Sombre & Clair)
  const accentColor = isMelbet
    ? '#E58E26'
    : currentTheme.colors.primary || '#228BE6';

  const pariButtonBg = isMelbet
    ? '#C87D20'
    : currentTheme.colors.accentGreen || currentTheme.colors.primary || '#54962B';

  const sheetBg = isMelbet
    ? isDark
      ? '#2E343B'
      : '#FFFFFF'
    : isDark
      ? currentTheme.colors.cardBackground || '#1E2733'
      : '#FFFFFF';

  const recessedCardBg = isMelbet
    ? isDark
      ? '#262B31'
      : '#F3F5F8'
    : isDark
      ? '#161F2C'
      : '#F1F5F9';

  const handleColor = isDark ? '#4A5058' : '#CBD5E1';
  const textPrimary = isDark ? '#FFFFFF' : '#111827';
  const textSecondary = isDark ? '#8A949E' : '#64748B';
  const stepButtonBg = isMelbet
    ? isDark
      ? '#323840'
      : '#E5E7EB'
    : isDark
      ? '#243042'
      : '#E2E8F0';

  const oddsDisplayColor =
    oddsTrend === 'up'
      ? '#4EAA25'
      : oddsTrend === 'down'
        ? '#E53935'
        : textPrimary;

  const oddsPolicyLabel =
    oddsPolicy === 'ask'
      ? 'Me demander de confirmer'
      : oddsPolicy === 'up'
        ? 'Accepter toute hausse'
        : 'Accepter tout changement';

  const handleCycleOddsPolicy = () => {
    const nextPolicy =
      oddsPolicy === 'ask' ? 'up' : oddsPolicy === 'up' ? 'any' : 'ask';
    onOddsPolicyChange(nextPolicy);
  };

  return (
    <View
      style={[
        styles.sheetContainer,
        {
          backgroundColor: sheetBg,
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        },
      ]}
    >
      {/* Poignée supérieure centrée (width: 32, height: 4, borderRadius: 2, marginVertical: 8) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggleExpand}
        style={styles.handleHitSlop}
      >
        <View style={[styles.handleBar, { backgroundColor: handleColor }]} />
      </TouchableOpacity>

      {/* 1. Bloc encadré de résumé Événements / Cote */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggleExpand}
        style={[styles.summaryBox, { backgroundColor: recessedCardBg }]}
      >
        {/* Ligne 1 : Événements */}
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: textSecondary }]}>
            Événements
          </Text>
          <View style={styles.summaryEventsRight}>
            <BetLayersIcon size={15} color={accentColor} />
            <Text style={[styles.summaryEventsValue, { color: textPrimary }]}>
              {eventsCount}
            </Text>
          </View>
        </View>

        {/* Ligne 2 (marginTop: 6) : Cote */}
        <View style={[styles.summaryRow, { marginTop: 6 }]}>
          <Text style={[styles.summaryLabel, { color: textSecondary }]}>
            Cote
          </Text>
          <View style={styles.summaryOddsRight}>
            {previousTotalOdds && oddsTrend !== 'stable' && (
              <Text style={[styles.previousOddsStrike, { color: textSecondary }]}>
                {formatCleanOdds(previousTotalOdds)}
              </Text>
            )}
            {oddsTrend !== 'stable' && (
              <Text style={[styles.oddsArrow, { color: oddsDisplayColor }]}>
                {oddsTrend === 'up' ? '▲' : '▼'}
              </Text>
            )}
            <Text style={[styles.summaryOddsValue, { color: oddsDisplayColor }]}>
              {formatCleanOdds(totalOdds)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ÉTAT REPLIÉ (Collapsed) : Bouton Pari pleine largeur en bas */}
      {!isExpanded && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPlaceBet}
          style={[styles.collapsedPariButton, { backgroundColor: pariButtonBg }]}
        >
          <Text style={styles.collapsedPariButtonText}>Pari</Text>
        </TouchableOpacity>
      )}

      {/* ÉTAT DÉPLIÉ (Expanded) : Structure exacte Vidéo 1 */}
      {isExpanded && (
        <Animated.View
          style={{
            opacity: expandAnim,
          }}
        >
          {/* 2. Ligne de gestion des cotes */}
          <View style={styles.oddsChangeRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.oddsChangeTitle, { color: textPrimary }]}>
                Quand les cotes changent
              </Text>
              <Text style={[styles.oddsChangeSubtitle, { color: textSecondary }]}>
                {oddsPolicyLabel}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleCycleOddsPolicy}
              style={styles.parametresButton}
            >
              <Text style={[styles.parametresText, { color: accentColor }]}>
                Paramètres
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 6L15 12L9 18"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* 3. Barre d'onglets (Segmented Control) */}
          <View style={[styles.segmentedTrack, { backgroundColor: recessedCardBg }]}>
            {(['Mise', 'Code promo', 'Cote de référence'] as const).map((tab) => {
              const active = betTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.85}
                  onPress={() => onBetTabChange(tab)}
                  style={[
                    styles.segmentedTab,
                    active && { backgroundColor: pariButtonBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentedTabText,
                      {
                        color: active ? '#FFFFFF' : textSecondary,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4. Carte Solde */}
          <View style={[styles.soldeCard, { backgroundColor: recessedCardBg }]}>
            <View style={styles.soldeLeftRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onOpenDeposit}
                style={[styles.soldePlusCircle, { backgroundColor: pariButtonBg }]}
              >
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V19M5 12H19"
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              <View>
                <Text style={[styles.soldeLabel, { color: textSecondary }]}>
                  Solde
                </Text>
                <Text style={[styles.soldeAmount, { color: textPrimary }]}>
                  {formatExactBalance(userBalance)} F
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onOpenDeposit}
              style={styles.changeAccountBtn}
            >
              <Text style={[styles.changeAccountText, { color: accentColor }]}>
                Changer de compte
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M9 6L15 12L9 18"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* 5. Ligne de saisie de Mise (ou Code promo) + Bouton Pari CÔTE À CÔTE */}
          {betTab === 'Mise' ? (
            <View style={styles.stakeAndPariRow}>
              <View style={styles.stakeLeftCol}>
                <View style={[styles.stakeInputContainer, { backgroundColor: recessedCardBg }]}>
                  <TextInput
                    style={[
                      styles.stakeInput,
                      { color: textPrimary },
                      Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                    ]}
                    keyboardType="numeric"
                    value={stake > 0 ? String(stake) : ''}
                    placeholder="0"
                    placeholderTextColor={textSecondary}
                    onChangeText={(txt) => {
                      const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
                      onStakeChange(Number.isNaN(num) ? 0 : num);
                    }}
                  />
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onStakeChange(Math.max(90, stake - 100))}
                    style={[styles.stepBtnBox, { backgroundColor: stepButtonBg }]}
                  >
                    <Text style={[styles.stepMinusSymbol, { color: textSecondary }]}>
                      —
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onStakeChange(stake + 100)}
                    style={[
                      styles.stepBtnBox,
                      { backgroundColor: stepButtonBg, marginLeft: 6 },
                    ]}
                  >
                    <Text style={[styles.stepPlusSymbol, { color: accentColor }]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.limitsText, { color: textSecondary }]}>
                  90 F - 1 910 000 F
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPlaceBet}
                style={[styles.sidePariButton, { backgroundColor: pariButtonBg }]}
              >
                <Text style={styles.sidePariButtonText}>Pari</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stakeAndPariRow}>
              <View style={styles.stakeLeftCol}>
                <View style={[styles.stakeInputContainer, { backgroundColor: recessedCardBg }]}>
                  <TextInput
                    style={[
                      styles.stakeInput,
                      { color: textPrimary, fontSize: 14.5 },
                      Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
                    ]}
                    placeholder={
                      betTab === 'Code promo'
                        ? 'Saisir le code promo'
                        : 'Cote de référence'
                    }
                    placeholderTextColor={textSecondary}
                    value={promoCode}
                    onChangeText={onPromoCodeChange}
                  />
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onPlaceBet}
                style={[styles.sidePariButton, { backgroundColor: pariButtonBg }]}
              >
                <Text style={styles.sidePariButtonText}>Pari</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 6. Lignes d'informations sous la mise */}
          <View style={styles.payoutInfoRow}>
            <Text style={[styles.payoutLabel, { color: isDark ? '#C8D0D8' : textSecondary }]}>
              Gains potentiels:{' '}
            </Text>
            <Text style={[styles.payoutValue, { color: accentColor }]}>
              {formatExactPayout(potentialPayout)} F
            </Text>
          </View>

          <View style={styles.advancebetRow}>
            <Text style={[styles.advancebetLabel, { color: isDark ? '#C8D0D8' : textSecondary }]}>
              Advancebet disponible: <Text style={{ color: textPrimary, fontWeight: '700' }}>—</Text>
            </Text>
            <TouchableOpacity activeOpacity={0.75} style={styles.demandeBtn}>
              <Text style={[styles.demandeText, { color: accentColor }]}>
                Demande
              </Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3019 3 18.1885 4.77814 19.7545 7.42909M19.7545 7.42909V3M19.7545 7.42909H15.5"
                  stroke={accentColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* 7. Section Paris rapides */}
          <View style={styles.quickBetsSection}>
            <Text style={[styles.quickBetsTitle, { color: textPrimary }]}>
              Paris rapides
            </Text>
            <Text style={[styles.quickBetsSubtitle, { color: textSecondary }]}>
              Choisissez un montant de mise pour placer un pari
            </Text>
            <View style={styles.quickBetsRow}>
              {[90, 1000, 5000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  activeOpacity={0.85}
                  onPress={() => onStakeChange(amt)}
                  style={[styles.quickBetBtn, { backgroundColor: pariButtonBg }]}
                >
                  <Text style={styles.quickBetBtnText}>
                    {formatExactBalance(amt)} F
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 14,
  },
  handleHitSlop: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginVertical: 8,
  },
  summaryBox: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13.5,
    fontWeight: '400',
  },
  summaryEventsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryEventsValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryOddsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previousOddsStrike: {
    fontSize: 12.5,
    textDecorationLine: 'line-through',
  },
  oddsArrow: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryOddsValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  collapsedPariButton: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedPariButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  oddsChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  oddsChangeTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  oddsChangeSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  parametresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  parametresText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  segmentedTrack: {
    flexDirection: 'row',
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentedTab: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentedTabText: {
    fontSize: 12.5,
  },
  soldeCard: {
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soldeLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  soldePlusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldeLabel: {
    fontSize: 11.5,
    fontWeight: '400',
  },
  soldeAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1,
  },
  changeAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeAccountText: {
    fontSize: 13,
    fontWeight: '500',
  },
  stakeAndPariRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  stakeLeftCol: {
    flex: 1,
  },
  stakeInputContainer: {
    height: 46,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
  },
  stakeInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 0,
  },
  stepBtnBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepMinusSymbol: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepPlusSymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  limitsText: {
    fontSize: 11.5,
    marginTop: 4,
    marginLeft: 4,
  },
  sidePariButton: {
    width: 115,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePariButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
  payoutInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  payoutLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  payoutValue: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  advancebetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  advancebetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  demandeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  demandeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickBetsSection: {
    marginTop: 10,
  },
  quickBetsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  quickBetsSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
    marginBottom: 8,
  },
  quickBetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBetBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBetBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BetBottomSheet;
