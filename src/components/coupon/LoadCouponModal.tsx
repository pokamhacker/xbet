import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useThemeStore } from '../../store/themeStore';
import { useCouponStore } from '../../store/couponStore';

interface LoadCouponModalProps {
  visible: boolean;
  onClose: () => void;
  onLoadCoupon: (code: string) => void;
}

const AZERTY_ROW_1 = ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const AZERTY_ROW_2 = ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];
const AZERTY_ROW_3 = ['W', 'X', 'C', 'V', 'B', 'N', "'"];

const NUMERIC_ROW_1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const NUMERIC_ROW_2 = ['-', '/', ':', ';', '(', ')', '€', '&', '@', '"'];
const NUMERIC_ROW_3 = ['.', ',', '?', '!', "'"];

export const LoadCouponModal: React.FC<LoadCouponModalProps> = ({
  visible,
  onClose,
  onLoadCoupon,
}) => {
  const { currentTheme } = useThemeStore();
  const lastSavedCode = useCouponStore((state) => state.lastSavedCode);
  const isDark = currentTheme.isDark;
  const isMelbet = currentTheme.name.toLowerCase().includes('melbet');

  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasteBubble, setShowPasteBubble] = useState(false);
  const [isUpperCase, setIsUpperCase] = useState(true);
  const [isNumericMode, setIsNumericMode] = useState(false);

  // Curseur clignotant natif
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setCode('');
      setErrorMessage('');
      setShowPasteBubble(false);
      setIsUpperCase(true);
      setIsNumericMode(false);
      return;
    }

    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [visible, cursorOpacity]);

  // Couleurs calibrées multi-thèmes (Melbet & 1xBet)
  const accentColor = isMelbet
    ? '#E58E26'
    : currentTheme.colors.primary || '#228BE6';

  const activeBtnBg = isMelbet
    ? '#C87D20'
    : currentTheme.colors.primary || '#228BE6';

  const sheetBg = isMelbet
    ? isDark
      ? '#262B31'
      : '#FFFFFF'
    : isDark
      ? currentTheme.colors.cardBackground || '#1E2733'
      : '#FFFFFF';

  const disabledBtnBg = isDark ? '#323840' : '#E2E8F0';
  const disabledBtnText = isDark ? '#6E7781' : '#94A3B8';
  const titleColor = isDark ? '#FFFFFF' : '#111827';
  const handleColor = isDark ? '#525862' : '#CBD5E1';

  const hasCode = code.trim().length > 0;

  const handleKeyPress = (char: string) => {
    setErrorMessage('');
    setShowPasteBubble(false);
    const formattedChar = isNumericMode
      ? char
      : isUpperCase
        ? char.toUpperCase()
        : char.toLowerCase();
    const next = (code + formattedChar).toUpperCase();
    setCode(next);
    if (isUpperCase && next.length === 1) {
      setIsUpperCase(false);
    }
  };

  const handleBackspace = () => {
    setErrorMessage('');
    setShowPasteBubble(false);
    const next = code.slice(0, -1);
    setCode(next);
    if (next.length === 0) {
      setIsUpperCase(true);
    }
  };

  const handlePasteAction = async () => {
    setErrorMessage('');
    let clipText = '';
    try {
      const raw = await Clipboard.getStringAsync();
      if (raw && raw.trim()) {
        clipText = raw.trim().toUpperCase();
      }
    } catch {
      // Presse-papiers navigateur restreint -> fallback vers lastSavedCode
    }
    const finalCode = clipText || lastSavedCode || '6R4N6';
    setCode(finalCode);
    setShowPasteBubble(false);
    setIsUpperCase(false);
  };

  const handleSubmit = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setShowPasteBubble(false);
    onLoadCoupon(trimmed);
  };

  const row1 = isNumericMode ? NUMERIC_ROW_1 : AZERTY_ROW_1;
  const row2 = isNumericMode ? NUMERIC_ROW_2 : AZERTY_ROW_2;
  const row3 = isNumericMode ? NUMERIC_ROW_3 : AZERTY_ROW_3;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.bottomStack}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ================================================================= */}
          {/* 1. PANNEAU "Charger le coupon de pari" ANCRÉ AU-DESSUS DU CLAVIER */}
          {/* ================================================================= */}
          <View style={[styles.sheetCard, { backgroundColor: sheetBg }]}>
            {/* Poignée supérieure centrée (width: 36, height: 4) */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: handleColor }]} />
            </View>

            {/* Titre centré en blanc gras (17px) */}
            <Text style={[styles.sheetTitle, { color: titleColor }]}>
              Charger le coupon de pari
            </Text>

            {/* Zone de saisie avec bulle contextuelle native "Coller | Remplir" */}
            <View style={styles.inputSection}>
              {showPasteBubble && (
                <View style={styles.pasteBubbleWrapper}>
                  <View style={styles.pasteBubble}>
                    <TouchableOpacity
                      style={styles.pasteBubbleBtn}
                      activeOpacity={0.75}
                      onPress={handlePasteAction}
                    >
                      <Text style={styles.pasteBubbleText}>Coller</Text>
                    </TouchableOpacity>
                    <View style={styles.pasteBubbleDivider} />
                    <TouchableOpacity
                      style={styles.pasteBubbleBtn}
                      activeOpacity={0.75}
                      onPress={handlePasteAction}
                    >
                      <Svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ marginRight: 5 }}
                      >
                        <Rect
                          x="4"
                          y="4"
                          width="12"
                          height="16"
                          rx="2"
                          stroke="#FFFFFF"
                          strokeWidth={1.8}
                        />
                        <Path
                          d="M7 9H13M7 13H11"
                          stroke="#FFFFFF"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                        />
                        <Path
                          d="M15 15L20 20M18 14L20.5 16.5"
                          stroke="#FFFFFF"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                        />
                      </Svg>
                      <Text style={styles.pasteBubbleText}>Remplir</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.pasteBubbleArrow} />
                </View>
              )}

              {/* Label en couleur d'accent */}
              <Text style={[styles.inputLabel, { color: accentColor }]}>
                Saisissez le code du coupon de pari
              </Text>

              {/* Champ de saisie sans clavier Web (zéro barre < ^ v ✓) */}
              <Pressable
                style={[
                  styles.customInputRow,
                  { borderBottomColor: accentColor },
                ]}
                onPress={() => setShowPasteBubble((prev) => !prev)}
              >
                <Text style={[styles.inputValueText, { color: titleColor }]}>
                  {code}
                </Text>
                <Animated.View
                  style={[
                    styles.blinkingCursor,
                    {
                      backgroundColor: accentColor,
                      opacity: cursorOpacity,
                    },
                  ]}
                />
              </Pressable>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}
            </View>

            {/* Bouton "Télécharger" TOUJOURS VISIBLE juste au-dessus du clavier */}
            <TouchableOpacity
              activeOpacity={hasCode ? 0.85 : 1}
              disabled={!hasCode}
              onPress={handleSubmit}
              style={[
                styles.downloadButton,
                {
                  backgroundColor: hasCode ? activeBtnBg : disabledBtnBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.downloadButtonText,
                  {
                    color: hasCode ? '#FFFFFF' : disabledBtnText,
                  },
                ]}
              >
                Télécharger
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================================================================= */}
          {/* 2. CLAVIER SOMBRE NATIF iOS AZERTY INTÉGRÉ (#1C1C1E)              */}
          {/* ================================================================= */}
          <View style={styles.keyboardContainer}>
            {/* Barre supérieure de suggestions à 3 colonnes */}
            <View style={styles.suggestionBar}>
              <TouchableOpacity
                style={styles.suggestionSlot}
                activeOpacity={0.7}
                onPress={handlePasteAction}
              >
                {code.length === 0 && lastSavedCode ? (
                  <Text style={styles.suggestionHintText}>{lastSavedCode}</Text>
                ) : null}
              </TouchableOpacity>
              <View style={styles.suggestionDivider} />
              <TouchableOpacity
                style={styles.suggestionSlot}
                activeOpacity={0.7}
                onPress={handlePasteAction}
              />
              <View style={styles.suggestionDivider} />
              <TouchableOpacity
                style={styles.suggestionSlot}
                activeOpacity={0.7}
              />
            </View>

            {/* Rangée 1 : A Z E R T Y U I O P */}
            <View style={styles.kbRow}>
              {row1.map((k) => {
                const displayKey = isNumericMode
                  ? k
                  : isUpperCase
                    ? k.toUpperCase()
                    : k.toLowerCase();
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.65}
                    onPress={() => handleKeyPress(k)}
                    style={styles.letterKey}
                  >
                    <Text style={styles.letterKeyText}>{displayKey}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rangée 2 : Q S D F G H J K L M */}
            <View style={styles.kbRow}>
              {row2.map((k) => {
                const displayKey = isNumericMode
                  ? k
                  : isUpperCase
                    ? k.toUpperCase()
                    : k.toLowerCase();
                return (
                  <TouchableOpacity
                    key={k}
                    activeOpacity={0.65}
                    onPress={() => handleKeyPress(k)}
                    style={styles.letterKey}
                  >
                    <Text style={styles.letterKeyText}>{displayKey}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Rangée 3 : ⇧ | W X C V B N ' | ⌫ */}
            <View style={styles.kbRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsUpperCase((prev) => !prev)}
                style={[
                  styles.systemKeyWide,
                  isUpperCase && !isNumericMode && styles.shiftActiveKey,
                ]}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 4L4 13H9V20H15V13H20L12 4Z"
                    fill={
                      isUpperCase && !isNumericMode ? '#1C1C1E' : '#FFFFFF'
                    }
                    stroke={
                      isUpperCase && !isNumericMode ? '#1C1C1E' : '#FFFFFF'
                    }
                    strokeWidth={1.6}
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              <View style={styles.row3LettersWrap}>
                {row3.map((k) => {
                  const displayKey = isNumericMode
                    ? k
                    : isUpperCase
                      ? k.toUpperCase()
                      : k.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={k}
                      activeOpacity={0.65}
                      onPress={() => handleKeyPress(k)}
                      style={styles.letterKeyRow3}
                    >
                      <Text style={styles.letterKeyText}>{displayKey}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBackspace}
                style={styles.systemKeyWide}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 6H9L3 12L9 18H21C21.55 18 22 17.55 22 17V7C22 6.45 21.55 6 21 6Z"
                    stroke="#FFFFFF"
                    strokeWidth={1.7}
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M17 9.5L12 14.5M12 9.5L17 14.5"
                    stroke="#FFFFFF"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Rangée 4 : 123 | 😊 | [espace FR] | ↵ */}
            <View style={styles.kbRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsNumericMode((prev) => !prev)}
                style={styles.modeKey123}
              >
                <Text style={styles.modeKeyText}>
                  {isNumericMode ? 'ABC' : '123'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.emojiKey}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#FFFFFF"
                    strokeWidth={1.7}
                  />
                  <Circle cx="9" cy="10" r="1.2" fill="#FFFFFF" />
                  <Circle cx="15" cy="10" r="1.2" fill="#FFFFFF" />
                  <Path
                    d="M8.5 14.5C9.4 16 10.6 16.7 12 16.7C13.4 16.7 14.6 16 15.5 14.5"
                    stroke="#FFFFFF"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => handleKeyPress(' ')}
                style={styles.spaceKey}
              >
                <Text style={styles.spaceKeyText}>espace</Text>
                <Text style={styles.spaceFrBadge}>FR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={handleSubmit}
                style={styles.returnKey}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 7V13C19 14.1 18.1 15 17 15H6M6 15L10 11M6 15L10 19"
                    stroke="#FFFFFF"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Barre inférieure : Globe 🌐 à gauche, Micro 🎤 à droite, barre d'accueil iOS */}
            <View style={styles.kbBottomFooter}>
              <View style={styles.kbFooterIconsRow}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#8E8E93"
                    strokeWidth={1.6}
                  />
                  <Path
                    d="M3 12H21M12 3C14.5 5.8 15.8 8.8 15.8 12C15.8 15.2 14.5 18.2 12 21C9.5 18.2 8.2 15.2 8.2 12C8.2 8.8 9.5 5.8 12 3Z"
                    stroke="#8E8E93"
                    strokeWidth={1.5}
                  />
                </Svg>

                <Svg width={20} height={22} viewBox="0 0 24 24" fill="none">
                  <Rect
                    x="9"
                    y="3"
                    width="6"
                    height="11"
                    rx="3"
                    fill="#8E8E93"
                  />
                  <Path
                    d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11M12 18V21M9 21H15"
                    stroke="#8E8E93"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  />
                </Svg>
              </View>

              <View style={styles.homeIndicatorBar} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'flex-end',
  },
  bottomStack: {
    width: '100%',
  },
  sheetCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  inputSection: {
    position: 'relative',
    width: '100%',
  },
  pasteBubbleWrapper: {
    position: 'absolute',
    top: -42,
    left: 0,
    zIndex: 30,
    alignItems: 'flex-start',
  },
  pasteBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 18,
    paddingHorizontal: 6,
    height: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  pasteBubbleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  pasteBubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pasteBubbleDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pasteBubbleArrow: {
    width: 10,
    height: 10,
    backgroundColor: '#2C2C2E',
    transform: [{ rotate: '45deg' }],
    marginLeft: 28,
    marginTop: -5,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '400',
    marginBottom: 6,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
  },
  inputValueText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  blinkingCursor: {
    width: 2,
    height: 20,
    borderRadius: 1,
    marginLeft: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
  downloadButton: {
    marginTop: 16,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  // Clavier Sombre Natif iOS AZERTY
  keyboardContainer: {
    backgroundColor: '#1C1C1E',
    paddingTop: 4,
    paddingHorizontal: 4,
    paddingBottom: 6,
  },
  suggestionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  suggestionSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionHintText: {
    color: '#98989F',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#3A3A3C',
  },
  kbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    gap: 5,
    paddingHorizontal: 2,
  },
  letterKey: {
    flex: 1,
    height: 41,
    backgroundColor: '#48484A',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.45,
    shadowRadius: 0.5,
    elevation: 2,
  },
  row3LettersWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  letterKeyRow3: {
    flex: 1,
    height: 41,
    backgroundColor: '#48484A',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.45,
    shadowRadius: 0.5,
    elevation: 2,
  },
  letterKeyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
  systemKeyWide: {
    width: 42,
    height: 41,
    backgroundColor: '#2C2C2E',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.45,
    shadowRadius: 0.5,
    elevation: 2,
  },
  shiftActiveKey: {
    backgroundColor: '#D1D1D6',
  },
  modeKey123: {
    width: 44,
    height: 41,
    backgroundColor: '#2C2C2E',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeKeyText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '500',
  },
  emojiKey: {
    width: 42,
    height: 41,
    backgroundColor: '#2C2C2E',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceKey: {
    flex: 1,
    height: 41,
    backgroundColor: '#48484A',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spaceKeyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  spaceFrBadge: {
    position: 'absolute',
    right: 7,
    bottom: 4,
    color: '#98989F',
    fontSize: 9.5,
    fontWeight: '600',
  },
  returnKey: {
    width: 82,
    height: 41,
    backgroundColor: '#2C2C2E',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kbBottomFooter: {
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  kbFooterIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  homeIndicatorBar: {
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
});

export default LoadCouponModal;
