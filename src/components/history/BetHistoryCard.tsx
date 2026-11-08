import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { getBetTypeIcon, isTvBetOrPokerSport, pokerIcon, tvbetIcon, combineIcon, fifaIcon } from '../../utils/getBetIcon';
import { useThemeStore } from '../../stores/themeStore';
import { formatBetDate } from '../../utils/dateFormatter';
import { formatCleanOdds } from '../../utils/oddsFormatter';
import { LiveBadge } from './LiveBadge';
import { BellVectorIcon } from '../common/NotificationBell';

// ============================================================================
// EMPLACEMENTS / IMPORTS DES ICÔNES DU PROJET
// Remplacez ces imports ou injectez directement vos propres composants via les props
// ============================================================================
/*
import {
  FifaLogo,
  VerifiedBadgeIcon,
  LayersIcon,
  BellIcon,
  MoreHorizontalIcon,
} from '@/components/icons';
*/

export interface IconBaseProps {
  size?: number;
  color?: string;
}

// 1. Fallback Logo FIFA / Sport
export const DefaultFifaLogo: React.FC<{ size?: number }> = ({ size = 28 }) => {
  try {
    return (
      <Image
        source={require('../../../assets/icons/fifa_badge.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  } catch {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#0284C7',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="football" size={size * 0.65} color="#FFFFFF" />
      </View>
    );
  }
};

// 2. Fallback Verified Badge (Cercle vectoriel net + coche blanche épaisse arrondie comme sur la capture)
export const DefaultVerifiedBadgeIcon: React.FC<{
  size?: number;
  color?: string;
  checkColor?: string;
  borderColor?: string;
  isLost?: boolean;
}> = ({ size = 16, color, checkColor = '#FFFFFF', borderColor, isLost = false }) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.status?.accepte || currentTheme.primary;
  const b = borderColor || currentTheme.cardBackground || '#FFFFFF';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10.2"
        fill={c}
        stroke={b}
        strokeWidth="2.3"
      />
      {isLost ? (
        <Path
          d="M 7.5 12 L 16.5 12"
          stroke={checkColor}
          strokeWidth="3.0"
          strokeLinecap="round"
        />
      ) : (
        <Path
          d="M 7.2 12.3 L 10.5 15.6 L 17.2 8.9"
          stroke={checkColor}
          strokeWidth="3.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
};

import { BetLayersIcon } from '../icons/BetLayersIcon';

// 3. Fallback Layers Icon (ic_events_layers identique à la capture de référence)
export const DefaultLayersIcon: React.FC<IconBaseProps> = ({
  size = 12.5,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const layersColor = color || (currentTheme.isDark ? '#8E9EAB' : '#758692');
  return (
    <BetLayersIcon
      size={size}
      variant="flat"
      color={layersColor}
      primaryColor={layersColor}
    />
  );
};

// 4. Fallback Bell Icon
export const DefaultBellIcon: React.FC<IconBaseProps> = ({
  size = 20,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.primary;
  return <BellVectorIcon size={size} color={c} />;
};

// 5. Fallback More Horizontal Icon
export const DefaultMoreHorizontalIcon: React.FC<IconBaseProps> = ({
  size = 20,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.primary;
  return <Ionicons name="ellipsis-horizontal" size={size} color={c} />;
};

// ============================================================================
// UTILITAIRES DE FORMATAGE
// ============================================================================
export const formatCurrency = (
  value?: number | string,
  currency = '₣'
): string => {
  if (value === undefined || value === null || value === '') return `0 ${currency}`;
  if (typeof value === 'string') {
    if (value.includes('F') || value.includes('₣')) {
      // Supprimer les espaces situés entre les chiffres
      return value.replace(/(\d)\s+(\d)/g, '$1$2').trim();
    }
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return value;
    return `${Math.round(num).toString()} ${currency}`;
  }
  return `${Math.round(value).toString()} ${currency}`;
};

export const getStatusColor = (status?: string): string => {
  const norm = (status || '').toLowerCase().trim();
  if (norm === 'payé' || norm === 'gagné' || norm === 'gain') {
    return '#16A34A'; // Vert franc
  }
  if (norm === 'perdu') {
    return '#DC2626'; // Rouge
  }
  return '#2A75E6'; // Bleu vif identitaire (#2A75E6)
};

// ============================================================================
// PROPS DE LA CARTE DE COUPON
// ============================================================================
export type BetStatus = 'Accepté' | 'Payé' | 'Perdu' | string;

export interface BetHistoryCardProps {
  /** Numéro du coupon (ex: '86037893293') */
  ticketNumber?: string;
  /** Date et heure de création (ex: '27.09.2026 (08:30)') */
  date?: string;
  /** Type de pari (ex: 'Simple' ou 'Combiné') */
  type?: 'Simple' | 'Combiné' | string;
  /** Nombre d'événements (ex: 1) */
  eventsCount?: number;
  /** Cote globale du ticket (ex: 58 ou '58') */
  odds?: number | string;
  /** Montant misé (ex: 5000 ou '5000 F') */
  stake?: number | string;
  /** Gains potentiels ou réels (ex: 290000 ou '290000 F') */
  potentialGain?: number | string;
  /** Statut du coupon (ex: 'Accepté' | 'Payé' | 'Perdu') */
  status?: BetStatus;
  /** Symbole de devise (par défaut 'F') */
  currencySymbol?: string;

  /** Indique si le match ou coupon est en direct */
  isLive?: boolean;

  /** Catégorie du sport ou jeu (ex: 'fifa' | 'poker' | 'football') */
  sportCategory?: string;
  /** Liste des événements du coupon (pour détection combiné poker/tvbet) */
  events?: any[];
  /** Slot ou source pour le logo du sport / type de pari (ImageSource, Composant React ou JSX Element) */
  sportLogo?: any;

  /** Callbacks d'interaction */
  onPress?: () => void;
  onBellPress?: () => void;
  onOptionsPress?: () => void;

  /** Slots d'icônes & logos personnalisés */
  FifaLogo?: any;
  VerifiedBadgeIcon?: React.ComponentType<{ size?: number; color?: string; checkColor?: string; borderColor?: string; isLost?: boolean }> | React.ReactNode;
  LayersIcon?: React.ComponentType<IconBaseProps> | React.ReactNode;
  BellIcon?: React.ComponentType<IconBaseProps> | React.ReactNode;
  MoreHorizontalIcon?: React.ComponentType<IconBaseProps> | React.ReactNode;

  style?: StyleProp<ViewStyle>;
}

// ============================================================================
// COMPOSANT PRINCIPAL : BetHistoryCard
// ============================================================================
export const BetHistoryCard: React.FC<BetHistoryCardProps> = ({
  ticketNumber = '86037893293',
  date = '27.09.2026 (08:30)',
  type = 'Simple',
  eventsCount = 1,
  events,
  isLive = false,
  sportCategory,
  odds = '58',
  stake = '5000',
  potentialGain = '290000',
  status = 'Accepté',
  currencySymbol = '₣',
  onPress,
  onBellPress,
  onOptionsPress,
  sportLogo,
  FifaLogo,
  VerifiedBadgeIcon = DefaultVerifiedBadgeIcon,
  LayersIcon = DefaultLayersIcon,
  BellIcon = DefaultBellIcon,
  MoreHorizontalIcon = DefaultMoreHorizontalIcon,
  style,
}) => {
  const { currentTheme, brandChoice } = useThemeStore();
  const isPaye = status === 'Payé' || status === 'Gagné' || status === 'Gain';
  const isLost = status === 'Perdu';
  const statusColor = isPaye
    ? (currentTheme.status?.paye || '#16A34A')
    : isLost
      ? (currentTheme.status?.perdu || '#DC2626')
      : (currentTheme.status?.accepte || currentTheme.primary);
  const badgeColor = isPaye
    ? (currentTheme.status?.paye || '#16A34A')
    : isLost
      ? (currentTheme.status?.perdu || '#DC2626')
      : (currentTheme.status?.accepte || currentTheme.primary);
  const brandPrimary =
    currentTheme?.primary ||
    currentTheme?.colors?.primary ||
    (brandChoice === 'melbet'
      ? '#E58B05'
      : brandChoice === 'winwin'
        ? '#7CBD17'
        : brandChoice === 'betwinner'
          ? '#007348'
          : brandChoice === 'paripesa'
            ? '#1E5BBB'
            : brandChoice === 'megaparis' || brandChoice === 'megapari'
              ? '#D3242A'
              : '#2B78C9');
  const cleanTicketNumber = ticketNumber ? String(ticketNumber).replace(/^(?:№|N[º°o])\s*/i, '') : '';

  const renderComponentOrNode = (
    ComponentOrNode: any,
    props?: Record<string, any>
  ) => {
    if (React.isValidElement(ComponentOrNode)) {
      return ComponentOrNode;
    }
    if (typeof ComponentOrNode === 'function') {
      const Component = ComponentOrNode;
      return <Component {...props} />;
    }
    return null;
  };

  const isMelbet = Boolean(
    brandChoice === 'melbet' ||
    (currentTheme?.name || '').toLowerCase().includes('melbet')
  );

  const isMegaPari = Boolean(
    brandChoice === 'megaparis' ||
    brandChoice === 'megapari' ||
    (currentTheme?.name || '').toLowerCase().includes('megapari')
  );

  const detailPokerColor =
    currentTheme.textSecondary ||
    currentTheme.colors?.textSecondary ||
    (currentTheme.isDark ? '#8A96A3' : '#64748B');

  const pokerIconTint = isMelbet
    ? '#1B365D'
    : isMegaPari
      ? detailPokerColor
      : '#507694';

  const isTvBetSport = Boolean(
    isTvBetOrPokerSport(sportCategory) ||
    sportLogo === pokerIcon ||
    sportLogo === tvbetIcon
  );

  const customLogo = sportLogo ?? (FifaLogo !== DefaultFifaLogo ? FifaLogo : undefined);
  const dynamicIconSource = getBetTypeIcon({
    id: ticketNumber,
    type,
    sportCategory,
    eventsCount,
    events,
  });
  const resolvedLogoSource = customLogo ?? dynamicIconSource;
  const isCombineLogo = resolvedLogoSource === combineIcon;
  const isFifaLogo =
    resolvedLogoSource === fifaIcon ||
    (!customLogo && !isCombineLogo && (sportCategory || '').toLowerCase().includes('fifa'));
  const isTvBet =
    resolvedLogoSource === tvbetIcon ||
    resolvedLogoSource === pokerIcon ||
    (isTvBetSport && !isCombineLogo);

  const renderLogo = () => {
    // 1. Si un logo personnalisé a été explicitement fourni via sportLogo ou FifaLogo (différent de DefaultFifaLogo)
    if (customLogo) {
      if (React.isValidElement(customLogo)) {
        return customLogo;
      }
      if (typeof customLogo === 'function') {
        const LogoComponent = customLogo;
        return <LogoComponent size={isCombineLogo ? 21 : isFifaLogo ? 25 : isTvBet ? 25 : 28} />;
      }
      // ImageSource (number de require() ou { uri: string })
      return (
        <Image
          source={customLogo}
          style={[
            styles.sportBadgeImage,
            isCombineLogo ? styles.combineBadgeImage : null,
            isFifaLogo ? styles.fifaBadgeImage : null,
            isTvBet ? styles.pokerBadgeImage : null,
            isTvBet && pokerIconTint ? { tintColor: pokerIconTint } : null,
          ]}
          resizeMode="contain"
        />
      );
    }

    // 2. Résolution dynamique selon type ('Combiné' vs 'Simple') et sportCategory
    return (
      <Image
        source={dynamicIconSource}
        style={[
          styles.sportBadgeImage,
          isCombineLogo ? styles.combineBadgeImage : null,
          isFifaLogo ? styles.fifaBadgeImage : null,
          isTvBet ? styles.pokerBadgeImage : null,
          isTvBet && pokerIconTint ? { tintColor: pokerIconTint } : null,
        ]}
        resizeMode="contain"
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: currentTheme.cardBackground,
          borderColor: currentTheme.border,
        },
        style,
      ]}
    >
      {/* =================================================================== */}
      {/* 1. SECTION EN-TÊTE (Padding horizontal 16px dédié)                  */}
      {/* =================================================================== */}
      <View style={styles.headerSection}>
        {/* À gauche : Logo sport avec badge + Textes descriptifs */}
        <View style={styles.headerLeft}>
          <View style={styles.logoWrapper}>
            {renderLogo()}
            <View
              style={[
                styles.verifiedBadgeContainer,
                isCombineLogo ? styles.verifiedBadgeCombine : null,
                isFifaLogo ? styles.verifiedBadgeFifa : null,
                isTvBet ? styles.verifiedBadgeTvBet : null,
              ]}
            >
              {renderComponentOrNode(VerifiedBadgeIcon, {
                size: 16,
                color: badgeColor,
                checkColor: '#FFFFFF',
                borderColor: currentTheme.cardBackground,
                isLost,
              })}
            </View>
          </View>

          <View style={styles.headerTextCol}>
            <Text
              style={[styles.dateNumberText, { color: currentTheme.textSecondary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {formatBetDate(date)} · № {cleanTicketNumber}
            </Text>

            <View style={styles.typeLayersRow}>
              <Text style={[styles.typeText, { color: currentTheme.textPrimary }]}>{type}</Text>
              {(type === 'Combiné' || (eventsCount && eventsCount > 1)) && (
                <View style={styles.layersBlock}>
                  {renderComponentOrNode(LayersIcon, {
                    size: 12.5,
                    color: currentTheme.isDark ? '#8E9EAB' : '#758692',
                  })}
                  <Text style={[styles.eventsCountText, { color: currentTheme.textPrimary }]}>{eventsCount}</Text>
                </View>
              )}
              {isLive && !isPaye && !isLost && (
                <LiveBadge style={styles.historyLiveBadge} label="EN DIRECT" />
              )}
            </View>
          </View>
        </View>

        {/* À droite : Cloche (paris en cours) & Menu 3 points adaptés au thème */}
        <View style={styles.headerActionsRight}>
          {!isPaye && !isLost && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e?.stopPropagation?.();
                onBellPress?.();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityLabel="Activer les notifications du coupon"
              style={styles.actionIconBtn}
            >
              {renderComponentOrNode(BellIcon, { size: 20, color: brandPrimary })}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={(e) => {
              e?.stopPropagation?.();
              onOptionsPress?.();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            accessibilityLabel="Options du coupon"
            style={styles.actionIconBtn}
          >
            {renderComponentOrNode(MoreHorizontalIcon, {
              size: 20,
              color: brandPrimary,
            })}
          </TouchableOpacity>
        </View>
      </View>

      {/* =================================================================== */}
      {/* 2. SÉPARATEUR PLEINE LARGEUR (Bordure à Bordure 100%)               */}
      {/* =================================================================== */}
      <View style={[styles.separatorLine, { backgroundColor: currentTheme.border }]} />

      {/* =================================================================== */}
      {/* 3. SECTION CORPS (Padding horizontal 16px dédié)                    */}
      {/* =================================================================== */}
      <View style={styles.bodySection}>
        {/* Ligne 1 : Cote */}
        <View style={styles.keyValueRow}>
          <Text style={[styles.keyLabel, { color: currentTheme.textSecondary }]}>Cote :</Text>
          <Text style={[styles.valueBold, { color: currentTheme.textPrimary }]}>
            {formatCleanOdds(odds)}
          </Text>
        </View>

        {/* Ligne 2 : Mise */}
        <View style={styles.keyValueRow}>
          <Text style={[styles.keyLabel, { color: currentTheme.textSecondary }]}>Mise :</Text>
          <Text style={[styles.valueBold, { color: currentTheme.textPrimary }]}>
            {formatCurrency(stake, currencySymbol)}
          </Text>
        </View>

        {/* Ligne 3 : Gain (si Gagné/Payé, montant vert) ou Gains potentiels (si En cours/Accepté). Si Perdu, aucun gain affiché */}
        {!isLost && (
          <View style={styles.keyValueRow}>
            <Text style={[styles.keyLabel, { color: currentTheme.textSecondary }]}>
              {isPaye ? 'Gain :' : 'Gains potentiels :'}
            </Text>
            <Text
              style={[
                styles.valueBold,
                {
                  color: isPaye
                    ? (currentTheme.status?.paye || currentTheme.colors?.accentGreen || '#22C55E')
                    : currentTheme.textPrimary,
                },
              ]}
            >
              {formatCurrency(potentialGain, currencySymbol)}
            </Text>
          </View>
        )}

        {/* Ligne 4 : Statut */}
        <View style={styles.keyValueRow}>
          <Text style={[styles.keyLabel, { color: currentTheme.textSecondary }]}>Statut :</Text>
          <Text style={[styles.statusValue, { color: statusColor }]}>
            {status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const BetTicketCard = BetHistoryCard;
export type BetTicketCardProps = BetHistoryCardProps;
export default BetHistoryCard;

// ============================================================================
// STYLES PIXEL-PERFECT SOIGNÉS
// ============================================================================
const styles = StyleSheet.create({
  // 1. Conteneur Principal (Card)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },

  // 2. Section En-tête (Fond blanc pur #FFFFFF)
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  logoWrapper: {
    position: 'relative',
    width: 32,
    height: 32,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportBadgeImage: {
    width: 28,
    height: 28,
  },
  combineBadgeImage: {
    width: 28,
    height: 28,
  },
  fifaBadgeImage: {
    width: 30,
    height: 19,
  },
  pokerBadgeImage: {
    width: 28,
    height: 28,
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    bottom: -1,
    right: -2,
  },
  verifiedBadgeCombine: {
    bottom: -1,
    right: -2,
  },
  verifiedBadgeFifa: {
    bottom: -1,
    right: -2,
  },
  verifiedBadgeTvBet: {
    bottom: -1,
    right: -2,
  },
  headerTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  dateNumberText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6E8299',
    marginBottom: 3,
  },
  typeLayersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F2742',
  },
  layersBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    gap: 4,
  },
  eventsCountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2742',
  },
  historyLiveBadge: {
    marginLeft: 6,
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Barre de Séparation Pleine Largeur (#F0F3F8, 1px)
  separatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F3F8',
  },

  // 4. Section Corps (Fond blanc légèrement bleuté #F9FBFD)
  bodySection: {
    backgroundColor: '#ffffffff',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 4,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 1.5,
  },
  keyLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#63788E',
  },
  valueBold: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F2742',
  },
  statusValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A83C4',
  },
});
