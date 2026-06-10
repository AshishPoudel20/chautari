import React, { useMemo,  useState  } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import KeyboardScreen from '../components/KeyboardScreen';
import { Chip } from '../components/ui';
import { useData } from '../data/store';
import { SUBURBS } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';

// Profile setup step 2 — suburb + photo, both optional and skippable.
// This is the final onboarding step, so we create the account here.
export default function ProfileSuburbScreen({ navigation, route }) {
  const { colors, spacing, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font), [colors, spacing, font]);

  const { dispatch } = useData();
  const name = route.params?.name || 'You';
  const [suburb, setSuburb] = useState(null);
  const [photo, setPhoto] = useState(null);

  const finish = () => {
    dispatch({ type: 'SIGN_UP', name });
    if (suburb || photo) dispatch({ type: 'UPDATE_PROFILE', patch: { suburb, photo } });
    // Navigator now swaps to the signed-in stack automatically.
  };

  const mockPhoto = () => {
    // Image picking is mocked in the prototype (no expo-image-picker wired up).
    Alert.alert('Photo upload (mocked)', 'In this prototype, photo upload is simulated. Your letter avatar will be used.', [
      { text: 'OK' },
    ]);
  };

  return (
    <KeyboardScreen
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Finish" onPress={finish} />
          <Button title="Skip for now" variant="ghost" onPress={finish} style={{ marginTop: 4 }} />
        </View>
      )}
    >
      <Text style={styles.title}>Add a few details</Text>
      <Text style={styles.sub}>Both are optional — you can skip and add them later.</Text>

      <View style={styles.photoBlock}>
        <Avatar name={name} photo={photo} size={88} />
        <Pressable onPress={mockPhoto} style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>📷  Add photo</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Your suburb (Greater Melbourne)</Text>
      <View style={styles.chips}>
        {SUBURBS.map((s) => (
          <Chip key={s} label={s} active={suburb === s} onPress={() => setSuburb(suburb === s ? null : s)} />
        ))}
      </View>
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font) => StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  sub: { fontSize: font.body, color: colors.textMuted, marginBottom: spacing.xl },
  photoBlock: { alignItems: 'center', marginBottom: spacing.xl },
  photoBtn: { marginTop: spacing.md, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.primaryLight },
  photoBtnText: { color: colors.primaryDark, fontWeight: '700' },
  label: { fontSize: font.small, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
});
