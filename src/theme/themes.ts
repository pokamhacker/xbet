export interface ThemeButton {
  bg: string;
  text: string;
  border?: string;
}

export interface BottomBarTheme {
  barBg: string;
  barBorder: string;
  inactive: string;
  active: string;
  centerBg: string;
  centerTint: string;
}

export interface FilterPillTheme {
  bg: string;
  text: string;
}

export interface ThemeColors {
  primary: string;
  primaryText: string;
  background: string;
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  accentGreen: string;
  accentRed: string;
  depositButtonBg: string;
  depositButtonText: string;
  duplicateButtonBg: string;
  duplicateButtonText: string;
  filterPillBg: string;
  filterPillText: string;
  filterChipBg?: string;
  filterChipText?: string;
  filterIconColor?: string;
  bottomBarBg: string;
  bottomBarActive: string;
  bottomBarInactive: string;
  accentBlue?: string;
  accentBlueLight?: string;
  headerBackground?: string;
  dividerBorder?: string;
  notchBg?: string;
  modalBackground?: string;
  accentStatusAccepted?: string;
  couponCardBg?: string;
  couponBannerBg?: string;
  couponCloseIcon?: string;
}

export type ThemeName =
  | '1xbet'
  | '1xbet-dark'
  | '1xbet-black'
  | 'melbet'
  | 'melbet-light'
  | 'melbet-black'
  | 'paripesa'
  | 'paripesa-dark'
  | 'paripesa-black'
  | 'winwin'
  | 'winwin-dark'
  | 'winwin-black'
  | 'betwinner'
  | 'betwinner-dark'
  | 'betwinner-black'
  | 'megaparis'
  | 'megaparis-dark'
  | 'megaparis-black'
  | 'megapari'
  | 'megapari-dark'
  | 'megapari-black';

export type BrandChoice = '1xbet' | 'melbet' | 'winwin' | 'betwinner' | 'paripesa' | 'megaparis' | 'megapari';
export type ModeChoice = 'clair' | 'sombre' | 'noir';
export type DispositionType = 'local' | 'global' | 'originale';
export type SaveModalStyleType = 'local' | 'global' | 'originale';

export interface AppTheme {
  name: ThemeName;
  displayName: string;
  isDark: boolean;

  // New structured colors object
  colors: ThemeColors;

  // Surfaces & Backgrounds
  background: string;
  cardBackground: string;
  surface: string;
  headerBackground: string;
  border: string;
  divider: string;
  dividerBorder?: string;
  notchBg?: string;
  modalBackground?: string;
  bottomBarBg?: string;

  // Core Brand Colors
  primary: string;
  primaryAccent: string;
  primarySoft: string;
  activeIcon: string;
  accentBlue?: string;
  accentBlueLight?: string;
  accentGreen?: string;
  accentStatusAccepted?: string;
  couponCardBg?: string;
  couponBannerBg?: string;
  couponCloseIcon?: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textWhite: string;

  // Buttons
  depositButton: ThemeButton;
  duplicateButton: ThemeButton;
  cashoutButton: ThemeButton;

  // Filter Pill & Chips
  filterPill?: FilterPillTheme;
  filterChipBg?: string;
  filterChipText?: string;
  filterIconColor?: string;

  // Bottom Navigation
  bottomBar: BottomBarTheme;

  // Status Colors
  status: {
    paye: string;
    accepte: string;
    perdu: string;
    gagne: string;
  };

  // Compatibility aliases for legacy BrandTheme consumers
  key: ThemeName;
  tagline: string;
  barBg: string;
  barBorder: string;
  inactive: string;
  active: string;
  centerBg: string;
  centerTint: string;
  dotColor: string;
  badgeBg: string;
  accentColor: string;
}

export const xbetTheme: AppTheme = {
  name: '1xbet',
  displayName: '1xBet',
  isDark: false,

  colors: {
    primary: '#4A84C4',
    primaryText: '#FFFFFF',
    background: '#EEF2F6',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#002B49',
    textSecondary: '#6E849B',
    accentGreen: '#4EBA6F',
    accentRed: '#E53935',
    depositButtonBg: '#48B254',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#EEF2F6',
    duplicateButtonText: '#4A84C4',
    filterPillBg: '#ECEFF4',
    filterPillText: '#475569',
    filterChipBg: '#ECEFF4',
    filterChipText: '#475569',
    filterIconColor: '#4A84C4',
    bottomBarBg: '#FFFFFF',
    bottomBarActive: '#4A84C4',
    bottomBarInactive: '#6E849B',
  },

  background: '#EEF2F6',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  headerBackground: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#E6ECF2',

  primary: '#4A84C4',
  primaryAccent: '#4A84C4',
  primarySoft: '#D8E5F6',
  activeIcon: '#4A84C4',

  textPrimary: '#002B49',
  textSecondary: '#6E849B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#48B254',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#EEF2F6',
    text: '#4A84C4',
  },
  cashoutButton: {
    bg: '#4A8AE8',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#ECEFF4',
    text: '#475569',
  },
  filterChipBg: '#ECEFF4',
  filterChipText: '#475569',
  filterIconColor: '#4A84C4',

  bottomBar: {
    barBg: '#FFFFFF',
    barBorder: '#E2E8F0',
    inactive: '#6E849B',
    active: '#4A84C4',
    centerBg: '#4A84C4',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#4EBA6F',
    accepte: '#4A84C4',
    perdu: '#E53935',
    gagne: '#4EBA6F',
  },

  // Compatibility aliases
  key: '1xbet',
  tagline: 'Leader Mondial des Paris Sportifs',
  barBg: '#FFFFFF',
  barBorder: '#E2E8F0',
  inactive: '#6E849B',
  active: '#4A84C4',
  centerBg: '#4A84C4',
  centerTint: '#FFFFFF',
  dotColor: '#4A84C4',
  badgeBg: '#D8E5F6',
  accentColor: '#4A84C4',
};

