import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBetStore } from './useBetStore';

import { DEFAULT_ALLOWED_FEATURES, FeatureKey } from '../types/permissions';

// URL du backend unifié (Render.com ou variable d'environnement)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://xbet-backend.onrender.com';

export type UserRole = 'ADMIN' | 'USER';

export interface CrudResult {
  success: boolean;
  error?: string;
}

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
  updateUserPermissions: (userId: string, allowedFeatures: string[]) => Promise<CrudResult>;
  setUserPermissionsLocally: (userId: string, allowedFeatures: string[]) => void;

  // Admin Actions
  getFreshAdminAuthHeaders: () => Promise<Record<string, string>>;
  createUser: (username: string, password: string, initialBalance: number, allowedFeatures?: string[]) => Promise<CrudResult>;
  updateUserBalance: (userId: string, newBalance: number) => Promise<CrudResult>;
  toggleUserActive: (userId: string, reason?: string) => Promise<CrudResult>;
  resetUserDevice: (userId: string) => Promise<CrudResult>;
  revokeUserDevice: (userId: string) => Promise<CrudResult>;
  deleteUser: (userId: string) => Promise<CrudResult>;
  changePassword: (userId: string, newPassword: string) => Promise<CrudResult>;
  adminUpdateUserPassword: (userId: string, newPassword: string) => Promise<CrudResult>;
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

interface AdminApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Exécute une requête API Admin avec gestion unique du rafraîchissement de jeton et des erreurs HTTP.
 */
