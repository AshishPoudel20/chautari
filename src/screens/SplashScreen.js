import React, { useMemo,  useEffect, useRef  } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { MotifBand } from '../components/Motif';
import ShinyWordmark from '../components/ShinyWordmark';
import { useTheme } from '../theme/ThemeContext';

// Animated logo splash (~1.5s). The actual hold/route is governed by RootNavigator.
export default function SplashScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const motif = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(motif, { toValue: 1, duration: 900, delay: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
        <View style={styles.logo}>
          <Text style={styles.logoEmoji}>🌳</Text>
        </View>
        <ShinyWordmark style={styles.wordmark} variant="splash" />
        <Text style={styles.tag}>Post. Answer. Belong.</Text>
      </Animated.View>
      <Animated.View style={{ opacity: motif, marginTop: 28 }}>
        <MotifBand count={9} color={colors.splashMotif} size={6} style={{ opacity: 0.35 }} />
      </Animated.View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.splashBg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 112, height: 112, borderRadius: 32, backgroundColor: colors.splashLogoBg, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoEmoji: { fontSize: 60 },
  wordmark: { color: colors.onPrimary, fontSize: 38, fontWeight: '800', letterSpacing: 0.5 },
  tag: { color: colors.splashTextMuted, fontSize: 15, marginTop: 8, fontWeight: '600', letterSpacing: 0.3 },
});
