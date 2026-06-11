import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ExpertPostQuota from '../components/ExpertPostQuota';
import QuestionFeedList from '../components/QuestionFeedList';
import { EmptyState } from '../components/ui';
import { useData, useSelectors } from '../data/store';
import { useTheme } from '../theme/ThemeContext';

export default function MyPostsScreen({ navigation }) {
  const { dispatch } = useData();
  const {
    myQuestions, me, canExpertPostToday, expertPostsToday, expertDailyPostLimit,
  } = useSelectors();
  const { colors, spacing } = useTheme();
  const data = myQuestions();
  const user = me();
  const expertAtLimit = user?.verified && !canExpertPostToday();

  const openAsk = () => {
    if (expertAtLimit) {
      Alert.alert(
        'Daily limit reached',
        `You've used ${expertPostsToday()}/${expertDailyPostLimit} expert posts today. Try again tomorrow.`,
      );
      return;
    }
    navigation.navigate('AskComposer');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <QuestionFeedList
        data={data}
        navigation={navigation}
        ListHeaderComponent={(
          <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
            <ExpertPostQuota variant="banner" />
          </View>
        )}
        ListEmptyComponent={(
          <EmptyState
            icon="✍️"
            title="No posts yet"
            subtitle="Questions you ask will show up here."
            action={{ label: 'Ask a question', onPress: openAsk }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
