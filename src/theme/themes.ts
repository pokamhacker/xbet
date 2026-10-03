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
  headerBackground?: string;
  dividerBorder?: string;
  notchBg?: string;
  modalBackground?: string;
}

export type ThemeName = '1xbet' | '1xbet-dark' | 'melbet' | 'melbet-light' | 'paripesa';

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
  accentGreen?: string;

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
    primary: '#488DD2',
    primaryText: '#FFFFFF',
    background: '#EEF2F6',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#18273E',
    textSecondary: '#7E95AC',
    accentGreen: '#16A34A',
    accentRed: '#E53935',
    depositButtonBg: '#48B254',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#E8F1FD',
    duplicateButtonText: '#2563EB',
    filterPillBg: '#ECEFF4',
    filterPillText: '#475569',
    filterChipBg: '#ECEFF4',
    filterChipText: '#475569',
    filterIconColor: '#3A86FF',
    bottomBarBg: '#FFFFFF',
    bottomBarActive: '#235795',
    bottomBarInactive: '#7E95AC',
  },

  background: '#EEF2F6',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  headerBackground: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#F1F5F9',

  primary: '#488DD2',
  primaryAccent: '#488DD2',
  primarySoft: '#D8E5F6',
  activeIcon: '#488DD2',

  textPrimary: '#18273E',
  textSecondary: '#7E95AC',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#48B254',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#E8F1FD',
    text: '#2563EB',
  },
  cashoutButton: {
    bg: '#1E4BB5',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#ECEFF4',
    text: '#475569',
  },
  filterChipBg: '#ECEFF4',
  filterChipText: '#475569',
  filterIconColor: '#3A86FF',

  bottomBar: {
    barBg: '#FFFFFF',
    barBorder: '#E2E8F0',
    inactive: '#7E95AC',
    active: '#2563EB',
    centerBg: '#2563EB',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#16A34A',
    accepte: '#2563EB',
    perdu: '#E53935',
    gagne: '#16A34A',
  },

  // Compatibility aliases
  key: '1xbet',
  tagline: 'Leader Mondial des Paris Sportifs',
  barBg: '#FFFFFF',
  barBorder: '#E2E8F0',
  inactive: '#7E95AC',
  active: '#2563EB',
  centerBg: '#2563EB',
  centerTint: '#FFFFFF',
  dotColor: '#2563EB',
  badgeBg: '#D8E5F6',
  accentColor: '#2563EB',
};

export const xbetDarkTheme: AppTheme = {
  name: '1xbet-dark',
  displayName: '1xBet Dark',
  isDark: true,

  colors: {
    primary: '#3A86FF',
    primaryText: '#FFFFFF',
    background: '#18222D',
    cardBackground: '#212D3B',
    cardBorder: '#2C3A4B',
    textPrimary: '#FFFFFF',
    textSecondary: '#8B9DAE',
    accentGreen: '#28A745',
    accentRed: '#EF4444',
    depositButtonBg: '#28A745',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#243242',
    duplicateButtonText: '#3A86FF',
    filterPillBg: '#212D3B',
    filterPillText: '#FFFFFF',
    filterChipBg: '#212D3B',
    filterChipText: '#FFFFFF',
    filterIconColor: '#3A86FF',
    bottomBarBg: '#1C2836',
    bottomBarActive: '#3A86FF',
    bottomBarInactive: '#8B9DAE',
    accentBlue: '#3A86FF',
    headerBackground: '#1C2836',
    dividerBorder: '#2C3A4B',
    notchBg: '#18222D',
    modalBackground: '#243242',
  },

  background: '#18222D',
  cardBackground: '#212D3B',
  surface: '#212D3B',
  headerBackground: '#1C2836',
  border: '#2C3A4B',
  divider: '#2C3A4B',
  dividerBorder: '#2C3A4B',
  notchBg: '#18222D',
  modalBackground: '#243242',
  bottomBarBg: '#1C2836',

  primary: '#3A86FF',
  primaryAccent: '#3A86FF',
  primarySoft: '#243242',
  activeIcon: '#3A86FF',
  accentBlue: '#3A86FF',
  accentGreen: '#28A745',

  textPrimary: '#FFFFFF',
  textSecondary: '#8B9DAE',
  textMuted: '#627385',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#28A745',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#243242',
    text: '#3A86FF',
  },
  cashoutButton: {
    bg: '#3A86FF',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#212D3B',
    text: '#FFFFFF',
  },
  filterChipBg: '#212D3B',
  filterChipText: '#FFFFFF',
  filterIconColor: '#3A86FF',

  bottomBar: {
    barBg: '#1C2836',
    barBorder: '#2C3A4B',
    inactive: '#8B9DAE',
    active: '#3A86FF',
    centerBg: '#3A86FF',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#28A745',
    accepte: '#3A86FF',
    perdu: '#EF4444',
    gagne: '#28A745',
  },

  // Compatibility aliases
  key: '1xbet-dark',
  tagline: 'Leader Mondial — Mode Sombre',
  barBg: '#1C2836',
  barBorder: '#2C3A4B',
  inactive: '#8B9DAE',
  active: '#3A86FF',
  centerBg: '#3A86FF',
  centerTint: '#FFFFFF',
  dotColor: '#3A86FF',
  badgeBg: '#243242',
  accentColor: '#3A86FF',
};

