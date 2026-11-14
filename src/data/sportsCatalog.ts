/**
 * Catalogue Centralisé des Équipes, Compétitions et Modes Fictifs / Cyber
 * Source de vérité pour les logos haute résolution (API-Sports CDN et générateurs SVG UI-Avatars)
 */

import { EXTENDED_LEAGUES_DATA } from '../constants/sportsData';
import { AFRICAN_COUNTRIES, findAfricanCountry } from './africanCountries';
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
    name: "Ligue des champions de l'UEFA",
    category: 'major',
    sport: 'Football',
    country: 'Europe',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    teams: [
      { id: 'team-real-madrid', name: 'Real Madrid', shortName: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Espagne', leagueId: 'uefa-champions-league' },
      { id: 'team-man-city', name: 'Manchester City', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'Angleterre', leagueId: 'uefa-champions-league' },
      { id: 'team-bayern-munich', name: 'Bayern Munich', shortName: 'BAY', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Allemagne', leagueId: 'uefa-champions-league' },
      { id: 'team-psg', name: 'Paris Saint-Germain', shortName: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png', country: 'France', leagueId: 'uefa-champions-league' },
      { id: 'team-barcelona', name: 'FC Barcelona', shortName: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', country: 'Espagne', leagueId: 'uefa-champions-league' },
      { id: 'team-inter', name: 'Inter Milan', shortName: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', country: 'Italie', leagueId: 'uefa-champions-league' },
      { id: 'team-arsenal', name: 'Arsenal', shortName: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', country: 'Angleterre', leagueId: 'uefa-champions-league' },
      { id: 'team-liverpool', name: 'Liverpool', shortName: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', country: 'Angleterre', leagueId: 'uefa-champions-league' },
      { id: 'team-dortmund', name: 'Borussia Dortmund', shortName: 'BVB', logo: 'https://media.api-sports.io/football/teams/165.png', country: 'Allemagne', leagueId: 'uefa-champions-league' },
      { id: 'team-leverkusen', name: 'Bayer Leverkusen', shortName: 'B04', logo: 'https://media.api-sports.io/football/teams/168.png', country: 'Allemagne', leagueId: 'uefa-champions-league' },
      { id: 'team-atletico', name: 'Atlético Madrid', shortName: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', country: 'Espagne', leagueId: 'uefa-champions-league' },
      { id: 'team-atalanta', name: 'Atalanta', shortName: 'ATA', logo: 'https://media.api-sports.io/football/teams/499.png', country: 'Italie', leagueId: 'uefa-champions-league' },
      { id: 'team-juventus', name: 'Juventus', shortName: 'JUV', logo: 'https://media.api-sports.io/football/teams/496.png', country: 'Italie', leagueId: 'uefa-champions-league' },
      { id: 'team-ac-milan', name: 'AC Milan', shortName: 'MIL', logo: 'https://media.api-sports.io/football/teams/489.png', country: 'Italie', leagueId: 'uefa-champions-league' },
      { id: 'team-benfica', name: 'Benfica', shortName: 'BEN', logo: 'https://media.api-sports.io/football/teams/211.png', country: 'Portugal', leagueId: 'uefa-champions-league' },
      { id: 'team-sporting-cp', name: 'Sporting CP', shortName: 'SCP', logo: 'https://media.api-sports.io/football/teams/228.png', country: 'Portugal', leagueId: 'uefa-champions-league' },
      { id: 'team-porto', name: 'FC Porto', shortName: 'POR', logo: 'https://media.api-sports.io/football/teams/212.png', country: 'Portugal', leagueId: 'uefa-champions-league' },
      { id: 'team-rb-leipzig', name: 'RB Leipzig', shortName: 'RBL', logo: 'https://media.api-sports.io/football/teams/173.png', country: 'Allemagne', leagueId: 'uefa-champions-league' },
      { id: 'team-aston-villa', name: 'Aston Villa', shortName: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', country: 'Angleterre', leagueId: 'uefa-champions-league' },
      { id: 'team-bologna', name: 'Bologna', shortName: 'BOL', logo: 'https://media.api-sports.io/football/teams/500.png', country: 'Italie', leagueId: 'uefa-champions-league' },
      { id: 'team-girona', name: 'Girona', shortName: 'GIR', logo: 'https://media.api-sports.io/football/teams/547.png', country: 'Espagne', leagueId: 'uefa-champions-league' },
      { id: 'team-stuttgart', name: 'VfB Stuttgart', shortName: 'STU', logo: 'https://media.api-sports.io/football/teams/172.png', country: 'Allemagne', leagueId: 'uefa-champions-league' },
      { id: 'team-psv', name: 'PSV Eindhoven', shortName: 'PSV', logo: 'https://media.api-sports.io/football/teams/197.png', country: 'Pays-Bas', leagueId: 'uefa-champions-league' },
      { id: 'team-feyenoord', name: 'Feyenoord', shortName: 'FEY', logo: 'https://media.api-sports.io/football/teams/209.png', country: 'Pays-Bas', leagueId: 'uefa-champions-league' },
      { id: 'team-monaco', name: 'AS Monaco', shortName: 'MON', logo: 'https://media.api-sports.io/football/teams/91.png', country: 'France', leagueId: 'uefa-champions-league' },
      { id: 'team-lille', name: 'Lille OSC', shortName: 'LIL', logo: 'https://media.api-sports.io/football/teams/79.png', country: 'France', leagueId: 'uefa-champions-league' },
      { id: 'team-brest', name: 'Stade Brestois 29', shortName: 'BRE', logo: 'https://media.api-sports.io/football/teams/106.png', country: 'France', leagueId: 'uefa-champions-league' },
      { id: 'team-club-brugge', name: 'Club Brugge', shortName: 'CLU', logo: 'https://media.api-sports.io/football/teams/569.png', country: 'Belgique', leagueId: 'uefa-champions-league' },
      { id: 'team-celtic', name: 'Celtic', shortName: 'CEL', logo: 'https://media.api-sports.io/football/teams/247.png', country: 'Écosse', leagueId: 'uefa-champions-league' },
      { id: 'team-shakhtar', name: 'Shakhtar Donetsk', shortName: 'SHA', logo: 'https://media.api-sports.io/football/teams/550.png', country: 'Ukraine', leagueId: 'uefa-champions-league' },
      { id: 'team-salzburg', name: 'Red Bull Salzburg', shortName: 'SAL', logo: 'https://media.api-sports.io/football/teams/571.png', country: 'Autriche', leagueId: 'uefa-champions-league' },
      { id: 'team-sturm-graz', name: 'Sturm Graz', shortName: 'STU', logo: 'https://media.api-sports.io/football/teams/637.png', country: 'Autriche', leagueId: 'uefa-champions-league' },
      { id: 'team-young-boys', name: 'Young Boys', shortName: 'YBB', logo: 'https://media.api-sports.io/football/teams/565.png', country: 'Suisse', leagueId: 'uefa-champions-league' },
      { id: 'team-sparta-prague', name: 'Sparta Prague', shortName: 'SPA', logo: 'https://media.api-sports.io/football/teams/628.png', country: 'République Tchèque', leagueId: 'uefa-champions-league' },
      { id: 'team-slovan-bratislava', name: 'Slovan Bratislava', shortName: 'SLO', logo: 'https://media.api-sports.io/football/teams/656.png', country: 'Slovaquie', leagueId: 'uefa-champions-league' },
      { id: 'team-dinamo-zagreb', name: 'Dinamo Zagreb', shortName: 'DZG', logo: 'https://media.api-sports.io/football/teams/620.png', country: 'Croatie', leagueId: 'uefa-champions-league' },
      { id: 'team-crvena-zvezda', name: 'Étoile Rouge de Belgrade', shortName: 'CZV', logo: 'https://media.api-sports.io/football/teams/598.png', country: 'Serbie', leagueId: 'uefa-champions-league' },
      { id: 'team-chelsea-ucl', name: 'Chelsea', shortName: 'CHE', logo: 'https://media.api-sports.io/football/teams/49.png', country: 'Angleterre', leagueId: 'uefa-champions-league' },
      { id: 'team-man-utd-ucl', name: 'Manchester United', shortName: 'MUN', logo: 'https://media.api-sports.io/football/teams/33.png', country: 'Angleterre', leagueId: 'uefa-champions-league' },
      { id: 'team-napoli-ucl', name: 'SSC Napoli', shortName: 'NAP', logo: 'https://media.api-sports.io/football/teams/492.png', country: 'Italie', leagueId: 'uefa-champions-league' },
      { id: 'team-ajax-ucl', name: 'Ajax Amsterdam', shortName: 'AJA', logo: 'https://media.api-sports.io/football/teams/194.png', country: 'Pays-Bas', leagueId: 'uefa-champions-league' },
      { id: 'team-galatasaray-ucl', name: 'Galatasaray', shortName: 'GAL', logo: 'https://media.api-sports.io/football/teams/645.png', country: 'Turquie', leagueId: 'uefa-champions-league' },
      { id: 'team-marseille-ucl', name: 'Olympique de Marseille', shortName: 'OM', logo: 'https://media.api-sports.io/football/teams/81.png', country: 'France', leagueId: 'uefa-champions-league' },
    ],
  },
  {
    id: 'uefa-womens-champions-league',
    name: "Ligue des champions de l'UEFA. Femmes",
    category: 'major',
    sport: 'Football',
    country: 'Europe',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/525.png',
    teams: [
      { id: 'uwcl-barcelona', name: 'FC Barcelona (F)', shortName: 'BAR', logo: 'https://media.api-sports.io/football/teams/529.png', country: 'Espagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-lyon', name: 'Olympique Lyonnais (F)', shortName: 'OLY', logo: 'https://media.api-sports.io/football/teams/80.png', country: 'France', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-chelsea', name: 'Chelsea (F)', shortName: 'CHE', logo: 'https://media.api-sports.io/football/teams/49.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-bayern', name: 'Bayern Munich (F)', shortName: 'BAY', logo: 'https://media.api-sports.io/football/teams/157.png', country: 'Allemagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-wolfsburg', name: 'VfL Wolfsburg (F)', shortName: 'WOB', logo: 'https://media.api-sports.io/football/teams/161.png', country: 'Allemagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-arsenal', name: 'Arsenal (F)', shortName: 'ARS', logo: 'https://media.api-sports.io/football/teams/42.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-psg', name: 'Paris Saint-Germain (F)', shortName: 'PSG', logo: 'https://media.api-sports.io/football/teams/85.png', country: 'France', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-real-madrid', name: 'Real Madrid (F)', shortName: 'RMA', logo: 'https://media.api-sports.io/football/teams/541.png', country: 'Espagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-man-city', name: 'Manchester City (F)', shortName: 'MCI', logo: 'https://media.api-sports.io/football/teams/50.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-juventus', name: 'Juventus (F)', shortName: 'JUV', logo: 'https://media.api-sports.io/football/teams/496.png', country: 'Italie', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-roma', name: 'AS Roma (F)', shortName: 'ROM', logo: 'https://media.api-sports.io/football/teams/497.png', country: 'Italie', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-frankfurt', name: 'Eintracht Francfort (F)', shortName: 'SGE', logo: 'https://media.api-sports.io/football/teams/169.png', country: 'Allemagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-paris-fc', name: 'Paris FC (F)', shortName: 'PFC', logo: 'https://media.api-sports.io/football/teams/114.png', country: 'France', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-benfica', name: 'SL Benfica (F)', shortName: 'BEN', logo: 'https://media.api-sports.io/football/teams/211.png', country: 'Portugal', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-ajax', name: 'Ajax Amsterdam (F)', shortName: 'AJA', logo: 'https://media.api-sports.io/football/teams/194.png', country: 'Pays-Bas', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-twente', name: 'FC Twente (F)', shortName: 'TWE', logo: 'https://media.api-sports.io/football/teams/195.png', country: 'Pays-Bas', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-hacken', name: 'BK Häcken (F)', shortName: 'HAC', logo: 'https://media.api-sports.io/football/teams/365.png', country: 'Suède', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-hammarby', name: 'Hammarby IF (F)', shortName: 'HAM', logo: 'https://media.api-sports.io/football/teams/368.png', country: 'Suède', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-rosengard', name: 'FC Rosengård (F)', shortName: 'ROS', logo: 'https://media.api-sports.io/football/teams/10899.png', country: 'Suède', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-st-polten', name: 'SKN St. Pölten (F)', shortName: 'STP', logo: 'https://media.api-sports.io/football/teams/638.png', country: 'Autriche', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-valerenga', name: 'Vålerenga (F)', shortName: 'VAL', logo: 'https://media.api-sports.io/football/teams/332.png', country: 'Norvège', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-brann', name: 'SK Brann (F)', shortName: 'BRA', logo: 'https://media.api-sports.io/football/teams/319.png', country: 'Norvège', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-celtic', name: 'Celtic (F)', shortName: 'CEL', logo: 'https://media.api-sports.io/football/teams/247.png', country: 'Écosse', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-galatasaray', name: 'Galatasaray (F)', shortName: 'GAL', logo: 'https://media.api-sports.io/football/teams/645.png', country: 'Turquie', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-sporting', name: 'Sporting CP (F)', shortName: 'SCP', logo: 'https://media.api-sports.io/football/teams/228.png', country: 'Portugal', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-atletico', name: 'Atlético Madrid (F)', shortName: 'ATM', logo: 'https://media.api-sports.io/football/teams/530.png', country: 'Espagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-levante', name: 'Levante (F)', shortName: 'LEV', logo: 'https://media.api-sports.io/football/teams/539.png', country: 'Espagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-slavia-prague', name: 'Slavia Prague (F)', shortName: 'SLA', logo: 'https://media.api-sports.io/football/teams/560.png', country: 'République Tchèque', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-sparta-prague', name: 'Sparta Prague (F)', shortName: 'SPA', logo: 'https://media.api-sports.io/football/teams/628.png', country: 'République Tchèque', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-zurich', name: 'FC Zürich (F)', shortName: 'ZUR', logo: 'https://media.api-sports.io/football/teams/783.png', country: 'Suisse', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-man-utd', name: 'Manchester United (F)', shortName: 'MUN', logo: 'https://media.api-sports.io/football/teams/33.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-fiorentina', name: 'Fiorentina (F)', shortName: 'FIO', logo: 'https://media.api-sports.io/football/teams/502.png', country: 'Italie', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-anderlecht', name: 'Anderlecht (F)', shortName: 'AND', logo: 'https://media.api-sports.io/football/teams/554.png', country: 'Belgique', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-servette', name: 'Servette FC Chênois (F)', shortName: 'SER', logo: 'https://media.api-sports.io/football/teams/2184.png', country: 'Suisse', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-real-sociedad', name: 'Real Sociedad (F)', shortName: 'RSO', logo: 'https://media.api-sports.io/football/teams/548.png', country: 'Espagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-psv', name: 'PSV Eindhoven (F)', shortName: 'PSV', logo: 'https://media.api-sports.io/football/teams/197.png', country: 'Pays-Bas', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-inter', name: 'Inter Milan (F)', shortName: 'INT', logo: 'https://media.api-sports.io/football/teams/505.png', country: 'Italie', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-ac-milan', name: 'AC Milan (F)', shortName: 'MIL', logo: 'https://media.api-sports.io/football/teams/489.png', country: 'Italie', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-leverkusen', name: 'Bayer Leverkusen (F)', shortName: 'B04', logo: 'https://media.api-sports.io/football/teams/168.png', country: 'Allemagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-rb-leipzig', name: 'RB Leipzig (F)', shortName: 'RBL', logo: 'https://media.api-sports.io/football/teams/173.png', country: 'Allemagne', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-liverpool', name: 'Liverpool (F)', shortName: 'LIV', logo: 'https://media.api-sports.io/football/teams/40.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-tottenham', name: 'Tottenham Hotspur (F)', shortName: 'TOT', logo: 'https://media.api-sports.io/football/teams/47.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-aston-villa', name: 'Aston Villa (F)', shortName: 'AVL', logo: 'https://media.api-sports.io/football/teams/66.png', country: 'Angleterre', leagueId: 'uefa-womens-champions-league' },
      { id: 'uwcl-montpellier', name: 'Montpellier HSC (F)', shortName: 'MHS', logo: 'https://media.api-sports.io/football/teams/82.png', country: 'France', leagueId: 'uefa-womens-champions-league' },
    ],
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    category: 'major',
    sport: 'Football',
    country: 'Angleterre',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    teams: FIFA_DEFAULT_TEAMS.england.map((t) => ({
      id: `team-${t.id.replace('fifa-', '')}-pl`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: 'Angleterre',
      leagueId: 'premier-league',
    })),
  },
  {
    id: 'la-liga',
    name: 'La Liga EA Sports',
    category: 'major',
    sport: 'Football',
    country: 'Espagne',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    teams: FIFA_DEFAULT_TEAMS.spain.map((t) => ({
      id: `team-${t.id.replace('fifa-', '')}-ll`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: 'Espagne',
      leagueId: 'la-liga',
    })),
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    category: 'major',
    sport: 'Football',
    country: 'Italie',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    teams: FIFA_DEFAULT_TEAMS.italy.map((t) => ({
      id: `team-${t.id.replace('fifa-', '')}-sa`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: 'Italie',
      leagueId: 'serie-a',
    })),
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    category: 'major',
    sport: 'Football',
    country: 'Allemagne',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    teams: FIFA_DEFAULT_TEAMS.germany.map((t) => ({
      id: `team-${t.id.replace('fifa-', '')}-bl`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: 'Allemagne',
      leagueId: 'bundesliga',
    })),
  },
  {
    id: 'ligue-1',
    name: "Ligue 1 McDonald's",
    category: 'major',
    sport: 'Football',
    country: 'France',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    teams: (FIFA_DEFAULT_TEAMS.france || []).map((t) => ({
      id: `team-${t.id.replace('fifa-', '')}-l1`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: 'France',
      leagueId: 'ligue-1',
    })),
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
        logo: 'https://media.api-sports.io/football/teams/732.png',
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
        logo: 'https://media.api-sports.io/football/teams/252.png',
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
    id: 'uefa-nations-league',
    name: "Ligue des nations de l'UEFA",
    category: 'national',
    sport: 'Football',
    country: 'Europe',
    continent: 'Europe',
    logo: 'https://media.api-sports.io/football/leagues/5.png',
    teams: [
      { id: 'unl-france', name: 'France', shortName: 'FRA', logo: 'https://media.api-sports.io/football/teams/2.png', country: 'France', leagueId: 'uefa-nations-league' },
      { id: 'unl-espagne', name: 'Espagne', shortName: 'ESP', logo: 'https://media.api-sports.io/football/teams/9.png', country: 'Espagne', leagueId: 'uefa-nations-league' },
      { id: 'unl-allemagne', name: 'Allemagne', shortName: 'GER', logo: 'https://media.api-sports.io/football/teams/25.png', country: 'Allemagne', leagueId: 'uefa-nations-league' },
      { id: 'unl-portugal', name: 'Portugal', shortName: 'POR', logo: 'https://media.api-sports.io/football/teams/27.png', country: 'Portugal', leagueId: 'uefa-nations-league' },
      { id: 'unl-italie', name: 'Italie', shortName: 'ITA', logo: 'https://media.api-sports.io/football/teams/768.png', country: 'Italie', leagueId: 'uefa-nations-league' },
      { id: 'unl-pays-bas', name: 'Pays-Bas', shortName: 'NED', logo: 'https://media.api-sports.io/football/teams/1118.png', country: 'Pays-Bas', leagueId: 'uefa-nations-league' },
      { id: 'unl-angleterre', name: 'Angleterre', shortName: 'ENG', logo: 'https://media.api-sports.io/football/teams/10.png', country: 'Angleterre', leagueId: 'uefa-nations-league' },
      { id: 'unl-belgique', name: 'Belgique', shortName: 'BEL', logo: 'https://media.api-sports.io/football/teams/1.png', country: 'Belgique', leagueId: 'uefa-nations-league' },
      { id: 'unl-croatie', name: 'Croatie', shortName: 'CRO', logo: 'https://media.api-sports.io/football/teams/3.png', country: 'Croatie', leagueId: 'uefa-nations-league' },
      { id: 'unl-suisse', name: 'Suisse', shortName: 'SUI', logo: 'https://media.api-sports.io/football/teams/15.png', country: 'Suisse', leagueId: 'uefa-nations-league' },
      { id: 'unl-danemark', name: 'Danemark', shortName: 'DEN', logo: 'https://media.api-sports.io/football/teams/21.png', country: 'Danemark', leagueId: 'uefa-nations-league' },
      { id: 'unl-autriche', name: 'Autriche', shortName: 'AUT', logo: 'https://media.api-sports.io/football/teams/775.png', country: 'Autriche', leagueId: 'uefa-nations-league' },
      { id: 'unl-serbie', name: 'Serbie', shortName: 'SRB', logo: 'https://media.api-sports.io/football/teams/14.png', country: 'Serbie', leagueId: 'uefa-nations-league' },
      { id: 'unl-pologne', name: 'Pologne', shortName: 'POL', logo: 'https://media.api-sports.io/football/teams/24.png', country: 'Pologne', leagueId: 'uefa-nations-league' },
      { id: 'unl-ecosse', name: 'Écosse', shortName: 'SCO', logo: 'https://media.api-sports.io/football/teams/1108.png', country: 'Écosse', leagueId: 'uefa-nations-league' },
      { id: 'unl-hongrie', name: 'Hongrie', shortName: 'HUN', logo: 'https://media.api-sports.io/football/teams/769.png', country: 'Hongrie', leagueId: 'uefa-nations-league' },
      { id: 'unl-ukraine', name: 'Ukraine', shortName: 'UKR', logo: 'https://media.api-sports.io/football/teams/772.png', country: 'Ukraine', leagueId: 'uefa-nations-league' },
      { id: 'unl-turquie', name: 'Turquie', shortName: 'TUR', logo: 'https://media.api-sports.io/football/teams/777.png', country: 'Turquie', leagueId: 'uefa-nations-league' },
      { id: 'unl-suede', name: 'Suède', shortName: 'SWE', logo: 'https://media.api-sports.io/football/teams/5.png', country: 'Suède', leagueId: 'uefa-nations-league' },
      { id: 'unl-norvege', name: 'Norvège', shortName: 'NOR', logo: 'https://media.api-sports.io/football/teams/1090.png', country: 'Norvège', leagueId: 'uefa-nations-league' },
      { id: 'unl-tchequie', name: 'République Tchèque', shortName: 'CZE', logo: 'https://media.api-sports.io/football/teams/770.png', country: 'République Tchèque', leagueId: 'uefa-nations-league' },
      { id: 'unl-pays-de-galles', name: 'Pays de Galles', shortName: 'WAL', logo: 'https://media.api-sports.io/football/teams/767.png', country: 'Pays de Galles', leagueId: 'uefa-nations-league' },
      { id: 'unl-grece', name: 'Grèce', shortName: 'GRE', logo: 'https://media.api-sports.io/football/teams/1117.png', country: 'Grèce', leagueId: 'uefa-nations-league' },
      { id: 'unl-roumanie', name: 'Roumanie', shortName: 'ROU', logo: 'https://media.api-sports.io/football/teams/774.png', country: 'Roumanie', leagueId: 'uefa-nations-league' },
      { id: 'unl-slovaquie', name: 'Slovaquie', shortName: 'SVK', logo: 'https://media.api-sports.io/football/teams/773.png', country: 'Slovaquie', leagueId: 'uefa-nations-league' },
      { id: 'unl-slovenie', name: 'Slovénie', shortName: 'SVN', logo: 'https://media.api-sports.io/football/teams/1091.png', country: 'Slovénie', leagueId: 'uefa-nations-league' },
      { id: 'unl-irlande', name: 'Irlande', shortName: 'IRL', logo: 'https://media.api-sports.io/football/teams/776.png', country: 'Irlande', leagueId: 'uefa-nations-league' },
      { id: 'unl-georgie', name: 'Géorgie', shortName: 'GEO', logo: 'https://media.api-sports.io/football/teams/1104.png', country: 'Géorgie', leagueId: 'uefa-nations-league' },
      { id: 'unl-finlande', name: 'Finlande', shortName: 'FIN', logo: 'https://media.api-sports.io/football/teams/1099.png', country: 'Finlande', leagueId: 'uefa-nations-league' },
      { id: 'unl-islande', name: 'Islande', shortName: 'ISL', logo: 'https://media.api-sports.io/football/teams/18.png', country: 'Islande', leagueId: 'uefa-nations-league' },
      { id: 'unl-bosnie', name: 'Bosnie-Herzégovine', shortName: 'BIH', logo: 'https://media.api-sports.io/football/teams/1113.png', country: 'Bosnie-Herzégovine', leagueId: 'uefa-nations-league' },
      { id: 'unl-israel', name: 'Israël', shortName: 'ISR', logo: 'https://media.api-sports.io/football/teams/1115.png', country: 'Israël', leagueId: 'uefa-nations-league' },
      { id: 'unl-albanie', name: 'Albanie', shortName: 'ALB', logo: 'https://media.api-sports.io/football/teams/778.png', country: 'Albanie', leagueId: 'uefa-nations-league' },
      { id: 'unl-montenegro', name: 'Monténégro', shortName: 'MNE', logo: 'https://media.api-sports.io/football/teams/1109.png', country: 'Monténégro', leagueId: 'uefa-nations-league' },
      { id: 'unl-armenie', name: 'Arménie', shortName: 'ARM', logo: 'https://media.api-sports.io/football/teams/1094.png', country: 'Arménie', leagueId: 'uefa-nations-league' },
      { id: 'unl-bulgarie', name: 'Bulgarie', shortName: 'BUL', logo: 'https://media.api-sports.io/football/teams/1103.png', country: 'Bulgarie', leagueId: 'uefa-nations-league' },
      { id: 'unl-kosovo', name: 'Kosovo', shortName: 'KOS', logo: 'https://media.api-sports.io/football/teams/1111.png', country: 'Kosovo', leagueId: 'uefa-nations-league' },
      { id: 'unl-luxembourg', name: 'Luxembourg', shortName: 'LUX', logo: 'https://media.api-sports.io/football/teams/1105.png', country: 'Luxembourg', leagueId: 'uefa-nations-league' },
      { id: 'unl-irlande-du-nord', name: 'Irlande du Nord', shortName: 'NIR', logo: 'https://media.api-sports.io/football/teams/1102.png', country: 'Irlande du Nord', leagueId: 'uefa-nations-league' },
      { id: 'unl-bielorussie', name: 'Biélorussie', shortName: 'BLR', logo: 'https://media.api-sports.io/football/teams/1100.png', country: 'Biélorussie', leagueId: 'uefa-nations-league' },
      { id: 'unl-kazakhstan', name: 'Kazakhstan', shortName: 'KAZ', logo: 'https://media.api-sports.io/football/teams/1095.png', country: 'Kazakhstan', leagueId: 'uefa-nations-league' },
      { id: 'unl-azerbaidjan', name: 'Azerbaïdjan', shortName: 'AZE', logo: 'https://media.api-sports.io/football/teams/1096.png', country: 'Azerbaïdjan', leagueId: 'uefa-nations-league' },
      { id: 'unl-estonie', name: 'Estonie', shortName: 'EST', logo: 'https://media.api-sports.io/football/teams/1101.png', country: 'Estonie', leagueId: 'uefa-nations-league' },
      { id: 'unl-chypre', name: 'Chypre', shortName: 'CYP', logo: 'https://media.api-sports.io/football/teams/1106.png', country: 'Chypre', leagueId: 'uefa-nations-league' },
      { id: 'unl-macedoine-du-nord', name: 'Macédoine du Nord', shortName: 'MKD', logo: 'https://media.api-sports.io/football/teams/1107.png', country: 'Macédoine du Nord', leagueId: 'uefa-nations-league' },
      { id: 'unl-iles-feroe', name: 'Îles Féroé', shortName: 'FRO', logo: 'https://media.api-sports.io/football/teams/1098.png', country: 'Îles Féroé', leagueId: 'uefa-nations-league' },
      { id: 'unl-lettonie', name: 'Lettonie', shortName: 'LVA', logo: 'https://media.api-sports.io/football/teams/1092.png', country: 'Lettonie', leagueId: 'uefa-nations-league' },
      { id: 'unl-lituanie', name: 'Lituanie', shortName: 'LTU', logo: 'https://media.api-sports.io/football/teams/1097.png', country: 'Lituanie', leagueId: 'uefa-nations-league' },
      { id: 'unl-moldavie', name: 'Moldavie', shortName: 'MDA', logo: 'https://media.api-sports.io/football/teams/1112.png', country: 'Moldavie', leagueId: 'uefa-nations-league' },
      { id: 'unl-malte', name: 'Malte', shortName: 'MLT', logo: 'https://media.api-sports.io/football/teams/1110.png', country: 'Malte', leagueId: 'uefa-nations-league' },
      { id: 'unl-andorre', name: 'Andorre', shortName: 'AND', logo: 'https://media.api-sports.io/football/teams/1114.png', country: 'Andorre', leagueId: 'uefa-nations-league' },
      { id: 'unl-gibraltar', name: 'Gibraltar', shortName: 'GIB', logo: 'https://media.api-sports.io/football/teams/1093.png', country: 'Gibraltar', leagueId: 'uefa-nations-league' },
      { id: 'unl-liechtenstein', name: 'Liechtenstein', shortName: 'LIE', logo: 'https://media.api-sports.io/football/teams/1116.png', country: 'Liechtenstein', leagueId: 'uefa-nations-league' },
      { id: 'unl-saint-marin', name: 'Saint-Marin', shortName: 'SMR', logo: 'https://media.api-sports.io/football/teams/1119.png', country: 'Saint-Marin', leagueId: 'uefa-nations-league' },
    ],
  },
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
    continent: 'Afrique',
    logo: 'https://media.api-sports.io/football/leagues/6.png',
    teams: AFRICAN_COUNTRIES.map((c) => ({
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      logo: c.logo,
      country: c.name,
      leagueId: 'caf-can',
    })),
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
      {
        id: 'fifa-team-olympiacos',
        name: 'Olympiacos',
        shortName: 'OLY',
        logo: 'https://media.api-sports.io/football/teams/553.png',
        country: 'Grèce',
        leagueId: 'fifa-ligue-des-champions',
      },
      {
        id: 'fifa-team-roma',
        name: 'Roma',
        shortName: 'ROM',
        logo: 'https://media.api-sports.io/football/teams/497.png',
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
    teams: FIFA_DEFAULT_TEAMS.england.map((t) => ({
      id: `${t.id}-pl`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: t.country,
      leagueId: 'fifa-angleterre',
    })),
  },
  {
    id: 'fifa-espagne',
    name: "FIFA. Championnat d'Espagne",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Espagne',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    teams: FIFA_DEFAULT_TEAMS.spain.map((t) => ({
      id: `${t.id}-es`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: t.country,
      leagueId: 'fifa-espagne',
    })),
  },
  {
    id: 'fifa-italie',
    name: "FIFA. Championnat d'Italie",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Italie',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    teams: FIFA_DEFAULT_TEAMS.italy.map((t) => ({
      id: `${t.id}-it`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: t.country,
      leagueId: 'fifa-italie',
    })),
  },
  {
    id: 'fifa-allemagne',
    name: "FIFA. Championnat d'Allemagne",
    category: 'fifa',
    sport: 'FIFA',
    country: 'Allemagne',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    teams: FIFA_DEFAULT_TEAMS.germany.map((t) => ({
      id: `${t.id}-de`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: t.country,
      leagueId: 'fifa-allemagne',
    })),
  },
  {
    id: 'fifa-france',
    name: "FIFA. Championnat de France",
    category: 'fifa',
    sport: 'FIFA',
    country: 'France',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    teams: FIFA_DEFAULT_TEAMS.france.map((t) => ({
      id: `${t.id}-fr`,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      country: t.country,
      leagueId: 'fifa-france',
    })),
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
  const isSuperligue =
    fl.id.includes('superligue') ||
    fl.name.toLowerCase().includes('superligue') ||
    fl.name.toLowerCase().includes('rush');
  const teamsData = isSuperligue
    ? FIFA_DEFAULT_TEAMS.europe
    : FIFA_DEFAULT_TEAMS[fl.flagType] || FIFA_DEFAULT_TEAMS.europe;
  return {
    id: fl.id,
    name: fl.name,
    category: 'fifa' as const,
    sport: 'FIFA',
    country: isSuperligue ? 'Europe' : getFifaLeagueCountry(fl.flagType),
    continent: isSuperligue ? 'Europe' : getFifaLeagueContinent(fl.flagType),
    logo: isSuperligue ? getFifaLeagueLogo('europe') : getFifaLeagueLogo(fl.flagType),
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

// ==========================================
// UTILITAIRES D'ACCÈS ET RECHERCHE
// ==========================================

/**
 * Normalise un nom d'équipe ou de compétition pour les comparaisons tolérantes
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(f\)/gi, '')
    .replace(/\bu(17|19|20|21|23)\b/gi, '')
    .replace(/\b(fc|cf|ac|sc|as|cd|us|rb|ssc|fsv|rc|ud|ca|rcd|sk|fk|bsc|vfl|vfb|kv|krc|kvc|sv|tsv|scr)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export const SPORTS_CATALOG: Competition[] = (() => {
  const merged: Competition[] = [...FC_FIFA_COMPETITIONS, ...BASE_SPORTS_CATALOG];

  for (const extComp of extendedCompetitions) {
    const existingIndex = merged.findIndex(
      (c) =>
        c.sport === extComp.sport &&
        (c.id.toLowerCase() === extComp.id.toLowerCase() ||
          c.name.toLowerCase() === extComp.name.toLowerCase() ||
          normalizeName(c.id) === normalizeName(extComp.id) ||
          normalizeName(c.name) === normalizeName(extComp.name) ||
          (c.logo && extComp.logo && c.logo === extComp.logo))
    );

    if (existingIndex >= 0) {
      // Enrichit la compétition existante avec les clubs manquants
      const existingComp = merged[existingIndex];
      const existingTeamLogos = new Set(
        existingComp.teams.map((t) => t.logo).filter(Boolean)
      );
      const existingTeamNames = new Set(
        existingComp.teams.map((t) => normalizeName(t.name))
      );
      const newTeams = extComp.teams.filter(
        (t) =>
          !existingTeamNames.has(normalizeName(t.name)) &&
          !(t.logo && existingTeamLogos.has(t.logo))
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
 * Récupère une équipe par son identifiant unique ou son nom avec tolérance orthographique,
 * en priorisant les compétitions majeures, UEFA et FIFA officielles.
 */
export function getTeamById(idOrName: string): Team | undefined {
  if (!idOrName) return undefined;
  const query = idOrName.trim().toLowerCase();
  const priorityCatalog = [... BASE_SPORTS_CATALOG, ...FC_FIFA_COMPETITIONS, ...SPORTS_CATALOG];

  // 1. Recherche exacte (ID ou Nom exact)
  for (const comp of priorityCatalog) {
    const found = comp.teams.find(
      (t) =>
        t.id.toLowerCase() === query ||
        t.name.toLowerCase() === query
    );
    if (found) return found;
  }

  // 1b. Résolution directe des 54 pays africains (alias FR/EN, abréviations, sans accents)
  const africanCountry = findAfricanCountry(idOrName);
  if (africanCountry) {
    return {
      id: africanCountry.id,
      name: africanCountry.name,
      shortName: africanCountry.shortName,
      logo: africanCountry.logo,
      country: africanCountry.name,
      leagueId: 'caf-can',
    };
  }

  // 2. Recherche par code court exact (ex: "RMA", "PSG", "BAR") uniquement si <= 4 caractères
  if (query.length <= 4) {
    for (const comp of priorityCatalog) {
      const found = comp.teams.find(
        (t) => t.shortName && t.shortName.toLowerCase() === query
      );
      if (found) return found;
    }
  }

  // 3. Recherche normalisée (sans "(F)", "U19", "FC", "CF", accents, tirets)
  const normQuery = normalizeName(query);
  if (normQuery.length >= 3) {
    for (const comp of priorityCatalog) {
      const found = comp.teams.find(
        (t) => normalizeName(t.name) === normQuery
      );
      if (found) return found;
    }
  }

  // 4. Recherche par inclusion de nom (ex: "Liverpool" dans "Liverpool FC", min 4 caractères)
  if (normQuery.length >= 4) {
    for (const comp of priorityCatalog) {
      const found = comp.teams.find((t) => {
        const normTeam = normalizeName(t.name);
        return (
          normTeam.length >= 4 &&
          (normTeam.includes(normQuery) || normQuery.includes(normTeam))
        );
      });
      if (found) return found;
    }
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
