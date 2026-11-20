import React, { useEffect } from 'react';
import { Stack, router, useSegments, ThemeProvider, DefaultTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadStoredAuthThunk } from '@/store/slices/authSlice';
import { AppColors } from '@/constants/colors';

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

  // Load persisted auth from AsyncStorage on startup
  useEffect(() => {
    dispatch(loadStoredAuthThunk());
  }, [dispatch]);

  // Auth routing guard
  useEffect(() => {
    if (!isInitialized) return;

    // Hide splash screen once auth check is complete
    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if already authenticated
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isInitialized, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
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
