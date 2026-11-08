import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_BET, MIN_BET, STORAGE_KEY } from './config';

/** Préférences du jeu. Le solde n'est pas ici : c'est celui du compte (useBetStore). */
export interface Saved {
  bet: number;
  sound: boolean;
}

/** Lit la sauvegarde ; ignore toute valeur invalide. */
export async function loadSaved(): Promise<Partial<Saved>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const d = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Saved> = {};
    if (typeof d.bet === 'number' && Number.isFinite(d.bet) && d.bet >= MIN_BET) out.bet = Math.min(d.bet, MAX_BET);
    if (typeof d.sound === 'boolean') out.sound = d.sound;
    return out;
  } catch {
    return {};
  }
}

export function saveSaved(s: Saved): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s)).catch(() => {});
}
