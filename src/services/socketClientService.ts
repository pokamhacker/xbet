import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

// URL du backend unifié (Render.com ou variable d'environnement)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'https://xbet-backend.onrender.com';

let socketInstance: Socket | null = null;

/**
 * Obtient ou initialise l'instance client Socket.io
 */
export function getSocketClient(): Socket {
  if (!socketInstance) {
    socketInstance = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect_error', () => {
      // Ignorer silencieusement les erreurs de connexion WebSocket lorsque le serveur distant est en veille
    });

    socketInstance.on('connect', () => {
      const { currentUser, localDeviceId } = useAuthStore.getState();
      if (currentUser?.id) {
        socketInstance?.emit('register_user', {
          userId: currentUser.id,
          deviceId: localDeviceId,
        });
      }
    });

    socketInstance.on('disconnect', () => {
      // Déconnexion silencieuse
    });

    // 1. Écoute du signal de suspension instantanée par l'Admin
    socketInstance.on('ACCOUNT_BLOCKED', (payload: { isBlocked: boolean; reason?: string; message?: string }) => {
      const auth = useAuthStore.getState();
      auth.logout();
      auth.clearSessionAlert();
      useAuthStore.setState({
        sessionAlertMessage: payload.reason
          ? `Compte bloqué : ${payload.reason}. Déconnexion immédiate.`
          : 'Votre compte a été suspendu par l\'administrateur. Déconnexion immédiate.',
      });
    });

    // 2. Écoute de l'expulsion de session (Single Device)
    socketInstance.on('FORCE_LOGOUT', (payload: { message?: string }) => {
      const auth = useAuthStore.getState();
      auth.logout();
      useAuthStore.setState({
        sessionAlertMessage:
          payload.message || 'Session expirée : Ce compte s\'est connecté sur un autre appareil.',
      });
    });

    // 3. Écoute de la suppression de compte
    socketInstance.on('ACCOUNT_DELETED', (payload: { message?: string }) => {
      const auth = useAuthStore.getState();
      auth.logout();
      useAuthStore.setState({
        sessionAlertMessage:
          payload.message || 'Votre compte a été supprimé par l\'administrateur.',
      });
    });

    // 4. Écoute des mises à jour de solde en direct
    socketInstance.on('BALANCE_UPDATED', (payload: { balance: number }) => {
      const { currentUser, updateUserBalance } = useAuthStore.getState();
      if (currentUser?.id) {
        updateUserBalance(currentUser.id, payload.balance);
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
 */
export function useSocketSync(): void {
  const currentUser = useAuthStore((s) => s.currentUser);
  const localDeviceId = useAuthStore((s) => s.localDeviceId);

  useEffect(() => {
    if (!currentUser?.id) {
      if (socketInstance && socketInstance.connected) {
        // En cas de déconnexion de l'utilisateur
      }
      return;
    }

    const socket = getSocketClient();

    // S'enregistrer auprès du serveur pour rejoindre la chambre user_${currentUser.id}
    socket.emit('register_user', {
      userId: currentUser.id,
      deviceId: localDeviceId,
    });
  }, [currentUser?.id, localDeviceId]);
}
