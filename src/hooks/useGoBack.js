import { useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

function navigateToMainTabLocal(navigation, tabName) {
  if (!navigation) return;
  let nav = navigation;
  for (let depth = 0; depth < 6 && nav; depth += 1) {
    const routeNames = nav.getState?.()?.routeNames ?? [];
    if (routeNames.includes(tabName)) {
      nav.navigate(tabName);
      return;
    }
    if (routeNames.includes('Main')) {
      nav.navigate('Main', { screen: tabName });
      return;
    }
    nav = nav.getParent?.();
  }
}

/**
 * Safe back: pop when possible, otherwise land on a main tab.
 * Use for on-screen back controls and Android hardware back on detail screens.
 */
export function useGoBack(navigation, { fallbackTab = 'Home' } = {}) {
  return useCallback(() => {
    if (!navigation) return;
    const can = !!navigation.canGoBack?.();
    if (can) {
      navigation.goBack();
      return;
    }
    navigateToMainTabLocal(navigation, fallbackTab);
  }, [navigation, fallbackTab]);
}

/**
 * While this screen is focused, Android hardware back mirrors on-screen back
 * (pop or safe fallback) instead of exiting the app from a detail screen.
 */
export function useAndroidBackHandler(onBack) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !onBack) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        onBack();
        return true;
      });
      return () => sub.remove();
    }, [onBack]),
  );
}