// ✅ 1XBET SOMBRE (Extrait au pixel près de la vidéo 1xBet Sombre)
export const xbetDarkTheme: AppTheme = {
  name: '1xbet-dark',
  displayName: '1xBet Dark',
  isDark: true,

  colors: {
    primary: '#5190D1',
    primaryText: '#FFFFFF',
    background: '#1C293A',
    cardBackground: '#263547',
    cardBorder: '#2C3A4B',
    textPrimary: '#FFFFFF',
    textSecondary: '#818B9B',
    accentGreen: '#49BE5E',
    accentRed: '#F1202B',
    depositButtonBg: '#49BE5E',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#324460',
    duplicateButtonText: '#5395DA',
    filterPillBg: '#1E2838',
    filterPillText: '#818B9B',
    filterChipBg: '#1E2838',
    filterChipText: '#818B9B',
    filterIconColor: '#5190D1',
    bottomBarBg: '#263547',
    bottomBarActive: '#5190D1',
    bottomBarInactive: '#818B9B',
    accentBlue: '#5190D1',
    accentBlueLight: '#1E2838',
    accentStatusAccepted: '#5190D1',
    headerBackground: '#263547',
    dividerBorder: '#2C3A4B',
    notchBg: '#1C293A',
    modalBackground: '#263547',
    couponCardBg: '#263547',
    couponBannerBg: '#1E2838',
    couponCloseIcon: '#818B9B',
  },

  background: '#1C293A',
  cardBackground: '#263547',
  surface: '#263547',
  headerBackground: '#263547',
  border: '#2C3A4B',
  divider: '#202D3E',
  dividerBorder: '#2C3A4B',
  notchBg: '#1C293A',
  modalBackground: '#263547',
  bottomBarBg: '#263547',

  primary: '#5190D1',
  primaryAccent: '#5190D1',
  primarySoft: '#1E2838',
  activeIcon: '#5190D1',
  accentBlue: '#5190D1',
  accentBlueLight: '#1E2838',
  accentGreen: '#49BE5E',
  accentStatusAccepted: '#5190D1',
  couponCardBg: '#263547',
  couponBannerBg: '#1E2838',
  couponCloseIcon: '#818B9B',

  textPrimary: '#FFFFFF',
  textSecondary: '#818B9B',
  textMuted: '#818B9B',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#49BE5E',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#324460',
    text: '#5395DA',
  },
  cashoutButton: {
    bg: '#5190D1',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#1E2838',
    text: '#818B9B',
  },
  filterChipBg: '#1E2838',
  filterChipText: '#818B9B',
  filterIconColor: '#5190D1',

  bottomBar: {
    barBg: '#263547',
    barBorder: '#2C3A4B',
    inactive: '#818B9B',
    active: '#5190D1',
    centerBg: '#5190D1',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#49BE5E',
    accepte: '#5190D1',
    perdu: '#F1202B',
    gagne: '#49BE5E',
  },

  // Compatibility aliases
  key: '1xbet-dark',
  tagline: 'Leader Mondial — Mode Sombre',
  barBg: '#263547',
  barBorder: '#2C3A4B',
  inactive: '#818B9B',
  active: '#5190D1',
  centerBg: '#5190D1',
  centerTint: '#FFFFFF',
  dotColor: '#5190D1',
  badgeBg: '#1E2838',
  accentColor: '#5190D1',
};

