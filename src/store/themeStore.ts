import { useThemeStore, BrandKey, ThemeState, DeviceInterfaceType, isIPhoneModeActive } from '../stores/themeStore';
import {
  xbetTheme,
  xbetDarkTheme,
  melbetTheme,
  melbetLightTheme,
  paripesaTheme,
  paripesaDarkTheme,
  paripesaBlackTheme,
  winwinTheme,
  betwinnerTheme,
  megaparisTheme,
  megaparisDarkTheme,
  megaparisBlackTheme,
  megapariTheme,
  megapariDarkTheme,
  megapariBlackTheme,
  AppTheme,
  BrandChoice,
  ModeChoice,
  DispositionType,
  SaveModalStyleType,
} from '../theme/themes';

export { useThemeStore };
export { isIPhoneModeActive };
export type { BrandKey, ThemeState, DeviceInterfaceType, AppTheme, BrandChoice, ModeChoice, DispositionType, SaveModalStyleType };

export interface BrandTheme extends AppTheme {}

export const BRAND_THEMES: Record<string, AppTheme> = {
  '1xbet': xbetTheme,
  '1xbet-dark': xbetDarkTheme,
  melbet: melbetTheme,
  'melbet-light': melbetLightTheme,
  paripesa: paripesaTheme,
  'paripesa-dark': paripesaDarkTheme,
  'paripesa-black': paripesaBlackTheme,
  winwin: winwinTheme,
  betwinner: betwinnerTheme,
  megaparis: megaparisTheme,
  'megaparis-dark': megaparisDarkTheme,
  'megaparis-black': megaparisBlackTheme,
  megapari: megapariTheme,
  'megapari-dark': megapariDarkTheme,
  'megapari-black': megapariBlackTheme,
};

export { paripesaTheme };

