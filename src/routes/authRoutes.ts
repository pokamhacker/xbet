import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Routes publiques
router.post('/login', login);

// Routes protégées par authMiddleware (validation de sessionToken unique)
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

export default router;
