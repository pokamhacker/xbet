import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';

export default function PopularScreen({ navigation }: any) {
  const { balance } = useBetStore();

  const studios = [
    {
      id: 'studio-custom',
      title: 'Accéder au studio',
      subtitle: 'Crée tes propres coupons de paris sportifs personnalisés.',
      badge: 'POPULAIRE',
      badgeColor: Colors.primaryAccent,
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
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerLabel}>1xBet / Melbet Studio</Text>
          <Text style={styles.headerBalance}>{balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣</Text>
        </View>
        <TouchableOpacity
          style={styles.depositSmallBtn}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="wallet-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.depositSmallBtnText}>Gérer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Welcome */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIconCircle}>
            <MaterialCommunityIcons name="lightning-bolt" size={26} color={Colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeTitle}>Générateur iGaming Pro</Text>
            <Text style={styles.welcomeSub}>
              Simule des tickets de paris authentiques avec tirages aléatoires et grand livre synchronisé.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>STUDIOS & MINI-JEUX DISPONIBLES</Text>

        {studios.map((st) => (
          <TouchableOpacity
            key={st.id}
            style={styles.studioCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(st.route)}
          >
            <View style={styles.cardLeftIcon}>
              <MaterialCommunityIcons name={st.iconName as any} size={24} color={Colors.primaryAccent} />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{st.title}</Text>
                <View style={[styles.badgeTag, { backgroundColor: `${st.badgeColor}18` }]}>
                  <Text style={[styles.badgeTagText, { color: st.badgeColor }]}>{st.badge}</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>{st.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSubtle} />
          </TouchableOpacity>
        ))}

        {/* Quick Admin Footer Card */}
        <TouchableOpacity
          style={styles.adminQuickCard}
          onPress={() => navigation.navigate('Menu')}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
          <Text style={styles.adminQuickText}>Accéder à la console d'administration & gestion du solde</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerBalance: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  depositSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  depositSmallBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 88,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  welcomeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  welcomeSub: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 4,
  },
  studioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardLeftIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badgeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  adminQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  adminQuickText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
});
