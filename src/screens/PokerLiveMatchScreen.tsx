import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  ActivityIndicator,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BackArrowIcon } from '../components/common/BackArrowIcon';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { useCouponStore } from '../store/couponStore';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { MatchEvent } from '../types/bet';
import { Typography } from '../theme/theme';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { generateRealisticPokerDraw } from '../utils/pokerEngine';

// ============================================================================
// ASSETS DU FLUX DIRECT TVBET POKER ET DU FOND OFFICIEL
// ============================================================================
const POKER_VIDEO_MP4 = require('../../assets/ui/tvbet_poker_live.mp4');
const POKER_SPRITE_IMG = require('../../assets/ui/tvbet_poker_sprite.jpg');
const POKER_POSTER_IMG = require('../../assets/ui/tvbet_poker_poster.jpg');
const POKER_BG_BALLS = require('../../assets/POKER/bg_balls_clean.jpg');

const SPRITE_COLS = 8;
const SPRITE_ROWS = 8;
const SPRITE_FRAMES = 64;

/**
 * Résout de façon sûre l'URL d'un asset média (vidéo ou image) sur le Web,
 * qu'il soit renvoyé sous forme de chaîne hachée, d'objet { uri }, d'export default ou d'id Expo.
 */
const resolveWebMediaUri = (moduleAsset: any, fallbackPath: string): string => {
  if (typeof moduleAsset === 'string' && moduleAsset.trim().length > 0) {
    return moduleAsset;
  }
  if (moduleAsset && typeof moduleAsset.uri === 'string' && moduleAsset.uri.trim().length > 0) {
    return moduleAsset.uri;
  }
  if (moduleAsset && typeof moduleAsset.default === 'string' && moduleAsset.default.trim().length > 0) {
    return moduleAsset.default;
  }
  if (moduleAsset && moduleAsset.default && typeof moduleAsset.default.uri === 'string') {
    return moduleAsset.default.uri;
  }
  if (typeof moduleAsset === 'number') {
    try {
      const asset = Asset.fromModule(moduleAsset);
      if (asset?.uri) return asset.uri;
    } catch {
      // ignore
    }
  }
  return fallbackPath;
};