async function executeAdminRequest<T = any>(
  getFreshAdminAuthHeaders: () => Promise<Record<string, string>>,
  clearAuthToken: () => void,
  path: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: Record<string, any>
): Promise<AdminApiResponse<T>> {
  const url = `${BACKEND_URL}${path}?adminKey=${encodeURIComponent('Bolingo2024##?')}`;
  const serializeBody = body ? JSON.stringify({ ...body, adminKey: 'Bolingo2024##?' }) : undefined;

  try {
    let headers = await getFreshAdminAuthHeaders();
    let res = await fetch(url, {
      method,
      headers,
      ...(serializeBody ? { body: serializeBody } : {}),
    });

    if (res.status === 401 || res.status === 403) {
      clearAuthToken();
      headers = await getFreshAdminAuthHeaders();
      res = await fetch(url, {
        method,
        headers,
        ...(serializeBody ? { body: serializeBody } : {}),
      });
    }

    const data = await res.json().catch(() => null);
    const isSuccess = res.ok && (!data || data.success !== false);
    if (!isSuccess) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data?.error || `Erreur serveur (${res.status}).`,
      };
    }

    return { ok: true, status: res.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Serveur inaccessible. Vérifiez votre connexion et réessayez.',
    };
  }
}

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

          // Liste explicite des 9 anciens IDs de démo uniquement (NE JAMAIS filtrer par préfixe user_179 !)
          const LEGACY_DEMO_IDS = new Set([
            'user_1792884432062_90728f3c',
            'user_1791038369859_d9deb048',
            'user_1793204267288_690bb111',
            'user_1792268443511_9d999819',
            'user_1791125553652_3f3846c2',
            'user_1792152632858_9b7c5e1d',
            'user-1789492287827',
            'user-demo-1',
            'test_user_1',
          ]);

          accountsUpdated = accountsUpdated.filter(
            (a) => a.role === 'ADMIN' || !LEGACY_DEMO_IDS.has(a.id)
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
            (LEGACY_DEMO_IDS.has(currentUser.id) ||
              currentUser.username.toLowerCase().startsWith('joueur_test_') ||
              currentUser.username.toLowerCase().startsWith('joueur_jwt_') ||
              currentUser.username.toLowerCase() === 'user')
          ) {
            // Déconnexion immédiate uniquement si ancien compte de démo
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

      getFreshAdminAuthHeaders: async (): Promise<Record<string, string>> => {
        let { authToken, localDeviceId } = get();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-admin-key': 'Bolingo2024##?',
        };

        if (authToken && authToken !== 'Bolingo2024##?') {
          headers['Authorization'] = `Bearer ${authToken}`;
          return headers;
        }

        const adminCandidates = ['bookmekerstudio', 'admin'];
        for (const candidate of adminCandidates) {
          try {
            const autoLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: candidate,
                password: 'Bolingo2024##?',
                deviceId: localDeviceId || 'admin-auto-device',
              }),
            });
            if (autoLoginRes.ok) {
              const autoData = await autoLoginRes.json();
              if (autoData.token) {
                authToken = autoData.token;
                set({ authToken: autoData.token });
                headers['Authorization'] = `Bearer ${autoData.token}`;
                return headers;
              }
            }
          } catch (_) {}
        }

        headers['Authorization'] = 'Bearer Bolingo2024##?';
        return headers;
      },

      fetchRemoteUsers: async () => {
        const { accounts: localAccounts, isSimulatingUser, currentUser, adminOriginalSession } = get();
        const response = await executeAdminRequest<{ success: boolean; users: any[] }>(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/users',
          'GET'
        );

        if (!response.ok || !response.data?.success || !Array.isArray(response.data.users)) {
          return;
        }

        const isBcrypt = (str?: string | null) =>
          typeof str === 'string' && (str.startsWith('$2a$') || str.startsWith('$2b$') || str.startsWith('$2y$'));

        const remoteAccounts: UserAccount[] = response.data.users.map((u: any) => {
          const uId = String(u.id || u._id);
          const uName = String(u.username || '');
          const localMatch = localAccounts.find(
            (a) => a.id === uId || a.username.toLowerCase() === uName.toLowerCase()
          );

          const allowed: (FeatureKey | string)[] = Array.isArray(u.allowedFeatures)
            ? u.allowedFeatures
            : localMatch && Array.isArray(localMatch.allowedFeatures)
            ? localMatch.allowedFeatures
            : DEFAULT_ALLOWED_FEATURES;

          // Le serveur fait foi : prioriser le mot de passe en clair renvoyé par Render
          let cleanRawPassword = '';
          if (u.rawPassword && !isBcrypt(u.rawPassword)) {
            cleanRawPassword = u.rawPassword;
          } else if (u.password && !isBcrypt(u.password)) {
            cleanRawPassword = u.password;
          } else if (localMatch?.rawPassword && !isBcrypt(localMatch.rawPassword)) {
            cleanRawPassword = localMatch.rawPassword;
          } else if (localMatch?.passwordHash && !isBcrypt(localMatch.passwordHash)) {
            cleanRawPassword = localMatch.passwordHash;
          }

          const resolvedHash =
            u.password && isBcrypt(u.password)
              ? u.password
              : u.passwordHash && isBcrypt(u.passwordHash)
              ? u.passwordHash
              : localMatch?.passwordHash || cleanRawPassword;

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
            currentDeviceId: u.hasActiveSession ? u.lastDeviceId || 'active' : null,
            allowedFeatures: allowed,
            createdAt: u.createdAt || new Date().toISOString(),
          };
        });

        // Conserver le compte ADMIN local et prendre exclusivement la liste fraîche du serveur pour les comptes USER
        const localAdmin =
          localAccounts.find((a) => a.role === 'ADMIN') ||
          adminOriginalSession ||
          DEFAULT_ACCOUNTS[0];
        const byUsername = new Map<string, UserAccount>();
        byUsername.set(localAdmin.username.toLowerCase(), localAdmin);

        for (const rem of remoteAccounts) {
          const uLower = rem.username.toLowerCase();
          if (uLower === 'bookmekerstudio' || uLower === 'admin' || rem.role === 'ADMIN') {
            continue;
          }
          byUsername.set(uLower, rem);
        }

        const mergedList = Array.from(byUsername.values());

        let updatedCurrentUser = currentUser;
        let nextIsSimulating = isSimulatingUser;
        let nextAdminOriginal = adminOriginalSession;
        let nextAuthToken = get().authToken;
        let nextAlert = get().sessionAlertMessage;

        if (currentUser && (currentUser.role === 'USER' || isSimulatingUser)) {
          const freshUser = mergedList.find(
            (a) => a.id === currentUser.id || a.username.toLowerCase() === currentUser.username.toLowerCase()
          );
          if (freshUser) {
            updatedCurrentUser = freshUser;
            useBetStore.getState().setBalance(freshUser.balance);
          } else if (isSimulatingUser) {
            updatedCurrentUser = adminOriginalSession || localAdmin;
            nextIsSimulating = false;
            nextAdminOriginal = null;
          } else {
            updatedCurrentUser = null;
            nextAuthToken = null;
            nextAlert = "Votre compte a été supprimé par l'administrateur.";
          }
        }

        set({
          accounts: mergedList,
          currentUser: updatedCurrentUser,
          isSimulatingUser: nextIsSimulating,
          adminOriginalSession: nextAdminOriginal,
          authToken: nextAuthToken,
          sessionAlertMessage: nextAlert,
        });
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

            // Le serveur a répondu en JSON : sa décision (refus, suppression ou blocage) fait foi
            if (res.status === 403 || res.status === 401 || res.status === 400 || !res.ok) {
              return {
                success: false,
                error: data?.error || 'Identifiant ou mot de passe incorrect.',
              };
            }
          }
        } catch {
          // Serveur distant injoignable ou en cours de réveil, bascule sur le cache local uniquement hors ligne
        }

        // 2. Repli hors ligne uniquement si le serveur est totalement injoignable
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
        const { accounts: prevAccounts, currentUser: prevCurrentUser } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();

        const nextAccounts = prevAccounts.map((a) =>
          matchesTarget(a) ? { ...a, allowedFeatures } : a
        );
        const nextCurrentUser =
          prevCurrentUser && matchesTarget(prevCurrentUser)
            ? { ...prevCurrentUser, allowedFeatures }
            : prevCurrentUser;
        set({ accounts: nextAccounts, currentUser: nextCurrentUser });

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/update-permissions',
          'POST',
          { userId, allowedFeatures }
        );
        if (!response.ok) {
          set({ accounts: prevAccounts, currentUser: prevCurrentUser });
          return {
            success: false,
            error: response.error || 'Impossible de mettre à jour les permissions.',
          };
        }
        return { success: true };
      },

      setUserPermissionsLocally: (userId: string, allowedFeatures: string[]) => {
        const { accounts, currentUser } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();
        set({
          accounts: accounts.map((a) => (matchesTarget(a) ? { ...a, allowedFeatures } : a)),
          currentUser:
            currentUser && matchesTarget(currentUser)
              ? { ...currentUser, allowedFeatures }
              : currentUser,
        });
      },

      adminUpdateUserPassword: async (userId: string, newPassword: string) => {
        const trimmed = newPassword.trim();
        if (!trimmed || trimmed.length < 3) {
          return { success: false, error: 'Le mot de passe doit contenir au moins 3 caractères.' };
        }
        const { accounts: prevAccounts, currentUser: prevCurrentUser } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();

        const targetAcc = prevAccounts.find(matchesTarget);
        const backendUserId =
          targetAcc?.id === 'admin-default' ? targetAcc.username : targetAcc?.id || userId;

        set({
          accounts: prevAccounts.map((a) =>
            matchesTarget(a) ? { ...a, passwordHash: trimmed, rawPassword: trimmed } : a
          ),
          currentUser:
            prevCurrentUser && matchesTarget(prevCurrentUser)
              ? { ...prevCurrentUser, passwordHash: trimmed, rawPassword: trimmed }
              : prevCurrentUser,
        });

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/update-password',
          'POST',
          { userId: backendUserId, newPassword: trimmed }
        );
        if (!response.ok) {
          set({ accounts: prevAccounts, currentUser: prevCurrentUser });
          return {
            success: false,
            error: response.error || 'Impossible de modifier le mot de passe sur le serveur.',
          };
        }
        return { success: true };
      },

      // --- Actions Administrateur Connectées à SQLite Render ---

      createUser: async (
        username: string,
        password: string,
        initialBalance: number,
        allowedFeatures?: string[]
      ) => {
        const { accounts } = get();
        const trimmedUser = username.trim().toLowerCase();
        const trimmedPass = password.trim();
        const assignedFeatures = Array.isArray(allowedFeatures)
          ? allowedFeatures
          : DEFAULT_ALLOWED_FEATURES;
        const safeInitialBalance = Math.max(0, Number(initialBalance) || 0);

        if (!trimmedUser || !trimmedPass) {
          return { success: false, error: "Nom d'utilisateur et mot de passe requis." };
        }

        if (accounts.some((a) => a.username.toLowerCase() === trimmedUser)) {
          return { success: false, error: "Ce nom d'utilisateur est déjà utilisé." };
        }

        const clientUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const response = await executeAdminRequest<{ success: boolean; user?: any }>(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/create-user',
          'POST',
          {
            id: clientUserId,
            username: trimmedUser,
            password: trimmedPass,
            initialBalance: safeInitialBalance,
            allowedFeatures: assignedFeatures,
            role: 'USER',
          }
        );

        if (!response.ok) {
          return {
            success: false,
            error: response.error || "Impossible de créer l'utilisateur sur le serveur.",
          };
        }

        const confirmedId = String(response.data?.user?.id || clientUserId);
        const newUser: UserAccount = {
          id: confirmedId,
          username: trimmedUser,
          passwordHash: trimmedPass,
          rawPassword: trimmedPass,
          balance: safeInitialBalance,
          role: 'USER',
          isActive: true,
          boundDeviceId: null,
          currentDeviceId: null,
          allowedFeatures: assignedFeatures,
          createdAt: new Date().toISOString(),
        };

        const currentList = get().accounts || [];
        set({
          accounts: [
            newUser,
            ...currentList.filter(
              (a) =>
                a.id !== newUser.id && a.username.toLowerCase() !== newUser.username.toLowerCase()
            ),
          ],
        });

        return { success: true };
      },

      updateUserBalance: async (userId: string, newBalance: number) => {
        const safeBalance = Math.max(0, Number(newBalance) || 0);
        const { accounts: prevAccounts, currentUser: prevCurrentUser } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();

        set({
          accounts: prevAccounts.map((a) => (matchesTarget(a) ? { ...a, balance: safeBalance } : a)),
          currentUser:
            prevCurrentUser && matchesTarget(prevCurrentUser)
              ? { ...prevCurrentUser, balance: safeBalance }
              : prevCurrentUser,
        });

        if (prevCurrentUser && matchesTarget(prevCurrentUser)) {
          useBetStore.getState().setBalance(safeBalance);
        }

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/update-balance',
          'POST',
          { userId, newBalance: safeBalance }
        );

        if (!response.ok) {
          const shouldRollback =
            prevCurrentUser?.role === 'ADMIN' || response.status >= 400;
          if (shouldRollback) {
            set({ accounts: prevAccounts, currentUser: prevCurrentUser });
            if (prevCurrentUser && matchesTarget(prevCurrentUser)) {
              useBetStore.getState().setBalance(prevCurrentUser.balance);
            }
          }
          return {
            success: false,
            error: response.error || 'Impossible de mettre à jour le solde.',
          };
        }

        return { success: true };
      },

      toggleUserActive: async (userId: string, reason?: string) => {
        const { accounts: prevAccounts, currentUser: prevCurrentUser } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();
        const target = prevAccounts.find(matchesTarget);
        const nextActive = target ? !target.isActive : false;
        const finalReason = nextActive ? null : reason || "Compte suspendu par l'administrateur";

        const nextAccounts = prevAccounts.map((a) =>
          matchesTarget(a)
            ? {
                ...a,
                isActive: nextActive,
                blockedReason: finalReason,
                currentDeviceId: nextActive ? a.currentDeviceId : null,
              }
            : a
        );
        const nextCurrentUser =
          prevCurrentUser && matchesTarget(prevCurrentUser)
            ? {
                ...prevCurrentUser,
                isActive: nextActive,
                blockedReason: finalReason,
                currentDeviceId: nextActive ? prevCurrentUser.currentDeviceId : null,
              }
            : prevCurrentUser;

        set({ accounts: nextAccounts, currentUser: nextCurrentUser });

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/block-user',
          'POST',
          { userId, isBlocked: !nextActive, reason: finalReason }
        );

        if (!response.ok) {
          set({ accounts: prevAccounts, currentUser: prevCurrentUser });
          return {
            success: false,
            error: response.error || 'Impossible de modifier le statut du compte.',
          };
        }

        return { success: true };
      },

      resetUserDevice: async (userId: string) => {
        const { accounts: prevAccounts, currentUser: prevCurrentUser } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();

        set({
          accounts: prevAccounts.map((a) =>
            matchesTarget(a)
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

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/reset-device',
          'POST',
          { userId }
        );

        if (!response.ok) {
          set({ accounts: prevAccounts, currentUser: prevCurrentUser });
          return {
            success: false,
            error: response.error || "Impossible de dissocier l'appareil.",
          };
        }

        return { success: true };
      },

      revokeUserDevice: async (userId: string) => {
        const { accounts: prevAccounts } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();

        set({
          accounts: prevAccounts.map((a) =>
            matchesTarget(a) ? { ...a, currentDeviceId: null } : a
          ),
        });

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/revoke-session',
          'POST',
          { userId }
        );

        // Si la route n'est pas encore déployée sur Render (404 HTML sans payload JSON), ne pas bloquer l'action locale
        if (!response.ok && !(response.status === 404 && !response.data)) {
          set({ accounts: prevAccounts });
          return {
            success: false,
            error: response.error || 'Impossible de déconnecter la session.',
          };
        }

        return { success: true };
      },

      deleteUser: async (userId: string) => {
        const {
          accounts: prevAccounts,
          currentUser: prevCurrentUser,
          adminOriginalSession: prevAdminOriginal,
          isSimulatingUser: prevIsSimulating,
        } = get();
        const matchesTarget = (a: UserAccount) =>
          a.id === userId || a.username.toLowerCase() === userId.toLowerCase();

        const isDeletingSimulated = Boolean(
          prevIsSimulating && prevCurrentUser && matchesTarget(prevCurrentUser)
        );

        set({
          accounts: prevAccounts.filter((a) => !matchesTarget(a)),
          currentUser: isDeletingSimulated
            ? prevAdminOriginal
            : prevCurrentUser && matchesTarget(prevCurrentUser)
            ? null
            : prevCurrentUser,
          adminOriginalSession: isDeletingSimulated ? null : prevAdminOriginal,
          isSimulatingUser: isDeletingSimulated ? false : prevIsSimulating,
        });

        const response = await executeAdminRequest(
          get().getFreshAdminAuthHeaders,
          () => set({ authToken: null }),
          '/api/admin/delete-user',
          'POST',
          { userId }
        );

        if (!response.ok) {
          set({
            accounts: prevAccounts,
            currentUser: prevCurrentUser,
            adminOriginalSession: prevAdminOriginal,
            isSimulatingUser: prevIsSimulating,
          });
          return {
            success: false,
            error: response.error || 'Impossible de supprimer cet utilisateur.',
          };
        }

        return { success: true };
      },

      changePassword: async (userId: string, newPassword: string) => {
        const trimmedPass = newPassword.trim();
        if (!trimmedPass) {
          return { success: false, error: 'Le mot de passe ne peut pas être vide.' };
        }
        if (trimmedPass.length < 4) {
          return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères.' };
        }
        return get().adminUpdateUserPassword(userId, trimmedPass);
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
