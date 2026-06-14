import React, { useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { normalizePhotoUrls } from '../utils/photos';

/** Fixed square size for question card feed thumbnails (72–96px range). */
export const QUESTION_CARD_THUMB_SIZE = 84;

/** Decorative first-photo thumbnail for question cards — not a separate tap target. */
export default function QuestionCardPhotoThumb({ photos, size = QUESTION_CARD_THUMB_SIZE }) {
  const { colors, radius, font } = useTheme();
  const urls = normalizePhotoUrls(photos);
  const uri = urls[0];
  const extra = urls.length - 1;
  const [loaded, setLoaded] = useState(false);
  const styles = useMemo(
    () => createStyles(colors, radius, font, size),
    [colors, radius, font, size],
  );

  if (!uri) return null;

  return (
    <View style={styles.wrap} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.placeholder}>
        {!loaded ? <ActivityIndicator size="small" color={colors.textFaint} /> : null}
      </View>
      <Image
        source={{ uri }}
        style={[styles.image, loaded && styles.imageLoaded]}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
      {extra > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors, radius, font, size) => StyleSheet.create({
  wrap: {
    width: size,
    height: size,
    borderRadius: radius.md,
    overflow: 'hidden',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSunken,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSunken,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: size,
    height: size,
    opacity: 0,
  },
  imageLoaded: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    minWidth: 22,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.overlay,
    alignItems: 'center',
  },
  badgeText: {
    color: colors.onDark,
    fontSize: font.tiny,
    fontWeight: '800',
  },
});
