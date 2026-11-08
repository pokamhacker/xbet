import { MatchEvent, BetStatus } from '../types/bet';
import { getTeamById } from './sportsCatalog';
import { getEffectiveEventScore } from '../utils/scoreAdapter';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type StatsPeriodKey = 'match' | 'first_half' | 'second_half';

export interface StatMetricItem {
  id: string;
  label: string;
  homeValue: string;
  awayValue: string;
  homeNumeric: number;
  awayNumeric: number;
}

export interface ScoreTableRow {
  teamName: string;
  teamLogo: string;
  firstHalf: number;
  secondHalf: number;
  result: number;
}

export interface AdditionalInfoItem {
  id: string;
  label: string;
  iconName: string;
  iconFamily: 'ionicons' | 'mci';
  detailTitle: string;
  detailLines: string[];
}

export interface MatchStatisticsData {
  eventId: string;
  sportHeader: string;
  competitionName: string;
  matchDate: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  finalScore: string;
  stadiumImageUrl: string;
  headerPatternUrl: string;
  periods: Record<StatsPeriodKey, StatMetricItem[]>;
  scoreTable: ScoreTableRow[];
  additionalInfo: AdditionalInfoItem[];
}

export type MarketPeriodKey =
  | 'regular'
  | 'first_half'
  | 'second_half'
  | 'corners'
  | 'corners_first_half';

export interface MarketOddOption {
  id: string;
  label: string;
  odd: number;
}

export interface MarketGroupItem {
  id: string;
  title: string;
  isPrimary: boolean;
  defaultExpanded: boolean;
  optionCount?: number;
  columns: 2 | 3;
  options: MarketOddOption[];
}

export interface MatchMarketsData {
  eventId: string;
  sport: string;
  competitionTitle: string;
  roundSubtitle: string;
  matchDate: string;
  initialCountdownSeconds: number;
  stadiumImageUrl: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  periods: Record<MarketPeriodKey, MarketGroupItem[]>;
}

// ============================================================================
// CONSTANTES VISUELLES & PÉRIODES
// ============================================================================

export const STADIUM_NIGHT_BANNER_URL =
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80';

export const STADIUM_PITCH_BANNER_URL =
  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=80';

export const SPORTS_WATERMARK_BANNER_URL =
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=60';

export const STATS_PERIOD_TABS: { key: StatsPeriodKey; label: string }[] = [
  { key: 'match', label: 'Match' },
  { key: 'first_half', label: '1 Mi-temps' },
  { key: 'second_half', label: '2 Mi-temps' },
];

export const MARKET_PERIOD_TABS: { key: MarketPeriodKey; label: string }[] = [
  { key: 'regular', label: 'Temps réglementaire' },
  { key: 'first_half', label: '1ère mi-temps' },
  { key: 'second_half', label: '2ème mi-temps' },
  { key: 'corners', label: 'Corners' },
  { key: 'corners_first_half', label: 'Corners. 1ère mi-temps' },
];

// ============================================================================
// HELPERS DE CRÉATION DE MÉTRIQUES & LOGOS
// ============================================================================

