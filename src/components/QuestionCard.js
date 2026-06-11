import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import CircleChip from './CircleChip';
import { useTheme } from '../theme/ThemeContext';
import { timeAgo, compactNumber, displayAuthor } from '../utils/format';

function QuestionCard({
  question, author, circle, expert,
  onPress, onCirclePress,
}) {
  const { colors, shadow, spacing, radius, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadow, spacing, radius, font), [colors, shadow, spacing, radius, font]);

  const a = displayAuthor(author, question.anonymous);
  const hasExpert = !!expert;
  const rawAnswers = question.answers?.length || 0;

  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.tapArea, pressed && styles.pressed]}>
        <View style={styles.authorRow}>
          <Avatar name={a.name} photo={a.photo} anon={a.anon} size={32} />
          <Text style={styles.authorName} numberOfLines={1}>{a.name}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaTime}>{timeAgo(question.createdAt)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{question.title}</Text>

        <Text style={styles.body} numberOfLines={1}>{question.body}</Text>

        {circle ? (
          <View style={styles.chipRow}>
            <CircleChip circle={circle} compact onPress={onCirclePress} />
          </View>
        ) : null}

        <Text style={styles.footer}>
          <Text style={[styles.footerStat, hasExpert && styles.footerExpert]}>
            {rawAnswers} {rawAnswers === 1 ? 'answer' : 'answers'}
            {hasExpert ? ' ✓' : ''}
          </Text>
          <Text style={styles.footerDot}> · </Text>
          <Text style={styles.footerStat}>{compactNumber(question.upvotes)} upvotes</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors, shadow, spacing, radius, font) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingBottom: spacing.md + 2,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  tapArea: {},
  pressed: { opacity: 0.96 },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontWeight: '700', fontSize: font.caption, color: colors.text, flexShrink: 1 },
  metaDot: { color: colors.textFaint, fontSize: font.tiny },
  metaTime: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '600' },

  title: {
    fontSize: font.subtitle,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 23,
    marginTop: spacing.sm,
  },

  body: {
    fontSize: font.caption,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  chipRow: { marginTop: spacing.sm },

  footer: { marginTop: spacing.md, fontSize: font.caption, fontWeight: '700' },
  footerStat: { color: colors.textMuted },
  footerExpert: { color: colors.secondaryDark },
  footerDot: { color: colors.textFaint },
});

export default React.memo(QuestionCard);
