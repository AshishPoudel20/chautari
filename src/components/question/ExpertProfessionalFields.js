import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Field, Input } from '../common/ui';
import CircleChip from '../circles/CircleChip';
import { useTheme } from '../../theme/ThemeContext';
import { EXPERT_BADGE_TITLE_MAX, validateExpertBadgeTitle } from '../../utils/expertPost';

/** Badge title + single circle picker — shared by verification and legacy setup. */
export default function ExpertProfessionalFields({
  badgeTitle,
  onBadgeTitleChange,
  circleId,
  onCircleIdChange,
  circles,
  touched = false,
}) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius),
    [colors, spacing, font, radius],
  );
  const [circleQuery, setCircleQuery] = useState('');

  const titleError = touched ? validateExpertBadgeTitle(badgeTitle) : null;
  const circleError = touched && !circleId ? 'Pick the circle for your professional posts.' : null;

  const circleOptions = useMemo(() => {
    const q = circleQuery.trim().toLowerCase();
    if (!q) return circles;
    return circles.filter((c) => c.name.toLowerCase().includes(q));
  }, [circles, circleQuery]);

  return (
    <>
      <Field
        label="Badge title"
        hint="Shown on your professional posts and replies (e.g. Cardiologist, MARA Migration Agent)."
        error={titleError}
      >
        <Input
          placeholder="e.g. CPA Accountant, MARA Migration Agent…"
          value={badgeTitle}
          onChangeText={onBadgeTitleChange}
          maxLength={EXPERT_BADGE_TITLE_MAX + 10}
        />
      </Field>

      <Field label="Your professional circle" error={circleError}>
        <Text style={styles.circleHint}>
          Professional posts go here automatically — pick the broad topic for your expertise.
        </Text>
        <Input
          placeholder="Search circles…"
          value={circleQuery}
          onChangeText={setCircleQuery}
          style={{ marginBottom: spacing.sm }}
        />
        <View style={styles.chips}>
          {circleOptions.map((c) => (
            <Pressable key={c.id} onPress={() => onCircleIdChange(c.id)} style={styles.chipWrap}>
              <CircleChip
                circle={c}
                compact
                showOfficial
                onPress={() => onCircleIdChange(c.id)}
              />
              {circleId === c.id ? <Text style={styles.selectedMark}>✓ selected</Text> : null}
            </Pressable>
          ))}
        </View>
      </Field>
    </>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  circleHint: {
    color: colors.textMuted,
    fontSize: font.caption,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  chips: { gap: spacing.xs },
  chipWrap: { marginBottom: spacing.sm },
  selectedMark: {
    fontSize: font.tiny,
    color: colors.primary,
    fontWeight: '800',
    marginTop: 4,
    marginLeft: 4,
  },
});