function parseStatNumeric(val: string | number): number {
  if (typeof val === 'number') return Math.max(0, val);
  const cleaned = String(val).replace('%', '').replace(',', '.').trim();
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function makeStat(
  id: string,
  label: string,
  homeVal: string | number,
  awayVal: string | number
): StatMetricItem {
  return {
    id,
    label,
    homeValue: String(homeVal),
    awayValue: String(awayVal),
    homeNumeric: parseStatNumeric(homeVal),
    awayNumeric: parseStatNumeric(awayVal),
  };
}

const KNOWN_TEAM_LOGOS: Record<string, string> = {
  espanyol: 'https://media.api-sports.io/football/teams/540.png',
  'rcd espanyol': 'https://media.api-sports.io/football/teams/540.png',
  'atletico de madrid': 'https://media.api-sports.io/football/teams/530.png',
  'atlético de madrid': 'https://media.api-sports.io/football/teams/530.png',
  'atletico madrid': 'https://media.api-sports.io/football/teams/530.png',
  'atlético madrid': 'https://media.api-sports.io/football/teams/530.png',
  'venise fc': 'https://media.api-sports.io/football/teams/517.png',
  'venezia fc': 'https://media.api-sports.io/football/teams/517.png',
  venezia: 'https://media.api-sports.io/football/teams/517.png',
  'inter milan': 'https://media.api-sports.io/football/teams/505.png',
  inter: 'https://media.api-sports.io/football/teams/505.png',
  milan: 'https://media.api-sports.io/football/teams/489.png',
  'ac milan': 'https://media.api-sports.io/football/teams/489.png',
  bologna1909: 'https://media.api-sports.io/football/teams/500.png',
  bologna: 'https://media.api-sports.io/football/teams/500.png',
  'bayern munich': 'https://media.api-sports.io/football/teams/157.png',
  'rasenballsport leipzig': 'https://media.api-sports.io/football/teams/173.png',
  'rb leipzig': 'https://media.api-sports.io/football/teams/173.png',
  barcelone: 'https://media.api-sports.io/football/teams/529.png',
  'fc barcelone': 'https://media.api-sports.io/football/teams/529.png',
  barcelona: 'https://media.api-sports.io/football/teams/529.png',
  'fc barcelona': 'https://media.api-sports.io/football/teams/529.png',
  'deportivo alavés': 'https://media.api-sports.io/football/teams/542.png',
  'deportivo alaves': 'https://media.api-sports.io/football/teams/542.png',
  'alavés': 'https://media.api-sports.io/football/teams/542.png',
  alaves: 'https://media.api-sports.io/football/teams/542.png',
  'real madrid': 'https://media.api-sports.io/football/teams/541.png',
  getafe: 'https://media.api-sports.io/football/teams/546.png',
  'getafe cf': 'https://media.api-sports.io/football/teams/546.png',
  villarreal: 'https://media.api-sports.io/football/teams/533.png',
  'villarreal cf': 'https://media.api-sports.io/football/teams/533.png',
  'athletic bilbao': 'https://media.api-sports.io/football/teams/531.png',
  'athletic club bilbao': 'https://media.api-sports.io/football/teams/531.png',
  'athletic club': 'https://media.api-sports.io/football/teams/531.png',
  'real sociedad': 'https://media.api-sports.io/football/teams/548.png',
  'real betis': 'https://media.api-sports.io/football/teams/543.png',
  'sevilla fc': 'https://media.api-sports.io/football/teams/536.png',
  'seville fc': 'https://media.api-sports.io/football/teams/536.png',
  'séville fc': 'https://media.api-sports.io/football/teams/536.png',
  sevilla: 'https://media.api-sports.io/football/teams/536.png',
  'valencia cf': 'https://media.api-sports.io/football/teams/532.png',
  'valence cf': 'https://media.api-sports.io/football/teams/532.png',
  valencia: 'https://media.api-sports.io/football/teams/532.png',
  'girona fc': 'https://media.api-sports.io/football/teams/547.png',
  'gérone fc': 'https://media.api-sports.io/football/teams/547.png',
  girona: 'https://media.api-sports.io/football/teams/547.png',
  'ca osasuna': 'https://media.api-sports.io/football/teams/727.png',
  osasuna: 'https://media.api-sports.io/football/teams/727.png',
  'rc celta vigo': 'https://media.api-sports.io/football/teams/538.png',
  'celta vigo': 'https://media.api-sports.io/football/teams/538.png',
  'rayo vallecano': 'https://media.api-sports.io/football/teams/728.png',
  'rcd mallorca': 'https://media.api-sports.io/football/teams/798.png',
  mallorca: 'https://media.api-sports.io/football/teams/798.png',
  majorque: 'https://media.api-sports.io/football/teams/798.png',
  'cd leganés': 'https://media.api-sports.io/football/teams/537.png',
  'cd leganes': 'https://media.api-sports.io/football/teams/537.png',
  'leganés': 'https://media.api-sports.io/football/teams/537.png',
  leganes: 'https://media.api-sports.io/football/teams/537.png',
  'ud las palmas': 'https://media.api-sports.io/football/teams/534.png',
  'las palmas': 'https://media.api-sports.io/football/teams/534.png',
  'real valladolid': 'https://media.api-sports.io/football/teams/720.png',
  valladolid: 'https://media.api-sports.io/football/teams/720.png',
  'levante ud': 'https://media.api-sports.io/football/teams/539.png',
  levante: 'https://media.api-sports.io/football/teams/539.png',
  'elche cf': 'https://media.api-sports.io/football/teams/797.png',
  elche: 'https://media.api-sports.io/football/teams/797.png',
  'real oviedo': 'https://media.api-sports.io/football/teams/718.png',
  oviedo: 'https://media.api-sports.io/football/teams/718.png',
  'granada cf': 'https://media.api-sports.io/football/teams/715.png',
  granada: 'https://media.api-sports.io/football/teams/715.png',
  'ud almería': 'https://media.api-sports.io/football/teams/723.png',
  'ud almeria': 'https://media.api-sports.io/football/teams/723.png',
  almeria: 'https://media.api-sports.io/football/teams/723.png',
  'cádiz cf': 'https://media.api-sports.io/football/teams/724.png',
  'cadiz cf': 'https://media.api-sports.io/football/teams/724.png',
  cadiz: 'https://media.api-sports.io/football/teams/724.png',
  genoa: 'https://media.api-sports.io/football/teams/495.png',
  juventus: 'https://media.api-sports.io/football/teams/496.png',
  'monza 1912': 'https://media.api-sports.io/football/teams/1579.png',
  monza: 'https://media.api-sports.io/football/teams/1579.png',
  'udinese calcio': 'https://media.api-sports.io/football/teams/494.png',
  udinese: 'https://media.api-sports.io/football/teams/494.png',
  roma: 'https://media.api-sports.io/football/teams/497.png',
  'as roma': 'https://media.api-sports.io/football/teams/497.png',
  fiorentina: 'https://media.api-sports.io/football/teams/502.png',
  napoli: 'https://media.api-sports.io/football/teams/492.png',
  'manchester city': 'https://media.api-sports.io/football/teams/50.png',
  'brighton & hove albion': 'https://media.api-sports.io/football/teams/51.png',
  brighton: 'https://media.api-sports.io/football/teams/51.png',
  chelsea: 'https://media.api-sports.io/football/teams/49.png',
  arsenal: 'https://media.api-sports.io/football/teams/42.png',
  liverpool: 'https://media.api-sports.io/football/teams/40.png',
  ajax: 'https://media.api-sports.io/football/teams/194.png',
  'az alkmaar': 'https://media.api-sports.io/football/teams/197.png',
  'bayer 04 leverkusen': 'https://media.api-sports.io/football/teams/168.png',
  'bayer leverkusen': 'https://media.api-sports.io/football/teams/168.png',
  'vfb stuttgart': 'https://media.api-sports.io/football/teams/172.png',
  stuttgart: 'https://media.api-sports.io/football/teams/172.png',
  'paris saint-germain': 'https://media.api-sports.io/football/teams/85.png',
  psg: 'https://media.api-sports.io/football/teams/85.png',
  'le havre': 'https://media.api-sports.io/football/teams/111.png',
  'sc telstar': 'https://media.api-sports.io/football/teams/425.png',
  telstar: 'https://media.api-sports.io/football/teams/425.png',
  utrecht: 'https://media.api-sports.io/football/teams/207.png',
  'fc utrecht': 'https://media.api-sports.io/football/teams/207.png',
  'estudiantes de la plata': 'https://media.api-sports.io/football/teams/450.png',
  estudiantes: 'https://media.api-sports.io/football/teams/450.png',
  'instituto atlético central córdoba': 'https://media.api-sports.io/football/teams/478.png',
  'instituto atletico central cordoba': 'https://media.api-sports.io/football/teams/478.png',
  instituto: 'https://media.api-sports.io/football/teams/478.png',
};

export function resolveMatchTeamLogo(name: string, existingLogo?: string): string {
  if (existingLogo && !existingLogo.includes('ui-avatars')) {
    return existingLogo;
  }
  const cleanKey = (name || '').trim().toLowerCase();
  if (KNOWN_TEAM_LOGOS[cleanKey]) {
    return KNOWN_TEAM_LOGOS[cleanKey];
  }
  const catalogTeam = getTeamById(name || '');
  if (catalogTeam?.logo) {
    return catalogTeam.logo;
  }
  if (existingLogo) {
    return existingLogo;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'FC'
  )}&background=1E3A8A&color=FFFFFF&size=128&bold=true&rounded=true`;
}

// ============================================================================
// 1. DONNÉES MOCKÉES COMPLÈTES — ÉCRAN STATISTIQUES (STATUT = PAYÉ)
//    Espanyol vs Atlético de Madrid (0 : 1) — 35 métriques exactes + 15 infos
// ============================================================================

const ESPANYOL_ATLETICO_STATS_MATCH: StatMetricItem[] = [
  makeStat('xg', 'Buts attendus (xG)', '0.51', '1.47'),
  makeStat('possession', 'Possession', '30%', '70%'),
  makeStat('total_shots', 'Total shots', 10, 19),
  makeStat('shots_on_target', 'Tirs cadrés', 2, 6),
  makeStat('big_chances', 'Big Chances', 0, 3),
  makeStat('corners', 'Corners', 4, 12),
  makeStat('assists_pct', 'Passes décisives', 73, 90),
  makeStat('yellow_cards', 'Cartons jaunes', 2, 5),
  makeStat('xgot', 'xG on target (xGOT)', '0.62', '1.7'),
  makeStat('shots_off_target', 'Tirs non cadrés', 5, 9),
  makeStat('blocked_shots', 'Tirs contrés', 3, 4),
  makeStat('shots_inside_box', 'Shots from inside the penalty area', 6, 10),
  makeStat('shots_outside_box', 'Shots from outside the penalty area', 4, 9),
  makeStat('woodwork_en', 'Hit the woodwork', 1, 1),
  makeStat('touches_opp_box', 'Touches in opposition box', 11, 24),
  makeStat('through_passes', 'Accurate through passes', 0, 4),
  makeStat('offsides', 'Hors-jeu', 0, 4),
  makeStat('free_kicks', 'Coups francs', 9, 10),
  makeStat('long_passes', 'Passes longues', 37, 58),
  makeStat('passes_final_third', 'Passes in final third', 54, 81),
  makeStat('crosses', 'Crosses', 25, 35),
  makeStat('xa', 'Expected assists (xA)', '0.58', '1.71'),
  makeStat('throw_ins', 'Touches', 15, 14),
  makeStat('fouls', 'Fautes', 10, 9),
  makeStat('tackles', 'Tacles', 73, 82),
  makeStat('duels_won', 'Duels won', 34, 50),
  makeStat('clearances', 'Clearances', 17, 18),
  makeStat('interceptions', 'Interceptions', 11, 10),
  makeStat('errors_shot', 'Errors leading to shot', 1, 0),
  makeStat('errors_goal', 'Errors leading to goal', 0, 0),
  makeStat('saves', 'Arrêts', 5, 2),
  makeStat('xgot_faced', 'xGOT faced', '1.7', '0.62'),
  makeStat('goals_prevented', 'Goals prevented', '0.7', '0.62'),
  makeStat('goal_kicks', 'Dégagements aux six mètres', 9, 4),
  makeStat('woodwork_fr', 'Poteaux et barres transversales', 1, 1),
];

const ESPANYOL_ATLETICO_STATS_1H: StatMetricItem[] = [
  makeStat('xg', 'Buts attendus (xG)', '0.25', '0.78'),
  makeStat('possession', 'Possession', '30%', '70%'),
  makeStat('total_shots', 'Total shots', 4, 10),
  makeStat('shots_on_target', 'Tirs cadrés', 0, 2),
  makeStat('big_chances', 'Big Chances', 0, 1),
  makeStat('corners', 'Corners', 1, 7),
  makeStat('assists_pct', 'Passes décisives', 77, 91),
  makeStat('yellow_cards', 'Cartons jaunes', 0, 2),
  makeStat('xgot', 'xG on target (xGOT)', '0', '0.6'),
  makeStat('shots_off_target', 'Tirs non cadrés', 4, 6),
  makeStat('blocked_shots', 'Tirs contrés', 0, 2),
  makeStat('shots_inside_box', 'Shots from inside the penalty area', 3, 7),
  makeStat('shots_outside_box', 'Shots from outside the penalty area', 1, 3),
  makeStat('woodwork_en', 'Hit the woodwork', 1, 0),
  makeStat('touches_opp_box', 'Touches in opposition box', 4, 16),
  makeStat('through_passes', 'Accurate through passes', 0, 3),
  makeStat('offsides', 'Hors-jeu', 0, 0),
  makeStat('free_kicks', 'Coups francs', 4, 5),
  makeStat('long_passes', 'Passes longues', 19, 31),
  makeStat('passes_final_third', 'Passes in final third', 26, 44),
  makeStat('crosses', 'Crosses', 11, 19),
  makeStat('xa', 'Expected assists (xA)', '0.24', '0.89'),
  makeStat('throw_ins', 'Touches', 8, 7),
  makeStat('fouls', 'Fautes', 5, 4),
  makeStat('tackles', 'Tacles', 75, 84),
  makeStat('duels_won', 'Duels won', 16, 26),
  makeStat('clearances', 'Clearances', 9, 8),
  makeStat('interceptions', 'Interceptions', 6, 5),
  makeStat('errors_shot', 'Errors leading to shot', 0, 0),
  makeStat('errors_goal', 'Errors leading to goal', 0, 0),
  makeStat('saves', 'Arrêts', 2, 0),
  makeStat('xgot_faced', 'xGOT faced', '0.6', '0'),
  makeStat('goals_prevented', 'Goals prevented', '0.6', '0'),
  makeStat('goal_kicks', 'Dégagements aux six mètres', 4, 3),
  makeStat('woodwork_fr', 'Poteaux et barres transversales', 1, 0),
];

const ESPANYOL_ATLETICO_STATS_2H: StatMetricItem[] = [
  makeStat('xg', 'Buts attendus (xG)', '0.26', '0.69'),
  makeStat('possession', 'Possession', '29%', '71%'),
  makeStat('total_shots', 'Total shots', 6, 9),
  makeStat('shots_on_target', 'Tirs cadrés', 2, 4),
  makeStat('big_chances', 'Big Chances', 0, 2),
  makeStat('corners', 'Corners', 3, 5),
  makeStat('assists_pct', 'Passes décisives', 68, 88),
  makeStat('yellow_cards', 'Cartons jaunes', 2, 3),
  makeStat('xgot', 'xG on target (xGOT)', '0.62', '1.1'),
  makeStat('shots_off_target', 'Tirs non cadrés', 1, 3),
  makeStat('blocked_shots', 'Tirs contrés', 3, 2),
  makeStat('shots_inside_box', 'Shots from inside the penalty area', 3, 3),
  makeStat('shots_outside_box', 'Shots from outside the penalty area', 3, 6),
  makeStat('woodwork_en', 'Hit the woodwork', 0, 1),
  makeStat('touches_opp_box', 'Touches in opposition box', 7, 8),
  makeStat('through_passes', 'Accurate through passes', 0, 1),
  makeStat('offsides', 'Hors-jeu', 0, 4),
  makeStat('free_kicks', 'Coups francs', 5, 5),
  makeStat('long_passes', 'Passes longues', 18, 27),
  makeStat('passes_final_third', 'Passes in final third', 28, 37),
  makeStat('crosses', 'Crosses', 14, 16),
  makeStat('xa', 'Expected assists (xA)', '0.34', '0.82'),
  makeStat('throw_ins', 'Touches', 7, 7),
  makeStat('fouls', 'Fautes', 5, 5),
  makeStat('tackles', 'Tacles', 71, 80),
  makeStat('duels_won', 'Duels won', 18, 24),
  makeStat('clearances', 'Clearances', 8, 10),
  makeStat('interceptions', 'Interceptions', 5, 5),
  makeStat('errors_shot', 'Errors leading to shot', 1, 0),
  makeStat('errors_goal', 'Errors leading to goal', 0, 0),
  makeStat('saves', 'Arrêts', 3, 2),
  makeStat('xgot_faced', 'xGOT faced', '1.1', '0.62'),
  makeStat('goals_prevented', 'Goals prevented', '0.1', '0.62'),
  makeStat('goal_kicks', 'Dégagements aux six mètres', 5, 1),
  makeStat('woodwork_fr', 'Poteaux et barres transversales', 0, 0),
];

export function buildAdditionalInfoItems(
  homeName: string,
  awayName: string,
  score: string,
  league: string
): AdditionalInfoItem[] {
  return [
    {
      id: 'match_events',
      label: 'Événements du match',
      iconName: 'cards-outline',
      iconFamily: 'mci',
      detailTitle: 'Chronologie des événements',
      detailLines: [
        `24' Carton jaune — ${awayName}`,
        `45' Fin de la 1ère mi-temps`,
        `61' Carton jaune — ${homeName}`,
        `74' BUT ! Validation VAR (${score})`,
        `90+4' Coup de sifflet final (${score})`,
      ],
    },
    {
      id: 'play_style',
      label: 'Style de jeu',
      iconName: 'shield-check-outline',
      iconFamily: 'mci',
      detailTitle: 'Analyse tactique & style de jeu',
      detailLines: [
        `${homeName} : Bloc médian compact, transitions rapides sur les ailes`,
        `${awayName} : Possession haute, pressing coordonné dans le dernier tiers`,
      ],
    },
    {
      id: 'recent_matches',
      label: 'Matchs récents',
      iconName: 'strategy',
      iconFamily: 'mci',
      detailTitle: 'Forme sur les 5 derniers matchs',
      detailLines: [
        `${homeName} : V - N - D - V - D`,
        `${awayName} : V - V - N - V - V`,
        `Dernière confrontation directe : ${homeName} ${score} ${awayName}`,
      ],
    },
    {
      id: 'live_commentary',
      label: 'Commentaires texte EN DIRECT',
      iconName: 'text-box-outline',
      iconFamily: 'mci',
      detailTitle: 'Fil de commentaires du match',
      detailLines: [
        `90+4' Fin du match ! Score final : ${homeName} ${score} ${awayName}.`,
        `83' Double changement tactique pour verrouiller le résultat.`,
        `74' Action décisive conclue dans la surface après un centre précis.`,
      ],
    },
    {
      id: 'tournament_bracket',
      label: 'Tableau du tournoi',
      iconName: 'table-large',
      iconFamily: 'mci',
      detailTitle: `Classement — ${league}`,
      detailLines: [
        `1. Leader du championnat — 26 pts`,
        `2. ${awayName} — 23 pts`,
        `14. ${homeName} — 11 pts`,
      ],
    },
    {
      id: 'team_stats',
      label: "Statistiques de l'équipe",
      iconName: 'account-group-outline',
      iconFamily: 'mci',
      detailTitle: 'Moyennes par rencontre cette saison',
      detailLines: [
        `${homeName} : 1.15 buts/match • 44% possession • 4.2 corners`,
        `${awayName} : 1.92 buts/match • 58% possession • 6.8 corners`,
      ],
    },
    {
      id: 'tournament_stats',
      label: 'Statistiques du tournoi',
      iconName: 'trophy-outline',
      iconFamily: 'mci',
      detailTitle: `Tendances — ${league}`,
      detailLines: [
        'Moyenne de buts par match : 2.64',
        'Victoires à domicile : 45% • Nuls : 26% • Extérieur : 29%',
        'Les deux équipes marquent : 54%',
      ],
    },
    {
      id: 'lineups',
      label: 'Compositions',
      iconName: 'shoe-cleat',
      iconFamily: 'mci',
      detailTitle: 'Schémas tactiques alignés',
      detailLines: [
        `${homeName} : Formation 4-4-2 équilibrée`,
        `${awayName} : Formation 3-5-2 offensive`,
        'Banc complet : 5 remplacements effectués',
      ],
    },
    {
      id: 'stadium',
      label: 'Stade',
      iconName: 'stadium-variant',
      iconFamily: 'mci',
      detailTitle: 'Informations sur l’enceinte',
      detailLines: [
        `Enceinte officielle de ${homeName}`,
        'Pelouse naturelle hybride • Éclairage LED homologué UEFA',
        'Météo au coup d’envoi : 18°C, ciel dégagé, humidité 56%',
      ],
    },
    {
      id: 'top_players',
      label: 'Meilleurs joueurs',
      iconName: 'crown-outline',
      iconFamily: 'mci',
      detailTitle: 'Évaluations individuelles du match',
      detailLines: [
        `Homme du match (${awayName}) — Note : 8.4 / 10`,
        `Gardien (${homeName}) — 5 arrêts décisifs — Note : 7.6 / 10`,
        `Milieu créateur (${awayName}) — 4 passes clés — Note : 8.1 / 10`,
      ],
    },
    {
      id: 'prediction',
      label: 'Pronostic',
      iconName: 'trending-up',
      iconFamily: 'ionicons',
      detailTitle: 'Bilan analytique pré-match vs réel',
      detailLines: [
        `Indice xG cumulé : ${homeName} vs ${awayName}`,
        `Résultat validé : ${score}`,
      ],
    },
    {
      id: 'standings_schedule',
      label: 'Classement et calendrier des rencontres',
      iconName: 'swap-horizontal-outline',
      iconFamily: 'ionicons',
      detailTitle: 'Calendrier à venir',
      detailLines: [
        `Prochaine journée : ${homeName} (Déplacement)`,
        `Prochaine journée : ${awayName} (Domicile)`,
      ],
    },
    {
      id: 'news',
      label: 'Actualités',
      iconName: 'newspaper-outline',
      iconFamily: 'ionicons',
      detailTitle: 'Points presse d’après-match',
      detailLines: [
        `Conférence de presse : réaction des entraîneurs après ${homeName} - ${awayName}`,
        'Aucun blessé majeur signalé à l’issue de la rencontre.',
      ],
    },
    {
      id: 'referee_info',
      label: "Infos sur l'arbitre",
      iconName: 'whistle-outline',
      iconFamily: 'mci',
      detailTitle: 'Corps arbitral officiel',
      detailLines: [
        'Arbitre principal : Comité professionnel FIFA',
        'Moyenne de cartons jaunes / match : 4.6',
        'Assistance vidéo (VAR) active sur cette rencontre.',
      ],
    },
    {
      id: 'full_stats',
      label: 'Statistiques complètes',
      iconName: 'bar-chart-outline',
      iconFamily: 'ionicons',
      detailTitle: 'Rapport télémétrique complet',
      detailLines: [
        '35 indicateurs officiels certifiés (Opta / API-Sports)',
        'Données consolidées sur 90 minutes + temps additionnel.',
      ],
    },
  ];
}

export const DEFAULT_PAID_MATCH_STATS: MatchStatisticsData = {
  eventId: 'espanyol-vs-atletico-2026',
  sportHeader: 'Football . Espagne. La Liga',
  competitionName: 'Espagne. La Liga',
  matchDate: '17.10.2026 (01:00 PM)',
  homeTeam: {
    name: 'Espanyol',
    logo: 'https://media.api-sports.io/football/teams/540.png',
  },
  awayTeam: {
    name: 'Atlético de Madrid',
    logo: 'https://media.api-sports.io/football/teams/530.png',
  },
  finalScore: '0 : 1',
  stadiumImageUrl: STADIUM_NIGHT_BANNER_URL,
  headerPatternUrl: SPORTS_WATERMARK_BANNER_URL,
  periods: {
    match: ESPANYOL_ATLETICO_STATS_MATCH,
    first_half: ESPANYOL_ATLETICO_STATS_1H,
    second_half: ESPANYOL_ATLETICO_STATS_2H,
  },
  scoreTable: [
    {
      teamName: 'Espanyol',
      teamLogo: 'https://media.api-sports.io/football/teams/540.png',
      firstHalf: 0,
      secondHalf: 0,
      result: 0,
    },
    {
      teamName: 'Atlético de Madrid',
      teamLogo: 'https://media.api-sports.io/football/teams/530.png',
      firstHalf: 0,
      secondHalf: 1,
      result: 1,
    },
  ],
  additionalInfo: buildAdditionalInfoItems(
    'Espanyol',
    'Atlético de Madrid',
    '0 : 1',
    'Espagne. La Liga'
  ),
};

// ============================================================================
// 2. DONNÉES MOCKÉES COMPLÈTES — ÉCRAN MARCHÉS (STATUT = ACCEPTÉ)
//    Venise FC vs Inter Milan — Italie. Série A — Tous les marchés primaires & secondaires
// ============================================================================

