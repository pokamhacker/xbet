export interface FifaLeague {
  id: string;
  name: string;
  category: 'FC 24' | 'FC 25' | 'FC 26';
  flagType: 'globe' | 'england' | 'europe' | 'italy' | 'germany' | 'spain';
  matchesCount: number;
  isNew?: boolean;
}

export const FIFA_LEAGUES_LIST: FifaLeague[] = [
  {
    id: 'fc26-5x5-rush-superligue',
    name: 'FC 26. 5x5 Rush. Superligue',
    category: 'FC 26',
    flagType: 'globe',
    matchesCount: 4,
  },
  {
    id: 'fc24-4x4-england',
    name: "FC 24. 4x4. Championnat d'Angleterre",
    category: 'FC 24',
    flagType: 'england',
    matchesCount: 5,
  },
  {
    id: 'fc25-3x3-conference-league',
    name: 'FC 25. 3x3. Ligue de conférence',
    category: 'FC 25',
    flagType: 'europe',
    matchesCount: 4,
  },
  {
    id: 'fc26-england-championship',
    name: 'FC 26. England Championship',
    category: 'FC 26',
    flagType: 'england',
    matchesCount: 5,
  },
  {
    id: 'fc26-champions-league',
    name: 'FC 26. Champions League',
    category: 'FC 26',
    flagType: 'europe',
    matchesCount: 5,
  },
  {
    id: 'fc26-world-championship',
    name: 'FC 26. Championnat du monde',
    category: 'FC 26',
    flagType: 'globe',
    matchesCount: 5,
  },
  {
    id: 'fc25-italy-championship',
    name: 'FC 25. Italy Championship',
    category: 'FC 25',
    flagType: 'italy',
    matchesCount: 5,
  },
  {
    id: 'fc25-european-league',
    name: 'FC 25. Ligue européenne',
    category: 'FC 25',
    flagType: 'europe',
    matchesCount: 5,
  },
  {
    id: 'fc26-germany-championship',
    name: 'FC 26. Germany Championship',
    category: 'FC 26',
    flagType: 'germany',
    matchesCount: 5,
  },
  {
    id: 'fc26-italy-championship-new',
    name: 'FC 26. Italy Championship',
    category: 'FC 26',
    flagType: 'italy',
    matchesCount: 5,
    isNew: true,
  },
  {
    id: 'fc26-spain-championship',
    name: 'FC 26. Spain Championship',
    category: 'FC 26',
    flagType: 'spain',
    matchesCount: 5,
  },
];

export const getFifaLeagueLogo = (flagType: FifaLeague['flagType']): string => {
  switch (flagType) {
    case 'england':
      return 'https://media.api-sports.io/football/leagues/39.png';
    case 'europe':
      return 'https://media.api-sports.io/football/leagues/2.png';
    case 'italy':
      return 'https://media.api-sports.io/football/leagues/135.png';
    case 'germany':
      return 'https://media.api-sports.io/football/leagues/78.png';
    case 'spain':
      return 'https://media.api-sports.io/football/leagues/140.png';
    case 'globe':
    default:
      return 'https://media.api-sports.io/football/leagues/1.png';
  }
};

export const getFifaLeagueCountry = (flagType: FifaLeague['flagType']): string => {
  switch (flagType) {
    case 'england':
      return 'Angleterre';
    case 'europe':
      return 'Europe';
    case 'italy':
      return 'Italie';
    case 'germany':
      return 'Allemagne';
    case 'spain':
      return 'Espagne';
    case 'globe':
    default:
      return 'International';
  }
};

export const getFifaLeagueContinent = (flagType: FifaLeague['flagType']): 'Europe' | 'Afrique' | 'Amerique' | 'Asie' | 'International' => {
  switch (flagType) {
    case 'england':
    case 'europe':
    case 'italy':
    case 'germany':
    case 'spain':
      return 'Europe';
    case 'globe':
    default:
      return 'International';
  }
};

export interface FifaTeamData {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
}

