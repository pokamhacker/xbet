import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  G,
  Path,
  Circle,
  Ellipse,
} from 'react-native-svg';
import { useThemeStore } from '../../stores/themeStore';
import { Typography } from '../../theme/theme';

// ============================================================================
// ICÔNES DES CARTES DE POKER EN 3D GLOSSY (style Apple Emoji bombé & brillant)
// ============================================================================

export type PokerSuit = 'heart' | 'diamond' | 'spade' | 'club';

export const getSuitFromChar = (char: string): PokerSuit | null => {
  const c = char.replace(/\uFE0F/g, '');
  if (c === '♥' || c === '♡') return 'heart';
  if (c === '♦' || c === '♢') return 'diamond';
  if (c === '♠' || c === '♤') return 'spade';
  if (c === '♣' || c === '♧') return 'club';
  return null;
};

/** Dégradé vertical 3D rouge brillant (#FF6B63 -> #E6251E -> #9E0B09) */
const RED_STOPS = ['#FF6B63', '#E6251E', '#9E0B09'];

/** Dégradé vertical 3D noir/anthracite brillant (#63686E -> #26292C -> #0B0C0E) */
const BLACK_STOPS = ['#63686E', '#26292C', '#0B0C0E'];

const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

const DIAMOND_PATH =
  'M12 1.8 C13.8 6 18 10.2 22.2 12 C18 13.8 13.8 18 12 22.2 C10.2 18 6 13.8 1.8 12 C6 10.2 10.2 6 12 1.8 Z';

const SPADE_PATH =
  'M12 2 C8.8 6.5 3.5 9.8 3.5 14.5 C3.5 17.3 5.7 18.8 8.2 18.8 C9.8 18.8 11.2 18.1 12 17.1 C11.7 19 10.8 20.6 9 22 L15 22 C13.2 20.6 12.3 19 12 17.1 C12.8 18.1 14.2 18.8 15.8 18.8 C18.3 18.8 20.5 17.3 20.5 14.5 C20.5 9.8 15.2 6.5 12 2 Z';

const CLUB_STEM_PATH =
  'M10.8 13 H13.2 C13.4 16.5 14.5 19.3 16.5 22 H7.5 C9.5 19.3 10.6 16.5 10.8 13 Z';

let suitInstanceCounter = 0;

interface SuitShapeProps {
  suit: PokerSuit;
  fill: string;
  dy?: number;
}

const SuitShape: React.FC<SuitShapeProps> = ({ suit, fill, dy = 0 }) => {
  const transform = dy ? `translate(0 ${dy})` : undefined;

  if (suit === 'club') {
    return (
      <G transform={transform}>
        <Circle cx={12} cy={7.2} r={4.3} fill={fill} />
        <Circle cx={7.2} cy={12.9} r={4.3} fill={fill} />
        <Circle cx={16.8} cy={12.9} r={4.3} fill={fill} />
        <Circle cx={12} cy={11.4} r={2.5} fill={fill} />
        <Path d={CLUB_STEM_PATH} fill={fill} />
      </G>
    );
  }

  const d =
    suit === 'heart' ? HEART_PATH : suit === 'diamond' ? DIAMOND_PATH : SPADE_PATH;

  return <Path d={d} fill={fill} transform={transform} />;
};

