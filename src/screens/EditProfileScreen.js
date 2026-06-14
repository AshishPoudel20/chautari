import React, { useMemo, useState, useCallback } from 'react';
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
import { useProfilePhotoFlow } from '../hooks/useProfilePhotoFlow';
import { photoUrl } from '../utils/photos';

export default function EditProfileScreen({ navigation, route }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const { dispatch } = useData();
  const { me } = useSelectors();
  const showToast = useToast();
  const user = me();
  const [name, setName] = useState(user?.name || '');
  const [suburb, setSuburb] = useState(user?.suburb || null);
  const [bio, setBio] = useState(user?.bio || '');
  const [photo, setPhoto] = useState(user?.photo || null);
  const [saving, setSaving] = useState(false);

  const onPhotoConfirmed = useCallback((url) => setPhoto(url), []);
  const onPhotoRemoved = useCallback(() => {
    setPhoto(null);
    showToast('Photo removed');
  }, [showToast]);

  const {
    pickerOpen,
    setPickerOpen,
    pickPhoto,
    pickProfileFromLibrary,
    takeProfilePhoto,
    removePhoto,
  } = useProfilePhotoFlow(navigation, route, {
    displayName: name,
    onPhotoConfirmed,
    onPhotoRemoved,
  });

  const valid = name.trim().length >= 2;
  const displayPhoto = photoUrl(photo) || (typeof photo === 'object' ? photo?.uri : photo);

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const patch = { name: name.trim(), suburb, bio: bio.trim(), photo: photoUrl(photo) || null };
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

  return (
    <View style={styles.container}>
      <KeyboardScreen
        safe={false}
        contentStyle={styles.body}
        footer={(
          <View style={styles.footer}>
            <Button title={saving ? 'Saving…' : 'Save changes'} onPress={save} disabled={!valid || saving} />
          </View>
        )}
      >
        <View style={styles.photoBlock}>
          <Avatar name={name} photo={displayPhoto} size={88} />
          <Pressable onPress={() => setPickerOpen(true)} style={styles.photoBtn}>
            <Text style={styles.photoBtnText}>📷  Change photo</Text>
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
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Change profile photo"
        showRemove={!!photo}
        onCamera={() => pickPhoto(takeProfilePhoto)}
        onLibrary={() => pickPhoto(pickProfileFromLibrary)}
        onRemove={removePhoto}
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
