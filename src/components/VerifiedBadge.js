import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// "Verified expert" badge shown next to names on profiles and answers.
// On-brand crimson (an expert marker), not a generic social-blue tick.
export default function VerifiedBadge({ label, compact }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <Text style={styles.check}>✓</Text>
      {!compact && <Text style={styles.text}>{label || 'Verified Expert'}</Text>}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.verifiedTint,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, gap: 3,
  },
  compact: { paddingHorizontal: 5, paddingVertical: 3 },
  check: { color: colors.verified, fontWeight: '900', fontSize: 10 },
  text: { color: colors.verified, fontWeight: '700', fontSize: 11, letterSpacing: 0.2 },
});