// ============================================================================
// LECTEUR VIDÉO DU FLUX DIRECT (DAME TENANT LES CARTES)
// ============================================================================
const TvBetPokerLivePlayer: React.FC<{
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  width: number;
  height: number;
}> = ({ isPlaying, isMuted, onToggleMute, width, height }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [webVideoError, setWebVideoError] = useState(false);
  const videoRef = useRef<any>(null);

  const directFallbackUri = '/assets/ui/tvbet_poker_live.mp4';

  const resolvedWebVideoUri = useMemo(() => {
    if (Platform.OS === 'web') {
      return resolveWebMediaUri(POKER_VIDEO_MP4, directFallbackUri);
    }
    return null;
  }, [directFallbackUri]);

  const useWebVideo = Platform.OS === 'web' && Boolean(resolvedWebVideoUri) && !webVideoError;

  // Gestion impérative du son muet et du démarrage de lecture pour contourner la politique autoplay du navigateur
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = videoRef.current;
    if (!el) return;

    try {
      el.muted = true;
      el.defaultMuted = true;
      el.playsInline = true;
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    } catch {
      // ignore
    }

    const onFirstUserAction = () => {
      if (el && el.paused) {
        el.muted = true;
        el.play().catch(() => {});
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', onFirstUserAction, { passive: true });
      window.addEventListener('touchstart', onFirstUserAction, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', onFirstUserAction);
        window.removeEventListener('touchstart', onFirstUserAction);
      }
    };
  }, [resolvedWebVideoUri, isPlaying]);

  useEffect(() => {
    if (useWebVideo || !isPlaying) return;
    const interval = setInterval(() => {
      setFrameIndex((f) => (f + 1) % SPRITE_FRAMES);
    }, 45);
    return () => clearInterval(interval);
  }, [useWebVideo, isPlaying]);

  const col = frameIndex % SPRITE_COLS;
  const row = Math.floor(frameIndex / SPRITE_COLS);

  return (
    <View style={[styles.playerContainer, { width, height }]}>
      {useWebVideo && resolvedWebVideoUri ? (
        React.createElement(
          'video',
          {
            ref: (el: any) => {
              videoRef.current = el;
              if (el) {
                el.muted = true;
                el.defaultMuted = true;
                el.playsInline = true;
                el.setAttribute('playsinline', '');
                el.setAttribute('webkit-playsinline', '');
                el.play?.().catch(() => {});
              }
            },
            key: resolvedWebVideoUri,
            autoPlay: true,
            muted: true,
            loop: true,
            playsInline: true,
            preload: 'auto',
            controls: false,
            onError: () => {
              if (videoRef.current && directFallbackUri && videoRef.current.src !== directFallbackUri) {
                videoRef.current.src = directFallbackUri;
                videoRef.current.play().catch(() => {});
              } else {
                setWebVideoError(true);
              }
            },
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#000000',
              display: 'block',
              pointerEvents: 'none',
            },
          },
          [
            React.createElement('source', {
              key: 'src-primary',
              src: resolvedWebVideoUri,
              type: 'video/mp4',
            }),
            directFallbackUri && directFallbackUri !== resolvedWebVideoUri
              ? React.createElement('source', {
                  key: 'src-fallback',
                  src: directFallbackUri,
                  type: 'video/mp4',
                })
              : null,
          ].filter(Boolean)
        )
      ) : (
        <View style={styles.spriteViewport}>
          <Image
            source={POKER_POSTER_IMG}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <Image
            source={POKER_SPRITE_IMG}
            fadeDuration={0}
            resizeMode="stretch"
            style={{
              width: width * SPRITE_COLS,
              height: height * SPRITE_ROWS,
              transform: [
                { translateX: -col * width },
                { translateY: -row * height },
              ],
            }}
          />
        </View>
      )}

      {isBuffering && (
        <View style={[StyleSheet.absoluteFill, styles.bufferingOverlay]}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      <View style={styles.liveWatermark}>
        <View style={styles.liveRedDot} />
        <Text style={styles.liveWatermarkText}>EN DIRECT</Text>
      </View>

      <TouchableOpacity
        style={styles.soundButton}
        activeOpacity={0.8}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          onToggleMute();
        }}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={16}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
};

