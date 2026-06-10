import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { compactNumber } from '../utils/format';

// Subtle diyo/leaf karma indicator beside names.
export default function KarmaBadge({ karma, compact }) {
  const { colors, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, font), [colors, font]);
  if (karma == null || karma <= 0) return null;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.icon, compact && styles.iconCompact]}>🪔</Text>
      <Text style={[styles.text, compact && styles.textCompact]}>{compactNumber(karma)}</Text>
    </View>
  );
}

const createStyles = (colors, font) => StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  wrapCompact: { gap: 2 },
  icon: { fontSize: 12 },
  iconCompact: { fontSize: 10 },
  text: { fontSize: font.tiny, fontWeight: '800', color: colors.textMuted },
  textCompact: { fontSize: 10 },
});
