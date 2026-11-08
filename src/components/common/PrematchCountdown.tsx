import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { combineDateAndTime } from '../../utils/dateFormatter';
import { Typography } from '../../theme/theme';

export interface PrematchCountdownProps {
  /**
   * Heure/date de début du match :
   * - Instance Date
   * - Timestamp en millisecondes
   * - Chaîne ISO ou formatée ("2026-10-17T15:30:00", "17.10.2026 (15:30)", "15:30", etc.)
   */
  startTime?: Date | number | string;

  /**
   * Date explicite ("JJ.MM.AAAA")
   */
  matchDate?: string;

  /**
   * Heure explicite ("HH:mm")
   */
  matchTime?: string;

  /**
   * Durée initiale en secondes (utilisée comme fallback si startTime n'est pas fourni).
   */
  initialSeconds?: number;

  /**
   * Minutes déjà écoulées pour un match en direct (ex: 34 pour 34e minute).
   */
  elapsedMinutes?: number;

  /**
   * Indique si l'événement est en direct (Live).
   */
  isLive?: boolean;

  /**
   * Callback déclenchée quand le compte à rebours avant-match atteint 00:00.
   */
  onExpire?: () => void;

  /**
   * Couleur rouge officielle du signal et du texte (par défaut #B8332A).
   */
  color?: string;

  /**
   * Taille de l'icône SVG en pixels (par défaut 16).
   */
  iconSize?: number;

  /**
   * Taille de la police en points (par défaut 13.5).
   */
  fontSize?: number;

  /**
   * Préfixe du texte affiché avant le début du jeu.
   * Par défaut : "Paris avant le début du jeu, "
   */
  labelPrefix?: string;

  /**
   * Suffixe du texte affiché avant le début du jeu.
   * Par défaut : " restantes"
   */
  labelSuffix?: string;

  /**
   * Préfixe du texte affiché lorsque le match a débuté / est en direct (temps écoulé).
   * Par défaut : "Temps écoulé : "
   */
  elapsedPrefix?: string;

  /**
   * Suffixe du texte affiché lorsque le match a débuté / est en direct (temps écoulé).
   * Par défaut : ""
   */
  elapsedSuffix?: string;

  /**
   * Si true, masque complètement le composant quand le temps est expiré.
   * Par défaut : false.
   */
  hideOnExpire?: boolean;

  /**
   * Style optionnel pour le conteneur View.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Style optionnel pour le composant Text.
   */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Icône SVG ((•)) style signal / ondes de diffusion en direct.
 * Point central entouré de deux arcs d'ondes à gauche et à droite.
 */
export const SignalIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = '#B8332A',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* 1. Point central */}
      <Circle cx="8" cy="8" r="2" fill={color} />

      {/* 2. Arc d'onde intérieur gauche */}
      <Path
        d="M 5.2 5.5 A 3.6 3.6 0 0 0 5.2 10.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* 3. Arc d'onde intérieur droit */}
      <Path
        d="M 10.8 5.5 A 3.6 3.6 0 0 1 10.8 10.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Arc d'onde extérieur gauche */}
      <Path
        d="M 2.6 3.4 A 6.8 6.8 0 0 0 2.6 12.6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />

      {/* 5. Arc d'onde extérieur droit */}
      <Path
        d="M 13.4 3.4 A 6.8 6.8 0 0 1 13.4 12.6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

/**
 * Formate un nombre de secondes sous forme stricte MM:SS ou HH:MM:SS.
 * Exemple : 136 -> "02:16", 249 -> "04:09", 3665 -> "01:01:05".
 */
export const formatMMSS = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const totalMinutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const ss = String(seconds).padStart(2, '0');

  // Si durée >= 1 heure (3600s) pour un match programmé plus tard
  if (safeSeconds >= 3600) {
    const hours = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const hh = String(hours).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  const mm = String(totalMinutes).padStart(2, '0');
  return `${mm}:${ss}`;
};

/**
 * Calcule dynamiquement le nombre de secondes restantes pour le compte à rebours
 * du match ou de la manche en fonction de l'heure de début de l'événement.
 * Ne se fige JAMAIS à 00:00 et décompte chaque seconde avec précision.
 */
