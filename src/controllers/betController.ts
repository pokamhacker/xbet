import { Request, Response } from 'express';
import { betDatabaseService } from '../services/betDatabaseService';

/**
 * 1. Récupérer les paris d'un utilisateur
 * Route : GET /api/bets ou GET /api/bets/user/:userId
 */
export async function getUserBets(req: Request, res: Response): Promise<void> {
  try {
    const userId =
      req.params.userId ||
      (req.query.userId as string) ||
      (req as any).user?._id?.toString() ||
      (req as any).user?.id;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "L'identifiant de l'utilisateur (userId) est requis.",
      });
      return;
    }

    const bets = await betDatabaseService.getBetsByUserId(userId);

    res.status(200).json({
      success: true,
      userId,
      count: bets.length,
      bets,
    });
  } catch (error) {
    console.error('[BetController] Erreur récupération des paris :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne lors de la récupération des tickets de paris.',
    });
  }
}

/**
 * 2. Créer ou enregistrer un nouveau pari
 * Route : POST /api/bets
 */
export async function createBet(req: Request, res: Response): Promise<void> {
  try {
    const {
      id,
      userId,
      user_id,
      ticketNumber,
      ticket_number,
      type,
      odds,
      stake,
      potentialGains,
      potential_gains,
      actualGains,
      actual_gains,
      status,
      items,
      created_at,
    } = req.body;

    const targetUserId =
      userId ||
      user_id ||
      (req as any).user?._id?.toString() ||
      (req as any).user?.id;

    if (!targetUserId) {
      res.status(400).json({
        success: false,
        error: 'Chaque pari doit obligatoirement être relié à un user_id.',
      });
      return;
    }

    if (!stake || !odds) {
      res.status(400).json({
        success: false,
        error: 'La mise (stake) et la cote totale (odds) sont obligatoires.',
      });
      return;
    }

    const createdBet = await betDatabaseService.createBet({
      id: id || ticketNumber || ticket_number,
      user_id: targetUserId,
      ticket_number: ticketNumber || ticket_number,
      type: type || 'Combiné',
      odds: Number(odds),
      stake: Number(stake),
      potential_gains: Number(potentialGains || potential_gains || Math.round(Number(stake) * Number(odds))),
      actual_gains: Number(actualGains || actual_gains || 0),
      status: status || 'Accepté',
      created_at: created_at || new Date(),
      items: items || [],
    });

    res.status(201).json({
      success: true,
      message: `Pari № ${createdBet.ticket_number} enregistré avec succès.`,
      bet: createdBet,
    });
  } catch (error) {
    console.error('[BetController] Erreur enregistrement du pari :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la sauvegarde du ticket de pari.',
    });
  }
}

/**
 * 3. Récupérer un pari spécifique par ID ou ticket_number
 * Route : GET /api/bets/:id
 */
export async function getBetDetails(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const bet = await betDatabaseService.getBetById(id);

    if (!bet) {
      res.status(404).json({
        success: false,
        error: 'Ticket de pari introuvable.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      bet,
    });
  } catch (error) {
    console.error('[BetController] Erreur détails du pari :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du détail du pari.',
    });
  }
}

/**
 * 4. Mettre à jour le statut global d'un pari (Ex: Cashout / Vendu, Payé, Perdu)
 * Route : PUT /api/bets/:id/status
 */
export async function updateBetStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { status, actualGains, actual_gains } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Le statut du pari est requis.',
      });
      return;
    }

    const updated = await betDatabaseService.updateBetStatus(
      id,
      status,
      actualGains !== undefined ? actualGains : actual_gains
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Ticket de pari introuvable pour mise à jour.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Statut du ticket № ${updated.ticket_number} mis à jour (${status}).`,
      bet: updated,
    });
  } catch (error) {
    console.error('[BetController] Erreur update statut :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du statut du pari.',
    });
  }
}

/**
 * 5. Mettre à jour le score et le statut d'un match (bet_item)
 * Route : PUT /api/bets/:id/items/:itemId
 */
export async function updateBetItemScore(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const itemId = String(req.params.itemId);
    const { finalScore, final_score, itemStatus, item_status, betStatus, bet_status } = req.body;

    const updated = await betDatabaseService.updateBetItemScore(
      id,
      itemId,
      finalScore || final_score || '0-0',
      itemStatus || item_status || 'Gain',
      betStatus || bet_status
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Pari ou élément de pari introuvable.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Score du match mis à jour avec succès.',
      bet: updated,
    });
  } catch (error) {
    console.error('[BetController] Erreur update score match :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la saisie du score du match.',
    });
  }
}

/**
 * 6. Supprimer un ticket de pari
 * Route : DELETE /api/bets/:id
 */
export async function deleteBet(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const success = await betDatabaseService.deleteBet(id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Ticket introuvable ou déjà supprimé.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ticket de pari supprimé de la base de données.',
    });
  } catch (error) {
    console.error('[BetController] Erreur suppression pari :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du pari.',
    });
  }
}

/**
 * 7. Synchronisation en masse (Sync Offline / Online)
 * Route : POST /api/bets/sync
 */
export async function syncUserBets(req: Request, res: Response): Promise<void> {
  try {
    const { userId, user_id, bets } = req.body;
    const targetUserId =
      userId ||
      user_id ||
      (req as any).user?._id?.toString() ||
      (req as any).user?.id;

    if (!targetUserId || !Array.isArray(bets)) {
      res.status(400).json({
        success: false,
        error: 'userId et la liste des tickets (bets: Array) sont requis.',
      });
      return;
    }

    const synced = await betDatabaseService.syncUserBets(targetUserId, bets);

    res.status(200).json({
      success: true,
      message: `${synced.length} tickets synchronisés avec succès.`,
      count: synced.length,
      bets: synced,
    });
  } catch (error) {
    console.error('[BetController] Erreur synchronisation des paris :', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la synchronisation des tickets.',
    });
  }
}
