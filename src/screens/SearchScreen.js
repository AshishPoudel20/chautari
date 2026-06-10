import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import QuestionCard from '../components/QuestionCard';
import { Input, Chip, EmptyState } from '../components/ui';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { CATEGORIES, SUBURBS } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';

const DATE_RANGES = [
  { id: 'any', label: 'Any time', ms: Infinity },
  { id: '24h', label: 'Past 24h', ms: 24 * 60 * 60 * 1000 },
  { id: '7d', label: 'Past week', ms: 7 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: 'Past month', ms: 30 * 24 * 60 * 60 * 1000 },
];

const LIST_PERF = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  removeClippedSubviews: true,
};

// Search bar + filters (category, suburb, date range) with live results.
export default function SearchScreen({ navigation, route }) {
  const { colors, spacing, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font), [colors, spacing, font]);

  const { dispatch } = useData();
  const { state, userById, answerCount, expertAnswerOn, firstAnswerLatency, hasUpvotedQuestion } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [suburb, setSuburb] = useState(null);
  const [range, setRange] = useState('any');
  const [showFilters, setShowFilters] = useState(true);

  // Reset only when Home explicitly requests a fresh search (avoids wiping state on back from detail).
  useFocusEffect(
    useCallback(() => {
      if (route.params?.reset) {
        setQuery('');
        setCategory(null);
        setSuburb(null);
        setRange('any');
        navigation.setParams({ reset: undefined });
      }
    }, [route.params?.reset, navigation]),
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rangeMs = DATE_RANGES.find((r) => r.id === range)?.ms ?? Infinity;
    return state.questions.filter((item) => {
      if (q && !(item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q))) return false;
      if (category && item.category !== category) return false;
      if (suburb) {
        const author = userById(item.authorId);
        if (item.anonymous || author?.suburb !== suburb) return false;
      }
      if (Date.now() - item.createdAt > rangeMs) return false;
      return true;
    });
  }, [query, category, suburb, range, state.questions, userById]);

  const activeFilters = (category ? 1 : 0) + (suburb ? 1 : 0) + (range !== 'any' ? 1 : 0);
  const headerHeight = useHeaderHeight();

  const renderItem = useCallback(
    ({ item }) => (
      <QuestionCard
        question={item}
        author={userById(item.authorId)}
        answerCount={answerCount(item)}
        expert={expertAnswerOn(item)?.expert || null}
        firstAnswerMs={firstAnswerLatency(item)}
        onPress={() => navigate('QuestionDetail', { questionId: item.id })}
        onUpvoteToggle={(questionId) => dispatch({ type: 'TOGGLE_UPVOTE_QUESTION', questionId })}
        upvoteActive={hasUpvotedQuestion(item.id)}
      />
    ),
    [userById, answerCount, expertAnswerOn, firstAnswerLatency, navigate, dispatch, hasUpvotedQuestion],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      <View style={styles.searchBar}>
        <Input placeholder="Search questions…" value={query} onChangeText={setQuery} returnKeyType="search" style={{ flex: 1 }} />
      </View>

      <Pressable style={styles.filterToggle} onPress={() => setShowFilters((s) => !s)}>
        <Text style={styles.filterToggleText}>{showFilters ? '▾' : '▸'} Filters{activeFilters ? ` (${activeFilters})` : ''}</Text>
        {activeFilters > 0 && (
          <Pressable onPress={() => { setCategory(null); setSuburb(null); setRange('any'); }}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        )}
      </Pressable>

      {showFilters && (
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
            {CATEGORIES.map((c) => (
              <Chip key={c.id} label={c.name} active={category === c.id} onPress={() => setCategory(category === c.id ? null : c.id)} />
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Suburb</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
            {SUBURBS.map((s) => (
              <Chip key={s} label={s} active={suburb === s} onPress={() => setSuburb(suburb === s ? null : s)} />
            ))}
          </ScrollView>
          <Text style={styles.filterLabel}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
            {DATE_RANGES.map((r) => (
              <Chip key={r.id} label={r.label} active={range === r.id} onPress={() => setRange(r.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(q) => q.id}
        ListHeaderComponent={<Text style={styles.resultCount}>{results.length} result{results.length === 1 ? '' : 's'}</Text>}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState icon="🔍" title="No matches" subtitle="Try a different keyword or clear your filters." />}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        {...LIST_PERF}
      />
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors, spacing, font) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: { padding: spacing.lg, paddingBottom: spacing.sm },
  filterToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterToggleText: { fontWeight: '700', color: colors.text },
  clear: { color: colors.primary, fontWeight: '700', fontSize: font.small },
  filters: { paddingBottom: spacing.sm },
  filterLabel: { fontSize: font.tiny, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: 6 },
  rowChips: { paddingHorizontal: spacing.lg, paddingBottom: 4 },
  resultCount: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, color: colors.textMuted, fontSize: font.small, fontWeight: '600' },
});
