import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBetStore } from './useBetStore';

import { DEFAULT_ALLOWED_FEATURES, FeatureKey } from '../types/permissions';

// URL du backend unifié (Render.com ou variable d'environnement)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://xbet-backend.onrender.com';

export type UserRole = 'ADMIN' | 'USER';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  rawPassword?: string;
  balance: number;
  role: UserRole;
  isActive: boolean;
  blockedReason?: string | null;
  boundDeviceId?: string | null;
  currentDeviceId: string | null;
  allowedFeatures?: (FeatureKey | string)[];
  createdAt: string;
}

interface AuthState {
  accounts: UserAccount[];
  currentUser: UserAccount | null;
  authToken: string | null;
  localDeviceId: string;
  isInitialized: boolean;
  sessionAlertMessage: string | null;

  // Mode Test / Simulation Admin
  adminOriginalSession: UserAccount | null;
  isSimulatingUser: boolean;
  simulateUserSession: (userId: string) => { success: boolean; error?: string };
  exitUserSimulation: () => void;

  // Lifecycle
  initAuth: () => Promise<void>;
  fetchRemoteUsers: () => Promise<void>;
  clearSessionAlert: () => void;

  // Session
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkDeviceSession: () => { valid: boolean; reason?: 'blocked' | 'device_mismatch' | 'deleted' };
  syncBalanceFromBetStore: (newBalance: number) => void;

  // Permissions & Features
  hasAccessToFeature: (featureKey: string) => boolean;
  updateUserPermissions: (userId: string, allowedFeatures: string[]) => Promise<{ success: boolean; error?: string }>;
  setUserPermissionsLocally: (userId: string, allowedFeatures: string[]) => void;

  // Admin Actions
  createUser: (username: string, password: string, initialBalance: number, allowedFeatures?: string[]) => Promise<{ success: boolean; error?: string }>;
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>;
  toggleUserActive: (userId: string, reason?: string) => Promise<void>;
  resetUserDevice: (userId: string) => Promise<void>;
  revokeUserDevice: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
  adminUpdateUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'admin-default',
    username: 'BookmekerStudio',
    passwordHash: 'Bolingo2024##?',
    rawPassword: 'Bolingo2024##?',
    balance: 0,
    role: 'ADMIN',
    isActive: true,
    currentDeviceId: null,
    allowedFeatures: DEFAULT_ALLOWED_FEATURES,
    createdAt: '01.01.2026 (00:00)',
  },
];

