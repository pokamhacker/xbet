import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  G,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Polygon,
  Rect,
} from 'react-native-svg';
import { CRASH_COLORS } from '../constants';
import { GamePhase } from '../types';

interface CrashCanvasProps {
  phase: GamePhase;
  countdownSeconds: number;
  multiplier: number;
  toastAccepted?: boolean;
  toastWinGain?: number | null;
  canvasWidth?: number;
  canvasHeight?: number;
}

export const CrashCanvas: React.FC<CrashCanvasProps> = ({
  phase,
  countdownSeconds,
  multiplier,
  toastAccepted,
  toastWinGain,
  canvasWidth: customWidth,
  canvasHeight: customHeight = 210,
}) => {
  const screenWidth = Dimensions.get('window').width;
  // Responsive : occupe toute la largeur disponible avec marges
  const width = customWidth || Math.max(280, Math.min(screenWidth - 24, 520));
  const height = customHeight;

  // Origine et échelle de la trajectoire
  const startX = 28;
  const startY = height - 28;
  const maxEndX = width - 42;
  const maxEndY = 36;

  // Calcul de la progression du vol [0, 1] basée sur le multiplicateur
  const flightProgress = useMemo(() => {
    if (phase === 'countdown') return 0;
    // Logarithmique pour que l'avion monte progressivement
    const p = Math.log(multiplier) / Math.log(12);
    return Math.min(Math.max(p, 0.03), 0.96);
  }, [multiplier, phase]);

  // Position (x, y) de l'avion le long d'une courbe quadratique de Bézier
  const { planeX, planeY, tangentAngle, curvePath } = useMemo(() => {
    const p0x = startX;
    const p0y = startY;

    // Point de contrôle P1 (adoucit la trajectoire avant montée)
    const p1x = startX + (maxEndX - startX) * 0.45;
    const p1y = startY - 12;

    const p2x = maxEndX;
    const p2y = maxEndY;

    const t = flightProgress;

    // B(t)
    const currentX = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
    const currentY = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

    // Dérivée B'(t) pour l'angle d'orientation de l'avion
    const dx = 2 * (1 - t) * (p1x - p0x) + 2 * t * (p2x - p1x);
    const dy = 2 * (1 - t) * (p1y - p0y) + 2 * t * (p2y - p1y);
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Trajectoire partielle de 0 à t
    const subP1x = p0x + t * (p1x - p0x);
    const subP1y = p0y + t * (p1y - p0y);
    const path = `M ${p0x} ${p0y} Q ${subP1x} ${subP1y} ${currentX} ${currentY}`;

    return {
      planeX: currentX,
      planeY: currentY,
      tangentAngle: angleDeg,
      curvePath: path,
    };
  }, [flightProgress, startX, startY, maxEndX, maxEndY]);

  // Points blancs le long des axes (exactement comme sur les captures)
  const axisDots = useMemo(() => {
    // 5 points sur l'axe vertical gauche
    const yDots = [
      startY - (startY - 20) * 1.0,
      startY - (startY - 20) * 0.75,
      startY - (startY - 20) * 0.5,
      startY - (startY - 20) * 0.25,
      startY,
    ];
    // 8 points sur l'axe horizontal bas
    const xDist = (width - 15) - startX;
    const xDots = [
      startX,
      startX + xDist * 0.14,
      startX + xDist * 0.28,
      startX + xDist * 0.42,
      startX + xDist * 0.57,
      startX + xDist * 0.71,
      startX + xDist * 0.85,
      startX + xDist * 1.0,
    ];
    return { yDots, xDots };
  }, [startX, startY, width]);

  // Jauge de compte à rebours : arc radial composé de pilules/capsules
  // 8 segments positionnés le long d'un arc de cercle en haut à droite
  const gaugeSegments = useMemo(() => {
    const centerArcX = width - 68;
    const centerArcY = 82;
    const radius = 38;

    // Angles en radians : de ~85° (bas) à ~275° (haut/droite)
    const totalSegments = 8;
    const startAngle = Math.PI * 0.48; // ~86°
    const endAngle = Math.PI * 1.55;   // ~279°

    const segs = [];
    for (let i = 0; i < totalSegments; i++) {
      const angle = startAngle + ((endAngle - startAngle) / (totalSegments - 1)) * i;
      const x = centerArcX + radius * Math.cos(angle);
      const y = centerArcY + radius * Math.sin(angle);
      const rot = (angle * 180) / Math.PI + 90;

      // Les 2 derniers segments tout en haut sont orange vif (#FF6A00 / #E86C25)
      // Les autres sont blanc pur (#FFFFFF)
      const isTopOrange = i >= 6;
      const color = isTopOrange ? '#FF6A00' : '#FFFFFF';

      segs.push({
        id: i,
        x,
        y,
        rot,
        color,
      });
    }

    // Le bouton rond blanc tout en bas de l'arc (bouton témoin)
    const knobX = centerArcX + radius * Math.cos(startAngle);
    const knobY = centerArcY + radius * Math.sin(startAngle);

    return { segs, knobX, knobY, centerArcX, centerArcY };
  }, [width]);

  return (
    <View style={[styles.canvasWrapper, { width, height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Dégradé du ciel nocturne */}
          <LinearGradient id="bgNightSky" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#0B131F" />
            <Stop offset="100%" stopColor="#0E1928" />
          </LinearGradient>

          {/* Dégradé de la courbe lumineuse dorée */}
          <LinearGradient id="trailGold" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#E86C25" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#F7A61C" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#FFDE59" stopOpacity="1" />
          </LinearGradient>

          {/* Dégradé des montagnes arrière (niveau 1) */}
          <LinearGradient id="mountainsBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#15263A" stopOpacity="0.75" />
            <Stop offset="100%" stopColor="#0B1420" stopOpacity="0.95" />
          </LinearGradient>

          {/* Dégradé des montagnes avant (niveau 2) */}
          <LinearGradient id="mountainsFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#111F30" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#08101A" stopOpacity="1" />
          </LinearGradient>

          {/* Dégradé fuselage avion doré */}
          <LinearGradient id="planeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFE082" />
            <Stop offset="40%" stopColor="#FDB813" />
            <Stop offset="80%" stopColor="#F5A623" />
            <Stop offset="100%" stopColor="#D97A10" />
          </LinearGradient>

          {/* Dégradé aile supérieure */}
          <LinearGradient id="planeWingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFF176" />
            <Stop offset="100%" stopColor="#F5A623" />
          </LinearGradient>
        </Defs>

        {/* 1. Fond du Canvas sombre uniforme */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgNightSky)" rx={12} />

        {/* 2. Silhouette des montagnes (arrière-plan réaliste comme sur les captures) */}
        {/* Montagnes arrière */}
        <Path
          d={`M 0 ${height - 24}
              L ${width * 0.08} ${height - 42}
              L ${width * 0.18} ${height - 58}
              L ${width * 0.28} ${height - 48}
              L ${width * 0.38} ${height - 68}
              L ${width * 0.52} ${height - 52}
              L ${width * 0.65} ${height - 76}
              L ${width * 0.78} ${height - 60}
              L ${width * 0.88} ${height - 70}
              L ${width} ${height - 48}
              L ${width} ${height}
              L 0 ${height} Z`}
          fill="url(#mountainsBack)"
        />

        {/* Montagnes avant (crêtes plus sombres) */}
        <Path
          d={`M 0 ${height - 18}
              L ${width * 0.06} ${height - 30}
              L ${width * 0.14} ${height - 44}
              L ${width * 0.24} ${height - 36}
              L ${width * 0.35} ${height - 54}
              L ${width * 0.45} ${height - 40}
              L ${width * 0.60} ${height - 58}
              L ${width * 0.72} ${height - 46}
              L ${width * 0.84} ${height - 52}
              L ${width * 0.94} ${height - 38}
              L ${width} ${height - 32}
              L ${width} ${height}
              L 0 ${height} Z`}
          fill="url(#mountainsFront)"
        />

        {/* 3. Lignes d'axes bleu-gris avec points blancs (exactement comme les captures) */}
        {/* Axe vertical gauche */}
        <Line
          x1={startX}
          y1={18}
          x2={startX}
          y2={startY}
          stroke="#22384F"
          strokeWidth="1.5"
        />
        {/* Axe horizontal bas */}
        <Line
          x1={startX}
          y1={startY}
          x2={width - 15}
          y2={startY}
          stroke="#22384F"
          strokeWidth="1.5"
        />

        {/* Points blancs sur l'axe vertical */}
        {axisDots.yDots.map((yVal, idx) => (
          <Circle
            key={`ydot-${idx}`}
            cx={startX}
            cy={yVal}
            r="3"
            fill="#FFFFFF"
            opacity={0.88}
          />
        ))}

        {/* Points blancs sur l'axe horizontal */}
        {axisDots.xDots.map((xVal, idx) => (
          <Circle
            key={`xdot-${idx}`}
            cx={xVal}
            cy={startY}
            r="3"
            fill="#FFFFFF"
            opacity={0.88}
          />
        ))}

        {/* 4. Phase de Vol & Crash : Trajectoire dorée éclatante */}
        {(phase === 'flight' || phase === 'crashed') && (
          <G>
            {/* Lueur externe de la courbe */}
            <Path
              d={curvePath}
              stroke="#F7A61C"
              strokeWidth="7"
              strokeOpacity="0.25"
              fill="none"
              strokeLinecap="round"
            />
            {/* Cœur lumineux doré de la courbe */}
            <Path
              d={curvePath}
              stroke="url(#trailGold)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
          </G>
        )}

        {/* 5. Avion Cartoon Doré Aviator (Phase de Vol) */}
        {phase === 'flight' && (
          <G transform={`translate(${planeX}, ${planeY}) rotate(${tangentAngle})`}>
            {/* Traînée blanche fine à l'arrière */}
            <Line
              x1="-28"
              y1="1"
              x2="-10"
              y2="1"
              stroke="#FFF8E1"
              strokeWidth="2"
              strokeDasharray="4,2"
              opacity="0.8"
            />

            {/* Fuselage profilé 3D de l'avion jaune-doré */}
            <Path
              d="M -16 -4
                 C -19 -4 -22 -1 -22 2
                 C -22 6 -18 8 -13 8
                 L 14 7
                 C 21 7 26 3 26 0
                 C 26 -3 21 -7 14 -7
                 L -13 -7 Z"
              fill="url(#planeGoldGrad)"
              stroke="#D97A10"
              strokeWidth="1.2"
            />

            {/* Verrière / Cockpit bleu azur avec reflet */}
            <Path
              d="M 2 -6
                 C 6 -6 11 -5 13 -1
                 L 4 -1
                 C 2 -4 0 -6 2 -6 Z"
              fill="#38B6FF"
              stroke="#1D7CB8"
              strokeWidth="0.8"
            />
            <Path
              d="M 5 -4 L 10 -2"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Aile supérieure déployée */}
            <Polygon
              points="-4,-16 9,-16 3,-4 -8,-4"
              fill="url(#planeWingGrad)"
              stroke="#D97A10"
              strokeWidth="1"
            />

            {/* Aileron arrière (gouvernail de queue) */}
            <Polygon
              points="-20,-12 -12,-12 -14,-4 -21,-4"
              fill="#E86C25"
              stroke="#C45314"
              strokeWidth="1"
            />

            {/* Train d'atterrissage (roue inférieure) */}
            <Circle cx="0" cy="10" r="3.2" fill="#2C3E50" stroke="#1A252F" strokeWidth="0.8" />
            <Line x1="0" y1="7" x2="0" y2="10" stroke="#7F8C8D" strokeWidth="1.5" />

            {/* Hélice à l'avant (pâles en rotation rapide) */}
            <Line
              x1="27"
              y1="-11"
              x2="27"
              y2="11"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.95"
            />
            {/* Disque de flou de l'hélice */}
            <Circle cx="27" cy="0" r="10" fill="#FFFDE7" opacity="0.25" />
            {/* Cône de nez avant */}
            <Circle cx="26" cy="0" r="3" fill="#D94726" />
          </G>
        )}

        {/* 6. Explosion au Crash */}
        {phase === 'crashed' && (
          <G transform={`translate(${planeX}, ${planeY})`}>
            {/* Fumée sombre */}
            <Circle cx="-6" cy="-6" r="22" fill="#1A242F" opacity="0.7" />
            <Circle cx="8" cy="-4" r="18" fill="#243342" opacity="0.6" />

            {/* Flammes extérieures rouge vif */}
            <Polygon
              points="0,-28 8,-11 26,-17 14,-1 30,11 12,9 15,28 -2,13 -18,26 -12,7 -29,0 -11,-9 -20,-26 -3,-13"
              fill="#E53935"
            />
            {/* Flammes intérieures orange vif */}
            <Polygon
              points="0,-21 6,-8 20,-13 11,0 23,9 9,7 11,22 -1,10 -14,20 -9,4 -22,0 -9,-7 -15,-20 -2,-10"
              fill="#FB8C00"
            />
            {/* Cœur jaune éclatant */}
            <Circle cx="0" cy="0" r="10" fill="#FFEE58" />

            {/* Étincelles éparses */}
            <Circle cx="-20" cy="-20" r="2.2" fill="#FFEE58" />
            <Circle cx="24" cy="-16" r="2" fill="#FFA726" />
            <Circle cx="18" cy="22" r="2.2" fill="#FFEE58" />
            <Circle cx="-22" cy="16" r="1.8" fill="#EF5350" />
          </G>
        )}

        {/* 7. Phase de Compte à Rebours (Exactement comme Screenshot 2) */}
        {phase === 'countdown' && (
          <G>
            {/* Jauge radiale de capsules */}
            {gaugeSegments.segs.map((seg) => (
              <G key={seg.id} transform={`translate(${seg.x}, ${seg.y}) rotate(${seg.rot})`}>
                <Rect
                  x="-3.5"
                  y="-9"
                  width="7"
                  height="18"
                  rx="3.5"
                  ry="3.5"
                  fill={seg.color}
                />
              </G>
            ))}

            {/* Bouton rond blanc tout en bas de la jauge */}
            <Circle
              cx={gaugeSegments.knobX}
              cy={gaugeSegments.knobY}
              r="6.5"
              fill="#FFFFFF"
            />

            {/* Parachutes / capsules descendantes pendant les secondes 3, 2, 1 */}
            {countdownSeconds <= 3 && (
              <G>
                {/* Capsule 1 */}
                <G transform={`translate(${width * 0.52}, ${height * 0.32 + (4 - countdownSeconds) * 16})`}>
                  <Path
                    d="M -14 0 C -14 -12 14 -12 14 0 Z"
                    fill={CRASH_COLORS.orangePrimary}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                  <Line x1="-12" y1="0" x2="0" y2="12" stroke="#CBD5E1" strokeWidth="0.8" />
                  <Line x1="12" y1="0" x2="0" y2="12" stroke="#CBD5E1" strokeWidth="0.8" />
                  <Rect x="-4" y="12" width="8" height="9" rx="2" fill="#FFFFFF" />
                </G>

                {/* Capsule 2 décalée */}
                <G transform={`translate(${width * 0.68}, ${height * 0.22 + (4 - countdownSeconds) * 20})`}>
                  <Path
                    d="M -12 0 C -12 -10 12 -10 12 0 Z"
                    fill="#FFFFFF"
                    stroke={CRASH_COLORS.orangePrimary}
                    strokeWidth="1"
                  />
                  <Line x1="-10" y1="0" x2="0" y2="10" stroke="#CBD5E1" strokeWidth="0.8" />
                  <Line x1="10" y1="0" x2="0" y2="10" stroke="#CBD5E1" strokeWidth="0.8" />
                  <Rect x="-3" y="10" width="6" height="8" rx="2" fill={CRASH_COLORS.orangePrimary} />
                </G>
              </G>
            )}
          </G>
        )}
      </Svg>

      {/* ========================================================= */}
      {/* OVERLAY HTML : Textes & Toasts Superposés Pixel-Perfect  */}
      {/* ========================================================= */}

      {/* Compte à rebours : Grand chiffre blanc (ex: 6) à droite de la jauge (Screenshot 2) */}
      {phase === 'countdown' && (
        <View style={[styles.countdownBox, { right: 20, top: 46 }]}>
          <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
        </View>
      )}

      {/* Multiplicateur géant en bas à droite pendant le vol ou figé au crash (Screenshot 3 & 4) */}
      {(phase === 'flight' || phase === 'crashed') && (
        <View style={styles.multiplierBox}>
          <Text style={styles.multiplierText}>
            {multiplier.toFixed(2)}x
          </Text>
        </View>
      )}

      {/* Toast en bas à gauche : Pari accepté (Texte Vert Néon comme Screenshot 4) */}
      {toastAccepted && (
        <View style={styles.toastAccepted}>
          <Text style={styles.toastAcceptedText}>Votre pari est accepté !</Text>
        </View>
      )}

      {/* Toast en bas à gauche : Retrait gagnant (Texte Vert Néon comme Screenshot 3) */}
      {toastWinGain !== null && toastWinGain !== undefined && toastWinGain > 0 && (
        <View style={[styles.toastAccepted, styles.toastWin]}>
          <Text style={styles.toastWinText}>
            Vous avez gagné : {toastWinGain.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XAF
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasWrapper: {
    borderRadius: 12,
    backgroundColor: '#0B131F',
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  countdownBox: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  multiplierBox: {
    position: 'absolute',
    bottom: 14,
    right: 20,
  },
  multiplierText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  toastAccepted: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    backgroundColor: 'rgba(9, 24, 18, 0.92)',
    borderColor: '#00E676',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toastAcceptedText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  toastWin: {
    bottom: 44,
  },
  toastWinText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
