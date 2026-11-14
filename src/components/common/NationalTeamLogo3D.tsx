import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';

export interface NationalTeamLogo3DProps {
  source: ImageSourcePropType;
  size?: number;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
}

/**
 * Rendu sphérique 3D glossy avec reflet supérieur blanc et lueur circulaire blanche
 * pour les drapeaux de sélections nationales.
 * Garanti 100 % sans noir (#000000) ni référence url(#id) susceptible d'afficher un fallback SVG noir sur iOS/WebKit.
 */
export const NationalTeamLogo3D: React.FC<NationalTeamLogo3DProps> = ({
  source,
  size = 36,
  style,
  onError,
}) => {
  const radius = size / 2;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          width: size,
          height: size,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.innerClip,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: radius }}
          resizeMode="cover"
          onError={onError}
        />

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            style={StyleSheet.absoluteFill}
          >
            {/* 1. Dôme de brillance blanc supérieur progressif (Top Glossy Highlight) */}
            <Ellipse
              cx="50"
              cy="25"
              rx="37"
              ry="21"
              fill="rgba(255, 255, 255, 0.12)"
            />
            <Ellipse
              cx="50"
              cy="22"
              rx="34"
              ry="18"
              fill="rgba(255, 255, 255, 0.15)"
            />
            <Ellipse
              cx="50"
              cy="19"
              rx="30"
              ry="14.5"
              fill="rgba(255, 255, 255, 0.18)"
            />
            <Ellipse
              cx="50"
              cy="16"
              rx="25"
              ry="11"
              fill="rgba(255, 255, 255, 0.22)"
            />
            <Ellipse
              cx="50"
              cy="13"
              rx="19"
              ry="7.5"
              fill="rgba(255, 255, 255, 0.24)"
            />

            {/* 2. Lueur circulaire blanche inférieure progressive (Bottom White Bounce Glow) */}
            <Ellipse
              cx="50"
              cy="84"
              rx="31"
              ry="12"
              fill="rgba(255, 255, 255, 0.14)"
            />
            <Ellipse
              cx="50"
              cy="87"
              rx="26"
              ry="9"
              fill="rgba(255, 255, 255, 0.18)"
            />
            <Ellipse
              cx="50"
              cy="90"
              rx="20"
              ry="6"
              fill="rgba(255, 255, 255, 0.24)"
            />

            {/* 3. Anneau de finition interne blanc vitré (Inner Rim) */}
            <Circle
              cx="50"
              cy="50"
              r="49"
              fill="none"
              stroke="rgba(255, 255, 255, 0.42)"
              strokeWidth="1.6"
            />
            <Circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke="rgba(255, 255, 255, 0.16)"
              strokeWidth="1"
            />
          </Svg>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerClip: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
});

export default NationalTeamLogo3D;
