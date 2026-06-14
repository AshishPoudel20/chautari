import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { useData } from '../data/store';
import { useTheme } from '../theme/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { updateProfile } from '../services/profile';
import { uploadAvatar } from '../services/mediaStorage';
import { PROFILE_AVATAR_SIZE } from '../constants/media';

export default function ProfilePhotoPreviewScreen({ navigation, route }) {
  const { localUri, displayName, returnScreen } = route.params || {};
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, shadow),
    [colors, spacing, font, radius, shadow],
  );
  const { dispatch } = useData();
  const showToast = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const returnWithParams = (params) => {
    // navigate() pops this modal when returnScreen is already in the stack — do NOT goBack() after.
    navigation.navigate({
      name: returnScreen,
      params,
      merge: true,
    });
  };

  const usePhoto = async () => {
    if (uploading || !localUri) return;
    setUploading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Photo upload requires Supabase — check your .env.');
      }

      const url = await uploadAvatar({ uri: localUri });

      if (returnScreen === 'EditProfile') {
        await updateProfile({ photo: url });
        dispatch({ type: 'UPDATE_PROFILE', patch: { photo: url } });
      }

      returnWithParams({ confirmedPhotoUrl: url });
      showToast('Profile photo updated', { tone: 'success' });
    } catch (e) {
      setError(e?.message || 'Could not upload photo. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const retake = () => {
    returnWithParams({ retakePhoto: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>HOW IT WILL LOOK</Text>
      <Text style={styles.subtitle}>Your profile photo appears as a circle across Chautari.</Text>

      <View style={styles.previewWrap}>
        <Avatar name={displayName || 'You'} photo={localUri} size={PROFILE_AVATAR_SIZE} />
      </View>

      {uploading ? (
        <View style={styles.uploadRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.uploadText}>Uploading photo…</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button
          title={uploading ? 'Uploading…' : 'Use photo'}
          onPress={usePhoto}
          disabled={uploading}
        />
        <Button
          title="Retake / Choose another"
          variant="secondary"
          onPress={retake}
          disabled={uploading}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textFaint,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: font.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  previewWrap: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  uploadText: { color: colors.textMuted, fontWeight: '600', fontSize: font.caption },
  error: {
    color: colors.danger,
    fontSize: font.caption,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actions: { width: '100%', maxWidth: 320 },
});
