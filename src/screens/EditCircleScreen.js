import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import KeyboardScreen from '../components/KeyboardScreen';
import Button from '../components/Button';
import CircleChip from '../components/CircleChip';
import { Field, Input, CharCount } from '../components/ui';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import { useToast } from '../components/Toast';
import AccentSwatch from '../components/AccentSwatch';
import {
  CIRCLE_ACCENT_PRESETS, findSimilarCircles, isCircleNameTaken,
} from '../data/circles';

const NAME_MIN = 3;
const NAME_MAX = 50;
const DESC_MIN = 20;
const DESC_MAX = 200;

export default function EditCircleScreen({ navigation, route }) {
  const circleId = route.params?.circleId;
  const { dispatch } = useData();
  const { state, circleById, isCircleCreator } = useSelectors();
  const { goBack } = useNavigationGuard(navigation);
  const showToast = useToast();
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const circle = circleById(circleId);
  const canEdit = isCircleCreator(circleId);

  const [name, setName] = useState(circle?.name || '');
  const [description, setDescription] = useState(circle?.description || '');
  const [accentId, setAccentId] = useState(circle?.accentId || CIRCLE_ACCENT_PRESETS[0].id);
  const [touched, setTouched] = useState(false);

  const similar = useMemo(
    () => findSimilarCircles(name, state.circles.filter((c) => c.id !== circleId)),
    [name, state.circles, circleId],
  );
  const duplicate = isCircleNameTaken(name, state.circles, circleId);
  const nameOk = name.trim().length >= NAME_MIN && name.trim().length <= NAME_MAX && !duplicate;
  const descOk = description.trim().length >= DESC_MIN && description.trim().length <= DESC_MAX;
  const valid = nameOk && descOk;

  if (!circle || !canEdit) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>You can only edit circles you created.</Text>
      </View>
    );
  }

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    dispatch({
      type: 'UPDATE_CIRCLE',
      circleId,
      name: name.trim(),
      description: description.trim(),
      accentId,
    });
    showToast('Circle updated', { tone: 'success' });
    goBack();
  };

  return (
    <KeyboardScreen
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Save changes" onPress={submit} disabled={touched && !valid} />
        </View>
      )}
    >
      <Field
        label="Circle name"
        error={touched && duplicate ? 'A circle with this name already exists.' : touched && !nameOk ? `Use ${NAME_MIN}–${NAME_MAX} characters.` : null}
      >
        <Input placeholder="Circle name" value={name} onChangeText={setName} maxLength={NAME_MAX + 10} />
      </Field>

      {similar.length > 0 && name.trim().length >= 2 && (
        <View style={styles.similarBox}>
          <Text style={styles.similarTitle}>Similar circles exist</Text>
          {similar.map((c) => (
            <CircleChip key={c.id} circle={c} compact showOfficial />
          ))}
        </View>
      )}

      <Field
        label="Description"
        error={touched && !descOk ? `Describe your circle in ${DESC_MIN}–${DESC_MAX} characters.` : null}
      >
        <Input placeholder="What is this circle for?" value={description} onChangeText={setDescription} multiline maxLength={DESC_MAX + 20} />
        <CharCount value={description} min={DESC_MIN} max={DESC_MAX} />
      </Field>

      <Field label="Accent color">
        <View style={styles.swatchRow}>
          {CIRCLE_ACCENT_PRESETS.map((a) => (
            <AccentSwatch
              key={a.id}
              accentId={a.id}
              selected={accentId === a.id}
              onPress={() => setAccentId(a.id)}
            />
          ))}
        </View>
      </Field>
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { padding: spacing.lg },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  missingText: { color: colors.textMuted, textAlign: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  similarBox: { backgroundColor: colors.secondaryTint, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.expertMarkerBorder },
  similarTitle: { fontWeight: '800', color: colors.secondaryDark, fontSize: font.small, marginBottom: spacing.sm },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.text, transform: [{ scale: 1.08 }] },
});
