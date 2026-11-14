import { useContext, useEffect, useId, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { create } from 'zustand';

export type SystemBarStyle = 'light-content' | 'dark-content';

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
    return insetsTop + 4;
  }
  if (Platform.OS === 'android') {
    return (StatusBar.currentHeight || 24) + 4;
  }
  return 16;
}

/**
 * Synchronise dynamiquement la couleur de fond système (Safari theme-color,
 * html/body/#root PWA, SafeAreaProvider) et StatusBar barStyle avec l'écran actif.
 */
export function useSystemTopBar(
  color?: string | null,
  barStyle?: SystemBarStyle,
  enabled: boolean = true
): void {
  const ownerId = useId();
  const navigation = useContext(NavigationContext);
  const setTopBar = useSystemUiStore((state) => state.setTopBar);
  const clearTopBar = useSystemUiStore((state) => state.clearTopBar);

  const [isFocused, setIsFocused] = useState<boolean>(() => {
    if (navigation && typeof navigation.isFocused === 'function') {
      return navigation.isFocused();
    }
    return true;
  });

  useEffect(() => {
    if (!navigation || typeof navigation.addListener !== 'function') {
      setIsFocused(true);
      return;
    }
    setIsFocused(navigation.isFocused());
    const unsubFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubBlur = navigation.addListener('blur', () => setIsFocused(false));
    return () => {
      unsubFocus();
      unsubBlur();
    };
  }, [navigation]);

  useEffect(() => {
    if (enabled && isFocused && color) {
      setTopBar(ownerId, color, barStyle);
    } else {
      clearTopBar(ownerId);
    }
  }, [enabled, isFocused, color, barStyle, ownerId, setTopBar, clearTopBar]);

  useEffect(() => {
    return () => {
      clearTopBar(ownerId);
    };
  }, [ownerId, clearTopBar]);
}
