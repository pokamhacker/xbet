/**
 * Référentiel unifié des sélections nationales (Afrique, Europe, Amériques, Asie, Océanie)
 * et détection automatique pour le rendu sphérique 3D (NationalTeamLogo3D).
 *
 * Les drapeaux utilisent flagcdn.com (format plein cadre) afin de remplir 100 %
 * de la sphère 3D sans marges transparentes.
 */

import { AFRICAN_COUNTRIES, normalizeAfricanCountryKey } from './africanCountries';

export interface NationalTeamEntry {
  id: string;
  name: string;
  shortName: string;
  iso2: string;
  logo: string;
  fallbackLogo: string;
  aliases: string[];
}

interface NationalTeamSeed {
  id: string;
  name: string;
  shortName: string;
  iso2: string;
  aliases: string[];
}

const WORLD_NATIONAL_TEAM_SEEDS: NationalTeamSeed[] = [
  // Europe (UEFA)
  { id: 'unl-france', name: 'France', shortName: 'FRA', iso2: 'fr', aliases: ['france', 'equipe de france'] },
  { id: 'unl-espagne', name: 'Espagne', shortName: 'ESP', iso2: 'es', aliases: ['spain', 'espagne', 'espana', 'españa'] },
  { id: 'unl-allemagne', name: 'Allemagne', shortName: 'GER', iso2: 'de', aliases: ['germany', 'allemagne', 'deutschland'] },
  { id: 'unl-portugal', name: 'Portugal', shortName: 'POR', iso2: 'pt', aliases: ['portugal'] },
  { id: 'unl-italie', name: 'Italie', shortName: 'ITA', iso2: 'it', aliases: ['italy', 'italie', 'italia'] },
  { id: 'unl-pays-bas', name: 'Pays-Bas', shortName: 'NED', iso2: 'nl', aliases: ['netherlands', 'holland', 'pays-bas', 'pays bas', 'hollande'] },
  { id: 'unl-angleterre', name: 'Angleterre', shortName: 'ENG', iso2: 'gb-eng', aliases: ['england', 'angleterre'] },
  { id: 'unl-belgique', name: 'Belgique', shortName: 'BEL', iso2: 'be', aliases: ['belgium', 'belgique', 'belgie'] },
  { id: 'unl-croatie', name: 'Croatie', shortName: 'CRO', iso2: 'hr', aliases: ['croatia', 'croatie', 'hrvatska'] },
  { id: 'unl-suisse', name: 'Suisse', shortName: 'SUI', iso2: 'ch', aliases: ['switzerland', 'suisse', 'schweiz'] },
  { id: 'unl-danemark', name: 'Danemark', shortName: 'DEN', iso2: 'dk', aliases: ['denmark', 'danemark', 'danmark'] },
  { id: 'unl-autriche', name: 'Autriche', shortName: 'AUT', iso2: 'at', aliases: ['austria', 'autriche', 'osterreich'] },
  { id: 'unl-serbie', name: 'Serbie', shortName: 'SRB', iso2: 'rs', aliases: ['serbia', 'serbie', 'srbija'] },
  { id: 'unl-pologne', name: 'Pologne', shortName: 'POL', iso2: 'pl', aliases: ['poland', 'pologne', 'polska'] },
  { id: 'unl-ecosse', name: 'Écosse', shortName: 'SCO', iso2: 'gb-sct', aliases: ['scotland', 'ecosse', 'écosse'] },
  { id: 'unl-hongrie', name: 'Hongrie', shortName: 'HUN', iso2: 'hu', aliases: ['hungary', 'hongrie'] },
  { id: 'unl-ukraine', name: 'Ukraine', shortName: 'UKR', iso2: 'ua', aliases: ['ukraine'] },
  { id: 'unl-turquie', name: 'Turquie', shortName: 'TUR', iso2: 'tr', aliases: ['turkey', 'turkiye', 'türkiye', 'turquie'] },
  { id: 'unl-suede', name: 'Suède', shortName: 'SWE', iso2: 'se', aliases: ['sweden', 'suede', 'suède', 'sverige'] },
  { id: 'unl-norvege', name: 'Norvège', shortName: 'NOR', iso2: 'no', aliases: ['norway', 'norvege', 'norvège', 'norge'] },
  { id: 'unl-tchequie', name: 'République Tchèque', shortName: 'CZE', iso2: 'cz', aliases: ['czechia', 'czech republic', 'republique tcheque', 'république tchèque', 'tchequie', 'tchéquie'] },
  { id: 'unl-pays-de-galles', name: 'Pays de Galles', shortName: 'WAL', iso2: 'gb-wls', aliases: ['wales', 'pays de galles'] },
  { id: 'unl-grece', name: 'Grèce', shortName: 'GRE', iso2: 'gr', aliases: ['greece', 'grece', 'grèce'] },
  { id: 'unl-roumanie', name: 'Roumanie', shortName: 'ROU', iso2: 'ro', aliases: ['romania', 'roumanie'] },
  { id: 'unl-slovaquie', name: 'Slovaquie', shortName: 'SVK', iso2: 'sk', aliases: ['slovakia', 'slovaquie'] },
  { id: 'unl-slovenie', name: 'Slovénie', shortName: 'SVN', iso2: 'si', aliases: ['slovenia', 'slovenie', 'slovénie'] },
  { id: 'unl-irlande', name: 'Irlande', shortName: 'IRL', iso2: 'ie', aliases: ['ireland', 'irlande', 'republic of ireland'] },
  { id: 'unl-georgie', name: 'Géorgie', shortName: 'GEO', iso2: 'ge', aliases: ['georgia', 'georgie', 'géorgie'] },
  { id: 'unl-finlande', name: 'Finlande', shortName: 'FIN', iso2: 'fi', aliases: ['finland', 'finlande'] },
  { id: 'unl-islande', name: 'Islande', shortName: 'ISL', iso2: 'is', aliases: ['iceland', 'islande'] },
  { id: 'unl-bosnie', name: 'Bosnie-Herzégovine', shortName: 'BIH', iso2: 'ba', aliases: ['bosnia', 'bosnia and herzegovina', 'bosnie', 'bosnie-herzegovine', 'bosnie-herzégovine'] },
  { id: 'unl-israel', name: 'Israël', shortName: 'ISR', iso2: 'il', aliases: ['israel', 'israël'] },
  { id: 'unl-albanie', name: 'Albanie', shortName: 'ALB', iso2: 'al', aliases: ['albania', 'albanie'] },
  { id: 'unl-montenegro', name: 'Monténégro', shortName: 'MNE', iso2: 'me', aliases: ['montenegro', 'monténégro'] },
  { id: 'unl-armenie', name: 'Arménie', shortName: 'ARM', iso2: 'am', aliases: ['armenia', 'armenie', 'arménie'] },
  { id: 'unl-bulgarie', name: 'Bulgarie', shortName: 'BUL', iso2: 'bg', aliases: ['bulgaria', 'bulgarie'] },
  { id: 'unl-kosovo', name: 'Kosovo', shortName: 'KOS', iso2: 'xk', aliases: ['kosovo'] },
  { id: 'unl-luxembourg', name: 'Luxembourg', shortName: 'LUX', iso2: 'lu', aliases: ['luxembourg'] },
  { id: 'unl-irlande-du-nord', name: 'Irlande du Nord', shortName: 'NIR', iso2: 'gb-nir', aliases: ['northern ireland', 'irlande du nord'] },
  { id: 'unl-bielorussie', name: 'Biélorussie', shortName: 'BLR', iso2: 'by', aliases: ['belarus', 'bielorussie', 'biélorussie'] },
  { id: 'unl-kazakhstan', name: 'Kazakhstan', shortName: 'KAZ', iso2: 'kz', aliases: ['kazakhstan'] },
  { id: 'unl-azerbaidjan', name: 'Azerbaïdjan', shortName: 'AZE', iso2: 'az', aliases: ['azerbaijan', 'azerbaidjan', 'azerbaïdjan'] },
  { id: 'unl-estonie', name: 'Estonie', shortName: 'EST', iso2: 'ee', aliases: ['estonia', 'estonie'] },
  { id: 'unl-chypre', name: 'Chypre', shortName: 'CYP', iso2: 'cy', aliases: ['cyprus', 'chypre'] },
  { id: 'unl-macedoine-du-nord', name: 'Macédoine du Nord', shortName: 'MKD', iso2: 'mk', aliases: ['north macedonia', 'macedonia', 'macedoine du nord', 'macédoine du nord'] },
  { id: 'unl-iles-feroe', name: 'Îles Féroé', shortName: 'FRO', iso2: 'fo', aliases: ['faroe islands', 'iles feroe', 'îles féroé'] },
  { id: 'unl-lettonie', name: 'Lettonie', shortName: 'LVA', iso2: 'lv', aliases: ['latvia', 'lettonie'] },
  { id: 'unl-lituanie', name: 'Lituanie', shortName: 'LTU', iso2: 'lt', aliases: ['lithuania', 'lituanie'] },
  { id: 'unl-moldavie', name: 'Moldavie', shortName: 'MDA', iso2: 'md', aliases: ['moldova', 'moldavie'] },
  { id: 'unl-malte', name: 'Malte', shortName: 'MLT', iso2: 'mt', aliases: ['malta', 'malte'] },
  { id: 'unl-andorre', name: 'Andorre', shortName: 'AND', iso2: 'ad', aliases: ['andorra', 'andorre'] },
  { id: 'unl-gibraltar', name: 'Gibraltar', shortName: 'GIB', iso2: 'gi', aliases: ['gibraltar'] },
  { id: 'unl-liechtenstein', name: 'Liechtenstein', shortName: 'LIE', iso2: 'li', aliases: ['liechtenstein'] },
  { id: 'unl-saint-marin', name: 'Saint-Marin', shortName: 'SMR', iso2: 'sm', aliases: ['san marino', 'saint-marin', 'saint marin'] },
  { id: 'team-russie', name: 'Russie', shortName: 'RUS', iso2: 'ru', aliases: ['russia', 'russie'] },

  // Amériques (CONMEBOL & CONCACAF)
  { id: 'team-bresil', name: 'Brésil', shortName: 'BRA', iso2: 'br', aliases: ['brazil', 'bresil', 'brésil', 'brasil'] },
  { id: 'team-argentine', name: 'Argentine', shortName: 'ARG', iso2: 'ar', aliases: ['argentina', 'argentine'] },
  { id: 'team-uruguay', name: 'Uruguay', shortName: 'URU', iso2: 'uy', aliases: ['uruguay'] },
  { id: 'team-colombie', name: 'Colombie', shortName: 'COL', iso2: 'co', aliases: ['colombia', 'colombie'] },
  { id: 'team-chili', name: 'Chili', shortName: 'CHI', iso2: 'cl', aliases: ['chile', 'chili'] },
  { id: 'team-equateur', name: 'Équateur', shortName: 'ECU', iso2: 'ec', aliases: ['ecuador', 'equateur', 'équateur'] },
  { id: 'team-perou', name: 'Pérou', shortName: 'PER', iso2: 'pe', aliases: ['peru', 'perou', 'pérou'] },
  { id: 'team-paraguay', name: 'Paraguay', shortName: 'PAR', iso2: 'py', aliases: ['paraguay'] },
  { id: 'team-venezuela', name: 'Venezuela', shortName: 'VEN', iso2: 've', aliases: ['venezuela'] },
  { id: 'team-bolivie', name: 'Bolivie', shortName: 'BOL', iso2: 'bo', aliases: ['bolivia', 'bolivie'] },
  { id: 'team-etats-unis', name: 'États-Unis', shortName: 'USA', iso2: 'us', aliases: ['usa', 'united states', 'etats-unis', 'états-unis', 'etats unis'] },
  { id: 'team-mexique', name: 'Mexique', shortName: 'MEX', iso2: 'mx', aliases: ['mexico', 'mexique'] },
  { id: 'team-canada', name: 'Canada', shortName: 'CAN', iso2: 'ca', aliases: ['canada'] },
  { id: 'team-costa-rica', name: 'Costa Rica', shortName: 'CRC', iso2: 'cr', aliases: ['costa rica'] },
  { id: 'team-panama', name: 'Panama', shortName: 'PAN', iso2: 'pa', aliases: ['panama'] },
  { id: 'team-jamaique', name: 'Jamaïque', shortName: 'JAM', iso2: 'jm', aliases: ['jamaica', 'jamaique', 'jamaïque'] },
  { id: 'team-honduras', name: 'Honduras', shortName: 'HON', iso2: 'hn', aliases: ['honduras'] },
  { id: 'team-haiti', name: 'Haïti', shortName: 'HAI', iso2: 'ht', aliases: ['haiti', 'haïti'] },
  { id: 'team-guatemala', name: 'Guatemala', shortName: 'GUA', iso2: 'gt', aliases: ['guatemala'] },
  { id: 'team-salvador', name: 'Salvador', shortName: 'SLV', iso2: 'sv', aliases: ['el salvador', 'salvador'] },
  { id: 'team-cuba', name: 'Cuba', shortName: 'CUB', iso2: 'cu', aliases: ['cuba'] },
  { id: 'team-republique-dominicaine', name: 'République dominicaine', shortName: 'DOM', iso2: 'do', aliases: ['dominican republic', 'republique dominicaine', 'république dominicaine'] },

  // Asie & Océanie (AFC & OFC)
  { id: 'team-japon', name: 'Japon', shortName: 'JPN', iso2: 'jp', aliases: ['japan', 'japon'] },
  { id: 'team-coree-du-sud', name: 'Corée du Sud', shortName: 'KOR', iso2: 'kr', aliases: ['south korea', 'korea republic', 'coree du sud', 'corée du sud'] },
  { id: 'team-australie', name: 'Australie', shortName: 'AUS', iso2: 'au', aliases: ['australia', 'australie'] },
  { id: 'team-arabie-saoudite', name: 'Arabie saoudite', shortName: 'KSA', iso2: 'sa', aliases: ['saudi arabia', 'arabie saoudite'] },
  { id: 'team-qatar', name: 'Qatar', shortName: 'QAT', iso2: 'qa', aliases: ['qatar'] },
  { id: 'team-iran', name: 'Iran', shortName: 'IRN', iso2: 'ir', aliases: ['iran', 'ir iran'] },
  { id: 'team-irak', name: 'Irak', shortName: 'IRQ', iso2: 'iq', aliases: ['iraq', 'irak'] },
  { id: 'team-jordanie', name: 'Jordanie', shortName: 'JOR', iso2: 'jo', aliases: ['jordan', 'jordanie'] },
  { id: 'team-emirats-arabes-unis', name: 'Émirats arabes unis', shortName: 'UAE', iso2: 'ae', aliases: ['united arab emirates', 'uae', 'emirats arabes unis', 'émirats arabes unis'] },
  { id: 'team-oman', name: 'Oman', shortName: 'OMN', iso2: 'om', aliases: ['oman'] },
  { id: 'team-bahrein', name: 'Bahreïn', shortName: 'BHR', iso2: 'bh', aliases: ['bahrain', 'bahrein', 'bahreïn'] },
  { id: 'team-koweit', name: 'Koweït', shortName: 'KUW', iso2: 'kw', aliases: ['kuwait', 'koweit', 'koweït'] },
  { id: 'team-ouzbekistan', name: 'Ouzbékistan', shortName: 'UZB', iso2: 'uz', aliases: ['uzbekistan', 'ouzbekistan', 'ouzbékistan'] },
  { id: 'team-chine', name: 'Chine', shortName: 'CHN', iso2: 'cn', aliases: ['china', 'chine', 'china pr'] },
  { id: 'team-inde', name: 'Inde', shortName: 'IND', iso2: 'in', aliases: ['india', 'inde'] },
  { id: 'team-thailande', name: 'Thaïlande', shortName: 'THA', iso2: 'th', aliases: ['thailand', 'thailande', 'thaïlande'] },
  { id: 'team-vietnam', name: 'Viêt Nam', shortName: 'VIE', iso2: 'vn', aliases: ['vietnam', 'viet nam', 'viêt nam'] },
  { id: 'team-indonesie', name: 'Indonésie', shortName: 'IDN', iso2: 'id', aliases: ['indonesia', 'indonesie', 'indonésie'] },
  { id: 'team-malaisie', name: 'Malaisie', shortName: 'MAS', iso2: 'my', aliases: ['malaysia', 'malaisie'] },
  { id: 'team-philippines', name: 'Philippines', shortName: 'PHI', iso2: 'ph', aliases: ['philippines'] },
  { id: 'team-coree-du-nord', name: 'Corée du Nord', shortName: 'PRK', iso2: 'kp', aliases: ['north korea', 'korea dpr', 'coree du nord', 'corée du nord'] },
  { id: 'team-syrie', name: 'Syrie', shortName: 'SYR', iso2: 'sy', aliases: ['syria', 'syrie'] },
  { id: 'team-liban', name: 'Liban', shortName: 'LBN', iso2: 'lb', aliases: ['lebanon', 'liban'] },
  { id: 'team-palestine', name: 'Palestine', shortName: 'PLE', iso2: 'ps', aliases: ['palestine'] },
  { id: 'team-nouvelle-zelande', name: 'Nouvelle-Zélande', shortName: 'NZL', iso2: 'nz', aliases: ['new zealand', 'nouvelle-zelande', 'nouvelle-zélande', 'nouvelle zelande'] },
];

