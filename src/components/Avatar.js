import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// First-letter avatar fallback when there's no photo (per brief).
// `anon` renders a neutral placeholder.
export default function Avatar({ name, photo, anon, size = 44 }) {
  const { colors, colorForString } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (anon) {
    return (
      <View style={[styles.base, dim, { backgroundColor: colors.avatarPlaceholder }]}>
        <Text style={[styles.letter, { fontSize: size * 0.5 }]}>?</Text>
      </View>
    );
  }
  if (photo) {
    return <Image source={{ uri: photo }} style={[styles.base, dim]} />;
  }
  const letter = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View style={[styles.base, dim, { backgroundColor: colorForString(name || '?') }]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  letter: { color: colors.onDark, fontWeight: '700' },
});
