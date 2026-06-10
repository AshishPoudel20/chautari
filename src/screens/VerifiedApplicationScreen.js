import React, { useMemo,  useState  } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Button from '../components/Button';
import KeyboardScreen from '../components/KeyboardScreen';
import { Field, Input, Chip } from '../components/ui';
import { useData } from '../data/store';
import { CATEGORIES } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';

// Verified Expert Application: pick category (or custom), upload credentials (mock), submit.
// Review is mocked: we auto-approve in the prototype.
export default function VerifiedApplicationScreen({ navigation }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const { dispatch } = useData();
  const [category, setCategory] = useState(null);
  const [custom, setCustom] = useState('');
  const [credential, setCredential] = useState(null);

  const useCustom = category === 'custom';
  const valid = (category && !useCustom) || (useCustom && custom.trim().length >= 2);

  const uploadCredential = () => {
    // Credential upload is mocked (no file picker wired up in the prototype).
    setCredential({ name: 'credential_document.pdf' });
  };

  const submit = () => {
    if (!valid) return;
    const finalCategory = useCustom ? 'others' : category;
    // Mock admin review → auto-approve.
    dispatch({
      type: 'SUBMIT_EXPERT_APPLICATION',
      category: finalCategory,
      customCategory: useCustom ? custom.trim() : null,
      credentialName: credential?.name || null,
      status: 'approved',
    });
    Alert.alert('You are verified! ✓', 'Your expert badge is now active. Remember: posts are capped at 2/day and promotional language is not allowed.', [
      { text: 'Great', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardScreen
      safe={false}
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Submit application" onPress={submit} disabled={!valid} />
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

        {useCustom && (
          <Field label="Your profession">
            <Input placeholder="e.g. Registered Nurse, Lawyer…" value={custom} onChangeText={setCustom} autoFocus />
          </Field>
        )}

        <Field label="Credentials" hint="Upload proof of registration/qualification (e.g. MARA number, CPA, AHPRA).">
          <Pressable style={styles.upload} onPress={uploadCredential}>
            <Text style={styles.uploadText}>{credential ? `✓ ${credential.name}` : '📎  Upload credential (mocked)'}</Text>
          </Pressable>
        </Field>

        <View style={styles.note}>
          <Text style={styles.noteText}>Demo note: real apps go to admin review. This prototype auto-approves on submit.</Text>
        </View>
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
  lead: { fontSize: font.body, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  upload: { borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  uploadText: { color: colors.primary, fontWeight: '700' },
  note: { backgroundColor: colors.secondaryTint, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  noteText: { color: colors.secondaryDark, fontSize: font.tiny, lineHeight: 17 },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
