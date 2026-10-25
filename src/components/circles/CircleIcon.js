import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { circleIconPresentation } from '../../data/circles';
import { displayPhotoUrl } from '../../utils/photos';

const SIZES = {
  chip: { box: 22, font: 11, radius: 6 },
  sm: { box: 36, font: 18, radius: 10 },
  md: { box: 44, font: 22, radius: 12 },
  lg: { box: 52, font: 28, radius: 14 },
};

export default function CircleIcon({ circle, size = 'md', style }) {
  const { isDark, colors, radius } = useTheme();
  const pres = useMemo(
    () => circleIconPresentation(circle, isDark, colors),
    [circle, isDark, colors],
  );
  const dim = SIZES[size] || SIZES.md;
  const styles = useMemo(
    () => createStyles(dim, radius),
    [dim, radius],
  );
  const imageSrc = displayPhotoUrl(circle?.imageUrl);

  if (!circle?.icon && !imageSrc) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: imageSrc ? colors.bgSunken : pres.backgroundColor,
          borderColor: pres.borderColor,
          borderWidth: pres.borderWidth,
        },
        style,
      ]}
    >
      {imageSrc ? (
        <Image source={{ uri: imageSrc }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={styles.glyph}>{circle.icon}</Text>
      )}
    </View>
  );
}

const createStyles = (dim, radius) => StyleSheet.create({
  wrap: {
    width: dim.box,
    height: dim.box,
    borderRadius: dim.radius ?? radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glyph: { fontSize: dim.font, lineHeight: dim.font + 2 },
  image: { width: '100%', height: '100%' },
});
