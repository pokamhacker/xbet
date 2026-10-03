import React, { useState, useMemo } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../stores/themeStore';
import { resolveTeamLogo } from '../../data/sportsCatalog';

interface TeamLogoProps {
  teamName: string;
  logoUrl?: string;
  size?: number; // Défaut : 36px
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  logoUrl,
  size = 36,
}) => {
  const { currentTheme } = useThemeStore();
  const [hasError, setHasError] = useState(false);

  // Logo effectif : utilise logoUrl fourni, sinon tente la résolution automatique via API-Football
  const activeLogo = useMemo(() => {
    if (logoUrl && !hasError) return logoUrl;
    if (!hasError) {
      const resolved = resolveTeamLogo(teamName);
      if (resolved) return resolved;
    }
    return null;
  }, [logoUrl, teamName, hasError]);

  // Générateur d'initiales à 2 lettres (ex: "Real Madrid" -> "RM", "Cotonsport" -> "CS")
  const getInitials = (name: string) => {
    if (!name) return 'FC';
    const cleanName = name.replace(/(FC|AC|SC|AS|CD|US|RB|CF)\s+/gi, '').trim();
    const parts = cleanName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
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
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) / 2,
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
                fontSize: size * 0.38,
                color: textColor,
              },
            ]}
          >
            {getInitials(teamName)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default TeamLogo;

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
