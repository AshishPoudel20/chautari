import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuestionCard from './QuestionCard';
import { useTheme } from '../theme/ThemeContext';
import { circleAccentColor } from '../data/circles';

export default function PinnedQuestionCard({
  question, author, circle, answerCount, expert, firstAnswerMs,
  onPress, onCirclePress, onUpvoteToggle, upvoteActive,
}) {
  const { colors, spacing, font, radius, isDark } = useTheme();
  const accent = circle ? circleAccentColor(circle, isDark) : null;
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
          firstAnswerMs={firstAnswerMs}
          onPress={onPress}
          onCirclePress={onCirclePress}
          onUpvoteToggle={onUpvoteToggle}
          upvoteActive={upvoteActive}
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