function buildSecondaryMarkets(
  homeName: string,
  awayName: string,
  factor: number = 1
): MarketGroupItem[] {
  const f = (n: number) => Number(Math.max(1.005, n * factor).toFixed(3).replace(/\.?0+$/, ''));

  return [
    {
      id: 'sec_1x2_btts',
      title: '1X2 + Chaque équipe va marquer',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 8,
      columns: 3,
      options: [
        { id: '1x2b_1', label: 'V1 Et Chaque Equipe Va Marquer - Oui', odd: f(2.49) },
        { id: '1x2b_2', label: 'X Et Chaque Equipe Va Marquer - Oui', odd: f(5.6) },
        { id: '1x2b_3', label: 'V2 Et Chaque Equipe Va Marquer - Oui', odd: f(9.3) },
        { id: '1x2b_4', label: 'V1 Et Chaque Equipe Va Marquer - Non', odd: f(1.47) },
        { id: '1x2b_5', label: 'X Et Chaque Equipe Va Marquer - Non', odd: f(1.067) },
        { id: '1x2b_6', label: 'V1 + Chaque équipe va marquer (2) ou Plus - Oui', odd: f(8.6) },
        { id: '1x2b_7', label: 'X + Chaque équipe va marquer (2) ou Plus - Oui', odd: f(13.6) },
        { id: '1x2b_8', label: 'V2 + Chaque équipe va marquer (2) ou Plus - Oui', odd: f(19.5) },
      ],
    },
    {
      id: 'sec_dc_btts',
      title: 'Double Chance + Les deux équipes vont marquer',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 12,
      columns: 3,
      options: [
        { id: 'dcb_1', label: '1X Et Chaque Equipe Va Marquer - Oui', odd: f(1.82) },
        { id: 'dcb_2', label: '12 Et Chaque Equipe Va Marquer - Oui', odd: f(2.063) },
        { id: 'dcb_3', label: '2X Et Chaque Equipe Va Marquer - Oui', odd: f(3.82) },
        { id: 'dcb_4', label: '1X Et Chaque Equipe Va Marquer - Non', odd: f(1.88) },
        { id: 'dcb_5', label: '12 Et Chaque Equipe Va Marquer - Non', odd: f(1.71) },
        { id: 'dcb_6', label: '2X Et Chaque Equipe Va Marquer - Non', odd: f(1.212) },
        { id: 'dcb_7', label: '1X + Chaque équipe va marquer (2) ou Plus - Oui', odd: f(5.43) },
        { id: 'dcb_8', label: '12 + Chaque équipe va marquer (2) ou Plus - Oui', odd: f(6.98) },
        { id: 'dcb_9', label: '2X + Chaque équipe va marquer (2) ou Plus - Oui', odd: f(9.85) },
        { id: 'dcb_10', label: '1X + Chaque équipe va marquer (2) ou Plus - Non', odd: f(1.12) },
        { id: 'dcb_11', label: '12 + Chaque équipe va marquer (2) ou Plus - Non', odd: f(1.08) },
        { id: 'dcb_12', label: '2X + Chaque équipe va marquer (2) ou Plus - Non', odd: f(1.04) },
      ],
    },
    {
      id: 'sec_total',
      title: 'Total',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 30,
      columns: 2,
      options: [
        { id: 'tot_o1', label: '(1) Plus de', odd: f(1.021) },
        { id: 'tot_u1', label: '(1) Moins de', odd: f(9.95) },
        { id: 'tot_o15', label: '(1.5) Plus de', odd: f(1.107) },
        { id: 'tot_u15', label: '(1.5) Moins de', odd: f(5.89) },
        { id: 'tot_o2', label: '(2) Plus de', odd: f(1.153) },
        { id: 'tot_u2', label: '(2) Moins de', odd: f(5.05) },
        { id: 'tot_o25', label: '(2.5) Plus de', odd: f(1.427) },
        { id: 'tot_u25', label: '(2.5) Moins de', odd: f(2.824) },
        { id: 'tot_o3', label: '(3) Plus de', odd: f(1.63) },
        { id: 'tot_u3', label: '(3) Moins de', odd: f(2.275) },
        { id: 'tot_o35', label: '(3.5) Plus de', odd: f(2.06) },
        { id: 'tot_u35', label: '(3.5) Moins de', odd: f(1.76) },
        { id: 'tot_o4', label: '(4) Plus de', odd: f(2.77) },
        { id: 'tot_u4', label: '(4) Moins de', odd: f(1.445) },
        { id: 'tot_o45', label: '(4.5) Plus de', odd: f(3.32) },
        { id: 'tot_u45', label: '(4.5) Moins de', odd: f(1.33) },
        { id: 'tot_o5', label: '(5) Plus de', odd: f(5.5) },
        { id: 'tot_u5', label: '(5) Moins de', odd: f(1.14) },
        { id: 'tot_o55', label: '(5.5) Plus de', odd: f(6.06) },
        { id: 'tot_u55', label: '(5.5) Moins de', odd: f(1.12) },
        { id: 'tot_o6', label: '(6) Plus de', odd: f(10) },
        { id: 'tot_u6', label: '(6) Moins de', odd: f(1.05) },
        { id: 'tot_o65', label: '(6.5) Plus de', odd: f(10.2) },
        { id: 'tot_u65', label: '(6.5) Moins de', odd: f(1.04) },
        { id: 'tot_o75', label: '(7.5) Plus de', odd: f(19) },
        { id: 'tot_u75', label: '(7.5) Moins de', odd: f(1.01) },
        { id: 'tot_o85', label: '(8.5) Plus de', odd: f(34) },
        { id: 'tot_u85', label: '(8.5) Moins de', odd: f(1.005) },
      ],
    },
    {
      id: 'sec_handicap',
      title: 'Handicap',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 16,
      columns: 2,
      options: [
        { id: 'hcp_1', label: 'Handicap 1 (-2.5)', odd: f(3.4) },
        { id: 'hcp_2', label: 'Handicap 2 (+2.5)', odd: f(1.31) },
        { id: 'hcp_3', label: 'Handicap 1 (-2)', odd: f(2.45) },
        { id: 'hcp_4', label: 'Handicap 2 (+2)', odd: f(1.55) },
        { id: 'hcp_5', label: 'Handicap 1 (-1.5)', odd: f(1.92) },
        { id: 'hcp_6', label: 'Handicap 2 (+1.5)', odd: f(1.88) },
        { id: 'hcp_7', label: 'Handicap 1 (-1)', odd: f(1.52) },
        { id: 'hcp_8', label: 'Handicap 2 (+1)', odd: f(2.54) },
        { id: 'hcp_9', label: 'Handicap 1 (0)', odd: f(1.14) },
        { id: 'hcp_10', label: 'Handicap 2 (0)', odd: f(5.6) },
        { id: 'hcp_11', label: 'Handicap 1 (+1)', odd: f(1.04) },
        { id: 'hcp_12', label: 'Handicap 2 (-1)', odd: f(10.5) },
        { id: 'hcp_13', label: 'Handicap 1 (+1.5)', odd: f(1.02) },
        { id: 'hcp_14', label: 'Handicap 2 (-1.5)', odd: f(14.5) },
        { id: 'hcp_15', label: 'Handicap 1 (-3.5)', odd: f(6.2) },
        { id: 'hcp_16', label: 'Handicap 2 (+3.5)', odd: f(1.11) },
      ],
    },
    {
      id: 'sec_total_1',
      title: 'Total 1',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 12,
      columns: 2,
      options: [
        { id: 't1_o05', label: '(0.5) Plus de', odd: f(1.05) },
        { id: 't1_u05', label: '(0.5) Moins de', odd: f(9) },
        { id: 't1_o15', label: '(1.5) Plus de', odd: f(1.37) },
        { id: 't1_u15', label: '(1.5) Moins de', odd: f(3) },
        { id: 't1_o2', label: '(2) Plus de', odd: f(1.64) },
        { id: 't1_u2', label: '(2) Moins de', odd: f(2.22) },
        { id: 't1_o25', label: '(2.5) Plus de', odd: f(2.2) },
        { id: 't1_u25', label: '(2.5) Moins de', odd: f(1.65) },
        { id: 't1_o35', label: '(3.5) Plus de', odd: f(4) },
        { id: 't1_u35', label: '(3.5) Moins de', odd: f(1.22) },
        { id: 't1_o45', label: '(4.5) Plus de', odd: f(8.5) },
        { id: 't1_u45', label: '(4.5) Moins de', odd: f(1.04) },
      ],
    },
    {
      id: 'sec_total_2',
      title: 'Total 2',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 10,
      columns: 2,
      options: [
        { id: 't2_o05', label: '(0.5) Plus de', odd: f(1.53) },
        { id: 't2_u05', label: '(0.5) Moins de', odd: f(2.48) },
        { id: 't2_o1', label: '(1) Plus de', odd: f(2.22) },
        { id: 't2_u1', label: '(1) Moins de', odd: f(1.64) },
        { id: 't2_o15', label: '(1.5) Plus de', odd: f(3.18) },
        { id: 't2_u15', label: '(1.5) Moins de', odd: f(1.3) },
        { id: 't2_o2', label: '(2) Plus de', odd: f(8.4) },
        { id: 't2_u2', label: '(2) Moins de', odd: f(1.04) },
        { id: 't2_o25', label: '(2.5) Plus de', odd: f(10.5) },
        { id: 't2_u25', label: '(2.5) Moins de', odd: f(1.02) },
      ],
    },
    {
      id: 'sec_next_goal',
      title: 'Prochain but',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 15,
      columns: 3,
      options: [
        { id: 'ng_1_1', label: 'Equipe 1 Va Marquer But (1)', odd: f(1.36) },
        { id: 'ng_2_1', label: 'Equipe 2 Va Marquer But (1)', odd: f(3.24) },
        { id: 'ng_x_1', label: 'Pas de But (1)', odd: f(11.6) },
        { id: 'ng_1_2', label: 'Equipe 1 Va Marquer But (2)', odd: f(1.44) },
        { id: 'ng_2_2', label: 'Equipe 2 Va Marquer But (2)', odd: f(3.4) },
        { id: 'ng_x_2', label: 'Pas de But (2)', odd: f(5.3) },
        { id: 'ng_1_3', label: 'Equipe 1 Va Marquer But (3)', odd: f(1.66) },
        { id: 'ng_2_3', label: 'Equipe 2 Va Marquer But (3)', odd: f(3.94) },
        { id: 'ng_x_3', label: 'Pas de But (3)', odd: f(2.65) },
        { id: 'ng_1_4', label: 'Equipe 1 Va Marquer But (4)', odd: f(2.25) },
        { id: 'ng_2_4', label: 'Equipe 2 Va Marquer But (4)', odd: f(5.35) },
        { id: 'ng_x_4', label: 'Pas de But (4)', odd: f(1.62) },
        { id: 'ng_1_5', label: 'Equipe 1 Va Marquer But (5)', odd: f(3.54) },
        { id: 'ng_2_5', label: 'Equipe 2 Va Marquer But (5)', odd: f(8.4) },
        { id: 'ng_x_5', label: 'Pas de But (5)', odd: f(1.24) },
      ],
    },
    {
      id: 'sec_goal_method',
      title: 'Comment le but sera marqué',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 6,
      columns: 2,
      options: [
        { id: 'gm_1', label: 'But Numéro (1) - Marqué Par Tir', odd: f(1.3) },
        { id: 'gm_2', label: 'But Numéro (1) - Tête', odd: f(5.1) },
        { id: 'gm_3', label: 'But Numéro (1) - Coup Franc', odd: f(35) },
        { id: 'gm_4', label: 'But Numéro (1) - Pénalty', odd: f(7.8) },
        { id: 'gm_5', label: 'But Numéro (1) - But Contre Son Camp', odd: f(21) },
        { id: 'gm_6', label: 'Pas de But Numéro (1)', odd: f(11.6) },
      ],
    },
    {
      id: 'sec_cs_17',
      title: 'Score Exact (17 Issues)',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 17,
      columns: 3,
      options: [
        { id: 'cs17_10', label: '1-0', odd: f(9.5) },
        { id: 'cs17_00', label: '0-0', odd: f(11.6) },
        { id: 'cs17_01', label: '0-1', odd: f(21) },
        { id: 'cs17_20', label: '2-0', odd: f(8) },
        { id: 'cs17_11', label: '1-1', odd: f(9.5) },
        { id: 'cs17_02', label: '0-2', odd: f(46) },
        { id: 'cs17_21', label: '2-1', odd: f(8) },
        { id: 'cs17_22', label: '2-2', odd: f(14) },
        { id: 'cs17_12', label: '1-2', odd: f(17) },
        { id: 'cs17_30', label: '3-0', odd: f(10) },
        { id: 'cs17_33', label: '3-3', odd: f(41) },
        { id: 'cs17_03', label: '0-3', odd: f(100) },
        { id: 'cs17_31', label: '3-1', odd: f(10) },
        { id: 'cs17_13', label: '1-3', odd: f(50) },
        { id: 'cs17_32', label: '3-2', odd: f(15) },
        { id: 'cs17_23', label: '2-3', odd: f(41) },
        { id: 'cs17_other', label: 'Score Exact - Tout Autre Score', odd: f(4.2) },
      ],
    },
    {
      id: 'sec_cs_122',
      title: 'Score exact',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 122,
      columns: 3,
      options: [
        { id: 'cs_10', label: '1-0', odd: f(9.5) },
        { id: 'cs_00', label: '0-0', odd: f(11.6) },
        { id: 'cs_01', label: '0-1', odd: f(21) },
        { id: 'cs_20', label: '2-0', odd: f(8) },
        { id: 'cs_11', label: '1-1', odd: f(9.5) },
        { id: 'cs_02', label: '0-2', odd: f(46) },
        { id: 'cs_21', label: '2-1', odd: f(8) },
        { id: 'cs_22', label: '2-2', odd: f(14) },
        { id: 'cs_12', label: '1-2', odd: f(17) },
        { id: 'cs_30', label: '3-0', odd: f(10) },
        { id: 'cs_33', label: '3-3', odd: f(41) },
        { id: 'cs_03', label: '0-3', odd: f(100) },
        { id: 'cs_31', label: '3-1', odd: f(10) },
        { id: 'cs_44', label: '4-4', odd: f(100) },
        { id: 'cs_13', label: '1-3', odd: f(50) },
        { id: 'cs_32', label: '3-2', odd: f(15) },
        { id: 'cs_55', label: '5-5', odd: f(100) },
        { id: 'cs_23', label: '2-3', odd: f(41) },
        { id: 'cs_40', label: '4-0', odd: f(14) },
        { id: 'cs_66', label: '6-6', odd: f(100) },
        { id: 'cs_04', label: '0-4', odd: f(100) },
        { id: 'cs_41', label: '4-1', odd: f(14) },
        { id: 'cs_14', label: '1-4', odd: f(100) },
        { id: 'cs_42', label: '4-2', odd: f(23) },
        { id: 'cs_24', label: '2-4', odd: f(100) },
        { id: 'cs_50', label: '5-0', odd: f(26) },
        { id: 'cs_05', label: '0-5', odd: f(100) },
        { id: 'cs_51', label: '5-1', odd: f(26) },
        { id: 'cs_15', label: '1-5', odd: f(100) },
        { id: 'cs_60', label: '6-0', odd: f(60) },
        { id: 'cs_06', label: '0-6', odd: f(100) },
        { id: 'cs_70', label: '7-0', odd: f(100) },
        { id: 'cs_07', label: '0-7', odd: f(100) },
        { id: 'cs_other', label: 'Score Exact - Tout Autre Score', odd: f(15) },
      ],
    },
    {
      id: 'sec_res_tot_1',
      title: '1, Résultat + Total',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 34,
      columns: 2,
      options: [
        { id: 'rt1_1', label: 'V1 Et TM (2.5) - Oui', odd: f(3.6) },
        { id: 'rt1_2', label: 'V1 Et TM (2.5) - Non', odd: f(1.26) },
        { id: 'rt1_3', label: 'V1 Et TP (2.5) - Oui', odd: f(1.88) },
        { id: 'rt1_4', label: 'V1 Et TP (2.5) - Non', odd: f(1.86) },
        { id: 'rt1_5', label: 'V1 Et TP (3.5) - Oui', odd: f(2.84) },
        { id: 'rt1_6', label: 'V1 Et TP (3.5) - Non', odd: f(1.38) },
      ],
    },
    {
      id: 'sec_res_tot_2',
      title: '2, Résultat + Total',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 32,
      columns: 2,
      options: [
        { id: 'rt2_1', label: 'V2 Et TM (2.5) - Oui', odd: f(15) },
        { id: 'rt2_2', label: 'V2 Et TM (2.5) - Non', odd: f(1.01) },
        { id: 'rt2_3', label: 'V2 Et TP (2.5) - Oui', odd: f(10.5) },
        { id: 'rt2_4', label: 'V2 Et TP (2.5) - Non', odd: f(1.03) },
      ],
    },
    {
      id: 'sec_asian_total',
      title: 'Total Asiatique',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 16,
      columns: 2,
      options: [
        { id: 'at_1', label: '(2.25) Plus de', odd: f(1.28) },
        { id: 'at_2', label: '(2.25) Moins de', odd: f(3.48) },
        { id: 'at_3', label: '(2.75) Plus de', odd: f(1.52) },
        { id: 'at_4', label: '(2.75) Moins de', odd: f(2.46) },
        { id: 'at_5', label: '(3.25) Plus de', odd: f(1.83) },
        { id: 'at_6', label: '(3.25) Moins de', odd: f(1.97) },
      ],
    },
    {
      id: 'sec_asian_hcp',
      title: 'Handicap Asiatique',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 16,
      columns: 2,
      options: [
        { id: 'ah_1', label: 'Handicap 1 (-1.25)', odd: f(1.69) },
        { id: 'ah_2', label: 'Handicap 2 (+1.25)', odd: f(2.14) },
        { id: 'ah_3', label: 'Handicap 1 (-1.75)', odd: f(2.18) },
        { id: 'ah_4', label: 'Handicap 2 (+1.75)', odd: f(1.67) },
      ],
    },
    {
      id: 'sec_first_goal_time',
      title: 'Moment du premier but',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 11,
      columns: 2,
      options: [
        { id: 'fgt_1', label: '1-15 min', odd: f(2.65) },
        { id: 'fgt_2', label: '16-30 min', odd: f(3.4) },
        { id: 'fgt_3', label: '31-45 min', odd: f(4.2) },
        { id: 'fgt_4', label: '46-60 min', odd: f(6.5) },
      ],
    },
    {
      id: 'sec_total_3way',
      title: 'Total 3 Issues',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 12,
      columns: 3,
      options: [
        { id: 't3w_1', label: 'Plus de (2)', odd: f(1.42) },
        { id: 't3w_2', label: 'Exactement (2)', odd: f(4.1) },
        { id: 't3w_3', label: 'Moins de (2)', odd: f(5.89) },
      ],
    },
    {
      id: 'sec_ind1_3way',
      title: 'Total Individuel 1 3 Issues',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 6,
      columns: 3,
      options: [
        { id: 'i1_3w_1', label: 'Plus de (2)', odd: f(2.2) },
        { id: 'i1_3w_2', label: 'Exactement (2)', odd: f(3.6) },
        { id: 'i1_3w_3', label: 'Moins de (2)', odd: f(3) },
      ],
    },
    {
      id: 'sec_ind2_3way',
      title: 'Total Individuel 2 3 Issues',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 6,
      columns: 3,
      options: [
        { id: 'i2_3w_1', label: 'Plus de (1)', odd: f(3.18) },
        { id: 'i2_3w_2', label: 'Exactement (1)', odd: f(2.65) },
        { id: 'i2_3w_3', label: 'Moins de (1)', odd: f(2.48) },
      ],
    },
    {
      id: 'sec_ind1_even',
      title: 'Individuel Total 1 Pair',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'i1e_oui', label: 'Oui', odd: f(1.85) },
        { id: 'i1e_non', label: 'Non', odd: f(1.85) },
      ],
    },
    {
      id: 'sec_ind2_even',
      title: 'Individuel Total 2 Pair',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'i2e_oui', label: 'Oui', odd: f(1.82) },
        { id: 'i2e_non', label: 'Non', odd: f(1.88) },
      ],
    },
    {
      id: 'sec_last_goal_team',
      title: 'Equipe marquant le dernier but',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 'lgt_1', label: 'Équipe 1', odd: f(1.36) },
        { id: 'lgt_x', label: 'Pas de but', odd: f(11.6) },
        { id: 'lgt_2', label: 'Équipe 2', odd: f(3.24) },
      ],
    },
    {
      id: 'sec_euro_hcp',
      title: 'Handicap Européen',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 13,
      columns: 3,
      options: [
        { id: 'eh_1', label: '(0:1) V1', odd: f(1.92) },
        { id: 'eh_x', label: '(0:1) X', odd: f(3.95) },
        { id: 'eh_2', label: '(0:1) V2', odd: f(3.0) },
      ],
    },
    {
      id: 'sec_goal_each_half',
      title: 'But dans chaque mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'geh_oui', label: 'Oui', odd: f(1.44) },
        { id: 'geh_non', label: 'Non', odd: f(2.65) },
      ],
    },
    {
      id: 'sec_team1_win_half',
      title: 'Equipe 1 va gagner au moins une mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 't1wh_oui', label: 'Oui', odd: f(1.18) },
        { id: 't1wh_non', label: 'Non', odd: f(4.4) },
      ],
    },
    {
      id: 'sec_team2_win_half',
      title: 'Equipe 2 va gagner au moins une mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 't2wh_oui', label: 'Oui', odd: f(2.95) },
        { id: 't2wh_non', label: 'Non', odd: f(1.36) },
      ],
    },
    {
      id: 'sec_draw_one_half',
      title: 'Nul dans au moins une mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'doh_oui', label: 'Oui', odd: f(1.62) },
        { id: 'doh_non', label: 'Non', odd: f(2.18) },
      ],
    },
    {
      id: 'sec_penalty_awarded',
      title: 'Pénalty accordé',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'pa_oui', label: 'Oui', odd: f(2.75) },
        { id: 'pa_non', label: 'Non', odd: f(1.4) },
      ],
    },
    {
      id: 'sec_race_to_goals',
      title: 'Premier à obtenir N buts',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 9,
      columns: 3,
      options: [
        { id: 'rtg_1_2', label: 'Équipe 1 - 2 buts', odd: f(1.58) },
        { id: 'rtg_x_2', label: 'Aucun - 2 buts', odd: f(3.4) },
        { id: 'rtg_2_2', label: 'Équipe 2 - 2 buts', odd: f(5.6) },
      ],
    },
    {
      id: 'sec_own_goal',
      title: 'But contre son camp',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'og_oui', label: 'Oui', odd: f(9.5) },
        { id: 'og_non', label: 'Non', odd: f(1.04) },
      ],
    },
    {
      id: 'sec_ht_ft_res',
      title: 'Résultat première/deuxième mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 9,
      columns: 3,
      options: [
        { id: 'hfr_11', label: 'V1 / V1', odd: f(2.75) },
        { id: 'hfr_x1', label: 'X / V1', odd: f(4.4) },
        { id: 'hfr_22', label: 'V2 / V2', odd: f(13.5) },
      ],
    },
    {
      id: 'sec_both_red',
      title: 'Les deux équipes vont recevoir un carton rouge',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'br_oui', label: 'Oui', odd: f(26.0) },
        { id: 'br_non', label: 'Non', odd: f(1.01) },
      ],
    },
    {
      id: 'sec_anytime_scorer',
      title: 'Joueur va marquer un but à tout moment',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 29,
      columns: 2,
      options: [
        { id: 'as_1', label: `Avant-centre (${homeName})`, odd: f(1.92) },
        { id: 'as_2', label: `Ailier droit (${homeName})`, odd: f(2.35) },
        { id: 'as_3', label: `Milieu offensif (${awayName})`, odd: f(3.1) },
        { id: 'as_4', label: `Avant-centre (${awayName})`, odd: f(4.4) },
      ],
    },
    {
      id: 'sec_ht_ft',
      title: 'MT-Fin',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 11,
      columns: 3,
      options: [
        { id: 'hf_11', label: 'V1V1', odd: f(1.96) },
        { id: 'hf_x1', label: 'XV1', odd: f(4.15) },
        { id: 'hf_22', label: 'V2V2', odd: f(12.5) },
      ],
    },
    {
      id: 'sec_goal_interval_yes',
      title: "But dans l'intervalle de temps - Oui",
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 12,
      columns: 2,
      options: [
        { id: 'giy_1_15_1', label: 'Equipe 1 : Minutes 1-15', odd: f(3.05) },
        { id: 'giy_1_15_2', label: 'Equipe 2 : Minutes 1-15', odd: f(6.4) },
        { id: 'giy_16_30_1', label: 'Equipe 1 : Minutes 16-30', odd: f(2.65) },
        { id: 'giy_16_30_2', label: 'Equipe 2 : Minutes 16-30', odd: f(5.4) },
        { id: 'giy_31_45_1', label: 'Equipe 1 : Minutes 31-45', odd: f(2.25) },
        { id: 'giy_31_45_2', label: 'Equipe 2 : Minutes 31-45', odd: f(4.65) },
        { id: 'giy_46_60_1', label: 'Equipe 1 : Minutes 46-60', odd: f(2.5) },
        { id: 'giy_46_60_2', label: 'Equipe 2 : Minutes 46-60', odd: f(5.2) },
        { id: 'giy_61_75_1', label: 'Equipe 1 : Minutes 61-75', odd: f(2.35) },
        { id: 'giy_61_75_2', label: 'Equipe 2 : Minutes 61-75', odd: f(4.9) },
        { id: 'giy_76_90_1', label: 'Equipe 1 : Minutes 76-90', odd: f(1.92) },
        { id: 'giy_76_90_2', label: 'Equipe 2 : Minutes 76-90', odd: f(3.92) },
      ],
    },
    {
      id: 'sec_goal_interval_no',
      title: "But dans l'intervalle de temps - Non",
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 12,
      columns: 2,
      options: [
        { id: 'gin_1_15_1', label: 'Equipe 1 : Minutes 1-15 - Non', odd: f(1.34) },
        { id: 'gin_1_15_2', label: 'Equipe 2 : Minutes 1-15 - Non', odd: f(1.09) },
        { id: 'gin_76_90_1', label: 'Equipe 1 : Minutes 76-90 - Non', odd: f(1.78) },
        { id: 'gin_76_90_2', label: 'Equipe 2 : Minutes 76-90 - Non', odd: f(1.22) },
      ],
    },
    {
      id: 'sec_score_each_half',
      title: 'Score dans chaque mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 'seh_1', label: '1 > 2', odd: f(2.056) },
        { id: 'seh_x', label: '1 = 2', odd: f(8.34) },
        { id: 'seh_2', label: '1 < 2', odd: f(2.12) },
      ],
    },
    {
      id: 'sec_team1_win_both_halves',
      title: 'Equipe 1 va gagner les deux mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 't1wbh_oui', label: 'Oui', odd: f(2.75) },
        { id: 't1wbh_non', label: 'Non', odd: f(1.4) },
      ],
    },
    {
      id: 'sec_team2_win_both_halves',
      title: 'Equipe 2 va gagner les deux mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 't2wbh_oui', label: 'Oui', odd: f(9.62) },
        { id: 't2wbh_non', label: 'Non', odd: f(1.025) },
      ],
    },
    {
      id: 'sec_team1_score_halves',
      title: 'Equipe 1 Score dans les mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 't1sh_1', label: '1 > 2', odd: f(3.25) },
        { id: 't1sh_x', label: '1 = 2', odd: f(2.75) },
        { id: 't1sh_2', label: '1 < 2', odd: f(2.35) },
      ],
    },
    {
      id: 'sec_team2_score_halves',
      title: 'Equipe 2 Score dans les mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 't2sh_1', label: '1 > 2', odd: f(4.5) },
        { id: 't2sh_x', label: '1 = 2', odd: f(1.85) },
        { id: 't2sh_2', label: '1 < 2', odd: f(3.2) },
      ],
    },
  ];
}

