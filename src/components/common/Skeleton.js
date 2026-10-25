import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// A gently shimmering placeholder block. Used for tasteful loading states while
// mock data "loads".
function Shimmer({ style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createBlockStyles(colors), [colors]);
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[styles.block, style, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] }) }]} />;
}

// A skeleton shaped like a QuestionCard, for the Home feed's first load.
export function QuestionCardSkeleton() {
  const { colors, spacing, radius, shadow } = useTheme();
  const styles = useMemo(() => createCardStyles(colors, spacing, radius, shadow), [colors, spacing, radius, shadow]);
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Shimmer style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Shimmer style={{ width: '45%', height: 12, borderRadius: 6 }} />
          <Shimmer style={{ width: '30%', height: 10, borderRadius: 5, marginTop: 6 }} />
        </View>
        <Shimmer style={{ width: 64, height: 20, borderRadius: 999 }} />
      </View>
      <Shimmer style={{ width: '90%', height: 16, borderRadius: 6, marginTop: spacing.md }} />
      <Shimmer style={{ width: '70%', height: 16, borderRadius: 6, marginTop: 8 }} />
      <Shimmer style={{ width: '100%', height: 12, borderRadius: 6, marginTop: spacing.md }} />
      <View style={[styles.row, { marginTop: spacing.md }]}>
        <Shimmer style={{ width: 50, height: 14, borderRadius: 6 }} />
        <Shimmer style={{ width: 70, height: 14, borderRadius: 6, marginLeft: spacing.md }} />
      </View>
    </View>
  );
}

const createBlockStyles = (colors) => StyleSheet.create({
  block: { backgroundColor: colors.bgSunken },
});

const createCardStyles = (colors, spacing, radius, shadow) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 38, height: 38, borderRadius: 19 },
});
