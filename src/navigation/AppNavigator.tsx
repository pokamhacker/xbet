import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import PopularScreen from '../screens/PopularScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HistoryListScreen from '../screens/history/HistoryListScreen';
import MenuScreen from '../screens/MenuScreen';
import StudioCreationScreen from '../screens/StudioCreationScreen';
import StudioTVScreen from '../screens/StudioTVScreen';
import StudioMortalKombatScreen from '../screens/StudioMortalKombatScreen';
import AppleOfFortuneScreen from '../screens/AppleOfFortuneScreen';
import CrashGameScreen from '../screens/CrashGameScreen';
import RoyalFeastScreen from '../screens/RoyalFeastScreen';
import KamikazeScreen from '../screens/KamikazeScreen';
import BetDetailTicketScreen from '../screens/BetDetailTicketScreen';
import MatchStatisticsScreen from '../screens/MatchStatisticsScreen';
import MatchMarketsScreen from '../screens/MatchMarketsScreen';
import FifaLiveMatchScreen from '../screens/FifaLiveMatchScreen';
import PokerLiveMatchScreen from '../screens/PokerLiveMatchScreen';
import CouponScreen from '../screens/CouponScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import {
  IPhoneBetHistoryScreen,
  IPhoneBetDetailScreen,
  IPhoneCouponScreen,
} from '../screens/iphone';

