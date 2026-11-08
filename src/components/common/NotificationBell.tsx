import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface BellVectorIconProps {
  size?: number;
  color?: string;
}

/**
 * Icône cloche officielle de l'application (dôme semi-circulaire lisse sans anneau supérieur,
 * base évasée droite et battant plein détaché en demi-lune).
 */
export const BellVectorIcon: React.FC<BellVectorIconProps> = ({
  size = 20,
  color = '#3982C6',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.4 9.9A5.6 5.6 0 0 1 17.6 9.9V13.1C17.6 14.6 18.6 15.7 19.6 16.5H4.4C5.4 15.7 6.4 14.6 6.4 13.1V9.9Z"
      stroke={color}
      strokeWidth={2.05}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.5 18.7C9.7 20.3 10.7 21.2 12 21.2C13.3 21.2 14.3 20.3 14.5 18.7H9.5Z"
      fill={color}
    />
  </Svg>
);

interface NotificationBellProps {
  size?: number;
  tintColor?: string;
  activeTintColor?: string;
  onPress?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 20,
  tintColor = '#475569',
  activeTintColor,
  onPress,
}) => {
  const [active, setActive] = useState(false);

  const handlePress = () => {
    setActive(!active);
    if (onPress) onPress();
  };

  const resolvedColor = active ? (activeTintColor || tintColor) : tintColor;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.btn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <BellVectorIcon size={size} color={resolvedColor} />
      {active && <View style={styles.badgeDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 2,
  },
  badgeDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
});

export default NotificationBell;
