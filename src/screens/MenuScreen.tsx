import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useResponsive } from '../utils/responsive';
import { BrandLogo } from '../components/common/BrandLogo';

export default function MenuScreen({ navigation }: any) {
  const { theme, setThemeModalVisible } = useThemeStore();
  const { balance } = useBetStore();
  const { currentUser, logout, localDeviceId } = useAuthStore();
  const { contentContainerStyle, font, moderateScale, insets } = useResponsive();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.cardBackground || '#FFFFFF'}
        translucent={Platform.OS === 'android'}
      />
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <View style={[{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, contentContainerStyle]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={18} variant="header" />
            <Text style={[styles.topBarTitle, { color: theme.textPrimary, fontSize: font(16) }]}>Mon Compte & Menu</Text>
          </View>
          <View style={styles.userBadgeTop}>
            <Ionicons name="person-circle" size={moderateScale(24)} color={theme.primary} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, contentContainerStyle, { paddingBottom: 100 + (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 0)) }]} showsVerticalScrollIndicator={false}>
        {/* Section 1 : Carte Profil & Solde Joueur */}
        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.profileHeaderRow}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.usernameRow}>
                <Text style={[styles.usernameText, { color: theme.textPrimary }]}>@{currentUser?.username || 'utilisateur'}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                  <Text style={styles.verifiedText}>Vérifié</Text>
                </View>
              </View>

              <Text style={[styles.memberSinceText, { color: theme.textSecondary }]}>
                Membre depuis le {currentUser?.createdAt || '01.01.2026'}
              </Text>
            </View>
          </View>

          {/* Balance info inside profile */}
          <View style={[styles.profileBalanceBox, { backgroundColor: theme.isDark ? theme.background : Colors.surfaceSecondary, borderColor: theme.border }]}>
            <Text style={[styles.profileBalanceLabel, { color: theme.textSecondary }]}>Solde du compte</Text>
            <Text style={[styles.profileBalanceValue, { color: theme.primary }]}>
              {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣
            </Text>
          </View>

          {/* Mono-device session indicator */}
          <View style={styles.monoSessionIndicator}>
            <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
            <Text style={styles.monoSessionText}>
              Protection Mono-Appareil active sur cette session
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Section 2 : Studios de Création */}
        <View style={[styles.menuSectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="cube-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>STUDIOS DE CRÉATION & JEUX</Text>
          </View>

          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('StudioCreation')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: theme.primarySoft || 'rgba(56, 189, 248, 0.15)' }]}>
              <Image
                source={require('../../assets/icons/ic_football.png')}
                style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: theme.primary }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Studio Match & FIFA</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Créateur de matchs, cotes et résultats personnalisés</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('StudioMortalKombat')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <MaterialCommunityIcons name="sword-cross" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Studio Mortal Kombat</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Générateur de combats et simulation de rounds</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('StudioTV')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Ionicons name="tv-outline" size={20} color="#EAB308" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Studio TV & Poker</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Simulation de tirages et jeux TV</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('AppleOfFortune')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Ionicons name="nutrition-outline" size={20} color="#22C55E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Apple of Fortune</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Mini-jeu de pommes et multiplicateurs</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('CrashGame')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Ionicons name="rocket-outline" size={20} color="#A855F7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Crash Game (Aviator)</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Simulation de décollage et cashout en direct</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Section 3 : White-Label Theme Switcher */}
        <TouchableOpacity
          style={[styles.themeSelectorCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          activeOpacity={0.85}
          onPress={() => setThemeModalVisible(true)}
        >
          <View style={styles.themeSelectorLeft}>
            <View style={[styles.themeBadgeCircle, { backgroundColor: theme.primary }]}>
              <Ionicons name="color-palette" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.themeCardHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <BrandLogo size={16} variant="header" />
                  <Text style={[styles.themeCardTitle, { color: theme.textPrimary }]}>({theme.displayName})</Text>
                </View>
                <View style={[styles.themePill, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.themePillText, { color: theme.primary }]}>Sélecteur</Text>
                </View>
              </View>
              <Text style={[styles.themeCardSub, { color: theme.textSecondary }]}>{theme.tagline}</Text>
            </View>
          </View>
          <View style={[styles.themeSwitchBtn, { backgroundColor: theme.primarySoft || (theme.isDark ? '#2A2E39' : '#EFF6FF') }]}>
            <Text style={[styles.themeSwitchBtnText, { color: theme.primary }]}>Changer</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
          </View>
        </TouchableOpacity>

        {/* Section 4 : Options & Paramètres */}
        <View style={[styles.menuSectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
            <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>PARAMÈTRES DE L'APPLICATION</Text>
          </View>

          {[
            { title: 'Revoir le tutoriel / Guide du parieur', icon: 'book-outline' },
            { title: 'Notifications et alertes de cotes', icon: 'notifications-outline' },
            { title: 'Historique des transactions', icon: 'receipt-outline' },
            { title: 'Sécurité du compte & Appareil', icon: 'lock-closed-outline' },
          ].map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionRow}
              onPress={() => Alert.alert(opt.title, 'Service actif et opérationnel.')}
            >
              <Ionicons name={opt.icon as any} size={18} color={theme.primary} />
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>{opt.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userBadgeTop: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usernameText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
  },
  memberSinceText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  profileBalanceBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  profileBalanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  profileBalanceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryAccent,
    marginTop: 2,
  },
  monoSessionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    marginBottom: 14,
  },
  monoSessionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22C55E',
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  menuSectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionItemSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  themeSelectorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  themeBadgeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  themePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  themePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  themeCardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  themeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  themeSwitchBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
});
