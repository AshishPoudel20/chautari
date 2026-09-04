import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useGoBack } from '../hooks/useGoBack';

/** Shown when a screen was opened without required navigation params. */
export default function MissingParamsFallback({
  navigation,
  title = "This page couldn't be loaded",
  message = 'Required information was missing. Go back and try again.',
}) {
  const { colors, spacing, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font), [colors, spacing, font]);
  const goBack = useGoBack(navigation);

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔗</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{message}</Text>
      {navigation ? (
        <Pressable onPress={goBack} style={styles.btn} hitSlop={8}>
          <Text style={styles.btnText}>Go back</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors, spacing, font) => StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  icon: { fontSize: 36, marginBottom: spacing.md },
  title: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: 999,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnText: { color: colors.onPrimary, fontWeight: '800', fontSize: font.body },
});
