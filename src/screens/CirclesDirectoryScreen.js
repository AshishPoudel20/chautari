import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import { resolveCircleAccent } from '../data/circles';
import CircleIcon from '../components/CircleIcon';

function CircleRow({ circle, joined, onPress, onToggleJoin, isDark, styles, colors }) {
  const accent = resolveCircleAccent(circle.accentId, isDark, colors.surface);
  const activity = circle._activity || 0;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}
      onPress={onPress}
    >
      <CircleIcon circle={circle} size="md" />
      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{circle.name}</Text>
          {circle.isOfficial ? (
            <View style={[styles.official, { backgroundColor: accent.color }]}>
              <Text style={[styles.officialText, { color: accent.onAccent }]}>Official</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.desc} numberOfLines={1}>{circle.description}</Text>
        <Text style={styles.meta}>
          {circle.memberCount} members
          {activity > 0 ? ` · ${activity} new today` : ''}
        </Text>
      </View>
      <Pressable
        onPress={(e) => { e.stopPropagation?.(); onToggleJoin(); }}
        style={[styles.joinBtn, joined && styles.joinBtnActive]}
        hitSlop={8}
      >
        <Text style={[styles.joinText, joined && styles.joinTextActive]}>{joined ? 'Joined' : 'Join'}</Text>
      </Pressable>
    </Pressable>
  );
}

export default function CirclesDirectoryScreen({ navigation }) {
  const { dispatch } = useData();
  const {
    joinedCirclesList, officialCircles, userCircles, isJoinedCircle, circleActivitySince,
  } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius, shadow, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);
  const [query, setQuery] = useState('');

  const withActivity = (list) =>
    list.map((c) => ({ ...c, _activity: isJoinedCircle(c.id) ? circleActivitySince(c.id) : 0 }));

  const filterList = (list) => {
    const q = query.trim().toLowerCase();
    if (!q) return withActivity(list);
    return withActivity(list.filter((c) =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    ));
  };

  const your = filterList(joinedCirclesList());
  const official = filterList(officialCircles());
  const popular = filterList([...userCircles()].sort((a, b) => b.memberCount - a.memberCount));
  const newest = filterList([...userCircles()].sort((a, b) => b.createdAt - a.createdAt));

  const sections = useMemo(() => {
    const s = [];
    if (your.length) s.push({ title: 'Your Circles', data: your });
    if (official.length) s.push({ title: 'Official', data: official });
    if (popular.length) s.push({ title: 'Popular', data: popular });
    if (newest.length) s.push({ title: 'New circles', data: newest });
    return s;
  }, [your, official, popular, newest]);

  const toggleJoin = (circleId) => {
    const was = isJoinedCircle(circleId);
    if (was && joinedCirclesList().length <= 1) {
      Alert.alert('Keep one circle', 'Stay in at least one circle so your feed never feels empty.');
      return;
    }
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  };

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
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={(
          <Pressable style={styles.createRow} onPress={() => navigate('CreateCircle')}>
            <Text style={styles.createText}>＋ Create a Circle</Text>
          </Pressable>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
        )}
        renderItem={({ item }) => (
          <CircleRow
            circle={item}
            joined={isJoinedCircle(item.id)}
            isDark={isDark}
            styles={styles}
            colors={colors}
            onPress={() => navigate('CircleDetail', { circleId: item.id })}
            onToggleJoin={() => toggleJoin(item.id)}
          />
        )}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No circles match your search.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topbar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: font.h2, fontWeight: '800', color: colors.text },
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  search: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 11, color: colors.text, fontSize: font.body },
  createRow: { marginHorizontal: spacing.lg, marginBottom: spacing.md, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, borderStyle: 'dashed' },
  createText: { color: colors.textMuted, fontWeight: '700', fontSize: font.small },
  sectionLabel: { fontSize: font.tiny, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8, marginLeft: spacing.lg + 4, marginTop: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  rowBody: { flex: 1, marginLeft: spacing.md, marginRight: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: font.body, fontWeight: '800', color: colors.text, flexShrink: 1 },
  official: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  officialText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  desc: { fontSize: font.caption, color: colors.textMuted, marginTop: 2 },
  meta: { fontSize: font.tiny, color: colors.textFaint, marginTop: 4, fontWeight: '600' },
  joinBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary },
  joinBtnActive: { backgroundColor: colors.primaryTint, borderColor: colors.primary },
  joinText: { fontSize: font.tiny, fontWeight: '800', color: colors.primary },
  joinTextActive: { color: colors.primaryDark },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: colors.textMuted },
});
