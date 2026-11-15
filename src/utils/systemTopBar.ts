import { useContext, useEffect, useId, useLayoutEffect, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { create } from 'zustand';

export type SystemBarStyle = 'light-content' | 'dark-content';

export const TOP_BAR_BG_STORAGE_KEY = 'app_top_bar_bg_v1';
export const TOP_BAR_DARK_STORAGE_KEY = 'app_top_bar_dark_v1';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface TopBarEntry {
  id: string;
  color: string;
  barStyle?: SystemBarStyle;
}

interface SystemUiState {
  entries: TopBarEntry[];
  setTopBar: (id: string, color: string, barStyle?: SystemBarStyle) => void;
  clearTopBar: (id: string) => void;
}

export const useSystemUiStore = create<SystemUiState>((set) => ({
  entries: [],
  setTopBar: (id: string, color: string, barStyle?: SystemBarStyle) =>
    set((state) => {
      const existingIndex = state.entries.findIndex((item) => item.id === id);
      if (existingIndex >= 0) {
        const existing = state.entries[existingIndex];
        if (existing.color === color && existing.barStyle === barStyle) {
          return state;
        }
        const nextEntries = [...state.entries];
        nextEntries[existingIndex] = { id, color, barStyle };
        return { entries: nextEntries };
      }
      return { entries: [...state.entries, { id, color, barStyle }] };
    }),
  clearTopBar: (id: string) =>
    set((state) => {
      if (!state.entries.some((item) => item.id === id)) {
        return state;
      }
      return { entries: state.entries.filter((item) => item.id !== id) };
    }),
}));

let lastAppliedWebColor: string | null = null;
let lastAppliedWebDark: boolean | null = null;

/**
 * Enregistre la couleur d'en-tête du thème pour le script pré-peinture HTML (PWA / Safari iOS).
 */
export function persistThemeTopBarColor(
  headerColor: string,
  isDarkHeader: boolean
): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(TOP_BAR_BG_STORAGE_KEY, headerColor);
    window.localStorage?.setItem(TOP_BAR_DARK_STORAGE_KEY, isDarkHeader ? '1' : '0');
  } catch {
    // Ignore storage errors in private browsing mode
  }
}

/**
 * Met à jour immédiatement la couche système iOS/Android/Safari/PWA :
 * - Remplace `<meta name="theme-color">` dans `<head>` pour forcer WebKit (iOS Safari) à repeindre
 *   la zone autour de la Dynamic Island et de la barre d'état.
 * - Applique la couleur sur `html`, `body` et `#root` + `colorScheme`.
 * - Met à jour `StatusBar` natif de React Native de façon impérative.
 */
export function syncWebTopSafeArea(
  activeHeaderColor?: string | null,
  isDarkHeader: boolean = false
): void {
  if (!activeHeaderColor || typeof activeHeaderColor !== 'string') return;
  const normalizedColor = activeHeaderColor.trim();
  if (!normalizedColor) return;

  const barStyle: SystemBarStyle = isDarkHeader ? 'light-content' : 'dark-content';

  if (Platform.OS !== 'web') {
    try {
      const statusBarApi = StatusBar as any;
      statusBarApi.setBarStyle?.(barStyle, true);
      if (Platform.OS === 'android') {
        statusBarApi.setTranslucent?.(true);
        statusBarApi.setBackgroundColor?.('transparent', true);
      }
    } catch {
      // Ignore native StatusBar imperative guard errors
    }
    return;
  }

  if (typeof document === 'undefined') return;

  if (
    lastAppliedWebColor === normalizedColor &&
    lastAppliedWebDark === isDarkHeader
  ) {
    return;
  }
  lastAppliedWebColor = normalizedColor;
  lastAppliedWebDark = isDarkHeader;

  document.documentElement.style.backgroundColor = normalizedColor;
  document.documentElement.style.colorScheme = isDarkHeader ? 'dark' : 'light';
  document.documentElement.style.setProperty('--app-top-safe-bg', normalizedColor);

  if (document.body) {
    document.body.style.backgroundColor = normalizedColor;
  }
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.style.backgroundColor = normalizedColor;
  }

  // Remplacement explicite de <meta name="theme-color"> pour déclencher
  // `insertedIntoAncestor` / `themeColorDidChange` dans WebKit iOS Safari 15–26.
  const head = document.head;
  if (head) {
    const existingMetas = head.querySelectorAll('meta[name="theme-color"]');
    let hasMatchingSingleMeta =
      existingMetas.length === 1 &&
      existingMetas[0].getAttribute('content') === normalizedColor;

    if (!hasMatchingSingleMeta) {
      existingMetas.forEach((node) => node.parentNode?.removeChild(node));
      const freshMeta = document.createElement('meta');
      freshMeta.setAttribute('name', 'theme-color');
      freshMeta.setAttribute('content', normalizedColor);
      head.appendChild(freshMeta);
    }

    let statusBarMeta = head.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!statusBarMeta) {
      statusBarMeta = document.createElement('meta');
      statusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      head.appendChild(statusBarMeta);
    }
    if (statusBarMeta.getAttribute('content') !== 'black-translucent') {
      statusBarMeta.setAttribute('content', 'black-translucent');
    }
  }
}

