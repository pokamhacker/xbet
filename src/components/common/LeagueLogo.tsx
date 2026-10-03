import React, { useState, useMemo } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../stores/themeStore';
import { resolveCompetitionLogo } from '../../data/sportsCatalog';

interface LeagueLogoProps {
  leagueName: string;
  logoUrl?: string;
  size?: number; // Défaut : 28px
}

export const LeagueLogo: React.FC<LeagueLogoProps> = ({
  leagueName,
  logoUrl,
  size = 28,
}) => {
  const { currentTheme } = useThemeStore();
  const [hasError, setHasError] = useState(false);

  // Détermination du logo effectif (fourni ou résolu via le catalogue API-Football)
  const activeLogo = useMemo(() => {
    if (logoUrl && !hasError) return logoUrl;
    if (!hasError) {
      const resolved = resolveCompetitionLogo(leagueName);
      if (resolved) return resolved;
    }
    return null;
  }, [logoUrl, leagueName, hasError]);

  // Initiales courtes pour le championnat
  const getInitials = (name: string) => {
    if (!name) return 'LG';
    const clean = name.replace(/(FIFA|UEFA|CAF|CONCACAF|CONMEBOL)\s*[\.\-·:]\s*/gi, '').trim();
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const isDark = currentTheme?.name === 'melbet' || currentTheme?.isDark;
  const badgeBg = isDark ? '#2D3742' : '#E2E8F0';
  const textColor = isDark ? (currentTheme?.colors?.primary || '#F49C00') : '#1E293B';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {activeLogo ? (
        <Image
          source={{ uri: activeLogo }}
          style={{
            width: size - 2,
            height: size - 2,
            borderRadius: (size - 2) / 2,
          }}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <View
          style={[
            styles.fallbackBadge,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: badgeBg,
            },
          ]}
        >
          <Text
            style={[
              styles.initialsText,
              {
                fontSize: size * 0.36,
                color: textColor,
              },
            ]}
          >
            {getInitials(leagueName)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default LeagueLogo;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fallbackBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  initialsText: {
    fontWeight: '800',
  },
});
