import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import Svg, { Path, Rect, Circle, ClipPath, Defs, G } from 'react-native-svg';
import { Typography } from '../theme/theme';
import { useResponsive } from '../utils/responsive';

export interface MatchScoreProps {
  homeTeamName: string;
  homeTeamLogo?: string | ImageSourcePropType;
  awayTeamName: string;
  awayTeamLogo?: string | ImageSourcePropType;
  mainScore: string; // Ex: "3 : 1" ou "1 : 0"
  detailedScore?: string; // Ex: "1:0 (0:0,1:0)" ou "3:1 (3:1)"
  textColor?: string;
  detailedScoreColor?: string;
}

/**
 * Mini-drapeau national affiché en bas à droite d'un maillot (ex: DE, ES, IT, FR, GB)
 */
const MiniFlagBadge: React.FC<{ countryCode?: string }> = ({ countryCode = 'DE' }) => {
  const code = countryCode.toUpperCase();
  if (code === 'ES') {
    return (
      <View style={styles.miniFlagWrap}>
        <Svg width={13} height={9} viewBox="0 0 13 9">
          <Rect x="0" y="0" width="13" height="2.25" fill="#AA151B" />
          <Rect x="0" y="2.25" width="13" height="4.5" fill="#F1BF00" />
          <Rect x="0" y="6.75" width="13" height="2.25" fill="#AA151B" />
        </Svg>
      </View>
    );
  }
  if (code === 'IT') {
    return (
      <View style={styles.miniFlagWrap}>
        <Svg width={13} height={9} viewBox="0 0 13 9">
          <Rect x="0" y="0" width="4.33" height="9" fill="#009246" />
          <Rect x="4.33" y="0" width="4.34" height="9" fill="#FFFFFF" />
          <Rect x="8.67" y="0" width="4.33" height="9" fill="#CE2B37" />
        </Svg>
      </View>
    );
  }
  if (code === 'FR') {
    return (
      <View style={styles.miniFlagWrap}>
        <Svg width={13} height={9} viewBox="0 0 13 9">
          <Rect x="0" y="0" width="4.33" height="9" fill="#002395" />
          <Rect x="4.33" y="0" width="4.34" height="9" fill="#FFFFFF" />
          <Rect x="8.67" y="0" width="4.33" height="9" fill="#ED2939" />
        </Svg>
      </View>
    );
  }
  // Défaut : Allemagne (DE) — Noir / Rouge / Or comme sur la référence Bundesliga
  return (
    <View style={styles.miniFlagWrap}>
      <Svg width={13} height={9} viewBox="0 0 13 9">
        <Rect x="0" y="0" width="13" height="3" fill="#111111" />
        <Rect x="0" y="3" width="13" height="3" fill="#DD0000" />
        <Rect x="0" y="6" width="13" height="3" fill="#FFCE00" />
      </Svg>
    </View>
  );
};

/**
 * Rendu SVG 40x40 d'un maillot de club avec mini-drapeau en bas à droite
 * Format descripteur : "jersey:stripes:#111111:#DC2626:DE" ou "jersey:solid:#FFFFFF:#CBD5E1:DE"
 */
