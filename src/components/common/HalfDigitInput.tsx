import React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

interface HalfDigitInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isActive?: boolean;
  onFocusInput?: () => void;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  activeBorderColor?: string;
  width?: number;
  height?: number;
  accessibilityLabel?: string;
}

/**
 * Champ numérique 2 chiffres pour la saisie des scores de mi-temps.
 * Sur le Web, utilise un <input> HTML natif isolé de ResponderSystem / TextInputState
 * (sans selectTextOnFocus) afin d'empêcher la fermeture du clavier virtuel mobile.
 */
export const HalfDigitInput: React.FC<HalfDigitInputProps> = ({
  value,
  onChangeText,
  isActive = false,
  onFocusInput,
  backgroundColor,
  textColor,
  borderColor,
  activeBorderColor = '#16A34A',
  width = 46,
  height = 38,
  accessibilityLabel,
}) => {
  const effectiveBorder = isActive ? activeBorderColor : borderColor;

  if (Platform.OS === 'web') {
    const stopOnly = (e: any) => {
      if (e && typeof e.stopPropagation === 'function') {
        e.stopPropagation();
      }
    };

    return React.createElement('input', {
      type: 'text',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      enterKeyHint: 'done',
      autoComplete: 'off',
      autoCorrect: 'off',
      maxLength: 2,
      value,
      'aria-label': accessibilityLabel,
      'data-keep-keyboard-open': 'true',
      'data-keep-input-focus': 'true',
      onFocus: (e: any) => {
        stopOnly(e);
        onFocusInput?.();
      },
      onChange: (e: any) => {
        const raw = String(e?.target?.value ?? '');
        const clean = raw.replace(/[^0-9]/g, '').slice(0, 2);
        onChangeText(clean);
      },
      onTouchStart: stopOnly,
      onTouchEnd: stopOnly,
      onPointerDown: stopOnly,
      onMouseDown: stopOnly,
      onClick: stopOnly,
      onKeyDown: stopOnly,
      onKeyUp: stopOnly,
      style: {
        width,
        height,
        backgroundColor,
        color: textColor,
        border: `${isActive ? 2 : 1}px solid ${effectiveBorder}`,
        borderRadius: 7,
        fontSize: 16,
        fontWeight: 800,
        textAlign: 'center',
        padding: 0,
        margin: 0,
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        WebkitAppearance: 'none',
      },
    });
  }

  return (
    <TextInput
      style={[
        styles.nativeInput,
        {
          width,
          height,
          backgroundColor,
          color: textColor,
          borderColor: effectiveBorder,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
      value={value}
      onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, '').slice(0, 2))}
      onFocus={() => onFocusInput?.()}
      keyboardType="number-pad"
      inputMode="numeric"
      maxLength={2}
      blurOnSubmit={false}
      accessibilityLabel={accessibilityLabel}
    />
  );
};

const styles = StyleSheet.create({
  nativeInput: {
    borderRadius: 7,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});

export default HalfDigitInput;

