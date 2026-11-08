import { Platform } from 'react-native';

export const Colors = {
  // Brand Primary (1xBet reference officiel)
  primary: '#243DB5',
  primaryAccent: '#243DB5',
  primaryHover: '#1D329A',
  primarySoft: '#E0E7FF',
  primaryLight: '#EEF2FF',

  // Status & Wins
  success: '#16A34A',
  successAccent: '#22C55E',
  successSoft: '#DCFCE7',

  // Status & Losses / Alerts
  danger: '#EF4444',
  dangerDark: '#DC2626',
  dangerSoft: '#FEE2E2',

  // Live & Highlights
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  liveRed: '#EF4444',

  // Surfaces & Backgrounds
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  divider: '#F1F5F9',
  border: '#E5E7EB',
  borderDark: '#CBD5E1',

  // Typography
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Gaming Special
  gold: '#F59E0B',
  purpleCrash: '#8B5CF6',
  darkOverlay: 'rgba(0, 0, 0, 0.45)',
};

// Palettes sombres extraites des vidéos de référence (1xBet, Melbet, PariPesa)
export const DarkColors = {
  oneXBet: {
    primary: '#5190D1',
    primaryAccent: '#5190D1',
    primaryHover: '#4385CA',
    primarySoft: '#1E2838',
    primaryLight: '#324460',
    success: '#49BE5E',
    successAccent: '#49BE5E',
    successSoft: 'rgba(73, 190, 94, 0.14)',
    danger: '#F1202B',
    dangerDark: '#D31A42',
    dangerSoft: 'rgba(241, 32, 43, 0.14)',
    warning: '#FFA827',
    warningSoft: 'rgba(255, 168, 39, 0.14)',
    liveRed: '#F1202B',
    background: '#1C293A',
    surface: '#263547',
    surfaceSecondary: '#1E2838',
    divider: '#2C3A4B',
    border: '#2C3A4B',
    borderDark: '#1E2838',
    textPrimary: '#FFFFFF',
    textSecondary: '#818B9B',
    textMuted: '#818B9B',
    textSubtle: '#5C6B7D',
    textWhite: '#FFFFFF',
    gold: '#FFA827',
    purpleCrash: '#8B5CF6',
    darkOverlay: 'rgba(0, 0, 0, 0.65)',
  },
  melbet: {
    primary: '#B9711A',
    primaryAccent: '#B9711A',
    primaryHover: '#A56416',
    primarySoft: '#24292F',
    primaryLight: '#3D3125',
    success: '#47A072',
    successAccent: '#47A072',
    successSoft: 'rgba(71, 160, 114, 0.14)',
    danger: '#D82F3F',
    dangerDark: '#B80F1F',
    dangerSoft: 'rgba(216, 47, 63, 0.14)',
    warning: '#B9711A',
    warningSoft: 'rgba(185, 113, 26, 0.14)',
    liveRed: '#D82F3F',
    background: '#24292F',
    surface: '#30353B',
    surfaceSecondary: '#24292F',
    divider: '#38434D',
    border: '#38434D',
    borderDark: '#24292F',
    textPrimary: '#FFFFFF',
    textSecondary: '#878C92',
    textMuted: '#777C82',
    textSubtle: '#5D6268',
    textWhite: '#FFFFFF',
    gold: '#B9711A',
    purpleCrash: '#8B5CF6',
    darkOverlay: 'rgba(0, 0, 0, 0.65)',
  },
  paripesa: {
    primary: '#3E4AEB',
    primaryAccent: '#3E4AEB',
    primaryHover: '#3540D4',
    primarySoft: '#1B1E25',
    primaryLight: '#3E424F',
    success: '#47A072',
    successAccent: '#47A072',
    successSoft: 'rgba(71, 160, 114, 0.14)',
    danger: '#F9173D',
    dangerDark: '#C12032',
    dangerSoft: 'rgba(249, 23, 61, 0.14)',
    warning: '#F59E0B',
    warningSoft: 'rgba(245, 158, 11, 0.14)',
    liveRed: '#F9173D',
    background: '#1B1E25',
    surface: '#242730',
    surfaceSecondary: '#1B1E25',
    divider: '#2E313D',
    border: '#2E313D',
    borderDark: '#1B1E25',
    textPrimary: '#FFFFFF',
    textSecondary: '#83868F',
    textMuted: '#767982',
    textSubtle: '#60636E',
    textWhite: '#FFFFFF',
    gold: '#F59E0B',
    purpleCrash: '#8B5CF6',
    darkOverlay: 'rgba(0, 0, 0, 0.65)',
  },
};

export function getThemeColors(brand: '1xbet' | 'melbet' | 'paripesa' = '1xbet', isDark: boolean = false) {
  if (!isDark) return Colors;
  if (brand === 'melbet') return DarkColors.melbet;
  if (brand === 'paripesa') return DarkColors.paripesa;
  return DarkColors.oneXBet;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Typography = {
  fontFamily: Platform.select({
    ios: 'Roboto',
    android: 'Roboto',
    default: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  }),
  fontHeader: '700' as const,
  fontBold: '700' as const,
  fontSemiBold: '600' as const,
  fontMedium: '500' as const,
  fontRegular: '400' as const,
};

export const DesignTokens = {
  fontFamilyPrimary: Typography.fontFamily,

  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 22,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightBold: '700' as const,

  colorPrimary: Colors.primary,
  colorTextPrimary: Colors.textPrimary,
  colorTextSecondary: Colors.textSecondary,
  colorBackground: Colors.background,
  colorSurface: Colors.surface,
  colorBorder: Colors.border,
};

export const TicketTheme = {
  notchSize: 18,
  notchOffset: -9,
  notchColor: '#F5F6FA',
  dashedBorderColor: '#E5E7EB',
};

export function getTicketTheme(brand: '1xbet' | 'melbet' | 'paripesa' = '1xbet', isDark: boolean = false) {
  if (!isDark) return TicketTheme;
  if (brand === 'melbet') {
    return {
      ...TicketTheme,
      notchColor: '#24292F',
      dashedBorderColor: '#38434D',
    };
  }
  if (brand === 'paripesa') {
    return {
      ...TicketTheme,
      notchColor: '#1B1E25',
      dashedBorderColor: '#2E313D',
    };
  }
  return {
    ...TicketTheme,
    notchColor: '#1C293A',
    dashedBorderColor: '#2C3A4B',
  };
}
