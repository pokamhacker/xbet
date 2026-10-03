import { Router } from 'express';
import {
  blockUser,
  deleteUser,
  listUsers,
  createUser,
  updateBalance,
  resetDevice,
} from '../controllers/adminController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Toutes les routes admin nécessitent une session active et le rôle ADMIN
router.use(authMiddleware);
router.use(requireAdmin);

// Endpoints d'administration à distance
router.get('/users', listUsers);
router.post('/create-user', createUser);
router.post('/block-user', blockUser);
router.post('/delete-user', deleteUser);
router.delete('/delete-user', deleteUser);
router.post('/update-balance', updateBalance);
router.post('/reset-device', resetDevice);

export default router;
