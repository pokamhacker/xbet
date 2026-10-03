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
import { getBetTypeIcon } from '../../utils/getBetIcon';
import { useThemeStore } from '../../stores/themeStore';
import { formatBetDate } from '../../utils/dateFormatter';

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

// 2. Fallback Verified Badge (Cercle avec coche blanche superposé au logo)
export const DefaultVerifiedBadgeIcon: React.FC<{
  size?: number;
  color?: string;
  checkColor?: string;
  borderColor?: string;
}> = ({ size = 14, color, checkColor = '#FFFFFF', borderColor }) => {
  const { currentTheme } = useThemeStore();
  const c = color || currentTheme.status?.accepte || currentTheme.primary;
  const b = borderColor || currentTheme.cardBackground || '#FFFFFF';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: b,
      }}
    >
      <Ionicons name="checkmark" size={size * 0.65} color={checkColor} />
    </View>
  );
};

import { BetLayersIcon } from '../icons/BetLayersIcon';

// 3. Fallback Layers Icon (Piles de calques 3D isométrique)
export const DefaultLayersIcon: React.FC<IconBaseProps> = ({
  size = 14,
  color,
}) => {
  const { currentTheme } = useThemeStore();
  return (
    <BetLayersIcon
      size={size}
      color={color || currentTheme.textSecondary}
      primaryColor={currentTheme.textSecondary}
      shadowColor={currentTheme.border}
      lightColor={currentTheme.primarySoft}
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
  try {
    return (
      <Image
        source={require('../../../assets/icons/cloche.png')}
        style={{ width: size, height: size, tintColor: c }}
        resizeMode="contain"
      />
    );
  } catch {
    return <Ionicons name="notifications-outline" size={size} color={c} />;
  }
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
  currency = 'F'
): string => {
  if (value === undefined || value === null || value === '') return `0 ${currency}`;
  if (typeof value === 'string') {
    if (value.includes('F') || value.includes('₣')) return value;
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    if (isNaN(num)) return value;
    return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currency}`;
  }
  return `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currency}`;
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

  /** Catégorie du sport ou jeu (ex: 'fifa' | 'poker' | 'football') */
  sportCategory?: string;
  /** Slot ou source pour le logo du sport / type de pari (ImageSource, Composant React ou JSX Element) */
  sportLogo?: any;

  /** Callbacks d'interaction */
  onPress?: () => void;
  onBellPress?: () => void;
  onOptionsPress?: () => void;

  /** Slots d'icônes & logos personnalisés */
  FifaLogo?: any;
  VerifiedBadgeIcon?: React.ComponentType<{ size?: number; color?: string; checkColor?: string }> | React.ReactNode;
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
  sportCategory,
  odds = '58',
  stake = '5000',
  potentialGain = '290000',
  status = 'Accepté',
  currencySymbol = 'F',
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
  const { currentTheme } = useThemeStore();
  const isPaye = status === 'Payé' || status === 'Gagné' || status === 'Gain';
  const isLost = status === 'Perdu';
  const statusColor = isPaye
    ? (currentTheme.status?.paye || '#16A34A')
    : isLost
      ? (currentTheme.status?.perdu || '#DC2626')
      : (currentTheme.status?.accepte || currentTheme.primary);
  const badgeColor = isPaye
    ? (currentTheme.status?.paye || '#16A34A')
    : (currentTheme.status?.accepte || currentTheme.primary);
  const brandPrimary = currentTheme.primary;
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

  const renderLogo = () => {
    // 1. Si un logo personnalisé a été explicitement fourni via sportLogo ou FifaLogo (différent de DefaultFifaLogo)
    const customLogo = sportLogo ?? (FifaLogo !== DefaultFifaLogo ? FifaLogo : undefined);

    if (customLogo) {
      if (React.isValidElement(customLogo)) {
        return customLogo;
      }
      if (typeof customLogo === 'function') {
        const LogoComponent = customLogo;
        return <LogoComponent size={30} />;
      }
      // ImageSource (number de require() ou { uri: string })
      return (
        <Image
          source={customLogo}
          style={styles.sportBadgeImage}
          resizeMode="contain"
        />
      );
    }

    // 2. Résolution dynamique selon type ('Combiné' vs 'Simple') et sportCategory
    const dynamicIconSource = getBetTypeIcon({
      id: ticketNumber,
      type,
      sportCategory,
      eventsCount,
    });

    return (
      <Image
        source={dynamicIconSource}
        style={styles.sportBadgeImage}
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
            <View style={styles.verifiedBadgeContainer}>
              {renderComponentOrNode(VerifiedBadgeIcon, {
                size: 13,
                color: badgeColor,
                checkColor: '#FFFFFF',
                borderColor: currentTheme.cardBackground,
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
              <View style={styles.layersBlock}>
                {renderComponentOrNode(LayersIcon, {
                  size: 14,
                  color: currentTheme.textSecondary,
                })}
                <Text style={[styles.eventsCountText, { color: currentTheme.textPrimary }]}>{eventsCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* À droite : Cloche & Menu 3 points adaptés au thème */}
        <View style={styles.headerActionsRight}>
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
            {typeof odds === 'number' ? odds.toLocaleString('fr-FR') : odds}
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
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  // 2. Section En-tête (paddingHorizontal: 10, paddingTop: 10, paddingBottom: 10)
  headerSection: {
    paddingHorizontal: 10,
    paddingTop: 10,
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
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportBadgeImage: {
    width: 30,
    height: 30,
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    bottom: -2,
    right: -3,
  },
  headerTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  dateNumberText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#7B8A9E',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  typeLayersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17263A',
    letterSpacing: -0.2,
  },
  layersBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    gap: 3,
  },
  eventsCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#17263A',
  },
  headerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Barre de Séparation Pleine Largeur (Bordure à Bordure)
  separatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#EDF1F7',
  },

  // 4. Section Corps (paddingHorizontal: 10, paddingTop: 9, paddingBottom: 11, gap: 4)
  bodySection: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 11,
    gap: 4,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  keyLabel: {
    fontSize: 13.5,
    fontWeight: '400',
    color: '#64748B',
  },
  valueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101E33',
    letterSpacing: -0.2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
