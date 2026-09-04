import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircleDirectoryRow from '../components/CircleDirectoryRow';
import { useData, useSelectors } from '../data/store';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import {
  buildYourCirclesList,
  buildPopularList,
  buildAllRemainingList,
  CIRCLE_DIR_SECTION_CAP,
  CIRCLE_DIR_ALL_PAGE_SIZE,
  CIRCLE_DIR_YOUR_JOINED_CAP,
  CIRCLE_DIR_SECTIONS,
} from '../utils/circleDirectory';

function filterByQuery(circles, query) {
  const q = query.trim().toLowerCase();
  if (!q) return circles;
  return circles.filter(
    (c) => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q),
  );
}

export default function CirclesDirectoryScreen({ navigation }) {
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
  const [allVisibleCount, setAllVisibleCount] = useState(CIRCLE_DIR_ALL_PAGE_SIZE);
  useLiveDataRefresh({ onFocus: true });

  const joinedSet = useMemo(() => new Set(state.joinedCircles), [state.joinedCircles]);
  const official = officialCircles();
  const joinedUser = joinedUserCirclesList();
  const users = userCircles();

  const yourFull = useMemo(
    () => filterByQuery(buildYourCirclesList(official, joinedUser), query),
    [official, joinedUser, query],
  );
  const officialFiltered = useMemo(
    () => filterByQuery(official, query),
    [official, query],
  );
  const joinedUserFiltered = useMemo(
    () => filterByQuery(joinedUser.filter((c) => c && !c.isOfficial), query),
    [joinedUser, query],
  );
  const yourPreview = useMemo(
    () => [...officialFiltered, ...joinedUserFiltered.slice(0, CIRCLE_DIR_YOUR_JOINED_CAP)],
    [officialFiltered, joinedUserFiltered],
  );
  const yourShowSeeAll = joinedUserFiltered.length > CIRCLE_DIR_YOUR_JOINED_CAP;

  const popularFull = useMemo(
    () => filterByQuery(buildPopularList(users, joinedSet, circleActivitySince), query),
    [users, joinedSet, circleActivitySince, query],
  );
  const popularPreview = useMemo(
    () => popularFull.slice(0, CIRCLE_DIR_SECTION_CAP),
    [popularFull],
  );
  const popularPreviewIds = useMemo(
    () => popularPreview.map((c) => c.id),
    [popularPreview],
  );

  const allFull = useMemo(
    () => filterByQuery(
      buildAllRemainingList(users, joinedSet, popularPreviewIds),
      query,
    ),
    [users, joinedSet, popularPreviewIds, query],
  );
  const allVisible = useMemo(
    () => allFull.slice(0, allVisibleCount),
    [allFull, allVisibleCount],
  );
  const hasMoreAll = allVisibleCount < allFull.length;

  const toggleJoin = useCallback((circleId) => {
    if (circleById(circleId)?.isOfficial) return;
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  }, [circleById, dispatch]);

  const openSeeAll = useCallback((sectionKey) => {
    navigate('CirclesSectionSeeAll', { sectionKey });
  }, [navigate]);

  const loadMoreAll = useCallback(() => {
    if (!hasMoreAll) return;
    setAllVisibleCount((n) => Math.min(n + CIRCLE_DIR_ALL_PAGE_SIZE, allFull.length));
  }, [hasMoreAll, allFull.length]);

  const onChangeQuery = useCallback((text) => {
    setQuery(text);
    setAllVisibleCount(CIRCLE_DIR_ALL_PAGE_SIZE);
  }, []);

  const renderRow = useCallback((circle) => (
    <CircleDirectoryRow
      key={circle.id}
      circle={circle}
      joined={isJoinedCircle(circle.id)}
      activity={circleActivitySince(circle.id)}
      showJoinControl={!circle.isOfficial}
      onPress={() => navigate('CircleDetail', { circleId: circle.id })}
      onToggleJoin={() => toggleJoin(circle.id)}
    />
  ), [circleActivitySince, isJoinedCircle, navigate, toggleJoin]);

  const searching = !!query.trim();
  const showYour = !searching || yourFull.length > 0;
  const showPopular = popularFull.length > 0;
  const showAllHeader = !searching || allFull.length > 0;

  const listHeader = useMemo(() => (
    <View>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search circles…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={onChangeQuery}
        />
      </View>

      {showYour ? (
        <View>
          <Text style={styles.sectionLabel}>YOUR CIRCLES</Text>
          {yourPreview.map((c) => renderRow(c))}
          {yourShowSeeAll ? (
            <Pressable
              style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.85 }]}
              onPress={() => openSeeAll(CIRCLE_DIR_SECTIONS.YOUR)}
            >
              <Text style={styles.seeAllText}>See all ({yourFull.length})</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.createLink, pressed && { opacity: 0.75 }]}
            onPress={() => navigate('CreateCircle')}
          >
            <Text style={styles.createLinkText}>Create a Circle</Text>
          </Pressable>
        </View>
      ) : null}

      {showPopular ? (
        <View>
          <Text style={styles.sectionLabel}>POPULAR</Text>
          {popularPreview.map((c) => renderRow(c))}
          {popularFull.length > CIRCLE_DIR_SECTION_CAP ? (
            <Pressable
              style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.85 }]}
              onPress={() => openSeeAll(CIRCLE_DIR_SECTIONS.POPULAR)}
            >
              <Text style={styles.seeAllText}>See all ({popularFull.length})</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showAllHeader ? (
        <Text style={styles.sectionLabel}>ALL</Text>
      ) : null}
    </View>
  ), [
    styles,
    colors.textFaint,
    query,
    onChangeQuery,
    showYour,
    yourPreview,
    yourShowSeeAll,
    yourFull.length,
    showPopular,
    popularPreview,
    popularFull.length,
    showAllHeader,
    renderRow,
    openSeeAll,
    navigate,
  ]);

  const listEmpty = !showYour && !showPopular && allVisible.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Circles</Text>
      </View>

      <FlatList
        data={allVisible}
        keyExtractor={(item) => `all:${item.id}`}
        ListHeaderComponent={listHeader}
        contentContainerStyle={listEmpty ? styles.listEmptyContent : styles.listContent}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMoreAll}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          listEmpty ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No circles match your search.</Text>
            </View>
          ) : allFull.length === 0 && showAllHeader ? (
            <View style={styles.sectionEmpty}>
              <Text style={styles.sectionEmptyText}>No more circles to browse.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          hasMoreAll ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={colors.primary} />
              <Pressable
                style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.85 }]}
                onPress={loadMoreAll}
              >
                <Text style={styles.seeAllText}>More</Text>
              </Pressable>
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
  topbar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: font.h2, fontWeight: '800', color: colors.text },
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
  listContent: { paddingBottom: 100 },
  listEmptyContent: { flexGrow: 1, paddingBottom: 100 },
  sectionLabel: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginLeft: spacing.lg + 4,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  seeAllBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  seeAllText: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
  createLink: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'flex-start',
  },
  createLinkText: {
    color: colors.textMuted,
    fontSize: font.caption,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textMuted },
  sectionEmpty: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.bgSunken,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionEmptyText: {
    color: colors.textMuted,
    fontSize: font.small,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: { paddingBottom: spacing.md, alignItems: 'center' },
});
