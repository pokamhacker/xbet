import type { AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const SOURCES = {
  tap: require('../../../../assets/kamikaze/sounds/tap.wav'),
  plane: require('../../../../assets/kamikaze/sounds/plane.wav'),
  boom: require('../../../../assets/kamikaze/sounds/boom.wav'),
  boom_big: require('../../../../assets/kamikaze/sounds/boom_big.wav'),
  win: require('../../../../assets/kamikaze/sounds/win.wav'),
  lose: require('../../../../assets/kamikaze/sounds/lose.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;
export type HapticKind = 'tap' | 'safe' | 'win' | 'lose';

/** Sons et vibrations du jeu. Un seul interrupteur (le bouton haut-parleur) coupe les deux. */
class Sfx {
  private players = new Map<SoundName, AudioPlayer>();
  private enabled = true;
  private ready = false;

  init(): void {
    if (this.ready) return;
    this.ready = true;
    let audio: typeof import('expo-audio');
    try {
      // Chargé à la demande : si le module natif manque (APK construit avant son ajout),
      // le jeu tourne sans le son au lieu de faire planter l'application au démarrage.
      audio = require('expo-audio');
    } catch {
      return;
    }
    audio.setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    (Object.keys(SOURCES) as SoundName[]).forEach(name => {
      try {
        this.players.set(name, audio.createAudioPlayer(SOURCES[name]));
      } catch {
        // son indisponible : le jeu continue sans
      }
    });
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
  }

  play(name: SoundName): void {
    if (!this.enabled) return;
    const p = this.players.get(name);
    if (!p) return;
    try {
      void p.seekTo(0);
      p.play();
    } catch {
      // ignoré
    }
  }

  haptic(kind: HapticKind): void {
    if (!this.enabled) return;
    const run = () => {
      switch (kind) {
        case 'tap':
          return Haptics.selectionAsync();
        case 'safe':
          return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        case 'win':
          return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        case 'lose':
          return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    };
    try {
      run().catch(() => {});
    } catch {
      // pas de vibreur (web, simulateur)
    }
  }

  dispose(): void {
    this.players.forEach(p => {
      try {
        p.remove();
      } catch {
        // ignoré
      }
    });
    this.players.clear();
    this.ready = false;
  }
}

export const sfx = new Sfx();
