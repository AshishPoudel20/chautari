import React, { useMemo } from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { displayPhotoUrl } from '../../utils/photos';

export default function ContentPhoto({ photo, onPress, size = 72 }) {
  const { colors, radius } = useTheme();
  const uri = displayPhotoUrl(photo, { allowLocal: true });
  const styles = useMemo(() => createStyles(colors, radius, size), [colors, radius, size]);
  if (!uri) return null;

  const inner = <Image source={{ uri }} style={styles.image} resizeMode="cover" />;

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.tile} accessibilityRole="imagebutton">
        {inner}
      </Pressable>
    );
  }
  return <Pressable style={styles.tile} disabled>{inner}</Pressable>;
}

const createStyles = (colors, radius, size) => StyleSheet.create({
  tile: {
    width: size,
    height: size,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bgSunken,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: '100%' },
});
