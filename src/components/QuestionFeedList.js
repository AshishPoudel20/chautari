import React, { useCallback, useMemo } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import QuestionCard from './QuestionCard';
import { FadeRise } from './Motion';
import { EmptyState } from './ui';
import { useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';

const LIST_PERF = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  removeClippedSubviews: true,
};

export default function QuestionFeedList({
  data,
  navigation,
  replayKey = 0,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  refreshControl,
  onUpvoteToggle,
  hasUpvotedQuestion,
  renderCardFooter,
}) {
  const { userById, circleById, answerCount, expertAnswerOn, firstAnswerLatency } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const { spacing } = useTheme();

  const openQuestion = useCallback(
    (questionId) => navigate('QuestionDetail', { questionId }),
    [navigate],
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const ei = expertAnswerOn(item);
      return (
        <FadeRise index={index} replayKey={replayKey}>
          <QuestionCard
            question={item}
            author={userById(item.authorId)}
            circle={circleById(item.circleId)}
            answerCount={answerCount(item)}
            expert={ei?.expert || null}
            firstAnswerMs={firstAnswerLatency(item)}
            onPress={() => openQuestion(item.id)}
            onCirclePress={() => navigate('CircleDetail', { circleId: item.circleId })}
            onUpvoteToggle={onUpvoteToggle}
            upvoteActive={hasUpvotedQuestion?.(item.id)}
          />
          {renderCardFooter ? renderCardFooter(item.id) : null}
        </FadeRise>
      );
    },
    [userById, circleById, answerCount, expertAnswerOn, firstAnswerLatency, openQuestion, navigate, replayKey, onUpvoteToggle, hasUpvotedQuestion, renderCardFooter],
  );

  const empty = useMemo(
    () => ListEmptyComponent || (
      <EmptyState icon="🌿" title="No questions yet" subtitle="Be the first to ask in this category." />
    ),
    [ListEmptyComponent],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(q) => q.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={empty}
      contentContainerStyle={[{ paddingTop: spacing.sm, paddingBottom: 40 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      {...LIST_PERF}
    />
  );
}
