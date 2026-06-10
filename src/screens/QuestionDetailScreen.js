import React, { useMemo, useState, useLayoutEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import Avatar from '../components/Avatar';
import VerifiedBadge from '../components/VerifiedBadge';
import UpvoteButton from '../components/UpvoteButton';
import CircleChip from '../components/CircleChip';
import KarmaBadge from '../components/KarmaBadge';
import { useToast } from '../components/Toast';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { professionLabel } from '../data/categories';
import { timeAgo, displayAuthor, compactNumber } from '../utils/format';
import { useTheme } from '../theme/ThemeContext';

// Renders text with visually distinct links (links allowed in answers/replies).
function BodyText({ children, style, linkStyle }) {
  const parts = String(children).split(/(https?:\/\/[^\s]+)/g);
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? <Text key={i} style={linkStyle}>{p}</Text> : p
      )}
    </Text>
  );
}

export default function QuestionDetailScreen({ navigation, route }) {
  const { questionId, justPosted } = route.params;
  const { dispatch } = useData();
  const { questionById, userById, circleById, karmaFor, hasUpvotedAnswer, hasUpvotedReply, hasUpvotedQuestion, isSaved, isCircleCreator, state } = useSelectors();
  const showToast = useToast();
  const { navigate } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius, line, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, line, shadow), [colors, spacing, font, radius, line, shadow]);
  const question = questionById(questionId);
  const isMine = question && question.authorId === 'me';
  const saved = isSaved(questionId);
  const qUpvoted = hasUpvotedQuestion(questionId);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sort, setSort] = useState('top'); // 'top' | 'new' — for community answers
  const scrollRef = useRef(null);
  const headerHeight = useHeaderHeight();

  const openMenu = useCallback(() => {
    if (!question) return;
    const options = [];
    const circle = circleById(question.circleId);
    const canPin = isCircleCreator(question.circleId);
    if (canPin) {
      const pinned = circle?.pinnedQuestionId === questionId;
      options.push({
        text: pinned ? 'Unpin from circle' : 'Pin to circle',
        onPress: () => {
          if (pinned) {
            dispatch({ type: 'UNPIN_QUESTION_FROM_CIRCLE', circleId: question.circleId, questionId });
            showToast('Unpinned from circle', { tone: 'default' });
          } else {
            dispatch({ type: 'PIN_QUESTION_TO_CIRCLE', circleId: question.circleId, questionId });
            showToast('Pinned to circle', { tone: 'success' });
          }
        },
      });
    }
    if (isMine) {
      options.push({
        text: 'Delete question',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'DELETE_QUESTION', questionId });
          navigation.goBack();
          showToast('Question deleted', { tone: 'success' });
        },
      });
    } else {
      options.push({ text: 'Report question', style: 'destructive', onPress: () => navigate('Report', { kind: 'content', targetTitle: question.title }) });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(isMine ? 'Your question' : 'Question options', null, options);
  }, [question, isMine, dispatch, questionId, navigation, showToast, navigate, circleById, isCircleCreator]);

  const toggleSave = useCallback(() => {
    const wasSaved = isSaved(questionId);
    dispatch({ type: 'TOGGLE_SAVE_QUESTION', questionId });
    showToast(wasSaved ? 'Removed from saved' : 'Saved for later', { tone: wasSaved ? 'default' : 'success' });
  }, [dispatch, questionId, showToast, isSaved]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Pressable onPress={toggleSave} hitSlop={10}>
            <Text style={{ fontSize: 20, color: saved ? colors.primary : colors.textMuted }}>{saved ? '🔖' : '🔖'}</Text>
          </Pressable>
          <Pressable onPress={openMenu} hitSlop={10}>
            <Text style={{ fontSize: 20, color: colors.textMuted }}>⋯</Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation, question, isMine, saved, colors, toggleSave, openMenu]);

  // Split: verified-expert answers pinned to the top, community answers below.
  const { pinned, community } = useMemo(() => {
    if (!question) return { pinned: [], community: [] };
    const isExpert = (a) => !a.anonymous && userById(a.authorId)?.verified;
    const pin = question.answers.filter(isExpert).sort((a, b) => b.upvotes - a.upvotes || a.createdAt - b.createdAt);
    const com = question.answers.filter((a) => !isExpert(a));
    com.sort((a, b) => (sort === 'top' ? b.upvotes - a.upvotes || b.createdAt - a.createdAt : b.createdAt - a.createdAt));
    return { pinned: pin, community: com };
  }, [question, state.users, sort]);

  if (!question) {
    return <View style={styles.container}><Text style={styles.missing}>This question is no longer available.</Text></View>;
  }

  const qAuthor = displayAuthor(userById(question.authorId), question.anonymous);
  const qAuthorUser = userById(question.authorId);
  const circle = circleById(question.circleId);
  const isExpertPost = qAuthor.verified && !question.anonymous;
  const totalAnswers = question.answers.length;

  const goToProfile = (authorId, anonymous) => {
    if (anonymous) return;
    if (authorId === 'me') { navigate('Main', { screen: 'Profile' }); return; }
    const u = userById(authorId);
    const screen = u?.verified ? 'ExpertProfile' : 'UserProfile';
    navigate(screen, { userId: authorId, title: u?.name });
  };

  const submitReply = (answerId) => {
    const len = replyText.trim().length;
    if (len < 5 || len > 1000) return;
    dispatch({ type: 'ADD_REPLY', questionId, answerId, body: replyText, anonymous: false });
    setReplyText('');
    setReplyingTo(null);
  };

  const renderAnswer = (ans, isPinned) => {
    const aAuthor = displayAuthor(userById(ans.authorId), ans.anonymous);
    return (
      <View key={ans.id} style={[styles.answer, isPinned && styles.answerPinned]}>
        {isPinned && (
          <View style={styles.pinnedBanner}>
            <Text style={styles.pinnedText}>✓ VERIFIED EXPERT ANSWER</Text>
          </View>
        )}
        <Pressable style={styles.authorRow} onPress={() => goToProfile(ans.authorId, ans.anonymous)}>
          <Avatar name={aAuthor.name} photo={aAuthor.photo} anon={aAuthor.anon} size={34} />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.answerAuthor}>{aAuthor.name}</Text>
              {aAuthor.verified ? <VerifiedBadge compact /> : null}
              <KarmaBadge karma={karmaFor(ans.authorId)} compact />
            </View>
            <Text style={styles.metaText}>{aAuthor.suburb ? `${aAuthor.suburb} · ` : ''}{timeAgo(ans.createdAt)}</Text>
          </View>
        </Pressable>

        <BodyText style={styles.answerBody} linkStyle={styles.link}>{ans.body}</BodyText>

        <View style={styles.answerActions}>
          <UpvoteButton
            count={ans.upvotes}
            active={hasUpvotedAnswer(ans.id)}
            onToggle={() => dispatch({ type: 'TOGGLE_UPVOTE_ANSWER', answerId: ans.id })}
          />
          <Pressable onPress={() => {
            const opening = replyingTo !== ans.id;
            setReplyingTo(opening ? ans.id : null);
            setReplyText('');
            if (opening) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
          }} hitSlop={6}>
            <Text style={styles.replyBtn}>↩ Reply</Text>
          </Pressable>
          <Pressable onPress={() => navigate('Report', { kind: 'content', targetTitle: 'this answer' })} hitSlop={6}>
            <Text style={styles.reportBtn}>Report</Text>
          </Pressable>
        </View>

        {(ans.replies || []).map((r) => {
          const rAuthor = displayAuthor(userById(r.authorId), r.anonymous);
          return (
            <View key={r.id} style={styles.reply}>
              <Pressable style={styles.replyHead} onPress={() => goToProfile(r.authorId, r.anonymous)}>
                <Avatar name={rAuthor.name} photo={rAuthor.photo} anon={rAuthor.anon} size={24} />
                <Text style={styles.replyAuthor}>{rAuthor.name}</Text>
                {rAuthor.verified ? <VerifiedBadge compact /> : null}
                <Text style={styles.metaTiny}>· {timeAgo(r.createdAt)}</Text>
              </Pressable>
              <BodyText style={styles.replyBody} linkStyle={styles.link}>{r.body}</BodyText>
              <View style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                <UpvoteButton size="sm" count={r.upvotes} active={hasUpvotedReply(r.id)} onToggle={() => dispatch({ type: 'TOGGLE_UPVOTE_REPLY', replyId: r.id })} />
              </View>
            </View>
          );
        })}

        {replyingTo === ans.id && (
          <View style={styles.replyComposer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply…"
              placeholderTextColor={colors.textFaint}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              autoFocus
              maxLength={1000}
            />
            <Pressable
              onPress={() => submitReply(ans.id)}
              disabled={replyText.trim().length < 5}
              style={[styles.replySend, replyText.trim().length < 5 && { opacity: 0.4 }]}
            >
              <Text style={styles.replySendText}>Send</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {justPosted && (
          <View style={styles.postedBanner}>
            <Text style={styles.postedText}>🌿 Your question is live — the community can answer it now.</Text>
          </View>
        )}

        {/* Question */}
        <View style={[styles.qBlock, isExpertPost && styles.qBlockExpert]}>
          {isExpertPost && (
            <View style={styles.expertPostBanner}>
              <Text style={styles.expertPostBannerText}>✓ VERIFIED EXPERT POST</Text>
              <Text style={styles.expertPostBannerSub}>{professionLabel(qAuthorUser)}</Text>
            </View>
          )}
          {circle ? (
            <CircleChip
              circle={circle}
              showOfficial
              onPress={() => navigate('CircleDetail', { circleId: circle.id })}
            />
          ) : null}
          <Text style={styles.qTitle}>{question.title}</Text>

          <Pressable style={styles.authorRow} onPress={() => goToProfile(question.authorId, question.anonymous)}>
            <Avatar name={qAuthor.name} photo={qAuthor.photo} anon={qAuthor.anon} size={38} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{qAuthor.name}</Text>
                {qAuthor.verified ? <VerifiedBadge compact /> : null}
              </View>
              <Text style={styles.metaText}>{qAuthor.suburb ? `${qAuthor.suburb} · ` : ''}{timeAgo(question.createdAt)}</Text>
            </View>
          </Pressable>

          <BodyText style={styles.qBody} linkStyle={styles.link}>{question.body}</BodyText>

          {question.photos?.length > 0 && (
            <View style={styles.photoRow}>
              {question.photos.map((p, i) => (
                <Pressable key={i} style={styles.photoTile} onPress={() => navigate('ImageViewer', { photos: question.photos, index: i })}>
                  <Text style={{ fontSize: 24 }}>🖼</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.qActions}>
            <UpvoteButton
              count={question.upvotes}
              active={qUpvoted}
              onToggle={() => dispatch({ type: 'TOGGLE_UPVOTE_QUESTION', questionId })}
            />
            <Text style={styles.viewCount}>👁 {compactNumber(question.views)} views</Text>
          </View>
        </View>

        {/* Answers header + community sort */}
        <View style={styles.answersHeader}>
          <Text style={styles.answersTitle}>{totalAnswers} {totalAnswers === 1 ? 'Answer' : 'Answers'}</Text>
          {community.length > 1 && (
            <View style={styles.sortToggle}>
              {[['top', 'Top'], ['new', 'Newest']].map(([k, lbl]) => (
                <Pressable key={k} onPress={() => setSort(k)} style={[styles.sortBtn, sort === k && styles.sortBtnActive]}>
                  <Text style={[styles.sortText, sort === k && styles.sortTextActive]}>{lbl}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {totalAnswers === 0 && (
          <View style={styles.noAnswers}>
            <Text style={styles.noAnswersText}>No answers yet — be the first to help.</Text>
          </View>
        )}

        {pinned.map((a) => renderAnswer(a, true))}
        {community.map((a) => renderAnswer(a, false))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.answerCta, pressed && { opacity: 0.9 }]} onPress={() => navigate('AnswerComposer', { questionId })}>
          <Text style={styles.answerCtaText}>✍️  Write an answer</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, spacing, font, radius, line, shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  missing: { padding: spacing.xl, color: colors.textMuted, textAlign: 'center', marginTop: 40 },

  postedBanner: { backgroundColor: colors.successTint, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  postedText: { color: colors.success, fontWeight: '800', fontSize: font.caption, textAlign: 'center' },

  qBlock: { backgroundColor: colors.surface, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  qBlockExpert: { borderBottomColor: colors.expertCardBorder, borderBottomWidth: 2 },
  expertPostBanner: {
    alignSelf: 'flex-start', backgroundColor: colors.secondaryTint,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.expertMarkerBorder,
  },
  expertPostBannerText: { color: colors.secondaryDark, fontWeight: '800', fontSize: font.tiny, letterSpacing: 0.5 },
  expertPostBannerSub: { color: colors.secondaryDark, fontSize: font.tiny, fontWeight: '600', marginTop: 2, opacity: 0.9 },
  qTitle: { fontSize: font.title, fontWeight: '800', color: colors.text, marginTop: spacing.sm, marginBottom: spacing.md, lineHeight: 28 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontWeight: '800', color: colors.text, fontSize: font.caption },
  metaText: { color: colors.textMuted, fontSize: font.tiny, marginTop: 1, fontWeight: '600' },
  metaTiny: { color: colors.textFaint, fontSize: font.tiny, fontWeight: '600' },
  qBody: { fontSize: font.bodyLg, color: colors.text, lineHeight: 25, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: '700' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  photoTile: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  qActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.lg },
  viewCount: { color: colors.textMuted, fontSize: font.caption, fontWeight: '600' },

  answersHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  answersTitle: { fontSize: font.subtitle, fontWeight: '800', color: colors.text },
  sortToggle: { flexDirection: 'row', backgroundColor: colors.bgSunken, borderRadius: radius.pill, padding: 3 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill },
  sortBtnActive: { backgroundColor: colors.surface, ...shadow.card },
  sortText: { fontSize: font.tiny, fontWeight: '800', color: colors.textMuted },
  sortTextActive: { color: colors.primary },

  noAnswers: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  noAnswersText: { color: colors.textMuted, fontSize: font.caption },

  answer: { backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginBottom: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  answerPinned: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.surface },
  pinnedBanner: { alignSelf: 'flex-start', backgroundColor: colors.primaryTint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, marginBottom: spacing.md },
  pinnedText: { color: colors.primary, fontWeight: '800', fontSize: font.tiny, letterSpacing: 0.5 },
  answerAuthor: { fontWeight: '800', color: colors.text, fontSize: font.caption },
  answerBody: { fontSize: font.bodyLg, color: colors.text, lineHeight: 24, marginVertical: spacing.md },
  answerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  replyBtn: { color: colors.textMuted, fontWeight: '800', fontSize: font.caption },
  reportBtn: { color: colors.textFaint, fontSize: font.caption, fontWeight: '600' },

  reply: { marginTop: spacing.md, marginLeft: spacing.md, paddingLeft: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.border },
  replyHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  replyAuthor: { fontWeight: '800', color: colors.text, fontSize: font.tiny },
  replyBody: { fontSize: font.caption, color: colors.text, lineHeight: 20, marginTop: 4 },

  replyComposer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  replyInput: { flex: 1, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, padding: spacing.sm, minHeight: 42, maxHeight: 120, color: colors.text, backgroundColor: colors.bg },
  replySend: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 11, borderRadius: radius.md },
  replySendText: { color: colors.onPrimary, fontWeight: '800' },

  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  answerCta: { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: radius.md, alignItems: 'center', ...shadow.card },
  answerCtaText: { color: colors.onPrimary, fontWeight: '800', fontSize: font.bodyLg },
});