// ✅ MELBET SOMBRE (Extrait au pixel près de la vidéo Melbet Sombre)
export const melbetTheme: AppTheme = {
  name: 'melbet',
  displayName: 'Melbet Dark',
  isDark: true,

  colors: {
    primary: '#B9711A',            // Ambre doré Melbet exact (vidéo Melbet)
    primaryText: '#FFFFFF',
    background: '#24292F',         // Fond sombre principal Melbet (vidéo Melbet)
    cardBackground: '#30353B',     // Fond des cartes et blocs (vidéo Melbet)
    cardBorder: '#38434D',         // Bordures subtiles
    textPrimary: '#FFFFFF',
    textSecondary: '#878C92',      // Gris des labels et onglets inactifs (vidéo Melbet)
    accentGreen: '#47A072',        // Vert "Payé" / "Gain" (vidéo Melbet)
    accentRed: '#D82F3F',          // Rouge "Perdu" / "Perte" (vidéo Melbet)
    depositButtonBg: '#B9711A',    // Bouton "+ Déposer" ambre (vidéo Melbet)
    depositButtonText: '#FFFFFF',  // Texte blanc "+ Déposer" (vidéo Melbet)
    duplicateButtonBg: '#24292F',
    duplicateButtonText: '#B9711A',
    filterPillBg: '#24292F',       // Filtres "Par mois" & "Vente" encastrés (vidéo Melbet)
    filterPillText: '#878C92',
    filterChipBg: '#24292F',
    filterChipText: '#878C92',
    filterIconColor: '#B9711A',
    bottomBarBg: '#30353B',
    bottomBarActive: '#B9711A',
    bottomBarInactive: '#878C92',
    accentBlue: '#B9711A',
    accentBlueLight: '#24292F',
    accentStatusAccepted: '#B9711A',
    headerBackground: '#30353B',
    dividerBorder: '#38434D',
    notchBg: '#24292F',
    modalBackground: '#30353B',
    couponCardBg: '#30353B',
    couponBannerBg: '#24292F',
    couponCloseIcon: '#B9711A',
  },

  // Surfaces & Backgrounds
  background: '#24292F',
  cardBackground: '#30353B',
  surface: '#30353B',
  headerBackground: '#30353B',
  border: '#38434D',
  divider: '#38434D',
  dividerBorder: '#38434D',
  notchBg: '#24292F',
  modalBackground: '#30353B',
  bottomBarBg: '#30353B',

  // Core Brand Colors
  primary: '#B9711A',
  primaryAccent: '#B9711A',
  primarySoft: '#24292F',
  activeIcon: '#B9711A',
  accentBlue: '#B9711A',
  accentBlueLight: '#24292F',
  accentGreen: '#47A072',
  accentStatusAccepted: '#B9711A',
  couponCardBg: '#30353B',
  couponBannerBg: '#24292F',
  couponCloseIcon: '#B9711A',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#878C92',
  textMuted: '#777C82',
  textWhite: '#FFFFFF',

  // Buttons
  depositButton: {
    bg: '#B9711A',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#24292F',
    text: '#B9711A',
  },
  cashoutButton: {
    bg: '#B9711A',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#24292F',
    text: '#878C92',
  },
  filterChipBg: '#24292F',
  filterChipText: '#878C92',
  filterIconColor: '#B9711A',

  bottomBar: {
    barBg: '#30353B',
    barBorder: '#38434D',
    inactive: '#878C92',
    active: '#B9711A',
    centerBg: '#B9711A',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#47A072',
    accepte: '#B9711A',
    perdu: '#D82F3F',
    gagne: '#47A072',
  },

  // Compatibility aliases
  key: 'melbet',
  tagline: 'Bookmaker Hautes Cotes & Cyber',
  barBg: '#30353B',
  barBorder: '#38434D',
  inactive: '#878C92',
  active: '#B9711A',
  centerBg: '#B9711A',
  centerTint: '#FFFFFF',
  dotColor: '#B9711A',
  badgeBg: '#D82F3F',
  accentColor: '#B9711A',
};

export const melbetLightTheme: AppTheme = {
  name: 'melbet-light',
  displayName: 'Melbet Light',
  isDark: false,

  colors: {
    primary: '#E7B12C',
    primaryText: '#00325E',
    background: '#F2F4F7',
    cardBackground: '#FFFFFF',
    cardBorder: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    accentGreen: '#22C55E',
    accentRed: '#EF4444',
    depositButtonBg: '#E7B12C',
    depositButtonText: '#00325E',
    duplicateButtonBg: '#FEF3C7',
    duplicateButtonText: '#B45309',
    filterPillBg: '#F3F4F6',
    filterPillText: '#374151',
    filterChipBg: '#F3F4F6',
    filterChipText: '#374151',
    filterIconColor: '#E7B12C',
    bottomBarBg: '#FFFFFF',
    bottomBarActive: '#E7B12C',
    bottomBarInactive: '#9CA3AF',
  },

  // Surfaces & Backgrounds
  background: '#F2F4F7',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  headerBackground: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Core Brand Colors
  primary: '#E7B12C',
  primaryAccent: '#E7B12C',
  primarySoft: '#FEF3C7',
  activeIcon: '#E7B12C',

  // Typography
  textPrimary: '#00325E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Buttons
  depositButton: {
    bg: '#E7B12C',
    text: '#00325E',
  },
  duplicateButton: {
    bg: '#E7EAEF',
    text: '#E7B12C',
  },
  cashoutButton: {
    bg: '#B9711A',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#F3F4F6',
    text: '#374151',
  },
  filterChipBg: '#F3F4F6',
  filterChipText: '#374151',
  filterIconColor: '#E7B12C',

  bottomBar: {
    barBg: '#FFFFFF',
    barBorder: '#E5E7EB',
    inactive: '#9CA3AF',
    active: '#E7B12C',
    centerBg: '#E7B12C',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#22C55E',
    accepte: '#E7B12C',
    perdu: '#EF4444',
    gagne: '#22C55E',
  },

  // Compatibility aliases
  key: 'melbet-light',
  tagline: 'Melbet Officiel — Mode Lumineux',
  barBg: '#FFFFFF',
  barBorder: '#E5E7EB',
  inactive: '#9CA3AF',
  active: '#E7B12C',
  centerBg: '#E7B12C',
  centerTint: '#FFFFFF',
  dotColor: '#E7B12C',
  badgeBg: '#FEF3C7',
  accentColor: '#E7B12C',
};

