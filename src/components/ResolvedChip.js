import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ResolvedChip({ compact = false, style }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, compact), [colors, spacing, font, radius, compact]);

  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.label}>Resolved</Text>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, compact) => StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: compact ? 4 : 5,
    backgroundColor: colors.successTint,
    paddingHorizontal: compact ? 8 : 10,
    paddingVertical: compact ? 3 : 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.success,
  },
  icon: { color: colors.success, fontSize: compact ? 10 : 11, fontWeight: '900' },
  label: { color: colors.success, fontSize: compact ? font.tiny : font.caption, fontWeight: '800' },
});