// Navigation & Theme Components
import { navigationRef, getCurrentRouteName } from './navigationRef';
import { PersistentBottomBar } from '../components/PersistentBottomBar';
import { HistoryTabIcon } from '../components/navigation/HistoryTabIcon';
import { ThemeSwitcherModal } from '../components/ThemeSwitcherModal';
import { useThemeStore, isIPhoneModeActive } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useSocketSync } from '../services/socketClientService';
import { getHeaderBgColor, getScreenBgColor } from '../theme/themes';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const deviceInterface = useThemeStore((s) => s.deviceInterface);
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const isIPhone = isIPhoneModeActive(deviceInterface);
  const screenBg = getScreenBgColor(currentTheme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: screenBg },
        // Hide internal tab bar as PersistentBottomBar is rendered globally as persistent overlay
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Populaire" component={PopularScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} />
      <Tab.Screen
        name="CouponTab"
        component={isIPhone ? IPhoneCouponScreen : CouponScreen}
      />
      <Tab.Screen
        name="Historique"
        component={isIPhone ? IPhoneBetHistoryScreen : HistoryListScreen}
        options={{
          tabBarIcon: ({ focused }) => <HistoryTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const deviceInterface = useThemeStore((s) => s.deviceInterface);
  const isIPhone = isIPhoneModeActive(deviceInterface);
  const {
    currentUser,
    isInitialized,
    initAuth,
    checkDeviceSession,
    isSimulatingUser,
    exitUserSimulation,
  } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState<string>('Populaire');
  const { isThemeModalVisible, setThemeModalVisible, currentTheme } = useThemeStore();
  // Doit rester avant les return anticipés (règles des hooks React)
  const isBottomBarHidden = useThemeStore((state) => state.isBottomBarHidden);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Écoute des événements WebSocket en direct (blocage instantané, déconnexion forcée)
  useSocketSync();
  // Android portrait ratio (e.g., 1080×2400) or any portrait window occupies 100% width and height.
  // Desktop phone framing is only applied in desktop landscape mode (width > height and width >= 1024).
  const isPortrait = windowHeight >= windowWidth;
  const isDesktopLandscape = !isPortrait && windowWidth >= 1024;

  useEffect(() => {
    initAuth();
    // Filet de sécurité garantissant que l'application s'ouvre même en cas de délai de persistance
    const safetyTimer = setTimeout(() => {
      if (!useAuthStore.getState().isInitialized) {
        useAuthStore.setState({ isInitialized: true });
      }
    }, 1200);
    return () => clearTimeout(safetyTimer);
  }, []);

  // Periodic Single-Session Verification
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      checkDeviceSession();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Loading state while persistent storage is restored
  if (!isInitialized) {
    return (
      <View style={[styles.rootContainer, styles.centerLoader, { backgroundColor: currentTheme?.background || '#0F172A' }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // 1. Unauthenticated -> Login Screen
  if (!currentUser) {
    return (
      <View style={[styles.desktopOuterContainer, !isDesktopLandscape && { backgroundColor: currentTheme?.background || '#0F172A' }]}>
        <View
          style={[
            styles.responsiveAppViewport,
            { backgroundColor: currentTheme?.background || '#0F172A' },
            isDesktopLandscape && styles.desktopFramedViewport,
            isDesktopLandscape && windowHeight > 900 && styles.desktopMaxHeight,
          ]}
        >
          <LoginScreen />
        </View>
      </View>
    );
  }

  // 2. Admin Role -> Admin Dashboard Screen (Full Width / Spacious on Desktop)
  if (currentUser.role === 'ADMIN') {
    return (
      <View style={[styles.adminRootContainer, { backgroundColor: '#0F172A' }]}>
        <View style={styles.adminResponsiveWrapper}>
          <AdminDashboardScreen />
        </View>
      </View>
    );
  }

  // 3. User Client Role -> Normal 1xBet Experience in Responsive Mobile Viewport
  const handleStateChange = () => {
    const route = getCurrentRouteName();
    setCurrentRoute(route);
    checkDeviceSession();
  };

  // Masquer la barre de navigation sur les écrans de jeux plein écran ou si demandée masquée
  const HIDDEN_BOTTOM_BAR_ROUTES = [
    'RoyalFeast',
    'Kamikaze',
    'AppleOfFortune',
    'CrashGame',
    'StudioTV',
    'StudioMortalKombat',
  ];
  const shouldShowBottomBar = !HIDDEN_BOTTOM_BAR_ROUTES.includes(currentRoute) && !isBottomBarHidden;

  const screenBg = getScreenBgColor(currentTheme);
  const headerBg = getHeaderBgColor(currentTheme);
  const navTheme = React.useMemo(
    () => ({
      dark: Boolean(currentTheme?.isDark),
      colors: {
        primary: currentTheme?.primary || '#4A84C4',
        background: screenBg,
        card: headerBg,
        text: currentTheme?.textPrimary || '#002B49',
        border: currentTheme?.border || '#E2E8F0',
        notification: currentTheme?.primary || '#4A84C4',
      },
      fonts: {
        regular: { fontFamily: 'System', fontWeight: '400' as const },
        medium: { fontFamily: 'System', fontWeight: '500' as const },
        bold: { fontFamily: 'System', fontWeight: '700' as const },
        heavy: { fontFamily: 'System', fontWeight: '900' as const },
      },
    }),
    [
      currentTheme?.isDark,
      currentTheme?.primary,
      currentTheme?.textPrimary,
      currentTheme?.border,
      screenBg,
      headerBg,
    ]
  );

  return (
    <View style={[styles.desktopOuterContainer, !isDesktopLandscape && { backgroundColor: screenBg }]}>
      <View
        style={[
          styles.responsiveAppViewport,
          { backgroundColor: screenBg },
          isDesktopLandscape && styles.desktopFramedViewport,
          isDesktopLandscape && windowHeight > 900 && styles.desktopMaxHeight,
        ]}
      >
        {/* Bandeau de Test / Simulation Admin */}
        {isSimulatingUser && (
          <View style={styles.simulationBanner}>
            <View style={styles.simulationBannerLeft}>
              <View style={styles.simulationDot} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.simulationTitle}>MODE TEST ADMIN</Text>
                  <View style={styles.simulationBadge}>
                    <Text style={styles.simulationBadgeText}>SIMULATION</Text>
                  </View>
                </View>
                <Text style={styles.simulationSubtitle} numberOfLines={1}>
                  Compte : <Text style={{ color: '#FCD34D', fontWeight: '800' }}>{currentUser?.username}</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.simulationExitBtn}
              onPress={exitUserSimulation}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.simulationExitText}>Retour Admin</Text>
            </TouchableOpacity>
          </View>
        )}

        <NavigationContainer ref={navigationRef} onStateChange={handleStateChange} theme={navTheme as any}>
          <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: screenBg } }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="StudioCreation" component={StudioCreationScreen} />
            <Stack.Screen name="CouponStudio" component={StudioCreationScreen} />
            <Stack.Screen name="CouponStudioScreen" component={StudioCreationScreen} />
            <Stack.Screen name="MatchStudio" component={StudioCreationScreen} />
            <Stack.Screen name="StudioTV" component={StudioTVScreen} />
            <Stack.Screen name="StudioMortalKombat" component={StudioMortalKombatScreen} />
            <Stack.Screen name="AppleOfFortune" component={AppleOfFortuneScreen} />
            <Stack.Screen name="CrashGame" component={CrashGameScreen} />
            <Stack.Screen name="RoyalFeast" component={RoyalFeastScreen} />
            <Stack.Screen name="Kamikaze" component={KamikazeScreen} />
            <Stack.Screen name="BetDetail" component={isIPhone ? IPhoneBetDetailScreen : BetDetailTicketScreen} />
            <Stack.Screen name="BetDetailTicket" component={isIPhone ? IPhoneBetDetailScreen : BetDetailTicketScreen} />
            <Stack.Screen name="TicketDetails" component={isIPhone ? IPhoneBetDetailScreen : BetDetailTicketScreen} />
            <Stack.Screen name="BetDetails" component={isIPhone ? IPhoneBetDetailScreen : BetDetailTicketScreen} />
            <Stack.Screen name="BetDetailsScreen" component={isIPhone ? IPhoneBetDetailScreen : BetDetailTicketScreen} />
            <Stack.Screen name="MatchStatistics" component={MatchStatisticsScreen} />
            <Stack.Screen name="MatchStatisticsScreen" component={MatchStatisticsScreen} />
            <Stack.Screen name="MatchMarkets" component={MatchMarketsScreen} />
            <Stack.Screen name="MatchMarketsScreen" component={MatchMarketsScreen} />
            <Stack.Screen name="FifaLiveMatch" component={FifaLiveMatchScreen} />
            <Stack.Screen name="FifaLiveMatchScreen" component={FifaLiveMatchScreen} />
            <Stack.Screen name="PokerLiveMatch" component={PokerLiveMatchScreen} />
            <Stack.Screen name="PokerLiveMatchScreen" component={PokerLiveMatchScreen} />
            <Stack.Screen name="CouponScreen" component={isIPhone ? IPhoneCouponScreen : CouponScreen} />
            <Stack.Screen name="HistoryListScreen" component={isIPhone ? IPhoneBetHistoryScreen : HistoryListScreen} />
            <Stack.Screen name="BetHistory" component={isIPhone ? IPhoneBetHistoryScreen : HistoryListScreen} />
            <Stack.Screen name="BetHistoryScreen" component={isIPhone ? IPhoneBetHistoryScreen : HistoryListScreen} />
            <Stack.Screen name="IPhoneBetHistory" component={IPhoneBetHistoryScreen} />
            <Stack.Screen name="IPhoneBetDetail" component={IPhoneBetDetailScreen} />
            <Stack.Screen name="IPhoneCoupon" component={IPhoneCouponScreen} />
          </Stack.Navigator>
        </NavigationContainer>

        {/* Persistent Bottom Bar Overlay across all screens (masqué sur les jeux) */}
        {shouldShowBottomBar && <PersistentBottomBar currentRoute={currentRoute} />}

        {/* Theme Switcher Modal */}
        <ThemeSwitcherModal
          visible={isThemeModalVisible}
          onClose={() => setThemeModalVisible(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  desktopOuterContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#070B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsiveAppViewport: {
    width: '100%',
    height: '100%',
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  desktopFramedViewport: {
    maxWidth: 480,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 14,
  },
  desktopMaxHeight: {
    maxHeight: 900,
    marginVertical: 20,
  },
  adminRootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
  },
  adminResponsiveWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },
  centerLoader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulationBanner: {
    backgroundColor: '#7C2D12',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
  },
  simulationBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  simulationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  simulationTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FEF08A',
    letterSpacing: 0.8,
  },
  simulationBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  simulationBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  simulationSubtitle: {
    fontSize: 11,
    color: '#FED7AA',
    marginTop: 1,
  },
  simulationExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  simulationExitText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
