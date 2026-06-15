import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Image } from 'react-native';
import Button from '../components/Button';
import PhotoSourceSheet from '../components/PhotoSourceSheet';
import KeyboardScreen from '../components/KeyboardScreen';
import { Field, Input, Chip } from '../components/ui';
import { useData } from '../data/store';
import { CATEGORIES } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import { useNetwork } from '../data/network';
import { useImagePicker } from '../hooks/useImagePicker';
import { isSupabaseConfigured } from '../lib/supabase';
import { uploadExpertCredential } from '../services/mediaStorage';
import { isLocalPhotoUri, photoUrl, displayPhotoUrl } from '../utils/photos';

export default function VerifiedApplicationScreen({ navigation }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const { dispatch } = useData();
  const { online } = useNetwork();
  const { pickFromLibrary } = useImagePicker();
  const [category, setCategory] = useState(null);
  const [custom, setCustom] = useState('');
  const [credential, setCredential] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const useCustom = category === 'custom';
  const valid = (category && !useCustom) || (useCustom && custom.trim().length >= 2);

  const pickCredential = async () => {
    const picked = await pickFromLibrary();
    if (!picked?.uri) return;
    setCredential({
      uri: picked.uri,
      base64: picked.base64,
      mimeType: picked.mimeType,
      width: picked.width,
      height: picked.height,
      name: 'Credential photo',
    });
  };

  const submit = async () => {
    if (!valid || submitting) return;
    if (!online) {
      Alert.alert('No connection', 'Reconnect to submit your application.');
      return;
    }

    setSubmitting(true);
    try {
      let credentialUrl = credential?.url || null;
      let credentialName = credential?.name || null;

      if (credential?.uri && isLocalPhotoUri(credential.uri)) {
        if (!isSupabaseConfigured()) {
          throw new Error('Credential upload requires Supabase — check your .env.');
        }
        credentialUrl = await uploadExpertCredential({
          uri: credential.uri,
          base64: credential.base64,
          mimeType: credential.mimeType,
          width: credential.width,
          height: credential.height,
        });
        credentialName = 'Credential photo';
      }

      const finalCategory = useCustom ? 'others' : category;
      dispatch({
        type: 'SUBMIT_EXPERT_APPLICATION',
        category: finalCategory,
        customCategory: useCustom ? custom.trim() : null,
        credentialName,
        credentialUrl,
        status: 'approved',
      });
      Alert.alert('You are verified! ✓', 'Your expert badge is now active. Remember: posts are capped at 2/day and promotional language is not allowed.', [
        { text: 'Great', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Could not submit', e?.message || 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const previewUri = displayPhotoUrl(credential, { allowLocal: true });

  return (
    <>
      <KeyboardScreen
        safe={false}
        contentStyle={styles.body}
        footer={(
          <View style={styles.footer}>
            <Button title={submitting ? 'Submitting…' : 'Submit application'} onPress={submit} disabled={!valid || submitting} />
          </View>
        )}
      >
        <Text style={styles.lead}>Verified experts help the community with credible answers and get a badge on their profile and answers.</Text>

        <Field label="What is your area of expertise?">
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} label={`${c.icon} ${c.name}`} active={category === c.id} onPress={() => setCategory(c.id)} />
            ))}
            <Chip label="✏️ Custom…" active={useCustom} onPress={() => setCategory('custom')} />
          </View>
        </Field>

        {useCustom ? (
          <Field label="Your profession">
            <Input placeholder="e.g. Registered Nurse, Lawyer…" value={custom} onChangeText={setCustom} autoFocus />
          </Field>
        ) : null}

        <Field label="Credentials" hint="Upload proof of registration/qualification (e.g. MARA number, CPA, AHPRA).">
          <Pressable style={styles.upload} onPress={() => setPickerOpen(true)}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
            ) : null}
            <Text style={styles.uploadText}>
              {credential ? `✓ ${credential.name}` : '📎  Upload credential photo'}
            </Text>
          </Pressable>
        </Field>

        <View style={styles.note}>
          <Text style={styles.noteText}>Demo note: real apps go to admin review. This prototype auto-approves on submit.</Text>
        </View>
      </KeyboardScreen>

      <PhotoSourceSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add credential photo"
        showRemove={!!credential}
        onLibrary={pickCredential}
        onRemove={() => setCredential(null)}
      />
    </>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  lead: { fontSize: font.body, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  upload: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: 120, borderRadius: radius.sm, marginBottom: spacing.sm },
  uploadText: { color: colors.primary, fontWeight: '700' },
  note: { backgroundColor: colors.secondaryTint, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  noteText: { color: colors.secondaryDark, fontSize: font.tiny, lineHeight: 17 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
