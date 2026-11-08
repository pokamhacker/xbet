import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export interface BackArrowIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

/**
 * Composant vectoriel pour la flèche de retour.
 * Garanti 100% visible et interactif sur Web, iOS et Android.
 */
export const BackArrowIcon: React.FC<BackArrowIconProps> = ({
  size = 24,
  color = '#557089',
  strokeWidth = 2.4,
  style,
}) => {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size },
          style,
        ]}
      >
        <Ionicons name="chevron-back" size={size} color={color} />
      </View>
    );
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={[{ width: size, height: size }, style]}
    >
      <Path
        d="M15 19L8 12L15 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const BackChevronIcon = BackArrowIcon;
export default BackArrowIcon;

