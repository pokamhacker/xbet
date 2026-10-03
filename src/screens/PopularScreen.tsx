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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { BrandLogo } from '../components/common/BrandLogo';

export default function PopularScreen({ navigation }: any) {
  const { balance } = useBetStore();
  const { currentTheme } = useThemeStore();
  const { contentContainerStyle, font, moderateScale, insets } = useResponsive();

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
      id: 'game-crash',
      title: 'Accéder à Crash',
      subtitle: 'Observe la fusée monter et encaisse avant l’explosion en direct.',
      badge: 'TEMPS RÉEL',
      badgeColor: Colors.gold,
      iconName: 'airplane-takeoff',
      iconType: 'material' as const,
      route: 'CrashGame',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar
        barStyle={currentTheme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.headerBackground || '#FFFFFF'}
        translucent={Platform.OS === 'android'}
      />
      {/* Top Header Bar */}
      <View style={[styles.topHeader, { backgroundColor: currentTheme.headerBackground, borderBottomColor: currentTheme.border }]}>
        <View style={[{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, contentContainerStyle]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <BrandLogo size={18} variant="header" />
            <View>
              <Text style={[styles.headerLabel, { color: currentTheme.textSecondary, fontSize: font(11) }]}>
                STUDIO PRO
              </Text>
              <Text style={[styles.headerBalance, { color: currentTheme.textPrimary, fontSize: font(16) }]} numberOfLines={1} adjustsFontSizeToFit>
                {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.depositSmallBtn, { backgroundColor: currentTheme.depositButton.bg }]}
            onPress={() => navigation.navigate('Menu')}
          >
            <Ionicons name="wallet-outline" size={moderateScale(16)} color={currentTheme.depositButton.text} style={{ marginRight: 4 }} />
            <Text style={[styles.depositSmallBtnText, { color: currentTheme.depositButton.text, fontSize: font(12) }]}>Gérer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, contentContainerStyle, { paddingBottom: 100 + (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 0)) }]} showsVerticalScrollIndicator={false}>
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

        {studios.map((st) => (
          <TouchableOpacity
            key={st.id}
            style={[
              styles.studioCard,
              {
                backgroundColor: currentTheme.cardBackground,
                borderColor: currentTheme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(st.route)}
          >
            <View style={styles.cardLeftIcon}>
              <MaterialCommunityIcons name={st.iconName as any} size={24} color={currentTheme.primary} />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: currentTheme.textPrimary }]}>{st.title}</Text>
                <View style={[styles.badgeTag, { backgroundColor: `${st.badgeColor}18` }]}>
                  <Text style={[styles.badgeTagText, { color: st.badgeColor }]}>{st.badge}</Text>
                </View>
              </View>
              <Text style={[styles.cardSub, { color: currentTheme.textSecondary }]}>{st.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={currentTheme.textSecondary} />
          </TouchableOpacity>
        ))}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
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
});
