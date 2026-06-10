import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import ExpertMarker from './ExpertMarker';
import UpvoteButton from './UpvoteButton';
import CircleChip from './CircleChip';
import { useTheme } from '../theme/ThemeContext';
import { timeAgo, compactNumber, displayAuthor, shortDuration } from '../utils/format';

const FAST_ANSWER_MS = 3 * 60 * 60 * 1000;

function QuestionCard({
  question, author, circle, answerCount, expert, firstAnswerMs,
  onPress, onCirclePress, onUpvoteToggle, upvoteActive,
}) {
  const { colors, shadow, spacing, radius, font, line } = useTheme();
  const styles = useMemo(() => createStyles(colors, shadow, spacing, radius, font, line), [colors, shadow, spacing, radius, font, line]);

  const a = displayAuthor(author, question.anonymous);
  const hasExpert = !!expert;
  const authorIsExpert = !question.anonymous && !!author?.verified;
  const highlighted = authorIsExpert || hasExpert;
  const answeredFast = firstAnswerMs != null && firstAnswerMs <= FAST_ANSWER_MS;

  return (
    <View style={[styles.card, highlighted && styles.cardExpert]}>
      {highlighted && <View style={styles.accentBar} />}

      <Pressable onPress={onPress} style={({ pressed }) => [styles.tapArea, pressed && styles.pressed]}>
        <View style={styles.headerRow}>
          <Avatar name={a.name} photo={a.photo} anon={a.anon} size={38} />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{a.name}</Text>
              {a.verified ? <VerifiedBadge compact /> : null}
            </View>
            <View style={styles.metaRow}>
              {a.suburb ? <Text style={styles.meta}>{a.suburb}</Text> : null}
              {a.suburb ? <Text style={styles.metaDot}>·</Text> : null}
              <Text style={styles.meta}>{timeAgo(question.createdAt)}</Text>
            </View>
          </View>
          {circle ? (
            <CircleChip circle={circle} compact onPress={onCirclePress} showOfficial />
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>{question.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{question.body}</Text>

        {(authorIsExpert || hasExpert || answeredFast) && (
          <View style={styles.signalRow}>
            {authorIsExpert ? <ExpertMarker name={a.name?.split(' ')[0]} compact mode="posted" /> : null}
            {hasExpert ? <ExpertMarker name={expert.name?.split(' ')[0]} compact mode="answered" /> : null}
            {answeredFast ? (
              <View style={styles.fastPill}>
                <Text style={styles.fastText}>⚡ First answer in {shortDuration(firstAnswerMs)}</Text>
              </View>
            ) : null}
          </View>
        )}
      </Pressable>

      <View style={styles.footerRow}>
        {onUpvoteToggle ? (
          <UpvoteButton
            count={question.upvotes}
            active={upvoteActive}
            onToggle={() => onUpvoteToggle(question.id)}
          />
        ) : (
          <View style={styles.stat}>
            <Text style={styles.statIcon}>▲</Text>
            <Text style={styles.statText}>{compactNumber(question.upvotes)}</Text>
          </View>
        )}
        <View style={styles.stat}>
          <Text style={[styles.statIcon, answerCount > 0 && styles.statIconActive]}>💬</Text>
          <Text style={[styles.statText, answerCount > 0 && styles.statTextActive]}>
            {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={styles.views}>{compactNumber(question.views)} views</Text>
      </View>
    </View>
  );
}

const createStyles = (colors, shadow, spacing, radius, font, line) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    marginHorizontal: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.card,
  },
  cardExpert: { borderColor: colors.expertCardBorder, ...shadow.raised },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.secondary },
  tapArea: { marginBottom: spacing.md },
  pressed: { opacity: 0.96 },

  headerRow: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontWeight: '800', fontSize: font.caption, color: colors.text, maxWidth: 150 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: font.tiny, fontWeight: '600' },
  metaDot: { color: colors.textFaint, fontSize: font.tiny },

  title: { fontSize: font.subtitle, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: 5, lineHeight: 23 },
  body: { fontSize: font.caption, color: colors.textMuted, lineHeight: line.caption },

  signalRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  fastPill: { backgroundColor: colors.successTint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  fastText: { color: colors.success, fontSize: font.tiny, fontWeight: '800' },

  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statIcon: { fontSize: font.caption, color: colors.textFaint },
  statIconActive: { color: colors.text },
  statText: { color: colors.textMuted, fontSize: font.caption, fontWeight: '700' },
  statTextActive: { color: colors.text },
  views: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '600' },
});

export default React.memo(QuestionCard);
