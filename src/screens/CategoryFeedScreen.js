import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QuestionFeedList from '../components/QuestionFeedList';
import { useData, useSelectors } from '../data/store';
import { categoryById } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';

// Dedicated category browse — question feed filtered to one category.
// Distinct from Search: no search bar, category name as title, back to Categories.
export default function CategoryFeedScreen({ navigation, route }) {
  const { colors, spacing, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font), [colors, spacing, font]);

  const categoryId = route.params?.categoryId;
  const category = categoryById(categoryId);
  const { dispatch } = useData();
  const { state, hasUpvotedQuestion } = useSelectors();

  useLayoutEffect(() => {
    navigation.setOptions({ title: category?.name || 'Category' });
  }, [navigation, category?.name]);

  const data = useMemo(
    () => state.questions.filter((q) => q.category === categoryId),
    [state.questions, categoryId],
  );

  const header = (
    <View style={styles.header}>
      <Text style={styles.icon}>{category?.icon || '📌'}</Text>
      <Text style={styles.count}>
        {data.length} question{data.length === 1 ? '' : 's'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <QuestionFeedList
        data={data}
        navigation={navigation}
        ListHeaderComponent={header}
        onUpvoteToggle={(questionId) => dispatch({ type: 'TOGGLE_UPVOTE_QUESTION', questionId })}
        hasUpvotedQuestion={hasUpvotedQuestion}
      />
    </View>
  );
}

const createStyles = (colors, spacing, font) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  icon: { fontSize: 36, marginBottom: spacing.sm },
  count: { fontSize: font.caption, fontWeight: '700', color: colors.textMuted },
});
