import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Member / Professional toggle only — badge title and circle come from profile, not here. */
export default function ExpertPostModeToggle({
  mode,
  onChange,
  compact = false,
  professionalDisabled = false,
  memberDisabled = false,
  professionalDisabledMessage = null,
  memberDisabledMessage = null,
}) {
  const { colors, shadow, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, shadow, spacing, font, radius, compact),
    [colors, shadow, spacing, font, radius, compact],
  );

  const options = [
    ['member', 'Member', memberDisabled, memberDisabledMessage],
    ['professional', 'Professional', professionalDisabled, professionalDisabledMessage],
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{compact ? 'Reply as' : 'Post as'}</Text>
      <View style={styles.segment}>
        {options.map(([key, label, disabled]) => (
          <Pressable
            key={key}
            onPress={() => !disabled && onChange(key)}
            disabled={disabled}
            style={[
              styles.btn,
              mode === key && styles.btnActive,
              disabled && styles.btnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === key, disabled }}
          >
            <Text style={[
              styles.text,
              mode === key && styles.textActive,
              disabled && styles.textDisabled,
            ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {professionalDisabled && professionalDisabledMessage ? (
        <Text style={styles.limitNote}>{professionalDisabledMessage}</Text>
      ) : null}
      {memberDisabled && memberDisabledMessage ? (
        <Text style={styles.limitNote}>{memberDisabledMessage}</Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors, shadow, spacing, font, radius, compact) => StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: compact ? spacing.md : spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: compact ? spacing.sm : spacing.lg,
    ...(compact ? {} : shadow.card),
  },
  title: { fontWeight: '800', color: colors.text, fontSize: compact ? font.caption : font.bodyLg, marginBottom: spacing.sm },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.bgSunken,
    borderRadius: radius.pill,
    padding: 3,
  },
  btn: { flex: 1, paddingVertical: compact ? 6 : 8, alignItems: 'center', borderRadius: radius.pill },
  btnActive: { backgroundColor: colors.surface, ...shadow.card },
  btnDisabled: { opacity: 0.45 },
  text: { fontWeight: '800', color: colors.textMuted, fontSize: font.tiny },
  textActive: { color: colors.primary },
  textDisabled: { color: colors.textMuted },
  limitNote: {
    marginTop: spacing.sm,
    fontSize: font.caption,
    color: colors.danger,
    fontWeight: '600',
    lineHeight: 18,
  },
});
