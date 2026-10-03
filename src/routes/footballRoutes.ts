import { Router } from 'express';
import {
  getFootballStatus,
  getLeagues,
  getTeams,
  getLiveFixtures,
  getUpcomingFixtures,
  getOdds,
} from '../controllers/footballController';

const router = Router();

// Statut du compte et quotas API-Football
router.get('/status', getFootballStatus);

// Championnats et ligues
router.get('/leagues', getLeagues);

// Équipes d'une ligue
router.get('/teams', getTeams);

// Matchs en direct
router.get('/fixtures/live', getLiveFixtures);

// Matchs à venir programmés
router.get('/fixtures/upcoming', getUpcomingFixtures);

// Cotes pour un match
router.get('/odds/:fixtureId', getOdds);

export default router;
