import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import {
  notifyAccountBlocked,
  notifyAccountDeleted,
  forceLogoutUser,
  notifyBalanceUpdated,
} from '../sockets/socketManager';

/**
 * 1. Suspendre ou débloquer un utilisateur à distance
 * Diffuse instantanément le signal ACCOUNT_BLOCKED au client visé via WebSockets
 * Route : POST /api/admin/block-user
 */
export async function blockUser(req: Request, res: Response): Promise<void> {
  try {
    const { userId, isBlocked = true, reason } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "L'identifiant de l'utilisateur (userId) est requis.",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable.',
      });
      return;
    }

    user.isBlocked = Boolean(isBlocked);

    // Si on bloque l'utilisateur :
    // 1. Révoquer immédiatement son sessionToken en base
    // 2. Diffuser le signal ACCOUNT_BLOCKED via WebSocket à sa chambre user_${userId}
    // 3. Forcer la déconnexion immédiate de l'appareil client
    if (user.isBlocked) {
      user.sessionToken = null;
      user.blockedReason = reason || "Compte suspendu par l'administrateur";
      console.log(`[AdminController] Suspension du compte ${user.username} (${user._id}). Émission du signal ACCOUNT_BLOCKED.`);

      notifyAccountBlocked(user._id.toString(), reason);
      forceLogoutUser(user._id.toString(), 'ACCOUNT_BLOCKED');
    } else {
      user.blockedReason = null;
      console.log(`[AdminController] Déblocage du compte ${user.username} (${user._id}) par l'administrateur.`);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? `Le compte de ${user.username} a été suspendu avec succès.`
        : `Le compte de ${user.username} a été réactivé.`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        boundDeviceId: user.boundDeviceId,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error('[AdminController] Erreur lors du blocage de l’utilisateur :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la modification du statut utilisateur.',
    });
  }
}

/**
 * 2. Supprimer un utilisateur à distance
 * Notifie l'utilisateur visé et supprime son compte de la base de données
 * Route : POST /api/admin/delete-user ou DELETE /api/admin/delete-user
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.body.userId || req.query.userId || req.params.userId;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "L'identifiant de l'utilisateur (userId) est requis.",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable.',
      });
      return;
    }

    // Protection : empêcher la suppression d'un compte Administrateur
    if (user.role === 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Impossible de supprimer un compte Administrateur.',
      });
      return;
    }

    // Émettre les signaux de blocage et suppression avant la destruction
    notifyAccountBlocked(user._id.toString(), 'Votre compte a été supprimé par un administrateur.');
    notifyAccountDeleted(user._id.toString());
    forceLogoutUser(user._id.toString(), 'ACCOUNT_DELETED');

    await User.findByIdAndDelete(userId);
    console.log(`[AdminController] Utilisateur ${user.username} (${userId}) supprimé.`);

    res.status(200).json({
      success: true,
      message: `L'utilisateur ${user.username} a été supprimé avec succès.`,
    });
  } catch (error) {
    console.error('[AdminController] Erreur lors de la suppression de l’utilisateur :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la suppression de l’utilisateur.',
    });
  }
}

/**
 * 3. Lister tous les utilisateurs
 * Route : GET /api/admin/users
 */
export async function listUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const formattedUsers = users.map((u) => ({
      id: u._id,
      username: u.username,
      role: u.role,
      balance: u.balance,
      isBlocked: u.isBlocked,
      blockedReason: u.blockedReason || null,
      boundDeviceId: u.boundDeviceId || null,
      hasActiveSession: Boolean(u.sessionToken),
      lastDeviceId: u.lastDeviceId,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    res.status(200).json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
      activeSessions: formattedUsers.filter((u) => u.hasActiveSession).length,
      blockedCount: formattedUsers.filter((u) => u.isBlocked).length,
    });
  } catch (error) {
    console.error('[AdminController] Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récupération des utilisateurs.',
    });
  }
}

/**
 * 4. Créer un nouvel utilisateur
 * Route : POST /api/admin/create-user
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, initialBalance = 0, role = 'USER' } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: "Le nom d'utilisateur et le mot de passe sont requis.",
      });
      return;
    }

    const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "Ce nom d'utilisateur est déjà utilisé.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username: username.trim().toLowerCase(),
      passwordHash,
      balance: Number(initialBalance) || 0,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      isBlocked: false,
      sessionToken: null,
    });

    res.status(201).json({
      success: true,
      message: `Utilisateur ${newUser.username} créé avec succès.`,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        balance: newUser.balance,
        isBlocked: newUser.isBlocked,
      },
    });
  } catch (error) {
    console.error('[AdminController] Erreur lors de la création de l’utilisateur :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la création de l’utilisateur.',
    });
  }
}

/**
 * 5. Mettre à jour le solde d'un utilisateur à distance
 * Route : POST /api/admin/update-balance
 */
export async function updateBalance(req: Request, res: Response): Promise<void> {
  try {
    const { userId, newBalance } = req.body;

    if (!userId || newBalance === undefined || isNaN(Number(newBalance))) {
      res.status(400).json({
        success: false,
        error: "L'identifiant utilisateur et un montant de solde valide sont requis.",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable.',
      });
      return;
    }

    user.balance = Math.max(0, Number(newBalance));
    await user.save();

    // Notifier le client mobile en direct via WebSocket
    notifyBalanceUpdated(user._id.toString(), user.balance);

    res.status(200).json({
      success: true,
      message: `Le solde de ${user.username} a été mis à jour à ${user.balance} F.`,
      balance: user.balance,
    });
  } catch (error) {
    console.error('[AdminController] Erreur lors de la mise à jour du solde :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la mise à jour du solde.',
    });
  }
}

/**
 * 6. Dissocier / Réinitialiser l'appareil d'un utilisateur
 * Permet à l'utilisateur de lier un nouvel appareil lors de sa prochaine connexion (avec autorisation admin)
 * Route : POST /api/admin/reset-device
 */
export async function resetDevice(req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "L'identifiant utilisateur (userId) est requis.",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Utilisateur introuvable.',
      });
      return;
    }

    user.boundDeviceId = null;
    user.sessionToken = null;
    // On débloque aussi le compte si la seule raison était la tentative sur un autre appareil
    if (user.blockedReason === 'Tentative de connexion sur un autre appareil non autorisé') {
      user.isBlocked = false;
      user.blockedReason = null;
    }

    await user.save();

    forceLogoutUser(user._id.toString(), 'DEVICE_RESET');

    console.log(`[AdminController] Appareil dissocié pour le compte ${user.username} (${user._id}).`);

    res.status(200).json({
      success: true,
      message: `L'appareil associé à ${user.username} a été réinitialisé. L'utilisateur pourra enregistrer son nouvel appareil lors de sa prochaine connexion.`,
      user: {
        id: user._id,
        username: user.username,
        boundDeviceId: null,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    console.error('[AdminController] Erreur lors de la réinitialisation de l\'appareil :', error);
    res.status(500).json({
      success: false,
      error: "Erreur interne lors de la réinitialisation de l'appareil.",
    });
  }
}
