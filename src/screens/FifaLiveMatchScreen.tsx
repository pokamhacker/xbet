import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackArrowIcon } from '../components/common/BackArrowIcon';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused } from '@react-navigation/native';
import Svg, {
  Circle,
  G,
  Path,
  Polygon,
  Rect,
} from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useResponsive } from '../utils/responsive';
import { useThemeStore } from '../stores/themeStore';
import { useCouponStore } from '../store/couponStore';
import { getTeamById } from '../data/sportsCatalog';
import { MatchEvent } from '../types/bet';
import { Typography } from '../theme/theme';
import { getEventLiveProgress, getEventStartTime } from '../utils/dateFormatter';
import { buildFifaMarkets, MarketGroupItem, MarketOddOption } from '../data/mockData';
import { formatCleanOdds } from '../utils/oddsFormatter';
import { formatBetSelectionLabel } from '../utils/scoreAdapter';

const FIFA_HEADER_BG = require('../../assets/ui/fifa24_player_smoke.jpg');
const FIFA_SPLASH_TOP_BG = require('../../assets/ui/fifa24_splash_top.jpg');
const FIFA_SPLASH_BALL = require('../../assets/ui/fifa_splash_ball.png');

// Assets vidéo & sprite-sheets par championnat FIFA
const FIFA_VOLTA_VIDEO = require('../../assets/ui/fifa_volta_live.mp4');
const FIFA_VOLTA_SPRITE = require('../../assets/ui/fifa_volta_sprite.jpg');

const FIFA_FC25_3X3_VIDEO = require('../../assets/ui/fifa_fc25_3x3_live.mp4');
const FIFA_FC25_3X3_SPRITE = require('../../assets/ui/fifa_fc25_3x3_sprite.jpg');
const FIFA_FC25_3X3_POSTER = require('../../assets/ui/fifa_fc25_3x3_poster.jpg');

const FIFA_FC26_RUSH_VIDEO = require('../../assets/ui/fifa_fc26_rush_live.mp4');
const FIFA_FC26_RUSH_SPRITE = require('../../assets/ui/fifa_fc26_rush_sprite.jpg');
const FIFA_FC26_RUSH_POSTER = require('../../assets/ui/fifa_fc26_rush_poster.jpg');

const SPRITE_COLS = 8;
const SPRITE_ROWS = 8;
const SPRITE_FRAMES = 64;

export type FifaBroadcastMode = 'fc26_rush' | 'fc25_3x3' | 'fc24_4x4';

export const resolveFifaBroadcastMode = (leagueStr?: string): FifaBroadcastMode => {
  const s = (leagueStr || '').toLowerCase();
  if (s.includes('rush') || s.includes('5x5') || s.includes('superligue') || s.includes('fc 26') || s.includes('fc26')) {
    return 'fc26_rush';
  }
  if (
    s.includes('3x3') ||
    s.includes('conférence') ||
    s.includes('conference') ||
    s.includes('européenne') ||
    s.includes('fc 25') ||
    s.includes('fc25')
  ) {
    return 'fc25_3x3';
  }
  return 'fc24_4x4';
};

const CLUB_CREST_MAP: Record<string, string> = {
  burnley: 'https://media.api-sports.io/football/teams/44.png',
  bournemouth: 'https://media.api-sports.io/football/teams/35.png',
  'afc bournemouth': 'https://media.api-sports.io/football/teams/35.png',
  braga: 'https://media.api-sports.io/football/teams/217.png',
  'sc braga': 'https://media.api-sports.io/football/teams/217.png',
  roma: 'https://media.api-sports.io/football/teams/497.png',
  'as roma': 'https://media.api-sports.io/football/teams/497.png',
  olympiacos: 'https://media.api-sports.io/football/teams/553.png',
  'olympiacos fc': 'https://media.api-sports.io/football/teams/553.png',
  liverpool: 'https://media.api-sports.io/football/teams/40.png',
  'psv eindhoven': 'https://media.api-sports.io/football/teams/197.png',
  psv: 'https://media.api-sports.io/football/teams/197.png',
  'heart of midlothian': 'https://media.api-sports.io/football/teams/254.png',
  'bayern munich': 'https://media.api-sports.io/football/teams/157.png',
  bayern: 'https://media.api-sports.io/football/teams/157.png',
  napoli: 'https://media.api-sports.io/football/teams/492.png',
  'real madrid': 'https://media.api-sports.io/football/teams/541.png',
  barcelona: 'https://media.api-sports.io/football/teams/529.png',
  'fc barcelona': 'https://media.api-sports.io/football/teams/529.png',
  'manchester city': 'https://media.api-sports.io/football/teams/50.png',
  'manchester united': 'https://media.api-sports.io/football/teams/33.png',
  arsenal: 'https://media.api-sports.io/football/teams/42.png',
  chelsea: 'https://media.api-sports.io/football/teams/49.png',
  tottenham: 'https://media.api-sports.io/football/teams/47.png',
  'tottenham hotspur': 'https://media.api-sports.io/football/teams/47.png',
  'luton town': 'https://media.api-sports.io/football/teams/1359.png',
  luton: 'https://media.api-sports.io/football/teams/1359.png',
  'aston villa': 'https://media.api-sports.io/football/teams/66.png',
  newcastle: 'https://media.api-sports.io/football/teams/34.png',
  'west ham': 'https://media.api-sports.io/football/teams/48.png',
  everton: 'https://media.api-sports.io/football/teams/45.png',
  fulham: 'https://media.api-sports.io/football/teams/36.png',
  brighton: 'https://media.api-sports.io/football/teams/51.png',
  brentford: 'https://media.api-sports.io/football/teams/55.png',
  'crystal palace': 'https://media.api-sports.io/football/teams/52.png',
  wolves: 'https://media.api-sports.io/football/teams/39.png',
  'paris saint-germain': 'https://media.api-sports.io/football/teams/85.png',
  psg: 'https://media.api-sports.io/football/teams/85.png',
  'inter milan': 'https://media.api-sports.io/football/teams/505.png',
  inter: 'https://media.api-sports.io/football/teams/505.png',
  juventus: 'https://media.api-sports.io/football/teams/496.png',
  'ac milan': 'https://media.api-sports.io/football/teams/489.png',
  dortmund: 'https://media.api-sports.io/football/teams/165.png',
  'borussia dortmund': 'https://media.api-sports.io/football/teams/165.png',
  villarreal: 'https://media.api-sports.io/football/teams/533.png',
  'villarreal cf': 'https://media.api-sports.io/football/teams/533.png',
  'atletico madrid': 'https://media.api-sports.io/football/teams/530.png',
  'atlético madrid': 'https://media.api-sports.io/football/teams/530.png',
  'atletico de madrid': 'https://media.api-sports.io/football/teams/530.png',
  'atlético de madrid': 'https://media.api-sports.io/football/teams/530.png',
  'athletic bilbao': 'https://media.api-sports.io/football/teams/531.png',
  'athletic club bilbao': 'https://media.api-sports.io/football/teams/531.png',
  'real sociedad': 'https://media.api-sports.io/football/teams/548.png',
  'real betis': 'https://media.api-sports.io/football/teams/543.png',
  'sevilla fc': 'https://media.api-sports.io/football/teams/536.png',
  'seville fc': 'https://media.api-sports.io/football/teams/536.png',
  sevilla: 'https://media.api-sports.io/football/teams/536.png',
  'valencia cf': 'https://media.api-sports.io/football/teams/532.png',
  valencia: 'https://media.api-sports.io/football/teams/532.png',
  'girona fc': 'https://media.api-sports.io/football/teams/547.png',
  girona: 'https://media.api-sports.io/football/teams/547.png',
  'ca osasuna': 'https://media.api-sports.io/football/teams/727.png',
  osasuna: 'https://media.api-sports.io/football/teams/727.png',
  'rc celta vigo': 'https://media.api-sports.io/football/teams/538.png',
  'celta vigo': 'https://media.api-sports.io/football/teams/538.png',
  'rayo vallecano': 'https://media.api-sports.io/football/teams/728.png',
  'rcd mallorca': 'https://media.api-sports.io/football/teams/798.png',
  mallorca: 'https://media.api-sports.io/football/teams/798.png',
  'getafe cf': 'https://media.api-sports.io/football/teams/546.png',
  getafe: 'https://media.api-sports.io/football/teams/546.png',
  'deportivo alavés': 'https://media.api-sports.io/football/teams/542.png',
  'deportivo alaves': 'https://media.api-sports.io/football/teams/542.png',
  alaves: 'https://media.api-sports.io/football/teams/542.png',
  'rcd espanyol': 'https://media.api-sports.io/football/teams/540.png',
  espanyol: 'https://media.api-sports.io/football/teams/540.png',
  'cd leganés': 'https://media.api-sports.io/football/teams/537.png',
  'cd leganes': 'https://media.api-sports.io/football/teams/537.png',
  leganes: 'https://media.api-sports.io/football/teams/537.png',
  'ud las palmas': 'https://media.api-sports.io/football/teams/534.png',
  'las palmas': 'https://media.api-sports.io/football/teams/534.png',
  'real valladolid': 'https://media.api-sports.io/football/teams/720.png',
  valladolid: 'https://media.api-sports.io/football/teams/720.png',
  'levante ud': 'https://media.api-sports.io/football/teams/539.png',
  levante: 'https://media.api-sports.io/football/teams/539.png',
  'elche cf': 'https://media.api-sports.io/football/teams/797.png',
  elche: 'https://media.api-sports.io/football/teams/797.png',
  'real oviedo': 'https://media.api-sports.io/football/teams/718.png',
  oviedo: 'https://media.api-sports.io/football/teams/718.png',
  'granada cf': 'https://media.api-sports.io/football/teams/715.png',
  granada: 'https://media.api-sports.io/football/teams/715.png',
  'ud almería': 'https://media.api-sports.io/football/teams/723.png',
  almeria: 'https://media.api-sports.io/football/teams/723.png',
  'cádiz cf': 'https://media.api-sports.io/football/teams/724.png',
  cadiz: 'https://media.api-sports.io/football/teams/724.png',
};