export const paripesaTheme: AppTheme = {
  name: 'paripesa',
  displayName: 'PariPesa',
  isDark: false,

  colors: {
    primary: '#2D45D3',
    primaryText: '#FFFFFF',
    background: '#EEF2F6',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    accentGreen: '#22C55E',
    accentRed: '#FF3B30',
    depositButtonBg: '#22C55E',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#E8EEFB',
    duplicateButtonText: '#2D45D3',
    filterPillBg: '#E2EAF4',
    filterPillText: '#334155',
    filterChipBg: '#E2EAF4',
    filterChipText: '#334155',
    filterIconColor: '#2D45D3',
    bottomBarBg: '#FFFFFF',
    bottomBarActive: '#2D45D3',
    bottomBarInactive: '#64748B',
    accentBlue: '#2D45D3',
    headerBackground: '#FFFFFF',
    dividerBorder: '#E2E8F0',
    notchBg: '#FFFFFF',
    modalBackground: '#FFFFFF',
  },

  background: '#EEF2F6',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  headerBackground: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#E2E8F0',
  dividerBorder: '#E2E8F0',
  notchBg: '#FFFFFF',
  modalBackground: '#FFFFFF',
  bottomBarBg: '#FFFFFF',

  primary: '#2D45D3',
  primaryAccent: '#2D45D3',
  primarySoft: '#E8EEFB',
  activeIcon: '#2D45D3',
  accentBlue: '#2D45D3',
  accentGreen: '#22C55E',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#22C55E',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#E8EEFB',
    text: '#2D45D3',
  },
  cashoutButton: {
    bg: '#2D45D3',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#E2EAF4',
    text: '#334155',
  },
  filterChipBg: '#E2EAF4',
  filterChipText: '#334155',
  filterIconColor: '#2D45D3',

  bottomBar: {
    barBg: '#FFFFFF',
    barBorder: '#E2E8F0',
    inactive: '#64748B',
    active: '#2D45D3',
    centerBg: '#2D45D3',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#22C55E',
    accepte: '#2D45D3',
    perdu: '#FF3B30',
    gagne: '#22C55E',
  },

  // Compatibility aliases
  key: 'paripesa',
  tagline: 'PariPesa — Le Meilleur des Paris',
  barBg: '#FFFFFF',
  barBorder: '#E2E8F0',
  inactive: '#64748B',
  active: '#2D45D3',
  centerBg: '#2D45D3',
  centerTint: '#FFFFFF',
  dotColor: '#2D45D3',
  badgeBg: '#E8EEFB',
  accentColor: '#2D45D3',
};

export const oneXBetLightTheme: AppTheme = paripesaTheme;

// ✅ PARIPESA SOMBRE (Extrait au pixel près de la vidéo PariPesa Sombre)
export const paripesaDarkTheme: AppTheme = {
  name: 'paripesa-dark',
  displayName: 'PariPesa Sombre',
  isDark: true,

  colors: {
    primary: '#3E4AEB',
    primaryText: '#FFFFFF',
    background: '#1B1E25',
    cardBackground: '#242730',
    cardBorder: '#2E313D',
    textPrimary: '#FFFFFF',
    textSecondary: '#83868F',
    accentGreen: '#47A072',
    accentRed: '#F9173D',
    depositButtonBg: '#3E4AEB',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#3E424F',
    duplicateButtonText: '#3E4AEB',
    filterPillBg: '#1B1E25',
    filterPillText: '#83868F',
    filterChipBg: '#1B1E25',
    filterChipText: '#83868F',
    filterIconColor: '#3E4AEB',
    bottomBarBg: '#242730',
    bottomBarActive: '#3E4AEB',
    bottomBarInactive: '#83868F',
    accentBlue: '#3E4AEB',
    accentBlueLight: '#1B1E25',
    accentStatusAccepted: '#3E4AEB',
    headerBackground: '#242730',
    dividerBorder: '#2E313D',
    notchBg: '#1B1E25',
    modalBackground: '#242730',
    couponCardBg: '#242730',
    couponBannerBg: '#1B1E25',
    couponCloseIcon: '#83868F',
  },

  background: '#1B1E25',
  cardBackground: '#242730',
  surface: '#242730',
  headerBackground: '#242730',
  border: '#2E313D',
  divider: '#2E313D',
  dividerBorder: '#2E313D',
  notchBg: '#1B1E25',
  modalBackground: '#242730',
  bottomBarBg: '#242730',

  primary: '#3E4AEB',
  primaryAccent: '#3E4AEB',
  primarySoft: '#1B1E25',
  activeIcon: '#3E4AEB',
  accentBlue: '#3E4AEB',
  accentBlueLight: '#1B1E25',
  accentGreen: '#47A072',
  accentStatusAccepted: '#3E4AEB',
  couponCardBg: '#242730',
  couponBannerBg: '#1B1E25',
  couponCloseIcon: '#83868F',

  textPrimary: '#FFFFFF',
  textSecondary: '#83868F',
  textMuted: '#83868F',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#3E4AEB',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#3E424F',
    text: '#3E4AEB',
  },
  cashoutButton: {
    bg: '#3E4AEB',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#1B1E25',
    text: '#83868F',
  },
  filterChipBg: '#1B1E25',
  filterChipText: '#83868F',
  filterIconColor: '#3E4AEB',

  bottomBar: {
    barBg: '#242730',
    barBorder: '#2E313D',
    inactive: '#83868F',
    active: '#3E4AEB',
    centerBg: '#3E4AEB',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#47A072',
    accepte: '#3E4AEB',
    perdu: '#F9173D',
    gagne: '#47A072',
  },

  // Compatibility aliases
  key: 'paripesa-dark',
  tagline: 'PariPesa — Mode Sombre',
  barBg: '#242730',
  barBorder: '#2E313D',
  inactive: '#83868F',
  active: '#3E4AEB',
  centerBg: '#3E4AEB',
  centerTint: '#FFFFFF',
  dotColor: '#3E4AEB',
  badgeBg: '#1B1E25',
  accentColor: '#3E4AEB',
};

