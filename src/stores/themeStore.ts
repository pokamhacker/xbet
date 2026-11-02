import { Platform } from 'react-native';
import { create } from 'zustand';
import {
  AppTheme,
  ThemeName,
  BrandChoice,
  ModeChoice,
  DispositionType,
  SaveModalStyleType,
  xbetTheme,
  getAppTheme,
} from '../theme/themes';

export type BrandKey = BrandChoice | ThemeName;

export type DeviceInterfaceType = 'auto' | 'iphone' | 'android';

export const isIPhoneModeActive = (deviceInterface?: DeviceInterfaceType): boolean => {
  if (deviceInterface === 'iphone') return true;
  if (deviceInterface === 'android') return false;
  return Platform.OS === 'ios' || Platform.OS === 'web';
};

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

  // Contrôle global de la visibilité de la barre de navigation
  isBottomBarHidden: boolean;
  setBottomBarHidden: (hidden: boolean) => void;

  // 1. Disposition de l'interface
  disposition: DispositionType;
  setDisposition: (disposition: DispositionType) => void;

  // 2. Style de la modale de sauvegarde
  saveModalStyle: SaveModalStyleType;
  setSaveModalStyle: (style: SaveModalStyleType) => void;

  // 3. Choix de Marque (1xbet, Melbet, WinWin, BetWinner)
  brandChoice: BrandChoice;
  setBrandChoice: (brand: BrandChoice) => void;

    deviceInterface: DeviceInterfaceType;
  setDeviceInterface: (device: DeviceInterfaceType) => void;

  // 4. Choix de Mode (Clair, Sombre, Noir)
  modeChoice: ModeChoice;
  setModeChoice: (mode: ModeChoice) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: xbetTheme,
  themeName: '1xbet',
  isDark: false,
  activeBookmaker: '1xbet',
  theme: xbetTheme,
  currentBrand: '1xbet',
  isThemeModalVisible: false,
  isBottomBarHidden: false,
  setBottomBarHidden: (hidden: boolean) => set({ isBottomBarHidden: hidden }),

  disposition: 'local',
  setDisposition: (disposition: DispositionType) => set({ disposition }),

  saveModalStyle: 'local',
  setSaveModalStyle: (saveModalStyle: SaveModalStyleType) => set({ saveModalStyle }),

    deviceInterface: 'auto',
  setDeviceInterface: (deviceInterface: DeviceInterfaceType) => set({ deviceInterface }),
  brandChoice: '1xbet',
  modeChoice: 'clair',

  setBrandChoice: (brand: BrandChoice) => {
    const currentMode = get().modeChoice;
    const nextTheme = getAppTheme(brand, currentMode);
    set({
      brandChoice: brand,
      currentTheme: nextTheme,
      themeName: nextTheme.name,
      isDark: nextTheme.isDark,
      activeBookmaker: brand,
      theme: nextTheme,
      currentBrand: brand,
    });
  },

  setModeChoice: (mode: ModeChoice) => {
    const currentBrand = get().brandChoice;
    const nextTheme = getAppTheme(currentBrand, mode);
    set({
      modeChoice: mode,
      currentTheme: nextTheme,
      themeName: nextTheme.name,
      isDark: nextTheme.isDark,
      theme: nextTheme,
    });
  },

  toggleTheme: () => {
    const current = get().modeChoice;
    const nextMode: ModeChoice = current === 'clair' ? 'sombre' : current === 'sombre' ? 'noir' : 'clair';
    get().setModeChoice(nextMode);
  },

  setTheme: (name: ThemeName) => {
    let brand: BrandChoice = '1xbet';
    let mode: ModeChoice = 'clair';

    if (name.includes('melbet')) brand = 'melbet';
    else if (name.includes('winwin')) brand = 'winwin';
    else if (name.includes('betwinner')) brand = 'betwinner';
    else if (name.includes('paripesa')) brand = 'paripesa';
    else if (name.includes('megapari')) brand = 'megaparis';

    if (name.includes('black')) mode = 'noir';
    else if (name.includes('dark')) mode = 'sombre';

    const nextTheme = getAppTheme(brand, mode);
    set({
      brandChoice: brand,
      modeChoice: mode,
      currentTheme: nextTheme,
      themeName: nextTheme.name,
      isDark: nextTheme.isDark,
      activeBookmaker: brand,
      theme: nextTheme,
      currentBrand: brand,
    });
  },

  setBrand: (brand: BrandKey) => {
    let cleanBrand: BrandChoice = '1xbet';
    if (brand.includes('melbet')) cleanBrand = 'melbet';
    else if (brand.includes('winwin')) cleanBrand = 'winwin';
    else if (brand.includes('betwinner')) cleanBrand = 'betwinner';
    else if (brand.includes('paripesa')) cleanBrand = 'paripesa';
    else if (brand.includes('megapari')) cleanBrand = 'megaparis';

    get().setBrandChoice(cleanBrand);
  },

  toggleBrand: () => {
    const current = get().brandChoice;
    const brands: BrandChoice[] = ['1xbet', 'melbet', 'winwin', 'betwinner', 'paripesa', 'megaparis'];
    const idx = brands.indexOf(current);
    const nextBrand = brands[(idx + 1) % brands.length];
    get().setBrandChoice(nextBrand);
  },

  setThemeModalVisible: (visible: boolean) => {
    set({ isThemeModalVisible: visible });
  },
}));

export default useThemeStore;
