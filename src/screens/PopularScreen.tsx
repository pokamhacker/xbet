import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  getHeaderBgColor,
  getScreenBgColor,
  getStatusBarStyleForTheme,
} from '../theme/themes';
import { useResponsive } from '../utils/responsive';
import { BrandLogo } from '../components/common/BrandLogo';
import { ROUTE_TO_FEATURE_MAP } from '../types/permissions';
import {
  createAppRefreshControl,
  useAppRefresh,
} from '../components/common/AppRefreshControl';

export default function PopularScreen({ navigation }: any) {
  const { balance } = useBetStore();
  const {
    currentUser,
    accounts,
    hasAccessToFeature,
    isSimulatingUser,
    exitUserSimulation,
  } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const { contentContainerStyle, font, moderateScale, insets } = useResponsive();
  const { refreshing, onRefresh } = useAppRefresh();

  const handlePressStudio = (route: string) => {
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

  const studios = [
    {
      id: 'studio-custom',
      title: 'Accéder au studio',
      subtitle: 'Crée tes propres coupons de paris sportifs personnalisés.',
      badge: 'POPULAIRE',
      badgeColor: currentTheme.primary,
      iconName: 'ticket-percent-outline',
      iconType: 'material' as const,
      route: 'StudioCreation',
    },
    {
      id: 'studio-poker',
      title: 'Accéder au studio TV',
      subtitle: 'Crée une ou plusieurs manches TvBet Poker réalistes (3 min).',
      badge: 'EN DIRECT',
      badgeColor: Colors.liveRed,
      iconName: 'television-play',
      iconType: 'material' as const,
      route: 'StudioTV',
    },
    {
      id: 'studio-mk',
      title: 'Accéder au studio Mortal Kombat',
      subtitle: 'Combats virtuels : rounds, Brutality, Fatality et cotes denses.',
      badge: 'CYBER-SPORT',
      badgeColor: '#8B5CF6',
      iconName: 'sword-cross',
      iconType: 'material' as const,
      route: 'StudioMortalKombat',
    },
    {
      id: 'game-apple',
      title: 'Accéder à Apple of Fortune',
      subtitle: 'Grimpe les 10 paliers de pommes dorées et encaisse jusqu’à 350x.',
      badge: 'MINI-JEU',
      badgeColor: Colors.success,
      iconName: 'apple',
      iconType: 'material' as const,
      route: 'AppleOfFortune',
    },
    {
      id: 'game-royal-feast',
      title: 'Accéder à Royal Feast',
      subtitle: 'Ouvre les cloches royales sans toucher le poison et multiplie tes gains jusqu\'à 24x !',
      badge: 'NOUVEAU',
      badgeColor: '#EAB308',
      iconName: 'silverware-fork-knife',
      iconType: 'material' as const,
      route: 'RoyalFeast',
    },
    {
      id: 'game-crash',
      title: 'Accéder à Crash',
      subtitle: 'Observe la fusée monter et encaisse avant l’explosion en direct.',
      badge: 'TEMPS RÉEL',
      badgeColor: Colors.gold,
      iconName: 'airplane-takeoff',
      iconType: 'material' as const,
      route: 'CrashGame',
    },
    {
      id: 'game-kamikaze',
      title: 'Accéder à Kamikaze',
      subtitle: 'Fais passer ton avion entre les tirs de la DCA, ligne après ligne, jusqu’à x50.',
      badge: 'NOUVEAU',
      badgeColor: '#E5282C',
      iconName: 'crosshairs-gps',
      iconType: 'material' as const,
      route: 'Kamikaze',
    },
  ];

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
      {/* Top Header Bar (Edge-to-Edge avec insets.top) */}
      <View
        style={[
          styles.topHeader,
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
            <View>
              <Text style={[styles.headerLabel, { color: currentTheme.textSecondary, fontSize: font(11) }]}>
                STUDIO PRO
              </Text>
              <Text style={[styles.headerBalance, { color: currentTheme.textPrimary, fontSize: font(16) }]} numberOfLines={1} adjustsFontSizeToFit>
                {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.depositSmallBtn, { backgroundColor: currentTheme.depositButton.bg }]}
            onPress={() => navigation.navigate('Menu')}
          >
            <Ionicons name="wallet-outline" size={moderateScale(16)} color={currentTheme.depositButton.text} style={{ marginRight: 4 }} />
            <Text style={[styles.depositSmallBtnText, { color: currentTheme.depositButton.text, fontSize: font(12) }]}>Gérer</Text>
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

        {/* Banner Welcome */}
        <View style={[styles.welcomeCard, { backgroundColor: currentTheme.primary }]}>
          <View style={styles.welcomeIconCircle}>
            <MaterialCommunityIcons name="lightning-bolt" size={moderateScale(26)} color={currentTheme.colors?.primaryText || '#FFFFFF'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.welcomeTitle, { color: currentTheme.colors?.primaryText || '#FFFFFF', fontSize: font(15) }]}>
              Générateur iGaming Pro
            </Text>
            <Text style={[styles.welcomeSub, { color: currentTheme.colors?.primaryText ? `${currentTheme.colors.primaryText}CC` : '#FFFFFFCC' }]}>
              Simule des tickets de paris authentiques avec tirages aléatoires et grand livre synchronisé.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionHeading, { color: currentTheme.textSecondary }]}>
          STUDIOS & MINI-JEUX DISPONIBLES
        </Text>

        {studios.map((st) => {
          const feat = ROUTE_TO_FEATURE_MAP[st.route];
          const isAccountActive = currentUser?.isActive !== false;
          const isAllowed = isAccountActive && (!feat || hasAccessToFeature(feat));

          return (
            <TouchableOpacity
              key={st.id}
              style={[
                styles.studioCard,
                {
                  backgroundColor: currentTheme.cardBackground,
                  borderColor: isAllowed ? currentTheme.border : 'rgba(239, 68, 68, 0.4)',
                  opacity: isAllowed ? 1 : 0.65,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handlePressStudio(st.route)}
            >
              <View style={[styles.cardLeftIcon, !isAllowed && { opacity: 0.6 }]}>
                <MaterialCommunityIcons
                  name={st.iconName as any}
                  size={24}
                  color={isAllowed ? currentTheme.primary : '#64748B'}
                />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, { color: currentTheme.textPrimary }]}>{st.title}</Text>
                  {isAllowed ? (
                    <View style={[styles.badgeTag, { backgroundColor: `${st.badgeColor}18` }]}>
                      <Text style={[styles.badgeTagText, { color: st.badgeColor }]}>{st.badge}</Text>
                    </View>
                  ) : (
                    <View style={[styles.badgeTag, { backgroundColor: 'rgba(239, 68, 68, 0.15)', flexDirection: 'row', alignItems: 'center', gap: 3 }]}>
                      <Ionicons name="lock-closed" size={10} color="#EF4444" />
                      <Text style={[styles.badgeTagText, { color: '#EF4444' }]}>
                        {!isAccountActive ? 'BLOQUÉ' : 'VERROUILLÉ'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardSub, { color: currentTheme.textSecondary }]}>{st.subtitle}</Text>
              </View>
              <Ionicons
                name={isAllowed ? "chevron-forward" : "lock-closed-outline"}
                size={18}
                color={isAllowed ? currentTheme.textSecondary : '#EF4444'}
              />
            </TouchableOpacity>
          );
        })}

        {/* Quick Admin Footer Card */}
        <TouchableOpacity
          style={[
            styles.adminQuickCard,
            {
              backgroundColor: currentTheme.cardBackground,
              borderColor: currentTheme.border,
            },
          ]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="settings-outline" size={20} color={currentTheme.primary} />
          <Text style={[styles.adminQuickText, { color: currentTheme.textPrimary }]}>
            Accéder à la console d'administration & gestion du solde
          </Text>
          <Ionicons name="arrow-forward" size={16} color={currentTheme.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerBalance: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
  },
  depositSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  depositSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 110,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 12,
  },
  welcomeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  welcomeSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
  },
  studioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardLeftIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  adminQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    gap: 10,
  },
  adminQuickText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
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
