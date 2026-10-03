/**
 * Service API-Football (api-sports.io / v3.football.api-sports.io)
 * Intégration complète pour le chargement des championnats, équipes, matchs en direct et cotes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchEvent } from '../types/bet';
import { SPORTS_CATALOG, Competition, Team, resolveTeamLogo, resolveCompetitionLogo } from '../data/sportsCatalog';

// ---------------------------------------------------------------------------
// 1. Interfaces API-Football v3
// ---------------------------------------------------------------------------

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, any>;
  errors: Record<string, string> | any[];
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

export interface ApiFootballLeagueItem {
  league: {
    id: number;
    name: string;
    type: 'League' | 'Cup';
    logo: string;
  };
  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };
  seasons: Array<{
    year: number;
    start: string;
    end: string;
    current: boolean;
    coverage: any;
  }>;
}

export interface ApiFootballTeamItem {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  venue?: {
    id: number | null;
    name: string | null;
    address: string | null;
    city: string | null;
    capacity: number | null;
    surface: string | null;
    image: string | null;
  };
}

export interface ApiFootballFixtureItem {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string; // "Match Finished", "First Half", "Not Started", etc.
      short: string; // "FT", "1H", "2H", "NS", "LIVE", etc.
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export interface ApiFootballOddsItem {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
  };
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
  };
  update: string;
  bookmakers: Array<{
    id: number;
    name: string; // "1xBet", "Bet365", etc.
    bets: Array<{
      id: number;
      name: string; // "Match Winner", "Goals Over/Under", etc.
      values: Array<{
        value: string; // "Home", "Draw", "Away", "Over 2.5", etc.
        odd: string; // "1.85"
      }>;
    }>;
  }>;
}

// ---------------------------------------------------------------------------
// 2. Configuration & Constantes
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = 'https://v3.football.api-sports.io';
const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes pour ligues & équipes
const LIVE_CACHE_EXPIRY_MS = 30 * 1000; // 30 secondes pour les matchs en direct

// Liste des Ligues Majeures populaires prioritaires avec leurs IDs officiels API-Sports
export const POPULAR_LEAGUE_IDS = [
  2,   // UEFA Champions League
  3,   // UEFA Europa League
  39,  // Premier League (Angleterre)
  140, // La Liga (Espagne)
  135, // Serie A (Italie)
  78,  // Bundesliga (Allemagne)
  61,  // Ligue 1 (France)
  94,  // Primeira Liga (Portugal)
  88,  // Eredivisie (Pays-Bas)
  253, // Major League Soccer (USA)
  71,  // Serie A (Brésil)
  307, // Saudi Pro League (Arabie Saoudite)
  40,  // Championship (Angleterre)
  141, // Segunda División (Espagne)
  62,  // Ligue 2 (France)
  136, // Serie B (Italie)
  79,  // 2. Bundesliga (Allemagne)
  1,   // FIFA World Cup
  4,   // Euro Championship
];

// ---------------------------------------------------------------------------
// 3. Classe du Service API-Football
// ---------------------------------------------------------------------------

class ApiFootballService {
  private apiKey: string = '';
  private baseUrl: string = DEFAULT_BASE_URL;
  private memoryCache: Map<string, { timestamp: number; data: any }> = new Map();

  constructor() {
    this.initCredentials();
  }

  /**
   * Initialise les identifiants depuis les variables d'environnement
   */
  private initCredentials() {
    try {
      const key =
        (typeof process !== 'undefined' && process.env?.API_FOOTBALL_KEY) ||
        (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_FOOTBALL_KEY) ||
        '';

      const url =
        (typeof process !== 'undefined' && process.env?.API_FOOTBALL_BASE_URL) ||
        (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_FOOTBALL_BASE_URL) ||
        DEFAULT_BASE_URL;

      this.apiKey = key;
      this.baseUrl = url.replace(/\/$/, '');
    } catch (e) {
      this.baseUrl = DEFAULT_BASE_URL;
    }
  }

  /**
   * Définit dynamiquement la clé API (ex: saisie dans les paramètres de l'application)
   */
  public setApiKey(key: string) {
    this.apiKey = key.trim();
    if (typeof AsyncStorage !== 'undefined') {
      AsyncStorage.setItem('xbet_api_football_key', this.apiKey).catch(() => {});
    }
  }

  /**
   * Récupère la clé API active
   */
  public getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Vérifie si une clé API est configurée
   */
  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'ta_cle_api_football_ici' && this.apiKey !== 'your_api_sports_key_here');
  }

  /**
   * Effectue un appel générique à l'API-Football avec mise en cache
   */
  private async fetchFromApi<T>(endpoint: string, params: Record<string, string | number | boolean> = {}, cacheTtl: number = CACHE_EXPIRY_MS): Promise<T[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });

    const queryString = query.toString();
    const url = `${this.baseUrl}/${endpoint}${queryString ? `?${queryString}` : ''}`;
    const cacheKey = `api_football_${endpoint}_${queryString}`;

    // 1. Vérification dans le cache mémoire
    const cached = this.memoryCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.timestamp < cacheTtl) {
      return cached.data as T[];
    }

    // 2. Si pas de clé configurée, lever une exception pour basculer vers les fallbacks
    if (!this.hasApiKey()) {
      throw new Error("Clé API-Football non configurée ou en attente d'activation.");
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': this.apiKey,
          'x-rapidapi-key': this.apiKey, // support alternatif pour les abonnements RapidAPI
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP API-Football : ${response.status} ${response.statusText}`);
      }

      const json: ApiFootballResponse<T> = await response.json();

      // Vérifier les erreurs renvoyées par API-Football (ex: quota dépassé)
      if (json.errors) {
        const errorEntries = Object.entries(json.errors);
        if (errorEntries.length > 0) {
          const firstErr = Array.isArray(json.errors) ? json.errors.join(', ') : Object.values(json.errors).join(', ');
          if (firstErr) {
            console.warn('[API-Football] Notification API :', firstErr);
          }
        }
      }

      const data = json.response || [];

      // Sauvegarder dans le cache mémoire
      this.memoryCache.set(cacheKey, { timestamp: now, data });

      return data;
    } catch (error: any) {
      console.warn(`[API-Football] Échec de requête vers ${endpoint} :`, error.message);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Endpoints Principaux
  // ---------------------------------------------------------------------------

  /**
   * Vérifie le statut du compte et les quotas restants
   */
  public async checkAccountStatus(): Promise<{ requests: { current: number; limit_day: number }; subscription: string }> {
    try {
      const res = await this.fetchFromApi<any>('status', {}, 60 * 1000);
      return res[0] || { requests: { current: 0, limit_day: 100 }, subscription: 'Free' };
    } catch (e) {
      return { requests: { current: 0, limit_day: 100 }, subscription: 'Non connecté' };
    }
  }

  /**
   * Récupère la liste des championnats (leagues)
   */
  public async getLeagues(params: { country?: string; season?: number; current?: boolean; id?: number } = {}): Promise<ApiFootballLeagueItem[]> {
    try {
      return await this.fetchFromApi<ApiFootballLeagueItem>('leagues', params, CACHE_EXPIRY_MS);
    } catch (e) {
      // Fallback sur le catalogue local de l'application
      return this.getLocalFallbackLeagues();
    }
  }

  /**
   * Récupère les équipes d'un championnat pour une saison donnée
   */
  public async getTeams(leagueId: number | string, season: number = 2024): Promise<ApiFootballTeamItem[]> {
    try {
      return await this.fetchFromApi<ApiFootballTeamItem>('teams', { league: leagueId, season }, CACHE_EXPIRY_MS);
    } catch (e) {
      // Fallback sur les équipes locales du championnat
      return this.getLocalFallbackTeams(leagueId);
    }
  }

  /**
   * Récupère les matchs en direct (Live Scores)
   */
  public async getLiveFixtures(leagueId?: number | string): Promise<ApiFootballFixtureItem[]> {
    try {
      const params: Record<string, any> = { live: 'all' };
      if (leagueId) params.league = leagueId;
      return await this.fetchFromApi<ApiFootballFixtureItem>('fixtures', params, LIVE_CACHE_EXPIRY_MS);
    } catch (e) {
      return this.getLocalFallbackLiveFixtures();
    }
  }

  /**
   * Récupère les prochains matchs programmés
   */
  public async getUpcomingFixtures(options: { league?: number | string; next?: number; date?: string } = {}): Promise<ApiFootballFixtureItem[]> {
    try {
      const params: Record<string, any> = {};
      if (options.league) params.league = options.league;
      if (options.next) params.next = options.next;
      if (options.date) params.date = options.date;
      if (!options.next && !options.date) params.next = 20;

      return await this.fetchFromApi<ApiFootballFixtureItem>('fixtures', params, 5 * 60 * 1000);
    } catch (e) {
      return this.getLocalFallbackUpcomingFixtures();
    }
  }

  /**
   * Récupère les cotes des bookmakers pour un match (ex: 1xBet, Bet365)
   */
  public async getOddsForFixture(fixtureId: number | string): Promise<ApiFootballOddsItem | null> {
    try {
      const odds = await this.fetchFromApi<ApiFootballOddsItem>('odds', { fixture: fixtureId }, 2 * 60 * 1000);
      return odds[0] || null;
    } catch (e) {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Mappeur vers le Modèle Interne de l'Application (MatchEvent)
  // ---------------------------------------------------------------------------

  /**
   * Convertit un match API-Football en MatchEvent prêt pour les coupons et détails
   */
  public convertFixtureToMatchEvent(fixture: ApiFootballFixtureItem, customOdd?: number): MatchEvent {
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(fixture.fixture.status.short);
    const isFinished = ['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short);

    const homeScore = fixture.goals.home ?? 0;
    const awayScore = fixture.goals.away ?? 0;
    const actualScore = `${homeScore}-${awayScore}`;

    // Calcul ou estimation de cote
    const odd = customOdd || this.estimateMatchOdds(fixture);

    // Formatage de la date en "JJ.MM.AAAA (HH:MM)"
    const matchDate = new Date(fixture.fixture.date);
    const day = String(matchDate.getDate()).padStart(2, '0');
    const month = String(matchDate.getMonth() + 1).padStart(2, '0');
    const year = matchDate.getFullYear();
    const hours = String(matchDate.getHours()).padStart(2, '0');
    const mins = String(matchDate.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}.${month}.${year} (${hours}:${mins})`;

    const homeTeamLogo =
      fixture.teams.home.logo || this.resolveTeamLogo(fixture.teams.home.name) || '';
    const awayTeamLogo =
      fixture.teams.away.logo || this.resolveTeamLogo(fixture.teams.away.name) || '';
    const leagueLogo =
      fixture.league.logo || this.resolveLeagueLogo(fixture.league.name) || '';

    return {
      id: `apifb-${fixture.fixture.id}`,
      sport: 'Football',
      league: fixture.league.name,
      tournamentName: fixture.league.name,
      badge: leagueLogo,
      date: formattedDate,
      homeTeam: {
        name: fixture.teams.home.name,
        logo: homeTeamLogo,
      },
      awayTeam: {
        name: fixture.teams.away.name,
        logo: awayTeamLogo,
      },
      prediction: `V1 (Victoire ${fixture.teams.home.name})`,
      odd,
      status: isFinished ? (homeScore > awayScore ? 'Gain' : 'Perdu') : 'Accepté',
      isLive,
      actualScore,
      gameCategory: 'sports',
    };
  }

  /**
   * Résout le logo officiel API-Football CDN d'un club par son nom ou ID
   */
  public resolveTeamLogo(nameOrId: string): string | null {
    return resolveTeamLogo(nameOrId);
  }

  /**
   * Résout le logo officiel API-Football CDN d'un championnat par son nom ou ID
   */
  public resolveLeagueLogo(nameOrId: string): string | null {
    return resolveCompetitionLogo(nameOrId);
  }

  /**
   * Estime une cote réaliste basée sur les cibles
   */
  private estimateMatchOdds(fixture: ApiFootballFixtureItem): number {
    const base = 1.65 + ((fixture.fixture.id % 200) / 100);
    return Math.round(base * 100) / 100;
  }

  // ---------------------------------------------------------------------------
  // 6. Données de Fallback Locales (Garantit 0 plantage hors-ligne ou sans clé)
  // ---------------------------------------------------------------------------

  private getLocalFallbackLeagues(): ApiFootballLeagueItem[] {
    return SPORTS_CATALOG.filter((c: Competition) => c.sport === 'Football').map((comp: Competition, idx: number) => {
      const idMatch = comp.logo.match(/leagues\/(\d+)\.png/);
      const leagueId = idMatch
        ? parseInt(idMatch[1], 10)
        : parseInt(comp.id.replace(/[^0-9]/g, ''), 10) || (100 + idx);

      return {
        league: {
          id: leagueId,
          name: comp.name,
          type: 'League',
          logo: comp.logo,
        },
        country: {
          name: comp.country || 'International',
          code: null,
          flag: null,
        },
        seasons: [
          {
            year: 2026,
            start: '2026-08-01',
            end: '2027-05-30',
            current: true,
            coverage: {},
          },
        ],
      };
    });
  }

  private getLocalFallbackTeams(leagueId: number | string): ApiFootballTeamItem[] {
    const clean = String(leagueId).trim().toLowerCase();
    const found = SPORTS_CATALOG.find(
      (c: Competition) =>
        c.id.toLowerCase() === clean ||
        c.id.toLowerCase().includes(clean) ||
        c.name.toLowerCase() === clean ||
        c.name.toLowerCase().includes(clean) ||
        c.logo.includes(`/${clean}.png`)
    );

    if (found && found.teams) {
      return found.teams.map((t: Team, idx: number) => {
        const idMatch = t.logo.match(/teams\/(\d+)\.png/);
        const teamId = idMatch
          ? parseInt(idMatch[1], 10)
          : parseInt(t.id.replace(/[^0-9]/g, ''), 10) || (500 + idx);

        return {
          team: {
            id: teamId,
            name: t.name,
            code: t.shortName || null,
            country: t.country || found.country || 'Europe',
            founded: 1900,
            national: false,
            logo: t.logo,
          },
        };
      });
    }
    return [];
  }

  private getLocalFallbackLiveFixtures(): ApiFootballFixtureItem[] {
    const now = new Date();
    return [
      {
        fixture: {
          id: 1205401,
          referee: 'Clément Turpin',
          timezone: 'UTC',
          date: now.toISOString(),
          timestamp: Math.floor(now.getTime() / 1000),
          periods: { first: null, second: null },
          venue: { id: 541, name: 'Santiago Bernabéu', city: 'Madrid' },
          status: { long: 'First Half', short: '1H', elapsed: 34 },
        },
        league: {
          id: 2,
          name: 'UEFA Champions League',
          country: 'Europe',
          logo: 'https://media.api-sports.io/football/leagues/2.png',
          flag: null,
          season: 2026,
          round: 'Phase de groupes',
        },
        teams: {
          home: {
            id: 541,
            name: 'Real Madrid',
            logo: 'https://media.api-sports.io/football/teams/541.png',
            winner: null,
          },
          away: {
            id: 50,
            name: 'Manchester City',
            logo: 'https://media.api-sports.io/football/teams/50.png',
            winner: null,
          },
        },
        goals: { home: 1, away: 1 },
        score: {
          halftime: { home: 1, away: 1 },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
      {
        fixture: {
          id: 1205402,
          referee: 'Michael Oliver',
          timezone: 'UTC',
          date: now.toISOString(),
          timestamp: Math.floor(now.getTime() / 1000),
          periods: { first: null, second: null },
          venue: { id: 157, name: 'Allianz Arena', city: 'Munich' },
          status: { long: 'Second Half', short: '2H', elapsed: 67 },
        },
        league: {
          id: 2,
          name: 'UEFA Champions League',
          country: 'Europe',
          logo: 'https://media.api-sports.io/football/leagues/2.png',
          flag: null,
          season: 2026,
          round: 'Phase de groupes',
        },
        teams: {
          home: {
            id: 157,
            name: 'Bayern Munich',
            logo: 'https://media.api-sports.io/football/teams/157.png',
            winner: null,
          },
          away: {
            id: 85,
            name: 'Paris Saint-Germain',
            logo: 'https://media.api-sports.io/football/teams/85.png',
            winner: null,
          },
        },
        goals: { home: 2, away: 1 },
        score: {
          halftime: { home: 1, away: 0 },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
      {
        fixture: {
          id: 1205403,
          referee: 'Anthony Taylor',
          timezone: 'UTC',
          date: now.toISOString(),
          timestamp: Math.floor(now.getTime() / 1000),
          periods: { first: null, second: null },
          venue: { id: 42, name: 'Emirates Stadium', city: 'London' },
          status: { long: 'First Half', short: '1H', elapsed: 18 },
        },
        league: {
          id: 39,
          name: 'Premier League',
          country: 'Angleterre',
          logo: 'https://media.api-sports.io/football/leagues/39.png',
          flag: null,
          season: 2026,
          round: 'Matchday 5',
        },
        teams: {
          home: {
            id: 42,
            name: 'Arsenal',
            logo: 'https://media.api-sports.io/football/teams/42.png',
            winner: null,
          },
          away: {
            id: 49,
            name: 'Chelsea',
            logo: 'https://media.api-sports.io/football/teams/49.png',
            winner: null,
          },
        },
        goals: { home: 0, away: 0 },
        score: {
          halftime: { home: 0, away: 0 },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ];
  }

  private getLocalFallbackUpcomingFixtures(): ApiFootballFixtureItem[] {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    return [
      {
        fixture: {
          id: 1205501,
          referee: null,
          timezone: 'UTC',
          date: tomorrow.toISOString(),
          timestamp: Math.floor(tomorrow.getTime() / 1000),
          periods: { first: null, second: null },
          venue: { id: 529, name: 'Camp Nou', city: 'Barcelona' },
          status: { long: 'Not Started', short: 'NS', elapsed: null },
        },
        league: {
          id: 140,
          name: 'La Liga',
          country: 'Espagne',
          logo: 'https://media.api-sports.io/football/leagues/140.png',
          flag: null,
          season: 2026,
          round: 'Journée 6',
        },
        teams: {
          home: {
            id: 529,
            name: 'FC Barcelona',
            logo: 'https://media.api-sports.io/football/teams/529.png',
            winner: null,
          },
          away: {
            id: 530,
            name: 'Atlético Madrid',
            logo: 'https://media.api-sports.io/football/teams/530.png',
            winner: null,
          },
        },
        goals: { home: null, away: null },
        score: {
          halftime: { home: null, away: null },
          fulltime: { home: null, away: null },
          extratime: { home: null, away: null },
          penalty: { home: null, away: null },
        },
      },
    ];
  }
}

export const apiFootballService = new ApiFootballService();
export default apiFootballService;
