import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, UserAccount } from '../store/authStore';
import { Colors } from '../theme/theme';
import { useThemeStore } from '../stores/themeStore';
import { BrandLogo } from '../components/common/BrandLogo';
import { RefreshArrowBadge } from '../components/common/AppRefreshControl';
import {
  ALL_FEATURES,
  FeatureKey,
  DEFAULT_ALLOWED_FEATURES,
} from '../types/permissions';

type FilterTab = 'all' | 'online' | 'blocked' | 'high_balance';
type SortOption = 'recent' | 'balance_desc' | 'name_asc';

export default function AdminDashboardScreen() {
  const { currentTheme } = useThemeStore();
  const {
    accounts,
    currentUser,
    logout,
    fetchRemoteUsers,
    createUser,
    updateUserBalance,
    toggleUserActive,
    resetUserDevice,
    revokeUserDevice,
    deleteUser,
    changePassword,
    updateUserPermissions,
    setUserPermissionsLocally,
    adminUpdateUserPassword,
    simulateUserSession,
  } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // In-app Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    setToastType(type);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    fetchRemoteUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRemoteUsers();
    setRefreshing(false);
    showToast('Données synchronisées avec succès', 'info');
  };

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('recent');

  // Create User Modal State
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('50000');
  const [grantAllFeaturesOnCreate, setGrantAllFeaturesOnCreate] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);

  // Change Admin Password Modal State
  const [isChangePassModalVisible, setChangePassModalVisible] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassSuccess, setChangePassSuccess] = useState<string | null>(null);

  // Edit Balance Modal State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [balanceInput, setBalanceInput] = useState('');

  // Block User Modal State
  const [isBlockModalVisible, setBlockModalVisible] = useState(false);
  const [blockingUser, setBlockingUser] = useState<UserAccount | null>(null);
  const [selectedBlockReason, setSelectedBlockReason] = useState<string>(
    "Utilisateur situé en Côte d'Ivoire (Zone interdite)"
  );
  const [customBlockReason, setCustomBlockReason] = useState<string>('');

  // Password Visibility State & Global Reveal Toggle
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);

  const toggleAllPasswords = () => {
    setShowAllPasswords((prev) => {
      const next = !prev;
      setVisiblePasswords({});
      showToast(
        next
          ? 'Tous les mots de passe sont maintenant visibles en clair'
          : 'Mots de passe masqués',
        'info'
      );
      return next;
    });
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => {
      const current = showAllPasswords ? (prev[userId] ?? true) : (prev[userId] ?? false);
      return {
        ...prev,
        [userId]: !current,
      };
    });
  };

  const isUserPassVisible = (userId: string) => {
    if (userId in visiblePasswords) {
      return visiblePasswords[userId];
    }
    return showAllPasswords;
  };

  // Manage Permissions Modal State
  const [permModalUser, setPermModalUser] = useState<UserAccount | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([]);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  // Quick Edit User Password Modal State
  const [editPassUser, setEditPassUser] = useState<UserAccount | null>(null);
  const [userNewPassInput, setUserNewPassInput] = useState('');
  const [newUserPassVisible, setNewUserPassVisible] = useState(true);
  const [isSavingUserPass, setIsSavingUserPass] = useState(false);
  const [editPassError, setEditPassError] = useState<string | null>(null);

  // Copy helper with non-blocking modern toast
  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showToast(`${label} copié !`);
    } catch {
      showToast(`${label} : ${text}`, 'info');
    }
  };

  // Permissions Handlers
  const handleOpenPermissionsModal = (user: UserAccount) => {
    setPermModalUser(user);
    const userPerms =
      user.allowedFeatures && Array.isArray(user.allowedFeatures)
        ? (user.allowedFeatures as FeatureKey[])
        : DEFAULT_ALLOWED_FEATURES;
    setSelectedFeatures(userPerms);
  };

  const handleToggleFeature = (key: FeatureKey) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllFeatures = () => {
    setSelectedFeatures(DEFAULT_ALLOWED_FEATURES);
  };

  const handleDeselectAllFeatures = () => {
    setSelectedFeatures([]);
  };

  const handleSavePermissions = async () => {
    if (!permModalUser) return;
    setIsSavingPerms(true);
    try {
      // 1. Mise à jour immédiate locale
      setUserPermissionsLocally(permModalUser.id, selectedFeatures);

      // 2. Synchronisation backend / WebSockets
      const res = await updateUserPermissions(permModalUser.id, selectedFeatures);
      if (!res.success) {
        showToast(res.error || 'Erreur lors de la mise à jour des accès', 'error');
        return;
      }
      showToast(`Accès enregistrés pour ${permModalUser.username} (${selectedFeatures.length}/7)`);
      setPermModalUser(null);
    } catch {
      showToast('Accès locaux appliqués avec succès', 'info');
      setPermModalUser(null);
    } finally {
      setIsSavingPerms(false);
    }
  };

  // Tester les accès utilisateur (Simulation)
  const handleTestUserSession = (user: UserAccount) => {
    Alert.alert(
      'Tester les accès utilisateur',
      `Voulez-vous simuler l'application avec le compte de "${user.username}" ?\n\nVous pourrez vérifier en direct quels jeux ou studios sont débloqués ou protégés par cadenas.\n\nUn bandeau supérieur vous permettra de revenir à votre interface Admin en 1 clic.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '⚡ Lancer le test',
          style: 'default',
          onPress: () => {
            const res = simulateUserSession(user.id);
            if (!res.success) {
              Alert.alert('Erreur', res.error || 'Impossible de démarrer le test.');
            }
          },
        },
      ]
    );
  };

  // Edit User Password Handlers
  const handleOpenEditUserPassword = (user: UserAccount) => {
    setEditPassUser(user);
    const p = user.rawPassword || user.passwordHash;
    const isBcrypt = p && (p.startsWith('$2a$') || p.startsWith('$2b$') || p.startsWith('$2y$'));
    setUserNewPassInput(!isBcrypt ? p || '' : '');
    setNewUserPassVisible(true);
    setEditPassError(null);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 7; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setUserNewPassInput(res);
  };

  const handleSaveUserPassword = async () => {
    if (!editPassUser) return;
    const trimmed = userNewPassInput.trim();
    if (!trimmed || trimmed.length < 3) {
      setEditPassError('Le mot de passe doit comporter au moins 3 caractères.');
      return;
    }
    setIsSavingUserPass(true);
    setEditPassError(null);
    try {
      const res = await adminUpdateUserPassword(editPassUser.id, trimmed);
      if (!res.success) {
        setEditPassError(res.error || 'Erreur lors de la modification.');
        return;
      }

      // Révéler automatiquement le mot de passe sur la carte de cet utilisateur
      setVisiblePasswords((prev) => ({
        ...prev,
        [editPassUser.id]: true,
      }));

      // Copier automatiquement dans le presse-papier pour le confort de l'administrateur
      try {
        await Clipboard.setStringAsync(trimmed);
      } catch {}

      showToast(`Mot de passe de ${editPassUser.username} mis à jour : "${trimmed}" (copié !)`);
      setEditPassUser(null);
    } catch (err: any) {
      setEditPassError(err.message || 'Erreur lors de la modification.');
    } finally {
      setIsSavingUserPass(false);
    }
  };

  // Filter accounts: show only USER roles in the list
  const userAccounts = accounts.filter((a) => a.role === 'USER');

  // Stats
  const totalUsers = userAccounts.length;
  const activeSessionsCount = userAccounts.filter((a) => a.currentDeviceId !== null).length;
  const blockedUsersCount = userAccounts.filter((a) => !a.isActive).length;
  const highBalanceCount = userAccounts.filter((a) => (a.balance || 0) >= 50000).length;
  const totalCirculationBalance = userAccounts.reduce((acc, u) => acc + (u.balance || 0), 0);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = userAccounts.filter((a) => {
      const matchesSearch =
        a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilterTab === 'online') return a.currentDeviceId !== null;
      if (activeFilterTab === 'blocked') return !a.isActive;
      if (activeFilterTab === 'high_balance') return (a.balance || 0) >= 50000;
      return true;
    });

    if (activeSort === 'balance_desc') {
      result.sort((x, y) => (y.balance || 0) - (x.balance || 0));
    } else if (activeSort === 'name_asc') {
      result.sort((x, y) => x.username.localeCompare(y.username));
    } else {
      // 'recent'
      result.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    }

    return result;
  }, [userAccounts, searchQuery, activeFilterTab, activeSort]);

  // Admin Change Password Handlers
  const handleOpenChangePassModal = () => {
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
    setChangePassError(null);
    setChangePassSuccess(null);
    setChangePassModalVisible(true);
  };

  const handleChangePassSubmit = () => {
    setChangePassError(null);
    setChangePassSuccess(null);

    if (!currentUser) return;

    if (currentUser.passwordHash !== currentPassInput.trim()) {
      setChangePassError('Le mot de passe actuel est incorrect.');
      return;
    }

    if (!newPassInput.trim()) {
      setChangePassError('Veuillez saisir un nouveau mot de passe.');
      return;
    }

    if (newPassInput.trim().length < 4) {
      setChangePassError('Le nouveau mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    if (newPassInput.trim() !== confirmPassInput.trim()) {
      setChangePassError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const res = changePassword(currentUser.id, newPassInput.trim());
    if (!res.success) {
      setChangePassError(res.error || 'Erreur lors de la modification.');
      return;
    }

    setChangePassSuccess('Mot de passe mis à jour avec succès !');
    showToast('Mot de passe administrateur modifié');
    setTimeout(() => {
      setChangePassModalVisible(false);
    }, 600);
  };

  // Create User Handlers
  const handleOpenCreateModal = () => {
    setNewUsername('');
    setNewPassword('');
    setNewInitialBalance('50000');
    setGrantAllFeaturesOnCreate(true);
    setCreateError(null);
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async () => {
    setCreateError(null);
    const trimmedUser = newUsername.trim().toLowerCase();
    const trimmedPass = newPassword.trim();

    if (!trimmedUser || trimmedUser.length < 3) {
      setCreateError("Le nom d'utilisateur doit comporter au moins 3 caractères.");
      return;
    }
    if (!trimmedPass || trimmedPass.length < 3) {
      setCreateError('Le mot de passe doit comporter au moins 3 caractères.');
      return;
    }

    const parsedBalance = parseFloat(newInitialBalance) || 0;
    setIsCreating(true);
    try {
      const assignedPerms = grantAllFeaturesOnCreate ? DEFAULT_ALLOWED_FEATURES : [];
      const res = await createUser(trimmedUser, trimmedPass, parsedBalance, assignedPerms);
      if (!res.success) {
        setCreateError(res.error || 'Erreur lors de la création.');
        return;
      }
      setCreateModalVisible(false);
      showToast(`Compte "${trimmedUser}" créé avec succès !`);
      fetchRemoteUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de la création.');
    } finally {
      setIsCreating(false);
    }
  };

  // Edit Balance Handlers
  const handleOpenEditBalance = (user: UserAccount) => {
    setEditingUser(user);
    setBalanceInput(String(Math.round(user.balance)));
  };

  const handleSaveBalance = async () => {
    if (!editingUser) return;
    const num = parseFloat(balanceInput);
    if (isNaN(num) || num < 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant de solde valide.');
      return;
    }
    await updateUserBalance(editingUser.id, num);
    showToast(`Solde de ${editingUser.username} mis à jour : ${num.toLocaleString('fr-FR')} ₣`);
    setEditingUser(null);
  };

  const handleQuickAddBalance = (delta: number) => {
    const current = parseFloat(balanceInput) || 0;
    setBalanceInput(String(Math.max(0, current + delta)));
  };

  // 1-Click Direct Recharge on Card
  const handleQuickRecharge = async (user: UserAccount, amount: number) => {
    const current = user.balance || 0;
    const nextVal = current + amount;
    await updateUserBalance(user.id, nextVal);
    showToast(`+${amount.toLocaleString('fr-FR')} ₣ crédités à ${user.username}`);
  };

  // Block / Unblock Handlers
  const handleToggleActive = (user: UserAccount) => {
    if (user.isActive) {
      setBlockingUser(user);
      setSelectedBlockReason("Utilisateur situé en Côte d'Ivoire (Zone interdite)");
      setCustomBlockReason('');
      setBlockModalVisible(true);
    } else {
      toggleUserActive(user.id);
      showToast(`Accès débloqué pour "${user.username}"`);
    }
  };

  const handleConfirmBlock = async () => {
    if (!blockingUser) return;
    const finalReason =
      selectedBlockReason === 'Autre motif personnalisé'
        ? customBlockReason.trim() || "Compte suspendu par l'administrateur"
        : selectedBlockReason;

    await toggleUserActive(blockingUser.id, finalReason);
    setBlockModalVisible(false);
    showToast(`Compte "${blockingUser.username}" bloqué`, 'error');
    setBlockingUser(null);
  };

  // Device Controls
  const handleRevokeDevice = async (user: UserAccount) => {
    await revokeUserDevice(user.id);
    showToast(`Session déconnectée pour "${user.username}"`);
  };

  const handleResetDevice = (user: UserAccount) => {
    Alert.alert(
      "Changer d'appareil / Dissocier",
      `Dissocier l'appareil lié au compte "${user.username}" ?\n\nCela réactivera le compte et permettra à l'utilisateur de se connecter immédiatement avec son nouvel appareil.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Dissocier & Débloquer',
          onPress: async () => {
            await resetUserDevice(user.id);
            showToast(`Appareil dissocié pour "${user.username}"`);
          },
        },
      ]
    );
  };

  // Delete User Handler
  const handleDeleteUser = (user: UserAccount) => {
    Alert.alert(
      'Supprimer le compte',
      `Voulez-vous vraiment supprimer définitivement le compte de "${user.username}" ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            await deleteUser(user.id);
            showToast(`Compte "${user.username}" supprimé`, 'info');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Floating In-App Toast */}
      {toastMessage && (
        <View
          style={[
            styles.toastContainer,
            toastType === 'error' && styles.toastError,
            toastType === 'info' && styles.toastInfo,
          ]}
        >
          <Ionicons
            name={
              toastType === 'error'
                ? 'alert-circle'
                : toastType === 'info'
                ? 'information-circle'
                : 'checkmark-circle'
            }
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.toastText} numberOfLines={2}>
            {toastMessage}
          </Text>
        </View>
      )}

      {/* Top Admin Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.adminBadgeRow}>
            <View style={styles.pulseLiveDot} />
            <Text style={styles.adminBadgeText}>PANNEAU ADMINISTRATEUR</Text>
            <View style={styles.systemStatusPill}>
              <Text style={styles.systemStatusText}>EN DIRECT</Text>
            </View>
          </View>
          <View style={styles.headerBrandRow}>
            <BrandLogo size={20} variant="header" isDark />
            <Text style={styles.headerTitle}>Studio Bookmaker Pro</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={onRefresh}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh" size={17} color="#38BDF8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changePassBtn}
            onPress={handleOpenChangePassModal}
            activeOpacity={0.8}
          >
            <Ionicons name="key-outline" size={15} color="#38BDF8" />
            <Text style={styles.changePassText}>Mot de passe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={16} color="#EF4444" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flèche d'actualisation animée universelle */}
      <RefreshArrowBadge refreshing={refreshing} theme={currentTheme} topOffset={65} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#38BDF8"
            colors={['#38BDF8']}
          />
        }
      >
        {/* Modern KPI Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Ionicons name="people" size={20} color="#38BDF8" />
            </View>
            <Text style={styles.statValue}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Ionicons name="radio" size={20} color="#22C55E" />
            </View>
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{activeSessionsCount}</Text>
            <Text style={styles.statLabel}>En Ligne</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="lock-closed" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{blockedUsersCount}</Text>
            <Text style={styles.statLabel}>Bloqués</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={22} color="#EAB308" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statValue, { color: '#FCD34D' }]}>
                {totalCirculationBalance.toLocaleString('fr-FR')} ₣
              </Text>
              <Text style={styles.statLabel}>Total des soldes en circulation</Text>
            </View>
          </View>
        </View>

        {/* Search Bar & Create Button */}
        <View style={styles.actionsBar}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={17} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom ou identifiant ID..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.createUserBtn}
            onPress={handleOpenCreateModal}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add" size={16} color="#FFFFFF" />
            <Text style={styles.createUserBtnText}>Nouveau compte</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs & Sort Controls */}
        <View style={styles.filterBarContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
            <TouchableOpacity
              style={[styles.filterTabPill, activeFilterTab === 'all' && styles.filterTabPillActive]}
              onPress={() => setActiveFilterTab('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, activeFilterTab === 'all' && styles.filterTabTextActive]}>
                Tous ({totalUsers})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTabPill, activeFilterTab === 'online' && styles.filterTabPillActive]}
              onPress={() => setActiveFilterTab('online')}
              activeOpacity={0.8}
            >
              <View style={[styles.filterDot, { backgroundColor: '#22C55E' }]} />
              <Text style={[styles.filterTabText, activeFilterTab === 'online' && styles.filterTabTextActive]}>
                En ligne ({activeSessionsCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTabPill, activeFilterTab === 'blocked' && styles.filterTabPillActive]}
              onPress={() => setActiveFilterTab('blocked')}
              activeOpacity={0.8}
            >
              <View style={[styles.filterDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.filterTabText, activeFilterTab === 'blocked' && styles.filterTabTextActive]}>
                Bloqués ({blockedUsersCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTabPill, activeFilterTab === 'high_balance' && styles.filterTabPillActive]}
              onPress={() => setActiveFilterTab('high_balance')}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, activeFilterTab === 'high_balance' && styles.filterTabTextActive]}>
                💰 Solde ≥ 50k ({highBalanceCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Sort Selector Toggle */}
          <View style={styles.sortToggleRow}>
            <Text style={styles.sortLabel}>Trier :</Text>
            {(
              [
                { key: 'recent', label: 'Récents' },
                { key: 'balance_desc', label: 'Solde max' },
                { key: 'name_asc', label: 'A-Z' },
              ] as const
            ).map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortChip, activeSort === opt.key && styles.sortChipActive]}
                onPress={() => setActiveSort(opt.key)}
              >
                <Text style={[styles.sortChipText, activeSort === opt.key && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section Title & Global Password Toggle */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.sectionTitle}>
              COMPTES UTILISATEURS ({filteredUsers.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              Contrôle mono-appareil en temps réel, soldes et identifiants
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.globalPassToggleBtn,
              showAllPasswords && styles.globalPassToggleBtnActive,
            ]}
            onPress={toggleAllPasswords}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showAllPasswords ? 'eye-off' : 'eye'}
              size={15}
              color={showAllPasswords ? '#F59E0B' : '#38BDF8'}
            />
            <Text
              style={[
                styles.globalPassToggleText,
                showAllPasswords && styles.globalPassToggleTextActive,
              ]}
            >
              {showAllPasswords ? 'Masquer tous les MDP' : 'Voir tous les MDP'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#475569" />
            <Text style={styles.emptyTitle}>Aucun compte trouvé</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? 'Aucun utilisateur ne correspond à votre recherche.'
                : activeFilterTab !== 'all'
                ? 'Aucun compte dans cette catégorie.'
                : 'Créez votre premier utilisateur à l’aide du bouton ci-dessus.'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = user.currentDeviceId !== null;
            const isPassVisible = isUserPassVisible(user.id);
            const rawPass = user.rawPassword || user.passwordHash;
            const isBcrypt =
              rawPass &&
              (rawPass.startsWith('$2a$') ||
                rawPass.startsWith('$2b$') ||
                rawPass.startsWith('$2y$'));
            const displayPassword = isPassVisible
              ? isBcrypt
                ? '🔒 Mot de passe chiffré'
                : rawPass || 'Non défini'
              : '••••••••••••';
            const userPerms =
              user.allowedFeatures && Array.isArray(user.allowedFeatures)
                ? (user.allowedFeatures as FeatureKey[])
                : DEFAULT_ALLOWED_FEATURES;
            const userAllowedCount = userPerms.length;
            const totalFeaturesCount = ALL_FEATURES.length;

            return (
              <View key={user.id} style={styles.userCard}>
                {/* 1. Header Row: Avatar, Username, Status and Session Badges */}
                <View style={styles.userCardHeader}>
                  <View style={styles.userAvatarCircle}>
                    <Text style={styles.userAvatarLetter}>
                      {user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.userTitleRow}>
                      <Text style={styles.userNameText}>{user.username}</Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {/* Online Pulse Dot */}
                        <View style={[styles.sessionBadge, isOnline ? styles.sessionOnline : styles.sessionOffline]}>
                          <View style={[styles.sessionDot, { backgroundColor: isOnline ? '#22C55E' : '#94A3B8' }]} />
                          <Text style={[styles.sessionText, { color: isOnline ? '#22C55E' : '#94A3B8' }]}>
                            {isOnline ? 'En ligne' : 'Hors ligne'}
                          </Text>
                        </View>

                        {/* Active / Blocked Badge */}
                        <View style={[styles.badgePill, user.isActive ? styles.badgeActive : styles.badgeBlocked]}>
                          <Text style={[styles.badgePillText, { color: user.isActive ? '#22C55E' : '#EF4444' }]}>
                            {user.isActive ? 'Actif' : 'Bloqué'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.userMetaText}>
                      ID : #{user.id.slice(-6)} • Inscrit le {user.createdAt?.slice(0, 10) || '01.01.2026'}
                    </Text>
                  </View>
                </View>

                {/* 2. Bloc Identifiants & Mot de passe */}
                <View style={styles.credentialsContainer}>
                  {/* Ligne ID Utilisateur */}
                  <View style={styles.credentialRow}>
                    <View style={styles.credentialLabelCol}>
                      <Ionicons name="finger-print-outline" size={13} color="#38BDF8" />
                      <Text style={styles.credentialLabel}>IDENTIFIANT ID</Text>
                    </View>
                    <View style={styles.credentialValueBox}>
                      <Text style={styles.credentialValueMono} numberOfLines={1} ellipsizeMode="middle">
                        {user.id}
                      </Text>
                      <TouchableOpacity
                        style={styles.copySmallBtn}
                        onPress={() => handleCopy(user.id, `ID de ${user.username}`)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="copy-outline" size={12} color="#38BDF8" />
                        <Text style={styles.copySmallBtnText}>Copier</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Ligne Mot de Passe */}
                  <View style={[styles.credentialRow, { marginTop: 8 }]}>
                    <View style={styles.credentialLabelCol}>
                      <Ionicons name="key" size={13} color="#F59E0B" />
                      <Text style={[styles.credentialLabel, { color: '#F59E0B' }]}>MOT DE PASSE</Text>
                    </View>
                    <View style={styles.credentialValueBox}>
                      <TouchableOpacity
                        style={{ flex: 1, marginRight: 6 }}
                        onPress={() =>
                          isPassVisible && !isBcrypt
                            ? handleCopy(rawPass, `Mot de passe de ${user.username}`)
                            : handleOpenEditUserPassword(user)
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.credentialPasswordValue,
                            isPassVisible && styles.credentialPasswordVisible,
                            isBcrypt && isPassVisible && { color: '#F87171', fontSize: 11, letterSpacing: 0 },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {displayPassword}
                        </Text>
                      </TouchableOpacity>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <TouchableOpacity
                          style={[
                            styles.eyeBtn,
                            isPassVisible && { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: 5 },
                          ]}
                          onPress={() => togglePasswordVisibility(user.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={isPassVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={16}
                            color={isPassVisible ? '#38BDF8' : '#94A3B8'}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.copySmallBtn,
                            {
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              borderColor: 'rgba(245, 158, 11, 0.3)',
                            },
                          ]}
                          onPress={() =>
                            handleCopy(
                              !isBcrypt ? rawPass : 'Mot de passe sécurisé (chiffré)',
                              `Mot de passe de ${user.username}`
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <Ionicons name="copy-outline" size={12} color="#F59E0B" />
                          <Text style={[styles.copySmallBtnText, { color: '#F59E0B' }]}>Copier</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.editPassMiniBtn}
                          onPress={() => handleOpenEditUserPassword(user)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="pencil" size={12} color="#38BDF8" />
                          <Text style={styles.editPassMiniText}>Modifier</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 3. Bloc Accès aux Studios & Jeux */}
                <View style={styles.permissionsContainer}>
                  <View style={styles.permissionsHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <MaterialCommunityIcons name="shield-account-outline" size={16} color="#A855F7" />
                      <Text style={styles.permissionsTitle}>ACCÈS STUDIOS & JEUX</Text>
                      <View
                        style={[
                          styles.permCountBadge,
                          {
                            backgroundColor:
                              userAllowedCount === totalFeaturesCount
                                ? 'rgba(34, 197, 94, 0.15)'
                                : userAllowedCount === 0
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(234, 179, 8, 0.15)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.permCountText,
                            {
                              color:
                                userAllowedCount === totalFeaturesCount
                                  ? '#22C55E'
                                  : userAllowedCount === 0
                                  ? '#EF4444'
                                  : '#EAB308',
                            },
                          ]}
                        >
                          {userAllowedCount}/{totalFeaturesCount}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.managePermsBtn}
                      onPress={() => handleOpenPermissionsModal(user)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="options-outline" size={13} color="#A855F7" />
                      <Text style={styles.managePermsBtnText}>Gérer les accès</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Chips des studios & mini-jeux autorisés */}
                  <View style={styles.permChipsGrid}>
                    {ALL_FEATURES.map((feature) => {
                      const isAllowed = userPerms.includes(feature.key);
                      return (
                        <View
                          key={feature.key}
                          style={[
                            styles.permChip,
                            isAllowed
                              ? { backgroundColor: `${feature.color}18`, borderColor: `${feature.color}45` }
                              : styles.permChipDisabled,
                          ]}
                        >
                          <Ionicons
                            name={isAllowed ? 'checkmark-circle' : 'lock-closed'}
                            size={11}
                            color={isAllowed ? feature.color : '#64748B'}
                          />
                          <Text
                            style={[styles.permChipText, { color: isAllowed ? '#E2E8F0' : '#64748B' }]}
                            numberOfLines={1}
                          >
                            {feature.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* 4. Motif de blocage si présent */}
                {user.blockedReason && (
                  <View style={styles.blockedReasonBox}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.blockedReasonText}>{user.blockedReason}</Text>
                  </View>
                )}

                {/* 5. Solde & Recharges Rapides */}
                <View style={styles.balanceContainer}>
                  <View>
                    <Text style={styles.balanceLabel}>SOLDE DISPONIBLE</Text>
                    <Text style={styles.balanceValue}>{user.balance.toLocaleString('fr-FR')} ₣</Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {/* Quick +10k recharge chip */}
                    <TouchableOpacity
                      style={styles.quickRechargeChip}
                      onPress={() => handleQuickRecharge(user, 10000)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="add" size={13} color="#22C55E" />
                      <Text style={styles.quickRechargeText}>+10k ₣</Text>
                    </TouchableOpacity>

                    {/* Quick +50k recharge chip */}
                    <TouchableOpacity
                      style={styles.quickRechargeChip}
                      onPress={() => handleQuickRecharge(user, 50000)}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="add" size={13} color="#22C55E" />
                      <Text style={styles.quickRechargeText}>+50k ₣</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editBalanceBtn}
                      onPress={() => handleOpenEditBalance(user)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="pencil" size={13} color="#38BDF8" />
                      <Text style={styles.editBalanceText}>Modifier</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 6. Device status row */}
                <View style={styles.deviceStatusRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                    <Ionicons name="phone-portrait-outline" size={13} color="#94A3B8" />
                    <Text style={styles.deviceIdPreview} numberOfLines={1}>
                      {user.boundDeviceId
                        ? `Lié à l'appareil : ${user.boundDeviceId.slice(0, 16)}...`
                        : 'Appareil libre (Aucune liaison forcée)'}
                    </Text>
                  </View>
                </View>

                {/* 7. Action Controls Toolbar */}
                <View style={styles.userActionsRow}>
                  {/* Block / Unblock Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      user.isActive ? styles.actionBtnBlock : styles.actionBtnUnblock,
                    ]}
                    onPress={() => handleToggleActive(user)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={user.isActive ? 'lock-closed-outline' : 'lock-open-outline'}
                      size={14}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnText}>
                      {user.isActive ? 'Bloquer' : 'Débloquer'}
                    </Text>
                  </TouchableOpacity>

                  {/* Tester les accès (Simuler cet utilisateur) */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnSimulate]}
                    onPress={() => handleTestUserSession(user)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={13} color="#F59E0B" />
                    <Text style={[styles.actionBtnText, { color: '#F59E0B' }]}>Tester accès</Text>
                  </TouchableOpacity>

                  {/* Dissocier l'appareil (Reset Device) */}
                  {(user.boundDeviceId || !user.isActive) && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnResetDevice]}
                      onPress={() => handleResetDevice(user)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="phone-portrait-outline" size={13} color="#38BDF8" />
                      <Text style={[styles.actionBtnText, { color: '#38BDF8' }]}>
                        Changer appareil
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Revoke Device Session (Déconnecter si en ligne) */}
                  {isOnline && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnRevoke]}
                      onPress={() => handleRevokeDevice(user)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="power" size={13} color="#E2E8F0" />
                      <Text style={styles.actionBtnText}>Déconnecter</Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDelete]}
                    onPress={() => handleDeleteUser(user)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={14} color="#F87171" />
                    <Text style={[styles.actionBtnText, { color: '#F87171' }]}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* =================================================================== */}
      {/* MODAL 1 : CRÉER UN COMPTE UTILISATEUR                               */}
      {/* =================================================================== */}
      <Modal visible={isCreateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="person-add" size={20} color="#38BDF8" />
                <Text style={styles.modalTitle}>Créer un compte utilisateur</Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {createError && (
              <View style={styles.modalErrorBanner}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.modalErrorText}>{createError}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: joueur77"
                placeholderTextColor="#64748B"
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: secret123"
                placeholderTextColor="#64748B"
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Solde initial (en ₣)</Text>
              <TextInput
                style={[styles.modalInput, { fontSize: 16, fontWeight: '800', color: '#38BDF8' }]}
                placeholder="Ex: 50000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={newInitialBalance}
                onChangeText={setNewInitialBalance}
              />
            </View>

            {/* Presets Solde */}
            <View style={styles.quickGrid}>
              {['0', '10000', '50000', '100000', '250000'].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.quickBtn, newInitialBalance === val && styles.quickBtnActive]}
                  onPress={() => setNewInitialBalance(val)}
                >
                  <Text style={[styles.quickBtnText, newInitialBalance === val && styles.quickBtnTextActive]}>
                    {val === '0' ? '0 ₣' : `${parseInt(val, 10) / 1000}k ₣`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Toggle Accorder tous les accès par défaut */}
            <View style={styles.createPermToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.createPermToggleTitle}>Accorder tous les studios & jeux</Text>
                <Text style={styles.createPermToggleSub}>
                  {grantAllFeaturesOnCreate
                    ? 'Tous les 7 studios et mini-jeux seront autorisés'
                    : 'Les accès seront restreints et devront être activés manuellement'}
                </Text>
              </View>
              <Switch
                value={grantAllFeaturesOnCreate}
                onValueChange={setGrantAllFeaturesOnCreate}
                trackColor={{ false: '#334155', true: '#22C55E' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCreateModalVisible(false)}
                disabled={isCreating}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, isCreating && { opacity: 0.7 }]}
                onPress={handleCreateSubmit}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Créer le compte</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 2 : MODIFIER LE SOLDE DU JOUEUR                               */}
      {/* =================================================================== */}
      <Modal visible={editingUser !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color="#38BDF8" />
                <Text style={styles.modalTitle}>Modifier le solde</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingUser(null)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.editingSubtitle}>
              Compte : <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{editingUser?.username}</Text>
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nouveau solde (en ₣)</Text>
              <TextInput
                style={[styles.modalInput, styles.balanceInputBold]}
                keyboardType="numeric"
                value={balanceInput}
                onChangeText={setBalanceInput}
              />
            </View>

            {/* Quick Adjust Buttons */}
            <Text style={styles.quickLabel}>Ajustements rapides :</Text>
            <View style={styles.quickGrid}>
              {[+5000, +10000, +25000, +50000, +100000, +500000, -10000, -50000].map((delta) => (
                <TouchableOpacity
                  key={delta}
                  style={styles.quickBtn}
                  onPress={() => handleQuickAddBalance(delta)}
                >
                  <Text style={[styles.quickBtnText, delta < 0 && { color: '#F87171' }]}>
                    {delta > 0 ? `+${delta / 1000}k ₣` : `${delta / 1000}k ₣`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickBtn, { borderColor: '#EF4444' }]}
                onPress={() => setBalanceInput('0')}
              >
                <Text style={[styles.quickBtnText, { color: '#EF4444' }]}>Mettre à 0 ₣</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditingUser(null)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSaveBalance}>
                <Text style={styles.modalConfirmText}>Enregistrer le solde</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 3 : MOT DE PASSE ADMINISTRATEUR                              */}
      {/* =================================================================== */}
      <Modal
        visible={isChangePassModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePassModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="key" size={20} color="#38BDF8" />
                <Text style={styles.modalTitle}>Modifier mot de passe Admin</Text>
              </View>
              <TouchableOpacity onPress={() => setChangePassModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {changePassError && (
              <View style={styles.modalErrorBanner}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.modalErrorText}>{changePassError}</Text>
              </View>
            )}

            {changePassSuccess && (
              <View style={[styles.modalErrorBanner, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={[styles.modalErrorText, { color: '#86EFAC' }]}>{changePassSuccess}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Mot de passe actuel</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Entrez le mot de passe actuel"
                placeholderTextColor="#64748B"
                value={currentPassInput}
                onChangeText={setCurrentPassInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Nouveau mot de passe (min 4 caractères)"
                placeholderTextColor="#64748B"
                value={newPassInput}
                onChangeText={setNewPassInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.modalInput}
                secureTextEntry
                placeholder="Confirmez le nouveau mot de passe"
                placeholderTextColor="#64748B"
                value={confirmPassInput}
                onChangeText={setConfirmPassInput}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setChangePassModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleChangePassSubmit}>
                <Text style={styles.modalConfirmText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 4 : BLOQUER UN COMPTE AVEC MOTIF                              */}
      {/* =================================================================== */}
      <Modal
        visible={isBlockModalVisible && blockingUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setBlockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: '#EF4444' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-outline" size={20} color="#EF4444" />
                <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Bloquer le compte</Text>
              </View>
              <TouchableOpacity onPress={() => setBlockModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.editingSubtitle}>
              Compte : <Text style={{ color: '#F87171', fontWeight: '800' }}>{blockingUser?.username}</Text>
            </Text>

            <Text style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>
              Sélectionnez ou saisissez le motif de blocage. L'utilisateur sera déconnecté immédiatement :
            </Text>

            {/* Quick Reason Options */}
            {[
              { label: "Utilisateur situé en Côte d'Ivoire (Zone interdite)" },
              { label: 'Suspension administrative temporaire' },
              { label: 'Activité suspecte / Non-respect des règles' },
              { label: 'Tentative de connexion sur un second appareil' },
              { label: 'Autre motif personnalisé' },
            ].map((option) => {
              const isSelected = selectedBlockReason === option.label;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.blockReasonOption, isSelected && styles.blockReasonOptionSelected]}
                  onPress={() => setSelectedBlockReason(option.label)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={17}
                    color={isSelected ? '#EF4444' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.blockReasonOptionText,
                      isSelected && { color: '#FFFFFF', fontWeight: '700' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom Reason Input */}
            {selectedBlockReason === 'Autre motif personnalisé' && (
              <View style={[styles.formGroup, { marginTop: 10 }]}>
                <Text style={styles.formLabel}>Précisez le motif :</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Hors zone autorisée"
                  placeholderTextColor="#64748B"
                  value={customBlockReason}
                  onChangeText={setCustomBlockReason}
                  autoFocus
                />
              </View>
            )}

            <View style={[styles.modalButtonsRow, { marginTop: 16 }]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBlockModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#EF4444' }]}
                onPress={handleConfirmBlock}
              >
                <Text style={styles.modalConfirmText}>Bloquer immédiatement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 5 : GÉRER LES ACCÈS STUDIOS & MINI-JEUX                      */}
      {/* =================================================================== */}
      <Modal
        visible={permModalUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPermModalUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.permModalCard]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <MaterialCommunityIcons name="shield-account" size={22} color="#A855F7" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Gérer les autorisations</Text>
                  <Text style={styles.permModalSub} numberOfLines={1}>
                    Utilisateur :{' '}
                    <Text style={{ color: '#C084FC', fontWeight: '800' }}>{permModalUser?.username}</Text>
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setPermModalUser(null)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Quick Actions (Tout autoriser / Tout révoquer) */}
            <View style={styles.permQuickActionsRow}>
              <TouchableOpacity
                style={[styles.permQuickBtn, styles.permQuickBtnAll]}
                onPress={handleSelectAllFeatures}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done-circle" size={15} color="#22C55E" />
                <Text style={[styles.permQuickBtnText, { color: '#22C55E' }]}>
                  Tout autoriser ({ALL_FEATURES.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.permQuickBtn, styles.permQuickBtnNone]}
                onPress={handleDeselectAllFeatures}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={15} color="#EF4444" />
                <Text style={[styles.permQuickBtnText, { color: '#EF4444' }]}>Tout révoquer (0)</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {/* SECTION 1: STUDIOS DE CRÉATION */}
              <Text style={styles.permSectionHeading}>📁 STUDIOS DE CRÉATION (3)</Text>
              {ALL_FEATURES.filter((f) => f.category === 'STUDIO').map((feature) => {
                const isSelected = selectedFeatures.includes(feature.key);
                return (
                  <View
                    key={feature.key}
                    style={[styles.permItemRow, isSelected && { borderColor: `${feature.color}60` }]}
                  >
                    <View style={[styles.permItemIconBox, { backgroundColor: `${feature.color}20` }]}>
                      {feature.iconFamily === 'Ionicons' ? (
                        <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                      ) : (
                        <MaterialCommunityIcons name={feature.icon as any} size={20} color={feature.color} />
                      )}
                    </View>

                    <View style={{ flex: 1, marginRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.permItemName}>{feature.name}</Text>
                        <Text style={[styles.permItemCatBadge, { color: feature.color }]}>
                          {feature.categoryLabel}
                        </Text>
                      </View>
                      <Text style={styles.permItemDesc}>{feature.description}</Text>
                    </View>

                    <Switch
                      value={isSelected}
                      onValueChange={() => handleToggleFeature(feature.key)}
                      trackColor={{ false: '#334155', true: '#22C55E' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}

              {/* SECTION 2: MINI-JEUX */}
              <Text style={[styles.permSectionHeading, { marginTop: 14 }]}>🎮 MINI-JEUX EN DIRECT (4)</Text>
              {ALL_FEATURES.filter((f) => f.category === 'GAME').map((feature) => {
                const isSelected = selectedFeatures.includes(feature.key);
                return (
                  <View
                    key={feature.key}
                    style={[styles.permItemRow, isSelected && { borderColor: `${feature.color}60` }]}
                  >
                    <View style={[styles.permItemIconBox, { backgroundColor: `${feature.color}20` }]}>
                      {feature.iconFamily === 'Ionicons' ? (
                        <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                      ) : (
                        <MaterialCommunityIcons name={feature.icon as any} size={20} color={feature.color} />
                      )}
                    </View>

                    <View style={{ flex: 1, marginRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.permItemName}>{feature.name}</Text>
                        <Text style={[styles.permItemCatBadge, { color: feature.color }]}>
                          {feature.categoryLabel}
                        </Text>
                      </View>
                      <Text style={styles.permItemDesc}>{feature.description}</Text>
                    </View>

                    <Switch
                      value={isSelected}
                      onValueChange={() => handleToggleFeature(feature.key)}
                      trackColor={{ false: '#334155', true: '#22C55E' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                );
              })}
            </ScrollView>

            <View style={[styles.modalButtonsRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPermModalUser(null)}
                disabled={isSavingPerms}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: '#A855F7' },
                  isSavingPerms && { opacity: 0.7 },
                ]}
                onPress={handleSavePermissions}
                disabled={isSavingPerms}
              >
                {isSavingPerms ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    Enregistrer ({selectedFeatures.length}/7)
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* MODAL 6 : MODIFIER LE MOT DE PASSE DU JOUEUR                        */}
      {/* =================================================================== */}
      <Modal
        visible={editPassUser !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditPassUser(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: '#F59E0B' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="key" size={20} color="#F59E0B" />
                <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
              </View>
              <TouchableOpacity onPress={() => setEditPassUser(null)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.editingSubtitle}>
              Compte : <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{editPassUser?.username}</Text>
              {editPassUser?.id ? `  (ID: #${editPassUser.id.slice(-6)})` : ''}
            </Text>

            {/* Mot de passe actuel en clair */}
            {editPassUser && (
              <View style={styles.currentPassCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Ionicons name="shield-checkmark-outline" size={13} color="#F59E0B" />
                    <Text style={styles.currentPassLabel}>MOT DE PASSE ACTUEL</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyCurrentPassBtn}
                    onPress={() =>
                      handleCopy(
                        editPassUser.rawPassword || editPassUser.passwordHash,
                        `Mot de passe actuel de ${editPassUser.username}`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons name="copy-outline" size={11} color="#F59E0B" />
                    <Text style={styles.copyCurrentPassText}>Copier</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.currentPassValue} selectable>
                  {(() => {
                    const p = editPassUser.rawPassword || editPassUser.passwordHash;
                    if (!p) return 'Non défini';
                    if (p.startsWith('$2a$') || p.startsWith('$2b$') || p.startsWith('$2y$')) {
                      return '🔒 Mot de passe chiffré (Sécurisé)';
                    }
                    return p;
                  })()}
                </Text>
              </View>
            )}

            {editPassError && (
              <View style={styles.modalErrorBanner}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.modalErrorText}>{editPassError}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={styles.formLabel}>Nouveau mot de passe</Text>
                <TouchableOpacity
                  onPress={handleGenerateRandomPassword}
                  style={styles.randomPassBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="shuffle" size={12} color="#38BDF8" />
                  <Text style={styles.randomPassText}>Générer aléatoire</Text>
                </TouchableOpacity>
              </View>

              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <TextInput
                  style={[styles.modalInput, { paddingRight: 44 }]}
                  placeholder="Saisissez ou générez le mot de passe"
                  placeholderTextColor="#64748B"
                  value={userNewPassInput}
                  onChangeText={setUserNewPassInput}
                  autoCapitalize="none"
                  secureTextEntry={!newUserPassVisible}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 12, padding: 4 }}
                  onPress={() => setNewUserPassVisible(!newUserPassVisible)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={newUserPassVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              {/* Suggestions rapides de mots de passe */}
              <View style={styles.presetPassChipsRow}>
                {['123456', 'user2026', 'win2026', 'xbet777'].map((pass) => (
                  <TouchableOpacity
                    key={pass}
                    style={styles.presetPassChip}
                    onPress={() => setUserNewPassInput(pass)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetPassChipText}>+ {pass}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.modalButtonsRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditPassUser(null)}
                disabled={isSavingUserPass}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  { backgroundColor: '#F59E0B' },
                  isSavingUserPass && { opacity: 0.7 },
                ]}
                onPress={handleSaveUserPassword}
                disabled={isSavingUserPass}
              >
                {isSavingUserPass ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="save-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.modalConfirmText}>Enregistrer le mot de passe</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  // Floating In-App Toast
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 16,
    left: 20,
    right: 20,
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 99999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toastError: {
    backgroundColor: '#DC2626',
  },
  toastInfo: {
    backgroundColor: '#0284C7',
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },

  // Top Header Bar
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  pulseLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38BDF8',
  },
  adminBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  systemStatusPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  systemStatusText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#22C55E',
    letterSpacing: 0.4,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 5,
  },
  changePassText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 5,
  },
  logoutText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Main Scroll Area
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 90,
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
  },

  // KPI Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  statCardWide: {
    minWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Search & Create Toolbar
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  createUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  createUserBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Filter Bar & Sort
  filterBarContainer: {
    marginBottom: 14,
  },
  filterTabsScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  filterTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  filterTabPillActive: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  filterTabTextActive: {
    color: '#38BDF8',
  },
  sortToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginRight: 2,
  },
  sortChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sortChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  sortChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  sortChipTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },

  // Section Header & Global Password Toggle
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 1,
  },
  globalPassToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  globalPassToggleBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  globalPassToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  globalPassToggleTextActive: {
    color: '#FCD34D',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 36,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E5E7EB',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },

  // User Card (Modern Glassmorphic / SaaS)
  userCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarLetter: {
    fontSize: 17,
    fontWeight: '900',
    color: '#38BDF8',
  },
  userTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sessionOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  sessionOffline: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  sessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sessionText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeBlocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userMetaText: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
  },

  // Credentials Container
  credentialsContainer: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  credentialLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 100,
  },
  credentialLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.4,
  },
  credentialValueBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 6,
  },
  credentialValueMono: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  credentialPasswordValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 2,
    flex: 1,
  },
  credentialPasswordVisible: {
    letterSpacing: 0.5,
    color: '#FCD34D',
    fontWeight: '800',
  },
  copySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  copySmallBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
  },
  eyeBtn: {
    padding: 2,
  },
  editPassMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  editPassMiniText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },

  // Permissions Container & Chips
  permissionsContainer: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  permissionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  permissionsTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.5,
  },
  permCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  permCountText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  managePermsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  managePermsBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#C084FC',
  },
  permChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  permChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  permChipDisabled: {
    backgroundColor: '#111827',
    borderColor: '#1F2937',
    opacity: 0.5,
  },
  permChipText: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  // Blocked Reason Box
  blockedReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 8,
    gap: 6,
  },
  blockedReasonText: {
    fontSize: 11,
    color: '#FCA5A5',
    fontWeight: '600',
    flex: 1,
  },

  // Balance Row & Quick Adjust
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 1,
  },
  quickRechargeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 2,
  },
  quickRechargeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#22C55E',
  },
  editBalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  editBalanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },

  // Device Status Row
  deviceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D16',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
  },
  deviceIdPreview: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Action Buttons Toolbar
  userActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 7,
    gap: 4,
  },
  actionBtnBlock: {
    backgroundColor: '#EF4444',
  },
  actionBtnUnblock: {
    backgroundColor: '#16A34A',
  },
  actionBtnRevoke: {
    backgroundColor: '#374151',
  },
  actionBtnResetDevice: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  actionBtnSimulate: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginLeft: 'auto',
  },
  actionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modals Overlay & Card
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  modalErrorText: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: '600',
    flex: 1,
  },
  editingSubtitle: {
    fontSize: 12.5,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    color: '#FFFFFF',
    fontSize: 13.5,
  },
  balanceInputBold: {
    fontSize: 18,
    fontWeight: '900',
    color: '#38BDF8',
  },
  quickLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  quickBtn: {
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  quickBtnActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  quickBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  quickBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  createPermToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 8,
  },
  createPermToggleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  createPermToggleSub: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  modalCancelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  modalConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  modalConfirmText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  randomPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  randomPassText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },

  // Block Modal Options
  blockReasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#1F2937',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  blockReasonOptionSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#301316',
  },
  blockReasonOptionText: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },

  // Permissions Modal Styles
  permModalCard: {
    maxWidth: 500,
    maxHeight: '90%',
    borderColor: '#A855F7',
  },
  permModalSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  permQuickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  permQuickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  permQuickBtnAll: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  permQuickBtnNone: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  permQuickBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  permSectionHeading: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  permItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#090D16',
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  permItemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  permItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  permItemCatBadge: {
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  permItemDesc: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Modal 6 - Current Password Box & Presets
  currentPassCard: {
    backgroundColor: '#090D16',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  currentPassLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  currentPassValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCD34D',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  copyCurrentPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  copyCurrentPassText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  presetPassChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  presetPassChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetPassChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
});
