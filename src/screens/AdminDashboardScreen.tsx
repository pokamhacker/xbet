import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore, UserAccount } from '../store/authStore';
import { Colors } from '../theme/theme';
import { useThemeStore } from '../stores/themeStore';
import { BrandLogo } from '../components/common/BrandLogo';

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
  } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchRemoteUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRemoteUsers();
    setRefreshing(false);
  };

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Create User Modal State
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('50000');
  const [createError, setCreateError] = useState<string | null>(null);

  // Change Password Modal State
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
  const [selectedBlockReason, setSelectedBlockReason] = useState<string>("Utilisateur situé en Côte d'Ivoire (Zone interdite)");
  const [customBlockReason, setCustomBlockReason] = useState<string>('');

  // Filter accounts: show only USER roles in the list
  const userAccounts = accounts.filter((a) => a.role === 'USER');
  const filteredUsers = userAccounts.filter((a) =>
    a.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalUsers = userAccounts.length;
  const activeSessionsCount = userAccounts.filter((a) => a.currentDeviceId !== null).length;
  const blockedUsersCount = userAccounts.filter((a) => !a.isActive).length;
  const totalCirculationBalance = userAccounts.reduce((acc, u) => acc + (u.balance || 0), 0);

  // Handlers
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
    setTimeout(() => {
      setChangePassModalVisible(false);
      Alert.alert('Succès', 'Le mot de passe administrateur a été modifié avec succès.');
    }, 600);
  };

  const handleOpenCreateModal = () => {
    setNewUsername('');
    setNewPassword('');
    setNewInitialBalance('50000');
    setCreateError(null);
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async () => {
    setCreateError(null);
    const parsedBalance = parseFloat(newInitialBalance) || 0;
    setIsCreating(true);
    try {
      const res = await createUser(newUsername, newPassword, parsedBalance);
      if (!res.success) {
        setCreateError(res.error || 'Erreur lors de la création.');
        return;
      }
      setCreateModalVisible(false);
      Alert.alert('Succès', `Le compte utilisateur "${newUsername.trim()}" a été créé sur le serveur.`);
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de la création.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditBalance = (user: UserAccount) => {
    setEditingUser(user);
    setBalanceInput(String(Math.round(user.balance)));
  };

  const handleSaveBalance = () => {
    if (!editingUser) return;
    const num = parseFloat(balanceInput);
    if (isNaN(num) || num < 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant de solde valide.');
      return;
    }
    updateUserBalance(editingUser.id, num);
    setEditingUser(null);
  };

  const handleQuickAddBalance = (delta: number) => {
    const current = parseFloat(balanceInput) || 0;
    setBalanceInput(String(Math.max(0, current + delta)));
  };

  const handleToggleActive = (user: UserAccount) => {
    if (user.isActive) {
      setBlockingUser(user);
      setSelectedBlockReason("Utilisateur situé en Côte d'Ivoire (Zone interdite)");
      setCustomBlockReason('');
      setBlockModalVisible(true);
    } else {
      toggleUserActive(user.id);
      Alert.alert('Accès réactivé', `Le compte de "${user.username}" a été débloqué avec succès.`);
    }
  };

  const handleConfirmBlock = () => {
    if (!blockingUser) return;
    const finalReason =
      selectedBlockReason === 'Autre motif personnalisé'
        ? (customBlockReason.trim() || "Compte suspendu par l'administrateur")
        : selectedBlockReason;

    toggleUserActive(blockingUser.id, finalReason);
    setBlockModalVisible(false);
    setBlockingUser(null);
    Alert.alert(
      'Compte bloqué',
      `Le compte "${blockingUser.username}" a été bloqué immédiatement.\nMotif : ${finalReason}`
    );
  };

  const handleRevokeDevice = (user: UserAccount) => {
    revokeUserDevice(user.id);
    Alert.alert('Session révoquée', `L'appareil associé au compte "${user.username}" a été déconnecté.`);
  };

  const handleResetDevice = (user: UserAccount) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Dissocier l'appareil lié au compte "${user.username}" ?\n\nCela réactivera le compte et permettra à l'utilisateur d'associer un nouvel appareil.`
      );
      if (confirmed) {
        resetUserDevice(user.id);
        alert(`Appareil dissocié pour "${user.username}". L'utilisateur peut maintenant se connecter avec son nouvel appareil.`);
      }
    } else {
      Alert.alert(
        'Changer d\'appareil / Dissocier',
        `Dissocier l'appareil associé au compte "${user.username}" ?\n\nCela réactivera le compte et permettra à l'utilisateur de se connecter avec un nouvel appareil.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Dissocier & Débloquer',
            onPress: () => {
              resetUserDevice(user.id);
              Alert.alert(
                'Succès',
                `L'appareil du compte "${user.username}" a été dissocié. L'accès est rétabli pour son nouvel appareil.`
              );
            },
          },
        ]
      );
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Supprimer définitivement l'utilisateur "${user.username}" ?`);
      if (confirmed) {
        deleteUser(user.id);
      }
    } else {
      Alert.alert(
        'Supprimer l\'utilisateur',
        `Êtes-vous sûr de vouloir supprimer définitivement le compte "${user.username}" ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: () => deleteUser(user.id),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1E293B" translucent={Platform.OS === 'android'} />
      {/* Top Admin Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#38BDF8" />
            <Text style={styles.adminBadgeText}>PANNEAU ADMIN</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <BrandLogo size={18} variant="header" isDark />
            <Text style={styles.headerTitle}>Studio Bookmaker</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.changePassBtn}
            onPress={handleOpenChangePassModal}
            activeOpacity={0.8}
          >
            <Ionicons name="key-outline" size={16} color="#38BDF8" />
            <Text style={styles.changePassText}>Mot de passe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </View>

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
        {/* KPI / Stats Section */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Ionicons name="people" size={20} color="#38BDF8" />
            </View>
            <Text style={styles.statValue}>{totalUsers}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
              <Ionicons name="radio" size={20} color="#22C55E" />
            </View>
            <Text style={styles.statValue}>{activeSessionsCount}</Text>
            <Text style={styles.statLabel}>En Ligne</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Ionicons name="lock-closed" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{blockedUsersCount}</Text>
            <Text style={styles.statLabel}>Bloqués</Text>
          </View>

          <View style={[styles.statCard, styles.statCardWide]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color="#EAB308" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statValue}>
                {totalCirculationBalance.toLocaleString('fr-FR')} ₣
              </Text>
              <Text style={styles.statLabel}>Total des soldes en circulation</Text>
            </View>
          </View>
        </View>

        {/* Action & Search Bar */}
        <View style={styles.actionsBar}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un utilisateur..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
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

        {/* Users List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            COMPTES UTILISATEURS ({filteredUsers.length})
          </Text>
          <Text style={styles.sectionSubtitle}>
            Contrôle mono-session & gestion directe des soldes
          </Text>
        </View>

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#475569" />
            <Text style={styles.emptyTitle}>Aucun utilisateur trouvé</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? 'Aucun compte ne correspond à votre recherche.'
                : 'Créez votre premier utilisateur à l\'aide du bouton ci-dessus.'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = user.currentDeviceId !== null;
            return (
              <View key={user.id} style={styles.userCard}>
                {/* Header row: Username & Badges */}
                <View style={styles.userCardHeader}>
                  <View style={styles.userAvatarCircle}>
                    <Ionicons name="person" size={18} color="#38BDF8" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.userTitleRow}>
                      <Text style={styles.userNameText}>{user.username}</Text>
                      {/* Active / Blocked Badge */}
                      <View
                        style={[
                          styles.badgePill,
                          user.isActive ? styles.badgeActive : styles.badgeBlocked,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgePillText,
                            { color: user.isActive ? '#22C55E' : '#EF4444' },
                          ]}
                        >
                          {user.isActive ? 'Actif' : 'Bloqué'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.userMetaText}>
                      Créé le : {user.createdAt} · Mot de passe : {user.passwordHash}
                    </Text>
                  </View>
                </View>

                {/* Blocked Reason Banner */}
                {user.blockedReason && (
                  <View style={styles.blockedReasonBox}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.blockedReasonText}>{user.blockedReason}</Text>
                  </View>
                )}

                {/* Session & Device Status */}
                <View style={styles.sessionStatusRow}>
                  <View style={styles.sessionLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isOnline ? '#22C55E' : '#64748B' },
                      ]}
                    />
                    <Text style={styles.sessionStatusLabel}>
                      {isOnline ? 'En ligne' : 'Hors ligne'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="phone-portrait-outline" size={12} color="#94A3B8" />
                    <Text style={styles.deviceIdPreview}>
                      {user.boundDeviceId
                        ? `Lié : ${user.boundDeviceId.slice(0, 10)}...`
                        : 'Appareil libre'}
                    </Text>
                  </View>
                </View>

                {/* Balance Row */}
                <View style={styles.balanceContainer}>
                  <View>
                    <Text style={styles.balanceLabel}>Solde disponible</Text>
                    <Text style={styles.balanceValue}>
                      {user.balance.toLocaleString('fr-FR')} ₣
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editBalanceBtn}
                    onPress={() => handleOpenEditBalance(user)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="pencil" size={14} color="#38BDF8" />
                    <Text style={styles.editBalanceText}>Modifier le solde</Text>
                  </TouchableOpacity>
                </View>

                {/* Action Controls */}
                <View style={styles.userActionsRow}>
                  {/* Block / Unblock Button (1-Click) */}
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
                      size={15}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnText}>
                      {user.isActive ? 'Bloquer l\'accès' : 'Débloquer'}
                    </Text>
                  </TouchableOpacity>

                  {/* Dissocier l'appareil (Reset Device) */}
                  {(user.boundDeviceId || !user.isActive) && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnResetDevice]}
                      onPress={() => handleResetDevice(user)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="phone-portrait-outline" size={15} color="#38BDF8" />
                      <Text style={[styles.actionBtnText, { color: '#38BDF8' }]}>
                        Changer appareil
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Revoke Device Session */}
                  {isOnline && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnRevoke]}
                      onPress={() => handleRevokeDevice(user)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="refresh-outline" size={15} color="#E2E8F0" />
                      <Text style={styles.actionBtnText}>Déconnecter</Text>
                    </TouchableOpacity>
                  )}

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDelete]}
                    onPress={() => handleDeleteUser(user)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={15} color="#F87171" />
                    <Text style={[styles.actionBtnText, { color: '#F87171' }]}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal: Create User Account */}
      <Modal visible={isCreateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Créer un compte utilisateur</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
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
              <Text style={styles.formLabel}>Solde initial en ₣</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 50000"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={newInitialBalance}
                onChangeText={setNewInitialBalance}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCreateModalVisible(false)}
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

      {/* Modal: Edit User Balance */}
      <Modal visible={editingUser !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le solde</Text>
              <TouchableOpacity onPress={() => setEditingUser(null)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.editingSubtitle}>
              Compte : <Text style={{ color: '#38BDF8', fontWeight: '700' }}>{editingUser?.username}</Text>
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
              {[+10000, +50000, +100000, -10000, -50000].map((delta) => (
                <TouchableOpacity
                  key={delta}
                  style={styles.quickBtn}
                  onPress={() => handleQuickAddBalance(delta)}
                >
                  <Text style={[styles.quickBtnText, delta < 0 && { color: '#F87171' }]}>
                    {delta > 0 ? `+${(delta / 1000)}k ₣` : `${(delta / 1000)}k ₣`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingUser(null)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveBalance}
              >
                <Text style={styles.modalConfirmText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Admin Password Modal */}
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
                <Text style={styles.modalTitle}>Modifier le mot de passe Admin</Text>
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
                placeholder="Entrez le nouveau mot de passe"
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

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleChangePassSubmit}
              >
                <Text style={styles.modalConfirmText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Bloquer un Utilisateur (Ex: Côte d'Ivoire / Fraude / Manuel) */}
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
                <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Bloquer l'utilisateur</Text>
              </View>
              <TouchableOpacity onPress={() => setBlockModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.editingSubtitle}>
              Compte : <Text style={{ color: '#F87171', fontWeight: '800' }}>{blockingUser?.username}</Text>
            </Text>

            <Text style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>
              Sélectionnez ou saisissez le motif de blocage. L'utilisateur sera déconnecté immédiatement et son accès sera verrouillé :
            </Text>

            {/* Quick Reason Options */}
            {[
              { label: "Utilisateur situé en Côte d'Ivoire (Zone interdite)" },
              { label: "Suspension administrative temporaire" },
              { label: "Activité suspecte / Non-respect des règles" },
              { label: "Tentative de connexion non autorisée" },
              { label: "Autre motif personnalisé" },
            ].map((option) => {
              const isSelected = selectedBlockReason === option.label;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.blockReasonOption,
                    isSelected && styles.blockReasonOptionSelected,
                  ]}
                  onPress={() => setSelectedBlockReason(option.label)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
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
                <Text style={styles.formLabel}>Précisez le motif du blocage :</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Utilisateur hors zone géographique autorisée"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    gap: 6,
  },
  changePassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 6,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 110,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
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
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#334155',
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
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    gap: 6,
  },
  createUserBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  badgePill: {
    paddingHorizontal: 8,
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
    fontSize: 11,
    fontWeight: '800',
  },
  userMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sessionStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  deviceIdPreview: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#38BDF8',
    marginTop: 1,
  },
  editBalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editBalanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  userActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#283548',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
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
  actionBtnBlock: {
    backgroundColor: '#EF4444',
  },
  actionBtnUnblock: {
    backgroundColor: '#16A34A',
  },
  actionBtnRevoke: {
    backgroundColor: '#334155',
  },
  actionBtnResetDevice: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginLeft: 'auto',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
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
  },
  modalErrorText: {
    fontSize: 12,
    color: '#FCA5A5',
    fontWeight: '600',
    flex: 1,
  },
  editingSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    color: '#FFFFFF',
    fontSize: 14,
  },
  balanceInputBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  quickBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
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
    backgroundColor: '#334155',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  modalConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  blockReasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  blockReasonOptionSelected: {
    borderColor: '#EF4444',
    backgroundColor: '#451A1A',
  },
  blockReasonOptionText: {
    fontSize: 13,
    color: '#CBD5E1',
    flex: 1,
  },
});
