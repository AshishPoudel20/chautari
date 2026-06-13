import React, { useMemo,  useState  } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Avatar from '../components/Avatar';
import KeyboardScreen from '../components/KeyboardScreen';
import Button from '../components/Button';
import { Field, Input, Chip } from '../components/ui';
import { useToast } from '../components/Toast';
import { useData, useSelectors } from '../data/store';
import { SUBURBS } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { updateProfile } from '../services/profile';

// Edit Profile: name, photo (mock source picker), suburb, bio — all against mock
// data, reflected immediately on save.
export default function EditProfileScreen({ navigation }) {
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
  const [picker, setPicker] = useState(false);

  const valid = name.trim().length >= 2;

  const save = async () => {
    if (!valid) return;
    const patch = { name: name.trim(), suburb, bio: bio.trim(), photo };
    try {
      if (isSupabaseConfigured()) await updateProfile(patch);
      dispatch({ type: 'UPDATE_PROFILE', patch });
      showToast('Profile updated', { tone: 'success' });
      navigation.goBack();
    } catch (e) {
      showToast(e?.message || 'Could not save profile', { tone: 'error' });
    }
  };

  const mockedSource = (label) => {
    setPicker(false);
    showToast(`${label} isn’t available in the prototype — using your letter avatar`);
  };

  const removePhoto = () => {
    setPicker(false);
    setPhoto(null);
    showToast('Photo removed');
  };

  return (
    <View style={styles.container}>
      <KeyboardScreen
        safe={false}
        contentStyle={styles.body}
        footer={(
          <View style={styles.footer}>
            <Button title="Save changes" onPress={save} disabled={!valid} />
          </View>
        )}
      >
        <View style={styles.photoBlock}>
          <Avatar name={name} photo={photo} size={88} />
          <Pressable onPress={() => setPicker(true)} style={styles.photoBtn}>
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

      {/* Photo source picker */}
      <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setPicker(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Change profile photo</Text>
            <Pressable style={styles.sheetRow} onPress={() => mockedSource('Camera')}>
              <Text style={styles.sheetIcon}>📸</Text><Text style={styles.sheetLabel}>Take a photo</Text>
            </Pressable>
            <Pressable style={styles.sheetRow} onPress={() => mockedSource('Photo library')}>
              <Text style={styles.sheetIcon}>🖼</Text><Text style={styles.sheetLabel}>Choose from library</Text>
            </Pressable>
            {photo ? (
              <Pressable style={styles.sheetRow} onPress={removePhoto}>
                <Text style={styles.sheetIcon}>🗑️</Text><Text style={[styles.sheetLabel, { color: colors.danger }]}>Remove current photo</Text>
              </Pressable>
            ) : null}
            <Pressable style={[styles.sheetRow, styles.sheetCancel]} onPress={() => setPicker(false)}>
              <Text style={[styles.sheetLabel, { fontWeight: '800', textAlign: 'center', width: '100%' }]}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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

  sheetBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl, ...shadow.raised },
  sheetTitle: { fontSize: font.body, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  sheetIcon: { fontSize: 20, width: 26, textAlign: 'center' },
  sheetLabel: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  sheetCancel: { marginTop: spacing.sm, backgroundColor: colors.bgSunken, borderRadius: radius.md, borderTopWidth: 0, justifyContent: 'center' },
});
