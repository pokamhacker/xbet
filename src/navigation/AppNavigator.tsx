import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import PopularScreen from '../screens/PopularScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HistoryListScreen from '../screens/HistoryListScreen';
import MenuScreen from '../screens/MenuScreen';
import StudioCreationScreen from '../screens/StudioCreationScreen';
import StudioTVScreen from '../screens/StudioTVScreen';
import StudioMortalKombatScreen from '../screens/StudioMortalKombatScreen';
import AppleOfFortuneScreen from '../screens/AppleOfFortuneScreen';
import CrashGameScreen from '../screens/CrashGameScreen';
import BetDetailTicketScreen from '../screens/BetDetailTicketScreen';
import EmptyCouponScreen from '../screens/EmptyCouponScreen';

// Navigation & Theme Components
import { navigationRef, getCurrentRouteName } from './navigationRef';
import { PersistentBottomBar } from '../components/PersistentBottomBar';
import { ThemeSwitcherModal } from '../components/ThemeSwitcherModal';
import { useThemeStore } from '../store/themeStore';

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
      <Tab.Screen name="CouponTab" component={EmptyCouponScreen} />
      <Tab.Screen name="Historique" component={HistoryListScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [currentRoute, setCurrentRoute] = useState<string>('Populaire');
  const { isThemeModalVisible, setThemeModalVisible } = useThemeStore();

  const handleStateChange = () => {
    const route = getCurrentRouteName();
    setCurrentRoute(route);
  };

  return (
    <View style={styles.rootContainer}>
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
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
