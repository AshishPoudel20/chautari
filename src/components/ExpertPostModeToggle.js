import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Member / Professional toggle only — badge title and circle come from profile, not here. */
export default function ExpertPostModeToggle({ mode, onChange, compact = false }) {
  const { colors, shadow, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, shadow, spacing, font, radius, compact),
    [colors, shadow, spacing, font, radius, compact],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{compact ? 'Reply as' : 'Post as'}</Text>
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
  text: { fontWeight: '800', color: colors.textMuted, fontSize: font.tiny },
  textActive: { color: colors.primary },
});
