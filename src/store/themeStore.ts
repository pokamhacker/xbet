import { useThemeStore, BrandKey, ThemeState } from '../stores/themeStore';
import { xbetTheme, xbetDarkTheme, melbetTheme, melbetLightTheme, paripesaTheme, AppTheme } from '../theme/themes';

export { useThemeStore, BrandKey, ThemeState };
export type { AppTheme };

export interface BrandTheme extends AppTheme {}

export const BRAND_THEMES: Record<BrandKey, AppTheme> = {
  '1xbet': xbetTheme,
  '1xbet-dark': xbetDarkTheme,
  melbet: melbetTheme,
  'melbet-light': melbetLightTheme,
  paripesa: paripesaTheme,
};
