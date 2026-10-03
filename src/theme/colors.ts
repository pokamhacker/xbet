export interface ThemeColors {
  background: string;       // Fond principal de l'application
  cardBackground: string;   // Fond des cartes / tickets
  headerBackground: string; // Fond du header supérieur
  textPrimary: string;      // Texte principal (titres, cotes, montants)
  textSecondary: string;    // Texte secondaire (dates, numéros, labels)
  accentBlue: string;       // Bleu 1xBet (boutons, icônes actives, statuts)
  accentGreen: string;      // Vert 1xBet (boutons Dépôt, Pari)
  dividerBorder: string;    // Couleur des lignes et points de séparation
  notchBg: string;          // Couleur des encoches latérales du ticket (doit égaler background)
  modalBackground: string;  // Fond des fenêtres modales
  bottomBarBg: string;      // Fond de la barre de navigation
  filterChipBg: string;     // Fond des chips de filtres
  filterChipText: string;   // Texte des chips de filtres
  filterIconColor: string;  // Icône des chips de filtres
}

export const lightTheme: ThemeColors = {
  background: '#F1F5F9',
  cardBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  accentBlue: '#2563EB',
  accentGreen: '#22C55E',
  dividerBorder: '#CBD5E1',
  notchBg: '#F1F5F9',
  modalBackground: '#FFFFFF',
  bottomBarBg: '#FFFFFF',
  filterChipBg: '#ECEFF4',     // Fond clair très légèrement teinté bleu
  filterChipText: '#475569',   // Texte gris-bleu
  filterIconColor: '#3A86FF', // Icône bleu 1xBet
};

// 1xBet Dark Theme palette
export const oneXBetDarkTheme: ThemeColors = {
  background: '#18222D',       // Bleu très sombre / ardoise foncé
  cardBackground: '#212D3B',   // Carte bleue nuit
  headerBackground: '#1C2836', // En-tête bleu foncée
  textPrimary: '#FFFFFF',      // Texte principal blanc
  textSecondary: '#8B9DAE',    // Texte secondaire gris-bleu
  accentBlue: '#3A86FF',       // Bleu vif 1xBet
  accentGreen: '#28A745',      // Vert vif Pari / Dépôt
  dividerBorder: '#2C3A4B',    // Ligne pointillée sombre
  notchBg: '#18222D',          // Même couleur que le fond global pour l'illusion d'encoche
  modalBackground: '#243242',  // Fond de modale bleu nuit
  bottomBarBg: '#1C2836',      // Bottom Navigation sombre
  filterChipBg: '#212D3B',     // Fond carte bleu nuit
  filterChipText: '#FFFFFF',   // Texte blanc
  filterIconColor: '#3A86FF', // Icône bleu 1xBet
};

// Aliases for compatibility
export const dark1xBetTheme: ThemeColors = oneXBetDarkTheme;
export const xbetDarkTheme: ThemeColors = oneXBetDarkTheme;
export const darkTheme: ThemeColors = oneXBetDarkTheme;

