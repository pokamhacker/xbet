/**
 * Catalogue Centralisé des Équipes, Compétitions et Modes Fictifs / Cyber
 * Source de vérité pour les logos haute résolution (API-Sports CDN et générateurs SVG UI-Avatars)
 */

import { EXTENDED_LEAGUES_DATA } from '../constants/sportsData';
import {
  FIFA_LEAGUES_LIST,
  getFifaLeagueLogo,
  getFifaLeagueCountry,
  getFifaLeagueContinent,
  FIFA_DEFAULT_TEAMS,
} from '../constants/fifaLeagues';

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  logo: string;
  country?: string;
  leagueId: string;
}

export interface Competition {
  id: string;
  name: string;
  category: 'major' | 'lower' | 'youth' | 'exotic' | 'national' | 'cybersport' | 'fifa';
  sport: string;
  country?: string;
  continent?: 'Europe' | 'Afrique' | 'Amerique' | 'Asie' | 'International';
  logo: string;
  teams: Team[];
  matchesCount?: number;
  isNew?: boolean;
}

// Helper pour générer des blasons d'équipes réalistes et stylisés via UI-Avatars avec contraste garanti
const makeAvatarLogo = (name: string, bg: string = '1E3AEB', fg: string = 'FFFFFF') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=${fg}&size=128&bold=true&rounded=true`;

const BASE_SPORTS_CATALOG: Competition[] = [
  // ==========================================
  // 1. LIGUES MAJEURES (Top European Leagues)
  // ==========================================
  {
    id: 'uefa-champions-league',
    name: 'UEFA Champions League',
    category: 'major',
    sport: 'Football',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    teams: [
      {
        id: 'team-real-madrid',
        name: 'Real Madrid',
        shortName: 'RMA',
        logo: 'https://media.api-sports.io/football/teams/541.png',
        country: 'Espagne',
        leagueId: 'uefa-champions-league',
      },
      {
        id: 'team-bayern-munich',
        name: 'Bayern Munich',
        shortName: 'BAY',
        logo: 'https://media.api-sports.io/football/teams/157.png',
        country: 'Allemagne',
        leagueId: 'uefa-champions-league',
      },
      {
        id: 'team-man-city',
        name: 'Manchester City',
        shortName: 'MCI',
        logo: 'https://media.api-sports.io/football/teams/50.png',
        country: 'Angleterre',
        leagueId: 'uefa-champions-league',
      },
      {
        id: 'team-psg',
        name: 'Paris Saint-Germain',
        shortName: 'PSG',
        logo: 'https://media.api-sports.io/football/teams/85.png',
        country: 'France',
        leagueId: 'uefa-champions-league',
      },
      {
        id: 'team-barcelona',
        name: 'FC Barcelona',
        shortName: 'BAR',
        logo: 'https://media.api-sports.io/football/teams/529.png',
        country: 'Espagne',
        leagueId: 'uefa-champions-league',
      },
      {
        id: 'team-inter',
        name: 'Inter Milan',
        shortName: 'INT',
        logo: 'https://media.api-sports.io/football/teams/505.png',
        country: 'Italie',
        leagueId: 'uefa-champions-league',
      },
    ],
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    category: 'major',
    sport: 'Football',
    country: 'Angleterre',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    teams: [
      {
        id: 'team-arsenal',
        name: 'Arsenal',
        shortName: 'ARS',
        logo: 'https://media.api-sports.io/football/teams/42.png',
        country: 'Angleterre',
        leagueId: 'premier-league',
      },
      {
        id: 'team-chelsea',
        name: 'Chelsea',
        shortName: 'CHE',
        logo: 'https://media.api-sports.io/football/teams/49.png',
        country: 'Angleterre',
        leagueId: 'premier-league',
      },
      {
        id: 'team-liverpool',
        name: 'Liverpool',
        shortName: 'LIV',
        logo: 'https://media.api-sports.io/football/teams/40.png',
        country: 'Angleterre',
        leagueId: 'premier-league',
      },
      {
        id: 'team-man-united',
        name: 'Manchester United',
        shortName: 'MUN',
        logo: 'https://media.api-sports.io/football/teams/33.png',
        country: 'Angleterre',
        leagueId: 'premier-league',
      },
    ],
  },
  {
    id: 'la-liga',
    name: 'La Liga EA Sports',
    category: 'major',
    sport: 'Football',
    country: 'Espagne',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    teams: [
      {
        id: 'team-atletico-madrid',
        name: 'Atlético Madrid',
        shortName: 'ATM',
        logo: 'https://media.api-sports.io/football/teams/530.png',
        country: 'Espagne',
        leagueId: 'la-liga',
      },
      {
        id: 'team-sevilla',
        name: 'Sevilla FC',
        shortName: 'SEV',
        logo: 'https://media.api-sports.io/football/teams/536.png',
        country: 'Espagne',
        leagueId: 'la-liga',
      },
      {
        id: 'team-betis',
        name: 'Real Betis',
        shortName: 'BET',
        logo: 'https://media.api-sports.io/football/teams/543.png',
        country: 'Espagne',
        leagueId: 'la-liga',
      },
      {
        id: 'team-athletic-bilbao',
        name: 'Athletic Bilbao',
        shortName: 'ATH',
        logo: 'https://media.api-sports.io/football/teams/531.png',
        country: 'Espagne',
        leagueId: 'la-liga',
      },
    ],
  },

  // ==========================================
  // 2. DIVISIONS INFÉRIEURES (D2 & D3)
  // ==========================================
  {
    id: 'eng-championship',
    name: 'Championship D2',
    category: 'lower',
    sport: 'Football',
    country: 'Angleterre',
    logo: 'https://media.api-sports.io/football/leagues/40.png',
    teams: [
      {
        id: 'team-leeds',
        name: 'Leeds United',
        shortName: 'LEE',
        logo: 'https://media.api-sports.io/football/teams/63.png',
        country: 'Angleterre',
        leagueId: 'eng-championship',
      },
      {
        id: 'team-leicester',
        name: 'Leicester City',
        shortName: 'LEI',
        logo: 'https://media.api-sports.io/football/teams/46.png',
        country: 'Angleterre',
        leagueId: 'eng-championship',
      },
      {
        id: 'team-southampton',
        name: 'Southampton',
        shortName: 'SOU',
        logo: 'https://media.api-sports.io/football/teams/41.png',
        country: 'Angleterre',
        leagueId: 'eng-championship',
      },
    ],
  },
  {
    id: 'eng-league-one',
    name: 'League One D3',
    category: 'lower',
    sport: 'Football',
    country: 'Angleterre',
    logo: 'https://media.api-sports.io/football/leagues/41.png',
    teams: [
      {
        id: 'team-bolton',
        name: 'Bolton Wanderers',
        shortName: 'BOL',
        logo: 'https://media.api-sports.io/football/teams/68.png',
        country: 'Angleterre',
        leagueId: 'eng-league-one',
      },
      {
        id: 'team-derby',
        name: 'Derby County',
        shortName: 'DER',
        logo: 'https://media.api-sports.io/football/teams/59.png',
        country: 'Angleterre',
        leagueId: 'eng-league-one',
      },
      {
        id: 'team-portsmouth',
        name: 'Portsmouth',
        shortName: 'POR',
        logo: 'https://media.api-sports.io/football/teams/70.png',
        country: 'Angleterre',
        leagueId: 'eng-league-one',
      },
    ],
  },
  {
    id: 'fra-ligue-2',
    name: 'Ligue 2 BKT',
    category: 'lower',
    sport: 'Football',
    country: 'France',
    logo: 'https://media.api-sports.io/football/leagues/62.png',
    teams: [
      {
        id: 'team-saint-etienne',
        name: 'AS Saint-Étienne',
        shortName: 'ASSE',
        logo: 'https://media.api-sports.io/football/teams/1063.png',
        country: 'France',
        leagueId: 'fra-ligue-2',
      },
      {
        id: 'team-bordeaux',
        name: 'Girondins de Bordeaux',
        shortName: 'FCGB',
        logo: 'https://media.api-sports.io/football/teams/78.png',
        country: 'France',
        leagueId: 'fra-ligue-2',
      },
      {
        id: 'team-auxerre',
        name: 'AJ Auxerre',
        shortName: 'AJA',
        logo: 'https://media.api-sports.io/football/teams/108.png',
        country: 'France',
        leagueId: 'fra-ligue-2',
      },
    ],
  },
  {
    id: 'esp-laliga-2',
    name: 'LaLiga 2 Hypermotion',
    category: 'lower',
    sport: 'Football',
    country: 'Espagne',
    logo: 'https://media.api-sports.io/football/leagues/141.png',
    teams: [
      {
        id: 'team-valladolid',
        name: 'Real Valladolid',
        shortName: 'VLD',
        logo: 'https://media.api-sports.io/football/teams/720.png',
        country: 'Espagne',
        leagueId: 'esp-laliga-2',
      },
      {
        id: 'team-espanyol',
        name: 'RCD Espanyol',
        shortName: 'ESP',
        logo: 'https://media.api-sports.io/football/teams/540.png',
        country: 'Espagne',
        leagueId: 'esp-laliga-2',
      },
      {
        id: 'team-zaragoza',
        name: 'Real Zaragoza',
        shortName: 'ZAR',
        logo: 'https://media.api-sports.io/football/teams/733.png',
        country: 'Espagne',
        leagueId: 'esp-laliga-2',
      },
    ],
  },

  // ==========================================
  // 3. TOURNOIS JEUNES (U17 / U19 / U21)
  // ==========================================
  {
    id: 'uefa-youth-u19',
    name: 'UEFA Youth League U19',
    category: 'youth',
    sport: 'Football',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/818.png',
    teams: [
      {
        id: 'team-rm-u19',
        name: 'Real Madrid U19',
        shortName: 'RMA U19',
        logo: 'https://media.api-sports.io/football/teams/541.png',
        country: 'Espagne',
        leagueId: 'uefa-youth-u19',
      },
      {
        id: 'team-milan-u19',
        name: 'Milan U19',
        shortName: 'MIL U19',
        logo: 'https://media.api-sports.io/football/teams/489.png',
        country: 'Italie',
        leagueId: 'uefa-youth-u19',
      },
      {
        id: 'team-benfica-u19',
        name: 'Benfica U19',
        shortName: 'SLB U19',
        logo: 'https://media.api-sports.io/football/teams/211.png',
        country: 'Portugal',
        leagueId: 'uefa-youth-u19',
      },
    ],
  },
  {
    id: 'premier-league-2-u21',
    name: 'Premier League 2 U21',
    category: 'youth',
    sport: 'Football',
    country: 'Angleterre',
    logo: 'https://media.api-sports.io/football/leagues/696.png',
    teams: [
      {
        id: 'team-chelsea-u21',
        name: 'Chelsea U21',
        shortName: 'CHE U21',
        logo: 'https://media.api-sports.io/football/teams/49.png',
        country: 'Angleterre',
        leagueId: 'premier-league-2-u21',
      },
      {
        id: 'team-arsenal-u21',
        name: 'Arsenal U21',
        shortName: 'ARS U21',
        logo: 'https://media.api-sports.io/football/teams/42.png',
        country: 'Angleterre',
        leagueId: 'premier-league-2-u21',
      },
      {
        id: 'team-mancity-u21',
        name: 'Manchester City U21',
        shortName: 'MCI U21',
        logo: 'https://media.api-sports.io/football/teams/50.png',
        country: 'Angleterre',
        leagueId: 'premier-league-2-u21',
      },
    ],
  },
  {
    id: 'primavera-u19',
    name: 'Campionato Primavera 1 U19',
    category: 'youth',
    sport: 'Football',
    country: 'Italie',
    logo: 'https://media.api-sports.io/football/leagues/819.png',
    teams: [
      {
        id: 'team-inter-u19',
        name: 'Inter U19',
        shortName: 'INT U19',
        logo: 'https://media.api-sports.io/football/teams/505.png',
        country: 'Italie',
        leagueId: 'primavera-u19',
      },
      {
        id: 'team-juve-u19',
        name: 'Juventus U19',
        shortName: 'JUV U19',
        logo: 'https://media.api-sports.io/football/teams/496.png',
        country: 'Italie',
        leagueId: 'primavera-u19',
      },
      {
        id: 'team-roma-u19',
        name: 'Roma U19',
        shortName: 'ROM U19',
        logo: 'https://media.api-sports.io/football/teams/497.png',
        country: 'Italie',
        leagueId: 'primavera-u19',
      },
    ],
  },
  {
    id: 'nextgen-trophy-u17',
    name: 'NextGen Trophy U17',
    category: 'youth',
    sport: 'Football',
    country: 'International',
    logo: 'https://media.api-sports.io/football/leagues/675.png',
    teams: [
      {
        id: 'team-salzburg-u17',
        name: 'Red Bull Salzburg U17',
        shortName: 'RBS U17',
        logo: 'https://media.api-sports.io/football/teams/571.png',
        country: 'Autriche',
        leagueId: 'nextgen-trophy-u17',
      },
      {
        id: 'team-bayern-u17',
        name: 'Bayern Munich U17',
        shortName: 'FCB U17',
        logo: 'https://media.api-sports.io/football/teams/157.png',
        country: 'Allemagne',
        leagueId: 'nextgen-trophy-u17',
      },
      {
        id: 'team-ajax-u17',
        name: 'Ajax U17',
        shortName: 'AJA U17',
        logo: 'https://media.api-sports.io/football/teams/194.png',
        country: 'Pays-Bas',
        leagueId: 'nextgen-trophy-u17',
      },
    ],
  },

  // ==========================================
  // 4. LIGUES EXOTIQUES (Vietnam & Koweït)
  // ==========================================
  {
    id: 'vietnam-vleague',
    name: 'Vietnam . V-League',
    category: 'exotic',
    sport: 'Football',
    country: 'Vietnam',
    logo: 'https://media.api-sports.io/football/leagues/377.png',
    teams: [
      {
        id: 'team-albany-rush',
        name: 'Albany Rush',
        shortName: 'ALB',
        logo: 'https://media.api-sports.io/football/teams/10200.png',
        country: 'Vietnam',
        leagueId: 'vietnam-vleague',
      },
      {
        id: 'team-aksu-pavlodar',
        name: 'Aksu Pavlodar',
        shortName: 'AKS',
        logo: 'https://media.api-sports.io/football/teams/18163.png',
        country: 'Vietnam',
        leagueId: 'vietnam-vleague',
      },
      {
        id: 'team-aberdeen-fc',
        name: 'Aberdeen Fc',
        shortName: 'ABE',
        logo: 'https://media.api-sports.io/football/teams/257.png',
        country: 'Vietnam',
        leagueId: 'vietnam-vleague',
      },
      {
        id: 'team-aarau',
        name: 'Aarau',
        shortName: 'AAR',
        logo: 'https://media.api-sports.io/football/teams/700.png',
        country: 'Vietnam',
        leagueId: 'vietnam-vleague',
      },
      {
        id: 'team-hanoi-fc',
        name: 'Hà Nội FC',
        shortName: 'HAN',
        logo: 'https://media.api-sports.io/football/teams/5217.png',
        country: 'Vietnam',
        leagueId: 'vietnam-vleague',
      },
      {
        id: 'team-viettel-fc',
        name: 'Viettel FC',
        shortName: 'VIE',
        logo: 'https://media.api-sports.io/football/teams/5218.png',
        country: 'Vietnam',
        leagueId: 'vietnam-vleague',
      },
    ],
  },
  {
    id: 'koweït-championnat',
    name: 'Koweït . Championnat du Koweït',
    category: 'exotic',
    sport: 'Football',
    country: 'Koweït',
    logo: 'https://media.api-sports.io/football/leagues/351.png',
    teams: [
      {
        id: 'team-al-salmiya',
        name: 'Al-Salmiya',
        shortName: 'SAL',
        logo: 'https://media.api-sports.io/football/teams/4442.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-al-arabi',
        name: 'Al-Arabi Kuwait',
        shortName: 'ARA',
        logo: 'https://media.api-sports.io/football/teams/4443.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-al-qadsia',
        name: 'Al-Qadsia',
        shortName: 'QAD',
        logo: 'https://media.api-sports.io/football/teams/4444.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-kazma-sc',
        name: 'Kazma SC',
        shortName: 'KAZ',
        logo: 'https://media.api-sports.io/football/teams/4445.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-29-de-septiembre',
        name: '29 De Septiembre',
        shortName: '29S',
        logo: 'https://media.api-sports.io/football/teams/2600.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-9-octobre',
        name: '9 Octobre',
        shortName: '9OCT',
        logo: 'https://media.api-sports.io/football/teams/12470.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-1-fsv-mayence-05',
        name: '1 Fsv Mayence 05',
        shortName: 'M05',
        logo: 'https://media.api-sports.io/football/teams/164.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
      {
        id: 'team-12-de-octubre',
        name: '12 De Octubre',
        shortName: '12OCT',
        logo: 'https://media.api-sports.io/football/teams/2598.png',
        country: 'Koweït',
        leagueId: 'koweït-championnat',
      },
    ],
  },

  // ==========================================
  // 5. SÉLECTIONS NATIONALES
  // ==========================================
  {
    id: 'fifa-world-cup',
    name: 'Coupe du Monde FIFA',
    category: 'national',
    sport: 'Football',
    country: 'Monde',
    logo: 'https://media.api-sports.io/football/leagues/1.png',
    teams: [
      {
        id: 'team-france',
        name: 'France',
        shortName: 'FRA',
        logo: 'https://media.api-sports.io/football/teams/2.png',
        country: 'France',
        leagueId: 'fifa-world-cup',
      },
      {
        id: 'team-bresil',
        name: 'Brésil',
        shortName: 'BRA',
        logo: 'https://media.api-sports.io/football/teams/6.png',
        country: 'Brésil',
        leagueId: 'fifa-world-cup',
      },
      {
        id: 'team-argentine',
        name: 'Argentine',
        shortName: 'ARG',
        logo: 'https://media.api-sports.io/football/teams/26.png',
        country: 'Argentine',
        leagueId: 'fifa-world-cup',
      },
      {
        id: 'team-angleterre',
        name: 'Angleterre',
        shortName: 'ENG',
        logo: 'https://media.api-sports.io/football/teams/10.png',
        country: 'Angleterre',
        leagueId: 'fifa-world-cup',
      },
    ],
  },
  {
    id: 'caf-can',
    name: "Coupe d'Afrique des Nations (CAN)",
    category: 'national',
    sport: 'Football',
    country: 'Afrique',
    logo: 'https://media.api-sports.io/football/leagues/6.png',
    teams: [
      {
        id: 'team-cameroun',
        name: 'Cameroun',
        shortName: 'CMR',
        logo: 'https://media.api-sports.io/football/teams/1504.png',
        country: 'Cameroun',
        leagueId: 'caf-can',
      },
      {
        id: 'team-cote-divoire',
        name: "Côte d'Ivoire",
        shortName: 'CIV',
        logo: 'https://media.api-sports.io/football/teams/1501.png',
        country: "Côte d'Ivoire",
        leagueId: 'caf-can',
      },
      {
        id: 'team-senegal',
        name: 'Sénégal',
        shortName: 'SEN',
        logo: 'https://media.api-sports.io/football/teams/13.png',
        country: 'Sénégal',
        leagueId: 'caf-can',
      },
      {
        id: 'team-maroc',
        name: 'Maroc',
        shortName: 'MAR',
        logo: 'https://media.api-sports.io/football/teams/31.png',
        country: 'Maroc',
        leagueId: 'caf-can',
      },
    ],
  },

  // ==========================================
  // 6. CYBERSPORT & LIGUES FICTIVES 24/7
  // ==========================================
  {
    id: 'fifa-3x3-europe',
    name: "FIFA 3x3 Coupe d'Europe",
    category: 'cybersport',
    sport: 'Cyber-Sport',
    country: 'Global',
    logo: makeAvatarLogo('FIFA 3x3', '2563EB', 'FFFFFF'),
    teams: [
      {
        id: 'team-fast-blitz-red',
        name: 'Fast Blitz Red',
        shortName: 'FBR',
        logo: makeAvatarLogo('Blitz Red', 'DC2626', 'FFFFFF'),
        leagueId: 'fifa-3x3-europe',
      },
      {
        id: 'team-fast-blitz-blue',
        name: 'Fast Blitz Blue',
        shortName: 'FBB',
        logo: makeAvatarLogo('Blitz Blue', '1D4ED8', 'FFFFFF'),
        leagueId: 'fifa-3x3-europe',
      },
      {
        id: 'team-arena-shadows',
        name: 'Arena Shadows',
        shortName: 'ARS',
        logo: makeAvatarLogo('Shadows', '334155', 'FFFFFF'),
        leagueId: 'fifa-3x3-europe',
      },
      {
        id: 'team-speed-titans',
        name: 'Speed Titans',
        shortName: 'SPT',
        logo: makeAvatarLogo('Titans', 'D97706', 'FFFFFF'),
        leagueId: 'fifa-3x3-europe',
      },
    ],
  },
  {
    id: 'cyber-star-league-3x3',
    name: 'Cyber Star League 3x3 Division Alpha',
    category: 'cybersport',
    sport: 'Cyber-Sport',
    country: 'Global',
    logo: makeAvatarLogo('CSL 3x3', '7C3AED', 'FFFFFF'),
    teams: [
      {
        id: 'team-vortex-wolves',
        name: 'Vortex Wolves',
        shortName: 'VTW',
        logo: makeAvatarLogo('Vortex Wolves', '4F46E5', 'FFFFFF'),
        leagueId: 'cyber-star-league-3x3',
      },
      {
        id: 'team-apex-titans-fc',
        name: 'Apex Titans FC',
        shortName: 'APX',
        logo: makeAvatarLogo('Apex Titans', 'D97706', 'FFFFFF'),
        leagueId: 'cyber-star-league-3x3',
      },
      {
        id: 'team-neo-berlin-city',
        name: 'Neo Berlin City',
        shortName: 'NBC',
        logo: makeAvatarLogo('Neo Berlin', '0284C7', 'FFFFFF'),
        leagueId: 'cyber-star-league-3x3',
      },
      {
        id: 'team-solaris-valencia',
        name: 'Solaris Valencia',
        shortName: 'SLV',
        logo: makeAvatarLogo('Solaris', 'EA580C', 'FFFFFF'),
        leagueId: 'cyber-star-league-3x3',
      },
    ],
  },
  {
    id: 'balkan-regional-league',
    name: 'Balkan Regional League',
    category: 'cybersport',
    sport: 'Football',
    country: 'Balkans',
    logo: makeAvatarLogo('Balkan Reg', '047857', 'FFFFFF'),
    teams: [
      {
        id: 'team-belgrade-stars',
        name: 'Belgrade Stars',
        shortName: 'BST',
        logo: makeAvatarLogo('Belgrade', 'DC2626', 'FFFFFF'),
        leagueId: 'balkan-regional-league',
      },
      {
        id: 'team-zagreb-dynamo',
        name: 'Zagreb Dynamo 3x3',
        shortName: 'ZAG',
        logo: makeAvatarLogo('Zagreb', '1E40AF', 'FFFFFF'),
        leagueId: 'balkan-regional-league',
      },
      {
        id: 'team-sofia-eagles',
        name: 'Sofia Eagles',
        shortName: 'SOF',
        logo: makeAvatarLogo('Sofia', '059669', 'FFFFFF'),
        leagueId: 'balkan-regional-league',
      },
    ],
  },
  {
    id: 'ligue-pro-caraibes',
    name: 'Ligue Pro Caraïbéenne',
    category: 'cybersport',
    sport: 'Football',
    country: 'Caraïbes',
    logo: makeAvatarLogo('LPC Pro', '0284C7', 'FFFFFF'),
    teams: [
      {
        id: 'team-caribbean-pirates',
        name: 'Caribbean Pirates FC',
        shortName: 'PIR',
        logo: makeAvatarLogo('Pirates FC', '0F172A', '38BDF8'),
        leagueId: 'ligue-pro-caraibes',
      },
      {
        id: 'team-havana-islanders',
        name: 'Havana Islanders',
        shortName: 'HAV',
        logo: makeAvatarLogo('Havana ISL', 'EA580C', 'FFFFFF'),
        leagueId: 'ligue-pro-caraibes',
      },
      {
        id: 'team-kingston-strikers',
        name: 'Kingston Strikers',
        shortName: 'KIN',
        logo: makeAvatarLogo('Kingston', '16A34A', 'FEF08A'),
        leagueId: 'ligue-pro-caraibes',
      },
    ],
  },

  // ==========================================
  // 7. COMPÉTITIONS OFFICIELLES FIFA (Clubs & Sélections Réels Exclusivement)
  // ==========================================
  {
    id: 'fifa-ligue-des-champions',
    name: 'FIFA. Ligue des Champions',
    category: 'fifa',
    sport: 'FIFA',
    country: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    teams: [
      {
        id: 'fifa-team-real-madrid',
        name: 'Real Madrid',
        shortName: 'RMA',
        logo: 'https://media.api-sports.io/football/teams/541.png',
        country: 'Espagne',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-man-city',
        name: 'Manchester City',
        shortName: 'MCI',
        logo: 'https://media.api-sports.io/football/teams/50.png',
        country: 'Angleterre',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-bayern-munich',
        name: 'Bayern Munich',
        shortName: 'BAY',
        logo: 'https://media.api-sports.io/football/teams/157.png',
        country: 'Allemagne',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-psg',
        name: 'Paris Saint-Germain',
        shortName: 'PSG',
        logo: 'https://media.api-sports.io/football/teams/85.png',
        country: 'France',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-barcelona',
        name: 'FC Barcelona',
        shortName: 'BAR',
        logo: 'https://media.api-sports.io/football/teams/529.png',
        country: 'Espagne',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-inter',
        name: 'Inter Milan',
        shortName: 'INT',
        logo: 'https://media.api-sports.io/football/teams/505.png',
        country: 'Italie',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-arsenal',
        name: 'Arsenal',
        shortName: 'ARS',
        logo: 'https://media.api-sports.io/football/teams/42.png',
        country: 'Angleterre',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-liverpool',
        name: 'Liverpool',
        shortName: 'LIV',
        logo: 'https://media.api-sports.io/football/teams/40.png',
        country: 'Angleterre',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-dortmund',
        name: 'Borussia Dortmund',
        shortName: 'BVB',
        logo: 'https://media.api-sports.io/football/teams/165.png',
        country: 'Allemagne',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-juventus',
        name: 'Juventus',
        shortName: 'JUV',
        logo: 'https://media.api-sports.io/football/teams/496.png',
        country: 'Italie',
        leagueId: 'fifa-ligue-des-champions',
      },
    ],
  },
  {
    id: 'fifa-angleterre',
    name: "FIFA. Championnat d'Angleterre",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Angleterre',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    teams: [
      {
        id: 'fifa-team-man-city-pl',
        name: 'Manchester City',
        shortName: 'MCI',
        logo: 'https://media.api-sports.io/football/teams/50.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-arsenal-pl',
        name: 'Arsenal',
        shortName: 'ARS',
        logo: 'https://media.api-sports.io/football/teams/42.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-liverpool-pl',
        name: 'Liverpool',
        shortName: 'LIV',
        logo: 'https://media.api-sports.io/football/teams/40.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-chelsea-pl',
        name: 'Chelsea',
        shortName: 'CHE',
        logo: 'https://media.api-sports.io/football/teams/49.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-man-united-pl',
        name: 'Manchester United',
        shortName: 'MUN',
        logo: 'https://media.api-sports.io/football/teams/33.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-tottenham-pl',
        name: 'Tottenham Hotspur',
        shortName: 'TOT',
        logo: 'https://media.api-sports.io/football/teams/47.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-newcastle-pl',
        name: 'Newcastle United',
        shortName: 'NEW',
        logo: 'https://media.api-sports.io/football/teams/34.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
      {
        id: 'fifa-team-aston-villa-pl',
        name: 'Aston Villa',
        shortName: 'AVL',
        logo: 'https://media.api-sports.io/football/teams/66.png',
        country: 'Angleterre',
        leagueId: 'fifa-angleterre',
      },
    ],
  },
  {
    id: 'fifa-espagne',
    name: "FIFA. Championnat d'Espagne",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Espagne',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    teams: [
      {
        id: 'fifa-team-real-madrid-es',
        name: 'Real Madrid',
        shortName: 'RMA',
        logo: 'https://media.api-sports.io/football/teams/541.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-barcelona-es',
        name: 'FC Barcelona',
        shortName: 'BAR',
        logo: 'https://media.api-sports.io/football/teams/529.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-atletico-madrid-es',
        name: 'Atlético Madrid',
        shortName: 'ATM',
        logo: 'https://media.api-sports.io/football/teams/530.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-sevilla-es',
        name: 'Sevilla FC',
        shortName: 'SEV',
        logo: 'https://media.api-sports.io/football/teams/536.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-real-betis-es',
        name: 'Real Betis',
        shortName: 'BET',
        logo: 'https://media.api-sports.io/football/teams/543.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-athletic-bilbao-es',
        name: 'Athletic Bilbao',
        shortName: 'ATH',
        logo: 'https://media.api-sports.io/football/teams/531.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-real-sociedad-es',
        name: 'Real Sociedad',
        shortName: 'RSO',
        logo: 'https://media.api-sports.io/football/teams/548.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
      {
        id: 'fifa-team-villarreal-es',
        name: 'Villarreal',
        shortName: 'VIL',
        logo: 'https://media.api-sports.io/football/teams/533.png',
        country: 'Espagne',
        leagueId: 'fifa-espagne',
      },
    ],
  },
  {
    id: 'fifa-italie',
    name: "FIFA. Championnat d'Italie",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Italie',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    teams: [
      {
        id: 'fifa-team-inter-it',
        name: 'Inter Milan',
        shortName: 'INT',
        logo: 'https://media.api-sports.io/football/teams/505.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-milan-it',
        name: 'AC Milan',
        shortName: 'MIL',
        logo: 'https://media.api-sports.io/football/teams/489.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-juventus-it',
        name: 'Juventus',
        shortName: 'JUV',
        logo: 'https://media.api-sports.io/football/teams/496.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-napoli-it',
        name: 'Napoli',
        shortName: 'NAP',
        logo: 'https://media.api-sports.io/football/teams/492.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-roma-it',
        name: 'AS Roma',
        shortName: 'ROM',
        logo: 'https://media.api-sports.io/football/teams/497.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-lazio-it',
        name: 'Lazio',
        shortName: 'LAZ',
        logo: 'https://media.api-sports.io/football/teams/487.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-atalanta-it',
        name: 'Atalanta',
        shortName: 'ATA',
        logo: 'https://media.api-sports.io/football/teams/499.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
      {
        id: 'fifa-team-fiorentina-it',
        name: 'Fiorentina',
        shortName: 'FIO',
        logo: 'https://media.api-sports.io/football/teams/502.png',
        country: 'Italie',
        leagueId: 'fifa-italie',
      },
    ],
  },
  {
    id: 'fifa-allemagne',
    name: "FIFA. Championnat d'Allemagne",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Allemagne',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    teams: [
      {
        id: 'fifa-team-bayern-de',
        name: 'Bayern Munich',
        shortName: 'BAY',
        logo: 'https://media.api-sports.io/football/teams/157.png',
        country: 'Allemagne',
        leagueId: 'fifa-allemagne',
      },
      {
        id: 'fifa-team-dortmund-de',
        name: 'Borussia Dortmund',
        shortName: 'BVB',
        logo: 'https://media.api-sports.io/football/teams/165.png',
        country: 'Allemagne',
        leagueId: 'fifa-allemagne',
      },
      {
        id: 'fifa-team-leverkusen-de',
        name: 'Bayer Leverkusen',
        shortName: 'B04',
        logo: 'https://media.api-sports.io/football/teams/168.png',
        country: 'Allemagne',
        leagueId: 'fifa-allemagne',
      },
      {
        id: 'fifa-team-leipzig-de',
        name: 'RB Leipzig',
        shortName: 'RBL',
        logo: 'https://media.api-sports.io/football/teams/173.png',
        country: 'Allemagne',
        leagueId: 'fifa-allemagne',
      },
      {
        id: 'fifa-team-frankfurt-de',
        name: 'Eintracht Frankfurt',
        shortName: 'SGE',
        logo: 'https://media.api-sports.io/football/teams/169.png',
        country: 'Allemagne',
        leagueId: 'fifa-allemagne',
      },
      {
        id: 'fifa-team-stuttgart-de',
        name: 'VfB Stuttgart',
        shortName: 'VFB',
        logo: 'https://media.api-sports.io/football/teams/172.png',
        country: 'Allemagne',
        leagueId: 'fifa-allemagne',
      },
    ],
  },
  {
    id: 'fifa-france',
    name: "FIFA. Championnat de France",
    category: 'fifa',
    sport: 'FIFA',
    country: 'France',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    teams: [
      {
        id: 'fifa-team-psg-fr',
        name: 'Paris Saint-Germain',
        shortName: 'PSG',
        logo: 'https://media.api-sports.io/football/teams/85.png',
        country: 'France',
        leagueId: 'fifa-france',
      },
      {
        id: 'fifa-team-marseille-fr',
        name: 'Olympique de Marseille',
        shortName: 'OM',
        logo: 'https://media.api-sports.io/football/teams/81.png',
        country: 'France',
        leagueId: 'fifa-france',
      },
      {
        id: 'fifa-team-lyon-fr',
        name: 'Olympique Lyonnais',
        shortName: 'OL',
        logo: 'https://media.api-sports.io/football/teams/80.png',
        country: 'France',
        leagueId: 'fifa-france',
      },
      {
        id: 'fifa-team-monaco-fr',
        name: 'AS Monaco',
        shortName: 'ASM',
        logo: 'https://media.api-sports.io/football/teams/91.png',
        country: 'France',
        leagueId: 'fifa-france',
      },
      {
        id: 'fifa-team-lille-fr',
        name: 'Lille OSC',
        shortName: 'LOSC',
        logo: 'https://media.api-sports.io/football/teams/79.png',
        country: 'France',
        leagueId: 'fifa-france',
      },
      {
        id: 'fifa-team-rennes-fr',
        name: 'Stade Rennais',
        shortName: 'REN',
        logo: 'https://media.api-sports.io/football/teams/94.png',
        country: 'France',
        leagueId: 'fifa-france',
      },
    ],
  },
  {
    id: 'fifa-coupe-du-monde',
    name: 'FIFA. Coupe du Monde',
    category: 'fifa',
    sport: 'FIFA',
    country: 'Monde',
    logo: 'https://media.api-sports.io/football/leagues/1.png',
    teams: [
      {
        id: 'fifa-team-france-wc',
        name: 'France',
        shortName: 'FRA',
        logo: 'https://media.api-sports.io/football/teams/2.png',
        country: 'France',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-bresil-wc',
        name: 'Brésil',
        shortName: 'BRA',
        logo: 'https://media.api-sports.io/football/teams/6.png',
        country: 'Brésil',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-argentine-wc',
        name: 'Argentine',
        shortName: 'ARG',
        logo: 'https://media.api-sports.io/football/teams/26.png',
        country: 'Argentine',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-angleterre-wc',
        name: 'Angleterre',
        shortName: 'ENG',
        logo: 'https://media.api-sports.io/football/teams/10.png',
        country: 'Angleterre',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-allemagne-wc',
        name: 'Allemagne',
        shortName: 'GER',
        logo: 'https://media.api-sports.io/football/teams/25.png',
        country: 'Allemagne',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-espagne-wc',
        name: 'Espagne',
        shortName: 'ESP',
        logo: 'https://media.api-sports.io/football/teams/9.png',
        country: 'Espagne',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-portugal-wc',
        name: 'Portugal',
        shortName: 'POR',
        logo: 'https://media.api-sports.io/football/teams/27.png',
        country: 'Portugal',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-pays-bas-wc',
        name: 'Pays-Bas',
        shortName: 'NED',
        logo: 'https://media.api-sports.io/football/teams/1118.png',
        country: 'Pays-Bas',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-belgique-wc',
        name: 'Belgique',
        shortName: 'BEL',
        logo: 'https://media.api-sports.io/football/teams/1.png',
        country: 'Belgique',
        leagueId: 'fifa-coupe-du-monde',
      },
      {
        id: 'fifa-team-italie-wc',
        name: 'Italie',
        shortName: 'ITA',
        logo: 'https://media.api-sports.io/football/teams/768.png',
        country: 'Italie',
        leagueId: 'fifa-coupe-du-monde',
      },
    ],
  },
];

// Conversion des 60 championnats et 900+ clubs étendus en format Competition
const extendedCompetitions: Competition[] = EXTENDED_LEAGUES_DATA.map((league) => ({
  id: league.id,
  name: league.name,
  category: (league.category === 'Europe'
    ? (league.isMajor ? 'major' : 'lower')
    : league.category === 'International'
    ? 'national'
    : 'exotic') as Competition['category'],
  sport: 'Football',
  country: league.country,
  continent: league.category,
  logo: league.logoUrl,
  teams: league.clubs.map((club) => ({
    id: `team-${club.id}`,
    name: club.name,
    shortName: club.shortCode,
    logo: club.logoUrl,
    country: league.country,
    leagueId: league.id,
  })),
}));

// Conversion des 11 championnats FIFA / EA FC officiels
export const FC_FIFA_COMPETITIONS: Competition[] = FIFA_LEAGUES_LIST.map((fl) => {
  const teamsData = FIFA_DEFAULT_TEAMS[fl.flagType] || FIFA_DEFAULT_TEAMS.globe;
  return {
    id: fl.id,
    name: fl.name,
    category: 'fifa' as const,
    sport: 'FIFA',
    country: getFifaLeagueCountry(fl.flagType),
    continent: getFifaLeagueContinent(fl.flagType),
    logo: getFifaLeagueLogo(fl.flagType),
    matchesCount: fl.matchesCount,
    isNew: fl.isNew,
    teams: teamsData.map((t) => ({
      id: `${fl.id}-${t.id}`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: t.country,
      leagueId: fl.id,
    })),
  };
});

export const SPORTS_CATALOG: Competition[] = (() => {
  const merged: Competition[] = [...FC_FIFA_COMPETITIONS, ...BASE_SPORTS_CATALOG];

  for (const extComp of extendedCompetitions) {
    const existingIndex = merged.findIndex(
      (c) =>
        c.id.toLowerCase() === extComp.id.toLowerCase() ||
        c.name.toLowerCase() === extComp.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Enrichit la compétition existante avec les clubs manquants
      const existingComp = merged[existingIndex];
      const existingTeamNames = new Set(
        existingComp.teams.map((t) => t.name.toLowerCase())
      );
      const newTeams = extComp.teams.filter(
        (t) => !existingTeamNames.has(t.name.toLowerCase())
      );
      existingComp.teams = [...existingComp.teams, ...newTeams];
      if (!existingComp.continent) {
        existingComp.continent = extComp.continent;
      }
    } else {
      merged.push(extComp);
    }
  }

  return merged;
})();

// ==========================================
// UTILITAIRES D'ACCÈS ET RECHERCHE
// ==========================================

/**
 * Récupère une compétition par son identifiant unique
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|ac|sc|as|cd|us|rb|ssc|fsv|rc|ud|ca)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Récupère une compétition par son identifiant unique ou nom
 */
export function getCompetitionById(id: string): Competition | undefined {
  if (!id) return undefined;
  const clean = id.trim().toLowerCase();

  // 1. Recherche exacte
  const exact = SPORTS_CATALOG.find(
    (c) => c.id.toLowerCase() === clean || c.name.toLowerCase() === clean
  );
  if (exact) return exact;

  // 2. Recherche normalisée
  const normClean = normalizeName(clean);
  if (normClean.length >= 3) {
    const normMatch = SPORTS_CATALOG.find(
      (c) => normalizeName(c.name) === normClean || normalizeName(c.id) === normClean
    );
    if (normMatch) return normMatch;
  }

  // 3. Recherche par inclusion
  return SPORTS_CATALOG.find(
    (c) => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase())
  );
}

/**
 * Récupère une équipe par son identifiant unique ou son nom avec tolérance orthographique
 */
export function getTeamById(idOrName: string): Team | undefined {
  if (!idOrName) return undefined;
  const query = idOrName.trim().toLowerCase();

  // 1. Recherche exacte (ID, Nom exact, Code court)
  for (const comp of SPORTS_CATALOG) {
    const found = comp.teams.find(
      (t) =>
        t.id.toLowerCase() === query ||
        t.name.toLowerCase() === query ||
        (t.shortName && t.shortName.toLowerCase() === query)
    );
    if (found) return found;
  }

  // 2. Recherche normalisée (sans "FC", "CF", accents, tirets)
  const normQuery = normalizeName(query);
  if (normQuery.length >= 3) {
    for (const comp of SPORTS_CATALOG) {
      const found = comp.teams.find(
        (t) =>
          normalizeName(t.name) === normQuery ||
          (t.shortName && normalizeName(t.shortName) === normQuery)
      );
      if (found) return found;
    }
  }

  // 3. Recherche par inclusion de nom (ex: "Liverpool" dans "Liverpool FC")
  for (const comp of SPORTS_CATALOG) {
    const found = comp.teams.find(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        query.includes(t.name.toLowerCase())
    );
    if (found) return found;
  }

  return undefined;
}

/**
 * Résout le logo officiel API-Sports CDN d'une équipe ou renvoie null si introuvable
 */
export function resolveTeamLogo(idOrName: string): string | null {
  const team = getTeamById(idOrName);
  if (team && team.logo && !team.logo.includes('ui-avatars')) {
    return team.logo;
  }
  return null;
}

/**
 * Résout le logo officiel API-Sports CDN d'une compétition ou renvoie null si introuvable
 */
export function resolveCompetitionLogo(idOrName: string): string | null {
  const comp = getCompetitionById(idOrName);
  if (comp && comp.logo && !comp.logo.includes('ui-avatars')) {
    return comp.logo;
  }
  return null;
}

/**
 * Recherche des équipes correspondant à une requête texte (nom, ligue, pays)
 */
export function searchTeams(query: string): Team[] {
  if (!query || query.trim() === '') return [];
  const q = query.trim().toLowerCase();
  const results: Team[] = [];

  for (const comp of SPORTS_CATALOG) {
    for (const team of comp.teams) {
      if (
        team.name.toLowerCase().includes(q) ||
        (team.shortName && team.shortName.toLowerCase().includes(q)) ||
        (team.country && team.country.toLowerCase().includes(q)) ||
        comp.name.toLowerCase().includes(q)
      ) {
        results.push(team);
      }
    }
  }

  return results;
}