export const melbetTheme: AppTheme = {
  name: 'melbet',
  displayName: 'Melbet Dark',
  isDark: true,

  colors: {
    primary: '#E58B05',            // Jaune orangé Melbet officiel
    primaryText: '#FFFFFF',
    background: '#222A30',         // Fond sombre officiel Melbet
    cardBackground: '#2C353D',     // Teinte légèrement contrastée pour les cartes/blocs
    cardBorder: '#38434D',         // Bordures subtiles
    textPrimary: '#FFFFFF',
    textSecondary: '#7C8B99',
    accentGreen: '#22C55E',
    accentRed: '#EF4444',
    depositButtonBg: '#E58B05',
    depositButtonText: '#00000',
    duplicateButtonBg: '#E58B05',
    duplicateButtonText: '#FFFF',
    filterPillBg: '#2C353D',
    filterPillText: '#FFFFFF',
    filterChipBg: '#2C353D',
    filterChipText: '#FFFFFF',
    filterIconColor: '#E58B05',
    bottomBarBg: '#222A30',
    bottomBarActive: '#E58B05',
    bottomBarInactive: '#7C8B99',
  },

  // Surfaces & Backgrounds
  background: '#222A30',
  cardBackground: '#2C353D',
  surface: '#222A30',
  headerBackground: '#2C353D',
  border: '#38434D',
  divider: '#38434D',

  // Core Brand Colors
  primary: '#E58B05',
  primaryAccent: '#E58B05',
  primarySoft: '#3E372B',
  activeIcon: '#E58B05',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#7C8B99',
  textMuted: '#627180',
  textWhite: '#FFFFFF',

  // Buttons
  depositButton: {
    bg: '#E58B05',
    text: '#000000',
  },
  duplicateButton: {
    bg: '#E58B05',
    text: '#FFFF',
  },
  cashoutButton: {
    bg: '#E58B05',
    text: '#000000',
  },

  filterPill: {
    bg: '#2C353D',
    text: '#FFFFFF',
  },
  filterChipBg: '#2C353D',
  filterChipText: '#FFFFFF',
  filterIconColor: '#E58B05',

  bottomBar: {
    barBg: '#222A30',
    barBorder: '#2C353D',
    inactive: '#7C8B99',
    active: '#E58B05',
    centerBg: '#E58B05',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#22C55E',
    accepte: '#E58B05',
    perdu: '#EF4444',
    gagne: '#22C55E',
  },

  // Compatibility aliases
  key: 'melbet',
  tagline: 'Bookmaker Hautes Cotes & Cyber',
  barBg: '#222A30',
  barBorder: '#2C353D',
  inactive: '#7C8B99',
  active: '#E58B05',
  centerBg: '#E58B05',
  centerTint: '#FFFFFF',
  dotColor: '#E58B05',
  badgeBg: '#EF4444',
  accentColor: '#E58B05',
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
    bg: '#22C55E',
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
    centerTint: '#00325E',
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
  centerTint: '#00325E',
  dotColor: '#E7B12C',
  badgeBg: '#FEF3C7',
  accentColor: '#E7B12C',
};

export const paripesaTheme: AppTheme = {
  name: 'paripesa',
  displayName: 'Paripesa',
  isDark: false,

  colors: {
    primary: '#DC2626',
    primaryText: '#FFFFFF',
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    cardBorder: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    accentGreen: '#16A34A',
    accentRed: '#DC2626',
    depositButtonBg: '#16A34A',
    depositButtonText: '#FFFFFF',
    duplicateButtonBg: '#FEE2E2',
    duplicateButtonText: '#DC2626',
    filterPillBg: '#F1F5F9',
    filterPillText: '#0F172A',
    filterChipBg: '#F1F5F9',
    filterChipText: '#0F172A',
    filterIconColor: '#DC2626',
    bottomBarBg: '#FFFFFF',
    bottomBarActive: '#DC2626',
    bottomBarInactive: '#64748B',
  },

  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  headerBackground: '#FFFFFF',
  border: '#E2E8F0',
  divider: '#F1F5F9',

  primary: '#DC2626',
  primaryAccent: '#EF4444',
  primarySoft: '#FEE2E2',
  activeIcon: '#DC2626',

  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  depositButton: {
    bg: '#16A34A',
    text: '#FFFFFF',
  },
  duplicateButton: {
    bg: '#FEE2E2',
    text: '#DC2626',
  },
  cashoutButton: {
    bg: '#DC2626',
    text: '#FFFFFF',
  },

  filterPill: {
    bg: '#F1F5F9',
    text: '#0F172A',
  },
  filterChipBg: '#F1F5F9',
  filterChipText: '#0F172A',
  filterIconColor: '#DC2626',

  bottomBar: {
    barBg: '#FFFFFF',
    barBorder: '#E2E8F0',
    inactive: '#64748B',
    active: '#DC2626',
    centerBg: '#DC2626',
    centerTint: '#FFFFFF',
  },

  status: {
    paye: '#16A34A',
    accepte: '#DC2626',
    perdu: '#DC2626',
    gagne: '#16A34A',
  },

  // Compatibility aliases
  key: 'paripesa',
  tagline: 'Paris Sportifs & Cashout Immédiat',
  barBg: '#FFFFFF',
  barBorder: '#E2E8F0',
  inactive: '#64748B',
  active: '#DC2626',
  centerBg: '#DC2626',
  centerTint: '#FFFFFF',
  dotColor: '#DC2626',
  badgeBg: '#FEE2E2',
  accentColor: '#DC2626',
};

export const themes: Record<ThemeName, AppTheme> = {
  '1xbet': xbetTheme,
  '1xbet-dark': xbetDarkTheme,
  melbet: melbetTheme,
  'melbet-light': melbetLightTheme,
  paripesa: paripesaTheme,
};

export const oneXBetDarkThemeAppTheme = xbetDarkTheme;