const resolveClubLogoUrl = (teamName: string, rawLogo?: string): string | null => {
  const lowerName = (teamName || '').trim().toLowerCase();
  // Comme sur la capture officielle : Borussia Monchengladbach utilise le maillot blanc avec drapeau allemand
  if (lowerName.includes('monchengladbach') || lowerName.includes('mönchengladbach') || lowerName.includes('gladbach')) {
    return null;
  }
  if (
    rawLogo &&
    (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) &&
    !rawLogo.includes('ui-avatars.com')
  ) {
    return rawLogo;
  }
  if (CLUB_CREST_MAP[lowerName]) {
    return CLUB_CREST_MAP[lowerName];
  }
  for (const [k, url] of Object.entries(CLUB_CREST_MAP)) {
    if (lowerName.includes(k) || k.includes(lowerName)) {
      return url;
    }
  }
  const catalogTeam = getTeamById(teamName);
  if (
    catalogTeam?.logo &&
    catalogTeam.logo.startsWith('http') &&
    !catalogTeam.logo.includes('ui-avatars.com')
  ) {
    return catalogTeam.logo;
  }
  return null;
};

/**
 * Formate le nom d'un club pour l'affiche TV intégrée à la vidéo (ex: "SC BRAGA", "OLYMPIACOS FC", "M'GLADBACH")
 */
const formatBroadcastClubName = (rawName: string): string => {
  const clean = (rawName || 'CLUB').trim();
  const lower = clean.toLowerCase();
  if (lower === 'braga') return 'SC BRAGA';
  if (lower === 'roma' || lower === 'as roma') return 'AS ROMA';
  if (lower === 'olympiacos') return 'OLYMPIACOS FC';
  if (lower.includes('monchengladbach') || lower.includes('mönchengladbach') || lower.includes('gladbach')) {
    return "M'GLADBACH";
  }
  if (lower === 'bournemouth') return 'AFC BOURNEMOUTH';
  if (lower === 'paris saint-germain') return 'PARIS SG';
  return clean.toUpperCase().slice(0, 14);
};

/**
 * Formate l'abréviation 3 lettres pour l'affiche RUSH FC 26 (ex: "LIV", "PSV", "RMA")
 */
const formatRushClubAbbr = (rawName: string): string => {
  const clean = (rawName || 'CLB').trim();
  const lower = clean.toLowerCase();
  if (lower.includes('liverpool')) return 'LIV';
  if (lower.includes('psv')) return 'PSV';
  if (lower.includes('paris') || lower === 'psg') return 'PSG';
  if (lower.includes('real madrid')) return 'RMA';
  if (lower.includes('barcelon')) return 'BAR';
  if (lower.includes('manchester city')) return 'MCI';
  if (lower.includes('manchester united')) return 'MUN';
  if (lower.includes('bayern')) return 'BAY';
  if (lower.includes('dortmund')) return 'BVB';
  if (lower.includes('monchengladbach') || lower.includes('gladbach')) return 'BMG';
  if (lower.includes('olympiacos')) return 'OLY';
  if (lower.includes('roma')) return 'ROM';
  if (lower.includes('braga')) return 'BRA';
  const letters = clean.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (letters.slice(0, 3) || 'CLB').padEnd(3, 'X');
};

interface TeamStatsData {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalDiff: string;
}

/**
 * Maillot blanc avec petit drapeau national en bas à droite (identique à Borussia Monchengladbach sur la capture)
 */
const JerseyFallbackBadge: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      {/* Corps du maillot blanc/gris clair avec col vert */}
      <Path
        d="M11 6 L15 4.5 C16 6.2 20 6.2 21 4.5 L25 6 L31 11 L28 15.5 L25 13.5 L25 29 L11 29 L11 13.5 L8 15.5 L5 11 L11 6 Z"
        fill="#F8FAFC"
        stroke="#CBD5E1"
        strokeWidth="1"
      />
      <Path
        d="M14.5 4.8 C16 7 20 7 21.5 4.8"
        stroke="#15803D"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Ombre verte légère en bas du maillot */}
      <Rect x="11.5" y="23" width="13" height="5.5" fill="#16A34A" opacity={0.35} />
      {/* Petit drapeau Allemagne en bas à droite */}
      <Rect x="22" y="27" width="9" height="2" fill="#111827" />
      <Rect x="22" y="29" width="9" height="2" fill="#DC2626" />
      <Rect x="22" y="31" width="9" height="2" fill="#FACC15" />
    </Svg>
  </View>
);

/**
 * Blason d'équipe FIFA dans l'en-tête avec sous-badge étoile favori circulaire (bleu ou doré selon thème)
 */
const FifaHeaderTeamBadge: React.FC<{
  logoUrl: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  starBgColor?: string;
  size?: number;
  side?: 'left' | 'right';
}> = ({
  logoUrl,
  isFavorite,
  onToggleFavorite,
  starBgColor = '#5582A7',
  size = 38,
  side = 'left',
}) => {
    const [imgError, setImgError] = useState(false);

    return (
      <View style={[styles.teamCrestOuter, { width: size + 6, height: size + 6 }]}>
        {logoUrl && !imgError ? (
          <Image
            source={{ uri: logoUrl }}
            style={{ width: size, height: size }}
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <JerseyFallbackBadge size={size} />
        )}

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onToggleFavorite}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={[
            styles.favoriteStarSubBadge,
            side === 'right' ? { left: -2, right: undefined } : { right: -2 },
            { backgroundColor: starBgColor },
          ]}
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={10.5}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

/**
 * Petit blason d'équipe pour la carte "Statistiques de match" (Mi-temps 1 & Mi-temps 2)
 */
const MiniClubCrest: React.FC<{ logoUrl: string | null }> = ({ logoUrl }) => {
  const [err, setErr] = useState(false);
  if (logoUrl && !err) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={styles.miniCrestImg}
        resizeMode="contain"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <View style={styles.miniCrestFallback}>
      <JerseyFallbackBadge size={22} />
    </View>
  );
};

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
      if (asset?.localUri) return asset.localUri;
      if (asset?.uri) return asset.uri;
    } catch {
      // ignore
    }
  }
  return fallbackPath;
};

const resolveImageSource = (moduleAsset: any, fallbackPath: string): any => {
  if (Platform.OS === 'web') {
    return { uri: resolveWebMediaUri(moduleAsset, fallbackPath) };
  }
  return moduleAsset;
};

/**
 * Lecteur vidéo multi-championnat FIFA (FC 26 5x5 Rush, FC 25 3x3 Ligue de conférence, FC 24 4x4 Volta)
 * avec incrustation TV dynamique du nom des clubs et du score choisis par l'utilisateur.
 */