export function buildFifaMarkets(
  periodOrFactor: 'regular' | 'first_half' | 'second_half' | number = 'regular'
): MarketGroupItem[] {
  const period: 'regular' | 'first_half' | 'second_half' =
    typeof periodOrFactor === 'string'
      ? periodOrFactor
      : periodOrFactor === 1.08
      ? 'first_half'
      : periodOrFactor === 1.04
      ? 'second_half'
      : 'regular';

  const factor = period === 'second_half' ? 1.02 : 1;
  const f = (n: number) => Number(Math.max(1.005, n * factor).toFixed(3).replace(/\.?0+$/, ''));

  if (period === 'first_half' || period === 'second_half') {
    return [
      {
        id: 'fifa_1x2',
        title: '1X2',
        isPrimary: true,
        defaultExpanded: true,
        optionCount: 3,
        columns: 3,
        options: [
          { id: 'f1h_v1', label: 'V1', odd: f(1.664) },
          { id: 'f1h_x', label: 'X', odd: f(5.96) },
          { id: 'f1h_v2', label: 'V2', odd: f(3.18) },
        ],
      },
      {
        id: 'fifa_dc',
        title: 'Double chance',
        isPrimary: true,
        defaultExpanded: true,
        optionCount: 3,
        columns: 3,
        options: [
          { id: 'f1h_dc_1x', label: '1X', odd: f(1.296) },
          { id: 'f1h_dc_12', label: '12', odd: f(1.065) },
          { id: 'f1h_dc_2x', label: '2X', odd: f(2.11) },
        ],
      },
      {
        id: 'fifa_btts',
        title: 'Deux équipes vont marquer',
        isPrimary: true,
        defaultExpanded: true,
        optionCount: 6,
        columns: 2,
        options: [
          { id: 'f1h_btts_2_oui', label: 'Chaque Equipe va marquer (2) Ou Plus - Oui', odd: f(1.125) },
          { id: 'f1h_btts_2_non', label: 'Chaque Equipe va marquer (2) Ou Plus - Non', odd: f(4.59) },
          { id: 'f1h_btts_3_oui', label: 'Chaque Equipe va marquer (3) Ou Plus - Oui', odd: f(1.768) },
          { id: 'f1h_btts_3_non', label: 'Chaque Equipe va marquer (3) Ou Plus - Non', odd: f(2.04) },
          { id: 'f1h_btts_4_oui', label: 'Chaque Equipe va marquer (4) Ou Plus - Oui', odd: f(3.456) },
          { id: 'f1h_btts_4_non', label: 'Chaque Equipe va marquer (4) Ou Plus - Non', odd: f(1.28) },
        ],
      },
      {
        id: 'fifa_total',
        title: 'Total',
        isPrimary: true,
        defaultExpanded: false,
        optionCount: 10,
        columns: 2,
        options: [
          { id: 'f1h_tot_o55', label: '(5.5) Plus de', odd: f(1.19) },
          { id: 'f1h_tot_u55', label: '(5.5) Moins de', odd: f(4.12) },
          { id: 'f1h_tot_o65', label: '(6.5) Plus de', odd: f(1.52) },
          { id: 'f1h_tot_u65', label: '(6.5) Moins de', odd: f(2.42) },
          { id: 'f1h_tot_o75', label: '(7.5) Plus de', odd: f(2.12) },
          { id: 'f1h_tot_u75', label: '(7.5) Moins de', odd: f(1.68) },
          { id: 'f1h_tot_o85', label: '(8.5) Plus de', odd: f(3.18) },
          { id: 'f1h_tot_u85', label: '(8.5) Moins de', odd: f(1.32) },
          { id: 'f1h_tot_o95', label: '(9.5) Plus de', odd: f(4.85) },
          { id: 'f1h_tot_u95', label: '(9.5) Moins de', odd: f(1.14) },
        ],
      },
      {
        id: 'fifa_handicap',
        title: 'Handicap',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 4,
        columns: 2,
        options: [
          { id: 'f1h_hcp_1', label: 'Handicap 1 (-1.5)', odd: f(2.15) },
          { id: 'f1h_hcp_2', label: 'Handicap 2 (+1.5)', odd: f(1.65) },
          { id: 'f1h_hcp_3', label: 'Handicap 1 (+1.5)', odd: f(1.22) },
          { id: 'f1h_hcp_4', label: 'Handicap 2 (-1.5)', odd: f(3.95) },
        ],
      },
      {
        id: 'fifa_total_1',
        title: 'Total 1',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 8,
        columns: 2,
        options: [
          { id: 'f1h_t1_o25', label: '(2.5) Plus de', odd: f(1.18) },
          { id: 'f1h_t1_u25', label: '(2.5) Moins de', odd: f(4.25) },
          { id: 'f1h_t1_o35', label: '(3.5) Plus de', odd: f(1.64) },
          { id: 'f1h_t1_u35', label: '(3.5) Moins de', odd: f(2.18) },
          { id: 'f1h_t1_o45', label: '(4.5) Plus de', odd: f(2.55) },
          { id: 'f1h_t1_u45', label: '(4.5) Moins de', odd: f(1.48) },
          { id: 'f1h_t1_o55', label: '(5.5) Plus de', odd: f(4.2) },
          { id: 'f1h_t1_u55', label: '(5.5) Moins de', odd: f(1.19) },
        ],
      },
      {
        id: 'fifa_total_2',
        title: 'Total 2',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 6,
        columns: 2,
        options: [
          { id: 'f1h_t2_o15', label: '(1.5) Plus de', odd: f(1.16) },
          { id: 'f1h_t2_u15', label: '(1.5) Moins de', odd: f(4.5) },
          { id: 'f1h_t2_o25', label: '(2.5) Plus de', odd: f(1.68) },
          { id: 'f1h_t2_u25', label: '(2.5) Moins de', odd: f(2.12) },
          { id: 'f1h_t2_o35', label: '(3.5) Plus de', odd: f(2.85) },
          { id: 'f1h_t2_u35', label: '(3.5) Moins de', odd: f(1.39) },
        ],
      },
      {
        id: 'fifa_cs',
        title: 'Score exact',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 33,
        columns: 3,
        options: [
          { id: 'f1h_cs_32', label: '3-2', odd: f(8.5) },
          { id: 'f1h_cs_33', label: '3-3', odd: f(9.8) },
          { id: 'f1h_cs_23', label: '2-3', odd: f(11.5) },
          { id: 'f1h_cs_42', label: '4-2', odd: f(10.2) },
          { id: 'f1h_cs_43', label: '4-3', odd: f(11.0) },
          { id: 'f1h_cs_34', label: '3-4', odd: f(14.5) },
          { id: 'f1h_cs_53', label: '5-3', odd: f(16.0) },
          { id: 'f1h_cs_44', label: '4-4', odd: f(18.5) },
          { id: 'f1h_cs_24', label: '2-4', odd: f(19.0) },
        ],
      },
      {
        id: 'fifa_total_pair',
        title: 'Total pair',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 2,
        columns: 2,
        options: [
          { id: 'f1h_tp_oui', label: 'Oui', odd: 1.85 },
          { id: 'f1h_tp_non', label: 'Non', odd: 1.85 },
        ],
      },
      {
        id: 'fifa_exact_num',
        title: 'Nombre exact',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 10,
        columns: 2,
        options: [
          { id: 'f1h_en_5', label: '5 buts', odd: f(5.4) },
          { id: 'f1h_en_6', label: '6 buts', odd: f(4.2) },
          { id: 'f1h_en_7', label: '7 buts', odd: f(4.1) },
          { id: 'f1h_en_8', label: '8 buts', odd: f(5.1) },
          { id: 'f1h_en_9', label: '9 buts', odd: f(7.2) },
          { id: 'f1h_en_10', label: '10 buts ou plus', odd: f(9.5) },
        ],
      },
    ];
  }

  return [
    {
      id: 'fifa_1x2',
      title: '1X2',
      isPrimary: true,
      defaultExpanded: true,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 'f1x2_v1', label: 'V1', odd: 1.51 },
        { id: 'f1x2_x', label: 'X', odd: 8.68 },
        { id: 'f1x2_v2', label: 'V2', odd: 3.22 },
      ],
    },
    {
      id: 'fifa_dc',
      title: 'Double chance',
      isPrimary: true,
      defaultExpanded: true,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 'fdc_1x', label: '1X', odd: 1.29 },
        { id: 'fdc_12', label: '12', odd: 1.01 },
        { id: 'fdc_2x', label: '2X', odd: 2.36 },
      ],
    },
    {
      id: 'fifa_btts',
      title: 'Deux équipes vont marquer',
      isPrimary: true,
      defaultExpanded: true,
      optionCount: 8,
      columns: 2,
      options: [
        { id: 'fbtts_5_oui', label: 'Chaque Equipe va marquer (5) Ou Plus - Oui', odd: 1.195 },
        { id: 'fbtts_5_non', label: 'Chaque Equipe va marquer (5) Ou Plus - Non', odd: 3.74 },
        { id: 'fbtts_6_oui', label: 'Chaque Equipe va marquer (6) Ou Plus - Oui', odd: 1.625 },
        { id: 'fbtts_6_non', label: 'Chaque Equipe va marquer (6) Ou Plus - Non', odd: 2.21 },
        { id: 'fbtts_7_oui', label: 'Chaque Equipe va marquer (7) Ou Plus - Oui', odd: 2.435 },
        { id: 'fbtts_7_non', label: 'Chaque Equipe va marquer (7) Ou Plus - Non', odd: 1.504 },
        { id: 'fbtts_8_oui', label: 'Chaque Equipe va marquer (8) Ou Plus - Oui', odd: 4.24 },
        { id: 'fbtts_8_non', label: 'Chaque Equipe va marquer (8) Ou Plus - Non', odd: 1.175 },
      ],
    },
    {
      id: 'fifa_total',
      title: 'Total',
      isPrimary: true,
      defaultExpanded: true,
      optionCount: 14,
      columns: 2,
      options: [
        { id: 'ft_o115', label: '(11.5) Plus de', odd: 1.13 },
        { id: 'ft_u115', label: '(11.5) Moins de', odd: 5.07 },
        { id: 'ft_o125', label: '(12.5) Plus de', odd: 1.285 },
        { id: 'ft_u125', label: '(12.5) Moins de', odd: 3.51 },
        { id: 'ft_o135', label: '(13.5) Plus de', odd: 1.485 },
        { id: 'ft_u135', label: '(13.5) Moins de', odd: 2.56 },
        { id: 'ft_o145', label: '(14.5) Plus de', odd: 1.805 },
        { id: 'ft_u145', label: '(14.5) Moins de', odd: 2.005 },
        { id: 'ft_o155', label: '(15.5) Plus de', odd: 2.26 },
        { id: 'ft_u155', label: '(15.5) Moins de', odd: 1.64 },
        { id: 'ft_o165', label: '(16.5) Plus de', odd: 2.925 },
        { id: 'ft_u165', label: '(16.5) Moins de', odd: 1.384 },
        { id: 'ft_o175', label: '(17.5) Plus de', odd: 3.93 },
        { id: 'ft_u175', label: '(17.5) Moins de', odd: 1.21 },
      ],
    },
    {
      id: 'fifa_handicap',
      title: 'Handicap',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 10,
      columns: 2,
      options: [
        { id: 'fh_1', label: 'Handicap 1 (-3.5)', odd: 2.65 },
        { id: 'fh_2', label: 'Handicap 2 (+3.5)', odd: 1.44 },
        { id: 'fh_3', label: 'Handicap 1 (-2.5)', odd: 2.02 },
        { id: 'fh_4', label: 'Handicap 2 (+2.5)', odd: 1.74 },
        { id: 'fh_5', label: 'Handicap 1 (-1.5)', odd: 1.62 },
        { id: 'fh_6', label: 'Handicap 2 (+1.5)', odd: 2.21 },
        { id: 'fh_7', label: 'Handicap 1 (+1.5)', odd: 1.18 },
        { id: 'fh_8', label: 'Handicap 2 (-1.5)', odd: 4.35 },
        { id: 'fh_9', label: 'Handicap 1 (+2.5)', odd: 1.08 },
        { id: 'fh_10', label: 'Handicap 2 (-2.5)', odd: 6.8 },
      ],
    },
    {
      id: 'fifa_total_1',
      title: 'Total 1',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 10,
      columns: 2,
      options: [
        { id: 'ft1_o65', label: '(6.5) Plus de', odd: 1.296 },
        { id: 'ft1_u65', label: '(6.5) Moins de', odd: 3.425 },
        { id: 'ft1_o75', label: '(7.5) Plus de', odd: 1.63 },
        { id: 'ft1_u75', label: '(7.5) Moins de', odd: 2.28 },
        { id: 'ft1_o85', label: '(8.5) Plus de', odd: 2.18 },
        { id: 'ft1_u85', label: '(8.5) Moins de', odd: 1.685 },
        { id: 'ft1_o95', label: '(9.5) Plus de', odd: 3.12 },
        { id: 'ft1_u95', label: '(9.5) Moins de', odd: 1.344 },
        { id: 'ft1_o105', label: '(10.5) Plus de', odd: 4.79 },
        { id: 'ft1_u105', label: '(10.5) Moins de', odd: 1.144 },
      ],
    },
    {
      id: 'fifa_total_2',
      title: 'Total 2',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 10,
      columns: 2,
      options: [
        { id: 'ft2_o45', label: '(4.5) Plus de', odd: 1.14 },
        { id: 'ft2_u45', label: '(4.5) Moins de', odd: 4.91 },
        { id: 'ft2_o55', label: '(5.5) Plus de', odd: 1.4 },
        { id: 'ft2_u55', label: '(5.5) Moins de', odd: 2.856 },
        { id: 'ft2_o65', label: '(6.5) Plus de', odd: 1.864 },
        { id: 'ft2_u65', label: '(6.5) Moins de', odd: 1.936 },
        { id: 'ft2_o75', label: '(7.5) Plus de', odd: 2.67 },
        { id: 'ft2_u75', label: '(7.5) Moins de', odd: 1.45 },
        { id: 'ft2_o85', label: '(8.5) Plus de', odd: 4.18 },
        { id: 'ft2_u85', label: '(8.5) Moins de', odd: 1.19 },
      ],
    },
    {
      id: 'fifa_next_goal',
      title: 'Prochain but',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 6,
      columns: 3,
      options: [
        { id: 'fng_1_1', label: 'Équipe 1 (1)', odd: 1.58 },
        { id: 'fng_x_1', label: 'Aucun (1)', odd: 25.0 },
        { id: 'fng_2_1', label: 'Équipe 2 (1)', odd: 2.28 },
        { id: 'fng_1_2', label: 'Équipe 1 (2)', odd: 1.62 },
        { id: 'fng_x_2', label: 'Aucun (2)', odd: 19.0 },
        { id: 'fng_2_2', label: 'Équipe 2 (2)', odd: 2.34 },
      ],
    },
    {
      id: 'fifa_cs',
      title: 'Score exact',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 38,
      columns: 3,
      options: [
        { id: 'fcs_76', label: '7-6', odd: 14.0 },
        { id: 'fcs_77', label: '7-7', odd: 16.5 },
        { id: 'fcs_67', label: '6-7', odd: 19.0 },
        { id: 'fcs_86', label: '8-6', odd: 13.5 },
        { id: 'fcs_87', label: '8-7', odd: 15.0 },
        { id: 'fcs_68', label: '6-8', odd: 23.0 },
        { id: 'fcs_96', label: '9-6', odd: 16.0 },
        { id: 'fcs_88', label: '8-8', odd: 21.0 },
        { id: 'fcs_78', label: '7-8', odd: 22.0 },
      ],
    },
    {
      id: 'fifa_total_pair',
      title: 'Total pair',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'ftp_oui', label: 'Oui', odd: 1.85 },
        { id: 'ftp_non', label: 'Non', odd: 1.85 },
      ],
    },
    {
      id: 'fifa_ht_ft',
      title: 'MT-Fin',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 9,
      columns: 3,
      options: [
        { id: 'fhf_11', label: 'V1V1', odd: 2.15 },
        { id: 'fhf_x1', label: 'XV1', odd: 6.4 },
        { id: 'fhf_21', label: 'V2V1', odd: 5.8 },
        { id: 'fhf_1x', label: 'V1X', odd: 14.5 },
        { id: 'fhf_xx', label: 'XX', odd: 22.0 },
        { id: 'fhf_2x', label: 'V2X', odd: 16.5 },
        { id: 'fhf_12', label: 'V1V2', odd: 8.9 },
        { id: 'fhf_x2', label: 'XV2', odd: 11.5 },
        { id: 'fhf_22', label: 'V2V2', odd: 4.85 },
      ],
    },
    {
      id: 'fifa_score_each_half',
      title: 'Score dans chaque mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 3,
      columns: 3,
      options: [
        { id: 'fseh_1', label: '1 > 2', odd: 2.056 },
        { id: 'fseh_x', label: '1 = 2', odd: 8.34 },
        { id: 'fseh_2', label: '1 < 2', odd: 2.12 },
      ],
    },
    {
      id: 'fifa_team1_win_one_half',
      title: 'Equipe 1 va gagner au moins une mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'ft1woh_oui', label: 'Oui', odd: 1.18 },
        { id: 'ft1woh_non', label: 'Non', odd: 4.25 },
      ],
    },
    {
      id: 'fifa_team2_win_one_half',
      title: 'Equipe 2 va gagner au moins une mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'ft2woh_oui', label: 'Oui', odd: 1.825 },
        { id: 'ft2woh_non', label: 'Non', odd: 2.025 },
      ],
    },
    {
      id: 'fifa_exact_number',
      title: 'Nombre exact',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 13,
      columns: 2,
      options: [
        { id: 'fen_11', label: '11 buts ou moins', odd: 5.07 },
        { id: 'fen_12', label: '12 buts', odd: 7.4 },
        { id: 'fen_13', label: '13 buts', odd: 6.2 },
        { id: 'fen_14', label: '14 buts', odd: 5.8 },
        { id: 'fen_15', label: '15 buts', odd: 6.1 },
        { id: 'fen_16', label: '16 buts', odd: 7.2 },
        { id: 'fen_17', label: '17 buts', odd: 9.1 },
        { id: 'fen_18', label: '18 buts ou plus', odd: 3.93 },
      ],
    },
    {
      id: 'fifa_team1_win_both_halves',
      title: 'Equipe 1 va gagner les deux mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'ft1wbh_oui', label: 'Oui', odd: 2.75 },
        { id: 'ft1wbh_non', label: 'Non', odd: 1.4 },
      ],
    },
    {
      id: 'fifa_team2_win_both_halves',
      title: 'Equipe 2 va gagner les deux mi-temps',
      isPrimary: false,
      defaultExpanded: false,
      optionCount: 2,
      columns: 2,
      options: [
        { id: 'ft2wbh_oui', label: 'Oui', odd: 9.62 },
        { id: 'ft2wbh_non', label: 'Non', odd: 1.025 },
      ],
    },
  ];
}

