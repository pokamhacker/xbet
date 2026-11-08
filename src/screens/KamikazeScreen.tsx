import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  type LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreventRemove } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker/400Regular';
import { RobotoCondensed_400Regular } from '@expo-google-fonts/roboto-condensed/400Regular';
import { RobotoCondensed_700Bold } from '@expo-google-fonts/roboto-condensed/700Bold';

import { useAuthStore } from '../store/authStore';

import { ActionBar } from '../games/kamikaze/components/ActionBar';
import { Banner } from '../games/kamikaze/components/Banner';
import { BetModal } from '../games/kamikaze/components/BetModal';
import { Header } from '../games/kamikaze/components/Header';
import { PlayField, type PlayFieldHandle } from '../games/kamikaze/components/PlayField';
import { RulesModal } from '../games/kamikaze/components/RulesModal';
import { Scene } from '../games/kamikaze/components/Scene';
import { Toast } from '../games/kamikaze/components/Toast';
import { TopBar } from '../games/kamikaze/components/TopBar';
import { MIN_BET } from '../games/kamikaze/game/config';
import { computeLayout, payout } from '../games/kamikaze/game/engine';
import { formatMoney } from '../games/kamikaze/game/format';
import { useKamikaze } from '../games/kamikaze/game/useKamikaze';
import { COLORS } from '../games/kamikaze/theme';

/** Demande confirmation avant de quitter une manche dont la mise est engagée. */
function confirmLeave(message: string, onLeave: () => void) {
  if (Platform.OS === 'web') {
    // Alert.alert n'affiche rien sur le web.
    if (window.confirm(`Partie en cours\n\n${message}`)) onLeave();
    return;
  }
  Alert.alert('Partie en cours', message, [
    { text: 'Rester', style: 'cancel' },
    { text: 'Quitter', style: 'destructive', onPress: onLeave },
  ]);
}

export default function KamikazeScreen({ navigation }: any) {
  const hasAccess = useAuthStore((s) => s.hasAccessToFeature('game_kamikaze'));

  useEffect(() => {
    if (!hasAccess) {
      Alert.alert(
        'Accès restreint',
        "Vous n'avez pas l'autorisation d'accéder au jeu Kamikaze. Veuillez contacter votre administrateur.",
        [{ text: 'Compris', onPress: () => navigation.goBack() }]
      );
    }
  }, [hasAccess, navigation]);

  const insets = useSafeAreaInsets();
  const fieldRef = useRef<PlayFieldHandle>(null);
  const game = useKamikaze(fieldRef);
  const [fontsLoaded, fontError] = useFonts({
    PermanentMarker_400Regular,
    RobotoCondensed_400Regular,
    RobotoCondensed_700Bold,
  });

  const [area, setArea] = useState({ width: 0, height: 0 });
  const [betOpen, setBetOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Retour (bouton, geste ou touche Android) alors que la mise est débitée : elle serait perdue.
  usePreventRemove(game.atStake, ({ data }) => {
    const message =
      game.cleared >= 1
        ? `Vos gains de ${formatMoney(payout(game.bet, game.cleared))} XAF seront perdus. Touchez « Obtenir » pour les encaisser avant de quitter.`
        : `Votre mise de ${formatMoney(game.bet)} XAF sera perdue.`;
    confirmLeave(message, () => navigation.dispatch(data.action));
  });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea(a => (a.width === width && a.height === height ? a : { width, height }));
  }, []);

  const { pick } = game;
  const onPick = useCallback((col: number) => {
    void pick(col);
  }, [pick]);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Populaire' });
  };

  const openBet = () => {
    if (game.balance < MIN_BET) {
      game.notify('Solde virtuel insuffisant : touchez + pour le recharger');
      return;
    }
    setBetOpen(true);
  };

  const statusBar = <StatusBar barStyle="dark-content" />;

  // En cas d'échec de chargement des polices, on affiche quand même le jeu (polices système).
  if (!fontsLoaded && !fontError) {
    return (
      <View style={[styles.root, styles.center]}>
        {statusBar}
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  const layout = computeLayout(area.width, area.height);
  const ready = game.hydrated && area.height > 0;

  if (!hasAccess) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B111A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Ionicons name="lock-closed" size={56} color="#EF4444" />
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 16, textAlign: 'center' }}>
          Accès restreint
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
          Votre compte n'a pas l'autorisation d'accéder au jeu Kamikaze. Veuillez contacter votre administrateur.
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
    <View style={styles.root}>
      {statusBar}
      <Scene />
      <View style={[styles.column, { paddingBottom: insets.bottom }]}>
        {/* zone de la barre d'état : blanche, dans le prolongement de la barre du haut */}
        <View style={{ height: insets.top, backgroundColor: COLORS.topbar }} />
        <TopBar
          balance={game.balance}
          locked={game.phase === 'select'}
          sound={game.sound}
          onBack={goBack}
          onTopUp={game.topUp}
          onToggleSound={game.toggleSound}
        />
        <View style={styles.area} onLayout={onLayout}>
          {!ready && <ActivityIndicator color="#fff" style={styles.loader} />}
          {/* Le plateau est toujours monté pour que la référence d'animation existe dès le départ. */}
          <View style={[styles.field, { width: layout.fieldWidth, opacity: ready ? 1 : 0, pointerEvents: ready ? 'auto' : 'none' }]}>
            <Header width={layout.fieldWidth} onHelp={() => setRulesOpen(true)} />
            <Banner state={game.banner} width={layout.fieldWidth} />
            <PlayField
              ref={fieldRef}
              cell={layout.cell}
              activeLevel={game.activeLevel}
              shown={game.shown}
              picked={game.picked}
              interactive={game.interactive}
              onPick={onPick}
            />
            <View style={styles.spacer} />
            <ActionBar
              phase={game.phase}
              canCash={game.canCash}
              bet={game.bet}
              width={layout.fieldWidth}
              onPlay={openBet}
              onCash={() => void game.cashOut()}
              onSettings={openBet}
              onAgain={() => {
                if (!game.startRound(game.bet)) openBet();
              }}
            />
          </View>
        </View>
      </View>

      <BetModal
        visible={betOpen}
        initialBet={Math.max(MIN_BET, Math.min(game.bet, Math.floor(game.balance)))}
        balance={game.balance}
        onClose={() => setBetOpen(false)}
        onSubmit={bet => {
          setBetOpen(false);
          game.startRound(bet);
        }}
      />
      <RulesModal visible={rulesOpen} onClose={() => setRulesOpen(false)} />
      <Toast notice={game.notice} top={insets.top + 64} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.app },
  center: { alignItems: 'center', justifyContent: 'center' },
  column: { flex: 1 },
  area: { flex: 1, alignItems: 'center' },
  field: { alignItems: 'center' },
  spacer: { height: 18 },
  loader: { position: 'absolute', top: '45%' },
});
