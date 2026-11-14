import { makeNationalFlagUrl } from '../data/nationalTeams';

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
    flagType: 'europe',
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
    { id: 'fifa-mci', name: 'Manchester City', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'Angleterre' },
    { id: 'fifa-ars', name: 'Arsenal FC', shortName: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', country: 'Angleterre' },
    { id: 'fifa-liv', name: 'Liverpool FC', shortName: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', country: 'Angleterre' },
    { id: 'fifa-che', name: 'Chelsea FC', shortName: 'CHE', logo: 'https://media.api-sports.io/football/teams/49.png', country: 'Angleterre' },
    { id: 'fifa-mun', name: 'Manchester United', shortName: 'MUN', logo: 'https://media.api-sports.io/football/teams/33.png', country: 'Angleterre' },
    { id: 'fifa-tot', name: 'Tottenham Hotspur', shortName: 'TOT', logo: 'https://media.api-sports.io/football/teams/47.png', country: 'Angleterre' },
    { id: 'fifa-new', name: 'Newcastle United', shortName: 'NEW', logo: 'https://media.api-sports.io/football/teams/34.png', country: 'Angleterre' },
    { id: 'fifa-avl', name: 'Aston Villa', shortName: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', country: 'Angleterre' },
    { id: 'fifa-bha', name: 'Brighton & Hove Albion', shortName: 'BHA', logo: 'https://media.api-sports.io/football/teams/51.png', country: 'Angleterre' },
    { id: 'fifa-whu', name: 'West Ham United', shortName: 'WHU', logo: 'https://media.api-sports.io/football/teams/48.png', country: 'Angleterre' },
    { id: 'fifa-cry', name: 'Crystal Palace', shortName: 'CRY', logo: 'https://media.api-sports.io/football/teams/52.png', country: 'Angleterre' },
    { id: 'fifa-ful', name: 'Fulham FC', shortName: 'FUL', logo: 'https://media.api-sports.io/football/teams/36.png', country: 'Angleterre' },
    { id: 'fifa-bre', name: 'Brentford FC', shortName: 'BRE', logo: 'https://media.api-sports.io/football/teams/55.png', country: 'Angleterre' },
    { id: 'fifa-wol', name: 'Wolverhampton Wanderers', shortName: 'WOL', logo: 'https://media.api-sports.io/football/teams/39.png', country: 'Angleterre' },
    { id: 'fifa-eve', name: 'Everton FC', shortName: 'EVE', logo: 'https://media.api-sports.io/football/teams/45.png', country: 'Angleterre' },
    { id: 'fifa-bou', name: 'AFC Bournemouth', shortName: 'BOU', logo: 'https://media.api-sports.io/football/teams/35.png', country: 'Angleterre' },
    { id: 'fifa-nfo', name: 'Nottingham Forest', shortName: 'NFO', logo: 'https://media.api-sports.io/football/teams/65.png', country: 'Angleterre' },
    { id: 'fifa-lei', name: 'Leicester City', shortName: 'LEI', logo: 'https://media.api-sports.io/football/teams/46.png', country: 'Angleterre' },
    { id: 'fifa-sou', name: 'Southampton FC', shortName: 'SOU', logo: 'https://media.api-sports.io/football/teams/41.png', country: 'Angleterre' },
    { id: 'fifa-ips', name: 'Ipswich Town', shortName: 'IPS', logo: 'https://media.api-sports.io/football/teams/57.png', country: 'Angleterre' },
  ],
  spain: [
    { id: 'fifa-rma', name: 'Real Madrid', shortName: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Espagne' },
    { id: 'fifa-bar', name: 'FC Barcelona', shortName: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', country: 'Espagne' },
    { id: 'fifa-atm', name: 'Atlético Madrid', shortName: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', country: 'Espagne' },
    { id: 'fifa-ath', name: 'Athletic Bilbao', shortName: 'ATH', logo: 'https://media.api-sports.io/football/teams/531.png', country: 'Espagne' },
    { id: 'fifa-vil', name: 'Villarreal CF', shortName: 'VIL', logo: 'https://media.api-sports.io/football/teams/533.png', country: 'Espagne' },
    { id: 'fifa-rso', name: 'Real Sociedad', shortName: 'RSO', logo: 'https://media.api-sports.io/football/teams/548.png', country: 'Espagne' },
    { id: 'fifa-bet', name: 'Real Betis', shortName: 'BET', logo: 'https://media.api-sports.io/football/teams/543.png', country: 'Espagne' },
    { id: 'fifa-sev', name: 'Sevilla FC', shortName: 'SEV', logo: 'https://media.api-sports.io/football/teams/536.png', country: 'Espagne' },
    { id: 'fifa-val', name: 'Valencia CF', shortName: 'VAL', logo: 'https://media.api-sports.io/football/teams/532.png', country: 'Espagne' },
    { id: 'fifa-gir', name: 'Girona FC', shortName: 'GIR', logo: 'https://media.api-sports.io/football/teams/547.png', country: 'Espagne' },
    { id: 'fifa-osa', name: 'CA Osasuna', shortName: 'OSA', logo: 'https://media.api-sports.io/football/teams/727.png', country: 'Espagne' },
    { id: 'fifa-cel', name: 'RC Celta Vigo', shortName: 'CEL', logo: 'https://media.api-sports.io/football/teams/538.png', country: 'Espagne' },
    { id: 'fifa-ray', name: 'Rayo Vallecano', shortName: 'RAY', logo: 'https://media.api-sports.io/football/teams/728.png', country: 'Espagne' },
    { id: 'fifa-mll', name: 'RCD Mallorca', shortName: 'MLL', logo: 'https://media.api-sports.io/football/teams/798.png', country: 'Espagne' },
    { id: 'fifa-get', name: 'Getafe CF', shortName: 'GET', logo: 'https://media.api-sports.io/football/teams/546.png', country: 'Espagne' },
    { id: 'fifa-ala', name: 'Deportivo Alavés', shortName: 'ALA', logo: 'https://media.api-sports.io/football/teams/542.png', country: 'Espagne' },
    { id: 'fifa-esp', name: 'RCD Espanyol', shortName: 'ESP', logo: 'https://media.api-sports.io/football/teams/540.png', country: 'Espagne' },
    { id: 'fifa-leg', name: 'CD Leganés', shortName: 'LEG', logo: 'https://media.api-sports.io/football/teams/537.png', country: 'Espagne' },
    { id: 'fifa-lpa', name: 'UD Las Palmas', shortName: 'LPA', logo: 'https://media.api-sports.io/football/teams/534.png', country: 'Espagne' },
    { id: 'fifa-vld', name: 'Real Valladolid', shortName: 'VLD', logo: 'https://media.api-sports.io/football/teams/720.png', country: 'Espagne' },
  ],
  italy: [
    { id: 'fifa-int', name: 'Inter Milan', shortName: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', country: 'Italie' },
    { id: 'fifa-mil', name: 'AC Milan', shortName: 'ACM', logo: 'https://media.api-sports.io/football/teams/489.png', country: 'Italie' },
    { id: 'fifa-juv', name: 'Juventus FC', shortName: 'JUV', logo: 'https://media.api-sports.io/football/teams/496.png', country: 'Italie' },
    { id: 'fifa-nap', name: 'SSC Napoli', shortName: 'NAP', logo: 'https://media.api-sports.io/football/teams/492.png', country: 'Italie' },
    { id: 'fifa-rom', name: 'AS Roma', shortName: 'ROM', logo: 'https://media.api-sports.io/football/teams/497.png', country: 'Italie' },
    { id: 'fifa-laz', name: 'SS Lazio', shortName: 'LAZ', logo: 'https://media.api-sports.io/football/teams/487.png', country: 'Italie' },
    { id: 'fifa-ata', name: 'Atalanta Bergamo', shortName: 'ATA', logo: 'https://media.api-sports.io/football/teams/499.png', country: 'Italie' },
    { id: 'fifa-fio', name: 'ACF Fiorentina', shortName: 'FIO', logo: 'https://media.api-sports.io/football/teams/502.png', country: 'Italie' },
    { id: 'fifa-bol', name: 'Bologna FC', shortName: 'BOL', logo: 'https://media.api-sports.io/football/teams/500.png', country: 'Italie' },
    { id: 'fifa-tor', name: 'Torino FC', shortName: 'TOR', logo: 'https://media.api-sports.io/football/teams/503.png', country: 'Italie' },
    { id: 'fifa-gen', name: 'Genoa CFC', shortName: 'GEN', logo: 'https://media.api-sports.io/football/teams/495.png', country: 'Italie' },
    { id: 'fifa-mon', name: 'AC Monza', shortName: 'MON', logo: 'https://media.api-sports.io/football/teams/1579.png', country: 'Italie' },
    { id: 'fifa-udi', name: 'Udinese Calcio', shortName: 'UDI', logo: 'https://media.api-sports.io/football/teams/494.png', country: 'Italie' },
    { id: 'fifa-cag', name: 'Cagliari Calcio', shortName: 'CAG', logo: 'https://media.api-sports.io/football/teams/490.png', country: 'Italie' },
    { id: 'fifa-ver', name: 'Hellas Verona', shortName: 'VER', logo: 'https://media.api-sports.io/football/teams/504.png', country: 'Italie' },
    { id: 'fifa-lec', name: 'US Lecce', shortName: 'LEC', logo: 'https://media.api-sports.io/football/teams/867.png', country: 'Italie' },
    { id: 'fifa-emp', name: 'Empoli FC', shortName: 'EMP', logo: 'https://media.api-sports.io/football/teams/511.png', country: 'Italie' },
    { id: 'fifa-par', name: 'Parma Calcio 1913', shortName: 'PAR', logo: 'https://media.api-sports.io/football/teams/523.png', country: 'Italie' },
    { id: 'fifa-com', name: 'Como 1907', shortName: 'COM', logo: 'https://media.api-sports.io/football/teams/895.png', country: 'Italie' },
    { id: 'fifa-ven', name: 'Venezia FC', shortName: 'VEN', logo: 'https://media.api-sports.io/football/teams/517.png', country: 'Italie' },
  ],
  germany: [
    { id: 'fifa-bay', name: 'Bayern Munich', shortName: 'BAY', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Allemagne' },
    { id: 'fifa-bvb', name: 'Borussia Dortmund', shortName: 'BVB', logo: 'https://media.api-sports.io/football/teams/165.png', country: 'Allemagne' },
    { id: 'fifa-b04', name: 'Bayer Leverkusen', shortName: 'B04', logo: 'https://media.api-sports.io/football/teams/168.png', country: 'Allemagne' },
    { id: 'fifa-rbl', name: 'RB Leipzig', shortName: 'RBL', logo: 'https://media.api-sports.io/football/teams/173.png', country: 'Allemagne' },
    { id: 'fifa-vfb', name: 'VfB Stuttgart', shortName: 'VFB', logo: 'https://media.api-sports.io/football/teams/172.png', country: 'Allemagne' },
    { id: 'fifa-sge', name: 'Eintracht Frankfurt', shortName: 'SGE', logo: 'https://media.api-sports.io/football/teams/169.png', country: 'Allemagne' },
    { id: 'fifa-wob', name: 'VfL Wolfsburg', shortName: 'WOB', logo: 'https://media.api-sports.io/football/teams/161.png', country: 'Allemagne' },
    { id: 'fifa-scf', name: 'SC Freiburg', shortName: 'SCF', logo: 'https://media.api-sports.io/football/teams/160.png', country: 'Allemagne' },
    { id: 'fifa-tsg', name: 'TSG 1899 Hoffenheim', shortName: 'TSG', logo: 'https://media.api-sports.io/football/teams/167.png', country: 'Allemagne' },
    { id: 'fifa-bmg', name: "Borussia M'gladbach", shortName: 'BMG', logo: 'https://media.api-sports.io/football/teams/163.png', country: 'Allemagne' },
    { id: 'fifa-fcu', name: '1. FC Union Berlin', shortName: 'FCU', logo: 'https://media.api-sports.io/football/teams/182.png', country: 'Allemagne' },
    { id: 'fifa-svw', name: 'SV Werder Bremen', shortName: 'SVW', logo: 'https://media.api-sports.io/football/teams/162.png', country: 'Allemagne' },
    { id: 'fifa-m05', name: '1. FSV Mainz 05', shortName: 'M05', logo: 'https://media.api-sports.io/football/teams/164.png', country: 'Allemagne' },
    { id: 'fifa-fca', name: 'FC Augsburg', shortName: 'FCA', logo: 'https://media.api-sports.io/football/teams/170.png', country: 'Allemagne' },
    { id: 'fifa-hdh', name: '1. FC Heidenheim', shortName: 'HDH', logo: 'https://media.api-sports.io/football/teams/180.png', country: 'Allemagne' },
    { id: 'fifa-boc', name: 'VfL Bochum', shortName: 'BOC', logo: 'https://media.api-sports.io/football/teams/176.png', country: 'Allemagne' },
    { id: 'fifa-stp', name: 'FC St. Pauli', shortName: 'STP', logo: 'https://media.api-sports.io/football/teams/186.png', country: 'Allemagne' },
    { id: 'fifa-kie', name: 'Holstein Kiel', shortName: 'KIE', logo: 'https://media.api-sports.io/football/teams/191.png', country: 'Allemagne' },
  ],
  france: [
    { id: 'fifa-psg', name: 'Paris Saint-Germain', shortName: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png', country: 'France' },
    { id: 'fifa-om', name: 'Olympique de Marseille', shortName: 'OM', logo: 'https://media.api-sports.io/football/teams/81.png', country: 'France' },
    { id: 'fifa-asm', name: 'AS Monaco', shortName: 'ASM', logo: 'https://media.api-sports.io/football/teams/91.png', country: 'France' },
    { id: 'fifa-ol', name: 'Olympique Lyonnais', shortName: 'OL', logo: 'https://media.api-sports.io/football/teams/80.png', country: 'France' },
    { id: 'fifa-lil', name: 'LOSC Lille', shortName: 'LIL', logo: 'https://media.api-sports.io/football/teams/79.png', country: 'France' },
    { id: 'fifa-nic', name: 'OGC Nice', shortName: 'NIC', logo: 'https://media.api-sports.io/football/teams/84.png', country: 'France' },
    { id: 'fifa-rcl', name: 'RC Lens', shortName: 'RCL', logo: 'https://media.api-sports.io/football/teams/116.png', country: 'France' },
    { id: 'fifa-ren', name: 'Stade Rennais FC', shortName: 'REN', logo: 'https://media.api-sports.io/football/teams/94.png', country: 'France' },
    { id: 'fifa-bre', name: 'Stade Brestois 29', shortName: 'BRE', logo: 'https://media.api-sports.io/football/teams/106.png', country: 'France' },
    { id: 'fifa-tfc', name: 'Toulouse FC', shortName: 'TFC', logo: 'https://media.api-sports.io/football/teams/96.png', country: 'France' },
    { id: 'fifa-sdr', name: 'Stade de Reims', shortName: 'SDR', logo: 'https://media.api-sports.io/football/teams/93.png', country: 'France' },
    { id: 'fifa-rcs', name: 'RC Strasbourg Alsace', shortName: 'RCS', logo: 'https://media.api-sports.io/football/teams/95.png', country: 'France' },
    { id: 'fifa-fcn', name: 'FC Nantes', shortName: 'FCN', logo: 'https://media.api-sports.io/football/teams/83.png', country: 'France' },
    { id: 'fifa-mhs', name: 'Montpellier HSC', shortName: 'MHS', logo: 'https://media.api-sports.io/football/teams/82.png', country: 'France' },
    { id: 'fifa-hac', name: 'Le Havre AC', shortName: 'HAC', logo: 'https://media.api-sports.io/football/teams/111.png', country: 'France' },
    { id: 'fifa-aux', name: 'AJ Auxerre', shortName: 'AUX', logo: 'https://media.api-sports.io/football/teams/108.png', country: 'France' },
    { id: 'fifa-ang', name: 'Angers SCO', shortName: 'ANG', logo: 'https://media.api-sports.io/football/teams/77.png', country: 'France' },
    { id: 'fifa-asse', name: 'AS Saint-Étienne', shortName: 'ASSE', logo: 'https://media.api-sports.io/football/teams/1063.png', country: 'France' },
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
    { id: 'fifa-bmg', name: 'Borussia Mönchengladbach', shortName: 'BMG', logo: 'https://media.api-sports.io/football/teams/163.png', country: 'Allemagne' },
    { id: 'fifa-bvb', name: 'Borussia Dortmund', shortName: 'BVB', logo: 'https://media.api-sports.io/football/teams/165.png', country: 'Allemagne' },
    { id: 'fifa-juv', name: 'Juventus', shortName: 'JUV', logo: 'https://media.api-sports.io/football/teams/496.png', country: 'Italie' },
    { id: 'fifa-mil', name: 'AC Milan', shortName: 'MIL', logo: 'https://media.api-sports.io/football/teams/489.png', country: 'Italie' },
    { id: 'fifa-atm', name: 'Atlético Madrid', shortName: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', country: 'Espagne' },
    { id: 'fifa-psv', name: 'PSV Eindhoven', shortName: 'PSV', logo: 'https://media.api-sports.io/football/teams/197.png', country: 'Pays-Bas' },
    { id: 'fifa-rom', name: 'Roma', shortName: 'ROM', logo: 'https://media.api-sports.io/football/teams/497.png', country: 'Italie' },
    { id: 'fifa-oly', name: 'Olympiacos', shortName: 'OLY', logo: 'https://media.api-sports.io/football/teams/553.png', country: 'Grèce' },
    { id: 'fifa-bra', name: 'Braga', shortName: 'BRA', logo: 'https://media.api-sports.io/football/teams/217.png', country: 'Portugal' },
    { id: 'fifa-b04', name: 'Bayer Leverkusen', shortName: 'B04', logo: 'https://media.api-sports.io/football/teams/168.png', country: 'Allemagne' },
    { id: 'fifa-ata', name: 'Atalanta', shortName: 'ATA', logo: 'https://media.api-sports.io/football/teams/499.png', country: 'Italie' },
    { id: 'fifa-ben', name: 'Benfica', shortName: 'BEN', logo: 'https://media.api-sports.io/football/teams/211.png', country: 'Portugal' },
    { id: 'fifa-scp', name: 'Sporting CP', shortName: 'SCP', logo: 'https://media.api-sports.io/football/teams/228.png', country: 'Portugal' },
    { id: 'fifa-por', name: 'FC Porto', shortName: 'POR', logo: 'https://media.api-sports.io/football/teams/212.png', country: 'Portugal' },
    { id: 'fifa-rbl', name: 'RB Leipzig', shortName: 'RBL', logo: 'https://media.api-sports.io/football/teams/173.png', country: 'Allemagne' },
    { id: 'fifa-avl', name: 'Aston Villa', shortName: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', country: 'Angleterre' },
    { id: 'fifa-bol', name: 'Bologna', shortName: 'BOL', logo: 'https://media.api-sports.io/football/teams/500.png', country: 'Italie' },
    { id: 'fifa-gir', name: 'Girona', shortName: 'GIR', logo: 'https://media.api-sports.io/football/teams/547.png', country: 'Espagne' },
    { id: 'fifa-stu', name: 'VfB Stuttgart', shortName: 'STU', logo: 'https://media.api-sports.io/football/teams/172.png', country: 'Allemagne' },
    { id: 'fifa-fey', name: 'Feyenoord', shortName: 'FEY', logo: 'https://media.api-sports.io/football/teams/209.png', country: 'Pays-Bas' },
    { id: 'fifa-mon', name: 'AS Monaco', shortName: 'MON', logo: 'https://media.api-sports.io/football/teams/91.png', country: 'France' },
    { id: 'fifa-lil', name: 'Lille OSC', shortName: 'LIL', logo: 'https://media.api-sports.io/football/teams/79.png', country: 'France' },
    { id: 'fifa-bre', name: 'Stade Brestois 29', shortName: 'BRE', logo: 'https://media.api-sports.io/football/teams/106.png', country: 'France' },
    { id: 'fifa-clu', name: 'Club Brugge', shortName: 'CLU', logo: 'https://media.api-sports.io/football/teams/569.png', country: 'Belgique' },
    { id: 'fifa-cel', name: 'Celtic', shortName: 'CEL', logo: 'https://media.api-sports.io/football/teams/247.png', country: 'Écosse' },
    { id: 'fifa-sha', name: 'Shakhtar Donetsk', shortName: 'SHA', logo: 'https://media.api-sports.io/football/teams/550.png', country: 'Ukraine' },
    { id: 'fifa-sal', name: 'Red Bull Salzburg', shortName: 'SAL', logo: 'https://media.api-sports.io/football/teams/571.png', country: 'Autriche' },
    { id: 'fifa-stg', name: 'Sturm Graz', shortName: 'STU', logo: 'https://media.api-sports.io/football/teams/637.png', country: 'Autriche' },
    { id: 'fifa-ybb', name: 'Young Boys', shortName: 'YBB', logo: 'https://media.api-sports.io/football/teams/565.png', country: 'Suisse' },
    { id: 'fifa-spa', name: 'Sparta Prague', shortName: 'SPA', logo: 'https://media.api-sports.io/football/teams/628.png', country: 'République Tchèque' },
    { id: 'fifa-slo', name: 'Slovan Bratislava', shortName: 'SLO', logo: 'https://media.api-sports.io/football/teams/656.png', country: 'Slovaquie' },
    { id: 'fifa-dzg', name: 'Dinamo Zagreb', shortName: 'DZG', logo: 'https://media.api-sports.io/football/teams/620.png', country: 'Croatie' },
    { id: 'fifa-czv', name: 'Étoile Rouge de Belgrade', shortName: 'CZV', logo: 'https://media.api-sports.io/football/teams/598.png', country: 'Serbie' },
  ],
  globe: [
    { id: 'fifa-fra', name: 'France', shortName: 'FRA', logo: makeNationalFlagUrl('fr'), country: 'France' },
    { id: 'fifa-arg', name: 'Argentine', shortName: 'ARG', logo: makeNationalFlagUrl('ar'), country: 'Argentine' },
    { id: 'fifa-bra', name: 'Brésil', shortName: 'BRA', logo: makeNationalFlagUrl('br'), country: 'Brésil' },
    { id: 'fifa-eng', name: 'Angleterre', shortName: 'ENG', logo: makeNationalFlagUrl('gb-eng'), country: 'Angleterre' },
    { id: 'fifa-esp', name: 'Espagne', shortName: 'ESP', logo: makeNationalFlagUrl('es'), country: 'Espagne' },
    { id: 'fifa-ger', name: 'Allemagne', shortName: 'GER', logo: makeNationalFlagUrl('de'), country: 'Allemagne' },
    { id: 'fifa-por', name: 'Portugal', shortName: 'POR', logo: makeNationalFlagUrl('pt'), country: 'Portugal' },
    { id: 'fifa-ita', name: 'Italie', shortName: 'ITA', logo: makeNationalFlagUrl('it'), country: 'Italie' },
    { id: 'fifa-ned', name: 'Pays-Bas', shortName: 'NED', logo: makeNationalFlagUrl('nl'), country: 'Pays-Bas' },
    { id: 'fifa-bel', name: 'Belgique', shortName: 'BEL', logo: makeNationalFlagUrl('be'), country: 'Belgique' },
    { id: 'fifa-cro', name: 'Croatie', shortName: 'CRO', logo: makeNationalFlagUrl('hr'), country: 'Croatie' },
    { id: 'fifa-sui', name: 'Suisse', shortName: 'SUI', logo: makeNationalFlagUrl('ch'), country: 'Suisse' },
    { id: 'fifa-den', name: 'Danemark', shortName: 'DEN', logo: makeNationalFlagUrl('dk'), country: 'Danemark' },
  ],
};
