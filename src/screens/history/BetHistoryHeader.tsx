import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import { useThemeStore } from '../../stores/themeStore';
import {
  CouponScanHeaderIcon,
  DepositCardPlusIcon,
  FilterFunnelIcon,
  HistoryHeaderIconProps,
  SaleTagHeaderIcon,
} from '../../components/icons/HistoryHeaderIcons';

// ============================================================================
// CONSTANTES D'ARCHITECTURE
// ============================================================================
export const TOP_BAR_HEIGHT = 48;

export interface IconBaseProps {
  size?: number;
  color?: string;
  cutoutColor?: string;
}

// ============================================================================
// ICÔNES PAR DÉFAUT DU HEADER HISTORIQUE DES PARIS (PIXEL-PERFECT)
// ============================================================================
export const DefaultFilterIcon: React.FC<IconBaseProps> = ({
  size = 23,
  color,
}) => <FilterFunnelIcon size={size} color={color} />;

export const DefaultWalletIcon: React.FC<IconBaseProps> = ({
  size = 25,
  color,
  cutoutColor,
}) => (
  <CouponScanHeaderIcon size={size} color={color} cutoutColor={cutoutColor} />
);

export const DefaultChevronDownIcon: React.FC<IconBaseProps> = ({
  size = 15,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || (currentTheme.isDark ? currentTheme.textPrimary : '#577089');
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M3.6 6L8 10.4L12.4 6"
        stroke={c}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const DefaultPlusIcon: React.FC<IconBaseProps> = ({
  size = 25,
  color = '#48B16E',
  cutoutColor = '#DCF2E3',
}) => (
  <DepositCardPlusIcon size={size} color={color} cutoutColor={cutoutColor} />
);

export const DefaultCalendarIcon: React.FC<IconBaseProps> = ({
  size = 20,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.primary || '#3982C6';
  return <Ionicons name="calendar-sharp" size={size} color={c} />;
};

export const DefaultTagIcon: React.FC<IconBaseProps> = ({
  size = 23,
  color,
  cutoutColor,
}) => (
  <SaleTagHeaderIcon size={size} color={color} cutoutColor={cutoutColor} />
);

// ============================================================================
// UTILITAIRE : FORMATAGE DU SOLDE (ESPACES DE MILLIERS + DÉCIMALES PRÉSERVÉES)
// ============================================================================
export const formatBalance = (amount: number | string): string => {
  const num =
    typeof amount === 'string'
      ? parseFloat(
          amount
            .replace(/\s+/g, '')
            .replace(',', '.')
            .replace(/[^0-9.-]+/g, '')
        )
      : amount;

  if (isNaN(num)) return String(amount);

  const hasDecimals = Math.abs(num - Math.round(num)) >= 0.005;
  const fixed = hasDecimals
    ? num.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
    : Math.round(num).toString();

  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
};

// ============================================================================
// 1. COMPOSANT STICKY TOP BAR (LIGNE 1 FIXÉE AU SOMMET)
// ============================================================================
export interface BetHistoryTopBarProps {
  title?: string;
  scrollY?: Animated.Value;
  isSticky?: boolean;
  isFilterActive?: boolean;
  onTitlePress?: () => void;
  onFilterPress?: () => void;
  onWalletPress?: () => void;
  ChevronDownIcon?: React.ComponentType<IconBaseProps>;
  FilterIcon?: React.ComponentType<IconBaseProps>;
  WalletIcon?: React.ComponentType<HistoryHeaderIconProps>;
  style?: StyleProp<ViewStyle>;
}

export const BetHistoryTopBar: React.FC<BetHistoryTopBarProps> = ({
  title = 'Historique des paris',
  scrollY,
  isSticky = true,
  onTitlePress,
  onWalletPress,
  ChevronDownIcon = DefaultChevronDownIcon,
  WalletIcon = DefaultWalletIcon,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const statusBarHeight =
    Platform.OS === 'android'
      ? StatusBar.currentHeight || insets.top || 0
      : insets.top;

  const headerBg = currentTheme.headerBackground || '#FFFFFF';
  const titleColor = currentTheme.isDark ? currentTheme.textPrimary : '#577089';
  const rightIconColor = currentTheme.isDark
    ? currentTheme.textSecondary
    : '#577089';

  // Bordure inférieure discrète uniquement lors du scroll
  const borderOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 15],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      })
    : 0;

  return (
    <View
      style={[
        styles.topBar,
        {
          backgroundColor: headerBg,
          height: TOP_BAR_HEIGHT + statusBarHeight,
          paddingTop: statusBarHeight,
        },
        isSticky && styles.topBarSticky,
        style,
      ]}
    >
      {/* Titre centré horizontalement + chevron bas */}
      <View
        style={[styles.topBarCenteredContainer, { top: statusBarHeight }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.titleButton}
          activeOpacity={0.7}
          onPress={onTitlePress}
        >
          <Text style={[styles.titleText, { color: titleColor }]}>{title}</Text>
          <ChevronDownIcon size={15} color={titleColor} />
        </TouchableOpacity>
      </View>

      {/* Action unique à droite : icône cartes empilées (comme sur la capture) */}
      <View style={[styles.topBarActionsRight, { height: TOP_BAR_HEIGHT }]}>
        <TouchableOpacity
          style={styles.actionIconBtn}
          activeOpacity={0.7}
          onPress={onWalletPress}
          accessibilityLabel="Portefeuille"
        >
          <WalletIcon
            size={25}
            color={rightIconColor}
            cutoutColor={headerBg}
          />
        </TouchableOpacity>
      </View>

      {/* Bordure discrète animée uniquement lors du défilement */}
      {scrollY ? (
        <Animated.View
          style={[
            styles.topBarBottomBorder,
            { opacity: borderOpacity, backgroundColor: currentTheme.border },
          ]}
          pointerEvents="none"
        />
      ) : null}
    </View>
  );
};

// ============================================================================
// 2. COMPOSANT COLLAPSIBLE CONTENT (SOLDE CENTRÉ + 3 CARTES D'ACTIONS)
// ============================================================================
export interface BetHistoryCollapsibleHeaderProps {
  balance?: number | string;
  currencySymbol?: string;
  accountLabel?: string;
  selectedPeriod?: string;
  isSaleActive?: boolean;
  isFilterActive?: boolean;
  onAccountSelect?: () => void;
  onDepositPress?: () => void;
  onPeriodPress?: () => void;
  onSalePress?: () => void;
  onFilterPress?: () => void;
  ChevronDownIcon?: React.ComponentType<IconBaseProps>;
  PlusIcon?: React.ComponentType<IconBaseProps>;
  CalendarIcon?: React.ComponentType<IconBaseProps>;
  TagIcon?: React.ComponentType<IconBaseProps>;
  FilterIcon?: React.ComponentType<IconBaseProps>;
  style?: StyleProp<ViewStyle>;
}

export const BetHistoryCollapsibleHeader: React.FC<
  BetHistoryCollapsibleHeaderProps
> = ({
  balance = 10805581.37,
  currencySymbol = '₣',
  accountLabel = 'Compte principal',
  isSaleActive = false,
  isFilterActive = false,
  onAccountSelect,
  onDepositPress,
  onPeriodPress,
  onSalePress,
  onFilterPress,
  ChevronDownIcon = DefaultChevronDownIcon,
  PlusIcon = DefaultPlusIcon,
  TagIcon = DefaultTagIcon,
  FilterIcon = DefaultFilterIcon,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const formattedBalance = `${formatBalance(balance)} ${currencySymbol}`;

  const headerBg = currentTheme.headerBackground || '#FFFFFF';
  const accountLabelColor = currentTheme.isDark
    ? currentTheme.textSecondary
    : '#5E768D';
  const balanceTextColor = currentTheme.isDark ? '#FFFFFF' : '#0B2B4C';

  // Couleurs des 3 cartes d'action conformément à la capture de référence
  const depositCardBg = currentTheme.isDark
    ? 'rgba(72, 177, 110, 0.16)'
    : '#DCF2E3';
  const depositAccent = '#48B16E';

  const neutralCardBg = currentTheme.isDark
    ? currentTheme.colors?.filterChipBg ||
      currentTheme.cardBackground ||
      '#212D3B'
    : '#EAEEF4';
  const activeCardBg =
    currentTheme.primarySoft ||
    (currentTheme.isDark ? '#2A3A4E' : '#D8E5F6');
  const actionAccent = currentTheme.primary || '#3982C6';

  const venteBg = isSaleActive ? activeCardBg : neutralCardBg;
  const filtresBg = isFilterActive ? activeCardBg : neutralCardBg;

  return (
    <View
      style={[
        styles.collapsibleContainer,
        { backgroundColor: headerBg },
        style,
      ]}
    >
      {/* ----------------------------------------------------------------- */}
      {/* LIGNE 2 : Compte principal & Solde centrés                        */}
      {/* ----------------------------------------------------------------- */}
      <TouchableOpacity
        style={styles.centeredBalanceBlock}
        activeOpacity={0.75}
        onPress={onAccountSelect}
      >
        <Text style={[styles.accountLabelText, { color: accountLabelColor }]}>
          {accountLabel}
        </Text>
        <View style={styles.amountRow}>
          <Text style={[styles.balanceAmountText, { color: balanceTextColor }]}>
            {formattedBalance}
          </Text>
          <ChevronDownIcon size={15} color={accountLabelColor} />
        </View>
      </TouchableOpacity>

      {/* ----------------------------------------------------------------- */}
      {/* LIGNE 3 : Trois Cartes (« Effectuer un dépôt », « Vente », « Filtres ») */}
      {/* ----------------------------------------------------------------- */}
      <View style={styles.actionCardsRow}>
        {/* Carte 1 : Effectuer un dépôt */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: depositCardBg,
              borderColor: currentTheme.isDark
                ? 'rgba(72, 177, 110, 0.28)'
                : 'transparent',
              borderWidth: currentTheme.isDark ? 1 : 0,
            },
          ]}
          activeOpacity={0.8}
          onPress={onDepositPress}
        >
          <PlusIcon
            size={25}
            color={depositAccent}
            cutoutColor={depositCardBg}
          />
          <Text
            style={[styles.depositCardText, { color: depositAccent }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Effectuer un dépôt
          </Text>
        </TouchableOpacity>

        {/* Carte 2 : Vente */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: venteBg,
              borderColor: isSaleActive
                ? actionAccent
                : currentTheme.isDark
                  ? currentTheme.border || '#2C3A4B'
                  : 'transparent',
              borderWidth: isSaleActive || currentTheme.isDark ? 1 : 0,
            },
          ]}
          activeOpacity={0.8}
          onPress={onSalePress}
        >
          <TagIcon size={23} color={actionAccent} cutoutColor={venteBg} />
          <Text
            style={[
              styles.actionCardText,
              { color: actionAccent },
              isSaleActive && styles.actionCardTextActive,
            ]}
            numberOfLines={1}
          >
            Vente
          </Text>
        </TouchableOpacity>

        {/* Carte 3 : Filtres */}
        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: filtresBg,
              borderColor: isFilterActive
                ? actionAccent
                : currentTheme.isDark
                  ? currentTheme.border || '#2C3A4B'
                  : 'transparent',
              borderWidth: isFilterActive || currentTheme.isDark ? 1 : 0,
            },
          ]}
          activeOpacity={0.8}
          onPress={onFilterPress || onPeriodPress}
        >
          <FilterIcon size={23} color={actionAccent} />
          <Text
            style={[
              styles.actionCardText,
              { color: actionAccent },
              isFilterActive && styles.actionCardTextActive,
            ]}
            numberOfLines={1}
          >
            Filtres
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// 3. COMPOSANT UNIFIÉ : BetHistoryHeader
// ============================================================================
export interface BetHistoryHeaderProps
  extends BetHistoryTopBarProps,
    BetHistoryCollapsibleHeaderProps {
  showTopBar?: boolean;
  showCollapsible?: boolean;
}

