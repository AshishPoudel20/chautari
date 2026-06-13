import React, { useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import CircleChip from './CircleChip';
import VerifiedBadge from './VerifiedBadge';
import ExpertMarker from './ExpertMarker';
import { useTheme } from '../theme/ThemeContext';
import { timeAgo, compactNumber, displayAuthor } from '../utils/format';
import { professionLabel } from '../data/categories';

function QuestionCard({
  question, author, circle, expert,
  onPress, onCirclePress, onAuthorPress,
  hideCircleChip = false,
  circleChipVariant = 'muted',
}) {
  const { colors, shadow, spacing, radius, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadow, spacing, radius, font), [colors, shadow, spacing, radius, font]);

  const a = displayAuthor(author, question.anonymous);
  const isExpertPost = !!author?.verified && !question.anonymous;
  const hasExpertAnswer = !!expert;
  const rawAnswers = question.answers?.length || 0;
  const canOpenProfile = !!onAuthorPress && !question.anonymous && !a.anon;
  const skipCardPress = useRef(false);

  const handleCardPress = () => {
    if (skipCardPress.current) {
      skipCardPress.current = false;
      return;
    }
    onPress?.();
  };

  const openProfile = () => {
    if (!canOpenProfile) return;
    skipCardPress.current = true;
    onAuthorPress();
  };

  const openCircle = () => {
    if (!onCirclePress) return;
    skipCardPress.current = true;
    onCirclePress();
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        isExpertPost && styles.cardExpert,
        pressed && styles.pressed,
      ]}
    >
      {isExpertPost ? (
        <View style={styles.expertHeader}>
          <ExpertMarker compact mode="posted" />
          <Text style={styles.expertRole} numberOfLines={1}>{professionLabel(author)}</Text>
        </View>
      ) : null}

      <View style={styles.authorRow}>
        <Pressable
          onPress={openProfile}
          disabled={!canOpenProfile}
          style={styles.authorTap}
          hitSlop={4}
        >
          <Avatar name={a.name} photo={a.photo} anon={a.anon} size={isExpertPost ? 36 : 32} />
          <Text style={[styles.authorName, isExpertPost && styles.authorNameExpert]} numberOfLines={1}>
            {a.name}
          </Text>
        </Pressable>
        {isExpertPost ? <VerifiedBadge compact /> : null}
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaTime}>{timeAgo(question.createdAt)}</Text>
      </View>

      <Text style={[styles.title, isExpertPost && styles.titleExpert]} numberOfLines={2}>
        {question.title}
      </Text>

      <Text style={[styles.body, isExpertPost && styles.bodyExpert]} numberOfLines={isExpertPost ? 2 : 1}>
        {question.body}
      </Text>

      {circle && !hideCircleChip ? (
        <View style={styles.chipRow}>
          <CircleChip circle={circle} compact variant={circleChipVariant} onPress={openCircle} />
        </View>
      ) : null}

      <Text style={[styles.footer, isExpertPost && styles.footerExpertPost]}>
        <Text style={[styles.footerStat, hasExpertAnswer && styles.footerExpert]}>
          {rawAnswers} {rawAnswers === 1 ? 'answer' : 'answers'}
          {hasExpertAnswer ? ' ✓' : ''}
        </Text>
        <Text style={styles.footerDot}> · </Text>
        <Text style={styles.footerStat}>{compactNumber(question.upvotes)} upvotes</Text>
      </Text>
    </Pressable>
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
  cardExpert: {
    backgroundColor: colors.secondaryTint,
    borderColor: colors.expertCardBorder,
    borderWidth: 1.5,
    padding: spacing.lg,
    paddingBottom: spacing.lg + 2,
    marginBottom: spacing.lg + spacing.sm,
    marginTop: spacing.xs,
  },
  pressed: { opacity: 0.96 },

  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  expertRole: {
    flex: 1,
    textAlign: 'right',
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.secondaryDark,
    opacity: 0.9,
  },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorTap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, maxWidth: '72%' },
  authorName: { fontWeight: '700', fontSize: font.caption, color: colors.text, flexShrink: 1 },
  authorNameExpert: { fontWeight: '800', fontSize: font.body },
  metaDot: { color: colors.textFaint, fontSize: font.tiny },
  metaTime: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '600', flexShrink: 0 },

  title: {
    fontSize: font.subtitle,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  titleExpert: {
    marginTop: spacing.md,
    lineHeight: 25,
  },

  body: {
    fontSize: font.caption,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  bodyExpert: {
    marginTop: spacing.sm,
    lineHeight: 21,
  },

  chipRow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },

  footer: { marginTop: spacing.md, fontSize: font.caption, fontWeight: '700' },
  footerExpertPost: { marginTop: spacing.lg },
  footerStat: { color: colors.textMuted },
  footerExpert: { color: colors.secondaryDark },
  footerDot: { color: colors.textFaint },
});

export default React.memo(QuestionCard);
