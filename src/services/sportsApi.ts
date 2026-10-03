/**
 * Service API REST TheSportsDB pour les Championnats et Clubs de Football
 * Source de données dynamique : https://www.thesportsdb.com/api/v1/json/3
 */

export interface ApiLeagueRaw {
  idLeague: string;
  strLeague: string;
  strSport?: string;
  strLeagueAlternate?: string;
  strBadge?: string;
  strLogo?: string;
  strPoster?: string;
  strCountry?: string;
}

export interface ApiTeamRaw {
  idTeam: string;
  strTeam: string;
  strTeamShort?: string;
  strBadge?: string;
  strLogo?: string;
  strCountry?: string;
  idLeague?: string;
  strLeague?: string;
}

export interface SportsLeague {
  id: string;
  name: string;
  sport: string;
  country?: string;
  continent?: 'Europe' | 'Afrique' | 'Amerique' | 'Asie' | 'International';
  badge: string; // Lien CDN TheSportsDB ou fallback haute résolution
  logo: string;
  teams: SportsTeam[];
  category?: 'major' | 'lower' | 'youth' | 'exotic' | 'national' | 'cybersport' | 'fifa';
}

export interface SportsTeam {
  id: string;
  name: string;
  shortName?: string;
  badge: string; // Lien CDN TheSportsDB strBadge
  logo: string;
  country?: string;
  leagueId: string;
  leagueName?: string;
}

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// Cache en mémoire pour garantir des performances optimales et éviter le spamming de l'API
let leaguesMemoryCache: SportsLeague[] | null = null;
const teamsMemoryCache: Map<string, SportsTeam[]> = new Map();

// Dictionnaire de correspondances pour les noms usuels vs noms officiels TheSportsDB
const LEAGUE_NAME_ALIASES: Record<string, string> = {
  'Premier League': 'English Premier League',
  'EPL': 'English Premier League',
  'La Liga': 'Spanish La Liga',
  'Primera Division': 'Spanish La Liga',
  'Ligue 1': 'French Ligue 1',
  'Bundesliga': 'German Bundesliga',
  'Serie A': 'Italian Serie A',
  'Champions League': 'UEFA Champions League',
  'Ligue des Champions': 'UEFA Champions League',
  'Europa League': 'UEFA Europa League',
  'Eredivisie': 'Dutch Eredivisie',
  'Primeira Liga': 'Portuguese Primeira Liga',
  'MLS': 'American Major League Soccer',
  'Major League Soccer': 'American Major League Soccer',
  'Brasileirao': 'Brazilian Serie A',
  'Saudi Pro League': 'Saudi Professional League',
  'Scottish Premiership': 'Scottish Premier League',
  'Championship': 'English League Championship',
};

