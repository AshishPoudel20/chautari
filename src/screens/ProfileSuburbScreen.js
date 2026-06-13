import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import KeyboardScreen from '../components/KeyboardScreen';
import PhotoSourceSheet from '../components/PhotoSourceSheet';
import { Chip } from '../components/ui';
import { useData } from '../data/store';
import { SUBURBS } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { completeOnboarding } from '../services/profile';
import { useImagePicker } from '../hooks/useImagePicker';
import { uploadAvatar } from '../services/mediaStorage';
import { photoUrl } from '../utils/photos';

// Profile setup step 2 — suburb + photo, both optional and skippable.
// This is the final onboarding step, so we create the account here.
export default function ProfileSuburbScreen({ navigation, route }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const { dispatch, state } = useData();
  const { pickFromLibrary, takePhoto } = useImagePicker();
  const name = route.params?.name || 'You';
  const [suburb, setSuburb] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [picker, setPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newcomer, setNewcomer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const resolvePhotoUrl = async () => {
    if (!photo) return null;
    const existing = photoUrl(photo);
    if (existing && !existing.startsWith('file:')) return existing;
    if (photo?.uri) {
      if (!isSupabaseConfigured()) return null;
      setUploading(true);
      try {
        return await uploadAvatar({ uri: photo.uri });
      } finally {
        setUploading(false);
      }
    }
    return existing;
  };

  const finish = async () => {
    if (saving || uploading) return;
    setSaving(true);
    setError('');
    try {
      const photoUrlValue = await resolvePhotoUrl();
      let authUserId = state.authUserId;
      if (isSupabaseConfigured()) {
        authUserId = await completeOnboarding({
          name,
          suburb,
          photo: photoUrlValue,
          newcomer,
          phone: route.params?.phoneE164 || route.params?.phone,
        });
        if (authUserId) dispatch({ type: 'SET_AUTH', userId: authUserId });
      }
      dispatch({ type: 'SIGN_UP', name, newcomer, authUserId });
      if (suburb || photoUrlValue) dispatch({ type: 'UPDATE_PROFILE', patch: { suburb, photo: photoUrlValue } });
    } catch (e) {
      setError(e?.message || 'Could not save profile. Try again.');
      setSaving(false);
    }
  };

  const pickPhoto = async (pickerFn) => {
    const picked = await pickerFn();
    if (picked) setPhoto({ uri: picked.uri });
  };

  return (
    <>
    <KeyboardScreen
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <View style={styles.newcomerRow}>
            <View style={styles.newcomerCopy}>
              <Text style={styles.newcomerLabel}>I'm new to Australia</Text>
              <Text style={styles.newcomerHint}>Select to unlock features made for newcomers.</Text>
            </View>
            <Switch
              value={newcomer}
              onValueChange={setNewcomer}
              trackColor={{ true: colors.primary, false: colors.borderStrong }}
              thumbColor={colors.onPrimary}
            />
          </View>
          {error ? <Text style={styles.err}>{error}</Text> : null}
          <Button title={saving ? 'Saving…' : uploading ? 'Uploading photo…' : 'Finish'} onPress={finish} disabled={saving || uploading} />
          <Button title="Skip for now" variant="ghost" onPress={finish} disabled={saving || uploading} style={{ marginTop: 4 }} />
        </View>
      )}
    >
      <Text style={styles.title}>Add a few details</Text>
      <Text style={styles.sub}>Both are optional — you can skip and add them later.</Text>

      <View style={styles.photoBlock}>
        <Avatar name={name} photo={photoUrl(photo) || photo?.uri} size={88} />
        <Pressable onPress={() => setPicker(true)} style={styles.photoBtn} disabled={uploading}>
          <Text style={styles.photoBtnText}>{uploading ? 'Uploading…' : '📷  Add photo'}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Your suburb (Greater Melbourne)</Text>
      <View style={styles.chips}>
        {SUBURBS.map((s) => (
          <Chip key={s} label={s} active={suburb === s} onPress={() => setSuburb(suburb === s ? null : s)} />
        ))}
      </View>
    </KeyboardScreen>

      <PhotoSourceSheet
        visible={picker}
        onClose={() => setPicker(false)}
        title="Add profile photo"
        showRemove={!!photo}
        onCamera={() => pickPhoto(takePhoto)}
        onLibrary={() => pickPhoto(pickFromLibrary)}
        onRemove={() => setPhoto(null)}
      />
    </>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  sub: { fontSize: font.body, color: colors.textMuted, marginBottom: spacing.xl },
  photoBlock: { alignItems: 'center', marginBottom: spacing.xl },
  photoBtn: { marginTop: spacing.md, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.primaryLight },
  photoBtnText: { color: colors.primaryDark, fontWeight: '700' },
  label: { fontSize: font.small, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  newcomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bgSunken,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newcomerCopy: { flex: 1 },
  newcomerLabel: { fontSize: font.caption, fontWeight: '800', color: colors.text },
  newcomerHint: { fontSize: font.tiny, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  err: { color: colors.danger, fontSize: font.small, fontWeight: '600', marginBottom: spacing.sm, textAlign: 'center' },
});
