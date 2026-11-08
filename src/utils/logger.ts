import { LogBox } from 'react-native';

/**
 * Filtre et supprime tous les logs verbeux, les alertes LogBox jaunes/rouges
 * et les avertissements parasites de React Native / Expo pour un terminal 100% propre.
 */
export function setupCleanLogging(): void {
  // 1. Désactiver toutes les boîtes d'avertissement LogBox sur mobile/web
  try {
    LogBox.ignoreAllLogs(true);
  } catch {
    // Environnements sans LogBox natif
  }

  // Motifs d'avertissements et logs à filtrer
  const IGNORED_WARNING_PATTERNS = [
    'defaultProps will be removed',
    'Support for defaultProps',
    'VirtualizedLists should never be nested',
    'Sending `onAnimatedValueUpdate`',
    'Non-serializable values were found in the navigation state',
    'Encountered two children with the same key',
    'expo-audio',
    'Audio mode',
    'EXPO_OS',
    'AsyncStorage has been extracted',
    'ViewPropTypes will be removed',
    '[AuthStore]',
    '[SocketClient]',
    '[API-Football]',
    '[sportsApi]',
    '[FootballStore]',
    '[SocketManager]',
    'Network request failed',
    'Failed to fetch',
  ];

  // 2. Intercepter et nettoyer console.warn
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    try {
      const message = args
        .map((a) => (typeof a === 'string' ? a : a?.message || JSON.stringify(a) || ''))
        .join(' ');
      if (IGNORED_WARNING_PATTERNS.some((pattern) => message.includes(pattern))) {
        return;
      }
    } catch {
      // Ignorer
    }
    originalWarn(...args);
  };

  // 3. Intercepter et nettoyer console.log pour le bruit verbeux
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    try {
      const message = args
        .map((a) => (typeof a === 'string' ? a : a?.message || JSON.stringify(a) || ''))
        .join(' ');
      if (IGNORED_WARNING_PATTERNS.some((pattern) => message.includes(pattern))) {
        return;
      }
    } catch {
      // Ignorer
    }
    originalLog(...args);
  };

  // 4. Intercepter et filtrer les erreurs réseau mineures non-fatales de console.error
  const originalError = console.error;
  console.error = (...args: any[]) => {
    try {
      const message = args
        .map((a) => (typeof a === 'string' ? a : a?.message || JSON.stringify(a) || ''))
        .join(' ');
      if (
        message.includes('defaultProps will be removed') ||
        message.includes('Support for defaultProps') ||
        message.includes('Network request failed') ||
        message.includes('Failed to fetch')
      ) {
        return;
      }
    } catch {
      // Ignorer
    }
    originalError(...args);
  };
}