const FifaChampionshipStreamPlayer: React.FC<{
  mode: FifaBroadcastMode;
  streamUrl?: string;
  isPlaying: boolean;
  isFinished: boolean;
  homeTeamName: string;
  awayTeamName: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  homeScore: string | number;
  awayScore: string | number;
  matchSeconds: number;
  width: number;
  height: number;
}> = ({
  mode,
  streamUrl,
  isPlaying,
  isFinished,
  homeTeamName,
  awayTeamName,
  homeLogoUrl,
  awayLogoUrl,
  homeScore,
  awayScore,
  matchSeconds,
  width: propWidth,
  height: propHeight,
}) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [viewport, setViewport] = useState({
      width: propWidth || 364,
      height: propHeight || 200,
    });
    const [webVideoError, setWebVideoError] = useState(false);
    const [webVideoReady, setWebVideoReady] = useState(false);
    const [showRushTransition, setShowRushTransition] = useState(false);
    const videoRef = useRef<any>(null);

    useEffect(() => {
      if (propWidth > 0 && propHeight > 0) {
        setViewport({ width: propWidth, height: propHeight });
      }
    }, [propWidth, propHeight]);

    const videoModule = useMemo(() => {
      if (mode === 'fc26_rush') return FIFA_FC26_RUSH_VIDEO;
      if (mode === 'fc25_3x3') return FIFA_FC25_3X3_VIDEO;
      return FIFA_VOLTA_VIDEO;
    }, [mode]);

    const spriteSource = useMemo(() => {
      if (mode === 'fc26_rush') {
        return resolveImageSource(FIFA_FC26_RUSH_SPRITE, '/assets/ui/fifa_fc26_rush_sprite.jpg');
      }
      if (mode === 'fc25_3x3') {
        return resolveImageSource(FIFA_FC25_3X3_SPRITE, '/assets/ui/fifa_fc25_3x3_sprite.jpg');
      }
      return resolveImageSource(FIFA_VOLTA_SPRITE, '/assets/ui/fifa_volta_sprite.jpg');
    }, [mode]);

    const posterSource = useMemo(() => {
      if (mode === 'fc26_rush') {
        return resolveImageSource(FIFA_FC26_RUSH_POSTER, '/assets/ui/fifa_fc26_rush_poster.jpg');
      }
      if (mode === 'fc25_3x3') {
        return resolveImageSource(FIFA_FC25_3X3_POSTER, '/assets/ui/fifa_fc25_3x3_poster.jpg');
      }
      return null;
    }, [mode]);

    const directFallbackUri = useMemo(() => {
      if (mode === 'fc26_rush') return '/assets/ui/fifa_fc26_rush_live.mp4';
      if (mode === 'fc25_3x3') return '/assets/ui/fifa_fc25_3x3_live.mp4';
      return '/assets/ui/fifa_volta_live.mp4';
    }, [mode]);

    const resolvedPosterUri = useMemo(() => {
      if (mode === 'fc26_rush') {
        return resolveWebMediaUri(FIFA_FC26_RUSH_POSTER, '/assets/ui/fifa_fc26_rush_poster.jpg');
      }
      if (mode === 'fc25_3x3') {
        return resolveWebMediaUri(FIFA_FC25_3X3_POSTER, '/assets/ui/fifa_fc25_3x3_poster.jpg');
      }
      return undefined;
    }, [mode]);

    const resolvedWebVideoUri = useMemo(() => {
      if (streamUrl) return streamUrl;
      if (Platform.OS === 'web') {
        return resolveWebMediaUri(videoModule, directFallbackUri);
      }
      return null;
    }, [streamUrl, videoModule, directFallbackUri]);

    useEffect(() => {
      setWebVideoError(false);
      setWebVideoReady(false);
    }, [resolvedWebVideoUri, mode]);

    const useWebVideo =
      Platform.OS === 'web' && Boolean(resolvedWebVideoUri) && !webVideoError;

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

      // Dès le premier clic ou toucher de l'utilisateur n'importe où sur la page, forcer la lecture si en pause
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
      if (!isPlaying) {
        setFrameIndex(4);
        return;
      }
      const interval = setInterval(() => {
        setFrameIndex((f) => (f + 1) % SPRITE_FRAMES);
      }, 55);
      return () => clearInterval(interval);
    }, [isPlaying]);

    // Animation de transition officielle EA SPORTS FC 26 RUSH (comme sur annimation FC 26. 5X5 Rush. Superligue.jpeg)
    useEffect(() => {
      if (mode !== 'fc26_rush' || isFinished || !isPlaying) {
        setShowRushTransition(false);
        return;
      }
      const timer = setInterval(() => {
        setShowRushTransition(true);
        setTimeout(() => setShowRushTransition(false), 1100);
      }, 11500);
      return () => clearInterval(timer);
    }, [mode, isFinished, isPlaying]);

    const homeBroadcast = useMemo(() => formatBroadcastClubName(homeTeamName), [homeTeamName]);
    const awayBroadcast = useMemo(() => formatBroadcastClubName(awayTeamName), [awayTeamName]);
    const homeRushAbbr = useMemo(() => formatRushClubAbbr(homeTeamName), [homeTeamName]);
    const awayRushAbbr = useMemo(() => formatRushClubAbbr(awayTeamName), [awayTeamName]);

    // Période et chrono affichés dans le bandeau TV interne à la vidéo
    const isSecondHalf = isFinished || matchSeconds >= 183;
    const inVideoClock = useMemo(() => {
      if (isFinished) return '00:06';
      const rem = Math.max(6, 183 - (matchSeconds % 183));
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, [isFinished, matchSeconds]);

    const rushClock = useMemo(() => {
      if (isFinished) return '00:00';
      const rem = Math.max(12, 300 - (matchSeconds % 300));
      const m = Math.floor(rem / 60);
      const s = rem % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, [isFinished, matchSeconds]);

    // Dans FC 25 3x3, le bandeau de score en haut à gauche est visible sur la caméra principale (frames 0..28) et masqué pendant la célébration/replay
    const showVoltaScoreboard =
      mode === 'fc24_4x4' || isFinished || (mode === 'fc25_3x3' && frameIndex <= 28);

    const col = frameIndex % SPRITE_COLS;
    const row = Math.floor(frameIndex / SPRITE_COLS);

    return (
      <View
        style={[styles.broadcastViewport, { width: viewport.width, height: viewport.height }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setViewport({ width, height });
          }
        }}
      >
        {/* Couche de fond : Affiche et/ou Sprite animé toujours visible sous la vidéo */}
        {posterSource ? (
          <Image
            source={posterSource}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        {!(isFinished && posterSource) && (
          <Image
            source={spriteSource}
            fadeDuration={0}
            resizeMode="stretch"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: viewport.width * SPRITE_COLS,
              height: viewport.height * SPRITE_ROWS,
              transform: [
                { translateX: -col * viewport.width },
                { translateY: -row * viewport.height },
              ],
            }}
          />
        )}

        {/* Couche vidéo HTML5 principale sur le Web */}
        {useWebVideo && resolvedWebVideoUri
          ? React.createElement(
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
                src: resolvedWebVideoUri,
                poster: resolvedPosterUri,
                autoPlay: true,
                muted: true,
                loop: true,
                playsInline: true,
                preload: 'auto',
                controls: false,
                onLoadedData: () => setWebVideoReady(true),
                onCanPlay: () => setWebVideoReady(true),
                onPlaying: () => setWebVideoReady(true),
                onTimeUpdate: () => {
                  if (!webVideoReady) setWebVideoReady(true);
                },
                onError: () => {
                  if (videoRef.current && directFallbackUri && videoRef.current.src !== directFallbackUri && !videoRef.current.src?.endsWith(directFallbackUri)) {
                    videoRef.current.src = directFallbackUri;
                    videoRef.current.play().catch(() => {});
                  } else {
                    setWebVideoError(true);
                  }
                },
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: 'transparent',
                  opacity: webVideoReady ? 1 : 0,
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
          : null}

        {/* ================================================================= */}
        {/* INCRUSTATION TV DYNAMIQUE : NOM DES CLUBS & SCORE CHOISIS         */}
        {/* ================================================================= */}
        {mode === 'fc26_rush' ? (
          <View pointerEvents="none" style={styles.rushHudContainer}>
            <View style={styles.rushHudMainBar}>
              <View style={styles.rushTeamSide}>
                {homeLogoUrl ? (
                  <Image source={{ uri: homeLogoUrl }} style={styles.rushMiniLogo} resizeMode="contain" />
                ) : null}
                <Text style={styles.rushTeamAbbrText} numberOfLines={1}>
                  {homeRushAbbr}
                </Text>
              </View>

              <View style={styles.rushScoreBox}>
                <Text style={styles.rushScoreText}>
                  {homeScore}-{awayScore}
                </Text>
              </View>

              <View style={styles.rushTeamSide}>
                <Text style={styles.rushTeamAbbrText} numberOfLines={1}>
                  {awayRushAbbr}
                </Text>
                {awayLogoUrl ? (
                  <Image source={{ uri: awayLogoUrl }} style={styles.rushMiniLogo} resizeMode="contain" />
                ) : null}
              </View>
            </View>

            <View style={styles.rushTimerBox}>
              <Text style={styles.rushTimerText}>{rushClock}</Text>
            </View>
          </View>
        ) : (
          showVoltaScoreboard && (
            <View pointerEvents="none" style={styles.voltaHudBar}>
              <View
                style={[
                  styles.voltaHudPeriodBox,
                  isSecondHalf && { backgroundColor: '#F5B82E' },
                ]}
              >
                <Text style={styles.voltaHudPeriodText} numberOfLines={1}>
                  {isSecondHalf ? '2ND' : '1ST'} {inVideoClock}
                </Text>
              </View>

              <View style={styles.voltaHudTeamBox}>
                <Text style={styles.voltaHudTeamText} numberOfLines={1} adjustsFontSizeToFit>
                  {homeBroadcast}
                </Text>
              </View>

              <View style={styles.voltaHudScoreBox}>
                <Text style={styles.voltaHudScoreText} numberOfLines={1}>
                  {homeScore}-{awayScore}
                </Text>
              </View>

              <View style={styles.voltaHudTeamBox}>
                <Text style={styles.voltaHudTeamText} numberOfLines={1} adjustsFontSizeToFit>
                  {awayBroadcast}
                </Text>
              </View>
            </View>
          )
        )}

        {/* Transition EA SPORTS FC 26 RUSH (identique à annimation FC 26. 5X5 Rush. Superligue.jpeg) */}
        {showRushTransition && mode === 'fc26_rush' && (
          <View pointerEvents="none" style={styles.rushWipeOverlay}>
            <Svg width="100%" height="100%" viewBox="0 0 260 140">
              <Rect x="0" y="0" width="260" height="140" fill="#0B0E0D" />
              <Polygon points="28,0 56,0 16,70 56,140 28,140 -12,70" fill="#25E85A" />
              <Polygon points="68,0 96,0 56,70 96,140 68,140 28,70" fill="#25E85A" />
              <Polygon points="108,0 120,0 80,70 120,140 108,140 68,70" fill="#25E85A" />
            </Svg>
            <View style={styles.rushWipeLogoRow}>
              <View style={styles.eaCircleBadge}>
                <Text style={styles.eaCircleText}>EA</Text>
              </View>
              <Text style={styles.fc26WhiteItalic}>FC26</Text>
              <Text style={styles.rushGreenItalic}>RUSH</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

/**
 * Graphique circulaire Donut tricolore des statistiques d'équipe
 */
const TeamStatsDonutChart: React.FC<{
  total: number;
  wins: number;
  draws: number;
  losses: number;
}> = ({ total, wins, draws, losses }) => {
  const size = 108;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = Math.max(1, total);
  const gap = 13;

  const winLen = (wins / safeTotal) * circumference;
  const drawLen = (draws / safeTotal) * circumference;
  const lossLen = (losses / safeTotal) * circumference;

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="100" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#232826"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {wins > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#19A952"
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(2, winLen - gap)} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              fill="none"
            />
          )}
          {draws > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F5A623"
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(2, drawLen - gap)} ${circumference}`}
              strokeDashoffset={-winLen}
              strokeLinecap="round"
              fill="none"
            />
          )}
          {losses > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EC4622"
              strokeWidth={strokeWidth}
              strokeDasharray={`${Math.max(2, lossLen - gap)} ${circumference}`}
              strokeDashoffset={-(winLen + drawLen)}
              strokeLinecap="round"
              fill="none"
            />
          )}
        </G>
      </Svg>
      <View style={styles.donutCenterLabel}>
        <Text style={styles.donutTotalValue}>{total}</Text>
        <Text style={styles.donutSubText}>jeux</Text>
      </View>
    </View>
  );
};

export default function FifaLiveMatchScreen({ route, navigation }: any) {
  const isFocused = useIsFocused();
  const { width: windowWidth } = useWindowDimensions();
  const { insets } = useResponsive();
  const { currentTheme, brandChoice, modeChoice } = useThemeStore();
  const playerWidth = Math.max(280, Math.min(windowWidth || 375, 480) - 12);
  const playerHeight = Math.round((playerWidth * 200) / 364);
  const brandPrimary = currentTheme?.primary || '#2ECC71';
  const isMelbet =
    brandChoice === 'melbet' || (currentTheme?.name || '').toLowerCase().includes('melbet');
  const starBadgeColor = isMelbet ? '#D4A238' : '#4A8FD6';

  const isLight = modeChoice === 'clair' || !currentTheme?.isDark;
  const sheetBg = isLight ? '#FFFFFF' : (currentTheme?.cardBackground || '#1A232E');
  const sheetTextColor = isLight ? '#00325E' : (currentTheme?.textPrimary || '#FFFFFF');
  const sheetSubTextColor = isLight ? '#5C7690' : (currentTheme?.textSecondary || '#94A3B8');
  const buttonBg = isLight ? '#EEF2F6' : (currentTheme?.background || '#121A22');
  const { addEvent } = useCouponStore();

  const passedEvent: Partial<MatchEvent> & Record<string, any> | undefined =
    route?.params?.event || route?.params?.match;

  // Horloge temps réel pour piloter l'avant-match, le direct et la fin de match ("Jeu terminé")
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    if (!isFocused) return;
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [isFocused]);

  const competitionTitle = useMemo(() => {
    const raw = passedEvent?.league || 'FC 25. 3x3. Ligue de conférence';
    return (
      raw.replace(/^FIFA\s*[\.\-·:]\s*/i, '').trim() ||
      'FC 25. 3x3. Ligue de conférence'
    );
  }, [passedEvent?.league]);

  const broadcastMode = useMemo(
    () => resolveFifaBroadcastMode(competitionTitle),
    [competitionTitle]
  );

  const defaultTeams = useMemo(() => {
    if (broadcastMode === 'fc26_rush') {
      return { home: 'Liverpool', away: 'PSV Eindhoven', score: '0:1' };
    }
    if (broadcastMode === 'fc25_3x3') {
      return { home: 'Braga', away: 'Roma', score: '3:3' };
    }
    return { home: 'Burnley', away: 'Bournemouth', score: '1:3' };
  }, [broadcastMode]);

  const homeTeamName =
    (typeof passedEvent?.homeTeam === 'string'
      ? passedEvent.homeTeam
      : passedEvent?.homeTeam?.name) || defaultTeams.home;
  const awayTeamName =
    (typeof passedEvent?.awayTeam === 'string'
      ? passedEvent.awayTeam
      : passedEvent?.awayTeam?.name) || defaultTeams.away;

  const rawHomeLogo =
    typeof passedEvent?.homeTeam === 'object' ? passedEvent?.homeTeam?.logo : passedEvent?.homeLogo;
  const rawAwayLogo =
    typeof passedEvent?.awayTeam === 'object' ? passedEvent?.awayTeam?.logo : passedEvent?.awayLogo;

  const homeLogoUrl = useMemo(
    () => resolveClubLogoUrl(homeTeamName, rawHomeLogo),
    [homeTeamName, rawHomeLogo]
  );
  const awayLogoUrl = useMemo(
    () => resolveClubLogoUrl(awayTeamName, rawAwayLogo),
    [awayTeamName, rawAwayLogo]
  );

  const [favHome, setFavHome] = useState(false);
  const [favAway, setFavAway] = useState(false);

  // Progression de l'événement (Avant-match / En direct / Terminé)
  const liveProgress = useMemo(
    () => getEventLiveProgress(passedEvent, nowMs),
    [passedEvent, nowMs]
  );

  const hasExplicitDate = Boolean(
    passedEvent &&
    (passedEvent.date ||
      passedEvent.rawDate ||
      passedEvent.startDate ||
      passedEvent.matchDate)
  );

  const isStatusFinished = useMemo(() => {
    const st = String(passedEvent?.status || '').toLowerCase();
    return (
      st === 'payé' ||
      st === 'perdu' ||
      st === 'gain' ||
      st === 'perte' ||
      st === 'gagne' ||
      st === 'paid' ||
      st === 'lost'
    );
  }, [passedEvent?.status]);

  // L'utilisateur indique explicitement que "Les évènements FIFA sont toujours en direct".
  // Par défaut, tous les matches FIFA démarrent donc en mode Direct (Live avec vidéo active),
  // sauf si explicitement demandé comme avant-match (passedEvent.stage === 'prematch' ou passedEvent.isPreMatch === true).
  // L'utilisateur peut aussi basculer manuellement entre le direct vidéo et l'avant-match.
  const [userViewMode, setUserViewMode] = useState<'live' | 'prematch'>(() => {
    if (passedEvent?.stage === 'prematch' || passedEvent?.isPreMatch === true) {
      return 'prematch';
    }
    return 'live';
  });

  const isPreMatch = userViewMode === 'prematch';
  const isMatchFinished = isStatusFinished;

  // Compte à rebours avant-match (ex: "Le jeu démarre dans 00:17:18")
  const preMatchCountdown = useMemo(() => {
    if (!isPreMatch) return '00:17:18';
    const st = getEventStartTime(passedEvent);
    if (!st) return '00:17:18';
    const diffSec = Math.max(0, Math.floor((st.getTime() - nowMs) / 1000));
    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [isPreMatch, passedEvent, nowMs]);

  // Chronomètre Live ou Terminé (ex: 01 : 33 en direct, 06 : 06 lorsque terminé)
  const [fallbackLiveSeconds, setFallbackLiveSeconds] = useState<number>(() => {
    if (typeof passedEvent?.elapsedSeconds === 'number' && passedEvent.elapsedSeconds > 0) {
      return passedEvent.elapsedSeconds;
    }
    return broadcastMode === 'fc26_rush' ? 139 : 93; // 02:19 ou 01:33
  });

  // Écran de transition FIFA plein écran à l'ouverture
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const ballScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setShowSplash(false);
    }, 950);

    Animated.parallel([
      Animated.spring(ballScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(650),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        setShowSplash(false);
      }
    });

    return () => clearTimeout(fallbackTimer);
  }, [ballScale, splashOpacity]);

  useEffect(() => {
    if (!isFocused || showSplash || isPreMatch || isMatchFinished) return;
    const timer = setInterval(() => {
      setFallbackLiveSeconds((s) => Math.min(366, s + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isFocused, showSplash, isPreMatch, isMatchFinished]);

  const activeElapsedSeconds = useMemo(() => {
    if (isMatchFinished) {
      return liveProgress.durationSeconds || 366; // 06 : 06
    }
    if (hasExplicitDate && liveProgress.isLive) {
      return liveProgress.elapsedSeconds;
    }
    return fallbackLiveSeconds;
  }, [isMatchFinished, hasExplicitDate, liveProgress, fallbackLiveSeconds]);

  const formattedClock = useMemo(() => {
    const mins = Math.floor(activeElapsedSeconds / 60);
    const secs = activeElapsedSeconds % 60;
    return `${String(mins).padStart(2, '0')} : ${String(secs).padStart(2, '0')}`;
  }, [activeElapsedSeconds]);

  const periodLabel = useMemo(() => {
    if (isMatchFinished) return 'Jeu terminé';
    const halfPoint = Math.floor((liveProgress.durationSeconds || 366) / 2);
    return activeElapsedSeconds >= halfPoint ? '2ème mi-temps' : '1ère mi-temps';
  }, [isMatchFinished, activeElapsedSeconds, liveProgress.durationSeconds]);

  // Calcul des scores finaux et par mi-temps (Mi-temps 1 & Mi-temps 2)
  const {
    homeScoreNum,
    awayScoreNum,
    formattedScore,
    p1HomeScore,
    p1AwayScore,
    p2HomeScore,
    p2AwayScore,
  } = useMemo(() => {
    const raw =
      passedEvent?.actualScore ||
      passedEvent?.score ||
      passedEvent?.finalScore ||
      (isMatchFinished ? '5:7' : defaultTeams.score);
    const cleanMain = String(raw).split('(')[0].trim();
    const parts = cleanMain.split(/[:\-]/).map((s) => parseInt(s.trim(), 10));
    const hTotal = !isNaN(parts[0]) ? parts[0] : isMatchFinished ? 5 : 3;
    const aTotal = !isNaN(parts[1]) ? parts[1] : isMatchFinished ? 7 : 3;

    // Vérifier si un détail de mi-temps explicite existe ex: "5:7 (2:4, 3:3)"
    const detailStr = String(
      passedEvent?.halftimeScore || passedEvent?.scoreDetail || ''
    );
    const parenMatch = detailStr.match(/\(([^)]+)\)/);
    if (parenMatch) {
      const halves = parenMatch[1].split(/[,\s]+/).filter(Boolean);
      if (halves.length >= 2) {
        const h1Parts = halves[0].split(/[:\-]/).map((n) => parseInt(n.trim(), 10));
        const h2Parts = halves[1].split(/[:\-]/).map((n) => parseInt(n.trim(), 10));
        if (!isNaN(h1Parts[0]) && !isNaN(h1Parts[1]) && !isNaN(h2Parts[0]) && !isNaN(h2Parts[1])) {
          return {
            homeScoreNum: hTotal,
            awayScoreNum: aTotal,
            formattedScore: `${hTotal} : ${aTotal}`,
            p1HomeScore: h1Parts[0],
            p1AwayScore: h1Parts[1],
            p2HomeScore: h2Parts[0],
            p2AwayScore: h2Parts[1],
          };
        }
      } else if (halves.length === 1) {
        const h1Parts = halves[0].split(/[:\-]/).map((n) => parseInt(n.trim(), 10));
        if (!isNaN(h1Parts[0]) && !isNaN(h1Parts[1])) {
          const p1H = Math.min(hTotal, h1Parts[0]);
          const p1A = Math.min(aTotal, h1Parts[1]);
          return {
            homeScoreNum: hTotal,
            awayScoreNum: aTotal,
            formattedScore: `${hTotal} : ${aTotal}`,
            p1HomeScore: p1H,
            p1AwayScore: p1A,
            p2HomeScore: Math.max(0, hTotal - p1H),
            p2AwayScore: Math.max(0, aTotal - p1A),
          };
        }
      }
    }

    // Répartition réaliste des deux mi-temps dont la somme donne exactement le score final (ex: 5:7 -> 2:4 + 3:3)
    const p1H = Math.floor(hTotal / 2);
    const p2H = hTotal - p1H;
    const p1A = Math.ceil(aTotal / 2);
    const p2A = aTotal - p1A;

    return {
      homeScoreNum: hTotal,
      awayScoreNum: aTotal,
      formattedScore: `${hTotal} : ${aTotal}`,
      p1HomeScore: isMatchFinished ? p1H : hTotal,
      p1AwayScore: isMatchFinished ? p1A : aTotal,
      p2HomeScore: p2H,
      p2AwayScore: p2A,
    };
  }, [
    passedEvent?.actualScore,
    passedEvent?.score,
    passedEvent?.finalScore,
    passedEvent?.halftimeScore,
    passedEvent?.scoreDetail,
    isMatchFinished,
    defaultTeams.score,
  ]);

  // Hauteur de la barre de navigation persistante en bas
  const androidBottomPad = Platform.OS === 'android' ? 12 : 0;
  const bottomInset =
    insets.bottom > 0
      ? Math.max(insets.bottom, androidBottomPad)
      : Platform.OS === 'ios'
        ? 20
        : androidBottomPad;
  const bottomBarHeight = 56 + bottomInset;

  // Chargement fluide du flux
  const [isStreamLoading, setIsStreamLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!isFocused || showSplash) return;
    setIsStreamLoading(true);
    const loadTimer = setTimeout(() => {
      setIsStreamLoading(false);
    }, 240);
    return () => clearTimeout(loadTimer);
  }, [isFocused, showSplash, broadcastMode]);

  // Onglets "Stats des équipes" (Équipe 1 actif par défaut comme sur les captures FC 25 & FC 26)
  const [selectedStatsTab, setSelectedStatsTab] = useState<'home' | 'away' | 'standings'>('home');

  const statsMap: Record<'home' | 'away', TeamStatsData> = useMemo(
    () => ({
      home: isPreMatch || broadcastMode === 'fc24_4x4'
        ? {
          totalGames: 7,
          wins: 4,
          draws: 1,
          losses: 2,
          points: 13,
          goalDiff: '50-41',
        }
        : {
          totalGames: 10,
          wins: 6,
          draws: 2,
          losses: 2,
          points: 20,
          goalDiff: '40-29',
        },
      away: {
        totalGames: 7,
        wins: 3,
        draws: 1,
        losses: 3,
        points: 10,
        goalDiff: '42-45',
      },
    }),
    [isPreMatch, broadcastMode]
  );

  const activeStats = selectedStatsTab === 'away' ? statsMap.away : statsMap.home;

  // Périodes & Marchés FIFA complets (Temps réglementaire | 1ère mi-temps | 2ème mi-temps)
  const [selectedMarketPeriod, setSelectedMarketPeriod] = useState<'regular' | 'first_half' | 'second_half'>('regular');
  const [isMarketSheetExpanded, setIsMarketSheetExpanded] = useState<boolean>(false);
  const [marketSearchQuery, setMarketSearchQuery] = useState<string>('');
  const [pinnedMarkets, setPinnedMarkets] = useState<Record<string, boolean>>({});
  const [expandedMarkets, setExpandedMarkets] = useState<Record<string, boolean>>({
    fifa_1x2: true,
    fifa_dc: true,
    fifa_btts: true,
    fifa_total: true,
  });
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null);

  const fifaMarketsList = useMemo(() => {
    const rawList = buildFifaMarkets(selectedMarketPeriod);
    const q = marketSearchQuery.trim().toLowerCase();
    const filtered = q
      ? rawList.filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.options.some((o) => o.label.toLowerCase().includes(q))
        )
      : rawList;
    return [...filtered].sort((a, b) => {
      const pinA = pinnedMarkets[a.id] ? 1 : 0;
      const pinB = pinnedMarkets[b.id] ? 1 : 0;
      return pinB - pinA;
    });
  }, [selectedMarketPeriod, pinnedMarkets, marketSearchQuery]);

  // Sélection marché Total pair (Oui 1.85 / Non 1.85) comme sur les captures
  const [selectedTotalPair, setSelectedTotalPair] = useState<'Oui' | 'Non' | null>(null);

  const handleSelectFifaMarketOption = (group: MarketGroupItem, opt: MarketOddOption) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignoré sur web
    }
    const key = `${selectedMarketPeriod}::${group.id}::${opt.id}`;
    setSelectedOptionKey(key);
    if (group.id === 'fifa_total_pair' && (opt.label === 'Oui' || opt.label === 'Non')) {
      setSelectedTotalPair(opt.label);
    }
    const formattedPrediction = formatBetSelectionLabel({
      period: selectedMarketPeriod,
      marketTitle: group.title,
      optionLabel: opt.label,
    });
    addEvent({
      id: passedEvent?.id || `fifa-live-${homeTeamName}-${awayTeamName}`,
      sport: 'FIFA',
      league: `FIFA. ${competitionTitle}`,
      date: passedEvent?.date || '01.11.2026 (12:45)',
      homeTeam: {
        name: homeTeamName,
        logo: homeLogoUrl || 'generic-player',
      },
      awayTeam: {
        name: awayTeamName,
        logo: awayLogoUrl || 'generic-player',
      },
      prediction: formattedPrediction,
      odd: opt.odd,
      status: 'Accepté',
      isLive: true,
      actualScore: `${homeScoreNum}:${awayScoreNum}`,
      gameCategory: 'esports',
    });
  };

  const handleSelectTotalPair = (choice: 'Oui' | 'Non') => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignoré sur web
    }
    setSelectedTotalPair(choice);
    setSelectedOptionKey(`regular::fifa_total_pair::ftp_${choice.toLowerCase()}`);
    addEvent({
      id: passedEvent?.id || `fifa-live-${homeTeamName}-${awayTeamName}`,
      sport: 'FIFA',
      league: `FIFA. ${competitionTitle}`,
      date: passedEvent?.date || '01.11.2026 (12:45)',
      homeTeam: {
        name: homeTeamName,
        logo: homeLogoUrl || 'generic-player',
      },
      awayTeam: {
        name: awayTeamName,
        logo: awayLogoUrl || 'generic-player',
      },
      prediction: `Total pair. ${choice}`,
      odd: 1.85,
      status: 'Accepté',
      isLive: true,
      actualScore: `${homeScoreNum}:${awayScoreNum}`,
      gameCategory: 'esports',
    });
  };

  const streamUrl = passedEvent?.streamUrl;
  const topSafePad =
    Platform.OS === 'android' ? (StatusBar.currentHeight || 16) + 4 : Math.max(insets.top, 12) + 4;

  const renderTeamStatsBlock = (inHeaderPreMatch: boolean = false) => (
    <View style={[styles.statsSection, inHeaderPreMatch && styles.statsSectionPreMatch]}>
      <Text style={styles.sectionTitle}>Stats des équipes</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teamPillsRow}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedStatsTab('home')}
          style={[
            styles.teamPill,
            selectedStatsTab === 'home' ? styles.teamPillActive : styles.teamPillInactive,
          ]}
        >
          <Text
            style={[
              styles.teamPillText,
              selectedStatsTab === 'home' && styles.teamPillTextActive,
            ]}
          >
            {homeTeamName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedStatsTab('away')}
          style={[
            styles.teamPill,
            selectedStatsTab === 'away' ? styles.teamPillActive : styles.teamPillInactive,
          ]}
        >
          <Text
            style={[
              styles.teamPillText,
              selectedStatsTab === 'away' && styles.teamPillTextActive,
            ]}
          >
            {awayTeamName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedStatsTab('standings')}
          style={[
            styles.teamPill,
            selectedStatsTab === 'standings' ? styles.teamPillActive : styles.teamPillInactive,
          ]}
        >
          <Text
            style={[
              styles.teamPillText,
              selectedStatsTab === 'standings' && styles.teamPillTextActive,
            ]}
          >
            Tableau du tournoi
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {selectedStatsTab === 'standings' ? (
        <View style={styles.statsCard}>
          {[
            { rank: 1, name: homeTeamName, pts: 13, gd: '50-41' },
            { rank: 2, name: awayTeamName, pts: 10, gd: '42-45' },
            { rank: 3, name: 'Real Madrid', pts: 9, gd: '38-39' },
            { rank: 4, name: 'Arsenal', pts: 7, gd: '31-42' },
          ].map((row, idx) => (
            <View
              key={row.name}
              style={[
                styles.standingRow,
                idx < 3 && { borderBottomWidth: 1, borderBottomColor: '#2A3139' },
              ]}
            >
              <Text style={styles.standingRank}>{row.rank}.</Text>
              <Text style={styles.standingTeam}>{row.name}</Text>
              <Text style={styles.standingGd}>{row.gd}</Text>
              <Text style={styles.standingPts}>{row.pts} pts</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.statsCard}>
          <View style={styles.statsUpperRow}>
            <TeamStatsDonutChart
              total={activeStats.totalGames}
              wins={activeStats.wins}
              draws={activeStats.draws}
              losses={activeStats.losses}
            />

            <View style={styles.legendColumn}>
              <View style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDot, { backgroundColor: '#19A952' }]} />
                  <Text style={styles.legendLabel}>Victoires</Text>
                </View>
                <Text style={styles.legendValue}>{activeStats.wins}</Text>
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDot, { backgroundColor: '#F5A623' }]} />
                  <Text style={styles.legendLabel}>Matchs nuls</Text>
                </View>
                <Text style={styles.legendValue}>{activeStats.draws}</Text>
              </View>

              <View style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDot, { backgroundColor: '#EC4622' }]} />
                  <Text style={styles.legendLabel}>Défaites</Text>
                </View>
                <Text style={styles.legendValue}>{activeStats.losses}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsCardDivider} />

          <View style={styles.statsBottomSummary}>
            <View style={[styles.statsBottomCol, styles.statsBottomColDivider]}>
              <Text style={styles.statsBottomText}>Points : {activeStats.points}</Text>
            </View>
            <View style={styles.statsBottomCol}>
              <Text style={styles.statsBottomText}>DB : {activeStats.goalDiff}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderExpandedMarketsContent = () => {
    const containerBg = isLight ? '#EBEEF3' : '#181A1E';
    const cardBg = isLight ? '#FFFFFF' : '#24272C';
    const inactivePillBg = isLight ? '#FFFFFF' : '#2C3036';
    const searchBarBg = isLight ? '#FFFFFF' : '#26292E';
    const oddCellBg = isLight ? '#EEF2F6' : '#1A1D21';
    const circleBtnBg = isLight ? '#EAEFF5' : '#2E3238';
    const activePeriodPillBg = isLight && !isMelbet ? '#4A8FD6' : '#D98218';

    return (
      <View style={[styles.expandedMarketsWrap, { backgroundColor: containerBg }]}>
        {/* Poignée supérieure */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (!isPreMatch) setIsMarketSheetExpanded(false);
          }}
          style={styles.sheetHandleHit}
        >
          <View
            style={[
              styles.sheetHandle,
              !isLight && { backgroundColor: '#3A3F47' },
            ]}
          />
        </TouchableOpacity>

        {/* Onglets de période (Temps réglementaire | 1ère mi-temps | 2ème mi-temps) */}
        <View style={styles.periodPillsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodPillsScroll}
          >
            {(
              [
                { key: 'regular', label: 'Temps réglementaire' },
                { key: 'first_half', label: '1ère mi-temps' },
                { key: 'second_half', label: '2ème mi-temps' },
              ] as const
            ).map((tab) => {
              const isActive = selectedMarketPeriod === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.85}
                  onPress={() => setSelectedMarketPeriod(tab.key)}
                  style={[
                    styles.periodPillBtn,
                    isActive
                      ? { backgroundColor: activePeriodPillBg }
                      : { backgroundColor: inactivePillBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodPillText,
                      isActive
                        ? { color: '#FFFFFF', fontWeight: '600' }
                        : { color: isLight ? sheetSubTextColor : '#C6CBD2', fontWeight: '500' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Barre de recherche ("Recherche" avec icône loupe) fidèle à la vidéo */}
        <View
          style={{
            marginHorizontal: 10,
            marginBottom: 10,
            height: 40,
            borderRadius: 10,
            backgroundColor: searchBarBg,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isLight ? '#64748B' : '#8E95A2'}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={marketSearchQuery}
            onChangeText={setMarketSearchQuery}
            placeholder="Recherche"
            placeholderTextColor={isLight ? '#64748B' : '#8E95A2'}
            style={{
              flex: 1,
              color: isLight ? '#0F172A' : '#FFFFFF',
              fontSize: 14,
              paddingVertical: 0,
              fontFamily: Typography.fontFamily,
            }}
          />
          {Boolean(marketSearchQuery) && (
            <TouchableOpacity onPress={() => setMarketSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color={isLight ? '#64748B' : '#8E95A2'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Liste scrollable des cartes de marchés FIFA (1X2, Double chance, Deux équipes vont marquer, Total, etc.) */}
        <ScrollView
          style={styles.marketsListScroll}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: bottomBarHeight + 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          {fifaMarketsList.map((group) => {
            const isExpanded = Boolean(expandedMarkets[group.id]);
            const isPinned = Boolean(pinnedMarkets[group.id]);
            const rows: MarketOddOption[][] = [];
            for (let i = 0; i < group.options.length; i += group.columns) {
              rows.push(group.options.slice(i, i + group.columns));
            }

            return (
              <View
                key={group.id}
                style={[styles.fifaMarketCard, { backgroundColor: cardBg }]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    setExpandedMarkets((prev) => ({
                      ...prev,
                      [group.id]: !prev[group.id],
                    }))
                  }
                  style={styles.fifaMarketCardHeader}
                >
                  <Text
                    style={[
                      styles.fifaMarketCardTitle,
                      { color: isLight ? sheetTextColor : '#FFFFFF' },
                    ]}
                    numberOfLines={2}
                  >
                    {group.title}
                  </Text>

                  <View style={styles.fifaMarketCardActions}>
                    {!isExpanded && group.optionCount !== undefined && (
                      <Text
                        style={[
                          styles.fifaMarketCountText,
                          { color: isLight ? sheetTextColor : '#FFFFFF' },
                        ]}
                      >
                        ({group.optionCount})
                      </Text>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setPinnedMarkets((prev) => ({
                          ...prev,
                          [group.id]: !prev[group.id],
                        }))
                      }
                      style={[
                        styles.fifaCircleIconBtn,
                        {
                          backgroundColor: isPinned ? activePeriodPillBg : circleBtnBg,
                        },
                      ]}
                    >
                      <Ionicons
                        name="pin"
                        size={15}
                        color={isPinned ? '#FFFFFF' : isLight ? activePeriodPillBg : '#8E95A2'}
                        style={{ transform: [{ rotate: '45deg' }] }}
                      />
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.fifaCircleIconBtn,
                        { backgroundColor: circleBtnBg, marginLeft: 8 },
                      ]}
                    >
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={isLight ? activePeriodPillBg : '#D98218'}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.fifaMarketOptionsWrap}>
                    {rows.map((rowOpts, rIdx) => (
                      <View
                        key={`${group.id}-r-${rIdx}`}
                        style={[
                          styles.fifaMarketOptionsRow,
                          rIdx > 0 && { marginTop: 8 },
                        ]}
                      >
                        {rowOpts.map((opt) => {
                          const optKey = `${selectedMarketPeriod}::${group.id}::${opt.id}`;
                          const isSelected = selectedOptionKey === optKey;
                          return (
                            <TouchableOpacity
                              key={opt.id}
                              activeOpacity={0.8}
                              onPress={() => handleSelectFifaMarketOption(group, opt)}
                              style={[
                                styles.fifaMarketOddCell,
                                { backgroundColor: oddCellBg },
                                isSelected && {
                                  borderColor: activePeriodPillBg,
                                  backgroundColor: isLight
                                    ? 'rgba(74, 143, 214, 0.14)'
                                    : 'rgba(217, 130, 24, 0.22)',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.fifaMarketOptLabel,
                                  { color: isLight ? sheetSubTextColor : '#9EA4AE' },
                                ]}
                                numberOfLines={2}
                              >
                                {opt.label}
                              </Text>
                              <Text
                                style={[
                                  styles.fifaMarketOptOdd,
                                  { color: isLight ? sheetTextColor : '#FFFFFF' },
                                ]}
                              >
                                {formatCleanOdds(opt.odd)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ===================================================================== */}
      {/* 1. EN-TÊTE FIFA 24 FIXE EN HAUT (Adapté Avant-match / Direct / Fini) */}
      {/* ===================================================================== */}
      <ImageBackground
        source={resolveImageSource(FIFA_HEADER_BG, '/assets/ui/fifa24_player_smoke.jpg')}
        resizeMode="cover"
        style={[
          styles.headerBg,
          { paddingTop: topSafePad, paddingBottom: isPreMatch ? 18 : 8 },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(6, 20, 11, 0.16)',
            'rgba(7, 24, 13, 0.28)',
            isPreMatch ? 'rgba(10, 16, 13, 0.62)' : 'rgba(8, 26, 13, 0.22)',
          ]}
          locations={[0, 0.58, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Barre supérieure : Chevron ‹ | FIFA centré | ⚡ + ••• */}
        <View style={styles.topAppBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconHitBox}
            accessibilityLabel="Retour"
          >
            <BackArrowIcon size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View pointerEvents="none" style={styles.topBarTitleCenterWrap}>
            <Text style={styles.topBarTitle}>FIFA</Text>
          </View>

          <View style={styles.topBarRightActions}>
            {!isMatchFinished ? (
              <TouchableOpacity
                style={styles.iconHitBox}
                activeOpacity={0.7}
                onPress={() => setUserViewMode((m) => (m === 'live' ? 'prematch' : 'live'))}
                accessibilityLabel="Basculer Direct / Avant-Match"
              >
                <Ionicons
                  name={isPreMatch ? 'videocam' : 'stats-chart'}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.iconHitBox} activeOpacity={0.7}>
                <Ionicons
                  name="flash"
                  size={20}
                  color="rgba(255,255,255,0.45)"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconHitBox} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Conteneur sombre encastré d'affrontement des clubs (identique aux captures) */}
        <View style={styles.confrontationCard}>
          <View style={styles.teamsHeaderRow}>
            <View style={styles.teamSideLeft}>
              <FifaHeaderTeamBadge
                logoUrl={homeLogoUrl}
                isFavorite={favHome}
                onToggleFavorite={() => setFavHome((v) => !v)}
                starBgColor={starBadgeColor}
                side="left"
              />
              <Text style={styles.teamHeaderNameLeft} numberOfLines={2}>
                {homeTeamName}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scoreCenterBox}
              activeOpacity={0.8}
              onPress={() => setUserViewMode((m) => (m === 'live' ? 'prematch' : 'live'))}
            >
              {isPreMatch ? (
                <Text style={styles.preMatchVsText}>VS</Text>
              ) : (
                <>
                  <Text style={styles.liveClockText}>{formattedClock}</Text>
                  <Text style={styles.liveMainScoreText}>{formattedScore}</Text>
                  <Text style={styles.livePeriodText}>{periodLabel}</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.teamSideRight}>
              <Text style={styles.teamHeaderNameRight} numberOfLines={3}>
                {awayTeamName}
              </Text>
              <FifaHeaderTeamBadge
                logoUrl={awayLogoUrl}
                isFavorite={favAway}
                onToggleFavorite={() => setFavAway((v) => !v)}
                starBgColor={starBadgeColor}
                side="right"
              />
            </View>
          </View>

          {isPreMatch && (
            <Text style={styles.preMatchStartsInText}>
              Le match commence dans {preMatchCountdown}
            </Text>
          )}
        </View>

        {/* Barre de compétition sur la fumée verte avec accès au direct/stats */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.competitionBanner}
          onPress={() => {
            if (!isMatchFinished) {
              setUserViewMode((m) => (m === 'live' ? 'prematch' : 'live'));
            }
          }}
        >
          <View style={styles.competitionLeft}>
            <Ionicons name="trophy" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.competitionBannerText} numberOfLines={1}>
              {competitionTitle}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!isMatchFinished && (
              <Text style={{ color: '#25E85A', fontSize: 11, fontWeight: '700', marginRight: 4 }}>
                {isPreMatch ? 'VOIR LE DIRECT' : 'STATS'}
              </Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#E2E8F0" />
          </View>
        </TouchableOpacity>

        {/* En mode Avant-match (isPreMatch) : "Stats des équipes" directement dans l'en-tête comme sur la capture */}
        {isPreMatch && renderTeamStatsBlock(true)}
      </ImageBackground>

      {isPreMatch ? (
        /* ===================================================================== */
        /* 2A. MODE AVANT-MATCH : PANNEAU DE MARCHÉS FIFA ÉTENDU                 */
        /* ===================================================================== */
        <View style={styles.preMatchMarketsSheetWrap}>{renderExpandedMarketsContent()}</View>
      ) : (
        <>
          {/* ===================================================================== */}
          {/* 2B. MODE EN DIRECT / FINI : VIDÉO FIXE + ZONE STATS SCROLLABLE        */}
          {/* ===================================================================== */}
          {/* A. LECTEUR VIDÉO FIXE (NE DÉFILE PAS) SELON LE CHAMPIONNAT FIFA CHOISI */}
          <View style={styles.videoOuterWrap}>
            <View style={[styles.videoPlayerContainer, { height: playerHeight }]}>
              <FifaChampionshipStreamPlayer
                mode={broadcastMode}
                streamUrl={streamUrl}
                isPlaying={isFocused}
                isFinished={isMatchFinished}
                homeTeamName={homeTeamName}
                awayTeamName={awayTeamName}
                homeLogoUrl={homeLogoUrl}
                awayLogoUrl={awayLogoUrl}
                homeScore={isPreMatch ? 0 : homeScoreNum}
                awayScore={isPreMatch ? 0 : awayScoreNum}
                matchSeconds={activeElapsedSeconds}
                width={playerWidth}
                height={playerHeight}
              />
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: bottomBarHeight + 138 }}
            showsVerticalScrollIndicator={false}
          >
            {/* B. SECTION "STATISTIQUES DE MATCH" (Mi-temps 1 & Mi-temps 2) */}
            {(isMatchFinished || broadcastMode !== 'fc26_rush') && (
              <View style={styles.matchStatsSection}>
                <Text style={styles.sectionTitle}>Statistiques de match</Text>

                <View style={styles.matchStatsOuterBox}>
                  {/* Carte Mi-temps 1 */}
                  <View style={styles.matchStatsHalfCard}>
                    <View style={styles.matchStatsLeftPeriod}>
                      <Text style={styles.matchStatsPeriodLabel}>Mi-temps 1</Text>
                    </View>

                    <View style={styles.matchStatsTeamsCol}>
                      <View style={styles.matchStatsTeamRow}>
                        <View style={styles.matchStatsTeamInfo}>
                          <MiniClubCrest logoUrl={homeLogoUrl} />
                          <Text style={styles.matchStatsTeamName} numberOfLines={1}>
                            {homeTeamName}
                          </Text>
                        </View>
                        <View style={styles.matchStatsScoreBox}>
                          <Text style={styles.matchStatsScoreVal}>{p1HomeScore}</Text>
                        </View>
                      </View>

                      <View style={styles.matchStatsTeamRow}>
                        <View style={styles.matchStatsTeamInfo}>
                          <MiniClubCrest logoUrl={awayLogoUrl} />
                          <Text style={styles.matchStatsTeamName} numberOfLines={1}>
                            {awayTeamName}
                          </Text>
                        </View>
                        <View style={styles.matchStatsScoreBox}>
                          <Text style={styles.matchStatsScoreVal}>{p1AwayScore}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Carte Mi-temps 2 (affichée lorsque le match est terminé ou en 2ème mi-temps) */}
                  {(isMatchFinished || activeElapsedSeconds >= 183) && (
                    <View style={styles.matchStatsHalfCard}>
                      <View style={styles.matchStatsLeftPeriod}>
                        <Text style={styles.matchStatsPeriodLabel}>Mi-temps 2</Text>
                      </View>

                      <View style={styles.matchStatsTeamsCol}>
                        <View style={styles.matchStatsTeamRow}>
                          <View style={styles.matchStatsTeamInfo}>
                            <MiniClubCrest logoUrl={homeLogoUrl} />
                            <Text style={styles.matchStatsTeamName} numberOfLines={1}>
                              {homeTeamName}
                            </Text>
                          </View>
                          <View style={styles.matchStatsScoreBox}>
                            <Text style={styles.matchStatsScoreVal}>{p2HomeScore}</Text>
                          </View>
                        </View>

                        <View style={styles.matchStatsTeamRow}>
                          <View style={styles.matchStatsTeamInfo}>
                            <MiniClubCrest logoUrl={awayLogoUrl} />
                            <Text style={styles.matchStatsTeamName} numberOfLines={1}>
                              {awayTeamName}
                            </Text>
                          </View>
                          <View style={styles.matchStatsScoreBox}>
                            <Text style={styles.matchStatsScoreVal}>{p2AwayScore}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* C. SECTION "STATS DES ÉQUIPES" (Onglets équipes + Donut Chart) */}
            {!isMatchFinished && renderTeamStatsBlock(false)}
          </ScrollView>

          {/* ===================================================================== */}
          {/* 3. BOTTOM SHEET FIXE EN BAS (Total pair en direct / Tous les marchés) */}
          {/* ===================================================================== */}
          {!isMatchFinished && isMarketSheetExpanded ? (
            <View
              style={[
                styles.liveExpandedMarketsOverlay,
                { bottom: bottomBarHeight },
              ]}
            >
              {renderExpandedMarketsContent()}
            </View>
          ) : (
            <View
              style={[
                styles.marketBottomSheet,
                { bottom: bottomBarHeight, backgroundColor: sheetBg },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (!isMatchFinished) setIsMarketSheetExpanded(true);
                }}
                style={styles.sheetHandleHit}
              >
                <View
                  style={[
                    styles.sheetHandle,
                    !isLight && { backgroundColor: currentTheme?.divider || '#334155' },
                  ]}
                />
              </TouchableOpacity>

              {isMatchFinished ? (
                <View style={styles.noBetsMessageWrap}>
                  <Text style={[styles.noBetsMessageText, { color: sheetSubTextColor }]}>
                    Nous n&apos;avez pas de paris disponibles. Nous avons réalisé une sélection
                    d&apos;autres événements qui pourraient vous intéresser
                  </Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setIsMarketSheetExpanded(true)}
                    style={styles.marketHeaderRow}
                  >
                    <Text style={[styles.marketTitleText, { color: sheetTextColor }]}>
                      Total pair
                    </Text>
                    <Text style={[styles.marketSubText, { color: sheetSubTextColor }]}>
                      Temps réglementaire
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.marketButtonsRow}>
                    {(['Oui', 'Non'] as const).map((choice) => {
                      const isSelected = selectedTotalPair === choice;
                      return (
                        <TouchableOpacity
                          key={choice}
                          activeOpacity={0.8}
                          onPress={() => handleSelectTotalPair(choice)}
                          style={[
                            styles.marketOddButton,
                            { backgroundColor: buttonBg },
                            isSelected && {
                              borderColor: brandPrimary,
                              backgroundColor: isLight
                                ? 'rgba(74, 143, 214, 0.12)'
                                : 'rgba(255, 255, 255, 0.12)',
                            },
                          ]}
                        >
                          <Text style={[styles.marketOutcomeLabel, { color: sheetSubTextColor }]}>
                            {choice}
                          </Text>
                          <Text style={[styles.marketOutcomeOdd, { color: sheetTextColor }]}>
                            1.92
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* 4. ÉCRAN DE TRANSITION / CHARGEMENT FIFA (Identique à la capture)     */}
      {/* ===================================================================== */}
      {showSplash && (
        <Animated.View
          pointerEvents="auto"
          style={[
            StyleSheet.absoluteFill,
            styles.splashOverlay,
            { opacity: splashOpacity, bottom: bottomBarHeight },
          ]}
        >
          <View style={styles.splashTopArtworkWrap}>
            <Image
              source={resolveImageSource(FIFA_SPLASH_TOP_BG, '/assets/ui/fifa24_splash_top.jpg')}
              style={styles.splashTopArtwork}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(30, 33, 32, 0)', 'rgba(30, 33, 32, 0.35)', '#1E2120']}
              locations={[0.7, 0.9, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View style={[styles.splashTopBarWrap, { paddingTop: topSafePad }]}>
            <View style={styles.topAppBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconHitBox}>
                <BackArrowIcon size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View pointerEvents="none" style={styles.topBarTitleCenterWrap}>
                <Text style={styles.topBarTitle}>FIFA</Text>
              </View>
              <View style={styles.topBarRightActions}>
                <TouchableOpacity style={styles.iconHitBox} activeOpacity={0.7}>
                  <Ionicons name="flash" size={20} color="rgba(255,255,255,0.72)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconHitBox} activeOpacity={0.7}>
                  <Ionicons name="ellipsis-horizontal" size={21} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Animated.View style={[styles.splashBallCenter, { transform: [{ scale: ballScale }] }]}>
            <Image
              source={resolveImageSource(FIFA_SPLASH_BALL, '/assets/ui/fifa_splash_ball.png')}
              style={styles.splashBallImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

export { FifaLiveMatchScreen };

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#13171B',
    position: 'relative',
  },
  headerBg: {
    width: '100%',
    paddingBottom: 8,
    zIndex: 10,
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 40,
    position: 'relative',
  },
  topBarTitleCenterWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHitBox: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.2,
  },
  topBarRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  confrontationCard: {
    marginHorizontal: 6,
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: 'rgba(6, 18, 10, 0.68)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  teamsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamSideLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  teamSideRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  teamHeaderNameLeft: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    textAlign: 'left',
    paddingLeft: 8,
    paddingRight: 4,
    lineHeight: 17,
    fontFamily: Typography.fontFamily,
  },
  teamHeaderNameRight: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    textAlign: 'right',
    paddingRight: 8,
    paddingLeft: 4,
    lineHeight: 17,
    fontFamily: Typography.fontFamily,
  },
  teamCrestOuter: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteStarSubBadge: {
    position: 'absolute',
    bottom: -1,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minWidth: 92,
  },
  preMatchVsText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: Typography.fontFamily,
  },
  preMatchStartsInText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    fontFamily: Typography.fontFamily,
  },
  liveClockText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: Typography.fontFamily,
  },
  liveMainScoreText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: Typography.fontFamily,
  },
  livePeriodText: {
    color: 'rgba(255, 255, 255, 0.90)',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: Typography.fontFamily,
  },
  competitionBanner: {
    marginHorizontal: 6,
    backgroundColor: 'rgba(6, 18, 10, 0.72)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  competitionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  competitionBannerText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#13171B',
  },
  videoOuterWrap: {
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 364 / 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  broadcastViewport: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  // Incrustation TV Volta (FC 25 3x3 & FC 24 4x4) calée au pixel près sur la boîte de score
  voltaHudBar: {
    position: 'absolute',
    left: '4.4%',
    top: '4.0%',
    width: '34.9%',
    height: '6.0%',
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    borderRadius: 1,
  },
  voltaHudPeriodBox: {
    width: '19.2%',
    backgroundColor: '#F2F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  voltaHudPeriodText: {
    color: '#0F172A',
    fontSize: 5.2,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  voltaHudTeamBox: {
    width: '33.8%',
    backgroundColor: '#202426',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  voltaHudTeamText: {
    color: '#FFFFFF',
    fontSize: 5.4,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  voltaHudScoreBox: {
    width: '13.2%',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voltaHudScoreText: {
    color: '#0F172A',
    fontSize: 6.2,
    fontWeight: '900',
  },
  voltaBottomLeftPlate: {
    position: 'absolute',
    left: '4.95%',
    top: '93.0%',
    width: '15.9%',
    height: '5.0%',
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  voltaBottomRightPlate: {
    position: 'absolute',
    left: '78.5%',
    top: '93.0%',
    width: '15.9%',
    height: '5.0%',
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  voltaBottomPlateText: {
    color: '#111827',
    fontSize: 5.2,
    fontWeight: '800',
  },
  // Incrustation TV Rush (FC 26 5x5 Rush. Superligue) calée au centre supérieur
  rushHudContainer: {
    position: 'absolute',
    left: '40.66%',
    top: '3.5%',
    width: '18.41%',
    height: '9.0%',
    alignItems: 'center',
  },
  rushHudMainBar: {
    width: '100%',
    height: '61%',
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#161C1A',
  },
  rushTeamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 1,
  },
  rushMiniLogo: {
    width: 7,
    height: 7,
  },
  rushTeamAbbrText: {
    color: '#FFFFFF',
    fontSize: 5.5,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  rushScoreBox: {
    width: '27%',
    backgroundColor: '#4BF56E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rushScoreText: {
    color: '#09140D',
    fontSize: 6.2,
    fontWeight: '900',
  },
  rushTimerBox: {
    width: '42%',
    height: '39%',
    backgroundColor: '#141A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rushTimerText: {
    color: '#E2E8F0',
    fontSize: 4.8,
    fontWeight: '700',
  },
  // Bannière d'animation EA SPORTS FC 26 RUSH
  rushWipeOverlay: {
    position: 'absolute',
    left: '27%',
    top: '15%',
    width: '63%',
    height: '66%',
    backgroundColor: '#0B0E0D',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  rushWipeLogoRow: {
    position: 'absolute',
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eaCircleBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eaCircleText: {
    color: '#0B0E0D',
    fontSize: 7,
    fontWeight: '900',
  },
  fc26WhiteItalic: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  rushGreenItalic: {
    color: '#25E85A',
    fontSize: 15,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 0.3,
  },
  videoLoaderOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  matchStatsSection: {
    paddingHorizontal: 10,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 9,
    paddingHorizontal: 4,
    fontFamily: Typography.fontFamily,
  },
  matchStatsOuterBox: {
    backgroundColor: '#1B1E23',
    borderRadius: 16,
    padding: 6,
    gap: 6,
  },
  matchStatsHalfCard: {
    backgroundColor: '#252930',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchStatsLeftPeriod: {
    width: 112,
    paddingRight: 8,
    justifyContent: 'center',
  },
  matchStatsPeriodLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  matchStatsTeamsCol: {
    flex: 1,
    gap: 8,
  },
  matchStatsTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchStatsTeamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  miniCrestImg: {
    width: 23,
    height: 23,
    marginRight: 9,
  },
  miniCrestFallback: {
    width: 23,
    height: 23,
    marginRight: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchStatsTeamName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '500',
    flex: 1,
    fontFamily: Typography.fontFamily,
  },
  matchStatsScoreBox: {
    minWidth: 38,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#14171C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  matchStatsScoreVal: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  statsSection: {
    paddingHorizontal: 10,
    marginTop: 14,
  },
  statsSectionPreMatch: {
    marginTop: 12,
    paddingBottom: 2,
  },
  teamPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  teamPill: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  teamPillActive: {
    backgroundColor: '#154C33',
  },
  teamPillInactive: {
    backgroundColor: '#6B7372',
  },
  teamPillText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
  },
  teamPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#0F1211',
    borderRadius: 14,
    padding: 15,
    marginTop: 10,
  },
  statsUpperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  donutContainer: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotalValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 25,
    fontFamily: Typography.fontFamily,
  },
  donutSubText: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  legendColumn: {
    flex: 1,
    marginLeft: 28,
    gap: 10,
    paddingRight: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 8,
  },
  legendLabel: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  legendValue: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  statsCardDivider: {
    height: 1,
    backgroundColor: '#1E2322',
    marginVertical: 13,
  },
  statsBottomSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsBottomCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBottomColDivider: {
    borderRightWidth: 1,
    borderRightColor: '#1E2322',
  },
  statsBottomText: {
    color: '#F1F5F9',
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: Typography.fontFamily,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  standingRank: {
    color: '#94A3B8',
    width: 24,
    fontSize: 13,
    fontWeight: '700',
  },
  standingTeam: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  standingGd: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginRight: 14,
  },
  standingPts: {
    color: '#2ECC71',
    fontSize: 13.5,
    fontWeight: '700',
  },
  preMatchMarketsSheetWrap: {
    flex: 1,
    marginTop: -12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    zIndex: 25,
  },
  liveExpandedMarketsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '62%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    zIndex: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 14,
  },
  expandedMarketsWrap: {
    flex: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 6,
  },
  sheetHandleHit: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodPillsContainer: {
    paddingBottom: 10,
  },
  periodPillsScroll: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center',
  },
  periodPillBtn: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  periodPillText: {
    fontSize: 13.5,
    fontFamily: Typography.fontFamily,
  },
  marketsListScroll: {
    flex: 1,
  },
  fifaMarketCard: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  fifaMarketCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fifaMarketCardTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '600',
    paddingRight: 10,
    fontFamily: Typography.fontFamily,
  },
  fifaMarketCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fifaMarketCountText: {
    fontSize: 13.5,
    fontWeight: '500',
    marginRight: 8,
    fontFamily: Typography.fontFamily,
  },
  fifaCircleIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fifaMarketOptionsWrap: {
    marginTop: 11,
  },
  fifaMarketOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fifaMarketOddCell: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fifaMarketOptLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '400',
    marginRight: 6,
    fontFamily: Typography.fontFamily,
  },
  fifaMarketOptOdd: {
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  marketBottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 18,
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  noBetsMessageWrap: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBetsMessageText: {
    fontSize: 13.5,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: Typography.fontFamily,
  },
  marketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  marketTitleText: {
    color: '#00325E',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  marketSubText: {
    color: '#5C7690',
    fontSize: 13.5,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  marketButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  marketOddButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  marketOutcomeLabel: {
    color: '#5C7690',
    fontSize: 13.5,
    fontWeight: '400',
    fontFamily: Typography.fontFamily,
  },
  marketOutcomeOdd: {
    color: '#00325E',
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
  },
  splashOverlay: {
    backgroundColor: '#1E2120',
    zIndex: 200,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  splashTopArtworkWrap: {
    width: '100%',
    height: '44%',
    position: 'relative',
  },
  splashTopArtwork: {
    width: '100%',
    height: '100%',
  },
  splashTopBarWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  splashBallCenter: {
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashBallImage: {
    width: 154,
    height: 154,
  },
});
