import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Two-state identity control for verified experts: Member (default) vs Professional.
 */
export default function ExpertPostingToggle({
  value,
  onChange,
  disabledProfessional = false,
  disabledProfessionalHint,
}) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, shadow),
    [colors, spacing, font, radius, shadow],
  );

  const setMember = () => onChange(false);
  const setProfessional = () => {
    if (!disabledProfessional) onChange(true);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Post as</Text>
      <View style={styles.toggle}>
        <Pressable
          onPress={setMember}
          style={[styles.option, !value && styles.optionActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: !value }}
        >
          <Text style={[styles.optionText, !value && styles.optionTextActive]}>Member</Text>
        </Pressable>
        <Pressable
          onPress={setProfessional}
          disabled={disabledProfessional}
          style={[
            styles.option,
            value && styles.optionActive,
            disabledProfessional && styles.optionDisabled,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: !!value, disabled: disabledProfessional }}
        >
          <Text style={[
            styles.optionText,
            value && styles.optionTextActive,
            disabledProfessional && styles.optionTextDisabled,
          ]}
          >
            Professional
          </Text>
        </Pressable>
      </View>
      {disabledProfessional && disabledProfessionalHint ? (
        <Text style={styles.hint}>{disabledProfessionalHint}</Text>
      ) : null}
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textFaint,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgSunken,
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  optionDisabled: { opacity: 0.45 },
  optionText: {
    fontSize: font.caption,
    fontWeight: '800',
    color: colors.textMuted,
  },
  optionTextActive: { color: colors.primary },
  optionTextDisabled: { color: colors.textFaint },
  hint: {
    marginTop: spacing.sm,
    fontSize: font.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