export const paripesaBlackTheme: AppTheme = {
  ...paripesaDarkTheme,
  name: 'paripesa-black',
  displayName: 'PariPesa Noir',
  background: '#000000',
  surface: '#0C0E13',
  cardBackground: '#0C0E13',
  headerBackground: '#000000',
  bottomBarBg: '#06070A',
  border: '#1B1E25',
  divider: '#1B1E25',
  colors: {
    ...paripesaDarkTheme.colors,
    background: '#000000',
    cardBackground: '#0C0E13',
    cardBorder: '#1B1E25',
    headerBackground: '#000000',
    bottomBarBg: '#06070A',
  },
  bottomBar: {
    ...paripesaDarkTheme.bottomBar,
    barBg: '#06070A',
    barBorder: '#1B1E25',
  },
};

// -----------------------------------------------------------------------------
// NOUVEAUX THÈMES : WINWIN, BETWINNER & MODES PUR NOIR (AMOLED)
// -----------------------------------------------------------------------------

export const xbetBlackTheme: AppTheme = {
  ...xbetDarkTheme,
  name: '1xbet-black',
  displayName: '1xBet Noir',
  background: '#000000',
  surface: '#0B0F14',
  cardBackground: '#0B0F14',
  headerBackground: '#000000',
  bottomBarBg: '#05070A',
  border: '#1F2937',
  divider: '#1F2937',
  colors: {
    ...xbetDarkTheme.colors,
    background: '#000000',
    cardBackground: '#0B0F14',
    cardBorder: '#1F2937',
    headerBackground: '#000000',
    bottomBarBg: '#05070A',
  },
  bottomBar: {
    ...xbetDarkTheme.bottomBar,
    barBg: '#05070A',
    barBorder: '#1F2937',
  },
};

export const melbetBlackTheme: AppTheme = {
  ...melbetTheme,
  name: 'melbet-black',
  displayName: 'Melbet Noir',
  background: '#000000',
  surface: '#0D0E12',
  cardBackground: '#0D0E12',
  headerBackground: '#000000',
  bottomBarBg: '#050508',
  border: '#232530',
  divider: '#232530',
  colors: {
    ...melbetTheme.colors,
    background: '#000000',
    cardBackground: '#0D0E12',
    cardBorder: '#232530',
    headerBackground: '#000000',
    bottomBarBg: '#050508',
  },
  bottomBar: {
    ...melbetTheme.bottomBar,
    barBg: '#050508',
    barBorder: '#232530',
  },
};

export const winwinTheme: AppTheme = {
  ...xbetTheme,
  name: 'winwin',
  displayName: 'WinWin',
  isDark: false,
  primary: '#7CBD17',
  primaryAccent: '#7CBD17',
  primarySoft: '#F0F9E6',
  activeIcon: '#7CBD17',
  accentGreen: '#7CBD17',
  accentBlue: '#7CBD17',
  accentStatusAccepted: '#7CBD17',
  dotColor: '#7CBD17',
  accentColor: '#7CBD17',
  colors: {
    ...xbetTheme.colors,
    primary: '#7CBD17',
    duplicateButtonText: '#7CBD17',
    duplicateButtonBg: '#F0F9E6',
    bottomBarActive: '#7CBD17',
    depositButtonBg: '#7CBD17',
    depositButtonText: '#FFFFFF',
    filterIconColor: '#7CBD17',
    filterChipBg: '#F0F9E6',
    filterChipText: '#1E242C',
    filterPillBg: '#F0F9E6',
    filterPillText: '#1E242C',
    accentGreen: '#7CBD17',
    accentBlue: '#7CBD17',
    accentStatusAccepted: '#7CBD17',
  },
  depositButton: {
    bg: '#7CBD17',
    text: '#FFFFFF',
  },
  cashoutButton: {
    bg: '#7CBD17',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#F0F9E6',
    text: '#7CBD17',
  },
  filterPill: {
    bg: '#F0F9E6',
    text: '#1E242C',
  },
  filterChipBg: '#F0F9E6',
  filterChipText: '#1E242C',
  filterIconColor: '#7CBD17',
  status: {
    paye: '#22C55E',
    accepte: '#7CBD17',
    perdu: '#DC2626',
    gagne: '#22C55E',
  },
  bottomBar: {
    ...xbetTheme.bottomBar,
    active: '#7CBD17',
    centerBg: '#7CBD17',
    centerTint: '#FFFFFF',
  },
  tagline: 'WinWin — Le Grand Jeu',
};

