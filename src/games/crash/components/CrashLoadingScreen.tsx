import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { CRASH_COLORS } from '../constants';
import { CrashHeader } from './CrashHeader';

interface CrashLoadingScreenProps {
  balance: number;
  onFinishLoading: () => void;
  onBack: () => void;
}

export const CrashLoadingScreen: React.FC<CrashLoadingScreenProps> = ({
  balance,
  onFinishLoading,
  onBack,
}) => {
  const [percent, setPercent] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // 16 segments trapézoïdaux en coordonnées polaires
  const NUM_SEGMENTS = 16;
  const radiusOuter = 65;
  const radiusInner = 48;
  const cx = 80;
  const cy = 80;

  useEffect(() => {
    // Rotation continue de l'anneau
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progression du pourcentage (0% -> 45% -> 84% -> 100%)
    const t1 = setTimeout(() => setPercent(45), 450);
    const t2 = setTimeout(() => setPercent(84), 1050);
    const t3 = setTimeout(() => setPercent(100), 1600);
    const t4 = setTimeout(() => onFinishLoading(), 1950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Construction des segments d'anneau
  const segments = Array.from({ length: NUM_SEGMENTS }).map((_, index) => {
    const angleStart = (index * 360) / NUM_SEGMENTS + 2;
    const angleEnd = ((index + 1) * 360) / NUM_SEGMENTS - 2;

    const radStart = (angleStart * Math.PI) / 180;
    const radEnd = (angleEnd * Math.PI) / 180;

    const x1 = cx + radiusOuter * Math.cos(radStart);
    const y1 = cy + radiusOuter * Math.sin(radStart);
    const x2 = cx + radiusOuter * Math.cos(radEnd);
    const y2 = cy + radiusOuter * Math.sin(radEnd);

    const x3 = cx + radiusInner * Math.cos(radEnd);
    const y3 = cy + radiusInner * Math.sin(radEnd);
    const x4 = cx + radiusInner * Math.cos(radStart);
    const y4 = cy + radiusInner * Math.sin(radStart);

    const pathData = `M ${x1} ${y1} A ${radiusOuter} ${radiusOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${radiusInner} ${radiusInner} 0 0 0 ${x4} ${y4} Z`;
    const isLight = index % 2 === 0;
    const fillColor = isLight ? '#59A7DA' : '#2B4A6F';

    return <Path key={index} d={pathData} fill={fillColor} />;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Barre Supérieure Fixe (Header) */}
      <CrashHeader
        balance={balance}
        onBack={onBack}
        onOpenRecharge={() => {}}
      />

      {/* Centre : Fond #1C3B57 et Anneau tournant */}
      <View style={styles.centerContainer}>
        <View style={styles.ringWrapper}>
          {/* Anneau SVG animé en rotation */}
          <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
            <Svg width={160} height={160} viewBox="0 0 160 160">
              <G>{segments}</G>
            </Svg>
          </Animated.View>

          {/* Cercle interne entourant le texte de pourcentage */}
          <View style={styles.innerCircle}>
            <Text style={styles.percentText}>{percent}%</Text>
          </View>
        </View>

        <Text style={styles.loadingHint}>Chargement du radar de vol...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CRASH_COLORS.bgLoading,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#122334',
    borderWidth: 2,
    borderColor: '#304E72',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  percentText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  loadingHint: {
    marginTop: 24,
    fontSize: 13,
    color: CRASH_COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