export interface PokerSuit3DIconProps {
  suit: PokerSuit;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Composant SVG PokerSuit3DIcon (taille par défaut: 18.5)
 * Rendu 3D bombé glossy avec dégradé vertical et reflets blancs translucides.
 */
export const PokerSuit3DIcon: React.FC<PokerSuit3DIconProps> = React.memo(
  ({ suit, size = 18.5, style }) => {
    const uidRef = React.useRef<string>('');
    if (!uidRef.current) {
      suitInstanceCounter += 1;
      uidRef.current = `p3d-${suitInstanceCounter}`;
    }
    const uid = uidRef.current;

    const isRed = suit === 'heart' || suit === 'diamond';
    const stops = isRed ? RED_STOPS : BLACK_STOPS;

    const bodyGradId = `${uid}-body`;
    const glossGradId = `${uid}-gloss`;
    const clipId = `${uid}-clip`;

    return (
      <View
        style={[
          styles.iconContainer,
          { width: size, height: size },
          style,
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Defs>
            {/* Dégradé vertical 3D */}
            <LinearGradient
              id={bodyGradId}
              x1="0"
              y1="2"
              x2="0"
              y2="22"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={stops[0]} />
              <Stop offset="0.5" stopColor={stops[1]} />
              <Stop offset="1" stopColor={stops[2]} />
            </LinearGradient>

            {/* Reflet supérieur blanc translucide */}
            <LinearGradient
              id={glossGradId}
              x1="0"
              y1="2"
              x2="0"
              y2="13"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isRed ? 0.55 : 0.6} />
              <Stop offset="0.65" stopColor="#FFFFFF" stopOpacity={0.18} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>

            {/* Masque de découpe calqué sur la silhouette du symbole */}
            <ClipPath id={clipId}>
              <SuitShape suit={suit} fill="#000000" />
            </ClipPath>
          </Defs>

          {/* 1. Ombre portée douce */}
          <G opacity={0.28}>
            <SuitShape suit={suit} fill="#000000" dy={1.2} />
          </G>

          {/* 2. Corps 3D en dégradé vertical */}
          <SuitShape suit={suit} fill={`url(#${bodyGradId})`} />

          {/* 3. Reflet supérieur blanc translucide (effet bombé brillant) */}
          <G clipPath={`url(#${clipId})`}>
            <Ellipse
              cx={12}
              cy={6.8}
              rx={8.8}
              ry={5.4}
              fill={`url(#${glossGradId})`}
            />
            {/* Point de brillance spéculaire */}
            <Ellipse
              cx={8.6}
              cy={6.2}
              rx={1.8}
              ry={1.05}
              fill="#FFFFFF"
              opacity={isRed ? 0.55 : 0.45}
              transform="rotate(-28 8.6 6.2)"
            />
          </G>
        </Svg>
      </View>
    );
  }
);

// ============================================================================
// PARSEUR ET COMPOSANT PokerFormattedLine
// Découpe automatiquement les chaînes contenant (♥️?|♠️?|♦️?|♣️?)
// Typographie : centrée, fontSize: 16, fontWeight: '400', couleur thème (#93A7BC)
// ============================================================================

const SUIT_REGEX = /([♥♡♦♢♠♤♣♧]\uFE0F?)/g;

export interface PokerFormattedLineProps {
  /** Préfixe optionnel (ex: 'Main 1: ', 'Table : ', 'Gagnant : ') */
  label?: string;
  /** Texte contenant les cartes ou pronostics (ex: 'K♥️,3♥️') */
  text?: string;
  /** Contenu JSX enfant alternatif */
  children?: React.ReactNode;
  iconSize?: number;
  color?: string;
  labelColor?: string;
  textStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export const PokerFormattedLine: React.FC<PokerFormattedLineProps> = ({
  label,
  text,
  children,
  iconSize = 18.5,
  color,
  labelColor,
  textStyle,
  labelStyle,
  style,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = Boolean(currentTheme?.isDark);

  const resolvedColor =
    color ||
    (isDark
      ? '#93A7BC'
      : currentTheme?.colors?.textSecondary ||
        currentTheme?.textSecondary ||
        '#6E849B');

  const resolvedLabelColor = labelColor || resolvedColor;

  // Récupération de la chaîne brute
  let rawContent = text !== undefined ? String(text) : '';
  if (!rawContent && typeof children === 'string') {
    rawContent = children;
  }

  // Si aucun label explicite n'a été fourni mais que rawContent commence par un label
  let effectiveLabel = label;
  let bodyContent = rawContent;

  if (effectiveLabel === undefined) {
    const match = rawContent.match(/^((?:Main\s+\d+|Table|Gagnant)\s*:\s*)(.*)$/i);
    if (match) {
      effectiveLabel = match[1];
      bodyContent = match[2];
    }
  }

  const parts = bodyContent.split(SUIT_REGEX).filter((p) => p !== '');

  return (
    <View style={[styles.lineContainer, style]}>
      {Boolean(effectiveLabel) && (
        <Text
          style={[
            styles.text,
            { color: resolvedLabelColor },
            textStyle,
            labelStyle,
          ]}
        >
          {effectiveLabel}
        </Text>
      )}

      {parts.map((part, idx) => {
        const suit = getSuitFromChar(part);
        if (suit) {
          return (
            <PokerSuit3DIcon
              key={`suit-${idx}`}
              suit={suit}
              size={iconSize}
              style={styles.suitWrap}
            />
          );
        }

        return (
          <Text
            key={`txt-${idx}`}
            style={[styles.text, { color: resolvedColor }, textStyle]}
          >
            {part}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  suitWrap: {
    marginHorizontal: 0.8,
  },
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
});

export default PokerSuit3DIcon;

