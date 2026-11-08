import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBetStore } from '../store/useBetStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { CRASH_COLORS } from '../games/crash/constants';
import {
  GameMode,
  GamePhase,
  BetPanelState,
  BotBet,
  CrashHistoryRound,
} from '../games/crash/types';
import {
  calculateMultiplier,
  generateClassicCrashPoint,
  generateBotList,
} from '../games/crash/engine';
import { CrashModeSelection } from '../games/crash/components/CrashModeSelection';
import { CrashLoadingScreen } from '../games/crash/components/CrashLoadingScreen';
import { CrashHeader } from '../games/crash/components/CrashHeader';
import { CrashTabBar } from '../games/crash/components/CrashTabBar';
import { CrashCanvas } from '../games/crash/components/CrashCanvas';
import { CrashBetPanel } from '../games/crash/components/CrashBetPanel';
import { CrashBotsTable } from '../games/crash/components/CrashBotsTable';
import {
  CrashRulesModal,
  CrashHistoryModal,
  CrashRechargeModal,
  CrashAutoModal,
} from '../games/crash/components/CrashModals';

export default function CrashGameScreen({ navigation }: any) {
  const hasAccess = useAuthStore((s) => s.hasAccessToFeature('game_crash'));
  const { currentTheme, brandChoice, modeChoice } = useThemeStore();
  const { width, isTablet, contentContainerStyle } = useResponsive();

  useEffect(() => {
    if (!hasAccess) {
      Alert.alert(
        'Accès restreint',
        "Vous n'avez pas l'autorisation d'accéder au jeu Crash. Veuillez contacter votre administrateur.",
        [{ text: 'Compris', onPress: () => navigation.goBack() }]
      );
    }
  }, [hasAccess, navigation]);

  const { balance, deposit, withdraw, setBalance } = useBetStore();

  // Navigation interne entre les 3 écrans
  const [currentScreen, setCurrentScreen] = useState<'selection' | 'loading' | 'game'>('selection');
  const [selectedMode, setSelectedMode] = useState<GameMode>('always_win');

  // Modales
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [autoModalPanel, setAutoModalPanel] = useState<1 | 2 | null>(null);

  // État du moteur de jeu
  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [countdownSeconds, setCountdownSeconds] = useState(8);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(2.7);
  const [roundCounter, setRoundCounter] = useState(1);

  // Panneaux de pari #1 et #2 (100% indépendants)
  const [stake1, setStake1] = useState('400');
  const [stake2, setStake2] = useState('400');
  const [panel1State, setPanel1State] = useState<BetPanelState>('IDLE_COUNTDOWN');
  const [panel2State, setPanel2State] = useState<BetPanelState>('IDLE_COUNTDOWN');
  const [auto1, setAuto1] = useState<number | null>(null);
  const [auto2, setAuto2] = useState<number | null>(null);

  // Notifications visuelles (toasts)
  const [toastAccepted, setToastAccepted] = useState(false);
  const [toastWinGain, setToastWinGain] = useState<number | null>(null);
  const [showNextRoundBanner, setShowNextRoundBanner] = useState(false);

  // Tableau des bots et statistiques
  const [bots, setBots] = useState<BotBet[]>([]);
  const [totalBetsCount, setTotalBetsCount] = useState(0);
  const [totalBetsAmount, setTotalBetsAmount] = useState(0);
  const [totalGainsAmount, setTotalGainsAmount] = useState(0);

  // Historique des tours
  const [historyRounds, setHistoryRounds] = useState<CrashHistoryRound[]>([
    {
      id: 'h-1',
      roundNumber: 42,
      crashMultiplier: 2.7,
      timestamp: '15:42:10',
      userBets: [{ panelId: 1, stake: 400, cashedMultiplier: 2.15, gain: 860, status: 'Payé' }],
    },
    {
      id: 'h-2',
      roundNumber: 41,
      crashMultiplier: 1.45,
      timestamp: '15:41:40',
    },
    {
      id: 'h-3',
      roundNumber: 40,
      crashMultiplier: 10.14,
      timestamp: '15:41:05',
      userBets: [
        { panelId: 1, stake: 400, cashedMultiplier: 2.7, gain: 1080, status: 'Payé' },
        { panelId: 2, stake: 400, cashedMultiplier: 6.83, gain: 2732, status: 'Payé' },
      ],
    },
    {
      id: 'h-4',
      roundNumber: 39,
      crashMultiplier: 1.88,
      timestamp: '15:40:22',
    },
    {
      id: 'h-5',
      roundNumber: 38,
      crashMultiplier: 3.25,
      timestamp: '15:39:50',
    },
  ]);

  // Références pour boucles d'animation haute fréquence
  const flightStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const lastBotUpdateRef = useRef<number>(0);

  // Références d'état pour les callbacks d'animation
  const phaseRef = useRef<GamePhase>(phase);
  phaseRef.current = phase;
  const multiplierRef = useRef<number>(multiplier);
  multiplierRef.current = multiplier;
  const crashPointRef = useRef<number>(crashPoint);
  crashPointRef.current = crashPoint;
  const panel1StateRef = useRef<BetPanelState>(panel1State);
  panel1StateRef.current = panel1State;
  const panel2StateRef = useRef<BetPanelState>(panel2State);
  panel2StateRef.current = panel2State;
  const stake1Ref = useRef<string>(stake1);
  stake1Ref.current = stake1;
  const stake2Ref = useRef<string>(stake2);
  stake2Ref.current = stake2;
  const auto1Ref = useRef<number | null>(auto1);
  auto1Ref.current = auto1;
  const auto2Ref = useRef<number | null>(auto2);
  auto2Ref.current = auto2;
  const selectedModeRef = useRef<GameMode>(selectedMode);
  selectedModeRef.current = selectedMode;

  /* ===================================================================== */
  /* GESTION DU CYCLE DE VIE DES TOURS (COUNTDOWN -> FLIGHT -> CRASH)      */
  /* ===================================================================== */

  // Démarrage du Compte à rebours (8s -> 1s)
  const startCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdownSeconds(8);
    setMultiplier(1.0);
    setToastAccepted(false);
    setToastWinGain(null);
    setShowNextRoundBanner(false);

    // Initialisation / Réinitialisation des bots et des stats
    const newBots = generateBotList();
    setBots(newBots);
    setTotalBetsCount(0);
    setTotalBetsAmount(0);
    setTotalGainsAmount(0);

    // Transition des panneaux de paris
    setPanel1State((prev) => (prev === 'BET_QUEUED' ? 'BET_QUEUED' : 'IDLE_COUNTDOWN'));
    setPanel2State((prev) => (prev === 'BET_QUEUED' ? 'BET_QUEUED' : 'IDLE_COUNTDOWN'));

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let sec = 8;
    countdownIntervalRef.current = setInterval(() => {
      sec -= 1;
      if (sec >= 1) {
        setCountdownSeconds(sec);
        // Simulation progressive de l'afflux des parieurs (+260 à +300 /s et +255 000 XAF /s)
        const addedCount = Math.floor(260 + Math.random() * 40);
        const addedAmount = Math.floor(250000 + Math.random() * 15000);
        setTotalBetsCount((c) => c + addedCount);
        setTotalBetsAmount((a) => a + addedAmount);
      } else {
        clearInterval(countdownIntervalRef.current);
        startFlight();
      }
    }, 1000);
  }, []);

  // Décollage de l'avion (Phase de Vol)
  const startFlight = useCallback(() => {
    setPhase('flight');
    flightStartTimeRef.current = Date.now();
    lastBotUpdateRef.current = Date.now();

    // Activer les paris qui étaient en file d'attente (BET_QUEUED)
    const p1Queued = panel1StateRef.current === 'BET_QUEUED';
    const p2Queued = panel2StateRef.current === 'BET_QUEUED';

    setPanel1State(p1Queued ? 'ACTIVE_IN_FLIGHT' : 'IDLE_DURING_FLIGHT');
    setPanel2State(p2Queued ? 'ACTIVE_IN_FLIGHT' : 'IDLE_DURING_FLIGHT');

    if (p1Queued || p2Queued) {
      setToastAccepted(true);
      setTimeout(() => setToastAccepted(false), 3000);
    }

    // Détermination initiale du crash point selon le mode
    let targetCrash = 2.5;
    if (selectedModeRef.current === 'classic') {
      targetCrash = generateClassicCrashPoint();
    } else {
      // Mode Toujours gagnant : si un pari du joueur est actif, le crash est STRICTEMENT INTERDIT
      if (p1Queued || p2Queued) {
        targetCrash = 999999; // Vol infini tant que non retiré
      } else {
        targetCrash = parseFloat((1.2 + Math.random() * 3.8).toFixed(2));
      }
    }

    setCrashPoint(targetCrash);
    crashPointRef.current = targetCrash;

    // Boucle d'animation à 60 FPS
    runFlightLoop();
  }, []);

  // Boucle haute fréquence d'animation de vol
  const runFlightLoop = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const step = () => {
      if (phaseRef.current !== 'flight') return;

      const now = Date.now();
      const elapsedSeconds = (now - flightStartTimeRef.current) / 1000;
      const currentMult = calculateMultiplier(elapsedSeconds);
      const roundedMult = parseFloat(currentMult.toFixed(2));

      setMultiplier(roundedMult);
      multiplierRef.current = roundedMult;

      // 1. Vérification Auto-Cashout pour Panel #1
      if (
        panel1StateRef.current === 'ACTIVE_IN_FLIGHT' &&
        auto1Ref.current !== null &&
        roundedMult >= auto1Ref.current
      ) {
        handleCashout(1, roundedMult);
      }

      // 2. Vérification Auto-Cashout pour Panel #2
      if (
        panel2StateRef.current === 'ACTIVE_IN_FLIGHT' &&
        auto2Ref.current !== null &&
        roundedMult >= auto2Ref.current
      ) {
        handleCashout(2, roundedMult);
      }

      // 3. Mise à jour des Bots (cadencée à 120ms pour ne pas surcharger le thread React)
      if (now - lastBotUpdateRef.current > 120) {
        lastBotUpdateRef.current = now;
        setBots((prevBots) => {
          let additionalGains = 0;
          let changed = false;

          const updated = prevBots.map((b) => {
            if (!b.isCashedOut && roundedMult >= b.targetMultiplier) {
              changed = true;
              const gain = Math.round(b.bet * b.targetMultiplier * 100) / 100;
              additionalGains += gain;
              return { ...b, isCashedOut: true, gain };
            }
            return b;
          });

          if (additionalGains > 0) {
            setTotalGainsAmount((g) => g + additionalGains);
          }
          return changed ? updated : prevBots;
        });
      }

      // 4. Vérification du Crash
      if (roundedMult >= crashPointRef.current) {
        triggerCrash(roundedMult);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  // Déclenchement de l'Explosion / Crash
  const triggerCrash = (finalMult: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setPhase('crashed');
    phaseRef.current = 'crashed';
    setMultiplier(finalMult);

    // Enregistrement des paris perdus
    const userBetsForRound: any[] = [];
    if (panel1StateRef.current === 'ACTIVE_IN_FLIGHT') {
      setPanel1State('IDLE_COUNTDOWN');
      userBetsForRound.push({
        panelId: 1,
        stake: parseFloat(stake1Ref.current) || 0,
        gain: 0,
        status: 'Perdu',
      });
    }
    if (panel2StateRef.current === 'ACTIVE_IN_FLIGHT') {
      setPanel2State('IDLE_COUNTDOWN');
      userBetsForRound.push({
        panelId: 2,
        stake: parseFloat(stake2Ref.current) || 0,
        gain: 0,
        status: 'Perdu',
      });
    }

    // Sauvegarde dans l'historique
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newRoundItem: CrashHistoryRound = {
      id: `round-${Date.now()}`,
      roundNumber: roundCounter,
      crashMultiplier: finalMult,
      timestamp: timeStr,
      userBets: userBetsForRound.length > 0 ? userBetsForRound : undefined,
    };

    setHistoryRounds((prev) => [newRoundItem, ...prev.slice(0, 19)]);
    setRoundCounter((c) => c + 1);

    // La courbe jaune reste figée pendant 3 secondes, puis recommence le compte à rebours
    setTimeout(() => {
      startCountdown();
    }, 3000);
  };

  /* ===================================================================== */
  /* ACTIONS DES JOUEURS : PLACER UN PARI & RETIRER                        */
  /* ===================================================================== */

  const handlePlaceBet = (panelId: 1 | 2) => {
    const rawStake = panelId === 1 ? stake1 : stake2;
    const numericStake = parseFloat(rawStake) || 0;

    if (numericStake <= 0) {
      Alert.alert('Mise invalide', 'Veuillez renseigner un montant de mise.');
      return;
    }
    if (numericStake > balance) {
      Alert.alert('Solde insuffisant', 'Votre solde est inférieur au montant misé. Cliquez sur le bouton (+) pour recharger.');
      return;
    }

    // Débit immédiat du solde
    withdraw(numericStake);

    // Transition d'état : BET_QUEUED
    if (panelId === 1) {
      setPanel1State('BET_QUEUED');
    } else {
      setPanel2State('BET_QUEUED');
    }

    // Affichage des toasts selon la phase
    if (phase === 'flight') {
      setShowNextRoundBanner(true);
      setTimeout(() => setShowNextRoundBanner(false), 3500);
    } else {
      setToastAccepted(true);
      setTimeout(() => setToastAccepted(false), 3000);
    }
  };

  const handleCashout = (panelId: 1 | 2, currentMultOverride?: number) => {
    const curMult = currentMultOverride || multiplierRef.current;
    const rawStake = panelId === 1 ? stake1Ref.current : stake2Ref.current;
    const numericStake = parseFloat(rawStake) || 0;
    const gain = Math.round(numericStake * curMult * 100) / 100;

    // Transition temporaire 150ms CASHING_OUT
    if (panelId === 1) setPanel1State('CASHING_OUT');
    else setPanel2State('CASHING_OUT');

    setTimeout(() => {
      // Crédit immédiat des gains
      deposit(gain);

      if (panelId === 1) setPanel1State('CASHED_OUT');
      else setPanel2State('CASHED_OUT');

      // Toast de gain sur le canvas
      setToastWinGain(gain);
      setTimeout(() => setToastWinGain(null), 4000);

      // En mode "Toujours gagnant" : si le joueur a encaissé son dernier pari actif sur le vol en cours,
      // générer un crash différé crédible (currentMultiplier + random(1.5, 4.5))
      if (selectedModeRef.current === 'always_win') {
        const otherPanelActive =
          panelId === 1
            ? panel2StateRef.current === 'ACTIVE_IN_FLIGHT'
            : panel1StateRef.current === 'ACTIVE_IN_FLIGHT';

        if (!otherPanelActive) {
          const deferredCrash = parseFloat((curMult + 1.5 + Math.random() * 3.0).toFixed(2));
          setCrashPoint(deferredCrash);
          crashPointRef.current = deferredCrash;
        }
      }
    }, 150);
  };

  /* ===================================================================== */
  /* EFFET D'INITIALISATION                                                */
  /* ===================================================================== */

  useEffect(() => {
    if (currentScreen === 'game') {
      startCountdown();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentScreen]);

  /* ===================================================================== */
  /* RENDU DES 3 ÉCRANS                                                    */
  /* ===================================================================== */

  if (!hasAccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D1B2A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="lock-closed" size={56} color="#EF4444" />
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
          Accès restreint
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Votre compte n'a pas l'autorisation d'accéder au jeu Crash. Contactez l'administrateur.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Écran 1 : Sélection du mode de jeu
  if (currentScreen === 'selection') {
    return (
      <CrashModeSelection
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        onConfirmPlay={() => setCurrentScreen('loading')}
        onBack={() => navigation.goBack()}
      />
    );
  }

  // Écran 2 : Écran de chargement avec anneau tournant
  if (currentScreen === 'loading') {
    return (
      <CrashLoadingScreen
        balance={balance}
        onFinishLoading={() => setCurrentScreen('game')}
        onBack={() => setCurrentScreen('selection')}
      />
    );
  }

  // Écran 3 : Écran Principal du Jeu (Scrollable verticalement)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme?.background || CRASH_COLORS.bgGame }]}>
      <StatusBar barStyle="light-content" />

      <View style={[{ flex: 1, width: '100%' }, contentContainerStyle]}>
        {/* A. Barre Supérieure Fixe (Header) */}
        <CrashHeader
          balance={balance}
          onBack={() => setCurrentScreen('selection')}
          onOpenRecharge={() => setRechargeModalVisible(true)}
        />

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* B. Barre d'Onglets Supérieure (Règles | HISTORIQUE) */}
          <CrashTabBar
            onOpenRules={() => setRulesModalVisible(true)}
            onOpenHistory={() => setHistoryModalVisible(true)}
          />

          {/* C. Zone Graphique d'Animation (Canvas du Crash) */}
          <CrashCanvas
            phase={phase}
            countdownSeconds={countdownSeconds}
            multiplier={multiplier}
            toastAccepted={toastAccepted}
            toastWinGain={toastWinGain}
          />

          {/* D. Bandeau de Notification Intermédiaire (Conditionnel) */}
          {showNextRoundBanner && (
            <View style={styles.nextRoundBanner}>
              <Text style={styles.nextRoundBannerText}>
                Bet on the next round has been accepted
              </Text>
            </View>
          )}

          {/* E. Double Panneau de Contrôle des Paris (Pari #1 et Pari #2) */}
          <View style={styles.betPanelsContainer}>
            {/* Panneau Pari #1 */}
            <CrashBetPanel
              panelId={1}
              stake={stake1}
              onChangeStake={setStake1}
              panelState={panel1State}
              gamePhase={phase}
              currentMultiplier={multiplier}
              autoCashoutMultiplier={auto1}
              onOpenAutoModal={() => setAutoModalPanel(1)}
              onPlaceBet={() => handlePlaceBet(1)}
              onCashout={() => handleCashout(1)}
            />

            {/* Panneau Pari #2 */}
            <CrashBetPanel
              panelId={2}
              stake={stake2}
              onChangeStake={setStake2}
              panelState={panel2State}
              gamePhase={phase}
              currentMultiplier={multiplier}
              autoCashoutMultiplier={auto2}
              onOpenAutoModal={() => setAutoModalPanel(2)}
              onPlaceBet={() => handlePlaceBet(2)}
              onCashout={() => handleCashout(2)}
            />
          </View>

          {/* F. Bandeau Récapitulatif & Tableau des Joueurs (Bots) */}
          <CrashBotsTable
            bots={bots}
            totalBetsCount={totalBetsCount}
            totalBetsAmount={totalBetsAmount}
            totalGainsAmount={totalGainsAmount}
          />
        </ScrollView>
      </View>

      {/* Modale des Règles */}
      <CrashRulesModal
        visible={rulesModalVisible}
        onClose={() => setRulesModalVisible(false)}
      />

      {/* Modale d'Historique */}
      <CrashHistoryModal
        visible={historyModalVisible}
        rounds={historyRounds}
        onClose={() => setHistoryModalVisible(false)}
      />

      {/* Modale de Recharge */}
      <CrashRechargeModal
        visible={rechargeModalVisible}
        currentBalance={balance}
        onDeposit={deposit}
        onSetBalance={setBalance}
        onClose={() => setRechargeModalVisible(false)}
      />

      {/* Modale d'Auto Cashout */}
      {autoModalPanel !== null && (
        <CrashAutoModal
          visible={autoModalPanel !== null}
          panelId={autoModalPanel}
          currentMultiplier={autoModalPanel === 1 ? auto1 : auto2}
          onSave={(val) => {
            if (autoModalPanel === 1) setAuto1(val);
            else setAuto2(val);
          }}
          onClose={() => setAutoModalPanel(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CRASH_COLORS.bgGame,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  nextRoundBanner: {
    marginHorizontal: 12,
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  nextRoundBannerText: {
    color: '#00E676',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  betPanelsContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
});
