import { Router } from 'express';
import {
  getUserBets,
  createBet,
  getBetDetails,
  updateBetStatus,
  updateBetItemScore,
  deleteBet,
  syncUserBets,
} from '../controllers/betController';

const router = Router();

// 1. Lister les paris d'un utilisateur
router.get('/', getUserBets);
router.get('/user/:userId', getUserBets);

// 2. Créer un nouveau pari
router.post('/', createBet);

// 3. Synchronisation en lot (Sync)
router.post('/sync', syncUserBets);

// 4. Consulter un pari par ID ou ticket_number
router.get('/:id', getBetDetails);

// 5. Mettre à jour le statut du pari
router.put('/:id/status', updateBetStatus);

// 6. Mettre à jour le score d'un événement / match
router.put('/:id/items/:itemId', updateBetItemScore);

// 7. Supprimer un pari
router.delete('/:id', deleteBet);

export default router;
