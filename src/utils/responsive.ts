import { useMemo } from 'react';
import { Dimensions, PixelRatio, useWindowDimensions, DimensionValue, ViewStyle } from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

/**
 * Résolution de référence mobile standard (ex: iPhone 11 / X / 12 mini / Galaxy S)
 */
export const BASE_WIDTH = 375;
export const BASE_HEIGHT = 812;

/**
 * Calcul dynamique des dimensions actuelles de la fenêtre
 */
export const getWindowDimensions = () => Dimensions.get('window');

/**
 * Mise à l'échelle horizontale (Largeur, paddings/margins horizontaux)
 */
export const scale = (size: number): number => {
  const { width } = getWindowDimensions();
  const shortDimension = Math.min(width, Dimensions.get('window').height);
  return (shortDimension / BASE_WIDTH) * size;
};

/**
 * Mise à l'échelle verticale (Hauteurs, espacements verticaux)
 */
export const verticalScale = (size: number): number => {
  const { height } = getWindowDimensions();
  const longDimension = Math.max(Dimensions.get('window').width, height);
  return (longDimension / BASE_HEIGHT) * size;
};

/**
 * Mise à l'échelle modérée (Idéale pour les polices, paddings, boutons et icônes)
 * factor = 0.5 par défaut : amortit le grossissement sur grand écran
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Mise à l'échelle modérée verticale
 */
export const moderateVerticalScale = (size: number, factor = 0.5): number => {
  return size + (verticalScale(size) - size) * factor;
};

/**
 * Normalisation de la taille de police avec bornes de sécurité (min/max)
 * pour éviter les textes microscopiques sur petits mobiles ou démesurés sur tablettes.
 */
export const responsiveFont = (fontSize: number, factor = 0.4): number => {
  const scaled = moderateScale(fontSize, factor);
  // Borne de sécurité : pas moins de 75% ni plus de 135% de la taille cible
  const minSize = fontSize * 0.75;
  const maxSize = fontSize * 1.35;
  const clamped = Math.min(Math.max(scaled, minSize), maxSize);
  return Math.round(PixelRatio.roundToNearestPixel(clamped));
};

/**
 * Alias de compatibilité
 */
export const normalize = (size: number): number => responsiveFont(size);
export const normalizeFont = (size: number): number => responsiveFont(size);

/**
 * Détection statique des types d'écrans (instantanée)
 */
export const getIsTablet = (): boolean => {
  const { width, height } = getWindowDimensions();
  const minDim = Math.min(width, height);
  return minDim >= 600 || width >= 768;
};

export const getIsLandscape = (): boolean => {
  const { width, height } = getWindowDimensions();
  return width > height;
};

export const isWebOrTablet = getIsTablet();
export const SCREEN_WIDTH = getWindowDimensions().width;
export const SCREEN_HEIGHT = getWindowDimensions().height;

export const SCREEN = {
  get width() {
    return getWindowDimensions().width;
  },
  get height() {
    return getWindowDimensions().height;
  },
  get isSmallDevice() {
    return Math.min(getWindowDimensions().width, getWindowDimensions().height) < 360;
  },
  get isTablet() {
    return getIsTablet();
  },
  get isLandscape() {
    return getIsLandscape();
  },
};

/**
 * HOOK REACT RESPONSIVE UNIFIÉ (`useResponsive`)
 * Se recalcule automatiquement lors des changements d'orientation, resize de fenêtre et safe areas.
 */
export interface ResponsiveContext {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isSmallDevice: boolean; // < 360px (iPhone SE 1st gen, petits Android)
  isStandardPhone: boolean; // 360px - 430px (iPhone 11, 12, 13, 14, Galaxy)
  isLargePhone: boolean; // 430px - 600px (iPhone Pro Max, Galaxy Ultra)
  isTablet: boolean; // >= 600px / 768px (iPad, Galaxy Tab)
  isDesktop: boolean; // >= 1024px (Web plein écran)
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  font: (size: number, factor?: number) => number;
  insets: EdgeInsets;
  contentContainerStyle: ViewStyle;
}

export const useResponsive = (): ResponsiveContext => {
  const { width, height } = useWindowDimensions();
  let insets: EdgeInsets;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    insets = useSafeAreaInsets();
  } catch {
    insets = { top: 0, bottom: 0, left: 0, right: 0 };
  }

  return useMemo(() => {
    const isPortrait = height >= width;
    const isLandscape = width > height;
    const minDim = Math.min(width, height);
    const maxDim = Math.max(width, height);

    const isSmallDevice = minDim < 360;
    const isStandardPhone = minDim >= 360 && minDim < 430;
    const isLargePhone = minDim >= 430 && minDim < 600;
    const isTablet = minDim >= 600 || width >= 768;
    const isDesktop = width >= 1024;

    const dynamicScale = (size: number) => {
      const base = isLandscape ? minDim : width;
      return (base / BASE_WIDTH) * size;
    };

    const dynamicVerticalScale = (size: number) => {
      const base = isLandscape ? maxDim : height;
      return (base / BASE_HEIGHT) * size;
    };

    const dynamicModerateScale = (size: number, factor = 0.5) => {
      const s = dynamicScale(size);
      return size + (s - size) * factor;
    };

    const dynamicFont = (size: number, factor = 0.35) => {
      const scaled = dynamicModerateScale(size, factor);
      const min = size * 0.8;
      const max = isTablet ? size * 1.25 : size * 1.15;
      const clamped = Math.min(Math.max(scaled, min), max);
      return Math.round(PixelRatio.roundToNearestPixel(clamped));
    };

    // Pour tablettes et écrans larges : centrer le coupon/ticket pour éviter l'étirement excessif
    const contentContainerStyle: ViewStyle = {
      maxWidth: isDesktop ? 680 : isTablet ? 580 : '100%',
      width: '100%',
      alignSelf: 'center',
    };

    return {
      width,
      height,
      isPortrait,
      isLandscape,
      isSmallDevice,
      isStandardPhone,
      isLargePhone,
      isTablet,
      isDesktop,
      scale: dynamicScale,
      verticalScale: dynamicVerticalScale,
      moderateScale: dynamicModerateScale,
      font: dynamicFont,
      insets,
      contentContainerStyle,
    };
  }, [width, height, insets]);
};

export default {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  responsiveFont,
  normalize,
  normalizeFont,
  isWebOrTablet,
  SCREEN,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  useResponsive,
};