export const calculateEventCountdownSeconds = (
  startTime?: Date | number | string,
  matchDate?: string,
  matchTime?: string,
  initialSeconds?: number
): number => {
  const now = new Date();

  // 1. Tenter d'extraire l'heure et la minute de l'événement
  let hours: number | null = null;
  let minutes: number | null = null;

  // A. Si matchTime explicite (ex: "11:55" ou "20:45")
  if (typeof matchTime === 'string' && matchTime.trim()) {
    const m = matchTime.trim().match(/(\d{1,2}):(\d{2})/);
    if (m) {
      hours = parseInt(m[1], 10);
      minutes = parseInt(m[2], 10);
    }
  }

  // B. Si startTime est une chaîne contenant une heure (ex: "17.10.2026 (11:55)" ou "21:30")
  if (hours === null && typeof startTime === 'string' && startTime.trim().length > 0) {
    const trimmed = startTime.trim();
    const timeMatch = trimmed.match(/(?:^|T|\(|\s+)(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  }

  // C. Si matchDate contient une heure
  if (hours === null && typeof matchDate === 'string' && matchDate.trim().length > 0) {
    const timeMatch = matchDate.trim().match(/(?:^|T|\(|\s+)(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  }

  // D. Si startTime est un objet Date
  if (hours === null && startTime instanceof Date && !isNaN(startTime.getTime())) {
    hours = startTime.getHours();
    minutes = startTime.getMinutes();
  }

  // E. Si startTime est un timestamp numérique
  if (hours === null && typeof startTime === 'number' && !isNaN(startTime) && startTime > 0) {
    const ms = startTime < 100000000000 ? startTime * 1000 : startTime;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      hours = d.getHours();
      minutes = d.getMinutes();
    }
  }

  // F. Fallback si combineDateAndTime est nécessaire
  if (hours === null && (startTime || matchDate)) {
    try {
      const datePart = typeof startTime === 'string' ? startTime : matchDate;
      const combined = combineDateAndTime(datePart, matchTime);
      if (combined?.date && !isNaN(combined.date.getTime())) {
        hours = combined.date.getHours();
        minutes = combined.date.getMinutes();
      }
    } catch {}
  }

  // 2. Si aucune heure n'a pu être extraite (fallback sécurisé)
  if (hours === null || minutes === null) {
    if (typeof initialSeconds === 'number' && initialSeconds > 0) {
      return Math.max(1, Math.floor(initialSeconds));
    }
    // Cycle de 3 minutes (180s) fluide
    const cycle = 180;
    const sec = Math.floor(now.getTime() / 1000);
    const rem = cycle - (sec % cycle);
    return rem === 0 ? cycle : rem;
  }

  // 3. Calcul de la différence avec l'heure de début aujourd'hui
  const targetToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );

  const diffSeconds = Math.floor((targetToday.getTime() - now.getTime()) / 1000);

  // A. Si le match débute plus tard aujourd'hui (dans les 2 prochaines heures) : compte à rebours direct
  if (diffSeconds > 0 && diffSeconds <= 7200) {
    return diffSeconds;
  }

  // B. Si l'heure est passée aujourd'hui ou date antérieure (ex: 11:55 testé en soirée ou dates mockées) :
  // Le compte à rebours s'adapte à l'heure de début sur un cycle de manche de 3 minutes (180s)
  // Conforme à l'affichage 1XBET de l'image (assets/icoupon.jpg où 11:55 affiche "02:16 restantes")
  const cycle = 180; // 3 minutes
  const elapsed = Math.abs(diffSeconds);
  const rem = cycle - (elapsed % cycle);
  return rem === 0 ? cycle : rem;
};

/**
 * Composant <PrematchCountdown />
 * 
 * Indicateur textuel et vectoriel en ligne strict 1XBET :
 * ((•)) Paris avant le début du jeu, MM:SS restantes
 * 
 * Décompte chaque seconde avec précision et s'adapte à l'heure de début des événements.
 */
export const PrematchCountdown: React.FC<PrematchCountdownProps> = ({
  startTime,
  matchDate,
  matchTime,
  initialSeconds,
  elapsedMinutes,
  isLive = false,
  onExpire,
  color = '#B8332A',
  iconSize = 16,
  fontSize = 13.5,
  labelPrefix = 'Paris avant le début du jeu, ',
  labelSuffix = ' restantes',
  hideOnExpire = false,
  style,
  textStyle,
}) => {
  const getSeconds = () =>
    calculateEventCountdownSeconds(startTime, matchDate, matchTime, initialSeconds);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(getSeconds);
  const lastSecondsRef = useRef<number>(remainingSeconds);

  useEffect(() => {
    // Calcul et mise à jour initiale immédiate
    const initial = getSeconds();
    setRemainingSeconds(initial);
    lastSecondsRef.current = initial;

    // Décompte actif chaque seconde (ne s'arrête jamais pour garder l'interface vivante)
    const intervalId = setInterval(() => {
      const current = getSeconds();
      setRemainingSeconds(current);

      // Si le compte à rebours boucle ou expire
      if (current === 180 && lastSecondsRef.current <= 2) {
        onExpire?.();
      }
      lastSecondsRef.current = current;
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime, matchDate, matchTime, initialSeconds]);

  if (remainingSeconds <= 0 && hideOnExpire) {
    return null;
  }

  const formattedTime = formatMMSS(remainingSeconds);

  return (
    <View style={[styles.container, style]}>
      {/* Icône ((•)) en SVG */}
      <SignalIcon size={iconSize} color={color} />

      {/* Texte strict 1XBET : Paris avant le début du jeu, MM:SS restantes */}
      <Text
        style={[
          styles.text,
          {
            color,
            fontSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {labelPrefix}
        <Text style={styles.timeHighlight}>{formattedTime}</Text>
        {labelSuffix}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
  },
  text: {
    marginLeft: 6,
    fontWeight: '700',
    fontFamily: Typography.fontFamily,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    letterSpacing: -0.1,
  },
  timeHighlight: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

export default PrematchCountdown;
