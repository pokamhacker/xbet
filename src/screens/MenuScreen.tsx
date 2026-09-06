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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';
import { useBetStore } from '../store/useBetStore';
import { StatusBadge } from '../components/StatusBadge';
import { useThemeStore } from '../store/themeStore';

export default function MenuScreen({ navigation }: any) {
  const { theme, setThemeModalVisible } = useThemeStore();
  const {
    balance,
    setBalance,
    deposit,
    coupons,
    validateCouponWithResult,
    customLeagues,
    addCustomLeague,
    customTeams,
    addCustomTeam,
  } = useBetStore();

  // Balance Form
  const [balanceInput, setBalanceInput] = useState(String(Math.round(balance)));

  // League & Team creation
  const [newLeagueName, setNewLeagueName] = useState('');
  const [newLeagueCountry, setNewLeagueCountry] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedLeagueForTeam, setSelectedLeagueForTeam] = useState(customLeagues[0]?.id || '1');

  const handleUpdateBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val >= 0) {
      setBalance(val);
      Alert.alert('Solde mis à jour', `Le solde du compte principal est maintenant de ${val.toLocaleString('fr-FR')} ₣.`);
    }
  };

  const handleQuickAdd = (amount: number) => {
    deposit(amount);
    setBalanceInput(String(Math.round(balance + amount)));
  };

  const handleCreateLeague = () => {
    if (!newLeagueName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom de championnat.');
      return;
    }
    const newLeague = {
      id: String(Date.now()),
      name: newLeagueName.trim(),
      sport: 'Football',
      country: newLeagueCountry.trim() || 'Global',
    };
    addCustomLeague(newLeague);
    setNewLeagueName('');
    setNewLeagueCountry('');
    Alert.alert('Championnat créé', `Le championnat "${newLeague.name}" est disponible dans le studio.`);
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom d’équipe.');
      return;
    }
    const newTeam = {
      id: String(Date.now()),
      leagueId: selectedLeagueForTeam,
      name: newTeamName.trim(),
    };
    addCustomTeam(newTeam);
    setNewTeamName('');
    Alert.alert('Équipe créée', `L’équipe "${newTeam.name}" a été ajoutée au championnat.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Menu & Administration</Text>
        <Ionicons name="shield-checkmark" size={22} color={Colors.primaryAccent} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 0 : White-Label Theme Switcher */}
        <TouchableOpacity
          style={styles.themeSelectorCard}
          activeOpacity={0.85}
          onPress={() => setThemeModalVisible(true)}
        >
          <View style={styles.themeSelectorLeft}>
            <View style={[styles.themeBadgeCircle, { backgroundColor: theme.primary }]}>
              <Ionicons name="color-palette" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.themeCardHeaderRow}>
                <Text style={styles.themeCardTitle}>Marque : {theme.name}</Text>
                <View style={[styles.themePill, { backgroundColor: theme.badgeBg }]}>
                  <Text style={[styles.themePillText, { color: theme.primary }]}>White-Label</Text>
                </View>
              </View>
              <Text style={styles.themeCardSub}>{theme.tagline}</Text>
            </View>
          </View>
          <View style={[styles.themeSwitchBtn, { backgroundColor: theme.isDark ? '#2A2E39' : '#EFF6FF' }]}>
            <Text style={[styles.themeSwitchBtnText, { color: theme.primary }]}>Changer</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
          </View>
        </TouchableOpacity>

        {/* Section 1 : Gestion du Solde */}
        <View style={styles.adminCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="wallet-outline" size={20} color={Colors.primaryAccent} />
            <Text style={styles.cardHeaderTitle}>GESTION DU SOLDE PRINCIPAL</Text>
          </View>

          <Text style={styles.fieldLabel}>Solde actuel :</Text>
          <Text style={styles.balanceDisplay}>
            {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ₣
          </Text>

          <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Modifier directement le montant :</Text>
          <View style={styles.balanceEditRow}>
            <TextInput
              style={styles.balanceInput}
              value={balanceInput}
              onChangeText={setBalanceInput}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.balanceSaveBtn} onPress={handleUpdateBalance}>
              <Text style={styles.balanceSaveText}>Valider</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Credit Buttons */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Recharges rapides :</Text>
          <View style={styles.quickRechargeGrid}>
            {[100000, 500000, 1000000, 10000000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.quickRechargeBtn}
                onPress={() => handleQuickAdd(amt)}
              >
                <Text style={styles.quickRechargeText}>
                  +{(amt / 1000).toLocaleString('fr-FR')} k ₣
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 2 : Saisie des Résultats & Validation des Coupons */}
        <View style={styles.adminCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color={Colors.success} />
            <Text style={styles.cardHeaderTitle}>SAISIE DES RÉSULTATS (COUPONS)</Text>
          </View>
          <Text style={styles.cardHint}>
            Passe instantanément n'importe quel coupon de ton historique à Gain/Payé ou Perdu en 1 clic.
          </Text>

          {coupons.map((c) => {
            const isWon = c.status === 'Payé' || c.status === 'Gagné' || c.status === 'Gain';
            return (
              <View key={c.id} style={styles.couponResolverRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.couponResolverId}>
                    {c.type} № {c.id}
                  </Text>
                  <Text style={styles.couponResolverSub}>
                    Mise : {c.stake} ₣ · Payout : {c.potentialPayout.toLocaleString('fr-FR')} ₣
                  </Text>
                  <StatusBadge status={c.status} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                </View>

                <View style={styles.resolverButtons}>
                  <TouchableOpacity
                    style={[styles.resolveBtn, styles.winBtn, isWon && styles.btnDisabled]}
                    onPress={() => validateCouponWithResult(c.id, true)}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.btnText}>Gain</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resolveBtn, styles.lossBtn, c.status === 'Perdu' && styles.btnDisabled]}
                    onPress={() => validateCouponWithResult(c.id, false)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.btnText}>Perdu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Section 3 : Championnats & Équipes */}
        <View style={styles.adminCard}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="trophy-outline" size={20} color={Colors.gold} />
            <Text style={styles.cardHeaderTitle}>CHAMPIONNATS & ÉQUIPES</Text>
          </View>

          <Text style={styles.fieldLabel}>Ajouter un championnat :</Text>
          <TextInput
            style={styles.adminInput}
            value={newLeagueName}
            onChangeText={setNewLeagueName}
            placeholder="Nom (ex: Ligue 1, Coupe d'Afrique)"
          />
          <TextInput
            style={[styles.adminInput, { marginTop: 6 }]}
            value={newLeagueCountry}
            onChangeText={setNewLeagueCountry}
            placeholder="Pays / Région (ex: France, Afrique)"
          />
          <TouchableOpacity style={styles.createEntityBtn} onPress={handleCreateLeague}>
            <Text style={styles.createEntityBtnText}>+ Ajouter le championnat</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>Ajouter une équipe personnalisée :</Text>
          <TextInput
            style={styles.adminInput}
            value={newTeamName}
            onChangeText={setNewTeamName}
            placeholder="Nom du club (ex: Paris SG, Real Madrid)"
          />
          <TouchableOpacity style={styles.createEntityBtn} onPress={handleCreateTeam}>
            <Text style={styles.createEntityBtnText}>+ Ajouter l'équipe</Text>
          </TouchableOpacity>

          {/* Existing leagues count */}
          <View style={styles.entityStats}>
            <Text style={styles.entityStatsText}>
              Championnats enregistrés : <Text style={{ fontWeight: '800' }}>{customLeagues.length}</Text> · Équipes :{' '}
              <Text style={{ fontWeight: '800' }}>{customTeams.length}</Text>
            </Text>
          </View>
        </View>

        {/* Section 4 : Paramètres & Raccourcis */}
        <View style={styles.adminCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="options-outline" size={20} color={Colors.textMuted} />
            <Text style={styles.cardHeaderTitle}>OPTIONS DE L'APPLICATION</Text>
          </View>

          {[
            { title: 'Revoir le tutoriel / Onboarding', icon: 'book-outline' },
            { title: 'Thème et apparence (Mode dense 1xBet)', icon: 'color-palette-outline' },
            { title: 'Assistant de création automatique', icon: 'sparkles-outline' },
            { title: 'Exporter la base de données locale', icon: 'cloud-download-outline' },
          ].map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionRow}
              onPress={() => Alert.alert(opt.title, 'Fonctionnalité prête et active.')}
            >
              <Ionicons name={opt.icon as any} size={18} color={Colors.primaryAccent} />
              <Text style={styles.optionTitle}>{opt.title}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSubtle} />
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
  scrollContent: {
    padding: 16,
    paddingBottom: 88,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  adminCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
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
  cardHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 12,
    lineHeight: 15,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  balanceDisplay: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  balanceEditRow: {
    flexDirection: 'row',
    gap: 8,
  },
  balanceInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  balanceSaveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  balanceSaveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  quickRechargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickRechargeBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickRechargeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  couponResolverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  couponResolverId: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  couponResolverSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  resolverButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  winBtn: {
    backgroundColor: Colors.success,
  },
  lossBtn: {
    backgroundColor: Colors.danger,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  adminInput: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  createEntityBtn: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  createEntityBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  entityStats: {
    marginTop: 10,
  },
  entityStatsText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  optionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
