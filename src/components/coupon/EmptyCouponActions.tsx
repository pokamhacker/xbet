import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';

interface ActionCardProps {
  iconName: string;
  iconFamily: 'Ionicons' | 'Feather' | 'MaterialCommunityIcons';
  title: string;
  subtitle: string;
  badgeBg: string;
  iconColor: string;
  cardBg?: string;
  titleColor?: string;
  subtitleColor?: string;
  borderColor?: string;
  onPress: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  iconName,
  iconFamily,
  title,
  subtitle,
  badgeBg,
  iconColor,
  cardBg,
  titleColor,
  subtitleColor,
  borderColor,
  onPress,
}) => {
  const renderIcon = () => {
    switch (iconFamily) {
      case 'Ionicons':
        return <Ionicons color={iconColor} name={iconName as any} size={20} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons color={iconColor} name={iconName as any} size={20} />;
      default:
        return <Feather color={iconColor} name={iconName as any} size={20} />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.cardContainer,
        cardBg ? { backgroundColor: cardBg } : null,
        borderColor ? { borderColor, borderWidth: 1 } : null,
      ]}
    >
      {/* Conteneur circulaire de l'icône */}
      <View style={[styles.iconBadge, { backgroundColor: badgeBg }]}>
        {renderIcon()}
      </View>

      {/* Textes de la carte */}
      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={[styles.titleText, titleColor ? { color: titleColor } : null]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.subtitleText, subtitleColor ? { color: subtitleColor } : null]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

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
  userBalance = '0.00 F',
  onDeposit,
  onSearch,
  onCombine,
  onCreateCoupon,
  onLoadCoupon,
}) => {
  const { currentTheme, currentBrand } = useThemeStore();
  const isDark = currentTheme?.isDark || currentBrand === 'melbet' || currentTheme?.name === 'melbet';

  const primary = currentTheme?.primary || '#3B82F6';
  const primarySoft = isDark
    ? 'rgba(235, 139, 5, 0.15)'
    : (currentTheme?.primarySoft || '#EBF3FE');

  // Couleurs dynamiques selon le thème actif
  const colors = {
    rechargeBg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#E8F5E9',
    rechargeIcon: currentTheme?.status?.paye || '#2ECC71',
    searchBg: primarySoft,
    searchIcon: primary,
    combineBg: isDark ? 'rgba(139, 92, 246, 0.15)' : '#F0EBF9',
    combineIcon: '#8B5CF6',
    createBg: primarySoft,
    createIcon: primary,
    loadBg: primarySoft,
    loadIcon: primary,
    cardBg: currentTheme?.cardBackground || (isDark ? '#1E293B' : '#FFFFFF'),
    borderColor: isDark ? (currentTheme?.border || '#334155') : 'transparent',
    titleColor: currentTheme?.textPrimary || (isDark ? '#F8FAFC' : '#0F172A'),
    subtitleColor: currentTheme?.textSecondary || (isDark ? '#94A3B8' : '#64748B'),
  };

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
      navigation.navigate('CreateCouponModal');
    }
  };

  const handleLoadPress = () => {
    if (onLoadCoupon) {
      onLoadCoupon();
    } else if (navigation?.navigate) {
      navigation.navigate('LoadCouponModal');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.headerTitle, { color: colors.titleColor }]}>
        Votre coupon de pari est vide
      </Text>
      <Text style={[styles.headerSubtitle, { color: colors.subtitleColor }]}>
        Ajoutez un événement au coupon de pari ou sélectionnez l'une des options
      </Text>

      {/* 1. Recharger le compte */}
      <ActionCard
        badgeBg={colors.rechargeBg}
        iconColor={colors.rechargeIcon}
        iconFamily="Ionicons"
        iconName="add"
        onPress={handleDepositPress}
        subtitle={`Votre solde : ${userBalance}`}
        title="Recharger le compte"
        cardBg={colors.cardBg}
        titleColor={colors.titleColor}
        subtitleColor={colors.subtitleColor}
        borderColor={colors.borderColor}
      />

      {/* 2. Recherche d'événement */}
      <ActionCard
        badgeBg={colors.searchBg}
        iconColor={colors.searchIcon}
        iconFamily="Ionicons"
        iconName="search"
        onPress={handleSearchPress}
        subtitle="Uniquement pour vous"
        title="Recherche d'événement"
        cardBg={colors.cardBg}
        titleColor={colors.titleColor}
        subtitleColor={colors.subtitleColor}
        borderColor={colors.borderColor}
      />

      {/* 3. Combiné du jour */}
      <ActionCard
        badgeBg={colors.combineBg}
        iconColor={colors.combineIcon}
        iconFamily="Ionicons"
        iconName="layers-outline"
        onPress={handleCombinePress}
        subtitle="Meilleures offres du jour"
        title="Combiné du jour"
        cardBg={colors.cardBg}
        titleColor={colors.titleColor}
        subtitleColor={colors.subtitleColor}
        borderColor={colors.borderColor}
      />

      {/* 4. Créer un coupon de pari */}
      <ActionCard
        badgeBg={colors.createBg}
        iconColor={colors.createIcon}
        iconFamily="Feather"
        iconName="sliders"
        onPress={handleCreatePress}
        subtitle="Générez votre coupon de pari"
        title="Créer un coupon de pari"
        cardBg={colors.cardBg}
        titleColor={colors.titleColor}
        subtitleColor={colors.subtitleColor}
        borderColor={colors.borderColor}
      />

      {/* 5. Charger le coupon de pari */}
      <ActionCard
        badgeBg={colors.loadBg}
        iconColor={colors.loadIcon}
        iconFamily="Feather"
        iconName="upload"
        onPress={handleLoadPress}
        subtitle="Chargez votre coupon de pari"
        title="Charger le coupon de pari"
        cardBg={colors.cardBg}
        titleColor={colors.titleColor}
        subtitleColor={colors.subtitleColor}
        borderColor={colors.borderColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    // Ombre légère
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22, // Cercles parfaits
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default EmptyCouponActions;
