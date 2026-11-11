import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
  Animated,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useBetStore } from '../store/useBetStore';
import { useAuthStore } from '../store/authStore';
import { useResponsive } from '../utils/responsive';
import { useThemeStore } from '../stores/themeStore';

// Assets visuels officiels extraits du jeu
const APPLE_BG = require('../../assets/games/apple/apple_bg.jpg');
const APPLE_GOOD = require('../../assets/games/apple/apple_good.png');
const APPLE_BAD = require('../../assets/games/apple/apple_bad.png');
const APPLE_COVERED = require('../../assets/games/apple/apple_covered.png');
const APPLE_INACTIVE = require('../../assets/games/apple/apple_inactive.png');

export interface AppleTier {
  tier: number; // 1 (en bas) à 10 (en haut)
  multiplier: number;
  label: string;
  goodCount: number;
  badCount: number;
}

// Les 10 paliers officiels d'Apple of Fortune (du haut Tier 10 au bas Tier 1)
export const APPLE_TIERS: AppleTier[] = [
  { tier: 10, multiplier: 349.68, label: 'x 349.68', goodCount: 1, badCount: 4 },
  { tier: 9, multiplier: 69.93, label: 'x 69.93', goodCount: 2, badCount: 3 },
  { tier: 8, multiplier: 27.97, label: 'x 27.97', goodCount: 2, badCount: 3 },
  { tier: 7, multiplier: 11.18, label: 'x 11.18', goodCount: 3, badCount: 2 },
  { tier: 6, multiplier: 6.71, label: 'x 6.71', goodCount: 3, badCount: 2 },
  { tier: 5, multiplier: 4.02, label: 'x 4.02', goodCount: 3, badCount: 2 },
  { tier: 4, multiplier: 2.41, label: 'x 2.41', goodCount: 4, badCount: 1 },
  { tier: 3, multiplier: 1.93, label: 'x 1.93', goodCount: 4, badCount: 1 },
  { tier: 2, multiplier: 1.54, label: 'x 1.54', goodCount: 4, badCount: 1 },
  { tier: 1, multiplier: 1.23, label: 'x 1.23', goodCount: 4, badCount: 1 },
];

export type GameMode = 'winning' | 'random';

