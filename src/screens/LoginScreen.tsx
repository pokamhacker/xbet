import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../stores/themeStore';
import { Colors } from '../theme/theme';
import { BrandLogo } from '../components/common/BrandLogo';

export default function LoginScreen() {
  const { login, localDeviceId, sessionAlertMessage, clearSessionAlert } = useAuthStore();
  const { currentTheme } = useThemeStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);
    clearSessionAlert();

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Erreur lors de la connexion.');
      }
    } catch {
      setErrorMessage('Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
    clearSessionAlert();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.isDark ? currentTheme.background : '#0F172A' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" translucent={Platform.OS === 'android'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Brand Section */}
          <View style={styles.brandContainer}>
            <View style={{ marginBottom: 12, alignItems: 'center' }}>
              <BrandLogo size={36} variant="header" showTagline />
            </View>
            <Text style={[styles.brandTitle, { color: currentTheme.isDark ? currentTheme.textPrimary : '#FFFFFF' }]}>
              {currentTheme.displayName.toUpperCase()} STUDIO
            </Text>
            <Text style={[styles.brandSubtitle, { color: currentTheme.textSecondary }]}>PORTAIL D'AUTHENTIFICATION UNIQUE</Text>
          </View>

          {/* Session Invalidation Alert if kicked out */}
          {sessionAlertMessage && (
            <View style={styles.alertBanner}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>Déconnexion de sécurité</Text>
                <Text style={styles.alertText}>{sessionAlertMessage}</Text>
              </View>
            </View>
          )}

          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="close-circle" size={18} color="#F87171" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Connexion au compte</Text>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: admin ou user"
                  placeholderTextColor="#64748B"
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                { backgroundColor: currentTheme.primary },
                isLoading && styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={currentTheme.colors?.primaryText || '#FFFFFF'} />
              ) : (
                <>
                  <Text style={[styles.loginBtnText, { color: currentTheme.colors?.primaryText || '#FFFFFF' }]}>SE CONNECTER</Text>
                  <Ionicons name="arrow-forward" size={18} color={currentTheme.colors?.primaryText || '#FFFFFF'} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Device & Security Info Footer */}
          <View style={styles.securityFooter}>
            <View style={styles.securityBadge}>
              <Ionicons name="hardware-chip-outline" size={16} color="#22C55E" />
              <Text style={styles.securityText}>
                Protection Mono-Appareil active
              </Text>
            </View>
            <Text style={styles.deviceIdText}>
              ID Appareil : {localDeviceId ? `${localDeviceId.slice(0, 16)}...` : 'Enregistrement...'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  logoText1: {
    fontSize: 26,
    fontWeight: '900',
    color: '#38BDF8',
    letterSpacing: 1,
  },
  logoText2: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
    letterSpacing: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#FECACA',
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#FCA5A5',
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    height: 48,
    marginTop: 6,
    gap: 8,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  quickFillContainer: {
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  quickFillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  quickChipsRow: {
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  securityFooter: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22C55E',
  },
  deviceIdText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
