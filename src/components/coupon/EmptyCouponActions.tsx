import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { useCouponStore } from '../../store/couponStore';
import { useResponsive } from '../../utils/responsive';
import { Typography } from '../../theme/theme';

// ============================================================================
// ICÔNES VECTORIELLES PIXEL-PERFECT REPRODUISANT FIDÈLEMENT LA CAPTURE 1XBET
// ============================================================================

/**
 * 1. Icône Plus (+) pour "Recharger le compte"
 */
const PlusIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5 V19.5 M4.5 12 H19.5"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * 2. Icône Loupe de recherche pour "Recherche d'événement"
 */
const SearchIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#2563EB',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="10.5" cy="10.5" r="6" stroke={color} strokeWidth={2.6} />
    <Path
      d="M15 15 L20 20"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  </Svg>
);

/**
 * 3. Icône Deux Billets / Cartes superposées pour "Pari combiné du jour"
 * (Reproduction vectorielle exacte de l'asset officiel assets/icons/combine.png)
 */
const CombineBetIcon: React.FC<{ size?: number; color?: string; badgeBg?: string }> = ({
  size = 22,
  color = '#2563EB',
  badgeBg = '#EBF3FE',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Plaque Supérieure avec découpe cercle et ligne */}
    <Rect x="2" y="3" width="20" height="8.5" rx="4.25" fill={color} />
    <Circle cx="6.5" cy="7.25" r="2.2" fill={badgeBg} />
    <Rect x="10.5" y="6" width="8" height="2.5" rx="1.25" fill={badgeBg} />

    {/* Plaque Inférieure avec découpe cercle */}
    <Rect x="2" y="13.5" width="20" height="8.5" rx="4.25" fill={color} />
    <Circle cx="6.5" cy="17.75" r="2.2" fill={badgeBg} />
  </Svg>
);

/**
 * 4. Icône Curseurs / Sliders pour "Créer coupon de pari"
 * (Deux lignes horizontales avec curseurs décalés)
 */
const SlidersIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#2563EB',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Piste Supérieure */}
    <Rect x="2.5" y="6.8" width="19" height="2.4" rx="1.2" fill={color} />
    {/* Curseur Supérieur (gauche) */}
    <Rect x="5.5" y="3.5" width="3.4" height="9" rx="1.2" fill={color} />

    {/* Piste Inférieure */}
    <Rect x="2.5" y="15.8" width="19" height="2.4" rx="1.2" fill={color} />
    {/* Curseur Inférieur (droite) */}
    <Rect x="14" y="12.5" width="3.4" height="9" rx="1.2" fill={color} />
  </Svg>
);

/**
 * 5. Icône Upload pour "Charger le coupon de pari"
 * (Flèche vers le haut au-dessus d'une barre horizontale de base)
 */
const UploadTrayIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#2563EB',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Tige de la flèche */}
    <Rect x="10.7" y="6.5" width="2.6" height="9.5" rx="1.2" fill={color} />
    {/* Pointe de la flèche */}
    <Path
      d="M6.5 10.5 L12 4.5 L17.5 10.5"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Barre horizontale inférieure */}
    <Rect x="5" y="18.5" width="14" height="2.5" rx="1.25" fill={color} />
  </Svg>
);

// ============================================================================
// CARTE D'ACTION INDIVIDUELLE (ACTION CARD ITEM)
// ============================================================================

interface ActionCardItemProps {
  renderIcon: () => React.ReactNode;
  title: string;
  subtitle: string;
  badgeBg: string;
  cardBg: string;
  titleColor: string;
  subtitleColor: string;
  borderColor?: string;
  onPress: () => void;
  font: (size: number) => number;
  moderateScale: (size: number) => number;
}

const ActionCardItem: React.FC<ActionCardItemProps> = ({
  renderIcon,
  title,
  subtitle,
  badgeBg,
  cardBg,
  titleColor,
  subtitleColor,
  borderColor,
  onPress,
  font,
  moderateScale,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        styles.cardContainer,
        {
          backgroundColor: cardBg,
          borderColor: borderColor || 'transparent',
          borderWidth: borderColor ? 1 : 0,
          paddingVertical: moderateScale(13),
          paddingHorizontal: moderateScale(14),
        },
      ]}
    >
      {/* Conteneur circulaire de l'icône */}
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: badgeBg,
            width: moderateScale(46),
            height: moderateScale(46),
            borderRadius: moderateScale(23),
          },
        ]}
      >
        {renderIcon()}
      </View>

      {/* Textes de la carte */}
      <View style={styles.textContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.titleText,
            { color: titleColor, fontSize: font(15.5) },
          ]}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.subtitleText,
            { color: subtitleColor, fontSize: font(13) },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL : EMPTY COUPON ACTIONS
