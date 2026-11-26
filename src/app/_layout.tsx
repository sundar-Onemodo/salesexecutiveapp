import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Stack, router, useSegments, ThemeProvider, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadStoredAuthThunk } from '@/store/slices/authSlice';
import { AppColors } from '@/constants/colors';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';

SplashScreen.preventAutoHideAsync();

const LightAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.primary,
    background: AppColors.background,
    card: AppColors.card,
    text: AppColors.textPrimary,
    border: AppColors.border,
    notification: AppColors.primaryDark,
  },
};

function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Load persisted auth from AsyncStorage on startup
  useEffect(() => {
    dispatch(loadStoredAuthThunk());
  }, [dispatch]);

  // Auth routing guard
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if already authenticated
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isInitialized, segments]);

  // Check for EAS OTA updates in standalone/production builds
  useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available',
            'A new update has been downloaded. Restart the app now to apply changes?',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Restart Now',
                onPress: async () => {
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        }
      } catch {
        // Silently ignore update check errors (e.g. offline)
      }
    }

    checkForUpdates();
  }, []);

  return (
    <>
      <StatusBar style={isSplashVisible ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
      {isSplashVisible && (
        <AnimatedSplashScreen
          isAppReady={isInitialized}
          onAnimationComplete={() => setIsSplashVisible(false)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider value={LightAppTheme}>
        <RootNavigator />
      </ThemeProvider>
    </Provider>
  );
}
