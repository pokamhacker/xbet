import React from 'react';
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  View,
  ScrollView,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

export interface MainLayoutProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  paddingHorizontal?: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  header,
  footer,
  backgroundColor,
  paddingHorizontal,
}) => {
  const { currentTheme } = useThemeStore();
  const isDark = currentTheme?.isDark;
  const bg = backgroundColor || currentTheme?.background || '#F8FAFC';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme?.headerBackground || bg}
      />
      <View
        style={[
          styles.mainContainer,
          paddingHorizontal !== undefined ? { paddingHorizontal } : null,
          style,
        ]}
      >
        {header}
        {scrollable ? (
          <ScrollView
            style={{ width: '100%' }}
            contentContainerStyle={[styles.contentScrollView, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
        {footer}
      </View>
    </SafeAreaView>
  );
};

export default MainLayout;

// CSS / StyleSheet React Native
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fond d'écran principal
  },
  mainContainer: {
    flex: 1,
    width: '100%',          // 100% de la largeur disponible
    height: '100%',         // 100% de la hauteur disponible
    paddingHorizontal: 12,  // Marges latérales réduites à 12px
    justifyContent: 'space-between',
  },
  contentScrollView: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: 20,
  },
});
