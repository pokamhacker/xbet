import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export interface DepositIconProps {
  size?: number;
  color?: string;
  badgePlusColor?: string;
}

export const DepositIcon: React.FC<DepositIconProps> = ({
  size = 36,
  color = '#2E7D32',
  badgePlusColor = '#DCFCE7',
}) => {
  return (
    <Svg height={size} viewBox="0 0 48 48" width={size}>
      {/* Forme du portefeuille supérieur */}
      <Path
        d="M12 12C9.79086 12 8 13.7909 8 16V30C8 32.2091 9.79086 34 12 34H20C20 30 23 26 27 26H38V16C38 13.7909 36.2091 12 34 12H12Z"
        fill={color}
      />
      {/* Rabat supérieur du portefeuille */}
      <Path
        d="M14 8C12.8954 8 12 8.89543 12 10V12H32V10C32 8.89543 31.1046 8 30 8H14Z"
        fill={color}
        opacity={0.8}
      />
      {/* Badge rond superposé (+) */}
      <Circle cx="31" cy="31" fill={color} r="11" />
      {/* Symbole Plus au centre du badge */}
      <Path
        d="M31 25V37M25 31H37"
        stroke={badgePlusColor}
        strokeLinecap="round"
        strokeWidth={3.5}
      />
    </Svg>
  );
};

export default DepositIcon;
