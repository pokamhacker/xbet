import { create } from 'zustand';
import { AppTheme, ThemeName, xbetTheme, xbetDarkTheme, melbetTheme, melbetLightTheme, paripesaTheme } from '../theme/themes';

export type BrandKey = '1xbet' | '1xbet-dark' | 'melbet' | 'melbet-light' | 'paripesa';

export interface ThemeState {
  currentTheme: AppTheme;
  themeName: ThemeName;
  isDark: boolean;
  activeBookmaker: BrandKey;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;

  // Compatibility helpers for existing codebase components
  theme: AppTheme;
  currentBrand: BrandKey;
  isThemeModalVisible: boolean;
  setBrand: (brand: BrandKey) => void;
  toggleBrand: () => void;
  setThemeModalVisible: (visible: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: xbetTheme,
  themeName: '1xbet',
  isDark: false,
  activeBookmaker: '1xbet',
  theme: xbetTheme,
  currentBrand: '1xbet',
  isThemeModalVisible: false,

  toggleTheme: () => {
    const current = get().currentTheme.name;
    let nextTheme = xbetTheme;
    if (current === '1xbet') nextTheme = xbetDarkTheme;
    else if (current === '1xbet-dark') nextTheme = melbetTheme;
    else if (current === 'melbet') nextTheme = melbetLightTheme;
    else if (current === 'melbet-light') nextTheme = paripesaTheme;
    else nextTheme = xbetTheme;

    set({
      currentTheme: nextTheme,
      themeName: nextTheme.name,
      isDark: nextTheme.isDark,
      activeBookmaker: nextTheme.name as BrandKey,
      theme: nextTheme,
      currentBrand: nextTheme.name as BrandKey,
    });
  },

  setTheme: (name: ThemeName) => {
    let nextTheme = xbetTheme;
    if (name === '1xbet-dark') nextTheme = xbetDarkTheme;
    else if (name === 'melbet') nextTheme = melbetTheme;
    else if (name === 'melbet-light') nextTheme = melbetLightTheme;
    else if (name === 'paripesa') nextTheme = paripesaTheme;
    else nextTheme = xbetTheme;

    set({
      currentTheme: nextTheme,
      themeName: nextTheme.name,
      isDark: nextTheme.isDark,
      activeBookmaker: nextTheme.name as BrandKey,
      theme: nextTheme,
      currentBrand: nextTheme.name as BrandKey,
    });
  },

  setBrand: (brand: BrandKey) => {
    let nextTheme = xbetTheme;
    if (brand === '1xbet-dark') nextTheme = xbetDarkTheme;
    else if (brand === 'melbet') nextTheme = melbetTheme;
    else if (brand === 'melbet-light') nextTheme = melbetLightTheme;
    else if (brand === 'paripesa') nextTheme = paripesaTheme;
    else nextTheme = xbetTheme;

    set({
      currentTheme: nextTheme,
      themeName: nextTheme.name,
      isDark: nextTheme.isDark,
      activeBookmaker: brand,
      theme: nextTheme,
      currentBrand: brand,
    });
  },

  toggleBrand: () => {
    const current = get().currentTheme.name;
    let nextTheme = xbetTheme;
    if (current === '1xbet') nextTheme = xbetDarkTheme;
    else if (current === '1xbet-dark') nextTheme = melbetTheme;
    else if (current === 'melbet') nextTheme = melbetLightTheme;
    else nextTheme = xbetTheme;

    set({
      currentTheme: nextTheme,
      theme: nextTheme,
      currentBrand: nextTheme.name,
    });
  },

  setThemeModalVisible: (visible: boolean) => {
    set({ isThemeModalVisible: visible });
  },
}));

export default useThemeStore;
