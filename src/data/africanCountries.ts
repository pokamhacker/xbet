/**
 * Référentiel des 54 pays africains (CAF / Nations africaines) et de leurs drapeaux officiels CDN.
 * Utilisé pour la CAN, les sélections nationales, le catalogue des compétitions et la résolution des logos.
 */

export interface AfricanCountryEntry {
  id: string;
  name: string;
  shortName: string;
  iso2: string;
  logo: string;
  fallbackLogo: string;
  aliases: string[];
}

interface AfricanCountrySeed {
  id: string;
  name: string;
  shortName: string;
  iso2: string;
  aliases: string[];
}

const AFRICAN_COUNTRY_SEEDS: AfricanCountrySeed[] = [
  { id: 'team-cameroun', name: 'Cameroun', shortName: 'CMR', iso2: 'cm', aliases: ['cameroon', 'cameroun'] },
  { id: 'team-cote-divoire', name: "Côte d'Ivoire", shortName: 'CIV', iso2: 'ci', aliases: ["cote d'ivoire", 'cote divoire', 'ivory coast'] },
  { id: 'team-senegal', name: 'Sénégal', shortName: 'SEN', iso2: 'sn', aliases: ['senegal', 'sénégal'] },
  { id: 'team-maroc', name: 'Maroc', shortName: 'MAR', iso2: 'ma', aliases: ['morocco', 'maroc'] },
  { id: 'team-algerie', name: 'Algérie', shortName: 'ALG', iso2: 'dz', aliases: ['algeria', 'algerie', 'algérie'] },
  { id: 'team-egypte', name: 'Égypte', shortName: 'EGY', iso2: 'eg', aliases: ['egypt', 'egypte', 'égypte'] },
  { id: 'team-nigeria', name: 'Nigeria', shortName: 'NGA', iso2: 'ng', aliases: ['nigeria', 'nigéria'] },
  { id: 'team-tunisie', name: 'Tunisie', shortName: 'TUN', iso2: 'tn', aliases: ['tunisia', 'tunisie'] },
  { id: 'team-mali', name: 'Mali', shortName: 'MLI', iso2: 'ml', aliases: ['mali'] },
  { id: 'team-burkina-faso', name: 'Burkina Faso', shortName: 'BFA', iso2: 'bf', aliases: ['burkina faso', 'burkina'] },
  { id: 'team-ghana', name: 'Ghana', shortName: 'GHA', iso2: 'gh', aliases: ['ghana'] },
  {
    id: 'team-rd-congo',
    name: 'RD Congo',
    shortName: 'COD',
    iso2: 'cd',
    aliases: ['rd congo', 'rdc', 'dr congo', 'congo dr', 'republique democratique du congo', 'democratic republic of congo'],
  },
  { id: 'team-guinee', name: 'Guinée', shortName: 'GUI', iso2: 'gn', aliases: ['guinea', 'guinee', 'guinée', 'guinee conakry'] },
  { id: 'team-afrique-du-sud', name: 'Afrique du Sud', shortName: 'RSA', iso2: 'za', aliases: ['south africa', 'afrique du sud'] },
  { id: 'team-cap-vert', name: 'Cap-Vert', shortName: 'CPV', iso2: 'cv', aliases: ['cape verde', 'cabo verde', 'cap vert', 'cap-vert'] },
  { id: 'team-angola', name: 'Angola', shortName: 'ANG', iso2: 'ao', aliases: ['angola'] },
  { id: 'team-zambie', name: 'Zambie', shortName: 'ZAM', iso2: 'zm', aliases: ['zambia', 'zambie'] },
  { id: 'team-gabon', name: 'Gabon', shortName: 'GAB', iso2: 'ga', aliases: ['gabon'] },
  { id: 'team-togo', name: 'Togo', shortName: 'TOG', iso2: 'tg', aliases: ['togo'] },
  { id: 'team-benin', name: 'Bénin', shortName: 'BEN', iso2: 'bj', aliases: ['benin', 'bénin'] },
  { id: 'team-botswana', name: 'Botswana', shortName: 'BOT', iso2: 'bw', aliases: ['botswana'] },
  { id: 'team-burundi', name: 'Burundi', shortName: 'BDI', iso2: 'bi', aliases: ['burundi'] },
  {
    id: 'team-centrafrique',
    name: 'Centrafrique',
    shortName: 'CTA',
    iso2: 'cf',
    aliases: ['centrafrique', 'republique centrafricaine', 'central african republic', 'rca'],
  },
  { id: 'team-comores', name: 'Comores', shortName: 'COM', iso2: 'km', aliases: ['comoros', 'comores'] },
  {
    id: 'team-congo',
    name: 'Congo',
    shortName: 'CGO',
    iso2: 'cg',
    aliases: ['congo', 'republique du congo', 'congo brazzaville', 'republic of the congo'],
  },
  { id: 'team-djibouti', name: 'Djibouti', shortName: 'DJI', iso2: 'dj', aliases: ['djibouti'] },
  { id: 'team-erythree', name: 'Érythrée', shortName: 'ERI', iso2: 'er', aliases: ['eritrea', 'erythree', 'érythrée'] },
  { id: 'team-eswatini', name: 'Eswatini', shortName: 'SWZ', iso2: 'sz', aliases: ['eswatini', 'swaziland'] },
  { id: 'team-ethiopie', name: 'Éthiopie', shortName: 'ETH', iso2: 'et', aliases: ['ethiopia', 'ethiopie', 'éthiopie'] },
  { id: 'team-gambie', name: 'Gambie', shortName: 'GAM', iso2: 'gm', aliases: ['gambia', 'gambie', 'the gambia'] },
  { id: 'team-guinee-bissau', name: 'Guinée-Bissau', shortName: 'GNB', iso2: 'gw', aliases: ['guinea bissau', 'guinea-bissau', 'guinee bissau', 'guinee-bissau'] },
  { id: 'team-guinee-equatoriale', name: 'Guinée équatoriale', shortName: 'EQG', iso2: 'gq', aliases: ['equatorial guinea', 'guinee equatoriale', 'guinée équatoriale'] },
  { id: 'team-kenya', name: 'Kenya', shortName: 'KEN', iso2: 'ke', aliases: ['kenya'] },
  { id: 'team-lesotho', name: 'Lesotho', shortName: 'LES', iso2: 'ls', aliases: ['lesotho'] },
  { id: 'team-liberia', name: 'Liberia', shortName: 'LBR', iso2: 'lr', aliases: ['liberia', 'libéria'] },
  { id: 'team-libye', name: 'Libye', shortName: 'LBY', iso2: 'ly', aliases: ['libya', 'libye'] },
  { id: 'team-madagascar', name: 'Madagascar', shortName: 'MAD', iso2: 'mg', aliases: ['madagascar'] },
  { id: 'team-malawi', name: 'Malawi', shortName: 'MWI', iso2: 'mw', aliases: ['malawi'] },
  { id: 'team-maurice', name: 'Maurice', shortName: 'MRI', iso2: 'mu', aliases: ['mauritius', 'maurice', 'ile maurice'] },
  { id: 'team-mauritanie', name: 'Mauritanie', shortName: 'MTN', iso2: 'mr', aliases: ['mauritania', 'mauritanie'] },
  { id: 'team-mozambique', name: 'Mozambique', shortName: 'MOZ', iso2: 'mz', aliases: ['mozambique'] },
  { id: 'team-namibie', name: 'Namibie', shortName: 'NAM', iso2: 'na', aliases: ['namibia', 'namibie'] },
  { id: 'team-niger', name: 'Niger', shortName: 'NIG', iso2: 'ne', aliases: ['niger'] },
  { id: 'team-ouganda', name: 'Ouganda', shortName: 'UGA', iso2: 'ug', aliases: ['uganda', 'ouganda'] },
  { id: 'team-rwanda', name: 'Rwanda', shortName: 'RWA', iso2: 'rw', aliases: ['rwanda'] },
  {
    id: 'team-sao-tome',
    name: 'Sao Tomé-et-Principe',
    shortName: 'STP',
    iso2: 'st',
    aliases: ['sao tome and principe', 'sao tome-et-principe', 'sao tome', 'sao tomé'],
  },
  { id: 'team-seychelles', name: 'Seychelles', shortName: 'SEY', iso2: 'sc', aliases: ['seychelles'] },
  { id: 'team-sierra-leone', name: 'Sierra Leone', shortName: 'SLE', iso2: 'sl', aliases: ['sierra leone'] },
  { id: 'team-somalie', name: 'Somalie', shortName: 'SOM', iso2: 'so', aliases: ['somalia', 'somalie'] },
  { id: 'team-soudan', name: 'Soudan', shortName: 'SDN', iso2: 'sd', aliases: ['sudan', 'soudan'] },
  { id: 'team-soudan-du-sud', name: 'Soudan du Sud', shortName: 'SSD', iso2: 'ss', aliases: ['south sudan', 'soudan du sud'] },
  { id: 'team-tanzanie', name: 'Tanzanie', shortName: 'TAN', iso2: 'tz', aliases: ['tanzania', 'tanzanie'] },
  { id: 'team-tchad', name: 'Tchad', shortName: 'CHA', iso2: 'td', aliases: ['chad', 'tchad'] },
  { id: 'team-zimbabwe', name: 'Zimbabwe', shortName: 'ZIM', iso2: 'zw', aliases: ['zimbabwe'] },
];

