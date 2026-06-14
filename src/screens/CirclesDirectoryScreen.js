import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CircleDirectoryRow from '../components/CircleDirectoryRow';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import { buildDirectorySections } from '../utils/circleDirectory';

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

  const listCtx = useMemo(() => ({
    joinedUserCircles: joinedUserCirclesList(),
    officialCircles: officialCircles(),
    userCircles: userCircles(),
    joinedIds: state.joinedCircles,
    activitySince: circleActivitySince,
    query,
  }), [joinedUserCirclesList, officialCircles, userCircles, state.joinedCircles, circleActivitySince, query]);

  const sections = useMemo(
    () => buildDirectorySections(listCtx),
    [listCtx],
  );

  const toggleJoin = useCallback((circleId) => {
    if (circleById(circleId)?.isOfficial) return;
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  }, [circleById, dispatch]);

  const openSeeAll = useCallback((sectionKey) => {
    navigate('CirclesSectionSeeAll', { sectionKey });
  }, [navigate]);

  const renderRow = useCallback(({ item }) => (
    <CircleDirectoryRow
      circle={item}
      joined={isJoinedCircle(item.id)}
      activity={circleActivitySince(item.id)}
      showJoinControl={!item.isOfficial}
      onPress={() => navigate('CircleDetail', { circleId: item.id })}
      onToggleJoin={() => toggleJoin(item.id)}
    />
  ), [circleActivitySince, isJoinedCircle, navigate, toggleJoin]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topbar}>
        <Text style={styles.title}>Circles</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search circles…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={sections.length ? styles.listContent : styles.listEmptyContent}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
        )}
        renderSectionFooter={({ section }) => (
          <>
            {section.emptyHint ? (
              <View style={styles.sectionEmpty}>
                <Text style={styles.sectionEmptyText}>{section.emptyHint}</Text>
              </View>
            ) : null}
            {section.showSeeAll ? (
              <Pressable
                style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.85 }]}
                onPress={() => openSeeAll(section.key)}
              >
                <Text style={styles.seeAllText}>See all ({section.totalCount})</Text>
              </Pressable>
            ) : null}
          </>
        )}
        renderItem={renderRow}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No circles match your search.</Text>
          </View>
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
  listEmptyContent: { flexGrow: 1 },
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
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  seeAllText: { color: colors.primary, fontWeight: '800', fontSize: font.caption },
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
  sectionEmptyText: { color: colors.textMuted, fontSize: font.small, textAlign: 'center', lineHeight: 20 },
});
