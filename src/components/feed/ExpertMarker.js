import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// The "an expert is here" alive marker for feed cards. Saffron-accented and
// weighted so it reads as "you'll get a credible answer here" at a glance.
// This is the one place saffron earns its keep on the card.
export default function ExpertMarker({ name, compact, mode = 'answered' }) {
  const { colors, radius, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, radius, font), [colors, radius, font]);
  const label = mode === 'posted'
    ? (name ? `${name} · expert post` : 'Verified expert post')
    : (name ? `${name} answered` : 'Expert answered');

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.dot} />
      <Text style={styles.text} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const createStyles = (colors, radius, font) => StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: colors.secondaryTint, borderColor: colors.expertMarkerBorder, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill,
  },
  compact: { paddingVertical: 3, paddingHorizontal: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.secondary },
  text: { color: colors.secondaryDark, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.2, maxWidth: 180 },
});
