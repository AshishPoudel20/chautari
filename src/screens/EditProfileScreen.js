import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Avatar from '../components/Avatar';
import KeyboardScreen from '../components/KeyboardScreen';
import Button from '../components/Button';
import PhotoSourceSheet from '../components/PhotoSourceSheet';
import { Field, Input, Chip } from '../components/ui';
import { useToast } from '../components/Toast';
import { useData, useSelectors } from '../data/store';
import { SUBURBS } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { updateProfile } from '../services/profile';
import { useImagePicker } from '../hooks/useImagePicker';
import { uploadAvatar } from '../services/mediaStorage';
import { isLocalPhotoUri, photoUrl } from '../utils/photos';

export default function EditProfileScreen({ navigation }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const { dispatch } = useData();
  const { me } = useSelectors();
  const showToast = useToast();
  const { pickFromLibrary, takePhoto } = useImagePicker();
  const user = me();
  const [name, setName] = useState(user?.name || '');
  const [suburb, setSuburb] = useState(user?.suburb || null);
  const [bio, setBio] = useState(user?.bio || '');
  const [photo, setPhoto] = useState(user?.photo || null);
  const [picker, setPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const valid = name.trim().length >= 2;
  const displayPhoto = photoUrl(photo) || (typeof photo === 'object' ? photo?.uri : photo);

  const resolvePhotoUrl = async () => {
    if (!photo) return null;
    const existing = photoUrl(photo);
    if (existing && !isLocalPhotoUri(existing)) return existing;
    if (photo?.uri && isLocalPhotoUri(photo.uri)) {
      if (!isSupabaseConfigured()) throw new Error('Photo upload requires Supabase — check your .env.');
      setUploading(true);
      try {
        const url = await uploadAvatar({ uri: photo.uri });
        setPhoto(url);
        return url;
      } finally {
        setUploading(false);
      }
    }
    return existing;
  };

  const save = async () => {
    if (!valid || saving || uploading) return;
    setSaving(true);
    try {
      const photoUrlValue = await resolvePhotoUrl();
      const patch = { name: name.trim(), suburb, bio: bio.trim(), photo: photoUrlValue };
      if (isSupabaseConfigured()) await updateProfile(patch);
      dispatch({ type: 'UPDATE_PROFILE', patch });
      showToast('Profile updated', { tone: 'success' });
      navigation.goBack();
    } catch (e) {
      showToast(e?.message || 'Could not save profile', { tone: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const pickPhoto = async (pickerFn) => {
    const picked = await pickerFn();
    if (picked) setPhoto({ uri: picked.uri });
  };

  return (
    <View style={styles.container}>
      <KeyboardScreen
        safe={false}
        contentStyle={styles.body}
        footer={(
          <View style={styles.footer}>
            <Button title={saving ? 'Saving…' : uploading ? 'Uploading photo…' : 'Save changes'} onPress={save} disabled={!valid || saving || uploading} />
          </View>
        )}
      >
        <View style={styles.photoBlock}>
          <Avatar name={name} photo={displayPhoto} size={88} />
          <Pressable onPress={() => setPicker(true)} style={styles.photoBtn} disabled={uploading}>
            <Text style={styles.photoBtnText}>{uploading ? 'Uploading…' : '📷  Change photo'}</Text>
          </Pressable>
        </View>

        <Field label="Name">
          <Input value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your name" />
        </Field>
        <Field label="Bio (optional)">
          <Input value={bio} onChangeText={setBio} multiline placeholder="Tell the community a little about yourself" />
        </Field>
        <Field label="Suburb (optional)">
          <View style={styles.chips}>
            {SUBURBS.map((s) => (
              <Chip key={s} label={s} active={suburb === s} onPress={() => setSuburb(suburb === s ? null : s)} />
            ))}
          </View>
        </Field>
      </KeyboardScreen>

      <PhotoSourceSheet
        visible={picker}
        onClose={() => setPicker(false)}
        title="Change profile photo"
        showRemove={!!photo}
        onCamera={() => pickPhoto(takePhoto)}
        onLibrary={() => pickPhoto(pickFromLibrary)}
        onRemove={() => { setPhoto(null); showToast('Photo removed'); }}
      />
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg },
  photoBlock: { alignItems: 'center', marginBottom: spacing.lg },
  photoBtn: { marginTop: spacing.md, paddingVertical: 9, paddingHorizontal: 18, borderRadius: radius.pill, backgroundColor: colors.primaryTint },
  photoBtnText: { color: colors.primary, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
