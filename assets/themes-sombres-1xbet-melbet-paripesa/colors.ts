export interface ThemeColors {
  background: string;         // Fond global de l'application (#EEF2F6 ou #1C293A / #24292F / #1B1E25)
  cardBackground: string;     // Fond des cartes tickets (#FFFFFF ou #263547 / #30353B / #242730)
  headerBackground: string;   // Arrière-plan du header (#EEF2F6 ou #263547 / #30353B / #242730)
  textPrimary: string;        // Titres, montants, cotes (#0F172A ou #FFFFFF)
  textSecondary: string;      // Numéros de coupons, dates, labels (#64748B ou #818B9B / #878C92 / #83868F)
  accentBlue: string;         // Couleur d'accent principale de la marque (#5190D1 / #B9711A / #3E4AEB)
  accentBlueLight?: string;   // Fond secondaire / boutons encastrés (#1E2838 / #24292F / #1B1E25)
  accentRed?: string;         // Rouge En Direct / Perdu (#F1202B / #D82F3F / #F9173D)
  accentGreen: string;        // Vert Gagné / Payé (#49BE5E / #47A072)
  accentStatusAccepted?: string;// Couleur pour le statut "Accepté" (#5190D1 / #B9711A / #3E4AEB)
  filterChipBg: string;       // Fond des filtres "Par mois", "Vente" (#1E2838 / #24292F / #1B1E25)
  filterChipText: string;     // Texte des boutons de filtres (#818B9B / #878C92 / #83868F)
  dividerBorder: string;      // Lignes de séparation (#2C3A4B / #38434D / #2E313D)
  bottomBarBg: string;        // Bottom Navigation Bar (#263547 / #30353B / #242730)
  notchBg?: string;           // Couleur des encoches latérales
  modalBackground?: string;   // Fond des fenêtres modales
  filterIconColor?: string;   // Icône des filtres
  couponCardBg?: string;      // Fond de carte dans la liste coupon
  couponBannerBg?: string;    // Fond sombre encastré du score et de la cote
  couponCloseIcon?: string;   // Couleur de la croix X
}

// ✅ CONSTANTE OFFICIELLE LIGHT :
export const paripesaLightTheme: ThemeColors = {
  background: '#EEF2F6',
  cardBackground: '#FFFFFF',
  headerBackground: '#EEF2F6',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  accentBlue: '#2D45D3',
  accentBlueLight: '#E7EEFE',
  accentRed: '#FF3B30',
  accentGreen: '#22C55E',
  filterChipBg: '#E2EAF4',
  filterChipText: '#334155',
  dividerBorder: '#E2E8F0',
  bottomBarBg: '#FFFFFF',
  notchBg: '#EEF2F6',
  modalBackground: '#FFFFFF',
  filterIconColor: '#2D45D3',
};

// Aliases 1xBet Light
export const oneXBetLightTheme: ThemeColors = paripesaLightTheme;
export const lightTheme: ThemeColors = paripesaLightTheme;

// ✅ 1XBET SOMBRE (Extrait au pixel près de la vidéo 1xBet Sombre)
export const oneXBetDarkTheme: ThemeColors = {
  background: '#1C293A',          // Fond principal entre les cartes (vidéo 1xBet)
  cardBackground: '#263547',      // Fond des cartes tickets & blocs (vidéo 1xBet)
  headerBackground: '#263547',    // En-tête / Navigation bar (vidéo 1xBet)
  textPrimary: '#FFFFFF',         // Titres, cotes, scores et montants (Blanc pur)
  textSecondary: '#818B9B',       // Labels (Cotes:, Mise:, Gains potentiels:, Statut:)
  accentBlue: '#5190D1',          // Bleu acier 1xBet (Bouton "Vendre", Coupon central, Onglet actif)
  accentBlueLight: '#1E2838',     // Fond des boutons secondaires / encastrés
  accentGreen: '#49BE5E',         // Vert vif ("+ Déposer", Statut "Payé" / "Gain")
  accentStatusAccepted: '#5190D1',// Bleu clair pour le statut "Accepté"
  accentRed: '#F1202B',           // Statut Perdu / Badge En direct
  filterChipBg: '#1E2838',        // Boutons filtres ("Par mois", "Vente")
  filterChipText: '#818B9B',      // Texte des filtres
  dividerBorder: '#2C3A4B',       // Lignes de séparation
  couponCardBg: '#263547',        // Fond de carte dans la liste coupon
  couponBannerBg: '#1E2838',      // Fond sombre encastré du score et de la cote
  couponCloseIcon: '#818B9B',     // Couleur de l'icône de fermeture
  bottomBarBg: '#263547',         // Bottom Navigation Bar (vidéo 1xBet)
  notchBg: '#1C293A',             // Fond des encoches
  modalBackground: '#263547',     // Modales
  filterIconColor: '#5190D1',     // Icône des filtres
};

