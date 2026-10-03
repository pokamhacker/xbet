import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

// Map pour suivre les sockets connectés par utilisateur : userId -> Set<socketId>
const userSocketsMap = new Map<string, Set<string>>();

/**
 * Initialise le gestionnaire Socket.io et configure les écouteurs de connexion
 */
export function initSocketManager(serverIo: SocketIOServer): void {
  io = serverIo;

  io.on('connection', (socket: Socket) => {
    // 1. Récupération de l'identifiant utilisateur (depuis handshake auth ou query)
    const userId =
      (socket.handshake.auth?.userId as string) ||
      (socket.handshake.query?.userId as string);

    if (userId) {
      registerSocketUser(socket, userId);
    }

    // 2. Écoute de l'événement d'enregistrement manuel de l'utilisateur
    socket.on('register_user', (data: { userId: string; deviceId?: string }) => {
      if (data?.userId) {
        registerSocketUser(socket, data.userId);
      }
    });

    // 3. Déconnexion
    socket.on('disconnect', () => {
      handleSocketDisconnect(socket);
    });
  });

  console.log('[SocketManager] Serveur WebSocket initialisé avec succès.');
}

/**
 * Associe un socket à un utilisateur et le fait rejoindre sa chambre dédiée user_${userId}
 */
function registerSocketUser(socket: Socket, userId: string): void {
  const roomName = `user_${userId}`;
  socket.join(roomName);

  if (!userSocketsMap.has(userId)) {
    userSocketsMap.set(userId, new Set());
  }
  userSocketsMap.get(userId)!.add(socket.id);

  // Sauvegarder l'id dans les données du socket
  socket.data.userId = userId;

  console.log(`[SocketManager] Client connecté (Socket: ${socket.id}) a rejoint la chambre : ${roomName}`);
}

/**
 * Nettoie les associations lors de la déconnexion
 */
function handleSocketDisconnect(socket: Socket): void {
  const userId = socket.data?.userId as string | undefined;
  if (userId && userSocketsMap.has(userId)) {
    const sockets = userSocketsMap.get(userId)!;
    sockets.delete(socket.id);
    if (sockets.size === 0) {
      userSocketsMap.delete(userId);
    }
  }
  console.log(`[SocketManager] Socket déconnecté : ${socket.id}`);
}

/**
 * Retourne l'instance Socket.io active
 */
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('[SocketManager] Socket.io n’a pas encore été initialisé.');
  }
  return io;
}

/**
 * Envoie un événement ciblé à la chambre de l'utilisateur : user_${userId}
 */
export function sendToUser(userId: string, event: string, payload: any): void {
  if (!io) {
    console.warn(`[SocketManager] Impossible d'envoyer l'événement ${event} : Socket.io non initialisé.`);
    return;
  }
  const roomName = `user_${userId}`;
  io.to(roomName).emit(event, payload);
  console.log(`[SocketManager] Événement '${event}' émis vers la chambre '${roomName}' :`, payload);
}

/**
 * 1. Single Device Login : Révoque immédiatement toute ancienne session
 * Émet l'événement FORCE_LOGOUT à l'ancienne session
 */
export function forceLogoutUser(userId: string, reason: string = 'NEW_DEVICE_LOGIN'): void {
  sendToUser(userId, 'FORCE_LOGOUT', {
    reason,
    message: 'Une nouvelle session a été ouverte sur un autre appareil. Vous avez été déconnecté.',
    timestamp: new Date().toISOString(),
  });
}

/**
 * 2. Contrôle Admin à Distance : Notification de suspension immédiate
 * Diffuse le signal ACCOUNT_BLOCKED au client visé
 */
export function notifyAccountBlocked(userId: string, reason?: string): void {
  sendToUser(userId, 'ACCOUNT_BLOCKED', {
    isBlocked: true,
    reason: reason || 'Votre compte a été suspendu par un administrateur.',
    message: 'Accès restreint : Votre compte a été temporairement suspendu.',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notification de suppression de compte
 */
export function notifyAccountDeleted(userId: string): void {
  sendToUser(userId, 'ACCOUNT_DELETED', {
    message: 'Votre compte a été supprimé par un administrateur.',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notification de mise à jour du solde
 */
export function notifyBalanceUpdated(userId: string, newBalance: number): void {
  sendToUser(userId, 'BALANCE_UPDATED', {
    balance: newBalance,
    timestamp: new Date().toISOString(),
  });
}
