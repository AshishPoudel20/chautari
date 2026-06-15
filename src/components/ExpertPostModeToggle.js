import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Member / Professional toggle — professional uses badge + circle from verification profile. */
export default function ExpertPostModeToggle({
  mode,
  onChange,
  professionLabel,
  professionalCircleName,
  canProfessional = true,
  compact = false,
}) {
  const { colors, shadow, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, shadow, spacing, font, radius, compact),
    [colors, shadow, spacing, font, radius, compact],
  );

  const hint = (() => {
    if (mode === 'professional') {
      if (professionalCircleName && professionLabel) {
        return compact
          ? `Badge and circle from your verification — ${professionLabel} · ${professionalCircleName}.`
          : `Auto-filled from your verification — posts to ${professionalCircleName} as ${professionLabel}. No need to pick a circle here.`;
      }
      return `Your verified badge (${professionLabel || 'expert'}) appears on this ${compact ? 'reply' : 'post'}.`;
    }
    return `Appears as a normal community ${compact ? 'reply' : 'post'} — no expert badge. Pick any circle below.`;
  })();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{compact ? 'Reply as' : 'Post as'}</Text>
      <View style={styles.segment}>
        {[['member', 'Member'], ['professional', 'Professional']].map(([key, label]) => {
          const disabled = key === 'professional' && !canProfessional;
          return (
            <Pressable
              key={key}
              onPress={() => !disabled && onChange(key)}
              style={[styles.btn, mode === key && styles.btnActive, disabled && styles.btnDisabled]}
              accessibilityRole="button"
              accessibilityState={{ selected: mode === key, disabled }}
            >
              <Text style={[styles.text, mode === key && styles.textActive, disabled && styles.textDisabled]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>{hint}</Text>
      {!canProfessional ? (
        <Text style={styles.setupHint}>
          Badge title and circle are set when you apply for verified expert status.
        </Text>
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
  title: { fontWeight: '800', color: colors.text, fontSize: font.bodyLg, marginBottom: spacing.sm },
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
  textDisabled: { color: colors.textFaint },
  hint: {
    marginTop: spacing.sm,
    fontSize: font.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  setupHint: {
    marginTop: spacing.xs,
    fontSize: font.tiny,
    color: colors.textFaint,
    lineHeight: 16,
  },
});
