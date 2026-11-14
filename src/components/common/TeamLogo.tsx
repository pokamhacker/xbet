import React, { useState, useEffect, useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Text as SvgText } from 'react-native-svg';
import { resolveTeamLogo } from '../../data/sportsCatalog';
import {
  isNationalTeamEntity,
  resolveNationalTeamFallbackFlag,
  resolveNationalTeamFlag,
} from '../../data/nationalTeams';
import { NationalTeamLogo3D } from './NationalTeamLogo3D';

interface TeamLogoProps {
  teamName: string;
  logoUrl?: string;
  size?: number; // Défaut : 36px
  leagueName?: string;
  isNationalTeam?: boolean;
}

const SHIELD_PALETTES: Array<{ primary: string; secondary: string; accent: string }> = [
  { primary: '#1E3A8A', secondary: '#1D4ED8', accent: '#FBBF24' },
  { primary: '#991B1B', secondary: '#DC2626', accent: '#FDE047' },
  { primary: '#065F46', secondary: '#059669', accent: '#FCD34D' },
  { primary: '#0F172A', secondary: '#334155', accent: '#38BDF8' },
  { primary: '#5B21B6', secondary: '#7C3AED', accent: '#FDE047' },
  { primary: '#9A3412', secondary: '#EA580C', accent: '#FEF08A' },
  { primary: '#115E59', secondary: '#0D9488', accent: '#FDE68A' },
  { primary: '#831843', secondary: '#DB2777', accent: '#FBCFE8' },
];

function getPaletteForTeam(name: string) {
  const clean = (name || 'FC').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return SHIELD_PALETTES[hash % SHIELD_PALETTES.length];
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  teamName,
  logoUrl,
  size = 36,
  leagueName,
  isNationalTeam,
}) => {
  const [failedStage, setFailedStage] = useState<number>(0);

  const isNational = useMemo(() => {
    if (typeof isNationalTeam === 'boolean') return isNationalTeam;
    return isNationalTeamEntity(teamName, leagueName, logoUrl);
  }, [isNationalTeam, teamName, leagueName, logoUrl]);

  useEffect(() => {
    setFailedStage(0);
  }, [logoUrl, teamName, leagueName, isNational]);

  const candidateLogos = useMemo(() => {
    const list: string[] = [];
    if (isNational) {
      const nationalFlag = resolveNationalTeamFlag(teamName);
      if (nationalFlag) {
        list.push(nationalFlag);
      }
    }

    const catalogLogo = resolveTeamLogo(teamName);
    if (catalogLogo && !catalogLogo.includes('ui-avatars.com') && !list.includes(catalogLogo)) {
      list.push(catalogLogo);
    }

    if (
      logoUrl &&
      (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) &&
      !logoUrl.includes('ui-avatars.com') &&
      !list.includes(logoUrl)
    ) {
      list.push(logoUrl);
    }

    if (isNational) {
      const fallbackFlag =
        resolveNationalTeamFallbackFlag(teamName) ||
        resolveNationalTeamFallbackFlag(logoUrl);
      if (fallbackFlag && !list.includes(fallbackFlag)) {
        list.push(fallbackFlag);
      }
    }

    return list;
  }, [logoUrl, teamName, isNational]);

  const activeLogo = failedStage < candidateLogos.length ? candidateLogos[failedStage] : null;

  // Générateur d'initiales à 2-3 lettres (ex: "Real Madrid" -> "RM", "FC Barcelona" -> "FCB")
  const getInitials = (name: string) => {
    if (!name) return 'FC';
    const cleanName = name
      .replace(/\(F\)/gi, '')
      .replace(/\b(FC|AC|SC|AS|CD|US|RB|CF|SK|FK|UD|CA|RC|RCD|SSC|VfL|VfB|1\.)\b/gi, '')
      .trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (cleanName || name).slice(0, 2).toUpperCase();
  };

  const palette = useMemo(() => getPaletteForTeam(teamName), [teamName]);
  const gradId = useMemo(
    () => `shieldGrad_${(teamName || 'fc').replace(/[^a-zA-Z0-9]/g, '')}`,
    [teamName]
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      {activeLogo ? (
        isNational ? (
          <NationalTeamLogo3D
            source={{ uri: activeLogo }}
            size={size}
            onError={() => setFailedStage((prev) => prev + 1)}
          />
        ) : (
          <Image
            source={{ uri: activeLogo }}
            style={{
              width: size,
              height: size,
            }}
            resizeMode="contain"
            onError={() => setFailedStage((prev) => prev + 1)}
          />
        )
      ) : (
        <Svg width={size} height={size} viewBox="0 0 36 36">
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={palette.secondary} />
              <Stop offset="100%" stopColor={palette.primary} />
            </LinearGradient>
          </Defs>
          {/* Écusson extérieur avec bordure dorée/métallique */}
          <Path
            d="M18 2 L31.5 6.8 V17.8 C31.5 26.2 25.6 32.1 18 34.5 C10.4 32.1 4.5 26.2 4.5 17.8 V6.8 L18 2 Z"
            fill={`url(#${gradId})`}
            stroke={palette.accent}
            strokeWidth="1.6"
          />
          {/* Moitié droite subtilement ombrée pour relief d'écusson officiel */}
          <Path
            d="M18 3.2 L30.1 7.6 V17.6 C30.1 25.1 24.8 30.5 18 32.8 V3.2 Z"
            fill="rgba(0,0,0,0.16)"
          />
          {/* Liseré intérieur d'écusson */}
          <Path
            d="M18 4.4 L28.8 8.3 V17.5 C28.8 24.3 24 29.3 18 31.4 C12 29.3 7.2 24.3 7.2 17.5 V8.3 L18 4.4 Z"
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="0.8"
          />
          {/* Initiales du club au centre du blason */}
          <SvgText
            x="18"
            y="22.2"
            fill="#FFFFFF"
            fontSize="11.5"
            fontWeight="800"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            {getInitials(teamName)}
          </SvgText>
        </Svg>
      )}
    </View>
  );
};

export default TeamLogo;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