export const DEFAULT_ACCEPTED_MATCH_MARKETS: MatchMarketsData = {
  eventId: 'venise-vs-inter-2026',
  sport: 'Football',
  competitionTitle: 'Italie. Série A',
  roundSubtitle: 'Tour 9. Italie',
  matchDate: '28.10.2026 (06:30 PM)',
  // 02 : 38 : 57 = 2*3600 + 38*60 + 57 = 9537 secondes
  initialCountdownSeconds: 9537,
  stadiumImageUrl: STADIUM_PITCH_BANNER_URL,
  homeTeam: {
    name: 'Venise FC',
    logo: 'https://media.api-sports.io/football/teams/517.png',
  },
  awayTeam: {
    name: 'Inter Milan',
    logo: 'https://media.api-sports.io/football/teams/505.png',
  },
  periods: {
    regular: [
      {
        id: 'pin_total_pair',
        title: 'Total pair',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 2,
        columns: 2,
        options: [
          { id: 'tp_oui', label: 'Oui', odd: 1.885 },
          { id: 'tp_non', label: 'Non', odd: 1.915 },
        ],
      },
      {
        id: 'pin_12_total_eq1',
        title: '12 Et Total Equipe 1',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 2,
        columns: 2,
        options: [
          { id: '12t1_oui', label: 'Oui (1.5)', odd: 2.35 },
          { id: '12t1_non', label: 'Non (1.5)', odd: 1.54 },
        ],
      },
      {
        id: 'prim_1x2',
        title: '1X2',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: 'reg_v1', label: 'V1', odd: 3.075 },
          { id: 'reg_x', label: 'X', odd: 3.92 },
          { id: 'reg_v2', label: 'V2', odd: 2.167 },
        ],
      },
      {
        id: 'prim_1x2_2up',
        title: '1X2 (2UP)',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: '2up_v1', label: 'V1', odd: 3.03 },
          { id: '2up_x', label: 'Match nul', odd: 3.92 },
          { id: '2up_v2', label: 'V2', odd: 2.137 },
        ],
      },
      {
        id: 'prim_dc',
        title: 'Double chance',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: 'dc_1x', label: '1X', odd: 1.707 },
          { id: 'dc_12', label: '12', odd: 1.28 },
          { id: 'dc_2x', label: '2X', odd: 1.385 },
        ],
      },
      {
        id: 'prim_btts',
        title: 'Deux équipes vont marquer',
        isPrimary: true,
        defaultExpanded: true,
        optionCount: 4,
        columns: 2,
        options: [
          { id: 'btts_oui', label: 'Oui', odd: 1.58 },
          { id: 'btts_non', label: 'Non', odd: 2.261 },
          { id: 'btts_2plus_oui', label: 'Chaque Equipe va marquer (2) Ou Plus - Oui', odd: 4.02 },
          { id: 'btts_2plus_non', label: 'Chaque Equipe va marquer (2) Ou Plus - Non', odd: 1.201 },
        ],
      },
      ...buildSecondaryMarkets('Venise FC', 'Inter Milan', 1),
    ],
    first_half: [
      {
        id: '1h_1x2',
        title: '1X2',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: '1h_v1', label: 'V1', odd: 6.05 },
          { id: '1h_x', label: 'X', odd: 2.77 },
          { id: '1h_v2', label: 'V2', odd: 1.78 },
        ],
      },
      {
        id: '1h_dc',
        title: 'Double chance',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: '1h_1x', label: '1X', odd: 1.909 },
          { id: '1h_12', label: '12', odd: 1.38 },
          { id: '1h_2x', label: '2X', odd: 1.085 },
        ],
      },
      {
        id: '1h_btts',
        title: 'Deux équipes vont marquer',
        isPrimary: true,
        defaultExpanded: true,
        columns: 2,
        options: [
          { id: '1h_btts_oui', label: 'Oui', odd: 3.48 },
          { id: '1h_btts_non', label: 'Non', odd: 1.27 },
        ],
      },
      ...buildSecondaryMarkets('Venise FC', 'Inter Milan', 1.14).slice(1, 12),
    ],
    second_half: [
      {
        id: '2h_1x2',
        title: '1X2',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: '2h_v1', label: 'V1', odd: 5.9 },
          { id: '2h_x', label: 'X', odd: 3.35 },
          { id: '2h_v2', label: 'V2', odd: 1.615 },
        ],
      },
      {
        id: '2h_dc',
        title: 'Double chance',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: '2h_1x', label: '1X', odd: 2.14 },
          { id: '2h_12', label: '12', odd: 1.27 },
          { id: '2h_2x', label: '2X', odd: 1.091 },
        ],
      },
      {
        id: '2h_btts',
        title: 'Deux équipes vont marquer',
        isPrimary: true,
        defaultExpanded: true,
        columns: 2,
        options: [
          { id: '2h_btts_oui', label: 'Oui', odd: 2.69 },
          { id: '2h_btts_non', label: 'Non', odd: 1.422 },
        ],
      },
      ...buildSecondaryMarkets('Venise FC', 'Inter Milan', 1.08).slice(1, 12),
    ],
    corners: [
      {
        id: 'cor_1x2',
        title: '1X2 Corners',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: 'cor_v1', label: 'V1', odd: 4.35 },
          { id: 'cor_x', label: 'X', odd: 9.2 },
          { id: 'cor_v2', label: 'V2', odd: 1.32 },
        ],
      },
      {
        id: 'cor_dc',
        title: 'Double chance (Corners)',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: 'cor_1x', label: '1X', odd: 2.94 },
          { id: 'cor_12', label: '12', odd: 1.07 },
          { id: 'cor_2x', label: '2X', odd: 1.19 },
        ],
      },
      {
        id: 'cor_total',
        title: 'Total Corners',
        isPrimary: true,
        defaultExpanded: true,
        columns: 2,
        options: [
          { id: 'cor_o95', label: 'Plus de (9.5)', odd: 1.84 },
          { id: 'cor_u95', label: 'Moins de (9.5)', odd: 1.96 },
        ],
      },
      {
        id: 'cor_hcp',
        title: 'Handicap Corners',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 12,
        columns: 2,
        options: [
          { id: 'cor_h1', label: 'Handicap 1 (+2.5)', odd: 1.85 },
          { id: 'cor_h2', label: 'Handicap 2 (-2.5)', odd: 1.91 },
        ],
      },
      {
        id: 'cor_ind1',
        title: 'Total Individuel Corners 1',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 8,
        columns: 2,
        options: [
          { id: 'cor_i1o', label: 'Plus de (3.5)', odd: 1.92 },
          { id: 'cor_i1u', label: 'Moins de (3.5)', odd: 1.82 },
        ],
      },
      {
        id: 'cor_ind2',
        title: 'Total Individuel Corners 2',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 8,
        columns: 2,
        options: [
          { id: 'cor_i2o', label: 'Plus de (5.5)', odd: 1.79 },
          { id: 'cor_i2u', label: 'Moins de (5.5)', odd: 1.97 },
        ],
      },
    ],
    corners_first_half: [
      {
        id: 'cor1h_1x2',
        title: '1X2 Corners (1ère MT)',
        isPrimary: true,
        defaultExpanded: true,
        columns: 3,
        options: [
          { id: 'cor1h_v1', label: 'V1', odd: 3.9 },
          { id: 'cor1h_x', label: 'X', odd: 5.4 },
          { id: 'cor1h_v2', label: 'V2', odd: 1.54 },
        ],
      },
      {
        id: 'cor1h_total',
        title: 'Total Corners (1ère MT)',
        isPrimary: true,
        defaultExpanded: true,
        columns: 2,
        options: [
          { id: 'cor1h_o45', label: 'Plus de (4.5)', odd: 1.89 },
          { id: 'cor1h_u45', label: 'Moins de (4.5)', odd: 1.87 },
        ],
      },
      {
        id: 'cor1h_hcp',
        title: 'Handicap Corners (1ère MT)',
        isPrimary: false,
        defaultExpanded: false,
        optionCount: 8,
        columns: 2,
        options: [
          { id: 'cor1h_h1', label: 'Handicap 1 (+1.5)', odd: 1.76 },
          { id: 'cor1h_h2', label: 'Handicap 2 (-1.5)', odd: 2.01 },
        ],
      },
    ],
  },
};

