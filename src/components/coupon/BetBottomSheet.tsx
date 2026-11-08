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
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';
import { BetLayersIcon } from '../icons/BetLayersIcon';
import { DiagonalCouponTicketIcon } from '../common/CouponIcons';
import { useResponsive } from '../../utils/responsive';
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
  theme,
}) => {
  const { currentTheme: storeTheme, currentBrand } = useThemeStore();
  const activeTheme = theme || storeTheme;
  const isDark = Boolean(activeTheme?.isDark);

  const themeName = String(
    activeTheme?.name || activeTheme?.key || currentBrand || '1xbet'
  ).toLowerCase();

  const isParipesa = themeName.includes('paripesa');
  const isMegaPari = themeName.includes('megapari');
  const isMelbet = themeName.includes('melbet');
  const isWinWin = themeName.includes('winwin');
  const isBetWinner = themeName.includes('betwinner');
  const isBlack = themeName.includes('black');

  // ===========================================================================
  // PALETTE DYNAMIQUE PAR MARQUE & THÈME (CLAIR / SOMBRE / NOIR)
  // ===========================================================================
  const upperBg = isParipesa
    ? isDark
      ? isBlack
        ? '#0C0E13'
        : '#282F39'
      : '#FFFFFF'
    : isMegaPari
      ? isDark
        ? isBlack
          ? '#0B0E12'
          : '#1A1F25'
        : '#FFFFFF'
      : isDark
        ? isBlack
          ? '#121720'
          : isMelbet
            ? '#2B3036'
            : '#26374B'
        : '#F3F6FA';

  const lowerBg = isParipesa
    ? isDark
      ? isBlack
        ? '#0C0E13'
        : '#282F39'
      : '#FFFFFF'
    : isMegaPari
      ? isDark
        ? isBlack
          ? '#0B0E12'
          : '#1A1F25'
        : '#FFFFFF'
      : isDark
        ? isBlack
          ? '#0B0F14'
          : isMelbet
            ? '#30353B'
            : '#2A3F54'
        : '#FFFFFF';

  const textNavyOrWhite = isDark
    ? '#FFFFFF'
    : isParipesa
      ? '#0B1A33'
      : isMegaPari
        ? '#1E242C'
        : '#00325E';

  const textMuted = isParipesa
    ? isDark
      ? '#8E99AB'
      : '#5E7396'
    : isMegaPari
      ? isDark
        ? '#8A939E'
        : '#64748B'
      : isDark
        ? isMelbet
          ? '#878C92'
          : '#8FA2B6'
        : '#6E849B';

  const subtextMuted = isDark
    ? isMelbet
      ? '#9CA3AF'
      : '#8FA2B6'
    : '#5C7690';

  const handleColor = isParipesa
    ? isDark
      ? '#4A5260'
      : '#D5DCE6'
    : isMegaPari
      ? isDark
        ? '#4F5661'
        : '#CBD5E1'
      : isDark
        ? '#4E6175'
        : '#D0D8E2';

  const gearBtnBg = isDark
    ? isBlack
      ? '#1A222E'
      : isMelbet
        ? '#24292F'
        : '#22303F'
    : '#FFFFFF';

  const brandAccent = isParipesa
    ? isDark
      ? '#4460F2'
      : '#2E45CF'
    : isMegaPari
      ? '#CB3222'
      : isMelbet
        ? isDark
          ? '#B9711A'
          : '#E7B12C'
        : isWinWin
          ? '#7CBD17'
          : isBetWinner
            ? isDark
              ? '#008E5A'
              : '#007348'
            : isDark
              ? '#589BD8'
              : '#4A8FD6';

  const actionBtnBg = isParipesa
    ? isDark
      ? '#4460F2'
      : '#2E45CF'
    : isMegaPari
      ? '#CB3222'
      : isMelbet
        ? isDark
          ? '#B9711A'
          : '#E7B12C'
        : isWinWin
          ? '#7CBD17'
          : isBetWinner
            ? isDark
              ? '#008E5A'
              : '#007348'
            : '#48B254';

  const actionBtnTextColor =
    isMelbet && !isDark ? '#00325E' : '#FFFFFF';

  const subPanelBg = isParipesa
    ? isDark
      ? isBlack
        ? '#14171F'
        : '#1D212A'
      : '#EBEEF3'
    : isMegaPari
      ? isDark
        ? isBlack
          ? '#050608'
          : '#111111'
        : '#EEF0F4'
      : isDark
        ? isBlack
          ? '#121720'
          : isMelbet
            ? '#24292F'
            : '#222F3F'
        : '#EBEEF3';

  const inputBorderColor = isDark
    ? isParipesa
      ? '#2E3442'
      : isMegaPari
        ? '#28303A'
        : isMelbet
          ? '#38434D'
          : '#33465A'
    : '#E2E8F0';

  const { isTablet, insets } = useResponsive();

  // Animation fluide État réduit <-> État étendu
  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isExpanded, expandAnim]);

  const expandedMaxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 480],
  });

  const expandedOpacity = expandAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.3, 1],
  });

  const cleanCurrentOdds = formatCleanOdds(totalOdds || '4.98');
  const balanceDisplay = formatExactBalance(userBalance);
  const payoutDisplay = formatExactPayout(potentialPayout);

  const policyShortText =
    oddsPolicy === 'up'
      ? 'accepter si la cote augmente'
      : oddsPolicy === 'any'
        ? 'accepter tout changement'
        : 'me demander de confirmer';

  // Ancrage direct à bottom: 0 (fusionné sans aucun espace avec la PersistentBottomBar)
  const sideInset = isTablet ? 32 : 0;
  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset =
    (insets?.bottom ?? 0) > 0
      ? Math.max(insets.bottom, androidBottomPad)
      : Platform.OS === 'ios'
        ? 20
        : androidBottomPad;
  const barHeight = 56 + bottomInset;
  const bottomDockOffset = 0;
  const fusedBottomPadding = barHeight + 22;

  // Contenu étendu partagé (Mise | Code promo | Cote de référence) adapté à tous les thèmes
  const renderExpandedBettingPanel = () => (
    <Animated.View
      style={{
        maxHeight: expandedMaxHeight,
        opacity: expandedOpacity,
        overflow: 'hidden',
        backgroundColor: lowerBg,
      }}
      pointerEvents={isExpanded ? 'auto' : 'none'}
    >
      <View style={styles.expandedContentPadding}>
        {/* 3 Onglets Pilules : Mise | Code promo | Cote de référence */}
        <View style={[styles.tabsRow, { backgroundColor: subPanelBg }]}>
          {(['Mise', 'Code promo', 'Cote de référence'] as const).map((tab) => {
            const isActive = betTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => onBetTabChange(tab)}
                style={[
                  styles.tabPill,
                  isActive && {
                    backgroundColor: lowerBg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabPillText,
                    {
                      color: isActive ? textNavyOrWhite : textMuted,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {betTab === 'Mise' && (
          <>
            {/* Carte Solde avec bouton + et lien Recharger */}
            <View
              style={[
                styles.balanceCard,
                { backgroundColor: isDark ? subPanelBg : '#F8FAFC' },
              ]}
            >
              <View style={styles.balanceLeft}>
                <TouchableOpacity
                  style={[styles.plusCircle, { backgroundColor: actionBtnBg }]}
                  onPress={onOpenDeposit}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={18} color={actionBtnTextColor} />
                </TouchableOpacity>
                <View>
                  <Text style={[styles.balanceSmallLabel, { color: textMuted }]}>
                    Solde disponible
                  </Text>
                  <Text
                    style={[
                      styles.balanceValueText,
                      { color: textNavyOrWhite },
                    ]}
                  >
                    {balanceDisplay} ₣
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={onOpenDeposit}
                style={styles.paramLinkRow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.paramLinkText, { color: brandAccent }]}>
                  Recharger
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={brandAccent}
                  style={{ marginLeft: 2 }}
                />
              </TouchableOpacity>
            </View>

            {/* Champ de saisie de mise avec steppers */}
            <View
              style={[
                styles.stakeInputBox,
                {
                  backgroundColor: isDark ? subPanelBg : '#F8FAFC',
                  borderColor: inputBorderColor,
                },
              ]}
            >
              <TextInput
                style={[styles.stakeInputField, { color: textNavyOrWhite }]}
                value={stake ? String(stake) : ''}
                onChangeText={(txt) => {
                  const num = parseInt(txt.replace(/[^0-9]/g, ''), 10);
                  onStakeChange(Number.isNaN(num) ? 0 : num);
                }}
                keyboardType="numeric"
                placeholder="500"
                placeholderTextColor={textMuted}
              />
              <Text style={[styles.currencySuffix, { color: textMuted }]}>
                ₣
              </Text>

              <View style={styles.stepperRightGroup}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => onStakeChange(Math.max(90, (stake || 500) - 100))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperMinusText, { color: brandAccent }]}>
                    —
                  </Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.stepperDivider,
                    { backgroundColor: inputBorderColor },
                  ]}
                />

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => onStakeChange((stake || 0) + 500)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.stepperPlusText, { color: brandAccent }]}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Limites & Gains potentiels */}
            <View style={styles.financialBlock}>
              <Text style={[styles.limitsText, { color: textMuted }]}>
                Min : 90 ₣ – Max : 1 000 000 ₣
              </Text>
              <Text style={[styles.payoutRowText, { color: textNavyOrWhite }]}>
                Gains potentiels :{' '}
                <Text style={[styles.payoutGreenText, { color: actionBtnBg }]}>
                  {payoutDisplay} ₣
                </Text>
              </Text>
            </View>

            {/* Puces de paris rapides */}
            <View style={styles.quickPillsRow}>
              {[90, 1000, 2500, 5000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickPill,
                    { backgroundColor: subPanelBg },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => onStakeChange(amt)}
                >
                  <Text
                    style={[styles.quickPillText, { color: textNavyOrWhite }]}
                  >
                    {amt.toLocaleString('fr-FR')} ₣
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {betTab === 'Code promo' && (
          <View style={styles.altTabWrap}>
            <Text style={[styles.altTabTitle, { color: textMuted }]}>
              Saisissez votre code promo :
            </Text>
            <TextInput
              style={[
                styles.promoInput,
                {
                  backgroundColor: isDark ? subPanelBg : '#F8FAFC',
                  color: textNavyOrWhite,
                  borderColor: inputBorderColor,
                },
              ]}
              placeholder="Ex : PROMO2026"
              placeholderTextColor={textMuted}
              value={promoCode}
              onChangeText={onPromoCodeChange}
              autoCapitalize="characters"
            />
          </View>
        )}

        {betTab === 'Cote de référence' && (
          <View style={styles.altTabWrap}>
            {[
              { id: 'up', label: 'Accepter si la cote augmente' },
              { id: 'any', label: 'Accepter tout changement de cote' },
              { id: 'ask', label: 'Me demander de confirmer' },
            ].map((item) => {
              const isChecked = oddsPolicy === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.policyRow,
                    {
                      backgroundColor: isDark ? subPanelBg : '#F8FAFC',
                      borderColor: inputBorderColor,
                    },
                  ]}
                  onPress={() => onOddsPolicyChange(item.id as 'ask' | 'up' | 'any')}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={isChecked ? 'radio-button-on' : 'radio-button-off'}
                    size={19}
                    color={isChecked ? actionBtnBg : textMuted}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    style={[
                      styles.policyLabel,
                      {
                        color: textNavyOrWhite,
                        fontWeight: isChecked ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </Animated.View>
  );

  // ===========================================================================
  // LAYOUT A : PARIPESA (Encadré Événements / Cote + Bouton bleu pleine largeur)
  // ===========================================================================
  if (isParipesa) {
    return (
      <>
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
            {
              left: sideInset,
              right: sideInset,
              bottom: bottomDockOffset,
              backgroundColor: lowerBg,
            },
          ]}
        >
          <View style={[styles.paripesaInnerWrap, { paddingBottom: fusedBottomPadding }]}>
            {/* Poignée supérieure centrée */}
            <TouchableOpacity
              style={styles.handleTouchable}
              onPress={onToggleExpand}
              activeOpacity={0.7}
              accessibilityLabel="Ouvrir ou fermer le panneau de mise"
            >
              <View style={[styles.handleBar, { backgroundColor: handleColor }]} />
            </TouchableOpacity>

            {/* Encadré résumé Événements / Cote */}
            <TouchableOpacity
              style={[styles.paripesaSummaryBox, { backgroundColor: subPanelBg }]}
              activeOpacity={0.85}
              onPress={onToggleExpand}
            >
              <View style={styles.paripesaSummaryRow}>
                <Text style={[styles.paripesaSummaryLabel, { color: textMuted }]}>
                  Événements
                </Text>
                <View style={styles.paripesaSummaryRight}>
                  <BetLayersIcon
                    size={15}
                    color={brandAccent}
                    primaryColor={brandAccent}
                  />
                  <Text
                    style={[
                      styles.paripesaSummaryValue,
                      { color: textNavyOrWhite, marginLeft: 5 },
                    ]}
                  >
                    {eventsCount}
                  </Text>
                </View>
              </View>

              <View style={[styles.paripesaSummaryRow, { marginTop: 6 }]}>
                <Text style={[styles.paripesaSummaryLabel, { color: textMuted }]}>
                  Cote
                </Text>
                <Text
                  style={[
                    styles.paripesaSummaryValue,
                    {
                      color:
                        oddsTrend === 'down'
                          ? '#E04F4F'
                          : textNavyOrWhite,
                    },
                  ]}
                >
                  {cleanCurrentOdds}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Contenu étendu (Mise | Code promo | Cote de référence) */}
            {renderExpandedBettingPanel()}

            {/* Bouton Pari bleu pleine largeur */}
            <TouchableOpacity
              style={[styles.pariButton, { backgroundColor: actionBtnBg }]}
              activeOpacity={0.88}
              onPress={onPlaceBet}
            >
              <Text style={[styles.pariButtonText, { color: actionBtnTextColor }]}>
                Pari
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  // ===========================================================================
  // LAYOUT B : MEGAPARI (3 Colonnes : Événements | Cote | Bouton Pari rouge)
  // ===========================================================================
  if (isMegaPari) {
    return (
      <>
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
            {
              left: sideInset,
              right: sideInset,
              bottom: bottomDockOffset,
              backgroundColor: lowerBg,
            },
          ]}
        >
          {/* Poignée supérieure centrée */}
          <TouchableOpacity
            style={styles.handleTouchable}
            onPress={onToggleExpand}
            activeOpacity={0.7}
            accessibilityLabel="Ouvrir ou fermer le panneau de mise"
          >
            <View style={[styles.handleBar, { backgroundColor: handleColor }]} />
          </TouchableOpacity>

          {/* Contenu étendu (Mise | Code promo | Cote de référence) */}
          {renderExpandedBettingPanel()}

          {/* Barre 3 colonnes : Événements | Cote | Bouton Pari */}
          <View style={[styles.megapariBarRow, { paddingBottom: fusedBottomPadding }]}>
            {/* Colonne 1 : Icône rouge + Nombre au-dessus de "Événements" */}
            <TouchableOpacity
              style={styles.megapariStatCol}
              activeOpacity={0.8}
              onPress={onToggleExpand}
            >
              <View style={styles.megapariCountTopRow}>
                <BetLayersIcon
                  size={16}
                  color={brandAccent}
                  primaryColor={brandAccent}
                />
                <Text
                  style={[
                    styles.megapariCountValue,
                    { color: textNavyOrWhite },
                  ]}
                >
                  {eventsCount}
                </Text>
              </View>
              <Text style={[styles.megapariStatLabel, { color: textMuted }]}>
                Événements
              </Text>
            </TouchableOpacity>

            {/* Colonne 2 : Cote totale au-dessus de "Cote" */}
            <TouchableOpacity
              style={styles.megapariStatCol}
              activeOpacity={0.8}
              onPress={onToggleExpand}
            >
              <Text
                style={[
                  styles.megapariOddsValue,
                  {
                    color:
                      oddsTrend === 'down'
                        ? '#E04F4F'
                        : textNavyOrWhite,
                  },
                ]}
              >
                {cleanCurrentOdds}
              </Text>
              <Text style={[styles.megapariStatLabel, { color: textMuted }]}>
                Cote
              </Text>
            </TouchableOpacity>

            {/* Colonne 3 : Bouton Pari rouge à droite */}
            <TouchableOpacity
              style={[styles.megapariPariBtn, { backgroundColor: actionBtnBg }]}
              activeOpacity={0.88}
              onPress={onPlaceBet}
            >
              <Text style={styles.pariButtonText}>Pari</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  // ===========================================================================
  // LAYOUT C : 1XBET / MELBET / WINWIN / BETWINNER (Double étage + Engrenage)
  // ===========================================================================
  return (
    <>
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
          {
            left: sideInset,
            right: sideInset,
            bottom: bottomDockOffset,
          },
        ]}
      >
        {/* 1. SOUS-SECTION SUPÉRIEURE (RÉSUMÉ #F3F6FA CLAIR / #26374B SOMBRE) */}
        <View style={[styles.upperSection, { backgroundColor: upperBg }]}>
          {/* Poignée supérieure centrée */}
          <TouchableOpacity
            style={styles.handleTouchable}
            onPress={onToggleExpand}
            activeOpacity={0.7}
            accessibilityLabel="Ouvrir ou fermer le panneau de mise"
          >
            <View style={[styles.handleBar, { backgroundColor: handleColor }]} />
          </TouchableOpacity>

          <View style={styles.upperBodyRow}>
            {/* Colonne Gauche : 3 lignes */}
            <TouchableOpacity
              style={styles.upperLeftCol}
              activeOpacity={0.8}
              onPress={onToggleExpand}
            >
              {/* Ligne 1 : Icône ticket diagonal (si 1 événement) ou couches + Nombre */}
              <View style={styles.countRow}>
                {eventsCount <= 1 ? (
                  <DiagonalCouponTicketIcon size={15} color={subtextMuted} />
                ) : (
                  <BetLayersIcon
                    size={14}
                    color={subtextMuted}
                    primaryColor={subtextMuted}
                  />
                )}
                <Text style={[styles.countValue, { color: textNavyOrWhite }]}>
                  {eventsCount}
                </Text>
              </View>

              {/* Ligne 2 : Label Cotes: + Cote en rouge si baisse ou couleur principale */}
              <View style={styles.oddsRow}>
                <Text style={[styles.oddsLabel, { color: textMuted }]}>
                  Cotes:{' '}
                </Text>
                <Text
                  style={[
                    styles.oddsValue,
                    {
                      color:
                        oddsTrend === 'down'
                          ? '#E04F4F'
                          : textNavyOrWhite,
                    },
                  ]}
                >
                  {oddsTrend === 'down' ? `↓${cleanCurrentOdds}` : cleanCurrentOdds}
                </Text>
              </View>

              {/* Ligne 3 : Mention de confirmation avec valeur en gras */}
              <Text
                style={[styles.policySubtext, { color: textMuted }]}
                numberOfLines={1}
              >
                Si la cote change:{' '}
                <Text style={[styles.policySubtextBold, { color: subtextMuted }]}>
                  {policyShortText}
                </Text>
              </Text>
            </TouchableOpacity>

            {/* Colonne Droite : Bouton Paramètres carré arrondi avec engrenage */}
            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: gearBtnBg }]}
              onPress={() => {
                if (!isExpanded) {
                  onBetTabChange('Cote de référence');
                  onToggleExpand();
                } else {
                  onOddsPolicyChange(
                    oddsPolicy === 'ask' ? 'up' : oddsPolicy === 'up' ? 'any' : 'ask'
                  );
                }
              }}
              activeOpacity={0.75}
              accessibilityLabel="Paramètres du coupon"
            >
              <Ionicons name="settings-sharp" size={20} color={brandAccent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. CONTENU ÉTENDU DYNAMIQUE (ANIMÉ LORS DU DÉPLIEMENT) */}
        {renderExpandedBettingPanel()}

        {/* 3. SOUS-SECTION INFÉRIEURE : BOUTON PARI PLEINE LARGEUR */}
        <View
          style={[
            styles.lowerSection,
            { backgroundColor: lowerBg, paddingBottom: fusedBottomPadding },
          ]}
        >
          <TouchableOpacity
            style={[styles.pariButton, { backgroundColor: actionBtnBg }]}
            activeOpacity={0.88}
            onPress={onPlaceBet}
          >
            <Text style={[styles.pariButtonText, { color: actionBtnTextColor }]}>
              Pari
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 15,
  },
  container: {
    position: 'absolute',
    zIndex: 25,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 -3px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  upperSection: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  handleTouchable: {
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  upperBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upperLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countValue: {
    fontSize: 14.5,
    fontWeight: '600',
    marginLeft: 6,
  },
  oddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  oddsLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  oddsValue: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  policySubtext: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 3,
  },
  policySubtextBold: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowerSection: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    marginTop: -6,
  },
  pariButton: {
    width: '100%',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pariButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Styles PariPesa Bottom Sheet
  paripesaInnerWrap: {
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  paripesaSummaryBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  paripesaSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paripesaSummaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paripesaSummaryLabel: {
    fontSize: 13.5,
    fontWeight: '400',
  },
  paripesaSummaryValue: {
    fontSize: 14.5,
    fontWeight: '700',
  },

  // Styles MegaPari Bottom Sheet
  megapariBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 14,
  },
  megapariStatCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  megapariCountTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  megapariCountValue: {
    fontSize: 15.5,
    fontWeight: '700',
    marginLeft: 5,
  },
  megapariOddsValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  megapariStatLabel: {
    fontSize: 12.5,
    fontWeight: '400',
    marginTop: 2,
  },
  megapariPariBtn: {
    height: 44,
    minWidth: 122,
    paddingHorizontal: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Styles Panneau Étendu (3 Onglets)
  expandedContentPadding: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillText: {
    fontSize: 12.5,
  },
  balanceCard: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plusCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  balanceSmallLabel: {
    fontSize: 11.5,
  },
  balanceValueText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  paramLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paramLinkText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  stakeInputBox: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    marginBottom: 8,
  },
  stakeInputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  currencySuffix: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  stepperRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperMinusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepperPlusText: {
    fontSize: 20,
    fontWeight: '500',
  },
  stepperDivider: {
    width: 1,
    height: 18,
  },
  financialBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitsText: {
    fontSize: 12,
  },
  payoutRowText: {
    fontSize: 13,
    fontWeight: '600',
  },
  payoutGreenText: {
    fontWeight: '700',
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  altTabWrap: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  altTabTitle: {
    fontSize: 12.5,
    marginBottom: 6,
  },
  promoInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  policyLabel: {
    fontSize: 13,
  },
});

export default BetBottomSheet;
