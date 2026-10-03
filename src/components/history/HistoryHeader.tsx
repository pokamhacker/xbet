import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';

// ============================================================================
// CONSTANTES D'ARCHITECTURE
// ============================================================================
export const TOP_BAR_HEIGHT = 48;

// ============================================================================
// EMPLACEMENTS / IMPORTS DES ICÔNES DU PROJET
// Remplacez ces imports ou injectez directement vos composants via les props
// ============================================================================
/*
import {
  ChevronDownIcon,
  FilterIcon,
  WalletIcon,
  PlusIcon,
  CalendarIcon,
  TagIcon,
} from '@/components/icons';
*/

export interface IconBaseProps {
  size?: number;
  color?: string;
}

// Fallbacks d'icônes par défaut
export const DefaultFilterIcon: React.FC<IconBaseProps> = ({
  size = 21,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.colors?.filterIconColor || currentTheme.filterIconColor || currentTheme.primary || currentTheme.textSecondary || '#3B566E';
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M3 4H21V6.5L14 13.5V20L10 22V13.5L3 6.5V4Z" fill={c} />
    </Svg>
  );
};

export const DefaultWalletIcon: React.FC<IconBaseProps> = ({
  size = 24,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.textSecondary || '#3B566E';
  return (
    <Svg fill="none" height={size} viewBox="0 0 26 24" width={size}>
      <Rect fill={c} height="2" rx="1" width="18" x="4" y="2" />
      <Rect fill={c} height="12" rx="3.5" width="22" x="2" y="6" />
      <Rect fill="#FFFFFF" height="2" rx="1" width="10" x="8" y="9" />
      <Rect fill="#FFFFFF" height="2" rx="1" width="10" x="8" y="13" />
      <Rect fill={c} height="2" rx="1" width="18" x="4" y="20" />
    </Svg>
  );
};

export const DefaultChevronDownIcon: React.FC<IconBaseProps> = ({
  size = 16,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.textPrimary || '#233853';
  return <Ionicons name="chevron-down" size={size} color={c} />;
};

export const DefaultPlusIcon: React.FC<IconBaseProps> = ({
  size = 14,
  color = '#FFFFFF',
}) => <Ionicons name="add" size={size} color={color} />;

export const DefaultCalendarIcon: React.FC<IconBaseProps> = ({
  size = 20,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.colors?.filterIconColor || currentTheme.filterIconColor || currentTheme.primary || '#3A86FF';
  return <Ionicons name="calendar-sharp" size={size} color={c} />;
};

export const DefaultTagIcon: React.FC<IconBaseProps> = ({
  size = 20,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.colors?.filterIconColor || currentTheme.filterIconColor || currentTheme.primary || '#3A86FF';
  return <Ionicons name="pricetag-sharp" size={size} color={c} />;
};

// ============================================================================
// UTILITAIRE : FORMATAGE DU SOLDE (ESPACES DE MILLIERS)
// ============================================================================
export const formatBalance = (amount: number | string): string => {
  if (typeof amount === 'string') {
    const num = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return amount;
    return Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// ============================================================================
// 1. COMPOSANT STICKY TOP BAR (LIGNE 1 FIXÉE AU SOMMET)
// ============================================================================
export interface HistoryTopBarProps {
  title?: string;
  scrollY?: Animated.Value;
  isSticky?: boolean;
  isFilterActive?: boolean;
  onTitlePress?: () => void;
  onFilterPress?: () => void;
  onWalletPress?: () => void;
  ChevronDownIcon?: React.ComponentType<IconBaseProps>;
  FilterIcon?: React.ComponentType<IconBaseProps>;
  WalletIcon?: React.ComponentType<IconBaseProps>;
  style?: StyleProp<ViewStyle>;
}

export const HistoryTopBar: React.FC<HistoryTopBarProps> = ({
  title = 'Historique des paris',
  scrollY,
  isSticky = true,
  isFilterActive = false,
  onTitlePress,
  onFilterPress,
  onWalletPress,
  ChevronDownIcon = DefaultChevronDownIcon,
  FilterIcon = DefaultFilterIcon,
  WalletIcon = DefaultWalletIcon,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const filterIconColor = currentTheme.colors?.filterIconColor || currentTheme.filterIconColor || currentTheme.primary || '#3A86FF';
  // Animation de la bordure inférieure discrète au scroll (Native Driver 60/120 FPS)
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
        isSticky && styles.topBarSticky,
        style,
      ]}
    >
      {/* Titre centré horizontalement au milieu absolu de l'écran */}
      <View style={styles.topBarCenteredContainer} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.titleButton}
          activeOpacity={0.7}
          onPress={onTitlePress}
        >
          <Text style={styles.titleText}>{title}</Text>
          <ChevronDownIcon size={16} color="#233853" />
        </TouchableOpacity>
      </View>

      {/* Actions à l'extrême droite : FilterIcon et WalletIcon */}
      <View style={styles.topBarActionsRight}>
        <TouchableOpacity
          style={styles.actionIconBtn}
          activeOpacity={0.7}
          onPress={onFilterPress}
          accessibilityLabel="Filtres"
        >
          <FilterIcon size={21} color={isFilterActive ? filterIconColor : (currentTheme.textSecondary || '#3B566E')} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionIconBtn}
          activeOpacity={0.7}
          onPress={onWalletPress}
          accessibilityLabel="Portefeuille"
        >
          <WalletIcon size={24} color="#3B566E" />
        </TouchableOpacity>
      </View>

      {/* Bordure discrète #E2E8F0 animée lors du scroll */}
      {scrollY ? (
        <Animated.View
          style={[styles.topBarBottomBorder, { opacity: borderOpacity }]}
          pointerEvents="none"
        />
      ) : (
        <View style={styles.topBarBottomBorderStatic} pointerEvents="none" />
      )}
    </View>
  );
};

// ============================================================================
// 2. COMPOSANT COLLAPSIBLE CONTENT (LIGNES 2 & 3 QUI DÉFILENT)
// ============================================================================
export interface HistoryCollapsibleHeaderProps {
  balance?: number | string;
  currencySymbol?: string;
  accountLabel?: string;
  selectedPeriod?: string;
  isSaleActive?: boolean;
  onAccountSelect?: () => void;
  onDepositPress?: () => void;
  onPeriodPress?: () => void;
  onSalePress?: () => void;
  ChevronDownIcon?: React.ComponentType<IconBaseProps>;
  PlusIcon?: React.ComponentType<IconBaseProps>;
  CalendarIcon?: React.ComponentType<IconBaseProps>;
  TagIcon?: React.ComponentType<IconBaseProps>;
  style?: StyleProp<ViewStyle>;
}

export const HistoryCollapsibleHeader: React.FC<HistoryCollapsibleHeaderProps> = ({
  balance = 470307550,
  currencySymbol = 'F',
  accountLabel = 'Compte principal',
  selectedPeriod = '1 mois',
  isSaleActive = false,
  onAccountSelect,
  onDepositPress,
  onPeriodPress,
  onSalePress,
  ChevronDownIcon = DefaultChevronDownIcon,
  PlusIcon = DefaultPlusIcon,
  CalendarIcon = DefaultCalendarIcon,
  TagIcon = DefaultTagIcon,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const formattedBalance = `${formatBalance(balance)} ${currencySymbol}`;
  const filterPillBg = currentTheme.colors?.filterChipBg
    || currentTheme.filterChipBg
    || (currentTheme.isDark ? (currentTheme.cardBackground || '#212D3B') : '#ECEFF4');
  const filterChipTextColor = currentTheme.colors?.filterChipText
    || currentTheme.filterChipText
    || (currentTheme.isDark ? '#FFFFFF' : '#475569');
  const filterIconColor = currentTheme.colors?.filterIconColor
    || currentTheme.filterIconColor
    || currentTheme.primary
    || '#3A86FF';

  return (
    <View style={[styles.collapsibleContainer, style]}>
      {/* ----------------------------------------------------------------- */}
      {/* LIGNE 2 : Solde & Bouton Dépôt                                    */}
      {/* ----------------------------------------------------------------- */}
      <View style={styles.balanceDepositRow}>
        {/* Côté gauche : Compte principal + Montant avec Chevron */}
        <TouchableOpacity
          style={styles.balanceLeftBlock}
          activeOpacity={0.75}
          onPress={onAccountSelect}
        >
          <Text style={styles.accountLabelText}>{accountLabel}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.balanceAmountText}>{formattedBalance}</Text>
            <ChevronDownIcon size={18} color="#0D1F36" />
          </View>
        </TouchableOpacity>

        {/* Côté droit : Bouton vert vif Effectuer un dépôt */}
        <TouchableOpacity
          style={styles.depositButton}
          activeOpacity={0.85}
          onPress={onDepositPress}
        >
          <PlusIcon size={14} color="#FFFFFF" />
          <Text style={styles.depositButtonText}>Effectuer un dépôt</Text>
        </TouchableOpacity>
      </View>

      {/* ----------------------------------------------------------------- */}
      {/* LIGNE 3 : Deux Cartes de Filtres (« 1 mois » et « Vente »)         */}
      {/* ----------------------------------------------------------------- */}
      <View style={styles.filterCardsRow}>
        {/* Carte 1 : Calendrier + 1 mois */}
        <TouchableOpacity
          style={[
            styles.filterCard,
            {
              backgroundColor: filterPillBg,
              borderColor: currentTheme.isDark ? (currentTheme.border || '#2C3A4B') : 'transparent',
              borderWidth: currentTheme.isDark ? 1 : 0,
            },
          ]}
          activeOpacity={0.75}
          onPress={onPeriodPress}
        >
          <CalendarIcon size={20} color={filterIconColor} />
          <Text style={[styles.filterCardText, { color: filterChipTextColor }]}>{selectedPeriod}</Text>
        </TouchableOpacity>

        {/* Carte 2 : Étiquette + Vente */}
        <TouchableOpacity
          style={[
            styles.filterCard,
            {
              backgroundColor: isSaleActive
                ? (currentTheme.primarySoft || (currentTheme.isDark ? '#2A3A4E' : '#D8E5F6'))
                : filterPillBg,
              borderColor: isSaleActive ? (currentTheme.primary || '#3A86FF') : (currentTheme.isDark ? (currentTheme.border || '#2C3A4B') : 'transparent'),
              borderWidth: isSaleActive || currentTheme.isDark ? 1 : 0,
            },
          ]}
          activeOpacity={0.75}
          onPress={onSalePress}
        >
          <TagIcon size={20} color={isSaleActive ? (currentTheme.primary || '#3A86FF') : filterIconColor} />
          <Text
            style={[
              styles.filterCardText,
              { color: isSaleActive ? (currentTheme.primary || '#3A86FF') : filterChipTextColor },
              isSaleActive && styles.filterCardTextActive,
            ]}
          >
            Vente
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// 3. COMPOSANT UNIFIÉ : HistoryHeader
// ============================================================================
export interface HistoryHeaderProps extends HistoryTopBarProps, HistoryCollapsibleHeaderProps {
  showTopBar?: boolean;
  showCollapsible?: boolean;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
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
  return (
    <View style={[styles.container, style]}>
      {showTopBar && (
        <HistoryTopBar
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
        <HistoryCollapsibleHeader
          balance={balance}
          currencySymbol={currencySymbol}
          accountLabel={accountLabel}
          selectedPeriod={selectedPeriod}
          isSaleActive={isSaleActive}
          onAccountSelect={onAccountSelect}
          onDepositPress={onDepositPress}
          onPeriodPress={onPeriodPress}
          onSalePress={onSalePress}
          ChevronDownIcon={ChevronDownIcon}
          PlusIcon={PlusIcon}
          CalendarIcon={CalendarIcon}
          TagIcon={TagIcon}
        />
      )}
    </View>
  );
};

export const BetHistoryTopBar = HistoryTopBar;
export const BetHistoryCollapsibleHeader = HistoryCollapsibleHeader;
export const BetHistoryHeader = HistoryHeader;

export default HistoryHeader;

// ============================================================================
// STYLES PIXEL-PERFECT SOIGNÉS
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
    gap: 6,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#233853',
    letterSpacing: -0.2,
  },
  topBarActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  topBarBottomBorderStatic: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E8F0',
  },

  // -------------------------------------------------------------------------
  // CONTENEUR DÉFILANT (LIGNES 2 & 3)
  // -------------------------------------------------------------------------
  collapsibleContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 14,
  },

  // LIGNE 2 : Solde & Bouton Dépôt
  balanceDepositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  balanceLeftBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  accountLabelText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7C8BA0',
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceAmountText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0D1F36',
    letterSpacing: -0.5,
  },
  depositButton: {
    height: 38,
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  depositButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // LIGNE 3 : Cartes de Filtres (« 1 mois » et « Vente »)
  filterCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  filterCard: {
    flex: 1,
    height: 44,
    backgroundColor: '#ECEFF4',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterCardActive: {
    backgroundColor: '#D8E5F6',
  },
  filterCardText: {
    color: '#475569',
    fontSize: 13.5,
    fontWeight: '600',
  },
  filterCardTextActive: {
    color: '#3A86FF',
    fontWeight: '700',
  },
});
