import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'xbet_secret_jwt_key_2026';

// Extension de l'interface Request d'Express pour inclure l'utilisateur authentifié
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  sessionToken?: string;
}

interface JwtPayload {
  userId: string;
  sessionToken: string;
  role: string;
}

/**
 * Middleware validant l'unicité du sessionToken à chaque requête API HTTP.
 * Garantit qu'un utilisateur n'a qu'un seul appareil / session actif à la fois.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extraction du token depuis l'en-tête Authorization ou x-session-token
    const authHeader = req.headers.authorization;
    const customSessionToken = req.headers['x-session-token'] as string | undefined;

    let token = '';
    let extractedSessionToken = customSessionToken || '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && !extractedSessionToken) {
      res.status(401).json({
        success: false,
        error: 'Accès non autorisé : Token de session manquant.',
        code: 'TOKEN_MISSING',
      });
      return;
    }

    let userId = '';

    // 2. Décodage du token JWT ou utilisation directe du sessionToken
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        userId = decoded.userId;
        extractedSessionToken = decoded.sessionToken || extractedSessionToken;
      } catch (jwtErr) {
        // Si le token n'est pas un JWT, on le traite comme un sessionToken brut
        extractedSessionToken = token;
      }
    }

    // 3. Recherche de l'utilisateur dans la base de données
    let user: IUser | null = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (extractedSessionToken) {
      user = await User.findOne({ sessionToken: extractedSessionToken });
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur introuvable ou session expirée.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // 4. Contrôle de suspension / blocage par l'Administrateur
    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé : Votre compte a été suspendu par un administrateur.',
        code: 'ACCOUNT_BLOCKED',
      });
      return;
    }

    // 5. CONTRÔLE CRITIQUE SINGLE-DEVICE : Validation stricte de l'unicité du sessionToken
    // Si le token envoyé ne correspond plus au sessionToken actif en BDD, la session a été révoquée
    if (!user.sessionToken || user.sessionToken !== extractedSessionToken) {
      res.status(401).json({
        success: false,
        error: 'Session révoquée : Une nouvelle connexion a eu lieu sur un autre appareil.',
        code: 'SESSION_REVOKED',
      });
      return;
    }

    // Attacher l'utilisateur et le sessionToken à la requête
    req.user = user;
    req.sessionToken = extractedSessionToken;
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Erreur de validation de session :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la validation de la session.',
    });
  }
}

/**
 * Middleware réservé aux Administrateurs
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Accès refusé : Privilèges Administrateur requis.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
    return;
  }
  next();
}