export const winwinDarkTheme: AppTheme = {
  ...xbetDarkTheme,
  name: 'winwin-dark',
  displayName: 'WinWin Sombre',
  isDark: true,
  primary: '#7CBD17',
  primaryAccent: '#7CBD17',
  primarySoft: '#1E300B',
  activeIcon: '#7CBD17',
  accentGreen: '#7CBD17',
  accentBlue: '#7CBD17',
  accentStatusAccepted: '#7CBD17',
  dotColor: '#7CBD17',
  accentColor: '#7CBD17',
  colors: {
    ...xbetDarkTheme.colors,
    primary: '#7CBD17',
    duplicateButtonText: '#7CBD17',
    duplicateButtonBg: '#1E300B',
    bottomBarActive: '#7CBD17',
    depositButtonBg: '#7CBD17',
    depositButtonText: '#FFFFFF',
    filterIconColor: '#7CBD17',
    filterChipBg: '#16220B',
    filterChipText: '#FFFFFF',
    filterPillBg: '#16220B',
    filterPillText: '#FFFFFF',
    accentGreen: '#7CBD17',
    accentBlue: '#7CBD17',
    accentStatusAccepted: '#7CBD17',
  },
  depositButton: {
    bg: '#7CBD17',
    text: '#FFFFFF',
  },
  cashoutButton: {
    bg: '#7CBD17',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#1E300B',
    text: '#7CBD17',
  },
  filterPill: {
    bg: '#16220B',
    text: '#FFFFFF',
  },
  filterChipBg: '#16220B',
  filterChipText: '#FFFFFF',
  filterIconColor: '#7CBD17',
  status: {
    paye: '#22C55E',
    accepte: '#7CBD17',
    perdu: '#DC2626',
    gagne: '#22C55E',
  },
  bottomBar: {
    ...xbetDarkTheme.bottomBar,
    active: '#7CBD17',
    centerBg: '#7CBD17',
    centerTint: '#FFFFFF',
  },
  tagline: 'WinWin — Le Grand Jeu',
};

export const winwinBlackTheme: AppTheme = {
  ...winwinDarkTheme,
  name: 'winwin-black',
  displayName: 'WinWin Noir',
  background: '#000000',
  surface: '#0A0E08',
  cardBackground: '#0A0E08',
  headerBackground: '#000000',
  bottomBarBg: '#040603',
  border: '#1A2614',
  divider: '#1A2614',
  colors: {
    ...winwinDarkTheme.colors,
    background: '#000000',
    cardBackground: '#0A0E08',
    cardBorder: '#1A2614',
    headerBackground: '#000000',
    bottomBarBg: '#040603',
  },
  depositButton: {
    bg: '#7CBD17',
    text: '#FFFFFF',
  },
  cashoutButton: {
    bg: '#7CBD17',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#142007',
    text: '#7CBD17',
  },
  status: {
    paye: '#22C55E',
    accepte: '#7CBD17',
    perdu: '#DC2626',
    gagne: '#22C55E',
  },
  bottomBar: {
    ...winwinDarkTheme.bottomBar,
    barBg: '#040603',
    barBorder: '#1A2614',
  },
};

export const betwinnerTheme: AppTheme = {
  ...xbetTheme,
  name: 'betwinner',
  displayName: 'BetWinner',
  isDark: false,
  primary: '#007348',
  primaryAccent: '#007348',
  primarySoft: '#E6F5EE',
  activeIcon: '#007348',
  colors: {
    ...xbetTheme.colors,
    primary: '#007348',
    duplicateButtonText: '#007348',
    duplicateButtonBg: '#E6F5EE',
    bottomBarActive: '#007348',
  },
  duplicateButton: {
    bg: '#E6F5EE',
    text: '#007348',
  },
  cashoutButton: {
    bg: '#007348',
    text: '#FFFFFF',
  },
  bottomBar: {
    ...xbetTheme.bottomBar,
    active: '#007348',
    centerBg: '#007348',
  },
};

export const betwinnerDarkTheme: AppTheme = {
  ...xbetDarkTheme,
  name: 'betwinner-dark',
  displayName: 'BetWinner Sombre',
  isDark: true,
  primary: '#008E5A',
  primaryAccent: '#008E5A',
  primarySoft: '#0B3322',
  activeIcon: '#008E5A',
  colors: {
    ...xbetDarkTheme.colors,
    primary: '#008E5A',
    duplicateButtonText: '#008E5A',
    duplicateButtonBg: '#0B3322',
    bottomBarActive: '#008E5A',
  },
  duplicateButton: {
    bg: '#0B3322',
    text: '#008E5A',
  },
  cashoutButton: {
    bg: '#008E5A',
    text: '#FFFFFF',
  },
  bottomBar: {
    ...xbetDarkTheme.bottomBar,
    active: '#008E5A',
    centerBg: '#008E5A',
  },
};

