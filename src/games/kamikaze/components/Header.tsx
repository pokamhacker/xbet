import React from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';

import { COLORS, FONTS } from '../theme';

/** Titre officiel « KAMIKAZE » et bouton des règles. */
export function Header({ width, onHelp }: { width: number; onHelp: () => void }) {
  // Ratio du titre kamikaze_title.png : 485 / 107
  const logoWidth = Math.min(width * 0.58, 205);
  const logoHeight = logoWidth * (107 / 485);

  return (
    <View style={[styles.head, { width }]}>
      <Pressable
        testID="btn-help"
        accessibilityRole="button"
        accessibilityLabel="Règles du jeu"
        onPress={onHelp}
        style={styles.help}
      >
        <Text style={styles.helpText}>?</Text>
      </Pressable>
      <Image
        source={require('../assets/kamikaze_title.png')}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
        accessibilityRole="header"
        accessibilityLabel="Kamikaze"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    height: 48,
    marginTop: 6,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  help: {
    position: 'absolute',
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    zIndex: 10,
  },
  helpText: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 17,
  },
});
