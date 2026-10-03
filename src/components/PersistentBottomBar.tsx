import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { useCouponStore } from '../store/couponStore';
import { navigate } from '../navigation/navigationRef';
import { Colors, Typography } from '../theme/theme';
import { HistoryTabIcon } from './navigation/HistoryTabIcon';
import { useResponsive } from '../utils/responsive';

// Consommation exclusive des assets locaux de navigation (assets/icons/)
export const NAV_ICONS = {
  populaire: require('../../assets/icons/populaire.png'),
  favoris: require('../../assets/icons/favoris.png'),
  coupon: require('../../assets/icons/coupon.png'),
  historique: require('../../assets/icons/historique.png'),
  menu: require('../../assets/icons/menu.png'),
};

/**
 * Composant TintedNavIcon :
 * - Sur Web (Platform.OS === 'web') : utilise un masque CSS pur (maskImage / WebkitMaskImage)
 *   avec backgroundColor pour bannir tout pavé carré noir opaque.
 * - Sur Mobile (iOS/Android) : utilise <Image style={{ tintColor: color, resizeMode: 'contain' }} />.
 */
export interface TintedNavIconProps {
  source: any;
  color: string;
  size?: number;
  style?: any;
}

export const TintedNavIcon: React.FC<TintedNavIconProps> = ({
  source,
  color,
  size = 22,
  style,
}) => {
  if (Platform.OS === 'web') {
    const resolvedUri = Image.resolveAssetSource ? Image.resolveAssetSource(source)?.uri : source?.uri || source;
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            backgroundColor: color,
            maskImage: `url("${resolvedUri}")`,
            WebkitMaskImage: `url("${resolvedUri}")`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          } as any,
          style,
        ]}
      />
    );
  }

  return (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
          tintColor: color,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

export interface PersistentBottomBarProps {
  currentRoute?: string;
  onTabPress?: (route: string) => void;
}

export const PersistentBottomBar: React.FC<PersistentBottomBarProps> = ({
  currentRoute = 'Populaire',
  onTabPress,
}) => {
  const { theme } = useThemeStore();
  const couponCount = useCouponStore((state) => state.activeEvents.length);
  const { font, isTablet, insets } = useResponsive();

  const handlePress = (targetRoute: string) => {
    if (onTabPress) {
      onTabPress(targetRoute);
      return;
    }

    if (targetRoute === 'CouponTab' || targetRoute === 'StudioCreation') {
      navigate('MainTabs', { screen: 'CouponTab' });
    } else {
      navigate('MainTabs', { screen: targetRoute });
    }
  };

  const isPopulaireActive = currentRoute === 'Populaire';
  const isFavorisActive = currentRoute === 'Favoris';
  const isCouponActive =
    currentRoute === 'CouponTab' ||
    currentRoute === 'Coupon' ||
    currentRoute === 'CouponScreen' ||
    currentRoute === 'StudioCreation';
  const isHistoriqueActive =
    currentRoute === 'Historique' ||
    currentRoute === 'BetDetail' ||
    currentRoute === 'BetDetailTicket' ||
    currentRoute === 'TicketDetails' ||
    currentRoute === 'BetDetails' ||
    currentRoute === 'BetDetailsScreen' ||
    currentRoute === 'HistoryListScreen' ||
    currentRoute === 'BetHistory' ||
    currentRoute === 'BetHistoryScreen';
  const isMenuActive = currentRoute === 'Menu';

  // Palette dynamique iGaming selon le thème (1xBet / Melbet / Paripesa)
  const activeColor = theme?.bottomBar?.active || theme?.active || Colors.primary;
  const inactiveColor = theme?.bottomBar?.inactive || theme?.inactive || Colors.textSecondary;
  const barBg = theme?.bottomBar?.barBg || theme?.barBg || Colors.surface;
  const barBorder = theme?.bottomBar?.barBorder || theme?.barBorder || Colors.border;
  const centerBg = theme?.bottomBar?.centerBg || theme?.centerBg || Colors.primary;
  const centerTint = theme?.bottomBar?.centerTint || theme?.centerTint || (theme?.name?.startsWith('melbet') && theme?.isDark ? '#000000' : '#FFFFFF');

  // Insets dynamiques pour adaptation parfaite mobile (notches, barres de gestes Android/iOS) et desktop
  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset = insets.bottom > 0
    ? Math.max(insets.bottom, androidBottomPad)
    : (Platform.OS === 'ios' ? 20 : androidBottomPad);
  const barHeight = 56 + bottomInset;

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: barBg,
          borderTopWidth: 0,
          height: barHeight,
          paddingBottom: bottomInset,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.contentRow, isTablet && { maxWidth: 680, alignSelf: 'center' }]} pointerEvents="auto">
        {/* 1. Onglet Populaire */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => handlePress('Populaire')}
          accessibilityLabel="Populaire"
          accessibilityRole="tab"
          accessibilityState={{ selected: isPopulaireActive }}
        >
          <View style={styles.iconWrapper}>
            <TintedNavIcon
              source={NAV_ICONS.populaire}
              color={isPopulaireActive ? activeColor : inactiveColor}
              size={22}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.tabLabel,
              { fontSize: font(10.5), color: isPopulaireActive ? activeColor : inactiveColor },
              isPopulaireActive && [styles.activeTabLabel, { color: activeColor }],
            ]}
          >
            Populaire
          </Text>
        </TouchableOpacity>

        {/* 2. Onglet Favoris */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => handlePress('Favoris')}
          accessibilityLabel="Favoris"
          accessibilityRole="tab"
          accessibilityState={{ selected: isFavorisActive }}
        >
          <View style={styles.iconWrapper}>
            <TintedNavIcon
              source={NAV_ICONS.favoris}
              color={isFavorisActive ? activeColor : inactiveColor}
              size={22}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.tabLabel,
              { fontSize: font(10.5), color: isFavorisActive ? activeColor : inactiveColor },
              isFavorisActive && [styles.activeTabLabel, { color: activeColor }],
            ]}
          >
            Favoris
          </Text>
        </TouchableOpacity>

        {/* 3. Bouton Flottant Central « Coupon » (Cercle plein 54x54dp, sans cadre parasite) */}
        <TouchableOpacity
          style={styles.centerTabItem}
          activeOpacity={0.88}
          onPress={() => handlePress('CouponTab')}
          accessibilityLabel="Coupon de pari"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.centerCircle,
              {
                backgroundColor: centerBg,
                shadowColor: centerBg,
              },
            ]}
          >
            <TintedNavIcon
              source={NAV_ICONS.coupon}
              color={centerTint}
              size={30}
              style={{ transform: [{ rotate: '-15deg' }] }}
            />

            {/* Badge numérique orange réactif si événements actifs dans le coupon */}
            {couponCount > 0 && (
              <View style={styles.orangeBadge}>
                <Text style={styles.orangeBadgeText}>{couponCount}</Text>
              </View>
            )}
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.tabLabel,
              { fontSize: font(10.5), color: isCouponActive ? activeColor : inactiveColor },
              isCouponActive && [styles.activeTabLabel, { color: activeColor }],
            ]}
          >
            Coupon
          </Text>
        </TouchableOpacity>

        {/* 4. Onglet Historique (Pastille ronde avec horloge si actif) */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => handlePress('Historique')}
          accessibilityLabel="Historique des paris"
          accessibilityRole="tab"
          accessibilityState={{ selected: isHistoriqueActive }}
        >
          <HistoryTabIcon focused={isHistoriqueActive} />
        </TouchableOpacity>

        {/* 5. Onglet Menu */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => handlePress('Menu')}
          accessibilityLabel="Menu"
          accessibilityRole="tab"
          accessibilityState={{ selected: isMenuActive }}
        >
          <View style={styles.iconWrapper}>
            <TintedNavIcon
              source={NAV_ICONS.menu}
              color={isMenuActive ? activeColor : inactiveColor}
              size={22}
            />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.tabLabel,
              { fontSize: font(10.5), color: isMenuActive ? activeColor : inactiveColor },
              isMenuActive && [styles.activeTabLabel, { color: activeColor }],
            ]}
          >
            Menu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    zIndex: 9999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  contentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 56,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingTop: 3,
    paddingBottom: 3,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  historiqueActiveBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#243DB5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 56,
    paddingBottom: 3,
    backgroundColor: 'transparent',
  },
  centerCircle: {
    position: 'absolute',
    top: -16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#243DB5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#243DB5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  orangeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  orangeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: -0.1,
    textAlign: 'center',
    fontFamily: Typography.fontFamily,
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});

export const BottomBar = PersistentBottomBar;
export const CustomBottomBar = PersistentBottomBar;
export default PersistentBottomBar;
