export const FONTS = {
  brush: 'PermanentMarker_400Regular',
  regular: 'RobotoCondensed_400Regular',
  bold: 'RobotoCondensed_700Bold',
} as const;

export const COLORS = {
  app: '#0a0f16',
  teal: '#1d5155',
  tealTop: '#245c60',
  tealBottom: '#19464a',
  rim: '#c7d1d2',
  gridLine: 'rgba(150, 214, 240, 0.85)',
  gold: '#ffd54a',
  loseText: '#ff8f86',
  error: '#ff9a92',
  logo: '#e5282c',
  logoOutline: '#2b0406',
  logoLight: '#ff8f7f',
  logoBrush: '#8c1014',
  logoBrushLight: '#d9463f',
  white: '#ffffff',
  topbar: '#ffffff',
  topbarIcon: '#6c8796',
  watermark: 'rgba(255, 255, 255, 0.24)',
} as const;

/** Dégradés réutilisés (couleurs + positions pour expo-linear-gradient). */
export const GRADIENTS = {
  silver: { colors: ['#f3f5f6', '#a3aaaf', '#6f777c', '#d4d9dc'], locations: [0, 0.48, 0.52, 1] },
  silverH: { colors: ['#a6aaad', '#d9dcde', '#a6aaad'], locations: [0, 0.5, 1] },
  red: { colors: ['#e2655f', '#c33e39', '#a82a27'], locations: [0, 0.5, 1] },
  green: { colors: ['#46a64e', '#2d7d33', '#1f5f26'], locations: [0, 0.55, 1] },
  teal: { colors: ['#26595d', '#1a4448'], locations: [0, 1] },
  banner: { colors: ['#245c60', '#19464a'], locations: [0, 1] },
  gold: { colors: ['#f7c845', '#dc9d00'], locations: [0, 1] },
  water: { colors: ['#1190c4', '#0b78ad', '#0a6b9d'], locations: [0, 0.55, 1] },
  /** Ciel sombre en haut, fumée grise au milieu, incendie en bas. */
  scene: {
    colors: ['#121a24', '#2c3239', '#5e5d5f', '#766964', '#9c5a3e', '#4a3c38'],
    locations: [0, 0.16, 0.4, 0.62, 0.82, 1],
  },
} as const;