export const BetHistoryHeader: React.FC<BetHistoryHeaderProps> = ({
  showTopBar = true,
  showCollapsible = true,
  title,
  scrollY,
  isSticky = false,
  balance,
  currencySymbol,
  accountLabel,
  selectedPeriod,
  isSaleActive,
  isFilterActive,
  onTitlePress,
  onFilterPress,
  onWalletPress,
  onAccountSelect,
  onDepositPress,
  onPeriodPress,
  onSalePress,
  ChevronDownIcon,
  FilterIcon,
  WalletIcon,
  PlusIcon,
  CalendarIcon,
  TagIcon,
  style,
}) => {
  const { currentTheme } = useThemeStore();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.headerBackground || '#FFFFFF' },
        style,
      ]}
    >
      {showTopBar && (
        <BetHistoryTopBar
          title={title}
          scrollY={scrollY}
          isSticky={isSticky}
          isFilterActive={isFilterActive}
          onTitlePress={onTitlePress}
          onFilterPress={onFilterPress}
          onWalletPress={onWalletPress}
          ChevronDownIcon={ChevronDownIcon}
          FilterIcon={FilterIcon}
          WalletIcon={WalletIcon}
        />
      )}
      {showCollapsible && (
        <BetHistoryCollapsibleHeader
          balance={balance}
          currencySymbol={currencySymbol}
          accountLabel={accountLabel}
          selectedPeriod={selectedPeriod}
          isSaleActive={isSaleActive}
          isFilterActive={isFilterActive}
          onAccountSelect={onAccountSelect}
          onDepositPress={onDepositPress}
          onPeriodPress={onPeriodPress}
          onSalePress={onSalePress}
          onFilterPress={onFilterPress}
          ChevronDownIcon={ChevronDownIcon}
          PlusIcon={PlusIcon}
          CalendarIcon={CalendarIcon}
          TagIcon={TagIcon}
          FilterIcon={FilterIcon}
        />
      )}
    </View>
  );
};

