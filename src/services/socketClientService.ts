import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useBetStore } from '../store/useBetStore';

// URL du backend unifié (Render.com ou variable d'environnement)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://xbet-backend.onrender.com';

let socketInstance: Socket | null = null;

function registerActiveSocketUser(socket: Socket): void {
  const { currentUser, localDeviceId, isSimulatingUser } = useAuthStore.getState();
  if (currentUser?.id && !isSimulatingUser) {
    socket.emit('register_user', {
      userId: currentUser.id,
      deviceId: localDeviceId,
    });
  }
}

function resolveForceLogoutMessage(payload: { reason?: string; message?: string } | undefined): string {
  const reason = payload?.reason;
  const serverMsg = payload?.message || '';

  if (reason === 'ACCOUNT_BLOCKED') {
    if (serverMsg && !serverMsg.toLowerCase().includes('autre appareil')) {
      return serverMsg;
    }
    return "Votre compte a été suspendu par l'administrateur. Déconnexion immédiate.";
  }
  if (reason === 'ACCOUNT_DELETED') {
    return "Votre compte a été supprimé par l'administrateur.";
  }
  if (reason === 'DEVICE_RESET') {
    return "L'appareil lié à votre compte a été dissocié par l'administrateur. Veuillez vous reconnecter.";
  }
  if (reason === 'ADMIN_FORCE_LOGOUT') {
    return "Votre session a été déconnectée par l'administrateur.";
  }

  return serverMsg || "Session expirée : Ce compte s'est connecté sur un autre appareil.";
}

/**
 * Obtient ou initialise l'instance client Socket.io
 */
export function getSocketClient(): Socket {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    socketInstance.on('connect_error', () => {
      // Ignorer silencieusement les erreurs transitoires ; la reconnexion automatique reprendra
    });

    socketInstance.on('connect', () => {
      if (socketInstance) {
        registerActiveSocketUser(socketInstance);
      }
      useAuthStore.getState().verifyRemoteSession();
    });

    socketInstance.on('disconnect', () => {
      // Déconnexion silencieuse
    });

    // 1. Écoute du signal de suspension instantanée par l'Admin
    socketInstance.on('ACCOUNT_BLOCKED', (payload: { isBlocked: boolean; reason?: string; message?: string }) => {
      const auth = useAuthStore.getState();
      if (auth.currentUser?.role === 'ADMIN' && !auth.isSimulatingUser) return;

      const alertMessage = payload?.reason
        ? `Compte bloqué : ${payload.reason}. Déconnexion immédiate.`
        : "Votre compte a été suspendu par l'administrateur. Déconnexion immédiate.";

      auth.logout();
      useAuthStore.setState({ sessionAlertMessage: alertMessage });
    });

    // 2. Écoute de l'expulsion de session (Single Device / Admin)
    socketInstance.on('FORCE_LOGOUT', (payload: { reason?: string; message?: string }) => {
      const auth = useAuthStore.getState();
      if (auth.currentUser?.role === 'ADMIN' && !auth.isSimulatingUser) return;

      const existingAlert = auth.sessionAlertMessage;
      if (auth.currentUser) {
        auth.logout();
      }

      // Ne jamais écraser le motif précis déjà reçu par ACCOUNT_BLOCKED ou ACCOUNT_DELETED
      if (
        (payload?.reason === 'ACCOUNT_BLOCKED' || payload?.reason === 'ACCOUNT_DELETED') &&
        existingAlert
      ) {
        useAuthStore.setState({ sessionAlertMessage: existingAlert });
        return;
      }

      useAuthStore.setState({
        sessionAlertMessage: resolveForceLogoutMessage(payload),
      });
    });

    // 3. Écoute de la suppression de compte
    socketInstance.on('ACCOUNT_DELETED', (payload: { message?: string }) => {
      const auth = useAuthStore.getState();
      if (auth.currentUser?.role === 'ADMIN' && !auth.isSimulatingUser) return;

      auth.logout();
      useAuthStore.setState({
        sessionAlertMessage:
          payload?.message || "Votre compte a été supprimé par l'administrateur.",
      });
    });

    // 4. Écoute des mises à jour de solde en direct
    socketInstance.on('BALANCE_UPDATED', (payload: { balance: number }) => {
      const { currentUser, syncBalanceFromBetStore } = useAuthStore.getState();
      if (currentUser?.id && typeof payload?.balance === 'number') {
        syncBalanceFromBetStore(payload.balance);
        useBetStore.getState().setBalance(payload.balance);
      }
    });

    // 5. Écoute des mises à jour d'accès aux studios et mini-jeux en direct
    socketInstance.on('PERMISSIONS_UPDATED', (payload: { allowedFeatures: any }) => {
      const { currentUser } = useAuthStore.getState();
      if (currentUser?.id && Array.isArray(payload.allowedFeatures)) {
        useAuthStore.getState().setUserPermissionsLocally(currentUser.id, payload.allowedFeatures);
      }
    });
  }

  return socketInstance;
}

/**
 * Hook React pour synchroniser automatiquement la session utilisateur avec Socket.io
 * et re-vérifier le statut serveur dès le retour au premier plan / reconnexion réseau.
 */
export function useSocketSync(): void {
  const currentUser = useAuthStore((s) => s.currentUser);
  const localDeviceId = useAuthStore((s) => s.localDeviceId);
  const isSimulatingUser = useAuthStore((s) => s.isSimulatingUser);

  useEffect(() => {
    if (!currentUser?.id || isSimulatingUser) {
      if (socketInstance && socketInstance.connected) {
        socketInstance.disconnect();
      }
      return;
    }

    const socket = getSocketClient();
    if (!socket.connected) {
      socket.connect();
    } else {
      registerActiveSocketUser(socket);
    }

    useAuthStore.getState().verifyRemoteSession();

    const syncOnResume = () => {
      const activeSocket = getSocketClient();
      if (!activeSocket.connected) {
        activeSocket.connect();
      } else {
        registerActiveSocketUser(activeSocket);
      }
      useAuthStore.getState().verifyRemoteSession();
    };

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncOnResume();
      }
    });

    let cleanupWeb: (() => void) | null = null;
    if (Platform.OS === 'web' && typeof document !== 'undefined' && typeof window !== 'undefined') {
      const onVisibility = () => {
        if (document.visibilityState === 'visible') {
          syncOnResume();
        }
      };
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('online', syncOnResume);
      window.addEventListener('focus', syncOnResume);
      cleanupWeb = () => {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('online', syncOnResume);
        window.removeEventListener('focus', syncOnResume);
      };
    }

    return () => {
      appStateSub.remove();
      if (cleanupWeb) cleanupWeb();
    };
  }, [currentUser?.id, localDeviceId, isSimulatingUser]);
}
