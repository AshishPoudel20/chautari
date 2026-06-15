import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { displayPhotoUrl } from '../utils/photos';

// First-letter avatar fallback when there's no photo (per brief).
// `anon` renders a neutral placeholder.
export default function Avatar({ name, photo, anon, size = 44, allowLocalPhoto = true }) {
  const { colors, colorForString } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dim = { width: size, height: size, borderRadius: size / 2 };
  const src = displayPhotoUrl(photo, { allowLocal: allowLocalPhoto });
  if (anon) {
    return (
      <View style={[styles.base, dim, { backgroundColor: colors.avatarPlaceholder }]}>
        <Text style={[styles.letter, { fontSize: size * 0.5 }]}>?</Text>
      </View>
    );
  }
  if (src) {
    return <Image key={src} source={{ uri: src }} style={[styles.base, dim]} />;
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
