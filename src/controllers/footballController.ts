import { Request, Response } from 'express';
import { apiFootballService } from '../services/apiFootballService';

export const getFootballStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = await apiFootballService.checkAccountStatus();
    res.status(200).json({
      success: true,
      hasApiKey: apiFootballService.hasApiKey(),
      status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut API-Football',
      error: error.message,
    });
  }
};

export const getLeagues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { country, season, current, id } = req.query;
    const leagues = await apiFootballService.getLeagues({
      country: country ? String(country) : undefined,
      season: season ? Number(season) : undefined,
      current: current !== undefined ? current === 'true' : undefined,
      id: id ? Number(id) : undefined,
    });

    res.status(200).json({
      success: true,
      count: leagues.length,
      data: leagues,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des championnats',
      error: error.message,
    });
  }
};

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { league, season } = req.query;
    if (!league) {
      res.status(400).json({
        success: false,
        message: 'Le paramètre "league" (ID du championnat) est requis.',
      });
      return;
    }

    const teams = await apiFootballService.getTeams(
      String(league),
      season ? Number(season) : 2024
    );

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des équipes',
      error: error.message,
    });
  }
};

export const getLiveFixtures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { league } = req.query;
    const fixtures = await apiFootballService.getLiveFixtures(
      league ? String(league) : undefined
    );

    // Convertit aussi en format MatchEvent prêt à l'emploi
    const matchEvents = fixtures.map((f) => apiFootballService.convertFixtureToMatchEvent(f));

    res.status(200).json({
      success: true,
      count: fixtures.length,
      fixtures,
      matchEvents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matchs en direct',
      error: error.message,
    });
  }
};

export const getUpcomingFixtures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { league, next, date } = req.query;
    const fixtures = await apiFootballService.getUpcomingFixtures({
      league: league ? String(league) : undefined,
      next: next ? Number(next) : 20,
      date: date ? String(date) : undefined,
    });

    const matchEvents = fixtures.map((f) => apiFootballService.convertFixtureToMatchEvent(f));

    res.status(200).json({
      success: true,
      count: fixtures.length,
      fixtures,
      matchEvents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des prochains matchs',
      error: error.message,
    });
  }
};

export const getOdds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fixtureId } = req.params;
    if (!fixtureId) {
      res.status(400).json({
        success: false,
        message: 'Le paramètre fixtureId est requis',
      });
      return;
    }

    const odds = await apiFootballService.getOddsForFixture(String(fixtureId));
    res.status(200).json({
      success: true,
      data: odds,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des cotes',
      error: error.message,
    });
  }
};
