import { AccessibilityInfo } from 'react-native';

/** Respecte le réglage « Réduire les animations » du téléphone. */
let reduced = false;

AccessibilityInfo.isReduceMotionEnabled()
  .then((v: boolean) => {
    reduced = v;
  })
  .catch(() => {});
AccessibilityInfo.addEventListener('reduceMotionChanged', (v: boolean) => {
  reduced = v;
});

export const isReducedMotion = (): boolean => reduced;

/** Raccourcit les durées quand les animations sont réduites. */
export const dur = (ms: number): number => (reduced ? Math.min(ms, 120) : ms);

export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, dur(ms)));
