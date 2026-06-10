import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import KeyboardScreen from '../components/KeyboardScreen';
import Button from '../components/Button';
import { Field, Input, CharCount } from '../components/ui';
import CircleChip from '../components/CircleChip';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import {
  CIRCLE_ACCENT_PRESETS, CIRCLE_ICON_PRESETS, findSimilarCircles, isCircleNameTaken,
} from '../data/circles';

const NAME_MIN = 3;
const NAME_MAX = 50;
const DESC_MIN = 20;
const DESC_MAX = 200;

export default function CreateCircleScreen({ navigation }) {
  const { dispatch } = useData();
  const { state } = useSelectors();
  const { replace } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accentId, setAccentId] = useState(CIRCLE_ACCENT_PRESETS[0].id);
  const [icon, setIcon] = useState(CIRCLE_ICON_PRESETS[0]);
  const [touched, setTouched] = useState(false);

  const similar = useMemo(
    () => findSimilarCircles(name, state.circles),
    [name, state.circles],
  );
  const duplicate = isCircleNameTaken(name, state.circles);
  const nameOk = name.trim().length >= NAME_MIN && name.trim().length <= NAME_MAX && !duplicate;
  const descOk = description.trim().length >= DESC_MIN && description.trim().length <= DESC_MAX;
  const valid = nameOk && descOk;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    const newId = `c_${Date.now().toString(36)}`;
    dispatch({
      type: 'CREATE_CIRCLE',
      id: newId,
      name: name.trim(),
      description: description.trim(),
      accentId,
      icon,
    });
    replace('CircleDetail', { circleId: newId });
  };

  return (
    <KeyboardScreen
      contentStyle={styles.body}
      footer={(
        <View style={styles.footer}>
          <Button title="Create circle" onPress={submit} disabled={touched && !valid} />
        </View>
      )}
    >
      <Text style={styles.note}>
        To keep Chautari healthy, new circles need an active member to maintain them.
      </Text>

      <Field
        label="Circle name"
        error={touched && duplicate ? 'A circle with this name already exists.' : touched && !nameOk ? `Use ${NAME_MIN}–${NAME_MAX} characters.` : null}
      >
        <Input placeholder="e.g. Footscray Nepali Community" value={name} onChangeText={setName} maxLength={NAME_MAX + 10} />
      </Field>

      {similar.length > 0 && name.trim().length >= 2 && (
        <View style={styles.similarBox}>
          <Text style={styles.similarTitle}>Similar circles exist</Text>
          {similar.map((c) => (
            <View key={c.id} style={styles.similarRow}>
              <CircleChip circle={c} compact showOfficial />
              <Pressable
                onPress={() => {
                  dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId: c.id });
                  navigation.navigate('CircleDetail', { circleId: c.id });
                }}
                style={styles.similarJoin}
              >
                <Text style={styles.similarJoinText}>Join instead</Text>
              </Pressable>
            </View>
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
            <Pressable
              key={a.id}
              onPress={() => setAccentId(a.id)}
              style={[styles.swatch, { backgroundColor: a.color }, accentId === a.id && styles.swatchActive]}
            />
          ))}
        </View>
      </Field>

      <Field label="Icon">
        <View style={styles.iconRow}>
          {CIRCLE_ICON_PRESETS.map((ic) => (
            <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconBtn, icon === ic && styles.iconBtnActive]}>
              <Text style={styles.iconEmoji}>{ic}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
    </KeyboardScreen>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  body: { padding: spacing.lg },
  note: { fontSize: font.caption, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg, fontStyle: 'italic' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  similarBox: { backgroundColor: colors.secondaryTint, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.expertMarkerBorder },
  similarTitle: { fontWeight: '800', color: colors.secondaryDark, fontSize: font.small, marginBottom: spacing.sm },
  similarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  similarJoin: { paddingHorizontal: 10, paddingVertical: 6 },
  similarJoinText: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.text, transform: [{ scale: 1.08 }] },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconBtn: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSunken, borderWidth: 1, borderColor: colors.border },
  iconBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  iconEmoji: { fontSize: 22 },
});
