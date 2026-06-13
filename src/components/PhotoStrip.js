import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { photoUrl } from '../utils/photos';

/**
 * Photo picker strip — local preview, upload spinner, remove, add tile.
 * Each item: { id, uri?, url?, uploading?, error? }
 */
export default function PhotoStrip({
  photos = [],
  maxCount = 5,
  onAdd,
  onRemove,
  onRetry,
  tileSize = 68,
  addLabel = '＋',
}) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, tileSize),
    [colors, spacing, font, radius, tileSize],
  );

  return (
    <View style={styles.row}>
      {photos.map((p) => {
        const src = photoUrl(p) || p.uri;
        return (
          <View key={p.id} style={styles.tileWrap}>
            <Pressable
              style={styles.tile}
              onPress={() => (p.error && onRetry ? onRetry(p.id) : onRemove?.(p.id))}
              accessibilityLabel={p.error ? 'Retry photo upload' : 'Remove photo'}
            >
              {src ? (
                <Image source={{ uri: src }} style={styles.image} resizeMode="cover" />
              ) : (
                <Text style={styles.placeholder}>🖼</Text>
              )}
              {p.uploading ? (
                <View style={styles.overlay}>
                  <ActivityIndicator color={colors.onPrimary} />
                </View>
              ) : null}
              {p.error ? (
                <View style={[styles.overlay, styles.errorOverlay]}>
                  <Text style={styles.errorText}>Tap to retry</Text>
                </View>
              ) : null}
            </Pressable>
            {!p.uploading ? (
              <Pressable style={styles.remove} onPress={() => onRemove?.(p.id)} hitSlop={6}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
      {photos.length < maxCount ? (
        <Pressable style={[styles.tile, styles.add]} onPress={onAdd} accessibilityLabel="Add photo">
          <Text style={styles.addText}>{addLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, tileSize) => StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tileWrap: { position: 'relative' },
  tile: {
    width: tileSize,
    height: tileSize,
    borderRadius: radius.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { fontSize: 26 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: { backgroundColor: 'rgba(180,40,40,0.75)' },
  errorText: { color: colors.onPrimary, fontSize: font.tiny, fontWeight: '800', textAlign: 'center', paddingHorizontal: 4 },
  remove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: colors.onPrimary, fontWeight: '900', fontSize: 11 },
  add: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', backgroundColor: 'transparent' },
  addText: { fontSize: 28, color: colors.primary },
});