const JerseyWithFlagIcon: React.FC<{ descriptor: string; size: number }> = ({ descriptor, size }) => {
  const parts = descriptor.split(':');
  const pattern = parts[1] || 'solid';
  const primary = parts[2] || '#FFFFFF';
  const secondary = parts[3] || '#DC2626';
  const flag = parts[4] || 'DE';
  const clipId = `jerseyClip_${pattern}_${primary.replace('#', '')}`;

  const jerseyPath =
    'M13 5 L9 7 L3 13 L7 17 L10 14.5 L10 35 L30 35 L30 14.5 L33 17 L37 13 L31 7 L27 5 C25.5 7.5 22.8 8.5 20 8.5 C17.2 8.5 14.5 7.5 13 5 Z';

  return (
    <View style={[styles.logoBox, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <ClipPath id={clipId}>
            <Path d={jerseyPath} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          <Rect x="0" y="0" width="40" height="40" fill={primary} />
          {pattern === 'stripes' && (
            <>
              <Rect x="11" y="4" width="3" height="32" fill={secondary} />
              <Rect x="17" y="4" width="3" height="32" fill={secondary} />
              <Rect x="23" y="4" width="3" height="32" fill={secondary} />
              <Rect x="29" y="4" width="2.5" height="32" fill={secondary} />
              <Rect x="14" y="4" width="1.2" height="32" fill="#FFFFFF" opacity={0.85} />
              <Rect x="20" y="4" width="1.2" height="32" fill="#FFFFFF" opacity={0.85} />
              <Rect x="26" y="4" width="1.2" height="32" fill="#FFFFFF" opacity={0.85} />
            </>
          )}
        </G>
        <Path
          d={jerseyPath}
          fill="none"
          stroke={pattern === 'solid' ? '#D1D5DB' : '#1F2937'}
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
        {/* Col du maillot */}
        <Path
          d="M13.5 5.4 C15.2 8 17.5 9 20 9 C22.5 9 24.8 8 26.5 5.4"
          fill="none"
          stroke={pattern === 'solid' ? '#374151' : '#FFFFFF'}
          strokeWidth={1.3}
        />
      </Svg>
      <MiniFlagBadge countryCode={flag} />
    </View>
  );
};

/**
 * Icône silhouette générique 40x40 (utilisée pour les équipes FIFA sans blason ou en fallback)
 */
const GenericPlayerCrest: React.FC<{ size: number }> = ({ size }) => (
  <View style={[styles.logoBox, { width: size, height: size }]}>
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {/* Silhouette joueur secondaire arrière */}
      <Circle cx="26" cy="14.5" r="5" fill="#CBD5E1" />
      <Path d="M19 31 C19 25.5 22.5 22 26.5 22 C30.5 22 34 25.5 34 31 Z" fill="#CBD5E1" />
      {/* Silhouette joueur principal avant */}
      <Circle cx="16.5" cy="13.5" r="6" fill="#94A3B8" />
      <Path d="M7.5 32.5 C7.5 25.5 11.5 21.5 16.5 21.5 C21.5 21.5 25.5 25.5 25.5 32.5 Z" fill="#94A3B8" />
    </Svg>
  </View>
);

const TeamLogoRenderer: React.FC<{
  logo?: string | ImageSourcePropType;
  teamName: string;
  size: number;
}> = ({ logo, size }) => {
  const [imgError, setImgError] = useState(false);

  if (typeof logo === 'string') {
    if (logo.startsWith('jersey:')) {
      return <JerseyWithFlagIcon descriptor={logo} size={size} />;
    }
    if (logo === 'generic-player' || logo.includes('ui-avatars.com') || imgError) {
      return <GenericPlayerCrest size={size} />;
    }
    return (
      <Image
        source={{ uri: logo }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }

  if (logo && !imgError) {
    return (
      <Image
        source={logo}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }

  return <GenericPlayerCrest size={size} />;
};

export const MatchScoreView: React.FC<MatchScoreProps> = ({
  homeTeamName,
  homeTeamLogo,
  awayTeamName,
  awayTeamLogo,
  mainScore,
  detailedScore,
  textColor,
  detailedScoreColor,
}) => {
  const { isSmallDevice, font, moderateScale } = useResponsive();

  const logoSize = 40;
  const teamTextSize = font(isSmallDevice ? 13 : 14);
  const scoreTextSize = 22;
  const detailedTextSize = font(12.5);
  const spacing = moderateScale(isSmallDevice ? 6 : 8);

  // Formatage normalisé du sous-score mi-temps : "1:0 (0:0,1:0)" ou "3:1 (3:1)"
  const formattedDetailedScore = React.useMemo(() => {
    if (!detailedScore) return undefined;
    const trimmed = detailedScore.trim();
    const compactMain = (mainScore || '').replace(/\s+/g, '');
    if (trimmed.startsWith('(') && compactMain && compactMain.toUpperCase() !== 'VS') {
      return `${compactMain} ${trimmed}`;
    }
    return trimmed;
  }, [detailedScore, mainScore]);

  return (
    <View style={styles.container}>
      {/* LIGNE PRINCIPALE : NOMS, LOGOS 40x40 ET SCORE 22px GRAS AU CENTRE */}
      <View style={styles.mainScoreRow}>
        {/* Équipe Domicile */}
        <View style={styles.homeTeamGroup}>
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.teamNameText,
              styles.homeTeamNameText,
              { fontSize: teamTextSize, marginRight: spacing },
              textColor ? { color: textColor } : null,
            ]}
          >
            {homeTeamName}
          </Text>
          <TeamLogoRenderer logo={homeTeamLogo} teamName={homeTeamName} size={logoSize} />
        </View>

        {/* Score Principal Centré (Entre les 2 logos) */}
        <View
          style={[
            styles.scoreBox,
            {
              minWidth: moderateScale(isSmallDevice ? 54 : 64),
              paddingHorizontal: moderateScale(8),
            },
          ]}
        >
          <Text
            style={[
              styles.mainScoreText,
              { fontSize: scoreTextSize },
              textColor ? { color: textColor } : null,
            ]}
          >
            {mainScore}
          </Text>
        </View>

        {/* Équipe Extérieure */}
        <View style={styles.awayTeamGroup}>
          <TeamLogoRenderer logo={awayTeamLogo} teamName={awayTeamName} size={logoSize} />
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={[
              styles.teamNameText,
              styles.awayTeamNameText,
              { fontSize: teamTextSize, marginLeft: spacing },
              textColor ? { color: textColor } : null,
            ]}
          >
            {awayTeamName}
          </Text>
        </View>
      </View>

      {/* LIGNE SECONDAIRE : SCORE DÉTAILLÉ DES MI-TEMPS EN GRIS EN DESSOUS */}
      {formattedDetailedScore ? (
        <View style={styles.detailedScoreRow}>
          <Text
            style={[
              styles.detailedScoreText,
              { fontSize: detailedTextSize },
              detailedScoreColor ? { color: detailedScoreColor } : null,
            ]}
          >
            {formattedDetailedScore}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    backgroundColor: 'transparent',
  },
  mainScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  homeTeamGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  awayTeamGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniFlagWrap: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 1.5,
    overflow: 'hidden',
    borderWidth: 0.6,
    borderColor: '#FFFFFF',
  },
  teamLogo: {
    width: 40,
    height: 40,
  },
  teamNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E242B',
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  homeTeamNameText: {
    textAlign: 'right',
  },
  awayTeamNameText: {
    textAlign: 'left',
  },
  scoreBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    minWidth: 64,
    backgroundColor: 'transparent',
  },
  mainScoreText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E242B',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  detailedScoreRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  detailedScoreText: {
    fontSize: 12.5,
    color: '#7F8C8D',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
});

export default MatchScoreView;
