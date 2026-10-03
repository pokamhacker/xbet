import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBetStore } from './useBetStore';

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
  localDeviceId: string;
  isInitialized: boolean;
  sessionAlertMessage: string | null;

  // Lifecycle
  initAuth: () => Promise<void>;
  clearSessionAlert: () => void;

  // Session
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkDeviceSession: () => { valid: boolean; reason?: 'blocked' | 'device_mismatch' | 'deleted' };
  syncBalanceFromBetStore: (newBalance: number) => void;

  // Admin Actions
  createUser: (username: string, password: string, initialBalance: number) => { success: boolean; error?: string };
  updateUserBalance: (userId: string, newBalance: number) => void;
  toggleUserActive: (userId: string, reason?: string) => void;
  resetUserDevice: (userId: string) => void;
  revokeUserDevice: (userId: string) => void;
  deleteUser: (userId: string) => void;
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
      localDeviceId: '',
      isInitialized: false,
      sessionAlertMessage: null,

      initAuth: async () => {
        try {
          // 1. Get or generate persistent unique device ID
          let deviceId = await AsyncStorage.getItem(DEVICE_STORAGE_KEY);
          if (!deviceId) {
            deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await AsyncStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
          }

          // 2. Ensure default accounts exist and migrate ADMIN credentials
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

          // Ensure BookmekerStudio is present as ADMIN
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

          const { currentUser } = get();
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

          // 3. Verify active session if any
          if (updatedCurrentUser) {
            const check = get().checkDeviceSession();
            if (check.valid && updatedCurrentUser.role === 'USER') {
              // Sync balance to useBetStore
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

      clearSessionAlert: () => {
        set({ sessionAlertMessage: null });
      },

      login: async (username: string, password: string) => {
        const { accounts, localDeviceId } = get();
        const trimmedUser = username.trim().toLowerCase();
        const trimmedPass = password.trim();

        if (!trimmedUser || !trimmedPass) {
          return { success: false, error: 'Veuillez saisir votre identifiant et mot de passe.' };
        }

        const account = accounts.find((a) => a.username.toLowerCase() === trimmedUser);
        if (!account) {
          return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
        }

        if (account.passwordHash !== trimmedPass) {
          return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
        }

        if (!account.isActive) {
          return {
            success: false,
            error: account.blockedReason
              ? `Compte bloqué : ${account.blockedReason}. Veuillez contacter l'administrateur pour débloquer votre accès.`
              : "Ce compte a été suspendu par l'administrateur. Veuillez contacter l'administrateur pour débloquer votre accès.",
          };
        }

        // CONTRÔLE STRICT MONO-APPAREIL (1 Compte = 1 Seul Appareil)
        // Règle : Si l'utilisateur essaie de se connecter sur un autre appareil,
        // son compte est DIRECTEMENT BLOQUÉ et il doit contacter l'administrateur pour le débloquer !
        if (account.role === 'USER') {
          const registeredDevice = account.boundDeviceId || account.currentDeviceId;
          if (registeredDevice && registeredDevice !== localDeviceId) {
            // BLOQUER IMMÉDIATEMENT LE COMPTE
            const blockedAccount: UserAccount = {
              ...account,
              isActive: false,
              blockedReason: 'Tentative de connexion sur un autre appareil non autorisé',
              currentDeviceId: null,
            };

            const updatedAccounts = accounts.map((a) =>
              a.id === account.id ? blockedAccount : a
            );

            set({
              accounts: updatedAccounts,
              currentUser: null,
            });

            return {
              success: false,
              error:
                "Sécurité : Ce compte est lié à un autre appareil. Votre compte a été automatiquement BLOQUÉ suite à cette tentative non autorisée. Veuillez contacter l'administrateur pour débloquer votre compte.",
            };
          }
        }

        // Appareil autorisé ou premier enregistrement de l'appareil
        const updatedAccount: UserAccount = {
          ...account,
          boundDeviceId: account.boundDeviceId || localDeviceId,
          currentDeviceId: localDeviceId,
          blockedReason: null,
        };

        const updatedAccounts = accounts.map((a) =>
          a.id === account.id ? updatedAccount : a
        );

        set({
          accounts: updatedAccounts,
          currentUser: updatedAccount,
          sessionAlertMessage: null,
        });

        // If USER, sync balance to useBetStore
        if (updatedAccount.role === 'USER') {
          useBetStore.getState().setBalance(updatedAccount.balance);
          useBetStore.getState().syncUserBets(updatedAccount.id);
        }

        return { success: true };
      },

      logout: () => {
        const { currentUser, accounts, localDeviceId } = get();
        if (currentUser) {
          // If logging out explicitly, clear currentDeviceId if it matches this device
          const updatedAccounts = accounts.map((a) => {
            if (a.id === currentUser.id && a.currentDeviceId === localDeviceId) {
              return { ...a, currentDeviceId: null };
            }
            return a;
          });
          set({ accounts: updatedAccounts, currentUser: null });
        } else {
          set({ currentUser: null });
        }
      },

      checkDeviceSession: () => {
        const { currentUser, accounts, localDeviceId } = get();
        if (!currentUser) return { valid: true };

        const freshAccount = accounts.find((a) => a.id === currentUser.id);

        // Account was deleted
        if (!freshAccount) {
          get().logout();
          set({
            sessionAlertMessage:
              'Votre compte a été supprimé par l\'administrateur.',
          });
          return { valid: false, reason: 'deleted' };
        }

        // Account was blocked
        if (!freshAccount.isActive) {
          get().logout();
          set({
            sessionAlertMessage: freshAccount.blockedReason
              ? `Compte bloqué : ${freshAccount.blockedReason}. Déconnexion immédiate.`
              : 'Votre compte a été suspendu par l\'administrateur. Déconnexion immédiate.',
          });
          return { valid: false, reason: 'blocked' };
        }

        // Mono-device check: another device logged in
        if (freshAccount.currentDeviceId && freshAccount.currentDeviceId !== localDeviceId) {
          get().logout();
          set({
            sessionAlertMessage:
              'Session expirée : Ce compte s\'est connecté sur un autre appareil.',
          });
          return { valid: false, reason: 'device_mismatch' };
        }

        // Keep local balance updated if Admin changed it
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

      createUser: (username: string, password: string, initialBalance: number) => {
        const { accounts } = get();
        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

        if (!trimmedUser || !trimmedPass) {
          return { success: false, error: 'Nom d\'utilisateur et mot de passe requis.' };
        }

        if (accounts.some((a) => a.username.toLowerCase() === trimmedUser.toLowerCase())) {
          return { success: false, error: `Le nom d'utilisateur "${trimmedUser}" existe déjà.` };
        }

        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(
          now.getMonth() + 1
        ).padStart(2, '0')}.${now.getFullYear()} (${String(now.getHours()).padStart(
          2,
          '0'
        )}:${String(now.getMinutes()).padStart(2, '0')})`;

        const newUser: UserAccount = {
          id: `user-${Date.now()}`,
          username: trimmedUser,
          passwordHash: trimmedPass,
          balance: Math.max(0, initialBalance || 0),
          role: 'USER',
          isActive: true,
          currentDeviceId: null,
          createdAt: dateStr,
        };

        set({
          accounts: [...accounts, newUser],
        });

        return { success: true };
      },

      updateUserBalance: (userId: string, newBalance: number) => {
        const safeBalance = Math.max(0, newBalance);
        set((state) => {
          const updatedAccounts = state.accounts.map((a) =>
            a.id === userId ? { ...a, balance: safeBalance } : a
          );

          let updatedCurrentUser = state.currentUser;
          if (state.currentUser && state.currentUser.id === userId) {
            updatedCurrentUser = { ...state.currentUser, balance: safeBalance };
            useBetStore.getState().setBalance(safeBalance);
          }

          return { accounts: updatedAccounts, currentUser: updatedCurrentUser };
        });
      },

      toggleUserActive: (userId: string, reason?: string) => {
        set((state) => {
          const updatedAccounts = state.accounts.map((a) => {
            if (a.id === userId) {
              const nextActive = !a.isActive;
              return {
                ...a,
                isActive: nextActive,
                blockedReason: nextActive ? null : (reason || "Compte suspendu par l'administrateur"),
                // If deactivated, revoke current session immediately
                currentDeviceId: nextActive ? a.currentDeviceId : null,
              };
            }
            return a;
          });

          return { accounts: updatedAccounts };
        });
      },

      resetUserDevice: (userId: string) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === userId
              ? {
                  ...a,
                  boundDeviceId: null,
                  currentDeviceId: null,
                  isActive: true, // Réactive le compte pour permettre la connexion sur le nouvel appareil
                  blockedReason: null,
                }
              : a
          ),
        }));
      },

      revokeUserDevice: (userId: string) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === userId ? { ...a, currentDeviceId: null } : a
          ),
        }));
      },

      deleteUser: (userId: string) => {
        set((state) => {
          const updatedAccounts = state.accounts.filter((a) => a.id !== userId);
          let updatedCurrentUser = state.currentUser;
          if (state.currentUser && state.currentUser.id === userId) {
            updatedCurrentUser = null;
          }
          return { accounts: updatedAccounts, currentUser: updatedCurrentUser };
        });
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
