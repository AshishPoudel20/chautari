import React from 'react';
import { View, StyleSheet } from 'react-native';
import QuestionFeedList from '../components/QuestionFeedList';
import { EmptyState } from '../components/ui';
import { useData, useSelectors } from '../data/store';
import { useTheme } from '../theme/ThemeContext';

export default function MyPostsScreen({ navigation }) {
  const { dispatch } = useData();
  const { myQuestions, hasUpvotedQuestion } = useSelectors();
  const { colors } = useTheme();
  const data = myQuestions();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <QuestionFeedList
        data={data}
        navigation={navigation}
        onUpvoteToggle={(questionId) => dispatch({ type: 'TOGGLE_UPVOTE_QUESTION', questionId })}
        hasUpvotedQuestion={hasUpvotedQuestion}
        ListEmptyComponent={(
          <EmptyState
            icon="✍️"
            title="No posts yet"
            subtitle="Questions you ask will show up here."
            action={{ label: 'Ask a question', onPress: () => navigation.navigate('AskComposer') }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
