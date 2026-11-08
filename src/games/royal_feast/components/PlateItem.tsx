import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, Animated, View } from 'react-native';
import { PlateData } from '../types/game';
import { DISH_IMAGES } from '../constants/gameConfig';

interface PlateItemProps {
  plate: PlateData;
  onPress: (id: number) => void;
  disabled: boolean;
  isOpening?: boolean;
}

// Positionnement et dimensions calibrés pour que le masque 85% x 82% couvre 100% de la cloche
const SLOT_LEFT_PCT = ['12.61%', '27.30%', '42.00%', '56.69%', '71.39%'] as const;
const SLOT_TOP_PCT = ['26.34%', '32.39%', '38.45%', '44.50%', '50.55%'] as const;
const SLOT_WIDTH_PCT = '15.50%';
const SLOT_HEIGHT_PCT = '6.67%';

export const PlateItem: React.FC<PlateItemProps> = ({ plate, onPress, disabled, isOpening }) => {
  // Valeurs animées pour l'effet Pop / Lift de la nourriture (translation vers le haut + zoom élastique + fondu)
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(10)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (plate.isRevealed) {
      scaleAnim.setValue(0.5);
      translateYAnim.setValue(10);
      opacityAnim.setValue(0);

      // Animation Pop / Lift fluide 60 FPS sur thread natif
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [plate.isRevealed]);

  return (
    <Pressable
      disabled={disabled || plate.isRevealed || isOpening}
      onPress={() => onPress(plate.id)}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      style={[
        styles.slot,
        {
          left: SLOT_LEFT_PCT[plate.col],
          top: SLOT_TOP_PCT[plate.row],
          width: SLOT_WIDTH_PCT,
          height: SLOT_HEIGHT_PCT,
        },
      ]}
    >
      {/* S'affiche uniquement à partir de 350ms lorsque la cloche est ouverte */}
      {plate.isRevealed && (
        <View style={styles.revealWrapper} pointerEvents="none">
          {/* Image de la nourriture (PNG transparent) sans AUCUN fond sous le plat */}
          <Animated.Image
            source={DISH_IMAGES[plate.type]}
            style={[
              styles.dishImage,
              {
                opacity: opacityAnim,
                transform: [
                  { translateY: translateYAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  slot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.001)', // Garantit la détection tactile sur Android/iOS
    zIndex: 10,
  },
  revealWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishImage: {
    width: '120%',
    height: '120%',
    zIndex: 2,
  },
});