/**
 * Calcule le padding top sécurisé pour que le header s'étende jusqu'à top: 0
 * tout en plaçant le contenu sous la barre de statut / notch / Dynamic Island.
 */
export function getTopSafeInset(insetsTop?: number): number {
  if (typeof insetsTop === 'number' && insetsTop > 0) {
    return insetsTop;
  }
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  }
  return 0;
}

/**
 * Calcule le padding top des bannières de match avec ImageBackground
 * (FifaLiveMatch, MatchMarkets, MatchStatistics).
 */
export function getHeaderMatchSafePad(insetsTop?: number): number {
  if (typeof insetsTop === 'number' && insetsTop > 0) {
    return insetsTop;
  }
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 28;
  }
  return 16;
}

function areAllAncestorsFocused(nav: any): boolean {
  let cur = nav;
  while (cur) {
    if (typeof cur.isFocused === 'function' && !cur.isFocused()) {
      return false;
    }
    cur = typeof cur.getParent === 'function' ? cur.getParent() : null;
  }
  return true;
}

/**
 * Hook officiel de synchronisation temps réel de la zone système supérieure (Dynamic Island,
 * StatusBar iOS/Android, PWA, Safari theme-color) avec la couleur/image du header de l'écran actif.
 */
export function useSyncTopSafeAreaColor(
  activeHeaderColor?: string | null,
  isDarkHeader: boolean = false,
  enabled: boolean = true
): void {
  const ownerId = useId();
  const navigation = useContext(NavigationContext);
  const setTopBar = useSystemUiStore((state) => state.setTopBar);
  const clearTopBar = useSystemUiStore((state) => state.clearTopBar);

  const [isFocused, setIsFocused] = useState<boolean>(() =>
    areAllAncestorsFocused(navigation)
  );

  useIsomorphicLayoutEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') {
      setIsFocused(true);
      return;
    }

    const syncFocus = () => {
      setIsFocused(areAllAncestorsFocused(navigation));
    };
    syncFocus();

    const unsubs: Array<() => void> = [];
    let cur: any = navigation;
    while (cur && typeof cur.addListener === 'function') {
      unsubs.push(cur.addListener('focus', syncFocus));
      unsubs.push(cur.addListener('blur', syncFocus));
      cur = typeof cur.getParent === 'function' ? cur.getParent() : null;
    }

    return () => {
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {
          // ignore cleanup
        }
      });
    };
  }, [navigation]);

  const barStyle: SystemBarStyle = isDarkHeader ? 'light-content' : 'dark-content';

  useIsomorphicLayoutEffect(() => {
    if (enabled && isFocused && activeHeaderColor) {
      setTopBar(ownerId, activeHeaderColor, barStyle);
      syncWebTopSafeArea(activeHeaderColor, isDarkHeader);
    } else {
      clearTopBar(ownerId);
    }
  }, [
    enabled,
    isFocused,
    activeHeaderColor,
    isDarkHeader,
    barStyle,
    ownerId,
    setTopBar,
    clearTopBar,
  ]);

  useIsomorphicLayoutEffect(() => {
    return () => {
      clearTopBar(ownerId);
    };
  }, [ownerId, clearTopBar]);
}

/**
 * Alias rétro-compatible vers `useSyncTopSafeAreaColor`.
 */
export function useSystemTopBar(
  color?: string | null,
  barStyle?: SystemBarStyle,
  enabled: boolean = true
): void {
  useSyncTopSafeAreaColor(color, barStyle === 'light-content', enabled);
}