// Championnats majeurs garantis avec badges CDN TheSportsDB
const POPULAR_LEAGUES_SEEDS: Array<{
  id: string;
  name: string;
  searchName: string;
  country: string;
  continent: 'Europe' | 'Afrique' | 'Amerique' | 'Asie' | 'International';
  category: 'major' | 'lower' | 'youth' | 'exotic' | 'national' | 'cybersport' | 'fifa';
  badge: string;
}> = [
  {
    id: '4328',
    name: 'English Premier League',
    searchName: 'English Premier League',
    country: 'Angleterre',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png',
  },
  {
    id: '4335',
    name: 'Spanish La Liga',
    searchName: 'Spanish La Liga',
    country: 'Espagne',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png',
  },
  {
    id: '4334',
    name: 'French Ligue 1',
    searchName: 'French Ligue 1',
    country: 'France',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/951h0v1711693175.png',
  },
  {
    id: '4331',
    name: 'German Bundesliga',
    searchName: 'German Bundesliga',
    country: 'Allemagne',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/te54461714902891.png',
  },
  {
    id: '4332',
    name: 'Italian Serie A',
    searchName: 'Italian Serie A',
    country: 'Italie',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/03tsme1711693240.png',
  },
  {
    id: '4480',
    name: 'UEFA Champions League',
    searchName: 'UEFA Champions League',
    country: 'Europe',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/nquhuq1573037923.png',
  },
  {
    id: '4481',
    name: 'UEFA Europa League',
    searchName: 'UEFA Europa League',
    country: 'Europe',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/4a034b1621594770.png',
  },
  {
    id: '4337',
    name: 'Dutch Eredivisie',
    searchName: 'Dutch Eredivisie',
    country: 'Pays-Bas',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/4vug101688424933.png',
  },
  {
    id: '4344',
    name: 'Portuguese Primeira Liga',
    searchName: 'Portuguese Primeira Liga',
    country: 'Portugal',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/v6f0761688425239.png',
  },
  {
    id: '4346',
    name: 'American Major League Soccer',
    searchName: 'American Major League Soccer',
    country: 'Etats-Unis',
    continent: 'Amerique',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/dqsf3s1573037466.png',
  },
  {
    id: '4351',
    name: 'Brazilian Serie A',
    searchName: 'Brazilian Serie A',
    country: 'Bresil',
    continent: 'Amerique',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/f1u8w81573037803.png',
  },
  {
    id: '4356',
    name: 'Argentine Primera Division',
    searchName: 'Argentine Primera Division',
    country: 'Argentine',
    continent: 'Amerique',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/9u8k2w1573037865.png',
  },
  {
    id: '4658',
    name: 'Saudi Professional League',
    searchName: 'Saudi Professional League',
    country: 'Arabie Saoudite',
    continent: 'Asie',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/m06j5g1688425974.png',
  },
  {
    id: '4330',
    name: 'Scottish Premier League',
    searchName: 'Scottish Premier League',
    country: 'Ecosse',
    continent: 'Europe',
    category: 'major',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/wquuuu1535214890.png',
  },
  {
    id: '4329',
    name: 'English League Championship',
    searchName: 'English League Championship',
    country: 'Angleterre',
    continent: 'Europe',
    category: 'lower',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/a4k3jh1573037592.png',
  },
  {
    id: '4753',
    name: 'Algerian Ligue 1',
    searchName: 'Algerian Ligue 1',
    country: 'Algerie',
    continent: 'Afrique',
    category: 'exotic',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/ac4ga11714895756.png',
  },
  {
    id: '4922',
    name: 'Moroccan Botola Pro',
    searchName: 'Moroccan Botola Pro',
    country: 'Maroc',
    continent: 'Afrique',
    category: 'exotic',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/mwt6f01614341589.png',
  },
  {
    id: '4923',
    name: 'Egyptian Premier League',
    searchName: 'Egyptian Premier League',
    country: 'Egypte',
    continent: 'Afrique',
    category: 'exotic',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/5k99e31614341604.png',
  },
  {
    id: '4897',
    name: 'South African Premier Soccer League',
    searchName: 'South African Premier Soccer League',
    country: 'Afrique du Sud',
    continent: 'Afrique',
    category: 'exotic',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/d9c0201614341398.png',
  },
  {
    id: '4617',
    name: 'Albanian Superliga',
    searchName: 'Albanian Superliga',
    country: 'Albanie',
    continent: 'Europe',
    category: 'exotic',
    badge: 'https://r2.thesportsdb.com/images/media/league/badge/torbg81711693424.png',
  },
];

/**
 * Récupère la liste globale des championnats de football depuis TheSportsDB.
 */
