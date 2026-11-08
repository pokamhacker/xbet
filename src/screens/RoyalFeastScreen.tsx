import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  StatusBar,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { GameStatus, DishType } from '../games/royal_feast/types/game';
import {
  PORTIONS_PER_DISH,
  DISH_KEYS,
  MULTIPLIERS,
  MAX_OPENS,
  DEFAULT_BET,
  UI_IMAGES,
  DISH_IMAGES,
} from '../games/royal_feast/constants/gameConfig';
import { TopBar } from '../games/royal_feast/components/TopBar';
import { TopDishGauges } from '../games/royal_feast/components/TopDishGauges';
import { PlateGrid } from '../games/royal_feast/components/PlateGrid';
import { StatusBanner } from '../games/royal_feast/components/StatusBanner';
import { BottomControls } from '../games/royal_feast/components/BottomControls';
import { BetModal } from '../games/royal_feast/components/BetModal';
import { useBetStore } from '../store/useBetStore';
import { useAuthStore } from '../store/authStore';
import { useCloches } from '../games/royal_feast/cloches';

export default function RoyalFeastScreen({ navigation }: any) {
  const hasAccess = useAuthStore((s) => s.hasAccessToFeature('game_royal_feast'));

  useEffect(() => {
    if (!hasAccess) {
      Alert.alert(
        'Accès restreint',
        "Vous n'avez pas l'autorisation d'accéder au jeu Royal Feast. Veuillez contacter votre administrateur.",
        [{ text: 'Compris', onPress: () => navigation.goBack() }]
      );
    }
  }, [hasAccess, navigation]);

  const { balance, withdraw, deposit } = useBetStore();
  const [currentBet, setCurrentBet] = useState<number>(DEFAULT_BET);
  const [winnings, setWinnings] = useState<number>(0);
  const [isBetModalVisible, setIsBetModalVisible] = useState<boolean>(false);

  // Préchargement instantané de toutes les images pour zéro scintillement au lancement
  useEffect(() => {
    Asset.loadAsync([
      UI_IMAGES.BACKGROUND,
      UI_IMAGES.CLOCHE,
      UI_IMAGES.COINS,
      UI_IMAGES.BANNER,
      UI_IMAGES.FOOTER,
      ...Object.values(DISH_IMAGES),
    ]).catch((err) => {
      console.warn('Erreur préchargement images:', err);
    });
  }, []);

  // Distribution des 25 plats pour la partie en cours (5 de chaque mets, 100% gagnants, zéro poison)
  const boardPlatesRef = useRef<DishType[]>([]);

  const initAllWinningPlates = (): DishType[] => {
    const items: DishType[] = [];
    DISH_KEYS.forEach((d) => {
      for (let i = 0; i < 5; i++) {
        items.push(d);
      }
    });
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    boardPlatesRef.current = items;
    return items;
  };

  // Initialisation immédiate au montage
  if (boardPlatesRef.current.length === 0) {
    initAllWinningPlates();
  }

  // Jauges de nourriture animées sous JACKPOT
  const [dishCounts, setDishCounts] = useState<Record<DishType, number>>({
    HAM: 0,
    PANCAKES: 0,
    CHICKEN: 0,
    PIE: 0,
    CAKE: 0,
  });
  const [lastRevealedDish, setLastRevealedDish] = useState<DishType | null>(null);
  const [triggerKey, setTriggerKey] = useState<number>(0);

  // Moteur de jeu officiel des cloches avec animations complètes (vague dorée, halo doré, éclat vert, rebond)
  const jeu = useCloches({
    lignes: 5,
    colonnes: 5,
    mode: 'libre', // TOUTES les 25 cases sont touchables dans n'importe quel ordre
    etapesMax: MAX_OPENS,
    vagueAuDemarrage: true,
    onChoisir: async ({ ligne, colonne }) => {
      // Étape 1 (Suspense 350ms) : la cloche brille (halo doré) et la bannière affiche "..."
      await new Promise((resolve) => setTimeout(resolve, 350));

      const index = ligne * 5 + colonne;
      const dishType = boardPlatesRef.current[index] || DISH_KEYS[index % DISH_KEYS.length];

      return {
        gagne: true,
        plat: DISH_IMAGES[dishType],
      };
    },
    onGagne: ({ ligne, colonne, etape }) => {
      const index = ligne * 5 + colonne;
      const dishType = boardPlatesRef.current[index] || DISH_KEYS[index % DISH_KEYS.length];

      // Mise à jour de la jauge correspondante sous JACKPOT
      setDishCounts((prev) => ({
        ...prev,
        [dishType]: Math.min((prev[dishType] || 0) + 1, PORTIONS_PER_DISH),
      }));
      setLastRevealedDish(dishType);
      setTriggerKey((k) => k + 1);

      // Calcul des gains selon le multiplicateur
      const newOpened = etape + 1;
      const mult = MULTIPLIERS[newOpened - 1];
      const win = Math.round(currentBet * mult);
      setWinnings(win);

      if (newOpened >= MAX_OPENS) {
        deposit(win);
        setTimeout(() => {
          jeu.reinitialiser();
          setWinnings(0);
          setDishCounts({ HAM: 0, PANCAKES: 0, CHICKEN: 0, PIE: 0, CAKE: 0 });
          setLastRevealedDish(null);
        }, 3500);
      }
    },
  });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Le plateau s'étend sur 100% de la surface de l'écran (plein écran absolu, sans bandes noires)
  const boardWidth = windowWidth;
  const boardHeight = windowHeight;

  const handleStartGame = () => {
    if (balance < currentBet) {
      Alert.alert('Solde insuffisant', 'Veuillez recharger votre compte ou baisser votre mise.');
      return;
    }

    // Débit de la mise
    withdraw(currentBet);
    initAllWinningPlates();
    setWinnings(0);
    setDishCounts({ HAM: 0, PANCAKES: 0, CHICKEN: 0, PIE: 0, CAKE: 0 });
    setLastRevealedDish(null);
    jeu.demarrer();
  };

  const handlePressCloche = async (ligne: number, colonne: number) => {
    if (
      jeu.statut === 'attente' ||
      jeu.statut === 'perdu' ||
      jeu.statut === 'complet' ||
      jeu.statut === 'encaisse'
    ) {
      return;
    }

    // 1. Si la partie est en attente (pret / IDLE), toucher N'IMPORTE QUELLE cloche place la mise et l'ouvre !
    if (jeu.statut === 'pret') {
      if (balance < currentBet) {
        Alert.alert('Solde insuffisant', 'Veuillez recharger votre compte ou baisser votre mise.');
        return;
      }

      withdraw(currentBet);
      initAllWinningPlates();
      setWinnings(0);
      setDishCounts({ HAM: 0, PANCAKES: 0, CHICKEN: 0, PIE: 0, CAKE: 0 });
      setLastRevealedDish(null);
      jeu.demarrer();
      await jeu.choisir(ligne, colonne);
      return;
    }

    // 2. En cours de jeu : ouvrir la cloche touchée
    if (jeu.statut === 'enJeu') {
      await jeu.choisir(ligne, colonne);
    }
  };

  const handleCashout = () => {
    if (jeu.statut === 'enJeu' && winnings > 0) {
      deposit(winnings);
      jeu.encaisser();
      setTimeout(() => {
        jeu.reinitialiser();
        setWinnings(0);
        setDishCounts({ HAM: 0, PANCAKES: 0, CHICKEN: 0, PIE: 0, CAKE: 0 });
        setLastRevealedDish(null);
      }, 2800);
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'Règles du jeu - Royal Feast',
      '1. Ouvrez un plat à la fois (max 15 plats).\n' +
      '2. Chaque mets augmente vos gains selon le multiplicateur.\n' +
      '3. Vous pouvez encaisser vos gains à tout moment.\n' +
      '4. Remplissez les jauges sous JACKPOT pour maximiser vos festins !'
    );
  };

  // Synchronisation du statut avec les sous-composants
  const mappedStatus: GameStatus =
    jeu.statut === 'pret'
      ? 'IDLE'
      : jeu.statut === 'attente'
      ? 'EVALUATING'
      : jeu.statut === 'encaisse'
      ? 'CASHED_OUT'
      : jeu.statut === 'complet'
      ? 'WON'
      : jeu.statut === 'perdu'
      ? 'LOST'
      : jeu.etape > 0
      ? 'REVEALED'
      : 'PLAYING';

  const nextMultiplier = MULTIPLIERS[jeu.etape] || MULTIPLIERS[MULTIPLIERS.length - 1];

  if (!hasAccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1A0E2E', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="lock-closed" size={56} color="#EF4444" />
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
          Accès restreint
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Votre compte n'a pas l'autorisation d'accéder au jeu Royal Feast. Veuillez contacter votre administrateur.
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Image de fond s'étendant à 100% de l'écran (plein écran sans aucune bande noire) */}
      <ImageBackground
        source={UI_IMAGES.BACKGROUND}
        style={styles.boardImage}
        resizeMode="stretch"
      >
        {/* Header blanc avec identité de l'app, pastille solde et safe area */}
        <TopBar
          balance={balance}
          onBackPress={() => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('MainTabs', { screen: 'Populaire' });
            }
          }}
          onPlusPress={() => {
            setIsBetModalVisible(true);
          }}
          onBonusPress={() => {
            Alert.alert('Bonus', 'Section bonus disponible prochainement.');
          }}
        />

        {/* Jauges animées des 6 nourritures sous JACKPOT */}
        <TopDishGauges
          dishCounts={dishCounts}
          lastRevealedDish={lastRevealedDish}
          triggerKey={triggerKey}
        />

        {/* Grille des 25 cloches 100% touchables avec animations officielles */}
        <PlateGrid
          jeu={jeu}
          boardWidth={boardWidth}
          boardHeight={boardHeight}
          onPressCloche={handlePressCloche}
        />

        {/* Bannière centrale avec état, prochaine étape et gains */}
        <StatusBanner
          status={mappedStatus}
          openedCount={jeu.etape}
          winnings={winnings}
          isOpening={jeu.statut === 'attente'}
          nextMultiplier={nextMultiplier}
        />

        {/* Console basse avec commandes */}
        <BottomControls
          status={mappedStatus}
          currentBet={currentBet}
          winnings={winnings}
          openedCount={jeu.etape}
          onPlayPress={handleStartGame}
          onCashoutPress={handleCashout}
          onBetModalOpen={() => setIsBetModalVisible(true)}
          onHelpPress={handleHelp}
        />

        <BetModal
          visible={isBetModalVisible}
          currentBet={currentBet}
          balance={balance}
          onClose={() => setIsBetModalVisible(false)}
          onSetBet={(newBet) => setCurrentBet(newBet)}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
  },
  boardImage: {
    width: '100%',
    height: '100%',
  },
});