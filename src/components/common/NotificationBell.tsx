import React, { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';

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

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={styles.btn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Image
        source={require('../../../assets/icons/cloche.png')}
        style={{
          width: size,
          height: size,
          tintColor: active ? (activeTintColor || tintColor) : tintColor,
        }}
        resizeMode="contain"
      />
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