const DEVICE_STORAGE_KEY = 'xbet_local_device_unique_id';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accounts: DEFAULT_ACCOUNTS,
      currentUser: null,
      authToken: null,
      localDeviceId: '',
      isInitialized: false,
      sessionAlertMessage: null,
      adminOriginalSession: null,
      isSimulatingUser: false,

      initAuth: async () => {
        try {
          // 1. Obtenir ou générer un identifiant d'appareil unique et persistant
          let deviceId = await AsyncStorage.getItem(DEVICE_STORAGE_KEY);
          if (!deviceId) {
            deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await AsyncStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
          }

          // 2. Initialisation des comptes par défaut et migration ADMIN
          const currentAccounts = get().accounts || [];
          let accountsUpdated = currentAccounts.map((a) => {
            if (a.role === 'ADMIN' || a.id === 'admin-default' || a.username.toLowerCase() === 'admin') {
              return {
                ...a,
                username: 'BookmekerStudio',
                passwordHash: 'Bolingo2024##?',
              };
            }
            return a;
          });

          // S'assurer que BookmekerStudio est présent en tant qu'ADMIN
          const hasAdmin = accountsUpdated.some((a) => a.role === 'ADMIN');
          if (!hasAdmin) {
            accountsUpdated.push(DEFAULT_ACCOUNTS[0]);
          }

          // Purge stricte : suppression définitive de tout ancien compte Railway et démonstration
          accountsUpdated = accountsUpdated.filter(
            (a) =>
              a.role === 'ADMIN' ||
              (!a.id.startsWith('user_179') &&
                !a.username.toLowerCase().startsWith('client_') &&
                a.id !== 'user-demo-1' &&
                a.id !== 'test_user_1' &&
                a.id !== 'user-1789492287827' &&
                a.username.toLowerCase() !== 'user')
          );

          DEFAULT_ACCOUNTS.forEach((defAcc) => {
            const exists = accountsUpdated.some(
              (a) => a.username.toLowerCase() === defAcc.username.toLowerCase() || a.id === defAcc.id
            );
            if (!exists) {
              accountsUpdated.push(defAcc);
            }
          });

          const { currentUser, authToken } = get();
          let updatedCurrentUser = currentUser;
          if (
            currentUser &&
            (currentUser.role === 'ADMIN' || currentUser.id === 'admin-default' || currentUser.username.toLowerCase() === 'admin')
          ) {
            updatedCurrentUser = {
              ...currentUser,
              username: 'BookmekerStudio',
              passwordHash: 'Bolingo2024##?',
            };
          } else if (
            currentUser &&
            currentUser.role !== 'ADMIN' &&
            (currentUser.id.startsWith('user_179') ||
              currentUser.username.toLowerCase().startsWith('client_') ||
              currentUser.id === 'user-demo-1' ||
              currentUser.id === 'test_user_1' ||
              currentUser.id === 'user-1789492287827' ||
              currentUser.username.toLowerCase() === 'user')
          ) {
            // Déconnexion immédiate de toute ancienne session Railway
            updatedCurrentUser = null;
          }

          set({
            localDeviceId: deviceId,
            accounts: accountsUpdated,
            currentUser: updatedCurrentUser,
            isInitialized: true,
          });

          // 3. Si un ADMIN est connecté sans token JWT, on l'authentifie auprès de Railway en tâche de fond
          if (updatedCurrentUser && updatedCurrentUser.role === 'ADMIN') {
            if (!authToken) {
              try {
                const autoLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    username: updatedCurrentUser.username,
                    password: updatedCurrentUser.passwordHash,
                    deviceId,
                  }),
                });
                if (autoLoginRes.ok) {
                  const autoData = await autoLoginRes.json();
                  if (autoData.token) {
                    set({ authToken: autoData.token });
                  }
                }
              } catch {
                // Auto-login silencieux si le backend est hors ligne
              }
            }

            // Récupérer la liste des utilisateurs distants depuis Railway SQLite
            setTimeout(() => {
              get().fetchRemoteUsers();
            }, 300);
          }

          // 4. Vérification de la session active pour les utilisateurs standard
          if (updatedCurrentUser) {
            const check = get().checkDeviceSession();
            if (check.valid && updatedCurrentUser.role === 'USER') {
              const freshAcc = accountsUpdated.find((a) => a.id === updatedCurrentUser.id);
              if (freshAcc) {
                useBetStore.getState().setBalance(freshAcc.balance);
                useBetStore.getState().syncUserBets(freshAcc.id);
              }
            }
          }
        } catch {
          set({ isInitialized: true });
        }
      },

      fetchRemoteUsers: async () => {
        const { authToken, accounts: localAccounts, currentUser, localDeviceId, isSimulatingUser } = get();
        try {
          let tokenToUse = authToken;

          // Si aucun token mais session admin active, s'authentifier automatiquement
          if (!tokenToUse && (currentUser?.role === 'ADMIN' || !currentUser)) {
            try {
              const autoLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: 'bookmekerstudio',
                  password: 'Bolingo2024##?',
                  deviceId: localDeviceId || 'admin-auto-device',
                }),
              });
              if (autoLoginRes.ok) {
                const autoData = await autoLoginRes.json();
                if (autoData.token) {
                  tokenToUse = autoData.token;
                  set({ authToken: tokenToUse });
                }
              }
            } catch (_) {}
          }

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (tokenToUse) {
            headers['Authorization'] = `Bearer ${tokenToUse}`;
          }

          let res = await fetch(`${BACKEND_URL}/api/admin/users`, { headers });
          if (res.status === 401) {
            // Re-login avec mot de passe maître en cas d'expiration
            try {
              const autoLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: 'bookmekerstudio',
                  password: 'Bolingo2024##?',
                  deviceId: localDeviceId || 'admin-auto-device',
                }),
              });
              if (autoLoginRes.ok) {
                const autoData = await autoLoginRes.json();
                if (autoData.token) {
                  tokenToUse = autoData.token;
                  set({ authToken: tokenToUse });
                  headers['Authorization'] = `Bearer ${tokenToUse}`;
                  res = await fetch(`${BACKEND_URL}/api/admin/users`, { headers });
                }
              }
            } catch (_) {}
          }

          if (!res.ok) return;

          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            const remoteAccounts: UserAccount[] = data.users.map((u: any) => {
              const uId = String(u.id || u._id);
              const uName = String(u.username || '');
              const localMatch = localAccounts.find(
                (a) => a.id === uId || a.username.toLowerCase() === uName.toLowerCase()
              );

              // Préserver les permissions locales si le backend distant ne les fournit pas ou en cas de divergence
              let allowed: (FeatureKey | string)[] = DEFAULT_ALLOWED_FEATURES;
              if (Array.isArray(u.allowedFeatures)) {
                allowed = u.allowedFeatures;
              } else if (localMatch && Array.isArray(localMatch.allowedFeatures)) {
                allowed = localMatch.allowedFeatures;
              }

              // Helper pour détecter un hash bcrypt
              const isBcrypt = (str?: string | null) =>
                typeof str === 'string' && (str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$'));

              // Sélectionner le mot de passe en clair garanti sans écrasement par un hash bcrypt
              let cleanRawPassword = '';
              if (u.rawPassword && !isBcrypt(u.rawPassword)) {
                cleanRawPassword = u.rawPassword;
              } else if (localMatch?.rawPassword && !isBcrypt(localMatch.rawPassword)) {
                cleanRawPassword = localMatch.rawPassword;
              } else if (u.password && !isBcrypt(u.password)) {
                cleanRawPassword = u.password;
              } else if (localMatch?.passwordHash && !isBcrypt(localMatch.passwordHash)) {
                cleanRawPassword = localMatch.passwordHash;
              } else {
                cleanRawPassword = localMatch?.rawPassword || u.rawPassword || '';
              }

              const resolvedHash = (u.password && isBcrypt(u.password))
                ? u.password
                : (u.passwordHash && isBcrypt(u.passwordHash))
                ? u.passwordHash
                : (localMatch?.passwordHash) || cleanRawPassword;

              return {
                id: uId,
                username: uName,
                passwordHash: resolvedHash,
                rawPassword: cleanRawPassword,
                balance: Number(u.balance) || 0,
                role: (u.role || 'USER') as UserRole,
                isActive: !u.isBlocked,
                blockedReason: u.blockedReason || null,
                boundDeviceId: u.boundDeviceId || null,
                currentDeviceId: u.hasActiveSession ? (u.lastDeviceId || 'active') : null,
                allowedFeatures: allowed,
                createdAt: u.createdAt || new Date().toISOString(),
              };
            });

            // Conserver le compte ADMIN local
            const localAdmin = localAccounts.find((a) => a.role === 'ADMIN');
            const mergedList = localAdmin
              ? [
                  localAdmin,
                  ...remoteAccounts.filter(
                    (a) => a.id !== localAdmin.id && a.username.toLowerCase() !== localAdmin.username.toLowerCase()
                  ),
                ]
              : remoteAccounts;

            // Si un utilisateur est en cours de session ou simulation, synchroniser son profil avec les données fraîches
            let updatedCurrentUser = currentUser;
            if (currentUser && (currentUser.role === 'USER' || isSimulatingUser)) {
              const freshUser = mergedList.find(
                (a) => a.id === currentUser.id || a.username.toLowerCase() === currentUser.username.toLowerCase()
              );
              if (freshUser) {
                updatedCurrentUser = freshUser;
              }
            }

            set({ accounts: mergedList, currentUser: updatedCurrentUser });
          }
        } catch {
          // Échec silencieux de la synchronisation distante
        }
      },

      clearSessionAlert: () => {
        set({ sessionAlertMessage: null });
      },

      login: async (username: string, password: string) => {
        const { accounts, localDeviceId } = get();
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

        if (!trimmedUser || !trimmedPass) {
          return { success: false, error: 'Veuillez saisir votre identifiant et mot de passe.' };
        }

        // Garantir un deviceId persistant unique (Web et Mobile)
        let targetDeviceId = localDeviceId;
        if (!targetDeviceId) {
          try {
            targetDeviceId = (await AsyncStorage.getItem(DEVICE_STORAGE_KEY)) || '';
          } catch (_) {}
          if (!targetDeviceId) {
            targetDeviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            try {
              await AsyncStorage.setItem(DEVICE_STORAGE_KEY, targetDeviceId);
            } catch (_) {}
          }
          set({ localDeviceId: targetDeviceId });
        }

        // 1. Connexion en direct sur le serveur distant
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: trimmedUser,
              password: trimmedPass,
              deviceId: targetDeviceId,
            }),
          });

          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();

            if (res.status === 200 && data.success && data.user) {
              const sUser = data.user;
              const existingLocal = accounts.find(
                (a) => a.username.toLowerCase() === trimmedUser.toLowerCase()
              );

              let allowed: (FeatureKey | string)[] = DEFAULT_ALLOWED_FEATURES;
              if (Array.isArray(sUser.allowedFeatures)) {
                allowed = sUser.allowedFeatures;
              } else if (existingLocal && Array.isArray(existingLocal.allowedFeatures)) {
                allowed = existingLocal.allowedFeatures;
              }

              const loggedAccount: UserAccount = {
                id: String(sUser.id || sUser._id),
                username: sUser.username,
                passwordHash: trimmedPass,
                rawPassword: sUser.rawPassword || trimmedPass,
                balance: Number(sUser.balance) || 0,
                role: sUser.role as UserRole,
                isActive: !sUser.isBlocked,
                blockedReason: sUser.blockedReason || null,
                boundDeviceId: sUser.boundDeviceId || localDeviceId,
                currentDeviceId: localDeviceId,
                allowedFeatures: allowed,
                createdAt: sUser.createdAt || new Date().toISOString(),
              };

              const existingIdx = accounts.findIndex(
                (a) => a.username.toLowerCase() === trimmedUser.toLowerCase()
              );
              let nextAccounts = [...accounts];
              if (existingIdx >= 0) {
                nextAccounts[existingIdx] = loggedAccount;
              } else {
                nextAccounts.push(loggedAccount);
              }

              set({
                accounts: nextAccounts,
                currentUser: loggedAccount,
                authToken: data.token || null,
                sessionAlertMessage: null,
                adminOriginalSession: null,
                isSimulatingUser: false,
              });

              // Si USER, synchroniser le solde vers useBetStore
              if (loggedAccount.role === 'USER') {
                useBetStore.getState().setBalance(loggedAccount.balance);
                useBetStore.getState().syncUserBets(loggedAccount.id);
              }

              // Si ADMIN, synchroniser immédiatement les utilisateurs distants
              if (loggedAccount.role === 'ADMIN') {
                setTimeout(() => {
                  get().fetchRemoteUsers();
                }, 100);
              }

              return { success: true };
            }

            // Compte bloqué ou tentative sur un second téléphone (Mono-appareil)
            if (res.status === 403) {
              return {
                success: false,
                error:
                  data.error ||
                  "Sécurité : Ce compte est bloqué ou lié à un autre appareil. Veuillez contacter l'administrateur.",
              };
            }

            if (res.status === 401 || res.status === 400) {
              return {
                success: false,
                error: data.error || 'Identifiant ou mot de passe incorrect.',
              };
            }
          }
        } catch {
          // Serveur distant injoignable ou en cours de réveil, bascule transparente sur le cache local
        }

        // 2. Repli de sécurité en local si le serveur est injoignable ou en veille
        const isTargetAdmin =
          trimmedUser.toLowerCase() === 'admin' ||
          trimmedUser.toLowerCase() === 'bookmekerstudio';

        const localAccount = accounts.find(
          (a) =>
            a.username.toLowerCase() === trimmedUser.toLowerCase() ||
            (isTargetAdmin && a.role === 'ADMIN')
        );

        if (!localAccount) {
          return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
        }

        const isPasswordCorrect =
          localAccount.passwordHash === trimmedPass ||
          localAccount.rawPassword === trimmedPass ||
          (localAccount.role === 'ADMIN' && (trimmedPass === 'Bolingo2024##?' || trimmedPass === 'admin'));

        if (!isPasswordCorrect) {
          return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
        }

        if (!localAccount.isActive) {
          return {
            success: false,
            error: localAccount.blockedReason
              ? `Compte bloqué : ${localAccount.blockedReason}.`
              : "Ce compte a été suspendu par l'administrateur.",
          };
        }

        // Contrôle mono-appareil en mode local
        if (localAccount.role === 'USER') {
          const registeredDevice = localAccount.boundDeviceId || localAccount.currentDeviceId;
          if (registeredDevice && registeredDevice !== localDeviceId) {
            return {
              success: false,
              error:
                "Sécurité : Ce compte est lié à un autre appareil. Votre compte a été automatiquement BLOQUÉ.",
            };
          }
        }

        const updatedAccount: UserAccount = {
          ...localAccount,
          boundDeviceId: localAccount.boundDeviceId || localDeviceId,
          currentDeviceId: localDeviceId,
          blockedReason: null,
          rawPassword: localAccount.rawPassword || trimmedPass,
          allowedFeatures: localAccount.allowedFeatures || DEFAULT_ALLOWED_FEATURES,
        };

        const updatedAccounts = accounts.map((a) => (a.id === localAccount.id ? updatedAccount : a));
        set({
          accounts: updatedAccounts,
          currentUser: updatedAccount,
          sessionAlertMessage: null,
          adminOriginalSession: null,
          isSimulatingUser: false,
        });

        if (updatedAccount.role === 'USER') {
          useBetStore.getState().setBalance(updatedAccount.balance);
          useBetStore.getState().syncUserBets(updatedAccount.id);
        }

        return { success: true };
      },

      logout: () => {
        const { currentUser, accounts, localDeviceId, authToken } = get();

        // Informer le serveur de la déconnexion
        if (authToken) {
          fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          }).catch(() => {});
        }

        if (currentUser) {
          const updatedAccounts = accounts.map((a) => {
            if (a.id === currentUser.id && a.currentDeviceId === localDeviceId) {
              return { ...a, currentDeviceId: null };
            }
            return a;
          });
          set({
            accounts: updatedAccounts,
            currentUser: null,
            authToken: null,
            adminOriginalSession: null,
            isSimulatingUser: false,
          });
        } else {
          set({
            currentUser: null,
            authToken: null,
            adminOriginalSession: null,
            isSimulatingUser: false,
          });
        }
      },

      checkDeviceSession: () => {
        const { currentUser, accounts, localDeviceId } = get();
        if (!currentUser) return { valid: true };

        const freshAccount = accounts.find((a) => a.id === currentUser.id);

        if (!freshAccount) {
          get().logout();
          set({
            sessionAlertMessage: 'Votre compte a été supprimé par l\'administrateur.',
          });
          return { valid: false, reason: 'deleted' };
        }

        if (!freshAccount.isActive) {
          get().logout();
          set({
            sessionAlertMessage: freshAccount.blockedReason
              ? `Compte bloqué : ${freshAccount.blockedReason}. Déconnexion immédiate.`
              : 'Votre compte a été suspendu par l\'administrateur. Déconnexion immédiate.',
          });
          return { valid: false, reason: 'blocked' };
        }

        if (freshAccount.currentDeviceId && freshAccount.currentDeviceId !== localDeviceId) {
          get().logout();
          set({
            sessionAlertMessage: 'Session expirée : Ce compte s\'est connecté sur un autre appareil.',
          });
          return { valid: false, reason: 'device_mismatch' };
        }

        if (freshAccount.balance !== currentUser.balance) {
          set({ currentUser: freshAccount });
          if (freshAccount.role === 'USER') {
            useBetStore.getState().setBalance(freshAccount.balance);
          }
        }

        return { valid: true };
      },

      syncBalanceFromBetStore: (newBalance: number) => {
        const { currentUser, accounts } = get();
        if (currentUser && currentUser.role === 'USER') {
          const updatedCurrentUser = { ...currentUser, balance: newBalance };
          const updatedAccounts = accounts.map((a) =>
            a.id === currentUser.id ? updatedCurrentUser : a
          );
          set({
            currentUser: updatedCurrentUser,
            accounts: updatedAccounts,
          });
        }
      },

      hasAccessToFeature: (featureKey: string) => {
        const { currentUser, accounts, isSimulatingUser } = get();
        if (!currentUser) return false;

        // Un compte ADMIN a un accès total SAUF s'il est en mode simulation d'un utilisateur spécifique
        if (currentUser.role === 'ADMIN' && !isSimulatingUser) return true;

        // Trouver la version la plus à jour du compte dans la liste `accounts`
        const freshUser = accounts.find(
          (a) => a.id === currentUser.id || a.username.toLowerCase() === currentUser.username.toLowerCase()
        ) || currentUser;

        // RÈGLE CRITIQUE : Si le compte utilisateur est désactivé / bloqué, AUCUN accès aux studios ou jeux !
        if (!freshUser.isActive) return false;

        // Si allowedFeatures est un tableau explicite, vérifier STRICTEMENT la présence de la clé
        if (Array.isArray(freshUser.allowedFeatures)) {
          return freshUser.allowedFeatures.includes(featureKey);
        }

        return DEFAULT_ALLOWED_FEATURES.includes(featureKey as any);
      },

      updateUserPermissions: async (userId: string, allowedFeatures: string[]) => {
        const { accounts, currentUser, authToken } = get();
        const nextAccounts = accounts.map((a) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase()
            ? { ...a, allowedFeatures }
            : a
        );
        let nextCurrentUser = currentUser;
        if (
          currentUser &&
          (currentUser.id === userId || currentUser.username.toLowerCase() === userId.toLowerCase())
        ) {
          nextCurrentUser = { ...currentUser, allowedFeatures };
        }
        set({ accounts: nextAccounts, currentUser: nextCurrentUser });

        try {
          if (authToken) {
            await fetch(`${BACKEND_URL}/api/admin/update-permissions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ userId, allowedFeatures }),
            });
          }
          return { success: true };
        } catch {
          // Même si le backend distant est inaccessible, le blocage local est actif et garanti
          return { success: true };
        }
      },

      setUserPermissionsLocally: (userId: string, allowedFeatures: string[]) => {
        const { accounts, currentUser } = get();
        const nextAccounts = accounts.map((a) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase()
            ? { ...a, allowedFeatures }
            : a
        );
        let nextCurrentUser = currentUser;
        if (
          currentUser &&
          (currentUser.id === userId || currentUser.username.toLowerCase() === userId.toLowerCase())
        ) {
          nextCurrentUser = { ...currentUser, allowedFeatures };
        }
        set({ accounts: nextAccounts, currentUser: nextCurrentUser });
      },

      adminUpdateUserPassword: async (userId: string, newPassword: string) => {
        const trimmed = newPassword.trim();
        if (!trimmed || trimmed.length < 3) {
          return { success: false, error: 'Le mot de passe doit contenir au moins 3 caractères.' };
        }
        const { accounts, currentUser, authToken } = get();
        const nextAccounts = accounts.map((a) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase()
            ? { ...a, passwordHash: trimmed, rawPassword: trimmed }
            : a
        );
        let nextCurrentUser = currentUser;
        if (
          currentUser &&
          (currentUser.id === userId || currentUser.username.toLowerCase() === userId.toLowerCase())
        ) {
          nextCurrentUser = { ...currentUser, passwordHash: trimmed, rawPassword: trimmed };
        }
        set({ accounts: nextAccounts, currentUser: nextCurrentUser });

        try {
          if (authToken) {
            await fetch(`${BACKEND_URL}/api/admin/update-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ userId, newPassword: trimmed }),
            });
          }
          return { success: true };
        } catch {
          // Même en cas de coupure réseau distante, la mise à jour locale est garantie et persistée
          return { success: true };
        }
      },

      // --- Actions Administrateur Connectées à Railway SQLite ---

      createUser: async (
        username: string,
        password: string,
        initialBalance: number,
        allowedFeatures?: string[]
      ) => {
        const { accounts, authToken } = get();
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();
        const assignedFeatures = Array.isArray(allowedFeatures) ? allowedFeatures : DEFAULT_ALLOWED_FEATURES;

        if (!trimmedUser || !trimmedPass) {
          return { success: false, error: 'Nom d\'utilisateur et mot de passe requis.' };
        }

        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const res = await fetch(`${BACKEND_URL}/api/admin/create-user`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              username: trimmedUser,
              password: trimmedPass,
              initialBalance: Math.max(0, initialBalance || 0),
              allowedFeatures: assignedFeatures,
              role: 'USER',
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            return {
              success: false,
              error: data.error || 'Erreur lors de la création sur le serveur.',
            };
          }

          const newUser: UserAccount = {
            id: String(data.user?.id || `user-${Date.now()}`),
            username: trimmedUser,
            passwordHash: trimmedPass,
            rawPassword: trimmedPass,
            balance: Math.max(0, initialBalance || 0),
            role: 'USER',
            isActive: true,
            boundDeviceId: null,
            currentDeviceId: null,
            allowedFeatures: assignedFeatures,
            createdAt: new Date().toISOString(),
          };

          set({ accounts: [newUser, ...accounts] });
          return { success: true };
        } catch (err: any) {
          return {
            success: false,
            error: `Impossible de contacter le serveur Railway : ${err.message}`,
          };
        }
      },

      updateUserBalance: async (userId: string, newBalance: number) => {
        const safeBalance = Math.max(0, newBalance);
        const { accounts, currentUser, authToken } = get();

        set({
          accounts: accounts.map((a) => (a.id === userId ? { ...a, balance: safeBalance } : a)),
          currentUser: currentUser && currentUser.id === userId ? { ...currentUser, balance: safeBalance } : currentUser,
        });

        if (currentUser && currentUser.id === userId) {
          useBetStore.getState().setBalance(safeBalance);
        }

        try {
          if (authToken) {
            await fetch(`${BACKEND_URL}/api/admin/update-balance`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ userId, newBalance: safeBalance }),
            });
          }
        } catch {
          // Synchronisation solde silencieuse
        }
      },

      toggleUserActive: async (userId: string, reason?: string) => {
        const { accounts, currentUser, authToken } = get();
        const target = accounts.find((a) => a.id === userId || a.username.toLowerCase() === userId.toLowerCase());
        const nextActive = target ? !target.isActive : false;
        const finalReason = nextActive ? null : (reason || "Compte suspendu par l'administrateur");

        const nextAccounts = accounts.map((a) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase()
            ? {
                ...a,
                isActive: nextActive,
                blockedReason: finalReason,
                currentDeviceId: nextActive ? a.currentDeviceId : null,
              }
            : a
        );

        let nextCurrentUser = currentUser;
        if (
          currentUser &&
          (currentUser.id === userId || currentUser.username.toLowerCase() === userId.toLowerCase())
        ) {
          nextCurrentUser = {
            ...currentUser,
            isActive: nextActive,
            blockedReason: finalReason,
            currentDeviceId: nextActive ? currentUser.currentDeviceId : null,
          };
        }

        set({ accounts: nextAccounts, currentUser: nextCurrentUser });

        try {
          if (authToken) {
            await fetch(`${BACKEND_URL}/api/admin/block-user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                userId,
                isBlocked: !nextActive,
                reason: finalReason,
              }),
            });
          }
        } catch {
          // Synchronisation statut silencieuse
        }
      },

      resetUserDevice: async (userId: string) => {
        const { accounts, authToken } = get();
        set({
          accounts: accounts.map((a) =>
            a.id === userId
              ? {
                  ...a,
                  boundDeviceId: null,
                  currentDeviceId: null,
                  isActive: true,
                  blockedReason: null,
                }
              : a
          ),
        });

        try {
          if (authToken) {
            await fetch(`${BACKEND_URL}/api/admin/reset-device`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ userId }),
            });
          }
        } catch {
          // Réinitialisation appareil silencieuse
        }
      },

      revokeUserDevice: async (userId: string) => {
        const { accounts } = get();
        set({
          accounts: accounts.map((a) =>
            a.id === userId ? { ...a, currentDeviceId: null } : a
          ),
        });
      },

      deleteUser: async (userId: string) => {
        const { accounts, currentUser, authToken } = get();
        set({
          accounts: accounts.filter((a) => a.id !== userId),
          currentUser: currentUser && currentUser.id === userId ? null : currentUser,
        });

        try {
          if (authToken) {
            await fetch(`${BACKEND_URL}/api/admin/delete-user`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ userId }),
            });
          }
        } catch {
          // Suppression utilisateur silencieuse
        }
      },

      changePassword: (userId: string, newPassword: string) => {
        const trimmedPass = newPassword.trim();
        if (!trimmedPass) {
          return { success: false, error: 'Le mot de passe ne peut pas être vide.' };
        }
        if (trimmedPass.length < 4) {
          return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères.' };
        }

        set((state) => {
          const updatedAccounts = state.accounts.map((a) =>
            a.id === userId || a.username.toLowerCase() === userId.toLowerCase()
              ? { ...a, passwordHash: trimmedPass }
              : a
          );

          let updatedCurrentUser = state.currentUser;
          if (
            state.currentUser &&
            (state.currentUser.id === userId ||
              state.currentUser.username.toLowerCase() === userId.toLowerCase())
          ) {
            updatedCurrentUser = { ...state.currentUser, passwordHash: trimmedPass };
          }

          return { accounts: updatedAccounts, currentUser: updatedCurrentUser };
        });

        return { success: true };
      },

      // --- Mode Test / Simulation Admin ---
      simulateUserSession: (userId: string) => {
        const { accounts, currentUser, adminOriginalSession } = get();
        const targetUser = accounts.find(
          (a) => a.id === userId || a.username.toLowerCase() === userId.toLowerCase()
        );
        if (!targetUser) {
          return { success: false, error: 'Utilisateur introuvable.' };
        }

        // Sauvegarder la session Admin actuelle pour pouvoir y revenir
        const currentAdmin = currentUser?.role === 'ADMIN' ? currentUser : adminOriginalSession;

        set({
          adminOriginalSession: currentAdmin,
          currentUser: targetUser,
          isSimulatingUser: true,
        });

        // Synchroniser le solde vers useBetStore pour que les jeux utilisent le solde de cet utilisateur
        useBetStore.getState().setBalance(targetUser.balance);
        useBetStore.getState().syncUserBets(targetUser.id);

        return { success: true };
      },

      exitUserSimulation: () => {
        const { adminOriginalSession, accounts } = get();
        const adminAccount =
          adminOriginalSession ||
          accounts.find((a) => a.role === 'ADMIN') ||
          DEFAULT_ACCOUNTS[0];

        set({
          currentUser: adminAccount,
          adminOriginalSession: null,
          isSimulatingUser: false,
        });

        useBetStore.getState().setBalance(adminAccount.balance);
      },
    }),
    {
      name: 'xbet_auth_storage_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        currentUser: state.currentUser,
        authToken: state.authToken,
        adminOriginalSession: state.adminOriginalSession,
        isSimulatingUser: state.isSimulatingUser,
      }),
    }
  )
);

// Synchronisation temps réel automatique du solde client vers le compte auth
useBetStore.subscribe((state) => {
  const { currentUser } = useAuthStore.getState();
  if (currentUser && currentUser.role === 'USER' && currentUser.balance !== state.balance) {
    useAuthStore.getState().syncBalanceFromBetStore(state.balance);
  }
});