export async function fetchAllLeagues(): Promise<SportsLeague[]> {
  if (leaguesMemoryCache && leaguesMemoryCache.length > 0) {
    return leaguesMemoryCache;
  }

  const leagueMap = new Map<string, SportsLeague>();

  // 1. Initialiser avec les championnats populaires et leurs badges CDN garantis
  for (const seed of POPULAR_LEAGUES_SEEDS) {
    leagueMap.set(seed.name.toLowerCase(), {
      id: seed.id,
      name: seed.name,
      sport: 'Football',
      country: seed.country,
      continent: seed.continent,
      category: seed.category,
      badge: seed.badge,
      logo: seed.badge,
      teams: [],
    });
  }

  try {
    // 2. Appel dynamique TheSportsDB : search_all_leagues.php?s=Soccer
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${BASE_URL}/search_all_leagues.php?s=Soccer`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawCountries: ApiLeagueRaw[] = data.countries || [];

      for (const item of rawCountries) {
        if (!item.strLeague) continue;
        const key = item.strLeague.toLowerCase();
        const badge = item.strBadge || item.strLogo || 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png';
        const country = item.strCountry || 'International';

        // Déduction du continent
        let continent: 'Europe' | 'Afrique' | 'Amerique' | 'Asie' | 'International' = 'International';
        const cLower = country.toLowerCase();
        if (['france', 'england', 'spain', 'germany', 'italy', 'portugal', 'netherlands', 'scotland', 'albania'].some(c => cLower.includes(c))) {
          continent = 'Europe';
        } else if (['algeria', 'morocco', 'egypt', 'south africa', 'tunisia', 'senegal', 'cameroon', 'nigeria', 'ghana', 'ivory coast'].some(c => cLower.includes(c))) {
          continent = 'Afrique';
        } else if (['brazil', 'argentina', 'usa', 'united states', 'mexico', 'colombia', 'chile', 'uruguay'].some(c => cLower.includes(c))) {
          continent = 'Amerique';
        } else if (['saudi arabia', 'japan', 'south korea', 'china', 'australia', 'qatar', 'uae'].some(c => cLower.includes(c))) {
          continent = 'Asie';
        }

        if (leagueMap.has(key)) {
          const existing = leagueMap.get(key)!;
          if (item.strBadge) existing.badge = item.strBadge;
          if (item.strBadge) existing.logo = item.strBadge;
          if (item.idLeague) existing.id = item.idLeague;
        } else {
          leagueMap.set(key, {
            id: item.idLeague || `league-${Date.now()}-${Math.random()}`,
            name: item.strLeague,
            sport: 'Football',
            country: item.strCountry || 'International',
            continent,
            category: 'major',
            badge,
            logo: badge,
            teams: [],
          });
        }
      }
    }
  } catch (err) {
    console.warn('[sportsApi] fetchAllLeagues non-fatal error:', err);
  }

  // 3. Convertir en tableau et trier
  const result = Array.from(leagueMap.values()).sort((a, b) => {
    // Les ligues majeures en premier
    if (a.category === 'major' && b.category !== 'major') return -1;
    if (b.category === 'major' && a.category !== 'major') return 1;
    return a.name.localeCompare(b.name);
  });

  leaguesMemoryCache = result;
  return result;
}

/**
 * Récupère la liste de tous les clubs appartenant à un championnat sélectionné,
 * incluant le lien CDN de leur badge/logo (strBadge).
 */
export async function fetchTeamsByLeague(leagueName: string): Promise<SportsTeam[]> {
  if (!leagueName) return [];

  // Normalisation du nom de la ligue
  let cleanName = leagueName.trim();
  cleanName = cleanName.replace(/^FIFA\s*[\.\-·:]\s*/i, '').trim();

  const normalizedQuery = LEAGUE_NAME_ALIASES[cleanName] || cleanName;
  const cacheKey = normalizedQuery.toLowerCase();

  // Vérification dans le cache
  if (teamsMemoryCache.has(cacheKey)) {
    return teamsMemoryCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const url = `${BASE_URL}/search_all_teams.php?l=${encodeURIComponent(normalizedQuery)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawTeams: ApiTeamRaw[] = data.teams || [];

      if (rawTeams.length > 0) {
        const teams: SportsTeam[] = rawTeams.map((t) => {
          const badgeUrl =
            t.strBadge ||
            t.strLogo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(t.strTeam)}&background=1E3AEB&color=FFFFFF&size=128&bold=true&rounded=true`;

          return {
            id: t.idTeam || `team-${t.strTeam.toLowerCase().replace(/\s+/g, '-')}`,
            name: t.strTeam,
            shortName: t.strTeamShort || undefined,
            badge: badgeUrl,
            logo: badgeUrl,
            country: t.strCountry,
            leagueId: t.idLeague || normalizedQuery,
            leagueName: t.strLeague || normalizedQuery,
          };
        });

        teamsMemoryCache.set(cacheKey, teams);

        // Mettre à jour également la ligue dans le cache des ligues si présente
        if (leaguesMemoryCache) {
          const matchedLeague = leaguesMemoryCache.find(
            (l) => l.name.toLowerCase() === cleanName.toLowerCase() || l.name.toLowerCase() === normalizedQuery.toLowerCase()
          );
          if (matchedLeague) {
            matchedLeague.teams = teams;
          }
        }

        return teams;
      }
    }
  } catch (err) {
    console.warn(`[sportsApi] fetchTeamsByLeague non-fatal error for ${leagueName}:`, err);
  }

  // Fallback si la recherche exacte échoue : essayer avec le nom original ou les alias
  if (normalizedQuery !== cleanName) {
    try {
      const fallbackUrl = `${BASE_URL}/search_all_teams.php?l=${encodeURIComponent(cleanName)}`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const data = await res.json();
        const rawTeams: ApiTeamRaw[] = data.teams || [];
        if (rawTeams.length > 0) {
          const teams: SportsTeam[] = rawTeams.map((t) => ({
            id: t.idTeam || `team-${t.strTeam.toLowerCase().replace(/\s+/g, '-')}`,
            name: t.strTeam,
            shortName: t.strTeamShort || undefined,
            badge: t.strBadge || t.strLogo || '',
            logo: t.strBadge || t.strLogo || '',
            country: t.strCountry,
            leagueId: t.idLeague || cleanName,
            leagueName: t.strLeague || cleanName,
          }));
          teamsMemoryCache.set(cacheKey, teams);
          return teams;
        }
      }
    } catch {
      // Ignore
    }
  }

  return [];
}

/**
 * Réinitialise les caches en mémoire si nécessaire.
 */
export function clearSportsApiCache() {
  leaguesMemoryCache = null;
  teamsMemoryCache.clear();
}