export const betwinnerBlackTheme: AppTheme = {
  ...betwinnerDarkTheme,
  name: 'betwinner-black',
  displayName: 'BetWinner Noir',
  background: '#000000',
  surface: '#060F0B',
  cardBackground: '#060F0B',
  headerBackground: '#000000',
  bottomBarBg: '#020705',
  border: '#102B1E',
  divider: '#102B1E',
  colors: {
    ...betwinnerDarkTheme.colors,
    background: '#000000',
    cardBackground: '#060F0B',
    cardBorder: '#102B1E',
    headerBackground: '#000000',
    bottomBarBg: '#020705',
  },
  bottomBar: {
    ...betwinnerDarkTheme.bottomBar,
    barBg: '#020705',
    barBorder: '#102B1E',
  },
};

export function getAppTheme(brand: BrandChoice, mode: ModeChoice): AppTheme {
  switch (brand) {
    case 'melbet':
      if (mode === 'clair') return melbetLightTheme;
      if (mode === 'sombre') return melbetTheme;
      return melbetBlackTheme;
    case 'winwin':
      if (mode === 'clair') return winwinTheme;
      if (mode === 'sombre') return winwinDarkTheme;
      return winwinBlackTheme;
    case 'betwinner':
      if (mode === 'clair') return betwinnerTheme;
      if (mode === 'sombre') return betwinnerDarkTheme;
      return betwinnerBlackTheme;
    case 'paripesa':
      if (mode === 'clair') return paripesaTheme;
      if (mode === 'sombre') return paripesaDarkTheme;
      return paripesaBlackTheme;
    case 'megaparis':
    case 'megapari':
      if (mode === 'clair') return megaparisTheme;
      if (mode === 'sombre') return megaparisDarkTheme;
      return megaparisBlackTheme;
    case '1xbet':
    default:
      if (mode === 'clair') return xbetTheme;
      if (mode === 'sombre') return xbetDarkTheme;
      return xbetBlackTheme;
  }
}

// -----------------------------------------------------------------------------
// MARQUE MEGAPARIS (MEGAPARI)
// -----------------------------------------------------------------------------
export const megaparisTheme: AppTheme = {
  name: 'megaparis',
  displayName: 'MegaPari',
  isDark: false,

  colors: {
    primary: '#D3242A',
    primaryText: '#FFFFFF',
    background: '#EEF0F4',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E6EB',
    textPrimary: '#1E242C',
    textSecondary: '#64748B',
    accentGreen: '#16A34A',
    accentRed: '#D3242A',
    depositButtonBg: '#D3242A',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#FDECEE',
    duplicateButtonText: '#D3242A',
    filterPillBg: '#FFFFFF',
    filterPillText: '#1E242C',
    filterChipBg: '#FFFFFF',
    filterChipText: '#1E242C',
    filterIconColor: '#D3242A',
    bottomBarBg: '#FFFFFF',
    bottomBarActive: '#D3242A',
    bottomBarInactive: '#8A96A3',
    headerBackground: '#FFFFFF',
    dividerBorder: '#E2E6EB',
    notchBg: '#EEF0F4',
    modalBackground: '#FFFFFF',
    accentBlue: '#D3242A',
    accentBlueLight: '#FDECEE',
    accentStatusAccepted: '#D3242A',
  },

  background: '#EEF0F4',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  headerBackground: '#FFFFFF',
  border: '#E2E6EB',
  divider: '#EEF0F4',
  dividerBorder: '#E2E6EB',
  notchBg: '#EEF0F4',
  modalBackground: '#FFFFFF',
  bottomBarBg: '#FFFFFF',

  primary: '#D3242A',
  primaryAccent: '#D3242A',
  primarySoft: '#FDECEE',
  activeIcon: '#D3242A',
  accentBlue: '#D3242A',
  accentBlueLight: '#FDECEE',
  accentGreen: '#16A34A',
  accentStatusAccepted: '#D3242A',

  textPrimary: '#1E242C',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#D3242A',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#FDECEE',
    text: '#D3242A',
  },
  cashoutButton: {
    bg: '#D3242A',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#FFFFFF',
    text: '#1E242C',
  },
  filterChipBg: '#FFFFFF',
  filterChipText: '#1E242C',
  filterIconColor: '#D3242A',

  bottomBar: {
    barBg: '#FFFFFF',
    barBorder: '#E2E6EB',
    inactive: '#8A96A3',
    active: '#D3242A',
    centerBg: '#D3242A',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#16A34A',
    accepte: '#D3242A',
    perdu: '#D3242A',
    gagne: '#16A34A',
  },

  key: 'megaparis',
  tagline: 'MegaPari — Le Grand Jeu',
  barBg: '#FFFFFF',
  barBorder: '#E2E6EB',
  inactive: '#8A96A3',
  active: '#D3242A',
  centerBg: '#D3242A',
  centerTint: '#FFFFFF',
  dotColor: '#D3242A',
  badgeBg: '#FDECEE',
  accentColor: '#D3242A',
};

