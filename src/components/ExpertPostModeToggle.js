import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Member / Professional toggle for verified experts composing questions or replies. */
export default function ExpertPostModeToggle({
  mode,
  onChange,
  professionLabel,
  compact = false,
}) {
  const { colors, shadow, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, shadow, spacing, font, radius, compact),
    [colors, shadow, spacing, font, radius, compact],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{compact ? 'Reply as' : 'Post as'}</Text>
        {mode === 'professional' && professionLabel ? (
          <Text style={styles.profession} numberOfLines={1}>{professionLabel}</Text>
        ) : null}
      </View>
      <View style={styles.segment}>
        {[['member', 'Member'], ['professional', 'Professional']].map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.btn, mode === key && styles.btnActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === key }}
          >
            <Text style={[styles.text, mode === key && styles.textActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        {mode === 'professional'
          ? `Your badge title (${professionLabel || 'expert'}) appears on this ${compact ? 'reply' : 'post'}.`
          : `Appears as a normal community ${compact ? 'reply' : 'post'} — no expert badge.`}
      </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: { fontWeight: '800', color: colors.text, fontSize: font.bodyLg },
  profession: {
    flex: 1,
    textAlign: 'right',
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.bgSunken,
    borderRadius: radius.pill,
    padding: 3,
  },
  btn: { flex: 1, paddingVertical: compact ? 6 : 8, alignItems: 'center', borderRadius: radius.pill },
  btnActive: { backgroundColor: colors.surface, ...shadow.card },
  text: { fontWeight: '800', color: colors.textMuted, fontSize: font.tiny },
  textActive: { color: colors.primary },
  hint: {
    marginTop: spacing.sm,
    fontSize: font.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