export const makeNationalFlagUrl = (iso2: string): string =>
  `https://flagcdn.com/w160/${iso2.toLowerCase()}.png`;

export const makeNationalFlagFallbackUrl = (iso2: string): string => {
  // flagsapi.com ne supporte que les codes ISO-2 standards (2 lettres)
  const clean = iso2.split('-')[0].toUpperCase();
  return `https://flagsapi.com/${clean}/flat/64.png`;
};

const WORLD_NATIONAL_TEAMS: NationalTeamEntry[] = WORLD_NATIONAL_TEAM_SEEDS.map((c) => ({
  ...c,
  logo: makeNationalFlagUrl(c.iso2),
  fallbackLogo: makeNationalFlagFallbackUrl(c.iso2),
}));

export const NATIONAL_TEAMS: NationalTeamEntry[] = [
  ...AFRICAN_COUNTRIES,
  ...WORLD_NATIONAL_TEAMS,
];

const NATIONAL_ID_MAP = new Map<string, NationalTeamEntry>();
const NATIONAL_NAME_MAP = new Map<string, NationalTeamEntry>();

// Alias supplémentaires d'IDs présents dans fifaLeagues / sportsCatalog
const EXTRA_ID_ALIASES: Record<string, string> = {
  'team-france': 'france',
  'team-bresil': 'bresil',
  'team-argentine': 'argentine',
  'team-angleterre': 'angleterre',
  'fifa-fra': 'france',
  'fifa-arg': 'argentine',
  'fifa-bra': 'bresil',
  'fifa-eng': 'angleterre',
  'fifa-esp': 'espagne',
  'fifa-ger': 'allemagne',
  'fifa-por': 'portugal',
  'fifa-ita': 'italie',
  'fifa-ned': 'pays bas',
  'fifa-bel': 'belgique',
  'fifa-cro': 'croatie',
  'fifa-sui': 'suisse',
  'fifa-den': 'danemark',
};

