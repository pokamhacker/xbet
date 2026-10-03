import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
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
import BetDetailTicketScreen from '../screens/BetDetailTicketScreen';
import CouponScreen from '../screens/CouponScreen';
import LoginScreen from '../screens/LoginScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

// Navigation & Theme Components
import { navigationRef, getCurrentRouteName } from './navigationRef';
import { PersistentBottomBar } from '../components/PersistentBottomBar';
import { HistoryTabIcon } from '../components/navigation/HistoryTabIcon';
import { ThemeSwitcherModal } from '../components/ThemeSwitcherModal';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useSocketSync } from '../services/socketClientService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // Hide internal tab bar as PersistentBottomBar is rendered globally as persistent overlay
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Populaire" component={PopularScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} />
      <Tab.Screen name="CouponTab" component={CouponScreen} />
      <Tab.Screen
        name="Historique"
        component={HistoryListScreen}
        options={{
          tabBarIcon: ({ focused }) => <HistoryTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, isInitialized, initAuth, checkDeviceSession } = useAuthStore();
  const [currentRoute, setCurrentRoute] = useState<string>('Populaire');
  const { isThemeModalVisible, setThemeModalVisible, currentTheme } = useThemeStore();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Écoute des événements WebSocket en direct (blocage instantané, déconnexion forcée)
  useSocketSync();
  // Android portrait ratio (e.g., 1080×2400) or any portrait window occupies 100% width and height.
  // Desktop phone framing is only applied in desktop landscape mode (width > height and width >= 1024).
  const isPortrait = windowHeight >= windowWidth;
  const isDesktopLandscape = !isPortrait && windowWidth >= 1024;

  useEffect(() => {
    initAuth();
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
      <View style={[styles.rootContainer, styles.centerLoader, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // 1. Unauthenticated -> Login Screen
  if (!currentUser) {
    return (
      <View style={[styles.desktopOuterContainer, !isDesktopLandscape && { backgroundColor: currentTheme.background }]}>
        <View
          style={[
            styles.responsiveAppViewport,
            { backgroundColor: currentTheme.background },
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

  return (
    <View style={[styles.desktopOuterContainer, !isDesktopLandscape && { backgroundColor: currentTheme.background }]}>
      <View
        style={[
          styles.responsiveAppViewport,
          { backgroundColor: currentTheme.background },
          isDesktopLandscape && styles.desktopFramedViewport,
          isDesktopLandscape && windowHeight > 900 && styles.desktopMaxHeight,
        ]}
      >
        <NavigationContainer ref={navigationRef} onStateChange={handleStateChange}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="StudioCreation" component={StudioCreationScreen} />
            <Stack.Screen name="StudioTV" component={StudioTVScreen} />
            <Stack.Screen name="StudioMortalKombat" component={StudioMortalKombatScreen} />
            <Stack.Screen name="AppleOfFortune" component={AppleOfFortuneScreen} />
            <Stack.Screen name="CrashGame" component={CrashGameScreen} />
            <Stack.Screen name="BetDetail" component={BetDetailTicketScreen} />
            <Stack.Screen name="BetDetailTicket" component={BetDetailTicketScreen} />
            <Stack.Screen name="TicketDetails" component={BetDetailTicketScreen} />
            <Stack.Screen name="BetDetails" component={BetDetailTicketScreen} />
            <Stack.Screen name="BetDetailsScreen" component={BetDetailTicketScreen} />
            <Stack.Screen name="CouponScreen" component={CouponScreen} />
            <Stack.Screen name="HistoryListScreen" component={HistoryListScreen} />
            <Stack.Screen name="BetHistory" component={HistoryListScreen} />
            <Stack.Screen name="BetHistoryScreen" component={HistoryListScreen} />
          </Stack.Navigator>
        </NavigationContainer>

        {/* Persistent Bottom Bar Overlay across all screens */}
        <PersistentBottomBar currentRoute={currentRoute} />

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
});