export type HistoryTopBarProps = BetHistoryTopBarProps;
export type HistoryCollapsibleHeaderProps = BetHistoryCollapsibleHeaderProps;
export type HistoryHeaderProps = BetHistoryHeaderProps;

export const HistoryTopBar = BetHistoryTopBar;
export const HistoryCollapsibleHeader = BetHistoryCollapsibleHeader;
export const HistoryHeader = BetHistoryHeader;

export default BetHistoryHeader;

// ============================================================================
// STYLES PIXEL-PERFECT CONFORMES À LA CAPTURE DE RÉFÉRENCE
// ============================================================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },

  // -------------------------------------------------------------------------
  // LIGNE 1 : Top Bar Navigation (Hauteur ~48px)
  // -------------------------------------------------------------------------
  topBar: {
    height: TOP_BAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    position: 'relative',
  },
  topBarSticky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 3,
  },
  topBarCenteredContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#577089',
    letterSpacing: -0.2,
  },
  topBarActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  actionIconBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarBottomBorder: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  // -------------------------------------------------------------------------
  // CONTENEUR DÉFILANT (SOLDE CENTRÉ + 3 CARTES)
  // -------------------------------------------------------------------------
  collapsibleContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 14,
  },

  // LIGNE 2 : Compte principal + Montant centré
  centeredBalanceBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
  },
  accountLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5E768D',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  balanceAmountText: {
    fontSize: 23.5,
    fontWeight: '800',
    color: '#0B2B4C',
    letterSpacing: -0.35,
  },

  // LIGNE 3 : Trois Cartes (« Effectuer un dépôt », « Vente », « Filtres »)
  actionCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    height: 68,
    borderRadius: 15,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  depositCardText: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
  actionCardText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  actionCardTextActive: {
    fontWeight: '700',
  },
});
