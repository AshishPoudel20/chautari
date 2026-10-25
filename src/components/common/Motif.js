import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// A restrained Nepali-inspired motif: a row of small diamonds (a nod to textile
// and temple lattice work). Used ONLY in empty states, the splash, and section
// dividers — never loud. Built from plain Views so it adds no dependencies.

export function MotifBand({ count = 9, color, size = 7, style }) {
  const { colors, spacing } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing), [colors, spacing]);
  const bandColor = color ?? colors.borderStrong;
  return (
    <View style={[styles.band, style]} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.diamond,
            { width: size, height: size, backgroundColor: i % 2 === 0 ? bandColor : 'transparent', borderColor: bandColor },
          ]}
        />
      ))}
    </View>
  );
}

// A faint divider with a centered diamond — for section breaks.
export function MotifDivider({ style }) {
  const { colors, spacing } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing), [colors, spacing]);
  return (
    <View style={[styles.dividerWrap, style]} pointerEvents="none">
      <View style={styles.dividerLine} />
      <View style={styles.dividerDiamond} />
      <View style={styles.dividerLine} />
    </View>
  );
}

const createStyles = (colors, spacing) => StyleSheet.create({
  band: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  diamond: { transform: [{ rotate: '45deg' }], borderRadius: 1.5, borderWidth: 1 },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerDiamond: { width: 7, height: 7, transform: [{ rotate: '45deg' }], backgroundColor: colors.borderStrong, borderRadius: 1.5 },
});