// ============================================================================

export interface EmptyCouponActionsProps {
  navigation?: any;
  userBalance?: string;
  onDeposit?: () => void;
  onSearch?: () => void;
  onCombine?: () => void;
  onCreateCoupon?: () => void;
  onLoadCoupon?: () => void;
}

export const EmptyCouponActions: React.FC<EmptyCouponActionsProps> = ({
  navigation,
  userBalance = '0 F',
  onDeposit,
  onSearch,
  onCombine,
  onCreateCoupon,
  onLoadCoupon,
}) => {
  const { currentTheme, currentBrand } = useThemeStore();
  const { font, moderateScale, isTablet } = useResponsive();

  const isDark = Boolean(currentTheme?.isDark);

  // Couleur primaire de marque (1xBet bleu #2563EB, Melbet or #F3A000, WinWin vert #7CBD17, MegaPari rouge #D3242A, etc.)
  const primaryColor = currentTheme?.colors?.primary || currentTheme?.primary || '#2563EB';

  // Fond des pastilles thématiques (s'adapte à la couleur primaire douce de chaque marque)
  const softBadgeBg = isDark
    ? (currentTheme?.primarySoft || '#1E293B')
    : (currentTheme?.primarySoft || '#E8F1FC');

  // Pastille officielle pour "Recharger le compte"
  const greenBadgeBg =
    currentTheme?.depositButton?.bg ||
    currentTheme?.colors?.accentGreen ||
    currentTheme?.status?.paye ||
    '#22C55E';

  // Couleurs des cartes et textes selon le thème
  const cardBg = currentTheme?.cardBackground || (isDark ? '#212D3B' : '#FFFFFF');
  const borderColor = isDark ? (currentTheme?.border || '#2C3A4B') : undefined;

  // Typographies thématiques
  const mainNoticeTitleColor = isDark ? (currentTheme?.textPrimary || '#FFFFFF') : (currentTheme?.textPrimary || '#1D3B58');
  const mainNoticeSubtitleColor = isDark ? (currentTheme?.textSecondary || '#8E9CAE') : (currentTheme?.textSecondary || '#5B7B9A');
  const cardTitleColor = currentTheme?.textPrimary || (isDark ? '#FFFFFF' : '#101E33');
  const cardSubtitleColor = currentTheme?.textSecondary || (isDark ? '#8E9CAE' : '#64748B');

  // Nettoyage et formatage strict du solde ("Votre solde : 148326760 F" comme sur la capture)
  const cleanBalanceText = useMemo(() => {
    if (!userBalance) return '0 F';
    let s = String(userBalance).trim();
    s = s.replace(/^Votre solde\s*:\s*/i, '');
    s = s.replace(/₣/g, 'F');
    if (!s.endsWith('F')) {
      s = `${s} F`;
    }
    return s;
  }, [userBalance]);

  // Handlers avec fallbacks sécurisés
  const handleDepositPress = () => {
    if (onDeposit) {
      onDeposit();
    } else if (navigation?.navigate) {
      navigation.navigate('DepositScreen');
    }
  };

  const handleSearchPress = () => {
    if (onSearch) {
      onSearch();
    } else if (navigation?.navigate) {
      try {
        navigation.navigate('SearchScreen');
      } catch (e) {
        navigation.navigate('Populaire');
      }
    }
  };

  const handleCombinePress = () => {
    if (onCombine) {
      onCombine();
    } else if (navigation?.navigate) {
      navigation.navigate('AccumulatorScreen');
    }
  };

  const handleCreatePress = () => {
    if (onCreateCoupon) {
      onCreateCoupon();
    } else if (navigation?.navigate) {
      navigation.navigate('StudioCreation');
    }
  };

  const handleLoadPress = () => {
    if (onLoadCoupon) {
      onLoadCoupon();
    } else {
      useCouponStore.getState().setLoadSheetVisible(true);
    }
  };

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {/* 1. Bloc de texte d'en-tête (Structure exacte de la capture) */}
      <View style={styles.noticeHeader}>
        <Text style={[styles.headerTitle, { color: mainNoticeTitleColor, fontSize: font(17.5) }]}>
          Votre coupon de pari est vide
        </Text>
        <Text style={[styles.headerSubtitle, { color: mainNoticeSubtitleColor, fontSize: font(13.5) }]}>
          Ajoutez un événement au coupon de pari ou sélectionnez l'une des options
        </Text>
      </View>

      {/* 2. Pile des 5 Cartes d'Actions */}
      <View style={styles.cardsStack}>
        {/* CARTE 1 : Recharger le compte (Cercle vert + Croix blanche) */}
        <ActionCardItem
          badgeBg={greenBadgeBg}
          cardBg={cardBg}
          borderColor={borderColor}
          titleColor={cardTitleColor}
          subtitleColor={cardSubtitleColor}
          title="Recharger le compte"
          subtitle={`Votre solde : ${cleanBalanceText}`}
          onPress={handleDepositPress}
          font={font}
          moderateScale={moderateScale}
          renderIcon={() => <PlusIcon size={moderateScale(24)} color="#FFFFFF" />}
        />

        {/* CARTE 2 : Recherche d'événement (Cercle bleu pastel + Loupe bleue) */}
        <ActionCardItem
          badgeBg={softBadgeBg}
          cardBg={cardBg}
          borderColor={borderColor}
          titleColor={cardTitleColor}
          subtitleColor={cardSubtitleColor}
          title="Recherche d'événement"
          subtitle="Uniquement pour vous"
          onPress={handleSearchPress}
          font={font}
          moderateScale={moderateScale}
          renderIcon={() => <SearchIcon size={moderateScale(22)} color={primaryColor} />}
        />

        {/* CARTE 3 : Pari combiné du jour (Cercle bleu pastel + Deux tickets superposés) */}
        <ActionCardItem
          badgeBg={softBadgeBg}
          cardBg={cardBg}
          borderColor={borderColor}
          titleColor={cardTitleColor}
          subtitleColor={cardSubtitleColor}
          title="Pari combiné du jour"
          subtitle="Meilleures offres du jour"
          onPress={handleCombinePress}
          font={font}
          moderateScale={moderateScale}
          renderIcon={() => (
            <CombineBetIcon
              size={moderateScale(23)}
              color={primaryColor}
              badgeBg={softBadgeBg}
            />
          )}
        />

        {/* CARTE 4 : Créer coupon de pari (Cercle bleu pastel + Curseurs/Sliders) */}
        <ActionCardItem
          badgeBg={softBadgeBg}
          cardBg={cardBg}
          borderColor={borderColor}
          titleColor={cardTitleColor}
          subtitleColor={cardSubtitleColor}
          title="Créer coupon de pari"
          subtitle="Générez votre coupon de pari"
          onPress={handleCreatePress}
          font={font}
          moderateScale={moderateScale}
          renderIcon={() => <SlidersIcon size={moderateScale(22)} color={primaryColor} />}
        />

        {/* CARTE 5 : Charger le coupon de pari (Cercle bleu pastel + Flèche plateau) */}
        <ActionCardItem
          badgeBg={softBadgeBg}
          cardBg={cardBg}
          borderColor={borderColor}
          titleColor={cardTitleColor}
          subtitleColor={cardSubtitleColor}
          title="Charger le coupon de pari"
          subtitle="Chargez votre coupon de pari"
          onPress={handleLoadPress}
          font={font}
          moderateScale={moderateScale}
          renderIcon={() => <UploadTrayIcon size={moderateScale(22)} color={primaryColor} />}
        />
      </View>
    </View>
  );
};

// ============================================================================
// STYLES PIXEL-PERFECT ET RESPONSIVE
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 28,
  },
  tabletContainer: {
    maxWidth: 580,
    alignSelf: 'center',
  },
  noticeHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: Typography.fontFamily,
    maxWidth: 360,
  },
  cardsStack: {
    width: '100%',
    gap: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 0,
  },
  iconBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontWeight: '700',
    marginBottom: 2.5,
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.1,
  },
});

export default EmptyCouponActions;
