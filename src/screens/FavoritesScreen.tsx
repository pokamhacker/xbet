import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { useResponsive } from '../utils/responsive';
import { BrandLogo } from '../components/common/BrandLogo';

export default function FavoritesScreen({ navigation }: any) {
  const { currentTheme } = useThemeStore();
  const { contentContainerStyle, font, moderateScale, insets } = useResponsive();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar
        barStyle={currentTheme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.headerBackground || '#FFFFFF'}
        translucent={Platform.OS === 'android'}
      />
      <View style={[styles.header, { backgroundColor: currentTheme.headerBackground, borderBottomColor: currentTheme.border }]}>
        <View style={[{ width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 }, contentContainerStyle]}>
          <BrandLogo size={18} variant="compact" />
          <Text style={[styles.headerTitle, { color: currentTheme.textPrimary, fontSize: font(17) }]}>Favoris</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, contentContainerStyle, { paddingBottom: 100 + (insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 0)) }]}>
        <View style={[styles.emptyCard, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: currentTheme.primarySoft, width: moderateScale(72), height: moderateScale(72), borderRadius: moderateScale(36) }]}>
            <Ionicons name="star-outline" size={moderateScale(44)} color={currentTheme.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: currentTheme.textPrimary, fontSize: font(16) }]}>Aucun favori enregistré</Text>
          <Text style={[styles.emptySub, { color: currentTheme.textSecondary, fontSize: font(12) }]}>
            Épingle tes championnats, matchs ou sélections préférés pour y accéder rapidement ici.
          </Text>

          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: currentTheme.primary }]}
            onPress={() => navigation.navigate('Populaire')}
            activeOpacity={0.8}
          >
            <Text style={[styles.exploreBtnText, { color: currentTheme.name.startsWith('melbet') ? '#000000' : '#FFFFFF', fontSize: font(13) }]}>
              Explorer les studios
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 110,
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