// ============================================================================
// 3. ADAPTATEURS DYNAMIQUES DEPUIS N'IMPORTE QUEL ÉVÉNEMENT DU COUPON
// ============================================================================

function computeMatchSeed(home: string, away: string): number {
  const combined = `${home.toLowerCase().trim()}::${away.toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) % 10000;
  }
  return Math.abs(hash);
}

function parseScorePair(raw?: string): [number, number] | null {
  if (!raw) return null;
  const match = raw.match(/(\d+)\s*[:\-]\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

function parseHalftimeBreakdown(
  halftimeStr?: string,
  totalHome: number = 0,
  totalAway: number = 1
): { h1Home: number; h1Away: number; h2Home: number; h2Away: number } {
  if (halftimeStr) {
    // Supporte "(0:0, 0:1)", "0:2 (0:0,0:2)", "3:2 (1:1,1:1,0:0,1:0)", etc.
    const insideParens = halftimeStr.match(/\(([^)]+)\)/);
    if (insideParens && insideParens[1]) {
      const parts = insideParens[1]
        .split(',')
        .map((s) => parseScorePair(s.trim()))
        .filter((p): p is [number, number] => Boolean(p));
      if (parts.length >= 2) {
        const h1Home = Math.min(totalHome, parts[0][0]);
        const h1Away = Math.min(totalAway, parts[0][1]);
        return {
          h1Home,
          h1Away,
          h2Home: Math.max(0, totalHome - h1Home),
          h2Away: Math.max(0, totalAway - h1Away),
        };
      }
      if (parts.length === 1) {
        const h1Home = Math.min(totalHome, parts[0][0]);
        const h1Away = Math.min(totalAway, parts[0][1]);
        return {
          h1Home,
          h1Away,
          h2Home: Math.max(0, totalHome - h1Home),
          h2Away: Math.max(0, totalAway - h1Away),
        };
      }
    }
    const simplePair = parseScorePair(halftimeStr);
    if (simplePair && (simplePair[0] < totalHome || simplePair[1] < totalAway)) {
      const h1Home = Math.min(totalHome, simplePair[0]);
      const h1Away = Math.min(totalAway, simplePair[1]);
      return {
        h1Home,
        h1Away,
        h2Home: Math.max(0, totalHome - h1Home),
        h2Away: Math.max(0, totalAway - h1Away),
      };
    }
  }
  const h1Home = Math.floor(totalHome / 2);
  const h1Away = Math.floor(totalAway / 2);
  return {
    h1Home,
    h1Away,
    h2Home: Math.max(0, totalHome - h1Home),
    h2Away: Math.max(0, totalAway - h1Away),
  };
}

export function buildMatchStatisticsFromEvent(event?: Partial<MatchEvent>): MatchStatisticsData {
  if (!event || (!event.homeTeam?.name && !event.awayTeam?.name)) {
    return DEFAULT_PAID_MATCH_STATS;
  }

  const homeName = event.homeTeam?.name || DEFAULT_PAID_MATCH_STATS.homeTeam.name;
  const awayName = event.awayTeam?.name || DEFAULT_PAID_MATCH_STATS.awayTeam.name;

  const isDefaultEspanyol =
    homeName.toLowerCase().includes('espanyol') &&
    awayName.toLowerCase().includes('atl');

  const sport = event.sport || 'Football';
  const cleanLeague = (event.league || 'Espagne. La Liga')
    .replace(/^Football\s*[\.\-·:]\s*/i, '')
    .replace(/\s*-\s*/g, '. ')
    .trim();
  const sportHeader = `${sport} . ${cleanLeague}`;

  const homeLogo = resolveMatchTeamLogo(homeName, event.homeTeam?.logo);
  const awayLogo = resolveMatchTeamLogo(awayName, event.awayTeam?.logo);
  const matchDate = event.date || event.eventDate || DEFAULT_PAID_MATCH_STATS.matchDate;

  const adaptedScore = event.homeTeam && event.awayTeam
    ? getEffectiveEventScore(event as MatchEvent, (event as any).isWon ?? event.status !== 'Perdu')
    : undefined;

  const scoreRaw =
    event.actualScore ||
    event.finalScore ||
    (event as any).score ||
    (adaptedScore && adaptedScore.mainScore !== 'VS' ? adaptedScore.mainScore : undefined) ||
    (isDefaultEspanyol ? '0:1' : '2:1');
  const parsedTotal = parseScorePair(scoreRaw) || [2, 1];
  const [homeGoals, awayGoals] = parsedTotal;
  const finalScore = `${homeGoals} : ${awayGoals}`;

  const ht = parseHalftimeBreakdown(
    event.halftimeScore || adaptedScore?.detailedScore || scoreRaw,
    homeGoals,
    awayGoals
  );

  if (isDefaultEspanyol && homeGoals === 0 && awayGoals === 1) {
    return {
      ...DEFAULT_PAID_MATCH_STATS,
      eventId: event.id || DEFAULT_PAID_MATCH_STATS.eventId,
      sportHeader,
      competitionName: cleanLeague,
      matchDate,
      homeTeam: { name: homeName, logo: homeLogo },
      awayTeam: { name: awayName, logo: awayLogo },
    };
  }

  // Génération cohérente, déterministe et proportionnelle au score réel du match cliqué
  const seed = computeMatchSeed(homeName, awayName);
  const seedOffset = (seed % 7) - 3; // [-3..+3]
  const baseDominance =
    homeGoals > awayGoals
      ? 55 + Math.min(10, (homeGoals - awayGoals) * 3)
      : awayGoals > homeGoals
      ? 44 - Math.min(10, (awayGoals - homeGoals) * 3)
      : 51;
  const homeDominance = Math.min(68, Math.max(32, baseDominance + seedOffset));
  const awayDominance = 100 - homeDominance;

  const homeShots = Math.max(homeGoals + 5, Math.round(homeGoals * 3.1 + 7 + (seed % 4)));
  const awayShots = Math.max(awayGoals + 5, Math.round(awayGoals * 3.1 + 7 + ((seed >> 2) % 4)));
  const homeOnTarget = Math.max(homeGoals, Math.min(homeShots - 1, homeGoals + 2 + (seed % 3)));
  const awayOnTarget = Math.max(awayGoals, Math.min(awayShots - 1, awayGoals + 2 + ((seed >> 1) % 3)));
  const homeXg = (homeGoals * 0.68 + 0.42 + (seed % 5) * 0.06).toFixed(2);
  const awayXg = (awayGoals * 0.68 + 0.44 + ((seed >> 2) % 5) * 0.06).toFixed(2);
  const homeSaves = Math.max(0, awayOnTarget - awayGoals);
  const awaySaves = Math.max(0, homeOnTarget - homeGoals);
  const homeCorners = Math.max(2, homeGoals + 3 + (seed % 4));
  const awayCorners = Math.max(2, awayGoals + 3 + ((seed >> 3) % 4));
  const homeYellow = 1 + (seed % 3);
  const awayYellow = 1 + ((seed >> 2) % 3);
  const homeFouls = 9 + (seed % 5);
  const awayFouls = 9 + ((seed >> 1) % 5);

  const matchStats: StatMetricItem[] = [
    makeStat('xg', 'Buts attendus (xG)', homeXg, awayXg),
    makeStat('possession', 'Possession', `${homeDominance}%`, `${awayDominance}%`),
    makeStat('total_shots', 'Total shots', homeShots, awayShots),
    makeStat('shots_on_target', 'Tirs cadrés', homeOnTarget, awayOnTarget),
    makeStat('big_chances', 'Big Chances', Math.max(1, homeGoals + 1 + (seed % 2)), Math.max(1, awayGoals + 1 + ((seed >> 1) % 2))),
    makeStat('corners', 'Corners', homeCorners, awayCorners),
    makeStat('assists_pct', 'Passes décisives', homeDominance > 50 ? 86 + (seed % 4) : 77 + (seed % 4), awayDominance > 50 ? 87 + (seed % 4) : 78 + (seed % 4)),
    makeStat('yellow_cards', 'Cartons jaunes', homeYellow, awayYellow),
    makeStat('xgot', 'xG on target (xGOT)', (parseFloat(homeXg) + 0.15).toFixed(2), (parseFloat(awayXg) + 0.15).toFixed(2)),
    makeStat('shots_off_target', 'Tirs non cadrés', Math.max(2, homeShots - homeOnTarget - 2), Math.max(2, awayShots - awayOnTarget - 2)),
    makeStat('blocked_shots', 'Tirs contrés', 2 + (seed % 2), 2 + ((seed >> 1) % 2)),
    makeStat('shots_inside_box', 'Shots from inside the penalty area', Math.max(homeGoals + 2, Math.round(homeShots * 0.65)), Math.max(awayGoals + 2, Math.round(awayShots * 0.65))),
    makeStat('shots_outside_box', 'Shots from outside the penalty area', Math.max(2, Math.round(homeShots * 0.35)), Math.max(2, Math.round(awayShots * 0.35))),
    makeStat('woodwork_en', 'Hit the woodwork', homeGoals >= 2 ? 1 : 0, awayGoals >= 2 ? 1 : 0),
    makeStat('touches_opp_box', 'Touches in opposition box', homeShots * 2 + 4, awayShots * 2 + 3),
    makeStat('through_passes', 'Accurate through passes', Math.max(1, homeGoals + 1), Math.max(1, awayGoals + 1)),
    makeStat('offsides', 'Hors-jeu', 1 + (seed % 3), 1 + ((seed >> 2) % 3)),
    makeStat('free_kicks', 'Coups francs', awayFouls + 1, homeFouls + 1),
    makeStat('long_passes', 'Passes longues', 38 + (seed % 12), 40 + ((seed >> 1) % 12)),
    makeStat('passes_final_third', 'Passes in final third', homeDominance + 26 + (seed % 8), awayDominance + 26 + ((seed >> 2) % 8)),
    makeStat('crosses', 'Crosses', 14 + homeCorners, 14 + awayCorners),
    makeStat('xa', 'Expected assists (xA)', (parseFloat(homeXg) * 0.84).toFixed(2), (parseFloat(awayXg) * 0.84).toFixed(2)),
    makeStat('throw_ins', 'Touches', 15 + (seed % 6), 14 + ((seed >> 1) % 6)),
    makeStat('fouls', 'Fautes', homeFouls, awayFouls),
    makeStat('tackles', 'Tacles', 72 + (seed % 12), 74 + ((seed >> 1) % 12)),
    makeStat('duels_won', 'Duels won', 42 + (seed % 9), 43 + ((seed >> 2) % 9)),
    makeStat('clearances', 'Clearances', 13 + awayCorners, 13 + homeCorners),
    makeStat('interceptions', 'Interceptions', 8 + (seed % 5), 9 + ((seed >> 1) % 5)),
    makeStat('errors_shot', 'Errors leading to shot', awayGoals > homeGoals ? 1 : 0, homeGoals > awayGoals ? 1 : 0),
    makeStat('errors_goal', 'Errors leading to goal', 0, 0),
    makeStat('saves', 'Arrêts', homeSaves, awaySaves),
    makeStat('xgot_faced', 'xGOT faced', (parseFloat(awayXg) + 0.15).toFixed(2), (parseFloat(homeXg) + 0.15).toFixed(2)),
    makeStat('goals_prevented', 'Goals prevented', (homeSaves * 0.14 + 0.08).toFixed(2), (awaySaves * 0.14 + 0.08).toFixed(2)),
    makeStat('goal_kicks', 'Dégagements aux six mètres', 6 + (seed % 4), 6 + ((seed >> 1) % 4)),
    makeStat('woodwork_fr', 'Poteaux et barres transversales', homeGoals >= 2 ? 1 : 0, awayGoals >= 2 ? 1 : 0),
  ];

  const halfScale = (items: StatMetricItem[], ratio: number): StatMetricItem[] =>
    items.map((item) => {
      if (item.label === 'Possession') {
        const h = Math.min(78, Math.max(22, Math.round(homeDominance + (ratio === 0.48 ? -1 : 1))));
        return makeStat(item.id, item.label, `${h}%`, `${100 - h}%`);
      }
      if (item.homeValue.includes('.') || item.awayValue.includes('.')) {
        return makeStat(
          item.id,
          item.label,
          (item.homeNumeric * ratio).toFixed(2),
          (item.awayNumeric * ratio).toFixed(2)
        );
      }
      if (item.id === 'assists_pct' || item.id === 'tackles') {
        return makeStat(item.id, item.label, item.homeNumeric, item.awayNumeric);
      }
      return makeStat(
        item.id,
        item.label,
        Math.round(item.homeNumeric * ratio),
        Math.round(item.awayNumeric * ratio)
      );
    });

  const additionalInfo = buildAdditionalInfoItems(homeName, awayName, finalScore, cleanLeague).map(
    (info) => {
      if (info.id === 'prediction' && event.prediction) {
        return {
          ...info,
          detailLines: [
            `Pronostic joué : ${event.prediction}${event.odd ? ` (Cote ${event.odd})` : ''}`,
            `Indice xG cumulé : ${homeName} (${homeXg}) vs ${awayName} (${awayXg})`,
            `Résultat validé : ${finalScore} (1ère MT ${ht.h1Home}:${ht.h1Away}, 2ème MT ${ht.h2Home}:${ht.h2Away})`,
          ],
        };
      }
      return info;
    }
  );

  return {
    eventId: event.id || `${homeName}-${awayName}`,
    sportHeader,
    competitionName: cleanLeague,
    matchDate,
    homeTeam: { name: homeName, logo: homeLogo },
    awayTeam: { name: awayName, logo: awayLogo },
    finalScore,
    stadiumImageUrl: STADIUM_NIGHT_BANNER_URL,
    headerPatternUrl: SPORTS_WATERMARK_BANNER_URL,
    periods: {
      match: matchStats,
      first_half: halfScale(matchStats, 0.48),
      second_half: halfScale(matchStats, 0.52),
    },
    scoreTable: [
      {
        teamName: homeName,
        teamLogo: homeLogo,
        firstHalf: ht.h1Home,
        secondHalf: ht.h2Home,
        result: homeGoals,
      },
      {
        teamName: awayName,
        teamLogo: awayLogo,
        firstHalf: ht.h1Away,
        secondHalf: ht.h2Away,
        result: awayGoals,
      },
    ],
    additionalInfo,
  };
}

export function buildMatchMarketsFromEvent(event?: Partial<MatchEvent>): MatchMarketsData {
  if (!event || (!event.homeTeam?.name && !event.awayTeam?.name)) {
    return DEFAULT_ACCEPTED_MATCH_MARKETS;
  }

  const homeName = event.homeTeam?.name || DEFAULT_ACCEPTED_MATCH_MARKETS.homeTeam.name;
  const awayName = event.awayTeam?.name || DEFAULT_ACCEPTED_MATCH_MARKETS.awayTeam.name;

  const isDefaultVenise =
    (homeName.toLowerCase().includes('venis') || homeName.toLowerCase().includes('venez')) &&
    awayName.toLowerCase().includes('inter') &&
    !event.prediction;

  const cleanLeague = (event.league || 'Italie. Série A')
    .replace(/^Football\s*[\.\-·:]\s*/i, '')
    .replace(/\s*-\s*/g, '. ')
    .trim();

  const seed = computeMatchSeed(homeName, awayName);
  const countryPart = cleanLeague.split('.')[0]?.trim() || 'Italie';
  const defaultTourNum = 8 + (seed % 7);
  const roundSubtitle = event.roundCode
    ? `${event.roundCode}. ${countryPart}`
    : `Tour ${defaultTourNum}. ${countryPart}`;

  const homeLogo = resolveMatchTeamLogo(homeName, event.homeTeam?.logo);
  const awayLogo = resolveMatchTeamLogo(awayName, event.awayTeam?.logo);
  const matchDate = event.date || event.eventDate || DEFAULT_ACCEPTED_MATCH_MARKETS.matchDate;
  const countdownSeconds = 5400 + (seed % 7200);

  if (isDefaultVenise) {
    return {
      ...DEFAULT_ACCEPTED_MATCH_MARKETS,
      eventId: event.id || DEFAULT_ACCEPTED_MATCH_MARKETS.eventId,
      competitionTitle: cleanLeague,
      roundSubtitle,
      matchDate,
      homeTeam: { name: homeName, logo: homeLogo },
      awayTeam: { name: awayName, logo: awayLogo },
    };
  }

  // Adapter dynamiquement toutes les cotes principales et secondaires à l'événement sélectionné
  const rawPred = (event.prediction || '').trim();
  const pred = rawPred.toUpperCase();
  const baseOdd = event.odd && event.odd > 1.01 ? Number(event.odd) : 1.75;

  const seedDelta = ((seed % 11) - 5) * 0.04;
  let v1 = Number((2.15 + seedDelta).toFixed(2));
  let x = Number((3.45 + (seed % 5) * 0.05).toFixed(2));
  let v2 = Number((3.15 - seedDelta).toFixed(2));

  if (pred.includes('1X2. V1') || pred === 'V1' || pred.includes('1X2: 1')) {
    v1 = Number(baseOdd.toFixed(3));
    x = Number(Math.max(3.15, 3.85 - (baseOdd - 1.5) * 0.2).toFixed(2));
    v2 = Number(Math.max(1.55, 5.4 / Math.max(1.15, baseOdd)).toFixed(2));
  } else if (pred.includes('1X2. V2') || pred === 'V2' || pred.includes('1X2: 2')) {
    v2 = Number(baseOdd.toFixed(3));
    x = Number(Math.max(3.25, 4.85 - (baseOdd - 1.3) * 0.45).toFixed(2));
    v1 = Number(Math.max(1.55, 6.1 / Math.max(1.15, baseOdd)).toFixed(2));
  } else if (pred.includes('1X2. X') || pred === 'X') {
    x = Number(baseOdd.toFixed(3));
  } else if (pred.includes('DOUBLE CHANCE. 1X') || pred.includes('1X')) {
    v1 = Number(Math.max(1.58, baseOdd * 1.48).toFixed(2));
    x = Number((3.4 + (seed % 4) * 0.1).toFixed(2));
    v2 = Number(Math.max(2.9, 4.6 / Math.max(1.05, baseOdd)).toFixed(2));
  } else if (pred.includes('DOUBLE CHANCE. 2X') || pred.includes('DOUBLE CHANCE. X2')) {
    v2 = Number(Math.max(1.58, baseOdd * 1.48).toFixed(2));
    x = Number((3.4 + (seed % 4) * 0.1).toFixed(2));
    v1 = Number(Math.max(2.9, 4.6 / Math.max(1.05, baseOdd)).toFixed(2));
  } else if (pred.includes('TOTAL 1')) {
    v1 = Number(Math.max(1.32, baseOdd * 0.96).toFixed(2));
    x = Number((4.5 + (seed % 4) * 0.15).toFixed(2));
    v2 = Number((6.4 + (seed % 5) * 0.25).toFixed(2));
  }

  let dc1x = Number(Math.max(1.08, (1 / (1 / v1 + 1 / x)) * 0.94).toFixed(3));
  let dc12 = Number(Math.max(1.08, (1 / (1 / v1 + 1 / v2)) * 0.94).toFixed(3));
  let dc2x = Number(Math.max(1.08, (1 / (1 / v2 + 1 / x)) * 0.94).toFixed(3));

  if (pred.includes('DOUBLE CHANCE. 1X') || pred === '1X') {
    dc1x = Number(baseOdd.toFixed(3));
  } else if (pred.includes('DOUBLE CHANCE. 12') || pred === '12') {
    dc12 = Number(baseOdd.toFixed(3));
  } else if (pred.includes('DOUBLE CHANCE. 2X') || pred.includes('DOUBLE CHANCE. X2')) {
    dc2x = Number(baseOdd.toFixed(3));
  }

  const isBttsPred = pred.includes('DEUX ÉQUIPES') || pred.includes('DEUX EQUIPES');
  const bttsOui =
    isBttsPred && pred.includes('OUI')
      ? Number(baseOdd.toFixed(3))
      : Number((1.66 + (seed % 6) * 0.05).toFixed(2));
  const bttsNon =
    isBttsPred && pred.includes('NON')
      ? Number(baseOdd.toFixed(3))
      : Number(Math.max(1.42, 3.65 - bttsOui).toFixed(2));

  const isTotalPred = pred.startsWith('TOTAL.') || pred.startsWith('TOTAL ');
  const isTotal1Pred = pred.startsWith('TOTAL 1');
  const isTotal2Pred = pred.startsWith('TOTAL 2');

  const totOver25 =
    isTotalPred && !isTotal1Pred && !isTotal2Pred && pred.includes('2.5') && pred.includes('PLUS')
      ? Number(baseOdd.toFixed(3))
      : Number((1.62 + (seed % 5) * 0.05).toFixed(3));
  const totUnder25 =
    isTotalPred && !isTotal1Pred && !isTotal2Pred && pred.includes('2.5') && pred.includes('MOINS')
      ? Number(baseOdd.toFixed(3))
      : Number(Math.max(1.45, 3.85 - totOver25).toFixed(2));

  const factor = Number((0.92 + (seed % 5) * 0.04).toFixed(2));
  const secondaryRegular = buildSecondaryMarkets(homeName, awayName, factor).map((group) => {
    if (group.id === 'sec_total') {
      return {
        ...group,
        isPrimary: isTotalPred,
        defaultExpanded: isTotalPred,
        options: group.options.map((opt) => {
          if (opt.id === 'tot_o25') return { ...opt, odd: totOver25 };
          if (opt.id === 'tot_u25') return { ...opt, odd: totUnder25 };
          return opt;
        }),
      };
    }
    if (group.id === 'sec_total_1') {
      const t1Over25 =
        isTotal1Pred && pred.includes('2.5') && pred.includes('PLUS')
          ? Number(baseOdd.toFixed(3))
          : Number(Math.max(1.38, v1 * 1.15).toFixed(2));
      return {
        ...group,
        isPrimary: isTotal1Pred,
        defaultExpanded: isTotal1Pred,
        options: group.options.map((opt) => {
          if (opt.id === 't1_o25') return { ...opt, odd: t1Over25 };
          return opt;
        }),
      };
    }
    if (group.id === 'sec_total_2' && isTotal2Pred) {
      return {
        ...group,
        isPrimary: true,
        defaultExpanded: true,
      };
    }
    return group;
  });

  const v1_1h = Number(Math.max(1.45, v1 * 1.28).toFixed(2));
  const x_1h = Number((2.25 + (seed % 5) * 0.1).toFixed(2));
  const v2_1h = Number(Math.max(1.55, v2 * 1.28).toFixed(2));

  const v1_2h = Number(Math.max(1.4, v1 * 1.18).toFixed(2));
  const x_2h = Number((2.55 + (seed % 5) * 0.1).toFixed(2));
  const v2_2h = Number(Math.max(1.5, v2 * 1.18).toFixed(2));

  return {
    ...DEFAULT_ACCEPTED_MATCH_MARKETS,
    eventId: event.id || `${homeName}-${awayName}`,
    sport: event.sport || 'Football',
    competitionTitle: cleanLeague,
    roundSubtitle,
    matchDate,
    initialCountdownSeconds: countdownSeconds,
    homeTeam: { name: homeName, logo: homeLogo },
    awayTeam: { name: awayName, logo: awayLogo },
    periods: {
      regular: [
        {
          id: 'pin_total_pair',
          title: 'Total pair',
          isPrimary: false,
          defaultExpanded: false,
          optionCount: 2,
          columns: 2,
          options: [
            { id: 'tp_oui', label: 'Oui', odd: 1.885 },
            { id: 'tp_non', label: 'Non', odd: 1.915 },
          ],
        },
        {
          id: 'pin_12_total_eq1',
          title: '12 Et Total Equipe 1',
          isPrimary: false,
          defaultExpanded: false,
          optionCount: 2,
          columns: 2,
          options: [
            { id: '12t1_oui', label: 'Oui (1.5)', odd: Number(Math.max(1.45, v1 * 0.78).toFixed(2)) },
            { id: '12t1_non', label: 'Non (1.5)', odd: Number(Math.max(1.35, 3.6 - v1 * 0.65).toFixed(2)) },
          ],
        },
        {
          id: 'prim_1x2',
          title: '1X2',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: 'reg_v1', label: 'V1', odd: v1 },
            { id: 'reg_x', label: 'X', odd: x },
            { id: 'reg_v2', label: 'V2', odd: v2 },
          ],
        },
        {
          id: 'prim_1x2_2up',
          title: '1X2 (2UP)',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: '2up_v1', label: 'V1', odd: Number(Math.max(1.05, v1 * 0.982).toFixed(3)) },
            { id: '2up_x', label: 'Match nul', odd: x },
            { id: '2up_v2', label: 'V2', odd: Number(Math.max(1.05, v2 * 0.982).toFixed(3)) },
          ],
        },
        {
          id: 'prim_dc',
          title: 'Double chance',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: 'dc_1x', label: '1X', odd: dc1x },
            { id: 'dc_12', label: '12', odd: dc12 },
            { id: 'dc_2x', label: '2X', odd: dc2x },
          ],
        },
        {
          id: 'prim_btts',
          title: 'Deux équipes vont marquer',
          isPrimary: true,
          defaultExpanded: true,
          optionCount: 4,
          columns: 2,
          options: [
            { id: 'btts_oui', label: 'Oui', odd: bttsOui },
            { id: 'btts_non', label: 'Non', odd: bttsNon },
            { id: 'btts_2plus_oui', label: 'Chaque Equipe va marquer (2) Ou Plus - Oui', odd: 4.02 },
            { id: 'btts_2plus_non', label: 'Chaque Equipe va marquer (2) Ou Plus - Non', odd: 1.201 },
          ],
        },
        ...secondaryRegular,
      ],
      first_half: [
        {
          id: '1h_1x2',
          title: '1X2',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: '1h_v1', label: 'V1', odd: v1_1h },
            { id: '1h_x', label: 'X', odd: x_1h },
            { id: '1h_v2', label: 'V2', odd: v2_1h },
          ],
        },
        {
          id: '1h_dc',
          title: 'Double chance',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: '1h_1x', label: '1X', odd: Number(Math.max(1.08, dc1x * 0.92).toFixed(3)) },
            { id: '1h_12', label: '12', odd: Number(Math.max(1.18, dc12 * 1.15).toFixed(2)) },
            { id: '1h_2x', label: '2X', odd: Number(Math.max(1.08, dc2x * 0.92).toFixed(3)) },
          ],
        },
        {
          id: '1h_btts',
          title: 'Deux équipes vont marquer',
          isPrimary: true,
          defaultExpanded: true,
          columns: 2,
          options: [
            { id: '1h_btts_oui', label: 'Oui', odd: Number((bttsOui * 1.85).toFixed(2)) },
            { id: '1h_btts_non', label: 'Non', odd: Number(Math.max(1.16, bttsNon * 0.72).toFixed(2)) },
          ],
        },
        ...buildSecondaryMarkets(homeName, awayName, factor * 1.14).slice(1, 12),
      ],
      second_half: [
        {
          id: '2h_1x2',
          title: '1X2',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: '2h_v1', label: 'V1', odd: v1_2h },
            { id: '2h_x', label: 'X', odd: x_2h },
            { id: '2h_v2', label: 'V2', odd: v2_2h },
          ],
        },
        {
          id: '2h_dc',
          title: 'Double chance',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: '2h_1x', label: '1X', odd: Number(Math.max(1.09, dc1x * 0.95).toFixed(3)) },
            { id: '2h_12', label: '12', odd: Number(Math.max(1.15, dc12 * 1.08).toFixed(2)) },
            { id: '2h_2x', label: '2X', odd: Number(Math.max(1.09, dc2x * 0.95).toFixed(3)) },
          ],
        },
        {
          id: '2h_btts',
          title: 'Deux équipes vont marquer',
          isPrimary: true,
          defaultExpanded: true,
          columns: 2,
          options: [
            { id: '2h_btts_oui', label: 'Oui', odd: Number((bttsOui * 1.52).toFixed(2)) },
            { id: '2h_btts_non', label: 'Non', odd: Number(Math.max(1.22, bttsNon * 0.78).toFixed(3)) },
          ],
        },
        ...buildSecondaryMarkets(homeName, awayName, factor * 1.08).slice(1, 12),
      ],
      corners: [
        {
          id: 'cor_1x2',
          title: '1X2 Corners',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: 'cor_v1', label: 'V1', odd: Number(Math.max(1.32, v1 * 0.88).toFixed(2)) },
            { id: 'cor_x', label: 'X', odd: Number((8.4 + (seed % 4) * 0.3).toFixed(1)) },
            { id: 'cor_v2', label: 'V2', odd: Number(Math.max(1.35, v2 * 0.88).toFixed(2)) },
          ],
        },
        {
          id: 'cor_dc',
          title: 'Double chance (Corners)',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: 'cor_1x', label: '1X', odd: Number(Math.max(1.12, dc1x * 0.96).toFixed(2)) },
            { id: 'cor_12', label: '12', odd: 1.08 },
            { id: 'cor_2x', label: '2X', odd: Number(Math.max(1.14, dc2x * 0.96).toFixed(2)) },
          ],
        },
        {
          id: 'cor_total',
          title: 'Total Corners',
          isPrimary: true,
          defaultExpanded: true,
          columns: 2,
          options: [
            { id: 'cor_o95', label: 'Plus de (9.5)', odd: Number((1.78 + (seed % 4) * 0.04).toFixed(2)) },
            { id: 'cor_u95', label: 'Moins de (9.5)', odd: Number((1.98 - (seed % 4) * 0.04).toFixed(2)) },
          ],
        },
        ...DEFAULT_ACCEPTED_MATCH_MARKETS.periods.corners.slice(3),
      ],
      corners_first_half: [
        {
          id: 'cor1h_1x2',
          title: '1X2 Corners (1ère MT)',
          isPrimary: true,
          defaultExpanded: true,
          columns: 3,
          options: [
            { id: 'cor1h_v1', label: 'V1', odd: Number(Math.max(1.48, v1 * 0.95).toFixed(2)) },
            { id: 'cor1h_x', label: 'X', odd: 5.4 },
            { id: 'cor1h_v2', label: 'V2', odd: Number(Math.max(1.52, v2 * 0.95).toFixed(2)) },
          ],
        },
        ...DEFAULT_ACCEPTED_MATCH_MARKETS.periods.corners_first_half.slice(1),
      ],
    },
  };
}

/**
 * Helper déterminant si le statut d'un coupon correspond à un pari PAYÉ (terminé/gagné)
 * ou ACCEPTÉ (à venir / en attente).
 */
export function resolveMatchNavigationTarget(
  couponStatus?: BetStatus | string,
  isWonFlag?: boolean
): 'MatchStatistics' | 'MatchMarkets' {
  const normalized = String(couponStatus || '').trim().toUpperCase();
  if (
    isWonFlag ||
    normalized === 'PAID' ||
    normalized === 'PAYÉ' ||
    normalized === 'PAYE' ||
    normalized === 'GAGNÉ' ||
    normalized === 'GAGNE' ||
    normalized === 'GAIN' ||
    normalized === 'PERDU' ||
    normalized === 'PERTE'
  ) {
    return 'MatchStatistics';
  }
  return 'MatchMarkets';
}
