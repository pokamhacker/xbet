/** Dessins vectoriels du jeu (avion, réticule, badges, eau, icônes). */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, Image } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient as SvgLinear,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { isReducedMotion } from '../game/motion';
import { COLORS, FONTS } from '../theme';

/* ------------------------------------------------------------------ Avion */

/**
 * Chasseur Kamikaze authentique 1xBet : biplan japonais vu de dessus avec cocardes rouges Hinomaru,
 * camouflage ocre/sable, hélice et fuselage d'origine.
 */
export function PlaneArt({ width, height }: { width: number; height: number }) {
  return (
    <Image
      source={require('../assets/kamikaze_plane.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}

/* --------------------------------------------------------------- Réticule */

export function ReticleArt({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="14" fill="none" stroke="#ffffff" strokeWidth={2.6} />
      <Circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.14)" stroke="#ffffff" strokeWidth={2} />
      <Path d="M20 2v8M20 30v8M2 20h8M30 20h8" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx="20" cy="20" r="1.8" fill="#ffffff" />
    </Svg>
  );
}

/** Ligne pointillée de visée (horizontale ou verticale). */
export function DashedLine({ length, vertical = false }: { length: number; vertical?: boolean }) {
  const w = vertical ? 2 : length;
  const h = vertical ? length : 2;
  return (
    <Svg width={w} height={h}>
      <Line
        x1={vertical ? 1 : 0}
        y1={vertical ? 0 : 1}
        x2={vertical ? 1 : length}
        y2={vertical ? length : 1}
        stroke="#ffffff"
        strokeOpacity={0.92}
        strokeWidth={2}
        strokeDasharray="6 4"
      />
    </Svg>
  );
}

/* ------------------------------------------------- Badge de multiplicateur */

/** Pentagone biseauté : bordure métallique, reflet en haut ; la ligne active s'allume (halo + cœur cyan). */
export function Badge({ label, active, width, height }: { label: string; active: boolean; width: number; height: number }) {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={width} height={height} viewBox="0 0 100 88" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinear id="badgeFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#173a57" />
            <Stop offset="1" stopColor="#071624" />
          </SvgLinear>
          <RadialGradient id="badgeGlow" cx="50%" cy="45%" r="60%">
            <Stop offset="0" stopColor="#38b3e4" />
            <Stop offset="0.55" stopColor="#11527a" />
            <Stop offset="1" stopColor="#082339" />
          </RadialGradient>
          <SvgLinear id="badgeRim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#d6e7f1" />
            <Stop offset="1" stopColor="#557489" />
          </SvgLinear>
          <SvgLinear id="badgeRimOn" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#f2fdff" />
            <Stop offset="1" stopColor="#3cbfe9" />
          </SvgLinear>
        </Defs>
        {active && <Polygon points="15,0 85,0 100,44 50,88 0,44" fill="#3cc6ff" opacity={0.3} />}
        <Polygon points="22,7 78,7 94,46 50,86 6,46" fill="#000000" opacity={0.45} />
        <Polygon
          points="22,5 78,5 94,44 50,84 6,44"
          fill={active ? 'url(#badgeGlow)' : 'url(#badgeFill)'}
          stroke={active ? 'url(#badgeRimOn)' : 'url(#badgeRim)'}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <Polygon points="26,10 74,10 89,43 50,79 11,43" fill="none" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={1.2} strokeLinejoin="round" />
        <Polygon points="25,8 75,8 83,26 17,26" fill="#ffffff" opacity={active ? 0.1 : 0.06} />
      </Svg>
      <Text style={[styles.badgeText, active && styles.badgeTextOn, { fontSize: Math.max(12, height * 0.35), marginBottom: 3 }]}>{label}</Text>
    </View>
  );
}

/* ---------------------------------------------- Reflets de l'eau (animés) */

const blobs = (() => {
  // positions fixes et répétables dans une tuile de 1×1
  let s = 11;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: 9 }, () => ({ x: r(), y: r(), rx: 0.12 + r() * 0.18, ry: 0.05 + r() * 0.08, o: 0.1 + r() * 0.12 }));
})();

export function WaterCaustics({ size }: { size: number }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isReducedMotion()) return;
    const loop = Animated.loop(
      Animated.timing(drift, { toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -size] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -size / 2] });

  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', transform: [{ translateX }, { translateY }] }}>
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          <RadialGradient id="caustic" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#bfeaff" stopOpacity={1} />
            <Stop offset="1" stopColor="#bfeaff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {[0, 1].map(tx =>
          [0, 1].map(ty => (
            <G key={`${tx}${ty}`}>
              {blobs.map((b, i) => (
                <Ellipse
                  key={i}
                  cx={(tx + b.x) * size}
                  cy={(ty + b.y) * size}
                  rx={b.rx * size}
                  ry={b.ry * size}
                  fill="url(#caustic)"
                  opacity={b.o}
                />
              ))}
            </G>
          )),
        )}
      </Svg>
    </Animated.View>
  );
}

/* ------------------------------------------------------------- Icônes UI */

/** Flèche de retour fine, comme dans la barre blanche des captures. */
export function BackIcon({ size = 26, color = '#dfe8ee' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 12H4.5M11 5.5L4.5 12l6.5 6.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function SoundIcon({ on, size = 22, color = '#dfe8ee' }: { on: boolean; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill={color} />
      {on ? (
        <Path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      ) : (
        <Path d="M15 9.5l5 5M20 9.5l-5 5" stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
    </Svg>
  );
}

export function DollarIcon({ size = 30 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 32 32" style={StyleSheet.absoluteFill}>
        <Circle cx="16" cy="16" r="14" fill="#e8eeee" />
        <Circle cx="16" cy="16" r="11" fill="none" stroke="#1a4448" strokeWidth={1.6} />
      </Svg>
      <Text style={{ color: '#1a4448', fontFamily: FONTS.bold, fontSize: size * 0.52, lineHeight: size * 0.62 }}>$</Text>
    </View>
  );
}

export function RepeatIcon({ size = 30 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path
        d="M6 14V11a5 5 0 0 1 5-5h14M25 6l-4-4M25 6l-4 4M26 18v3a5 5 0 0 1-5 5H7M7 26l4 4M7 26l4-4"
        stroke="#ffffff"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function Chevron({ size = 10 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Path d="M1.5 3l3.5 3.5L8.5 3" stroke="#ffffff" strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Disque à dégradé radial, utilisé par les explosions. */
export function RadialBlob({ size, id, stops }: { size: number; id: string; stops: ReadonlyArray<[number, string, number]> }) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          {stops.map(([offset, color, opacity]) => (
            <Stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
          ))}
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  badgeText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeTextOn: { textShadowColor: 'rgba(60,198,255,0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
});