// Équipes emblématiques par type de compétition
export const FIFA_DEFAULT_TEAMS: Record<string, FifaTeamData[]> = {
  england: [
    { id: 'fifa-ars', name: 'Arsenal', shortName: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', country: 'Angleterre' },
    { id: 'fifa-che', name: 'Chelsea', shortName: 'CHE', logo: 'https://media.api-sports.io/football/teams/49.png', country: 'Angleterre' },
    { id: 'fifa-liv', name: 'Liverpool', shortName: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', country: 'Angleterre' },
    { id: 'fifa-mci', name: 'Manchester City', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'Angleterre' },
    { id: 'fifa-mun', name: 'Manchester United', shortName: 'MUN', logo: 'https://media.api-sports.io/football/teams/33.png', country: 'Angleterre' },
    { id: 'fifa-tot', name: 'Tottenham', shortName: 'TOT', logo: 'https://media.api-sports.io/football/teams/47.png', country: 'Angleterre' },
    { id: 'fifa-new', name: 'Newcastle', shortName: 'NEW', logo: 'https://media.api-sports.io/football/teams/34.png', country: 'Angleterre' },
    { id: 'fifa-avl', name: 'Aston Villa', shortName: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', country: 'Angleterre' },
  ],
  spain: [
    { id: 'fifa-rma', name: 'Real Madrid', shortName: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Espagne' },
    { id: 'fifa-bar', name: 'FC Barcelona', shortName: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', country: 'Espagne' },
    { id: 'fifa-atm', name: 'Atlético Madrid', shortName: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', country: 'Espagne' },
    { id: 'fifa-sev', name: 'Sevilla FC', shortName: 'SEV', logo: 'https://media.api-sports.io/football/teams/536.png', country: 'Espagne' },
    { id: 'fifa-bet', name: 'Real Betis', shortName: 'BET', logo: 'https://media.api-sports.io/football/teams/543.png', country: 'Espagne' },
    { id: 'fifa-ath', name: 'Athletic Bilbao', shortName: 'ATH', logo: 'https://media.api-sports.io/football/teams/531.png', country: 'Espagne' },
    { id: 'fifa-rso', name: 'Real Sociedad', shortName: 'RSO', logo: 'https://media.api-sports.io/football/teams/548.png', country: 'Espagne' },
    { id: 'fifa-vil', name: 'Villarreal', shortName: 'VIL', logo: 'https://media.api-sports.io/football/teams/533.png', country: 'Espagne' },
  ],
  italy: [
    { id: 'fifa-int', name: 'Inter Milan', shortName: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', country: 'Italie' },
    { id: 'fifa-mil', name: 'AC Milan', shortName: 'MIL', logo: 'https://media.api-sports.io/football/teams/489.png', country: 'Italie' },
    { id: 'fifa-juv', name: 'Juventus', shortName: 'JUV', logo: 'https://media.api-sports.io/football/teams/496.png', country: 'Italie' },
    { id: 'fifa-nap', name: 'Napoli', shortName: 'NAP', logo: 'https://media.api-sports.io/football/teams/492.png', country: 'Italie' },
    { id: 'fifa-rom', name: 'AS Roma', shortName: 'ROM', logo: 'https://media.api-sports.io/football/teams/497.png', country: 'Italie' },
    { id: 'fifa-laz', name: 'Lazio', shortName: 'LAZ', logo: 'https://media.api-sports.io/football/teams/487.png', country: 'Italie' },
    { id: 'fifa-ata', name: 'Atalanta', shortName: 'ATA', logo: 'https://media.api-sports.io/football/teams/499.png', country: 'Italie' },
    { id: 'fifa-fio', name: 'Fiorentina', shortName: 'FIO', logo: 'https://media.api-sports.io/football/teams/502.png', country: 'Italie' },
  ],
  germany: [
    { id: 'fifa-bay', name: 'Bayern Munich', shortName: 'BAY', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Allemagne' },
    { id: 'fifa-bvb', name: 'Borussia Dortmund', shortName: 'BVB', logo: 'https://media.api-sports.io/football/teams/165.png', country: 'Allemagne' },
    { id: 'fifa-b04', name: 'Bayer Leverkusen', shortName: 'B04', logo: 'https://media.api-sports.io/football/teams/168.png', country: 'Allemagne' },
    { id: 'fifa-rbl', name: 'RB Leipzig', shortName: 'RBL', logo: 'https://media.api-sports.io/football/teams/173.png', country: 'Allemagne' },
    { id: 'fifa-sge', name: 'Eintracht Frankfurt', shortName: 'SGE', logo: 'https://media.api-sports.io/football/teams/169.png', country: 'Allemagne' },
    { id: 'fifa-vfb', name: 'VfB Stuttgart', shortName: 'VFB', logo: 'https://media.api-sports.io/football/teams/172.png', country: 'Allemagne' },
  ],
  europe: [
    { id: 'fifa-rma', name: 'Real Madrid', shortName: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Espagne' },
    { id: 'fifa-mci', name: 'Manchester City', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'Angleterre' },
    { id: 'fifa-bay', name: 'Bayern Munich', shortName: 'BAY', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Allemagne' },
    { id: 'fifa-psg', name: 'Paris Saint-Germain', shortName: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png', country: 'France' },
    { id: 'fifa-bar', name: 'FC Barcelona', shortName: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', country: 'Espagne' },
    { id: 'fifa-int', name: 'Inter Milan', shortName: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', country: 'Italie' },
    { id: 'fifa-ars', name: 'Arsenal', shortName: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', country: 'Angleterre' },
    { id: 'fifa-liv', name: 'Liverpool', shortName: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', country: 'Angleterre' },
  ],
  globe: [
    { id: 'fifa-fra', name: 'France', shortName: 'FRA', logo: 'https://media.api-sports.io/football/teams/2.png', country: 'France' },
    { id: 'fifa-arg', name: 'Argentine', shortName: 'ARG', logo: 'https://media.api-sports.io/football/teams/26.png', country: 'Argentine' },
    { id: 'fifa-bra', name: 'Brésil', shortName: 'BRA', logo: 'https://media.api-sports.io/football/teams/6.png', country: 'Brésil' },
    { id: 'fifa-eng', name: 'Angleterre', shortName: 'ENG', logo: 'https://media.api-sports.io/football/teams/10.png', country: 'Angleterre' },
    { id: 'fifa-esp', name: 'Espagne', shortName: 'ESP', logo: 'https://media.api-sports.io/football/teams/9.png', country: 'Espagne' },
    { id: 'fifa-ger', name: 'Allemagne', shortName: 'GER', logo: 'https://media.api-sports.io/football/teams/25.png', country: 'Allemagne' },
    { id: 'fifa-por', name: 'Portugal', shortName: 'POR', logo: 'https://media.api-sports.io/football/teams/27.png', country: 'Portugal' },
    { id: 'fifa-ita', name: 'Italie', shortName: 'ITA', logo: 'https://media.api-sports.io/football/teams/768.png', country: 'Italie' },
  ],
};
