import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuestionCard from './QuestionCard';
import { useTheme } from '../theme/ThemeContext';
import { resolveCircleAccent } from '../data/circles';

export default function PinnedQuestionCard({
  question, author, circle, answerCount, expert,
  onPress, onCirclePress, hideCircleChip = false,
}) {
  const { colors, spacing, font, radius, isDark } = useTheme();
  const accent = circle ? resolveCircleAccent(circle.accentId, isDark, colors.surface) : null;
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, accent), [colors, spacing, font, radius, accent]);

  return (
    <View style={styles.wrap}>
      <View style={styles.marker}>
        <Text style={styles.pinIcon}>📌</Text>
        <Text style={styles.pinLabel}>Pinned</Text>
      </View>
      <View style={styles.cardShell}>
        <QuestionCard
          question={question}
          author={author}
          circle={circle}
          answerCount={answerCount}
          expert={expert}
          onPress={onPress}
          onCirclePress={onCirclePress}
          hideCircleChip={hideCircleChip}
        />
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, accent) => StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
  marker: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm, marginLeft: 2 },
  pinIcon: { fontSize: 12 },
  pinLabel: { fontSize: font.tiny, fontWeight: '800', color: accent?.color || colors.primary, letterSpacing: 0.4 },
  cardShell: {
    borderLeftWidth: 3,
    borderLeftColor: accent?.color || colors.primary,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