for (const entry of NATIONAL_TEAMS) {
  NATIONAL_ID_MAP.set(entry.id.toLowerCase(), entry);
  NATIONAL_NAME_MAP.set(normalizeAfricanCountryKey(entry.name), entry);
  for (const alias of entry.aliases) {
    NATIONAL_NAME_MAP.set(normalizeAfricanCountryKey(alias), entry);
  }
}

for (const [aliasId, countryName] of Object.entries(EXTRA_ID_ALIASES)) {
  const target = NATIONAL_NAME_MAP.get(countryName);
  if (target) {
    NATIONAL_ID_MAP.set(aliasId, target);
  }
}

/**
 * Nettoie un nom d'équipe nationale (catégories d'âge / féminines) sans altérer les noms de clubs.
 */
function stripNationalCategorySuffixes(raw: string): string {
  return normalizeAfricanCountryKey(raw)
    .replace(/\((f|w|h|m|u\d{2})\)/gi, '')
    .replace(/\b(u\d{2}|olympic|olympique|feminin|feminine|women)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Recherche une sélection nationale par nom, alias FR/EN ou identifiant catalogue.
 */
export function findNationalTeam(idOrName?: string): NationalTeamEntry | undefined {
  if (!idOrName) return undefined;
  const rawLower = idOrName.trim().toLowerCase();
  const byId = NATIONAL_ID_MAP.get(rawLower);
  if (byId) return byId;

  const norm = normalizeAfricanCountryKey(idOrName);
  if (!norm) return undefined;
  const exact = NATIONAL_NAME_MAP.get(norm);
  if (exact) return exact;

  const stripped = stripNationalCategorySuffixes(idOrName);
  if (stripped && stripped !== norm) {
    return NATIONAL_NAME_MAP.get(stripped);
  }
  return undefined;
}

/**
 * Retourne le drapeau plein cadre flagcdn.com pour une équipe nationale, ou null pour un club.
 */
export function resolveNationalTeamFlag(idOrName?: string): string | null {
  return findNationalTeam(idOrName)?.logo || null;
}

/**
 * Retourne le drapeau de secours secondaire si l'URL principale échoue.
 */
export function resolveNationalTeamFallbackFlag(idOrName?: string): string | null {
  return findNationalTeam(idOrName)?.fallbackLogo || null;
}

/**
 * Vérifie si un nom de compétition / ligue désigne une compétition de sélections nationales.
 */
export function isNationalLeagueName(leagueName?: string): boolean {
  if (!leagueName) return false;
  const norm = normalizeAfricanCountryKey(leagueName);
  if (!norm) return false;

  // Exclure explicitement les compétitions de clubs (ex: Coupe du monde des clubs)
  if (norm.includes('des clubs') || norm.includes('club world cup') || norm.includes('ligue des champions')) {
    return false;
  }

  const internationalPatterns = [
    'coupe du monde',
    'world cup',
    'championnat du monde',
    'ligue des nations',
    'nations league',
    'coupe d afrique des nations',
    'africa cup of nations',
    'afcon',
    'copa america',
    'gold cup',
    'coupe d asie',
    'asian cup',
    'amicaux internationaux',
    'matchs amicaux internationaux',
    'international friendl',
    'amical international',
    'selections nationales',
    'equipes nationales',
    'eliminatoires',
    'qualifications coupe du monde',
    'qualifications euro',
    'qualifications can',
    'euro 20',
    'uefa euro',
    'championnat d europe',
  ];

  if (internationalPatterns.some((kw) => norm.includes(kw))) {
    return true;
  }

  return /\b(can|chan|euro)\b/.test(norm);
}

/**
 * Détermine automatiquement si un logo d'équipe correspond à une sélection nationale
 * (détection par nom de pays, URL de drapeau, ou ligue internationale).
 */
export function isNationalTeamEntity(
  teamName?: string,
  leagueName?: string,
  logoUrl?: string
): boolean {
  if (findNationalTeam(teamName)) {
    return true;
  }

  if (logoUrl) {
    const lowerUrl = logoUrl.toLowerCase();
    if (lowerUrl.includes('flagcdn.com/') || lowerUrl.includes('flagsapi.com/')) {
      return true;
    }
  }

  if (isNationalLeagueName(leagueName)) {
    return true;
  }

  return false;
}