export const makeAfricanFlagUrl = (iso2: string): string =>
  `https://flagcdn.com/w160/${iso2.toLowerCase()}.png`;

export const makeAfricanFlagFallbackUrl = (iso2: string): string =>
  `https://flagsapi.com/${iso2.toUpperCase()}/flat/64.png`;

export const AFRICAN_COUNTRIES: AfricanCountryEntry[] = AFRICAN_COUNTRY_SEEDS.map((c) => ({
  ...c,
  logo: makeAfricanFlagUrl(c.iso2),
  fallbackLogo: makeAfricanFlagFallbackUrl(c.iso2),
}));

export function normalizeAfricanCountryKey(value: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const COUNTRY_LOOKUP = new Map<string, AfricanCountryEntry>();
const ISO2_LOOKUP = new Map<string, AfricanCountryEntry>();

for (const entry of AFRICAN_COUNTRIES) {
  ISO2_LOOKUP.set(entry.iso2.toLowerCase(), entry);
  COUNTRY_LOOKUP.set(entry.id.toLowerCase(), entry);
  COUNTRY_LOOKUP.set(normalizeAfricanCountryKey(entry.name), entry);
  for (const alias of entry.aliases) {
    COUNTRY_LOOKUP.set(normalizeAfricanCountryKey(alias), entry);
  }
}

/**
 * Retourne l'entrée officielle d'un pays africain à partir de son nom, alias français/anglais ou ID.
 */
export function findAfricanCountry(idOrName?: string): AfricanCountryEntry | undefined {
  if (!idOrName) return undefined;
  const rawLower = idOrName.trim().toLowerCase();
  const direct = COUNTRY_LOOKUP.get(rawLower);
  if (direct) return direct;

  const norm = normalizeAfricanCountryKey(idOrName);
  if (!norm) return undefined;
  return COUNTRY_LOOKUP.get(norm);
}

/**
 * Résout l'URL du drapeau d'un pays africain ou renvoie null si la chaîne ne correspond pas.
 */
export function resolveAfricanCountryLogo(idOrName?: string): string | null {
  return findAfricanCountry(idOrName)?.logo || null;
}

/**
 * Retourne le lien CDN secondaire pour un pays africain (ou depuis une URL flagcdn.com).
 */
export function resolveAfricanCountryFallbackLogo(nameOrUrl?: string): string | null {
  if (!nameOrUrl) return null;
  const matchByName = findAfricanCountry(nameOrUrl);
  if (matchByName) return matchByName.fallbackLogo;

  const flagcdnMatch = nameOrUrl.match(/flagcdn\.com\/w\d+\/([a-z]{2})\.png/i);
  if (flagcdnMatch) {
    return ISO2_LOOKUP.get(flagcdnMatch[1].toLowerCase())?.fallbackLogo || null;
  }
  return null;
}

/**
 * Vérifie si un nom de pays correspond à un pays africain (ou au continent africain).
 */
export function isAfricanCountryName(countryName?: string): boolean {
  if (!countryName) return false;
  const norm = normalizeAfricanCountryKey(countryName);
  if (norm === 'afrique' || norm === 'africa' || norm === 'caf') return true;
  return Boolean(COUNTRY_LOOKUP.get(norm));
}