export default function AppleOfFortuneScreen({ navigation }: any) {
  const hasAccess = useAuthStore((s) => s.hasAccessToFeature('game_apple'));
  const { balance, deposit, withdraw } = useBetStore();
  const { width, height, font, isTablet, contentContainerStyle } = useResponsive();
  const { currentTheme, brandChoice, modeChoice } = useThemeStore();
  const brandAccentColor = currentTheme.primary || '#EAA824';
  const brandTextColor = currentTheme.colors?.primaryText || currentTheme.textWhite || '#FFFFFF';

  // Responsive dimensions
  const maxContentWidth = Math.min(width, 480);
  const horizontalPadding = 10;
  const availableWidth = maxContentWidth - (horizontalPadding * 2);
  const multiplierWidth = Math.max(50, Math.min(62, Math.floor(availableWidth * 0.17)));
  const cellsAvailableWidth = availableWidth - multiplierWidth - 8;
  const cellSize = Math.max(38, Math.min(52, Math.floor(cellsAvailableWidth / 5)));
  const cellImageSize = Math.max(34, Math.min(48, cellSize - 4));
  const rowHeight = Math.max(36, Math.min(46, Math.floor((height - 310) / 10)));

  // Mode de jeu (demandé par l'utilisateur : mode gagnant vs mode aléatoire)
  const [gameMode, setGameMode] = useState<GameMode>('winning');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [quickDepositAmount, setQuickDepositAmount] = useState('50000');

  // Paramètres de mise
  const [stake, setStake] = useState('500');
  const minStake = 200;
  const maxStake = 731788;
  const numericStake = parseFloat(stake) || 0;

  // États de partie
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTier, setCurrentTier] = useState<number>(1); // 1 à 10
  const [revealingIndex, setRevealingIndex] = useState<{ row: number; col: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [finalWinAmount, setFinalWinAmount] = useState(0);

  // Grille complète : pour chaque palier (1 à 10), un tableau de 5 booléens (true = bonne pomme, false = trognon)
  const [grid, setGrid] = useState<Record<number, boolean[]>>({});
  // Choix du joueur : { [tier]: columnIndex }
  const [userPicks, setUserPicks] = useState<Record<number, number>>({});

  // Animation de pulsation sur la sélection active
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.09,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Calcul du gain actuel sécurisé
  const currentTierConfig = useMemo(() => {
    return APPLE_TIERS.find((t) => t.tier === currentTier);
  }, [currentTier]);

  const securedTier = currentTier > 1 ? currentTier - 1 : 0;
  const securedMultiplier = useMemo(() => {
    if (securedTier === 0) return 0;
    return APPLE_TIERS.find((t) => t.tier === securedTier)?.multiplier || 0;
  }, [securedTier]);

  const currentSecuredGain = useMemo(() => {
    if (securedTier === 0) return 0;
    return Math.round(numericStake * securedMultiplier);
  }, [numericStake, securedMultiplier, securedTier]);

  // Lancement d'une nouvelle partie
  const handleStartGame = () => {
    if (numericStake < minStake) {
      triggerHaptic('error');
      return;
    }
    if (numericStake > balance) {
      triggerHaptic('error');
      setDepositModalVisible(true);
      return;
    }

    triggerHaptic('medium');
    withdraw(numericStake);

    // Initialiser la grille pour les 10 paliers
    const initialGrid: Record<number, boolean[]> = {};
    APPLE_TIERS.forEach((t) => {
      const arr = [
        ...Array(t.goodCount).fill(true),
        ...Array(t.badCount).fill(false),
      ];
      // Mélange de Fisher-Yates
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      initialGrid[t.tier] = arr;
    });

    setGrid(initialGrid);
    setUserPicks({});
    setCurrentTier(1);
    setIsGameOver(false);
    setIsGameWon(false);
    setFinalWinAmount(0);
    setIsPlaying(true);
  };

  // Clic sur une pomme dans le palier actif
  const handleSelectCell = (tier: number, colIndex: number) => {
    if (!isPlaying || tier !== currentTier || revealingIndex !== null || isGameOver || isGameWon) {
      return;
    }

    triggerHaptic('light');
    setRevealingIndex({ row: tier, col: colIndex });

    setTimeout(() => {
      let isGood = false;

      if (gameMode === 'winning') {
        // Mode Gagnant : la pomme cliquée est 100% gagnante garantie !
        isGood = true;
        // Mettre à jour la grille pour que cette case soit true tout en respectant le compte du palier
        const tierConfig = APPLE_TIERS.find((t) => t.tier === tier);
        const goodNeeded = (tierConfig?.goodCount || 4) - 1;
        const otherCols = [0, 1, 2, 3, 4].filter((c) => c !== colIndex);
        // Mélanger les autres
        const otherVals = [
          ...Array(goodNeeded).fill(true),
          ...Array(tierConfig?.badCount || 1).fill(false),
        ];
        for (let i = otherVals.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherVals[i], otherVals[j]] = [otherVals[j], otherVals[i]];
        }
        const updatedRow = [...(grid[tier] || [true, true, true, true, false])];
        updatedRow[colIndex] = true;
        otherCols.forEach((c, idx) => {
          updatedRow[c] = otherVals[idx];
        });
        setGrid((prev) => ({ ...prev, [tier]: updatedRow }));
      } else {
        // Mode Aléatoire : utilise la grille générée avec probabilités réelles
        isGood = Boolean(grid[tier]?.[colIndex]);
      }

      setUserPicks((prev) => ({ ...prev, [tier]: colIndex }));
      setRevealingIndex(null);

      if (isGood) {
        triggerHaptic('success');
        if (tier === 10) {
          // Palier 10 conquis (Jackpot x349.68 !)
          const payout = Math.round(numericStake * 349.68);
          deposit(payout);
          setFinalWinAmount(payout);
          setIsGameWon(true);
          setIsPlaying(false);
        } else {
          // Passer au palier suivant au-dessus
          setCurrentTier(tier + 1);
        }
      } else {
        // Pomme croquée / Trognon : défaite
        triggerHaptic('error');
        setIsGameOver(true);
        setIsPlaying(false);
      }
    }, 380);
  };

  // Encaissement volontaire par le joueur ("RÉCUPÉRER LES GAINS")
  const handleCashout = () => {
    if (!isPlaying || currentTier <= 1) return;

    triggerHaptic('success');
    const payout = currentSecuredGain;
    deposit(payout);
    setFinalWinAmount(payout);
    setIsGameWon(true);
    setIsPlaying(false);
  };

  // Gestion des vibrations haptiques
  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'error') => {
    try {
      if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignorer sur Web
    }
  };

  // Dépôt rapide
  const handleQuickDeposit = () => {
    const num = parseFloat(quickDepositAmount.replace(/[^0-9]/g, '')) || 0;
    if (num > 0) {
      deposit(num);
      setDepositModalVisible(false);
      triggerHaptic('success');
    }
  };

  // Ajustement rapide de la mise
  const handleQuickBet = (action: 'min' | 'x2' | 'half' | 'max') => {
    triggerHaptic('light');
    if (action === 'min') setStake(String(minStake));
    else if (action === 'max') setStake(String(Math.min(maxStake, Math.floor(balance || maxStake))));
    else if (action === 'x2') setStake(String(Math.min(maxStake, numericStake * 2)));
    else if (action === 'half') setStake(String(Math.max(minStake, Math.floor(numericStake / 2))));
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Arrière-plan forêt tropicale féerique immersif */}
      <ImageBackground source={APPLE_BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        {/* Voile sombre subtil pour faire ressortir les éléments de jeu */}
        <View style={styles.bgOverlay} />

        <View style={[{ flex: 1, width: '100%' }, contentContainerStyle]}>
        {/* ----------------------------------------------------------------- */}
        {/* 1. EN-TÊTE SUPÉRIEUR (← | Solde + | BONUS+ | (i))                 */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.topHeader}>
          {/* Bouton retour */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Solde centré avec bouton + jaune doré */}
          <View style={styles.balancePill}>
            <Ionicons name="chevron-down" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.balanceText}>
              {balance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₣
            </Text>
            <TouchableOpacity
              style={[styles.balancePlusBtn, { backgroundColor: brandAccentColor }]}
              activeOpacity={0.8}
              onPress={() => setDepositModalVisible(true)}
            >
              <Ionicons name="add" size={15} color="#0B130E" />
            </TouchableOpacity>
          </View>

          {/* Droite : Badge BONUS+ et icône info (i) */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.bonusBadgeBtn}
              activeOpacity={0.8}
              onPress={() => setSettingsVisible(true)}
            >
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L14.4 5.6L18.6 4.9L18.9 9.3L22.8 11.2L20.8 15.1L22.5 19.1L18.2 20.1L16.7 24.2L12 22.5L7.3 24.2L5.8 20.1L1.5 19.1L3.2 15.1L1.2 11.2L5.1 9.3L5.4 4.9L9.6 5.6L12 2Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.bonusBadgeText}>BONUS</Text>
              <Text style={styles.bonusBadgePlus}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.infoBtn}
              activeOpacity={0.8}
              onPress={() => setRulesVisible(true)}
            >
              <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Titre centré du jeu */}
        <View style={styles.titleWrap}>
          <Text style={styles.titleText}>APPLE OF FORTUNE</Text>
          {/* Badge discret indiquant le mode actif */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.modeIndicatorPill,
              gameMode === 'winning' ? styles.modePillWinning : styles.modePillRandom,
            ]}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons
              name={gameMode === 'winning' ? 'trophy' : 'shuffle'}
              size={11}
              color="#FFFFFF"
              style={{ marginRight: 3 }}
            />
            <Text style={styles.modeIndicatorText}>
              {gameMode === 'winning' ? 'Mode Gagnant' : 'Mode Aléatoire'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* 2. GRILLE DE 10 PALIERS × 5 POMMES (Alignée avec Multiplicateurs) */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.gridContainer}>
          {APPLE_TIERS.map((tierConfig) => {
            const isRowActive = isPlaying && currentTier === tierConfig.tier;
            const isRowCompleted = userPicks[tierConfig.tier] !== undefined;
            const isRowLocked = tierConfig.tier > currentTier;
            const isGameFinished = isGameOver || isGameWon;

            return (
              <View key={`tier-${tierConfig.tier}`} style={[styles.tierRow, { height: rowHeight }]}>
                {/* Pilule de multiplicateur à gauche */}
                <View
                  style={[
                    styles.multiplierPill,
                    { width: multiplierWidth, height: Math.min(28, rowHeight - 6) },
                    isRowActive && styles.multiplierPillActive,
                    isRowCompleted && !isGameFinished && styles.multiplierPillCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.multiplierText,
                      isRowActive && styles.multiplierTextActive,
                    ]}
                  >
                    {tierConfig.label}
                  </Text>
                </View>

                {/* 5 cases circulaires de pommes */}
                <View style={styles.cellsRow}>
                  {[0, 1, 2, 3, 4].map((colIndex) => {
                    const isPicked = userPicks[tierConfig.tier] === colIndex;
                    const isRevealing =
                      revealingIndex?.row === tierConfig.tier &&
                      revealingIndex?.col === colIndex;
                    const isCellGood = grid[tierConfig.tier]?.[colIndex] ?? true;

                    // Détermination de l'asset visuel exact
                    let cellSource = APPLE_INACTIVE;
                    if (isGameFinished) {
                      cellSource = isCellGood ? APPLE_GOOD : APPLE_BAD;
                    } else if (isRowCompleted) {
                      cellSource = isPicked
                        ? isCellGood
                          ? APPLE_GOOD
                          : APPLE_BAD
                        : APPLE_INACTIVE;
                    } else if (isRowActive) {
                      cellSource = APPLE_COVERED;
                    }

                    return (
                      <TouchableOpacity
                        key={`cell-${tierConfig.tier}-${colIndex}`}
                        activeOpacity={isRowActive ? 0.75 : 1}
                        disabled={!isRowActive || revealingIndex !== null}
                        style={[styles.cellWrapper, { width: cellSize, height: cellSize }]}
                        onPress={() => handleSelectCell(tierConfig.tier, colIndex)}
                      >
                        {/* Anneau de sélection doré animé */}
                        {isRowActive && (
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              styles.goldRingGlow,
                              {
                                width: cellSize - 2,
                                height: cellSize - 2,
                                borderRadius: (cellSize - 2) / 2,
                                transform: [{ scale: pulseAnim }],
                              },
                            ]}
                          />
                        )}

                        {/* Image circulaire de la case */}
                        <Image
                          source={cellSource}
                          style={[styles.cellImage, { width: cellImageSize, height: cellImageSize }]}
                          resizeMode="contain"
                        />

                        {/* Spinner de chargement lors de la révélation */}
                        {isRevealing && (
                          <View style={styles.revealingSpinnerWrap}>
                            <ActivityIndicator size="small" color="#F1B92C" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* 3. MESSAGE CENTRAL EN FIN DE PARTIE (Victoire ou Défaite)         */}
        {/* ----------------------------------------------------------------- */}
        {(isGameOver || isGameWon) && (
          <View style={styles.centerMessageCard} pointerEvents="none">
            {isGameWon ? (
              <>
                <Text style={styles.victoryTitle}>Victoire</Text>
                <Text style={styles.victorySubtitle}>
                  Vous avez gagné {finalWinAmount.toLocaleString('fr-FR')} ₣
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.lossTitle}>
                  Vous aurez plus de chance la prochaine fois !
                </Text>
                <Text style={styles.lossSubtitle}>Réessayez</Text>
              </>
            )}
          </View>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* 4. ZONE DE CONTRÔLES INFÉRIEURS (Mise, Encaissement, Rejouer)      */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.bottomControlsArea}>
          {!isPlaying && !isGameOver && !isGameWon && (
            <>
              {/* 4 boutons de mise rapide (MIN. | X2 | X/2 | MAX.) */}
              <View style={styles.quickButtonsRow}>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: brandAccentColor }]}
                  activeOpacity={0.8}
                  onPress={() => handleQuickBet('min')}
                >
                  <Text style={[styles.quickBtnText, { color: brandTextColor }]}>MIN.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: brandAccentColor }]}
                  activeOpacity={0.8}
                  onPress={() => handleQuickBet('x2')}
                >
                  <Text style={[styles.quickBtnText, { color: brandTextColor }]}>X2</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: brandAccentColor }]}
                  activeOpacity={0.8}
                  onPress={() => handleQuickBet('half')}
                >
                  <Text style={[styles.quickBtnText, { color: brandTextColor }]}>X/2</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: brandAccentColor }]}
                  activeOpacity={0.8}
                  onPress={() => handleQuickBet('max')}
                >
                  <Text style={[styles.quickBtnText, { color: brandTextColor }]}>MAX.</Text>
                </TouchableOpacity>
              </View>

              {/* Carte de saisie de la mise + Gros bouton doré MISE */}
              <View style={styles.stakeCard}>
                <View style={styles.stakeInputCol}>
                  <View style={styles.stakeFieldWrap}>
                    <TextInput
                      style={styles.stakeInput}
                      value={stake}
                      onChangeText={setStake}
                      keyboardType="numeric"
                      placeholder="500"
                      placeholderTextColor="#94A3B8"
                    />
                    <Text style={styles.stakeCurrency}>F</Text>
                  </View>
                  <View style={styles.stakeDivider} />
                  <Text style={styles.stakeMinMax}>
                    min {minStake} F - max {maxStake.toLocaleString('fr-FR')} F
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.betButton, { backgroundColor: brandAccentColor }]}
                  activeOpacity={0.85}
                  onPress={handleStartGame}
                >
                  <Text style={[styles.betButtonText, { color: brandTextColor }]}>MISE</Text>
                </TouchableOpacity>
              </View>

              {/* Pied de page : PARAMÈTRES | EN UN CLIC */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.footerAction}
                  activeOpacity={0.7}
                  onPress={() => setSettingsVisible(true)}
                >
                  <Ionicons name="settings-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.footerActionText}>PARAMÈTRES</Text>
                </TouchableOpacity>

                <View style={styles.footerDivider} />

                <TouchableOpacity
                  style={styles.footerAction}
                  activeOpacity={0.7}
                  onPress={() => {
                    triggerHaptic('light');
                    handleStartGame();
                  }}
                >
                  <Ionicons name="flash-sharp" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.footerActionText}>EN UN CLIC</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* En cours de jeu : Bannière Gains Actuels + Bouton RÉCUPÉRER LES GAINS */}
          {isPlaying && (
            <View style={styles.inGameCashoutWrap}>
              <View style={styles.cashoutHeaderBanner}>
                <Text style={styles.cashoutBannerText}>
                  GAINS ACTUELS : {currentSecuredGain.toLocaleString('fr-FR')} F
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.cashoutMainButton,
                  { backgroundColor: brandAccentColor },
                  securedTier === 0 && styles.cashoutMainButtonDisabled,
                ]}
                disabled={securedTier === 0}
                activeOpacity={0.85}
                onPress={handleCashout}
              >
                <Text style={[styles.cashoutMainButtonText, { color: brandTextColor }]}>
                  RÉCUPÉRER LES GAINS
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Fin de partie : REJOUER / NOUVELLE MISE */}
          {(isGameOver || isGameWon) && (
            <View style={styles.endGameButtonsWrap}>
              <TouchableOpacity
                style={[styles.replayButton, { backgroundColor: brandAccentColor }]}
                activeOpacity={0.85}
                onPress={handleStartGame}
              >
                <Text style={[styles.replayButtonText, { color: brandTextColor }]}>
                  REJOUER ({numericStake} F)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newBetButton}
                activeOpacity={0.85}
                onPress={() => {
                  setIsGameOver(false);
                  setIsGameWon(false);
                  setIsPlaying(false);
                }}
              >
                <Text style={styles.newBetButtonText}>NOUVELLE MISE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </View>

        {/* ----------------------------------------------------------------- */}
        {/* 5. MODALE DE PARAMÈTRES & CHOIX DU MODE (Gagnant vs Aléatoire)    */}
        {/* ----------------------------------------------------------------- */}
        <Modal
          visible={settingsVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setSettingsVisible(false)}
            />
            <View style={[styles.modalCard, { zIndex: 2 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Paramètres du jeu</Text>
                <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionLabel}>MODE DE JEU APPLE OF FORTUNE</Text>

              {/* Option 1 : Mode Gagnant */}
              <TouchableOpacity
                style={[
                  styles.modeOptionCard,
                  gameMode === 'winning' && styles.modeOptionCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setGameMode('winning');
                  triggerHaptic('medium');
                }}
              >
                <View style={styles.modeOptionLeft}>
                  <View style={[styles.modeOptionIconCircle, { backgroundColor: 'rgba(74, 222, 128, 0.18)' }]}>
                    <Ionicons name="trophy" size={22} color="#4ADE80" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modeOptionTitle}>Mode Gagnant</Text>
                    <Text style={styles.modeOptionSub}>
                      100% de victoire garantie sur tous les paliers choisis.
                    </Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, gameMode === 'winning' && styles.radioCircleActive]}>
                  {gameMode === 'winning' && <View style={styles.radioInnerDot} />}
                </View>
              </TouchableOpacity>

              {/* Option 2 : Mode Aléatoire */}
              <TouchableOpacity
                style={[
                  styles.modeOptionCard,
                  gameMode === 'random' && styles.modeOptionCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  setGameMode('random');
                  triggerHaptic('medium');
                }}
              >
                <View style={styles.modeOptionLeft}>
                  <View style={[styles.modeOptionIconCircle, { backgroundColor: 'rgba(234, 168, 36, 0.18)' }]}>
                    <Ionicons name="shuffle" size={22} color="#EAA824" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modeOptionTitle}>Mode Aléatoire</Text>
                    <Text style={styles.modeOptionSub}>
                      Probabilités réelles d'Apple of Fortune (pommes réparties au hasard).
                    </Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, gameMode === 'random' && styles.radioCircleActive]}>
                  {gameMode === 'random' && <View style={styles.radioInnerDot} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: brandAccentColor }]}
                activeOpacity={0.85}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={[styles.modalConfirmBtnText, { color: brandTextColor }]}>CONFIRMER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ----------------------------------------------------------------- */}
        {/* 6. MODALE DES RÈGLES DU JEU                                       */}
        {/* ----------------------------------------------------------------- */}
        <Modal
          visible={rulesVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRulesVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setRulesVisible(false)}
            />
            <View style={[styles.modalCard, { zIndex: 2 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Règles du jeu</Text>
                <TouchableOpacity onPress={() => setRulesVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10, marginVertical: 12 }}>
                <Text style={styles.rulesText}>
                  • Choisissez une pomme à chaque palier pour gravir l'arbre de la fortune.
                </Text>
                <Text style={styles.rulesText}>
                  • Évitez le trognon de pomme croquée 💀 pour préserver vos gains.
                </Text>
                <Text style={styles.rulesText}>
                  • Vous pouvez encaisser vos gains après n'importe quel palier réussi grâce au bouton « RÉCUPÉRER LES GAINS ».
                </Text>
                <Text style={styles.rulesText}>
                  • Conquérez le palier 10 pour décrocher le Jackpot x349.68 !
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: brandAccentColor }]}
                activeOpacity={0.85}
                onPress={() => setRulesVisible(false)}
              >
                <Text style={[styles.modalConfirmBtnText, { color: brandTextColor }]}>J'AI COMPRIS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ----------------------------------------------------------------- */}
        {/* 7. MODALE EFFECTUER UN DÉPÔT                                      */}
        {/* ----------------------------------------------------------------- */}
        <Modal
          visible={depositModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDepositModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setDepositModalVisible(false)}
            />
            <View style={[styles.modalCard, { zIndex: 2 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Effectuer un dépôt</Text>
                <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSectionLabel, { marginTop: 12 }]}>
                Montant à créditer (₣)
              </Text>
              <TextInput
                style={styles.depositTextInput}
                value={quickDepositAmount}
                onChangeText={setQuickDepositAmount}
                keyboardType="numeric"
                placeholder="50 000"
                placeholderTextColor="#64748B"
              />

              <View style={styles.quickDepositChipsRow}>
                {['10000', '25000', '50000', '100000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.quickDepositChip,
                      quickDepositAmount === amt && styles.quickDepositChipActive,
                    ]}
                    onPress={() => setQuickDepositAmount(amt)}
                  >
                    <Text
                      style={[
                        styles.quickDepositChipText,
                        quickDepositAmount === amt && styles.quickDepositChipTextActive,
                      ]}
                    >
                      +{parseInt(amt, 10).toLocaleString('fr-FR')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: brandAccentColor }]}
                activeOpacity={0.85}
                onPress={handleQuickDeposit}
              >
                <Text style={[styles.modalConfirmBtnText, { color: brandTextColor }]}>CRÉDITER MON COMPTE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#041009',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(3, 15, 8, 0.42)',
  },

  // 1. En-tête supérieur
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 6 : 4,
    height: 48,
  },
  headerIconButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 22, 16, 0.82)',
    borderRadius: 22,
    paddingLeft: 12,
    paddingRight: 3,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginRight: 8,
  },
  balancePlusBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAA824',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bonusBadgeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bonusBadgeText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  bonusBadgePlus: {
    position: 'absolute',
    color: '#4ADE80',
    fontSize: 7.5,
    fontWeight: '900',
    top: 3,
    right: 2,
  },
  infoBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Titre centré
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  modeIndicatorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
  },
  modePillWinning: {
    backgroundColor: 'rgba(34, 197, 94, 0.28)',
    borderColor: '#22C55E',
    borderWidth: 0.8,
  },
  modePillRandom: {
    backgroundColor: 'rgba(234, 168, 36, 0.28)',
    borderColor: '#EAA824',
    borderWidth: 0.8,
  },
  modeIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // 2. Grille de 10 paliers × 5 pommes
  gridContainer: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
  },
  multiplierPill: {
    width: 60,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  multiplierPillActive: {
    backgroundColor: '#65C036',
  },
  multiplierPillCompleted: {
    backgroundColor: 'rgba(101, 192, 54, 0.35)',
  },
  multiplierText: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
    fontWeight: '700',
  },
  multiplierTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  cellsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellWrapper: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellImage: {
    width: 48,
    height: 48,
  },
  goldRingGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.2,
    borderColor: '#F3BE2F',
    backgroundColor: 'rgba(243, 190, 47, 0.22)',
  },
  revealingSpinnerWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 25,
  },

  // 3. Message central de fin de partie
  centerMessageCard: {
    position: 'absolute',
    top: '38%',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: 'rgba(5, 18, 11, 0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 50,
  },
  victoryTitle: {
    color: '#4ADE80',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  victorySubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  lossTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  lossSubtitle: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },

  // 4. Contrôles inférieurs
  bottomControlsArea: {
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 6,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#EAA824',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    color: '#111827',
    fontSize: 12.5,
    fontWeight: '800',
  },
  stakeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2530',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  stakeInputCol: {
    flex: 1,
    marginRight: 10,
  },
  stakeFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stakeInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 2,
  },
  stakeCurrency: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 4,
  },
  stakeDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  stakeMinMax: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '500',
  },
  betButton: {
    width: 108,
    height: 48,
    backgroundColor: '#EAA824',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  betButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  footerActionText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  footerDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  // En cours de jeu
  inGameCashoutWrap: {
    gap: 8,
    marginBottom: 6,
  },
  cashoutHeaderBanner: {
    height: 38,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashoutBannerText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cashoutMainButton: {
    height: 48,
    backgroundColor: '#EAA824',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashoutMainButtonDisabled: {
    backgroundColor: '#826019',
    opacity: 0.65,
  },
  cashoutMainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Fin de partie
  endGameButtonsWrap: {
    gap: 8,
    marginBottom: 6,
  },
  replayButton: {
    height: 48,
    backgroundColor: '#EAA824',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  newBetButton: {
    height: 46,
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBetButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Modales
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1E2530',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  modalSectionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 10,
  },
  modeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161D26',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.2,
    borderColor: 'transparent',
  },
  modeOptionCardActive: {
    borderColor: '#EAA824',
    backgroundColor: '#242F3D',
  },
  modeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modeOptionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeOptionTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  modeOptionSub: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 15,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: '#EAA824',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EAA824',
  },
  modalConfirmBtn: {
    backgroundColor: '#EAA824',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rulesText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
  },
  depositTextInput: {
    backgroundColor: '#121820',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickDepositChipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  quickDepositChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#121820',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickDepositChipActive: {
    borderColor: '#EAA824',
    backgroundColor: 'rgba(234, 168, 36, 0.16)',
  },
  quickDepositChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  quickDepositChipTextActive: {
    color: '#EAA824',
  },
});
