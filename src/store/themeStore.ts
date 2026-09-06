import { create } from 'zustand';

export type BrandKey = '1xbet' | 'melbet' | 'paripesa';

export interface BrandTheme {
  key: BrandKey;
  name: string;
  tagline: string;
  primary: string;
  primaryAccent: string;
  barBg: string;
  barBorder: string;
  inactive: string;
  active: string;
  centerBg: string;
  centerTint: string;
  dotColor: string;
  surface: string;
  background: string;
  textPrimary: string;
  isDark: boolean;
  badgeBg: string;
  accentColor: string;
}

export const BRAND_THEMES: Record<BrandKey, BrandTheme> = {
  '1xbet': {
    key: '1xbet',
    name: '1xBet',
    tagline: 'Leader Mondial des Paris Sportifs',
    primary: '#1E3AEB',
    primaryAccent: '#2563EB',
    barBg: '#EEF2F6',
    barBorder: '#DDE3EA',
    inactive: '#5B6E8C',
    active: '#1E3AEB',
    centerBg: '#1E3AEB',
    centerTint: '#FFFFFF',
    dotColor: '#1E3AEB',
    surface: '#FFFFFF',
    background: '#F1F5F9',
    textPrimary: '#0F172A',
    isDark: false,
    badgeBg: '#DBEAFE',
    accentColor: '#1E3AEB',
  },
  melbet: {
    key: 'melbet',
    name: 'Melbet',
    tagline: 'Bookmaker Hautes Cotes & Cyber',
    primary: '#F59E0B',
    primaryAccent: '#FBBF24',
    barBg: '#181A20',
    barBorder: '#2A2E39',
    inactive: '#717684',
    active: '#F59E0B',
    centerBg: '#F59E0B',
    centerTint: '#181A20',
    dotColor: '#F59E0B',
    surface: '#1E222D',
    background: '#121318',
    textPrimary: '#F8FAFC',
    isDark: true,
    badgeBg: '#FEF3C7',
    accentColor: '#F59E0B',
  },
  paripesa: {
    key: 'paripesa',
    name: 'Paripesa',
    tagline: 'Paris Sportifs & Cashout Immédiat',
    primary: '#DC2626',
    primaryAccent: '#EF4444',
    barBg: '#FFFFFF',
    barBorder: '#E2E8F0',
    inactive: '#64748B',
    active: '#DC2626',
    centerBg: '#DC2626',
    centerTint: '#FFFFFF',
    dotColor: '#DC2626',
    surface: '#FFFFFF',
    background: '#F8FAFC',
    textPrimary: '#0F172A',
    isDark: false,
    badgeBg: '#FEE2E2',
    accentColor: '#DC2626',
  },
};

interface ThemeState {
  currentBrand: BrandKey;
  theme: BrandTheme;
  isThemeModalVisible: boolean;
  setBrand: (brand: BrandKey) => void;
  toggleBrand: () => void;
  setThemeModalVisible: (visible: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentBrand: '1xbet',
  theme: BRAND_THEMES['1xbet'],
  isThemeModalVisible: false,

  setBrand: (brand: BrandKey) => {
    const selectedTheme = BRAND_THEMES[brand] || BRAND_THEMES['1xbet'];
    set({
      currentBrand: brand,
      theme: selectedTheme,
    });
  },

  toggleBrand: () => {
    const { currentBrand } = get();
    const sequence: BrandKey[] = ['1xbet', 'melbet', 'paripesa'];
    const nextIndex = (sequence.indexOf(currentBrand) + 1) % sequence.length;
    const nextBrand = sequence[nextIndex];
    set({
      currentBrand: nextBrand,
      theme: BRAND_THEMES[nextBrand],
    });
  },

  setThemeModalVisible: (visible: boolean) => {
    set({ isThemeModalVisible: visible });
  },
}));
