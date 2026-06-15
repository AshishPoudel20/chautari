import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { displayPhotoUrl } from '../utils/photos';

/** Single-image picker with preview, upload state, and remove. */
export default function SinglePhotoPicker({
  photo,
  onPick,
  onRemove,
  onRetry,
  label = 'Add image',
  aspectRatio = 16 / 9,
  uploading = false,
}) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, aspectRatio),
    [colors, spacing, font, radius, aspectRatio],
  );
  const src = displayPhotoUrl(photo, { allowLocal: true });

  if (!src) {
    return (
      <Pressable style={styles.empty} onPress={onPick}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyLabel}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.preview} onPress={photo?.error && onRetry ? onRetry : onPick}>
        <Image source={{ uri: src }} style={styles.image} resizeMode="cover" />
        {uploading || photo?.uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.onPrimary} />
            <Text style={styles.uploadingText}>Uploading…</Text>
          </View>
        ) : null}
        {photo?.error ? (
          <View style={[styles.overlay, styles.errorOverlay]}>
            <Text style={styles.errorText}>Upload failed — tap to retry</Text>
          </View>
        ) : null}
      </Pressable>
      {!uploading && !photo?.uploading ? (
        <View style={styles.actions}>
          <Pressable onPress={onPick} style={styles.actionBtn}>
            <Text style={styles.actionText}>Change</Text>
          </Pressable>
          <Pressable onPress={onRemove} style={styles.actionBtn}>
            <Text style={[styles.actionText, { color: colors.danger }]}>Remove</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, aspectRatio) => StyleSheet.create({
  empty: {
    aspectRatio,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSunken,
    padding: spacing.lg,
  },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyLabel: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
  wrap: { gap: spacing.sm },
  preview: {
    aspectRatio,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.bgSunken,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  uploadingText: { color: colors.onPrimary, fontWeight: '700', fontSize: font.caption },
  errorOverlay: { backgroundColor: 'rgba(180,40,40,0.8)' },
  errorText: { color: colors.onPrimary, fontWeight: '800', fontSize: font.caption, textAlign: 'center', paddingHorizontal: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  actionText: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
});
