import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { forceLogoutUser } from '../sockets/socketManager';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'xbet_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '30d';

/**
 * Route de connexion (Single Device / Single Session Login)
 * - Génère un sessionToken unique
 * - Émet l'événement Socket.io FORCE_LOGOUT à toute session précédente
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, deviceId } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: "Le nom d'utilisateur et le mot de passe sont requis.",
      });
      return;
    }

    // 1. Recherche de l'utilisateur
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Identifiants incorrects.',
      });
      return;
    }

    // 2. Vérification du blocage / suspension
    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        error: user.blockedReason
          ? `Compte bloqué : ${user.blockedReason}. Veuillez contacter l'administrateur pour débloquer votre accès.`
          : "Votre compte a été suspendu par un administrateur. Veuillez contacter l'administrateur pour débloquer votre accès.",
        code: 'ACCOUNT_BLOCKED',
        reason: user.blockedReason || null,
      });
      return;
    }

    // 3. Vérification du mot de passe
    // Supporte à la fois bcrypt et les mots de passe simples pour compatibilité
    let isPasswordValid = false;
    if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      isPasswordValid = user.passwordHash === password;
    }

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Identifiants incorrects.',
      });
      return;
    }

    // 4. CONTRÔLE STRICT MONO-APPAREIL (1 Compte = 1 Seul Appareil)
    // Règle : Si l'utilisateur essaie de se connecter sur un autre appareil,
    // son compte est DIRECTEMENT BLOQUÉ et il doit contacter l'administrateur pour le débloquer !
    if (user.role === 'USER') {
      const incomingDeviceId = deviceId ? String(deviceId).trim() : null;
      const registeredDeviceId = user.boundDeviceId ? String(user.boundDeviceId).trim() : null;

      if (registeredDeviceId && incomingDeviceId && registeredDeviceId !== incomingDeviceId) {
        console.warn(
          `[AuthController] Sécurité : Tentative de connexion de "${user.username}" sur un appareil non autorisé (${incomingDeviceId} au lieu de ${registeredDeviceId}). Blocage immédiat du compte.`
        );

        user.isBlocked = true;
        user.blockedReason = 'Tentative de connexion sur un autre appareil non autorisé';
        user.sessionToken = null;
        await user.save();

        // Expulser immédiatement toute session existante via WebSockets
        forceLogoutUser(user._id.toString(), 'ACCOUNT_BLOCKED');

        res.status(403).json({
          success: false,
          code: 'DEVICE_MISMATCH_BLOCKED',
          error:
            "Sécurité : Ce compte est lié à un autre appareil. Votre compte a été automatiquement BLOQUÉ suite à cette tentative. Veuillez contacter l'administrateur pour débloquer votre compte.",
        });
        return;
      }

      // Si le compte n'a pas encore d'appareil lié (1ère connexion ou après réinitialisation par l'admin)
      if (!user.boundDeviceId && incomingDeviceId) {
        user.boundDeviceId = incomingDeviceId;
        console.log(`[AuthController] Appareil ${incomingDeviceId} lié avec succès au compte "${user.username}".`);
      }
    }

    // 5. RÉVOCATION DE SESSION MONO-APPAREIL (Single Session Token)
    const previousSessionToken = user.sessionToken;
    if (previousSessionToken) {
      console.log(`[AuthController] Révocation de l'ancienne session pour l'utilisateur ${user.username} (${user._id})`);
      forceLogoutUser(user._id.toString(), 'NEW_DEVICE_LOGIN');
    }

    // 6. Génération d'un nouveau sessionToken unique et aléatoire
    const newSessionToken = `sess_${crypto.randomBytes(24).toString('hex')}_${Date.now()}`;

    // 7. Mise à jour de l'utilisateur avec la nouvelle session
    user.sessionToken = newSessionToken;
    user.lastDeviceId = deviceId || user.boundDeviceId || null;
    user.lastLoginAt = new Date();
    await user.save();

    // 7. Génération du JWT incluant le sessionToken
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
        sessionToken: newSessionToken,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      sessionToken: newSessionToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        balance: user.balance,
        isBlocked: user.isBlocked,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('[AuthController] Erreur lors de la connexion :', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la connexion.',
    });
  }
}

/**
 * Route de déconnexion
 * Révoque le sessionToken en base de données
 */
export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user) {
      req.user.sessionToken = null;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie.',
    });
  } catch (error) {
    console.error('[AuthController] Erreur lors de la déconnexion :', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion.',
    });
  }
}

/**
 * Récupère le profil de l'utilisateur actuellement connecté
 */
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Non authentifié.' });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role,
      balance: req.user.balance,
      isBlocked: req.user.isBlocked,
      lastLoginAt: req.user.lastLoginAt,
    },
  });
}
