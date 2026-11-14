import React, { useId } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Ellipse,
} from 'react-native-svg';

export interface NationalTeamLogo3DProps {
  source: ImageSourcePropType;
  size?: number;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
}

/**
 * Rendu sphérique 3D glossy avec ombre circulaire blanche pour les drapeaux
 * de sélections nationales (compatible clair/sombre et toute taille).
 */
export const NationalTeamLogo3D: React.FC<NationalTeamLogo3DProps> = ({
  source,
  size = 36,
  style,
  onError,
}) => {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, '');
  const vignetteGradId = `nt-vignette-${uid}`;
  const topGlossGradId = `nt-top-gloss-${uid}`;
  const bottomGlowGradId = `nt-bottom-glow-${uid}`;

  const radius = size / 2;

  return (
    <View
      style={[
        styles.outerShadow,
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
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={onError}
        />

        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              {/* 1. Vignettage / Profondeur sphérique */}
              <RadialGradient id={vignetteGradId} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="68%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="85%" stopColor="#000000" stopOpacity="0.22" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
              </RadialGradient>

              {/* 2. Dôme de brillance blanc supérieur (Top Glossy Highlight) */}
              <LinearGradient id={topGlossGradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
                <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.28" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </LinearGradient>

              {/* 3. Ombre / Lueur circulaire blanche inférieure (Bottom White Bounce Glow) */}
              <LinearGradient id={bottomGlowGradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.0" />
                <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.65" />
              </LinearGradient>
            </Defs>

            {/* Calque 1 : Vignettage sphérique */}
            <Circle cx="50" cy="50" r="50" fill={`url(#${vignetteGradId})`} />

            {/* Calque 2 : Dôme de brillance supérieur */}
            <Ellipse cx="50" cy="24" rx="35" ry="20" fill={`url(#${topGlossGradId})`} />

            {/* Calque 3 : Lueur circulaire blanche inférieure */}
            <Ellipse cx="50" cy="84" rx="30" ry="12" fill={`url(#${bottomGlowGradId})`} />

            {/* Calque 4 : Anneau de finition interne */}
            <Circle
              cx="50"
              cy="50"
              r="49"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
            />
          </Svg>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.38,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerClip: {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E242B',
  },
});

export default NationalTeamLogo3D;