export const megaparisDarkTheme: AppTheme = {
  name: 'megaparis-dark',
  displayName: 'MegaPari Sombre',
  isDark: true,

  colors: {
    primary: '#D3242A',
    primaryText: '#FFFFFF',
    background: '#151B22',
    cardBackground: '#202834',
    cardBorder: '#28323E',
    textPrimary: '#FFFFFF',
    textSecondary: '#8A96A3',
    accentGreen: '#22C55E',
    accentRed: '#D3242A',
    depositButtonBg: '#D3242A',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#2B1A1E',
    duplicateButtonText: '#D3242A',
    filterPillBg: '#202834',
    filterPillText: '#FFFFFF',
    filterChipBg: '#202834',
    filterChipText: '#FFFFFF',
    filterIconColor: '#D3242A',
    bottomBarBg: '#161D26',
    bottomBarActive: '#D3242A',
    bottomBarInactive: '#8A96A3',
    headerBackground: '#161D26',
    dividerBorder: '#28323E',
    notchBg: '#151B22',
    modalBackground: '#202834',
    accentBlue: '#D3242A',
    accentBlueLight: '#2B1A1E',
    accentStatusAccepted: '#D3242A',
    couponCardBg: '#202834',
    couponBannerBg: '#161D26',
    couponCloseIcon: '#FFA827',
  },

  background: '#151B22',
  cardBackground: '#202834',
  surface: '#202834',
  headerBackground: '#161D26',
  border: '#28323E',
  divider: '#28323E',
  dividerBorder: '#28323E',
  notchBg: '#151B22',
  modalBackground: '#202834',
  bottomBarBg: '#161D26',

  primary: '#D3242A',
  primaryAccent: '#D3242A',
  primarySoft: '#2B1A1E',
  activeIcon: '#D3242A',
  accentBlue: '#D3242A',
  accentBlueLight: '#2B1A1E',
  accentGreen: '#22C55E',
  accentStatusAccepted: '#D3242A',
  couponCardBg: '#202834',
  couponBannerBg: '#161D26',
  couponCloseIcon: '#FFA827',

  textPrimary: '#FFFFFF',
  textSecondary: '#8A96A3',
  textMuted: '#8A96A3',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#D3242A',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#2B1A1E',
    text: '#D3242A',
  },
  cashoutButton: {
    bg: '#D3242A',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#202834',
    text: '#FFFFFF',
  },
  filterChipBg: '#202834',
  filterChipText: '#FFFFFF',
  filterIconColor: '#D3242A',

  bottomBar: {
    barBg: '#161D26',
    barBorder: '#28323E',
    inactive: '#8A96A3',
    active: '#D3242A',
    centerBg: '#D3242A',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#22C55E',
    accepte: '#D3242A',
    perdu: '#D3242A',
    gagne: '#22C55E',
  },

  key: 'megaparis-dark',
  tagline: 'MegaPari — Le Grand Jeu',
  barBg: '#161D26',
  barBorder: '#28323E',
  inactive: '#8A96A3',
  active: '#D3242A',
  centerBg: '#D3242A',
  centerTint: '#FFFFFF',
  dotColor: '#D3242A',
  badgeBg: '#2B1A1E',
  accentColor: '#D3242A',
};

export const megaparisBlackTheme: AppTheme = {
  ...megaparisDarkTheme,
  name: 'megaparis-black',
  displayName: 'MegaPari Noir',
  background: '#000000',
  surface: '#0B0E12',
  cardBackground: '#0B0E12',
  headerBackground: '#000000',
  bottomBarBg: '#050607',
  border: '#1A212A',
  divider: '#1A212A',
  colors: {
    ...megaparisDarkTheme.colors,
    background: '#000000',
    cardBackground: '#0B0E12',
    cardBorder: '#1A212A',
    headerBackground: '#000000',
    bottomBarBg: '#050607',
    notchBg: '#000000',
  },
  duplicateButton: {
    bg: '#251215',
    text: '#D3242A',
  },
  bottomBar: {
    ...megaparisDarkTheme.bottomBar,
    barBg: '#050607',
    barBorder: '#1A212A',
  },
};

// Aliases for transition and naming flexibility
export const melbetDarkTheme = melbetTheme;
export const megapariTheme = megaparisTheme;
export const megapariDarkTheme = megaparisDarkTheme;
export const megapariBlackTheme = megaparisBlackTheme;
export const paripesaLightTheme = paripesaTheme;

export const themes: Record<ThemeName, AppTheme> = {
  '1xbet': xbetTheme,
  '1xbet-dark': xbetDarkTheme,
  '1xbet-black': xbetBlackTheme,
  melbet: melbetTheme,
  'melbet-light': melbetLightTheme,
  'melbet-black': melbetBlackTheme,
  paripesa: paripesaTheme,
  'paripesa-dark': paripesaDarkTheme,
  'paripesa-black': paripesaBlackTheme,
  winwin: winwinTheme,
  'winwin-dark': winwinDarkTheme,
  'winwin-black': winwinBlackTheme,
  betwinner: betwinnerTheme,
  'betwinner-dark': betwinnerDarkTheme,
  'betwinner-black': betwinnerBlackTheme,
  megaparis: megaparisTheme,
  'megaparis-dark': megaparisDarkTheme,
  'megaparis-black': megaparisBlackTheme,
  megapari: megaparisTheme,
  'megapari-dark': megaparisDarkTheme,
  'megapari-black': megaparisBlackTheme,
};

export const oneXBetDarkThemeAppTheme = xbetDarkTheme;
