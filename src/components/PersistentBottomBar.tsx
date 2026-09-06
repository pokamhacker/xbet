import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { navigate } from '../navigation/navigationRef';

// Consommation exclusive des assets locaux de navigation (assets/icons/)
export const NAV_ICONS = {
  populaire: require('../../assets/icons/populaire.png'),
  favoris: require('../../assets/icons/favoris.png'),
  coupon: require('../../assets/icons/coupon.png'),
  historique: require('../../assets/icons/historique.png'),
  menu: require('../../assets/icons/menu.png'),
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
  const isCouponActive = currentRoute === 'CouponTab' || currentRoute === 'StudioCreation';
  const isHistoriqueActive =
    currentRoute === 'Historique' ||
    currentRoute === 'BetDetail' ||
    currentRoute === 'BetDetailTicket';
  const isMenuActive = currentRoute === 'Menu';

  // Palette de référence iGaming (1xBet / Melbet)
  const activeColor = theme?.active || '#1E3AEB';
  const inactiveColor = theme?.inactive || '#5B6E8C';
  const barBg = theme?.barBg || '#EEF2F6';
  const barBorder = theme?.barBorder || '#D8DFE8';
  const centerBg = theme?.centerBg || '#1E3AEB';

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: barBg,
          borderTopColor: barBorder,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.contentRow} pointerEvents="auto">
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
            <Image
              source={NAV_ICONS.populaire}
              style={[
                styles.tabIcon,
                { opacity: isPopulaireActive ? 1 : 0.82 },
              ]}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isPopulaireActive ? activeColor : inactiveColor },
              isPopulaireActive && styles.activeTabLabel,
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
            <Image
              source={NAV_ICONS.favoris}
              style={[
                styles.tabIcon,
                { opacity: isFavorisActive ? 1 : 0.82 },
              ]}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isFavorisActive ? activeColor : inactiveColor },
              isFavorisActive && styles.activeTabLabel,
            ]}
          >
            Favoris
          </Text>
        </TouchableOpacity>

        {/* 3. Bouton Flottant Central « Coupon » (Refonte Pixel-Perfect) */}
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
            <Image
              source={NAV_ICONS.coupon}
              style={styles.centerTicketIcon}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isCouponActive ? activeColor : inactiveColor },
              isCouponActive && styles.activeTabLabel,
            ]}
          >
            Coupon
          </Text>
        </TouchableOpacity>

        {/* 4. Onglet Historique */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={() => handlePress('Historique')}
          accessibilityLabel="Historique des paris"
          accessibilityRole="tab"
          accessibilityState={{ selected: isHistoriqueActive }}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={NAV_ICONS.historique}
              style={[
                styles.tabIcon,
                { opacity: isHistoriqueActive ? 1 : 0.82 },
              ]}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isHistoriqueActive ? activeColor : inactiveColor },
              isHistoriqueActive && styles.activeTabLabel,
            ]}
          >
            Historique
          </Text>
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
            <Image
              source={NAV_ICONS.menu}
              style={[
                styles.tabIcon,
                { opacity: isMenuActive ? 1 : 0.82 },
              ]}
              resizeMode="contain"
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: isMenuActive ? activeColor : inactiveColor },
              isMenuActive && styles.activeTabLabel,
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
    height: Platform.OS === 'ios' ? 82 : 58,
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
    backgroundColor: '#EEF2F6',
    borderTopWidth: 1,
    borderTopColor: '#D8DFE8',
    zIndex: 9999,
    elevation: 16,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 58,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    paddingTop: 4,
    paddingBottom: 4,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
  centerTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 58,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  centerCircle: {
    position: 'absolute',
    top: -18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#1E3AEB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3AEB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  centerTicketIcon: {
    width: 30,
    height: 30,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});

export const BottomBar = PersistentBottomBar;
export const CustomBottomBar = PersistentBottomBar;
export default PersistentBottomBar;
