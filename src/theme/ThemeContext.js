import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, shadowsFor } from './palettes';
import { spacing, radius, font, line, weight, colorForString } from './tokens';

const THEME_KEY = 'chautari.theme.v1';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light') setModeState(saved);
      } catch (_) { /* keep default */ }
      setReady(true);
    })();
  }, []);

  const setMode = useCallback(async (next) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch (_) { /* non-fatal */ }
  }, []);

  const toggleDark = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const shadow = useMemo(() => shadowsFor(colors, isDark), [colors, isDark]);

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      shadow,
      spacing,
      radius,
      font,
      line,
      weight,
      colorForString,
      setMode,
      toggleDark,
      ready,
    }),
    [mode, isDark, colors, shadow, setMode, toggleDark, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Build styles from the active palette — call inside components. */
export function useThemedStyles(factory) {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
