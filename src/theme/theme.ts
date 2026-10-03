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
