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
import {
  getHeaderBgColor,
  getScreenBgColor,
  getStatusBarStyleForTheme,
} from '../theme/themes';
import { useAuthStore } from '../store/authStore';
import { useResponsive } from '../utils/responsive';
import { BrandLogo } from '../components/common/BrandLogo';
import { ROUTE_TO_FEATURE_MAP } from '../types/permissions';
import {
  createAppRefreshControl,
  useAppRefresh,
} from '../components/common/AppRefreshControl';

export default function MenuScreen({ navigation }: any) {
  const { theme, currentTheme: rawCurrentTheme, setThemeModalVisible } = useThemeStore();
  const currentTheme = rawCurrentTheme || theme;
  const { balance } = useBetStore();
  const {
    currentUser,
    accounts,
    logout,
    localDeviceId,
    checkDeviceSession,
    hasAccessToFeature,
    isSimulatingUser,
    exitUserSimulation,
  } = useAuthStore();
  const { contentContainerStyle, font, moderateScale, insets } = useResponsive();

  const handleNavigateFeature = (route: string) => {
    // Si l'utilisateur est bloqué / inactif
    if (currentUser && !currentUser.isActive) {
      Alert.alert(
        'Compte suspendu',
        currentUser.blockedReason
          ? `Votre compte est bloqué : ${currentUser.blockedReason}.\n\nL'accès aux studios et mini-jeux est restreint.`
          : "Votre compte a été suspendu par l'administrateur. L'accès aux jeux et studios est révoqué.",
        [{ text: 'Compris', style: 'default' }]
      );
      return;
    }

    const feat = ROUTE_TO_FEATURE_MAP[route];
    if (feat && !hasAccessToFeature(feat)) {
      Alert.alert(
        'Accès restreint',
        "Vous n'avez pas l'autorisation d'accéder à ce studio / mini-jeu.\n\nVeuillez contacter votre administrateur pour débloquer votre accès.",
        [{ text: 'Compris', style: 'default' }]
      );
      return;
    }
    navigation.navigate(route);
  };

  const { refreshing, onRefresh } = useAppRefresh(async () => {
    if (currentUser?.id) {
      await checkDeviceSession();
    }
  });

  const handleLogout = () => {
    logout();
  };

  const headerBg = getHeaderBgColor(currentTheme);
  const screenBg = getScreenBgColor(currentTheme);
  const statusBarStyle = getStatusBarStyleForTheme(currentTheme, headerBg);

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <StatusBar
        animated
        barStyle={statusBarStyle}
        {...({ translucent: true, backgroundColor: 'transparent' } as any)}
      />
      {/* Top Bar (Edge-to-Edge avec insets.top) */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: headerBg,
            borderBottomColor: currentTheme.border,
            paddingTop: 12 + insets.top,
          },
        ]}
      >
        <View style={[{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, contentContainerStyle]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            onPress={onRefresh}
            activeOpacity={0.8}
            accessibilityLabel="Actualiser"
          >
            <BrandLogo size={18} variant="header" />
            <Text style={[styles.topBarTitle, { color: currentTheme.textPrimary, fontSize: font(16) }]}>Mon Compte & Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.userBadgeTop}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle" size={moderateScale(24)} color={currentTheme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentContainerStyle, { paddingBottom: 100 + (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 0)) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={createAppRefreshControl({
          refreshing,
          onRefresh,
          theme: currentTheme,
          progressViewOffset: 15,
        })}
      >
        {/* Mode Simulation Admin Banner */}
        {isSimulatingUser && (
          <View style={styles.simulationBanner}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.simIconBadge}>
                <Ionicons name="eye" size={18} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.simulationTitle}>
                  MODE TEST : @{currentUser?.username || 'utilisateur'}
                </Text>
                <Text style={styles.simulationSub}>
                  {!currentUser?.isActive
                    ? '⚠️ Compte suspendu / bloqué (Tous les jeux verrouillés)'
                    : `${currentUser?.allowedFeatures?.length || 0}/7 studios & jeux autorisés`}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.exitSimBtn}
              onPress={() => exitUserSimulation()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-undo" size={14} color="#FFFFFF" />
              <Text style={styles.exitSimBtnText}>Admin</Text>
            </TouchableOpacity>
          </View>
        )}

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

          {/* 1. Studio Match & FIFA */}
          {(() => {
            const isAllowed = hasAccessToFeature('studio_match');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('StudioCreation')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? (theme.primarySoft || 'rgba(56, 189, 248, 0.15)') : 'rgba(100, 116, 139, 0.15)' }]}>
                  <Image
                    source={require('../../assets/icons/ic_football.png')}
                    style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: isAllowed ? theme.primary : '#64748B' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Studio Match & FIFA</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Créateur de matchs, cotes et résultats personnalisés</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}

          {/* 2. Studio Mortal Kombat */}
          {(() => {
            const isAllowed = hasAccessToFeature('studio_mk');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('StudioMortalKombat')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
                  <MaterialCommunityIcons name="sword-cross" size={20} color={isAllowed ? "#EF4444" : "#64748B"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Studio Mortal Kombat</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Générateur de combats et simulation de rounds</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}

          {/* 3. Studio TV & Poker */}
          {(() => {
            const isAllowed = hasAccessToFeature('studio_tv');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('StudioTV')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? 'rgba(234, 179, 8, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
                  <Ionicons name="tv-outline" size={20} color={isAllowed ? "#EAB308" : "#64748B"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Studio TV & Poker</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Simulation de tirages et jeux TV</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}

          {/* 4. Apple of Fortune */}
          {(() => {
            const isAllowed = hasAccessToFeature('game_apple');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('AppleOfFortune')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
                  <Ionicons name="nutrition-outline" size={20} color={isAllowed ? "#22C55E" : "#64748B"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Apple of Fortune</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Mini-jeu de pommes et multiplicateurs</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}

          {/* 5. Royal Feast */}
          {(() => {
            const isAllowed = hasAccessToFeature('game_royal_feast');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('RoyalFeast')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? 'rgba(234, 179, 8, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
                  <Ionicons name="restaurant-outline" size={20} color={isAllowed ? "#EAB308" : "#64748B"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Royal Feast</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Jeu de cloches royales & multiplicateurs</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}

          {/* 6. Crash Game (Aviator) */}
          {(() => {
            const isAllowed = hasAccessToFeature('game_crash');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('CrashGame')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? 'rgba(168, 85, 247, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
                  <Ionicons name="rocket-outline" size={20} color={isAllowed ? "#A855F7" : "#64748B"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Crash Game (Aviator)</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Simulation de décollage et cashout en direct</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}

          {/* 7. Kamikaze */}
          {(() => {
            const isAllowed = hasAccessToFeature('game_kamikaze');
            return (
              <TouchableOpacity
                style={[styles.actionItemRow, !isAllowed && { opacity: 0.65 }]}
                onPress={() => handleNavigateFeature('Kamikaze')}
              >
                <View style={[styles.actionIconBox, { backgroundColor: isAllowed ? 'rgba(229, 40, 44, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
                  <Ionicons name="airplane-outline" size={20} color={isAllowed ? "#E5282C" : "#64748B"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionItemTitle, { color: isAllowed ? theme.textPrimary : theme.textSecondary }]}>Kamikaze</Text>
                  <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Avion, tirs de DCA & multiplicateurs jusqu'à x50</Text>
                </View>
                <Ionicons
                  name={isAllowed ? "chevron-forward" : "lock-closed"}
                  size={18}
                  color={isAllowed ? theme.textSecondary : '#EF4444'}
                />
              </TouchableOpacity>
            );
          })()}
        </View>

        {/* Section Sp?ciale : Aper?u & Tests Interface iPhone / Web */}
        <View style={[styles.menuSectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="phone-portrait-outline" size={18} color="#F1B92C" />
            <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>INTERFACE IPHONE (MELBET)</Text>
          </View>

          {/* 1. Historique iPhone */}
          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('IPhoneBetHistory')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(241, 185, 44, 0.15)' }]}>
              <Ionicons name="time-outline" size={20} color="#F1B92C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Historique des paris (iPhone)</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Filtre haut, solde + d?poser jaune, 2 capsules</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* 2. D?tails du pari iPhone */}
          <TouchableOpacity
            style={styles.actionItemRow}
            onPress={() => navigation.navigate('IPhoneBetDetail')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(241, 185, 44, 0.15)' }]}>
              <Ionicons name="receipt-outline" size={20} color="#F1B92C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Informations sur le pari (iPhone)</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Progression ?v?nements, vendre, dupliquer</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* 3. Coupon iPhone */}
          <TouchableOpacity
            style={[styles.actionItemRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('IPhoneCoupon')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: 'rgba(241, 185, 44, 0.15)' }]}>
              <Ionicons name="flash-outline" size={20} color="#F1B92C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionItemTitle, { color: theme.textPrimary }]}>Coupon & Booster (iPhone)</Text>
              <Text style={[styles.actionItemSub, { color: theme.textSecondary }]}>Booster pointill? jaune, bottom sheet & Pari</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Section 3 : Apparence */}
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
                  <Text style={[styles.themeCardTitle, { color: theme.textPrimary }]}>Apparence</Text>
                </View>
                <View style={[styles.themePill, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.themePillText, { color: theme.primary }]}>{theme.displayName}</Text>
                </View>
              </View>
              <Text style={[styles.themeCardSub, { color: theme.textSecondary }]}>
                Disposition, modale de sauvegarde, marque et mode
              </Text>
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
            {
              title: 'Apparence',
              icon: 'color-palette-outline',
              onPress: () => setThemeModalVisible(true),
            },
            { title: 'Revoir le tutoriel / Guide du parieur', icon: 'book-outline' },
            { title: 'Notifications et alertes de cotes', icon: 'notifications-outline' },
            { title: 'Historique des transactions', icon: 'receipt-outline' },
            { title: 'Sécurité du compte & Appareil', icon: 'lock-closed-outline' },
          ].map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionRow}
              onPress={opt.onPress || (() => Alert.alert(opt.title, 'Service actif et opérationnel.'))}
            >
              <Ionicons name={opt.icon as any} size={18} color={theme.primary} />
              <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>{opt.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  simulationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  simIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.3,
  },
  simulationSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 2,
    fontWeight: '500',
  },
  exitSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  exitSimBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
});