// ============================================================================
// ÉCRAN PRINCIPAL : TVBET POKER LIVE MATCH
// ============================================================================
export default function PokerLiveMatchScreen({ route, navigation }: any) {
  const { currentTheme, isDark, brandChoice } = useThemeStore();
  const { width: screenWidth, isTablet, isDesktop, contentContainerStyle } = useResponsive();
  const { addEvent } = useCouponStore();

  const brandAccentColor =
    brandChoice === 'melbet'
      ? '#E7B12C'
      : brandChoice === 'winwin'
      ? '#7CBD17'
      : brandChoice === 'betwinner'
      ? '#007348'
      : brandChoice === 'megapari' || brandChoice === 'megaparis'
      ? '#D3242A'
      : '#22C55E';

  const event: MatchEvent = route?.params?.event || {
    id: 'poker-live-round',
    sport: 'TvBet. POKER',
    league: 'TvBet. POKER',
    homeTeam: { name: 'TvBet. POKER' },
    awayTeam: { name: 'PB232595' },
    prediction: 'Combinaison gagnante. Carte haute',
    odd: 1.001,
    roundCode: 'PB232595',
    date: new Date().toISOString(),
    status: 'En cours',
  };

  const roundCode =
    event.roundCode ||
    (event as any).additionalInfo ||
    (event.pokerResult as any)?.roundCode ||
    'PB232595';

  // Mode d'affichage du haut : carrousel entre Vue Vidéo Direct et Vue Scoreboard (défaut: vidéo comme sur la capture)
  const [topMode, setTopMode] = useState<'video' | 'info'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Accordéons
  const [isCombinationsOpen, setIsCombinationsOpen] = useState(true);
  const [isHandsOpen, setIsHandsOpen] = useState(true);
  const [selectedOddKey, setSelectedOddKey] = useState<string | null>(null);

  // Chronomètre en direct "temps écoulé : MM : SS" (initialisé à 02:21 comme sur la capture)
  const [elapsedSeconds, setElapsedSeconds] = useState(141); // 2min 21s
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = useMemo(() => {
    const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    return `${mins} : ${secs}`;
  }, [elapsedSeconds]);

  // Dimension responsive du lecteur vidéo et du bloc média supérieur
  const playerWidth = useMemo(() => {
    const maxContentWidth = isDesktop ? 680 : isTablet ? 580 : screenWidth;
    return Math.min(maxContentWidth - 24, 460);
  }, [screenWidth, isTablet, isDesktop]);

  const playerHeight = useMemo(() => {
    return Math.round(playerWidth * (208 / 364));
  }, [playerWidth]);

  const mediaHeight = useMemo(() => {
    return playerHeight + 36;
  }, [playerHeight]);

  // Calcul responsive de la largeur d'une carte de cote (2 colonnes parfaites, centré sur tablettes/desktop)
  const cardWidth = useMemo(() => {
    const maxContentWidth = isDesktop ? 680 : isTablet ? 580 : screenWidth;
    const horizontalPadding = 12; // Marge gauche/droite de l'écran
    const gap = 8; // Espace entre les 2 colonnes
    return (maxContentWidth - horizontalPadding * 2 - gap) / 2;
  }, [screenWidth, isTablet, isDesktop]);

  // Combinaisons gagnantes conformes à la capture utilisateur
  const COMBINATION_OPTIONS = [
    { key: 'carte_haute', name: 'Carte haute', odd: 1.001 },
    { key: 'couleur', name: 'Couleur', odd: 1.001 },
    { key: 'une_paire', name: 'Une Paire', odd: 1.001 },
    { key: 'full_house', name: 'Full House', odd: 4.75 },
    { key: 'deux_paires', name: 'Deux Paires', odd: 1.001 },
    { key: 'carre', name: 'Carré', odd: 32 },
    { key: 'brelan', name: 'Brelan', odd: 1.19 },
    { key: 'quinte_flush', name: 'Quinte flush', odd: 1.001 },
    { key: 'quinte', name: 'Quinte', odd: 1.001 },
    { key: 'quinte_flush_royale', name: 'Quinte flush royale', odd: 1.001 },
  ];

  // Mains gagnantes conformes
  const HAND_OPTIONS = [
    { key: 'hand_1', label: '(1)', odd: 3.25 },
    { key: 'hand_2', label: '(2)', odd: 6.4 },
    { key: 'hand_3', label: '(3)', odd: 6.0 },
    { key: 'hand_4', label: '(4)', odd: 8.5 },
    { key: 'hand_5', label: '(5)', odd: 12.0 },
    { key: 'hand_6', label: '(6)', odd: 18.0 },
  ];

  const handleSelectOdd = (key: string, name: string, odd: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setSelectedOddKey(key);

    const handMatch = name.match(/\(([1-6])\)/);
    const targetHand = handMatch ? parseInt(handMatch[1], 10) : undefined;
    const pokerRes = generateRealisticPokerDraw(targetHand, name, `poker-${key}-${roundCode}`);

    addEvent({
      id: `poker-odd-${key}-${roundCode}`,
      homeTeam: { name: 'TvBet. POKER' },
      awayTeam: { name: roundCode },
      league: 'TvBet. POKER',
      sport: 'TvBet. POKER',
      prediction: name,
      odd: odd,
      isLive: true,
      matchTime: 'EN DIRECT',
      date: new Date().toISOString(),
      status: 'En cours',
      gameCategory: 'poker',
      pokerResult: pokerRes,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* =====================================================================
          1. EN-TÊTE SUPÉRIEUR NOIR (EXACTEMENT COMME SUR LA CAPTURE)
          ===================================================================== */}
      <View style={styles.header}>
        {/* Bouton Retour */}
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackArrowIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Titre central : TvBet. POKER. / PB232801 */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerLeagueText}>TvBet. POKER.</Text>
          <Text style={styles.headerRoundText}>{roundCode}</Text>
        </View>

        {/* Actions à droite : Éclair (pari 1-clic) & 3-points */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
            }}
          >
            <Ionicons name="flash" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
            }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* =====================================================================
          2. BLOC MÉDIA RESPONSIVE : VIDÉO DIRECTE SUR FOND DES BALLONS & COUPE
          ===================================================================== */}
      <View style={[styles.topMediaBox, { height: mediaHeight }]}>
        {/* Fond des ballons de sport et de la coupe dorée */}
        <ImageBackground
          source={POKER_BG_BALLS}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {topMode === 'video' ? (
            /* Mode Vidéo en direct de la dame tenant les cartes */
            <View style={[styles.videoCardWrapper, { width: playerWidth, height: playerHeight }]}>
              <TvBetPokerLivePlayer
                isPlaying={isPlaying}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((m) => !m)}
                width={playerWidth}
                height={playerHeight}
              />
            </View>
          ) : (
            /* Mode Tableau d'affichage / Scoreboard avec timer et date */
            <View style={styles.scoreboardOverlay}>
              <Text style={styles.scoreboardTitle}>POKER</Text>
              <Text style={styles.scoreboardSub}>temps écoulé :</Text>
              <Text style={styles.scoreboardTimer}>{formattedTimer}</Text>
              <Text style={styles.scoreboardDate}>29.10.2026 (03:50 PM)</Text>
            </View>
          )}

          {/* Indicateur Carrousel (Deux capsules — — en bas au centre) */}
          <View style={styles.carouselDotsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTopMode('video')}
              style={[
                styles.carouselDot,
                topMode === 'video' ? styles.carouselDotActive : styles.carouselDotInactive,
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTopMode('info')}
              style={[
                styles.carouselDot,
                topMode === 'info' ? styles.carouselDotActive : styles.carouselDotInactive,
              ]}
            />
          </View>
        </ImageBackground>
      </View>

      {/* =====================================================================
          3. BARRE DE RECHERCHE SOMBRE AVEC TRAIT VERT ACTIF
          ===================================================================== */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchBarLeft}>
            <TouchableOpacity style={styles.searchIconBtn}>
              <Ionicons name="search" size={19} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.searchIconBtn, { marginLeft: 14 }]}>
              <MaterialCommunityIcons name="lead-pencil" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarCenter}>
            <Text style={styles.tabTextActive}>Temps réglementaire</Text>
          </View>

          {/* Espace vide pour équilibrer la ligne */}
          <View style={{ width: 60 }} />
        </View>

        {/* Liseré actif centré sous "Temps réglementaire" adapté à la marque */}
        <View style={styles.greenIndicatorRow}>
          <View style={[styles.greenIndicatorPill, { backgroundColor: brandAccentColor }]} />
        </View>
      </View>

      {/* =====================================================================
          4. SECTION DES MARCHÉS ET COTES (RESPONSIVE & MULTI-THÈMES)
          ===================================================================== */}
      <ScrollView
        style={[
          styles.marketsScroll,
          { backgroundColor: currentTheme.isDark ? currentTheme.background : '#FFFFFF' },
        ]}
        contentContainerStyle={[
          styles.marketsScrollContent,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* -------------------------------------------------------------------
            ACCORDÉON 1 : COMBINAISON GAGNANTE (GRILLE 2 COLONNES DE PILULES)
            ------------------------------------------------------------------- */}
        <View style={styles.accordionWrap}>
          <TouchableOpacity
            style={styles.accordionHeader}
            activeOpacity={0.7}
            onPress={() => setIsCombinationsOpen((v) => !v)}
          >
            <Text
              style={[
                styles.accordionTitle,
                { color: currentTheme.isDark ? currentTheme.textPrimary : '#132F4C' },
              ]}
            >
              Combinaison gagnante
            </Text>
            <View style={styles.accordionRightIcons}>
              <Ionicons
                name="pin-outline"
                size={17}
                color={currentTheme.isDark ? currentTheme.textSecondary : '#8E9EB0'}
                style={{ marginRight: 12 }}
              />
              <Ionicons
                name={isCombinationsOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={currentTheme.isDark ? (currentTheme.primary || '#3B82F6') : '#2462A2'}
              />
            </View>
          </TouchableOpacity>

          {isCombinationsOpen && (
            <View style={styles.gridContainer}>
              {COMBINATION_OPTIONS.map((item) => {
                const isSelected = selectedOddKey === item.key;

                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.75}
                    style={[
                      styles.pillOddCard,
                      {
                        width: cardWidth,
                        backgroundColor: currentTheme.isDark ? currentTheme.cardBackground : '#F3F6FA',
                        borderWidth: currentTheme.isDark ? 1 : 0,
                        borderColor: currentTheme.border || '#263342',
                      },
                      isSelected && {
                        backgroundColor: currentTheme.isDark ? 'rgba(59, 130, 246, 0.22)' : '#E8F2FE',
                        borderWidth: 1.5,
                        borderColor: currentTheme.primary || '#3B82F6',
                      },
                    ]}
                    onPress={() => handleSelectOdd(item.key, `Combinaison gagnante. ${item.name}`, item.odd)}
                  >
                    {/* Nom de la combinaison centré */}
                    <Text
                      style={[
                        styles.combinationLabel,
                        { color: currentTheme.isDark ? currentTheme.textSecondary : '#7E8FA3' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    {/* Ligne inférieure : Icône cadenas 🔒 + Cote en gras */}
                    <View style={styles.oddRowCentered}>
                      <Ionicons
                        name="lock-closed"
                        size={11}
                        color={currentTheme.isDark ? currentTheme.textSecondary : '#63788F'}
                        style={styles.lockIcon}
                      />
                      <Text
                        style={[
                          styles.oddValueText,
                          { color: currentTheme.isDark ? currentTheme.textPrimary : '#1B3B60' },
                        ]}
                      >
                        {formatCleanOdds(item.odd)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* -------------------------------------------------------------------
            ACCORDÉON 2 : QUELLE MAIN VA GAGNER ? (6 MAINS EN PILULES BLANCHES)
            ------------------------------------------------------------------- */}
        <View style={[styles.accordionWrap, { marginTop: 14 }]}>
          <TouchableOpacity
            style={styles.accordionHeader}
            activeOpacity={0.7}
            onPress={() => setIsHandsOpen((v) => !v)}
          >
            <Text
              style={[
                styles.accordionTitle,
                { color: currentTheme.isDark ? currentTheme.textPrimary : '#132F4C' },
              ]}
            >
              Quelle Main va gagner ?
            </Text>
            <View style={styles.accordionRightIcons}>
              <Ionicons
                name="pin-outline"
                size={17}
                color={currentTheme.isDark ? currentTheme.textSecondary : '#8E9EB0'}
                style={{ marginRight: 12 }}
              />
              <Ionicons
                name={isHandsOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={currentTheme.isDark ? (currentTheme.primary || '#3B82F6') : '#2462A2'}
              />
            </View>
          </TouchableOpacity>

          {isHandsOpen && (
            <View style={styles.gridContainer}>
              {HAND_OPTIONS.map((item) => {
                const isSelected = selectedOddKey === item.key;

                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.75}
                    style={[
                      styles.pillOddCard,
                      {
                        width: cardWidth,
                        backgroundColor: currentTheme.isDark ? currentTheme.cardBackground : '#F3F6FA',
                        borderWidth: currentTheme.isDark ? 1 : 0,
                        borderColor: currentTheme.border || '#263342',
                      },
                      isSelected && {
                        backgroundColor: currentTheme.isDark ? 'rgba(59, 130, 246, 0.22)' : '#E8F2FE',
                        borderWidth: 1.5,
                        borderColor: currentTheme.primary || '#3B82F6',
                      },
                    ]}
                    onPress={() => handleSelectOdd(item.key, `Quelle Main va gagner ? ${item.label}`, item.odd)}
                  >
                    <Text
                      style={[
                        styles.combinationLabel,
                        { color: currentTheme.isDark ? currentTheme.textSecondary : '#7E8FA3' },
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View style={styles.oddRowCentered}>
                      <Ionicons
                        name="lock-closed"
                        size={11}
                        color={currentTheme.isDark ? currentTheme.textSecondary : '#63788F'}
                        style={styles.lockIcon}
                      />
                      <Text
                        style={[
                          styles.oddValueText,
                          { color: currentTheme.isDark ? currentTheme.textPrimary : '#1B3B60' },
                        ]}
                      >
                        {formatCleanOdds(item.odd)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES PIXEL-PERFECT CONFORMES À LA CAPTURE D'ÉCRAN FOURNIE
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 1. En-tête supérieur noir
  header: {
    height: 52,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeagueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
    fontFamily: Typography.fontFamily,
  },
  headerRoundText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    fontFamily: Typography.fontFamily,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Zone média supérieure (fond des ballons + vidéo ou scoreboard)
  topMediaBox: {
    width: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  scoreboardOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  scoreboardTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Typography.fontFamily,
    marginBottom: 4,
  },
  scoreboardSub: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 2,
  },
  scoreboardTimer: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  scoreboardDate: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 13.5,
    fontWeight: '500',
  },
  carouselDotsRow: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  carouselDot: {
    height: 3,
    borderRadius: 1.5,
  },
  carouselDotActive: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  carouselDotInactive: {
    width: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },

  // Lecteur vidéo dans le conteneur
  videoCardWrapper: {
    alignSelf: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: '#000000',
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  playerContainer: {
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  spriteViewport: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  bufferingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveWatermark: {
    position: 'absolute',
    top: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 5,
  },
  liveWatermarkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  soundButton: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 3. Barre de recherche et onglet avec trait vert actif
  searchBarContainer: {
    backgroundColor: '#11171E',
  },
  searchBarRow: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  searchBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
    fontFamily: Typography.fontFamily,
  },
  greenIndicatorRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  greenIndicatorPill: {
    width: 82,
    height: 3.2,
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },

  // 4. Section des marchés sur fond blanc
  marketsScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  marketsScrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 95, // Dégagement pour la barre inférieure persistante
  },

  // En-têtes d'accordéons
  accordionWrap: {
    marginBottom: 6,
  },
  accordionHeader: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  accordionTitle: {
    color: '#132F4C',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: Typography.fontFamily,
  },
  accordionRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Grille 2 colonnes responsive de pilules
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOddCard: {
    height: 52,
    backgroundColor: '#F3F6FA',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  pillOddCardSelected: {
    backgroundColor: '#E8F2FE',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  combinationLabel: {
    color: '#7E8FA3',
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 3,
    fontFamily: Typography.fontFamily,
  },
  oddRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    marginRight: 4,
  },
  oddValueText: {
    color: '#1B3B60',
    fontSize: 14.5,
    fontWeight: '800',
    fontFamily: Typography.fontFamily,
  },
});
