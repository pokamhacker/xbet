import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/theme';

interface TicketPerforationProps {
  style?: ViewStyle;
  backgroundColor?: string;
  ticketColor?: string;
  notchSize?: number;
  dashedColor?: string;
}

/**
 * Composant de perforation de ticket de pari (iGaming Ticket Cutout)
 * Découpes latérales concaves semi-circulaires parfaitement alignées avec la ligne pointillée
 */
export const TicketPerforation: React.FC<TicketPerforationProps> = ({
  style,
  backgroundColor = '#F1F5F9', // couleur du fond parent
  ticketColor = '#FFFFFF',       // couleur du corps du billet
  notchSize = 18,
  dashedColor = '#CBD5E1',
}) => {
  const radius = notchSize / 2;
  const offset = -radius;

  return (
    <View style={[styles.container, { backgroundColor: ticketColor, height: notchSize }, style]}>
      {/* Encoche latérale gauche parfaitement alignée */}
      <View
        style={[
          styles.notch,
          {
            width: notchSize,
            height: notchSize,
            borderRadius: radius,
            backgroundColor: backgroundColor,
            left: offset,
            borderColor: Colors.border,
          },
        ]}
      />

      {/* Ligne pointillée centrale connectant directement les deux encoches */}
      <View
        style={[
          styles.dashedLine,
          {
            borderTopColor: dashedColor,
            marginLeft: radius + 2,
            marginRight: radius + 2,
          },
        ]}
      />

      {/* Encoche latérale droite parfaitement alignée */}
      <View
        style={[
          styles.notch,
          {
            width: notchSize,
            height: notchSize,
            borderRadius: radius,
            backgroundColor: backgroundColor,
            right: offset,
            borderColor: Colors.border,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  notch: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    borderWidth: 1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
});

export default TicketPerforation;