// ✅ MELBET SOMBRE (Extrait au pixel près de la vidéo Melbet Sombre)
export const melbetDarkTheme: ThemeColors = {
  background: '#24292F',          // Fond sombre principal Melbet (vidéo Melbet)
  cardBackground: '#30353B',      // Fond des cartes et blocs (vidéo Melbet)
  headerBackground: '#30353B',    // En-tête officiel Melbet (vidéo Melbet)
  textPrimary: '#FFFFFF',         // Texte principal blanc
  textSecondary: '#878C92',       // Labels secondaires et onglets inactifs (vidéo Melbet)
  accentBlue: '#B9711A',          // Ambre doré Melbet ("+ Déposer", Coupon, Onglet actif, Icônes)
  accentBlueLight: '#24292F',     // Fond secondaire encastré
  accentGreen: '#47A072',         // Vert émeraude ("Payé", "Gain", "67 000 F")
  accentStatusAccepted: '#B9711A',// Ambre doré pour le statut "Accepté"
  accentRed: '#D82F3F',           // Rouge ("Perdu", "Perte")
  filterChipBg: '#24292F',        // Fond des filtres ("Par mois", "Vente") encastrés dans #30353B
  filterChipText: '#878C92',      // Texte des filtres
  dividerBorder: '#38434D',       // Lignes de séparation
  couponCardBg: '#30353B',        // Fond des cartes dans le coupon
  couponBannerBg: '#24292F',      // Fond encastré
  couponCloseIcon: '#B9711A',     // Croix / icône d'action Melbet
  bottomBarBg: '#30353B',         // Bottom Navigation Bar (vidéo Melbet)
  notchBg: '#24292F',             // Fond des encoches
  modalBackground: '#30353B',     // Modales
  filterIconColor: '#B9711A',     // Icône des filtres
};

// ✅ PARIPESA SOMBRE (Extrait au pixel près de la vidéo PariPesa Sombre)
export const paripesaDarkTheme: ThemeColors = {
  background: '#1B1E25',          // Fond sombre principal PariPesa (vidéo PariPesa)
  cardBackground: '#242730',      // Fond des cartes, blocs et menus (vidéo PariPesa)
  headerBackground: '#242730',    // En-tête supérieur (vidéo PariPesa)
  textPrimary: '#FFFFFF',         // Titres, cotes, soldes et scores
  textSecondary: '#83868F',       // Labels (Cotes:, Mise:, Statut:) et onglets inactifs
  accentBlue: '#3E4AEB',          // Bleu-indigo électrique PariPesa ("+ Déposer", Coupon, Onglet actif)
  accentBlueLight: '#1B1E25',     // Fond secondaire encastré (cotes, filtres)
  accentGreen: '#47A072',         // Vert ("Payé", "Gain", "301 574.75 F")
  accentStatusAccepted: '#3E4AEB',// Bleu-indigo pour le statut "Accepté"
  accentRed: '#F9173D',           // Rouge ("Perdu", badge "En direct")
  filterChipBg: '#1B1E25',        // Fond des filtres ("Par mois", "Vente") encastrés dans #242730
  filterChipText: '#83868F',      // Texte des filtres
  dividerBorder: '#2E313D',       // Lignes de séparation
  couponCardBg: '#242730',        // Fond des cartes dans le coupon
  couponBannerBg: '#1B1E25',      // Fond sombre encastré des cotes (V1 / X / V2)
  couponCloseIcon: '#83868F',     // Icône de fermeture
  bottomBarBg: '#242730',         // Bottom Navigation Bar (vidéo PariPesa)
  notchBg: '#1B1E25',             // Fond des encoches
  modalBackground: '#242730',     // Modales
  filterIconColor: '#3E4AEB',     // Icône des filtres
};

// Aliases for compatibility
export const dark1xBetTheme: ThemeColors = oneXBetDarkTheme;
export const xbetDarkTheme: ThemeColors = oneXBetDarkTheme;
export const xbetDarkThemee: ThemeColors = oneXBetDarkTheme;
export const darkTheme: ThemeColors = oneXBetDarkTheme;
