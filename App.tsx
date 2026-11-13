import React, { useEffect } from 'react';
import { Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome,
  Feather,
} from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { setupCleanLogging } from './src/utils/logger';
import { useThemeStore } from './src/store/themeStore';
import {
  getHeaderBgColor,
  getScreenBgColor,
  getStatusBarStyleForTheme,
} from './src/theme/themes';

setupCleanLogging();

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error || 'Erreur inconnue');
    return { hasError: true, errorMsg: msg };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#0F172A',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 8 }}>
            Une erreur d'affichage est survenue
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 18 }}>
            {this.state.errorMsg}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.setState({ hasError: false, errorMsg: '' });
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 18,
              paddingVertical: 11,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
              Recharger l'application
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { currentTheme } = useThemeStore();
  const headerBg = getHeaderBgColor(currentTheme);
  const screenBg = getScreenBgColor(currentTheme);
  const barStyle = getStatusBarStyleForTheme(currentTheme, headerBg);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
    ...Feather.font,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.name = 'theme-color';
        document.head.appendChild(metaTheme);
      }
      metaTheme.content = headerBg;

      document.documentElement.style.backgroundColor = headerBg;
      document.body.style.backgroundColor = screenBg;
      const rootEl = document.getElementById('root');
      if (rootEl) {
        rootEl.style.backgroundColor = screenBg;
      }
    }
  }, [headerBg, screenBg]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const fontId = 'google-font-roboto';
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
        document.head.appendChild(link);
      }

      // Injection globale de @font-face pour toutes les polices d'icônes sur le Web
      const iconFontFaceId = 'global-vector-icon-fonts';
      if (!document.getElementById(iconFontFaceId)) {
        const style = document.createElement('style');
        style.id = iconFontFaceId;
        style.innerHTML = `
          @font-face {
            font-family: 'ionicons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'Ionicons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'material-community';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'Material Design Icons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'material';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'Material Icons';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'FontAwesome';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf') format('truetype');
            font-display: swap;
          }
          @font-face {
            font-family: 'feather';
            src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.2/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
      }

      const styleId = 'global-full-viewport-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body, #root {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          input, textarea {
            -webkit-user-select: text !important;
            user-select: text !important;
            touch-action: manipulation;
          }
        `;
        document.head.appendChild(style);
      }

      // Protection globale contre le vol de focus (ex: ModalFocusTrap / ScrollView de react-native-web)
      // qui faisait disparaître le clavier virtuel dès l'ouverture ou pendant la frappe d'un champ de score.
      const w = window as any;
      if (!w.__inputFocusGuardInstalled && typeof HTMLElement !== 'undefined') {
        w.__inputFocusGuardInstalled = true;
        w.__lastInputFocusAt = 0;
        w.__userTappedOutsideInput = false;
        w.__lastOutsideTapAt = 0;
        w.__lastExplicitKeyBlurAt = 0;

        const isEditableOrKeepFocus = (target: EventTarget | null): boolean => {
          const el = target as HTMLElement | null;
          if (!el || typeof el !== 'object') return false;
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
            return true;
          }
          if (typeof el.closest === 'function') {
            return Boolean(el.closest('input, textarea, [contenteditable="true"], [data-keep-input-focus="true"]'));
          }
          return false;
        };

        document.addEventListener(
          'focusin',
          (e) => {
            if (isEditableOrKeepFocus(e.target)) {
              w.__lastInputFocusAt = Date.now();
              w.__userTappedOutsideInput = false;
            }
          },
          true
        );

        const markPointerTarget = (e: Event) => {
          if (isEditableOrKeepFocus(e.target)) {
            w.__userTappedOutsideInput = false;
          } else {
            w.__userTappedOutsideInput = true;
            w.__lastOutsideTapAt = Date.now();
          }
        };
        document.addEventListener('pointerdown', markPointerTarget, true);
        document.addEventListener('touchstart', markPointerTarget, { capture: true, passive: true });

        document.addEventListener(
          'keydown',
          (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              w.__lastExplicitKeyBlurAt = Date.now();
            }
          },
          true
        );

        const origFocus = HTMLElement.prototype.focus;
        HTMLElement.prototype.focus = function (options?: FocusOptions) {
          const active = document.activeElement as HTMLElement | null;
          if (
            active &&
            (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable) &&
            this !== active &&
            this.tagName !== 'INPUT' &&
            this.tagName !== 'TEXTAREA' &&
            !this.isContentEditable
          ) {
            // Ignorer tout appel programmatique .focus() vers un div/bracket pendant qu'un champ de saisie est actif
            return;
          }
          return origFocus.call(this, options);
        };

        const origBlur = HTMLElement.prototype.blur;
        HTMLElement.prototype.blur = function () {
          const isInput =
            this.tagName === 'INPUT' || this.tagName === 'TEXTAREA' || this.isContentEditable;
          const active = document.activeElement as HTMLElement | null;
          if (isInput && active === this && this.dataset?.keepKeyboardOpen === 'true') {
            const now = Date.now();
            const tappedOutsideRecently =
              w.__userTappedOutsideInput && now - (w.__lastOutsideTapAt || 0) < 700;
            const keyBlurRecently = now - (w.__lastExplicitKeyBlurAt || 0) < 300;
            if (!tappedOutsideRecently && !keyBlurRecently) {
              // Bloquer les .blur() programmatiques déclenchés par ScrollView / Responder / Resize
              return;
            }
          }
          return origBlur.call(this);
        };
      }
    }
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, width: '100%', height: '100%', backgroundColor: screenBg }}>
      <StatusBar
        animated
        barStyle={barStyle}
        {...({ translucent: true, backgroundColor: 'transparent' } as any)}
      />
      <AppErrorBoundary>
        <AppNavigator />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
