import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';

// Screens
import PopularScreen from '../screens/PopularScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MenuScreen from '../screens/MenuScreen';
import StudioCreationScreen from '../screens/StudioCreationScreen';
import StudioTVScreen from '../screens/StudioTVScreen';
import StudioMortalKombatScreen from '../screens/StudioMortalKombatScreen';
import AppleOfFortuneScreen from '../screens/AppleOfFortuneScreen';
import CrashGameScreen from '../screens/CrashGameScreen';
import BetDetailScreen from '../screens/BetDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ navigation }: any) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryAccent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 82 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Populaire"
        component={PopularScreen}
        options={{
          tabBarLabel: 'Populaire',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Favoris"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favoris',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Floating Center Coupon Button */}
      <Tab.Screen
        name="CouponTab"
        component={StudioCreationScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.floatingCenterBtn}
              onPress={() => navigation.navigate('StudioCreation')}
            >
              <MaterialCommunityIcons name="ticket-confirmation" size={26} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Historique"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Historique',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="StudioCreation" component={StudioCreationScreen} />
        <Stack.Screen name="StudioTV" component={StudioTVScreen} />
        <Stack.Screen name="StudioMortalKombat" component={StudioMortalKombatScreen} />
        <Stack.Screen name="AppleOfFortune" component={AppleOfFortuneScreen} />
        <Stack.Screen name="CrashGame" component={CrashGameScreen} />
        <Stack.Screen name="BetDetail" component={BetDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  floatingCenterBtn: {
    top: -20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
});
