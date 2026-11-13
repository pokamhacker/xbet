import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ScoreNumericKeypadProps {
  activeLabel?: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  backgroundColor: string;
  keyBg: string;
  keyTextColor: string;
  borderColor: string;
  accentColor: string;
  labelColor: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'];

/**
 * Pavé numérique tactile intégré pour la saisie rapide des scores des 2 mi-temps.
 * Conçu avec data-keep-input-focus="true" afin de ne jamais fermer un clavier actif.
 */
export const ScoreNumericKeypad: React.FC<ScoreNumericKeypadProps> = ({
  activeLabel,
  onDigit,
  onBackspace,
  backgroundColor,
  keyBg,
  keyTextColor,
  borderColor,
  accentColor,
  labelColor,
}) => {
  const webKeepFocusProps: any =
    Platform.OS === 'web'
      ? {
          'data-keep-input-focus': 'true',
          onMouseDown: (e: any) => {
            e?.preventDefault?.();
            e?.stopPropagation?.();
          },
          onTouchStart: (e: any) => {
            e?.stopPropagation?.();
          },
        }
      : {};

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
      ]}
      {...webKeepFocusProps}
    >
      <View style={styles.topRow}>
        <Text style={[styles.hintLabel, { color: labelColor }]} numberOfLines={1}>
          Pavé rapide
          {activeLabel ? (
            <Text style={{ color: accentColor }}>{` • ${activeLabel}`}</Text>
          ) : null}
        </Text>
      </View>
      <View style={styles.keysRow}>
        {KEYS.map((k) => {
          const isBack = k === '⌫';
          return (
            <TouchableOpacity
              key={k}
              activeOpacity={0.75}
              onPress={() => {
                if (isBack) {
                  onBackspace();
                } else {
                  onDigit(k);
                }
              }}
              style={[
                styles.keyBtn,
                {
                  backgroundColor: isBack ? 'rgba(239, 68, 68, 0.12)' : keyBg,
                  borderColor: isBack ? 'rgba(239, 68, 68, 0.35)' : borderColor,
                },
              ]}
              {...webKeepFocusProps}
            >
              <Text
                style={[
                  styles.keyText,
                  { color: isBack ? '#EF4444' : keyTextColor },
                  isBack && { color: '#EF4444' },
                ]}
              >
                {k}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  hintLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  keysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'space-between',
  },
  keyBtn: {
    minWidth: 28,
    flexGrow: 1,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
});

export default ScoreNumericKeypad;
