import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBetStore } from './useBetStore';

// URL du backend (Railway ou variable d'environnement)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://web-production-4a2e0b.up.railway.app';

export type UserRole = 'ADMIN' | 'USER';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  balance: number;
  role: UserRole;
  isActive: boolean;
  blockedReason?: string | null;
  boundDeviceId?: string | null;
  currentDeviceId: string | null;
  createdAt: string;
}

interface AuthState {
  accounts: UserAccount[];
  currentUser: UserAccount | null;
  authToken: string | null;
  localDeviceId: string;
  isInitialized: boolean;
  sessionAlertMessage: string | null;

  // Lifecycle
  initAuth: () => Promise<void>;
  fetchRemoteUsers: () => Promise<void>;
  clearSessionAlert: () => void;

  // Session
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkDeviceSession: () => { valid: boolean; reason?: 'blocked' | 'device_mismatch' | 'deleted' };
  syncBalanceFromBetStore: (newBalance: number) => void;

  // Admin Actions
  createUser: (username: string, password: string, initialBalance: number) => Promise<{ success: boolean; error?: string }>;
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>;
  toggleUserActive: (userId: string, reason?: string) => Promise<void>;
  resetUserDevice: (userId: string) => Promise<void>;
  revokeUserDevice: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  changePassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'admin-default',
    username: 'BookmekerStudio',
    passwordHash: 'Bolingo2024##?',
    balance: 0,
    role: 'ADMIN',
    isActive: true,
    currentDeviceId: null,
    createdAt: '01.01.2026 (00:00)',
  },
  {
    id: 'user-demo-1',
    username: 'user',
    passwordHash: 'user123',
    balance: 50000,
    role: 'USER',
    isActive: true,
    currentDeviceId: null,
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

          DEFAULT_ACCOUNTS.forEach((defAcc) => {
            const exists = accountsUpdated.some(
              (a) => a.username.toLowerCase() === defAcc.username.toLowerCase()
            );
            if (!exists) {
              accountsUpdated.push(defAcc);
            }
          });

          const { currentUser, authToken } = get();
          let updatedCurrentUser = currentUser;
          if (currentUser && (currentUser.role === 'ADMIN' || currentUser.id === 'admin-default' || currentUser.username.toLowerCase() === 'admin')) {
            updatedCurrentUser = {
              ...currentUser,
              username: 'BookmekerStudio',
              passwordHash: 'Bolingo2024##?',
            };
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
              } catch (e) {
                console.warn('[AuthStore] Auto-login admin token error :', e);
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
        const { authToken, currentUser } = get();
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const res = await fetch(`${BACKEND_URL}/api/admin/users`, { headers });
          if (!res.ok) return;

          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            const remoteAccounts: UserAccount[] = data.users.map((u: any) => ({
              id: String(u.id || u._id),
              username: u.username,
              passwordHash: '', // Protégé côté serveur
              balance: Number(u.balance) || 0,
              role: u.role as UserRole,
              isActive: !u.isBlocked,
              blockedReason: u.blockedReason || null,
              boundDeviceId: u.boundDeviceId || null,
              currentDeviceId: u.hasActiveSession ? (u.lastDeviceId || 'active') : null,
              createdAt: u.createdAt || new Date().toISOString(),
            }));

            // Conserver le compte ADMIN local
            const localAdmin = get().accounts.find((a) => a.role === 'ADMIN');
            const mergedList = localAdmin
              ? [
                  localAdmin,
                  ...remoteAccounts.filter(
                    (a) => a.id !== localAdmin.id && a.username.toLowerCase() !== localAdmin.username.toLowerCase()
                  ),
                ]
              : remoteAccounts;

            set({ accounts: mergedList });
          }
        } catch (e) {
          console.warn('[AuthStore] Erreur fetchRemoteUsers :', e);
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

        // 1. Connexion en direct sur le serveur Railway
        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: trimmedUser,
              password: trimmedPass,
              deviceId: localDeviceId,
            }),
          });

          const data = await res.json();

          if (res.status === 200 && data.success && data.user) {
            const sUser = data.user;
            const loggedAccount: UserAccount = {
              id: String(sUser.id || sUser._id),
              username: sUser.username,
              passwordHash: trimmedPass,
              balance: Number(sUser.balance) || 0,
              role: sUser.role as UserRole,
              isActive: !sUser.isBlocked,
              blockedReason: sUser.blockedReason || null,
              boundDeviceId: sUser.boundDeviceId || localDeviceId,
              currentDeviceId: localDeviceId,
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
        } catch (netErr) {
          console.warn('[AuthStore] Serveur Railway indisponible, vérification en cache local :', netErr);
        }

        // 2. Repli de sécurité en local si le serveur est injoignable
        const localAccount = accounts.find(
          (a) => a.username.toLowerCase() === trimmedUser.toLowerCase()
        );
        if (!localAccount || localAccount.passwordHash !== trimmedPass) {
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
        };

        const updatedAccounts = accounts.map((a) => (a.id === localAccount.id ? updatedAccount : a));
        set({
          accounts: updatedAccounts,
          currentUser: updatedAccount,
          sessionAlertMessage: null,
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
          set({ accounts: updatedAccounts, currentUser: null, authToken: null });
        } else {
          set({ currentUser: null, authToken: null });
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

      // --- Actions Administrateur Connectées à Railway SQLite ---

      createUser: async (username: string, password: string, initialBalance: number) => {
        const { accounts, authToken } = get();
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

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
            balance: Math.max(0, initialBalance || 0),
            role: 'USER',
            isActive: true,
            boundDeviceId: null,
            currentDeviceId: null,
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
        } catch (e) {
          console.warn('[AuthStore] Erreur updateUserBalance sync :', e);
        }
      },

      toggleUserActive: async (userId: string, reason?: string) => {
        const { accounts, authToken } = get();
        const target = accounts.find((a) => a.id === userId);
        const nextActive = target ? !target.isActive : false;
        const finalReason = nextActive ? null : (reason || "Compte suspendu par l'administrateur");

        set({
          accounts: accounts.map((a) =>
            a.id === userId
              ? {
                  ...a,
                  isActive: nextActive,
                  blockedReason: finalReason,
                  currentDeviceId: nextActive ? a.currentDeviceId : null,
                }
              : a
          ),
        });

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
        } catch (e) {
          console.warn('[AuthStore] Erreur toggleUserActive sync :', e);
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
        } catch (e) {
          console.warn('[AuthStore] Erreur resetUserDevice sync :', e);
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
        } catch (e) {
          console.warn('[AuthStore] Erreur deleteUser sync :', e);
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
    }),
    {
      name: 'xbet_auth_storage_v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        currentUser: state.currentUser,
        authToken: state.authToken,
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
