import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

function useDocStyles() {
  const { colors, spacing, font, radius, line } = useTheme();
  return useMemo(() => createStyles(colors, spacing, font, radius, line), [colors, spacing, font, radius, line]);
}

// Shared layout for the static document screens (Terms, Privacy, About).
export function DocScreen({ children, sample }) {
  const { spacing } = useTheme();
  const styles = useDocStyles();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sample && (
        <View style={styles.sample}>
          <Text style={styles.sampleText}>📄 Sample copy — placeholder for a real legal document. This is a prototype.</Text>
        </View>
      )}
      {children}
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

export function DocSection({ heading, children }) {
  const styles = useDocStyles();
  return (
    <View style={styles.section}>
      {heading ? <Text style={styles.heading}>{heading}</Text> : null}
      {children}
    </View>
  );
}

export function DocParagraph({ children }) {
  const styles = useDocStyles();
  return <Text style={styles.paragraph}>{children}</Text>;
}

const createStyles = (colors, spacing, font, radius, line) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  sample: { backgroundColor: colors.secondaryTint, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  sampleText: { color: colors.secondaryDark, fontSize: font.caption, fontWeight: '700', lineHeight: 18 },
  section: { marginBottom: spacing.lg },
  heading: { fontSize: font.subtitle, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  paragraph: { fontSize: font.body, color: colors.textMuted, lineHeight: line.body, marginBottom: spacing.sm },
});
