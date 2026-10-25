import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MissingParamsFallback from '../../components/common/MissingParamsFallback';
import CircleDirectoryRow from '../../components/CircleDirectoryRow';
import { useData, useSelectors } from '../../data/store';
import { useNavigationGuard } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeContext';
import {
  getSectionFullList,
} from '../../utils/circleDirectory';

const PAGE_SIZE = 25;

export default function CirclesSectionSeeAllScreen({ navigation, route }) {
  const { sectionKey } = route.params || {};
  const { dispatch, state } = useData();
  const {
    joinedUserCirclesList,
    officialCircles,
    userCircles,
    isJoinedCircle,
    circleActivitySince,
    circleById,
  } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius),
    [colors, spacing, font, radius],
  );

  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const listCtx = useMemo(() => ({
    joinedUserCircles: joinedUserCirclesList(),
    officialCircles: officialCircles(),
    userCircles: userCircles(),
    joinedIds: state.joinedCircles,
    activitySince: circleActivitySince,
    query,
  }), [joinedUserCirclesList, officialCircles, userCircles, state.joinedCircles, circleActivitySince, query]);

  const fullList = useMemo(
    () => getSectionFullList(sectionKey, listCtx),
    [sectionKey, listCtx],
  );

  const visibleList = useMemo(
    () => fullList.slice(0, visibleCount),
    [fullList, visibleCount],
  );

  const loadMore = useCallback(() => {
    if (visibleCount >= fullList.length) return;
    setVisibleCount((n) => Math.min(n + PAGE_SIZE, fullList.length));
  }, [visibleCount, fullList.length]);

  const toggleJoin = useCallback((circleId) => {
    if (circleById(circleId)?.isOfficial) return;
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  }, [circleById, dispatch]);

  if (!sectionKey) {
    return (
      <MissingParamsFallback
        navigation={navigation}
        title="This list couldn't be loaded"
        message="The circles section link was incomplete."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search in this list…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setVisibleCount(PAGE_SIZE);
          }}
        />
      </View>

      <FlatList
        data={visibleList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={visibleList.length ? styles.listContent : styles.listEmptyContent}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No circles match your search.</Text>
          </View>
        )}
        ListFooterComponent={
          visibleCount < fullList.length ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CircleDirectoryRow
            circle={item}
            joined={isJoinedCircle(item.id)}
            activity={circleActivitySince(item.id)}
            showJoinControl={!item.isOfficial}
            onPress={() => navigate('CircleDetail', { circleId: item.id })}
            onToggleJoin={() => toggleJoin(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.text,
    fontSize: font.body,
  },
  listContent: { paddingBottom: spacing.xl },
  listEmptyContent: { flexGrow: 1 },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: font.body },
  footerLoader: { paddingVertical: spacing.lg, alignItems: 'center' },
});
