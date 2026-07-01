/**
 * Root Layout — Phase 2 update
 *
 * Switched from a pure AppTabs render to a Stack navigator so that the
 * /camera route can be pushed as a full-screen screen on top of the
 * home (index) screen without showing a tab bar.
 *
 * Stack.Screen options explanation:
 *  - headerShown: false   → we handle our own back-navigation UI in each screen
 *  - presentation: 'fullScreenModal' (camera) → covers the entire display
 *    including the status bar, which is what a camera viewfinder requires.
 */
import { Stack, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Home screen — verification dashboard */}
        <Stack.Screen name="index" />

        {/* Explore screen (from default Expo template) */}
        <Stack.Screen name="explore" />

        {/* Camera — full-screen modal so the viewfinder fills the display */}
        <Stack.Screen
          name="camera"
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
