import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Typography } from '../theme/theme';
import { useResponsive } from '../utils/responsive';

export interface MatchScoreProps {
  homeTeamName: string;
  homeTeamLogo?: string | ImageSourcePropType;
  awayTeamName: string;
  awayTeamLogo?: string | ImageSourcePropType;
  mainScore: string; // Ex: "8:8" ou "1 : 1"
  detailedScore?: string; // Ex: "8:8 (5:6, 3:2)" ou "(0:0, 1:1)"
  textColor?: string;
  detailedScoreColor?: string;
}

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
  const { isSmallDevice, isTablet, font, moderateScale, scale } = useResponsive();

  const logoSize = isSmallDevice ? 24 : isTablet ? 32 : 28;
  const teamTextSize = font(13.5);
  const scoreTextSize = font(isSmallDevice ? 15 : isTablet ? 18 : 16);
  const detailedTextSize = font(isSmallDevice ? 10.5 : 11.5);
  const spacing = moderateScale(isSmallDevice ? 6 : 8);

  const homeSource: ImageSourcePropType = homeTeamLogo
    ? typeof homeTeamLogo === 'string'
      ? { uri: homeTeamLogo }
      : homeTeamLogo
    : {
        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          homeTeamName || 'DOM'
        )}&background=2563EB&color=FFFFFF&size=128&bold=true&rounded=true`,
      };

  const awaySource: ImageSourcePropType = awayTeamLogo
    ? typeof awayTeamLogo === 'string'
      ? { uri: awayTeamLogo }
      : awayTeamLogo
    : {
        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          awayTeamName || 'EXT'
        )}&background=EA580C&color=FFFFFF&size=128&bold=true&rounded=true`,
      };

  return (
    <View style={styles.container}>
      {/* LIGNE PRINCIPALE : NOMS, LOGOS ET SCORE AU CENTRE */}
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
          <Image
            source={homeSource}
            style={[styles.teamLogo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
        </View>

        {/* Score Principal Centré (Entre les 2 logos) */}
        <View
          style={[
            styles.scoreBox,
            {
              minWidth: moderateScale(isSmallDevice ? 46 : 54),
              paddingHorizontal: moderateScale(6),
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
          <Image
            source={awaySource}
            style={[styles.teamLogo, { width: logoSize, height: logoSize }]}
            resizeMode="contain"
          />
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

      {/* LIGNE SECONDAIRE : SCORE DÉTAILLÉ EN DESSOUS */}
      {detailedScore ? (
        <View style={styles.detailedScoreRow}>
          <Text
            style={[
              styles.detailedScoreText,
              { fontSize: detailedTextSize },
              detailedScoreColor ? { color: detailedScoreColor } : null,
            ]}
          >
            {detailedScore}
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
    marginVertical: 4,
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
  teamLogo: {
    width: 28,
    height: 28,
  },
  teamNameText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
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
    minWidth: 54,
    backgroundColor: 'transparent',
  },
  mainScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  detailedScoreRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    width: '100%',
  },
  detailedScoreText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
});

export default MatchScoreView;
