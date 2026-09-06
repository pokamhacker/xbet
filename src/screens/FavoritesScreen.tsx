import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/theme';

export default function FavoritesScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="star-outline" size={44} color={Colors.primaryAccent} />
          </View>
          <Text style={styles.emptyTitle}>Aucun favori enregistré</Text>
          <Text style={styles.emptySub}>
            Épingle tes championnats, matchs ou sélections préférés pour y accéder rapidement ici.
          </Text>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Populaire')}
          >
            <Text style={styles.exploreBtnText}>Explorer les studios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 88,
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
