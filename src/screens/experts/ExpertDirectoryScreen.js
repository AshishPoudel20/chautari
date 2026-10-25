import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import FollowButton from '../../components/profile/FollowButton';
import { Chip, EmptyState } from '../../components/common/ui';
import { useSelectors } from '../../data/store';
import { CATEGORIES, SUBURBS, professionLabel } from '../../data/categories';
import { useTheme } from '../../theme/ThemeContext';
import { compactNumber } from '../../utils/format';
import { useNavigationGuard, openExpertProfile, isSelfUserId } from '../../utils/navigation';

// Expert Directory: browse all verified experts, filter by category + suburb.
export default function ExpertDirectoryScreen({ navigation }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const { experts, state } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const [category, setCategory] = useState(null);
  const [suburb, setSuburb] = useState(null);

  const list = useMemo(() => {
    return experts().filter((e) => {
      if (category && e.verifiedCategory !== category) return false;
      if (suburb && e.suburb !== suburb) return false;
      return true;
    });
  }, [category, suburb, experts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Verified Experts</Text>
        <Text style={styles.sub}>Migration agents, accountants, GPs and more — verified for the community.</Text>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
          <Chip label="All" active={!category} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <Chip key={c.id} label={c.name} active={category === c.id} onPress={() => setCategory(category === c.id ? null : c.id)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowChips}>
          <Chip label="Any suburb" active={!suburb} onPress={() => setSuburb(null)} />
          {SUBURBS.map((s) => (
            <Chip key={s} label={s} active={suburb === s} onPress={() => setSuburb(suburb === s ? null : s)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm }}
        ListEmptyComponent={<EmptyState icon="🔍" title="No experts match" subtitle="Try clearing a filter." />}
        renderItem={({ item }) => {
          const isSelf = isSelfUserId(item.id, state.authUserId);
          return (
          <View style={styles.card}>
            <Pressable
              style={styles.cardInfo}
              onPress={() => openExpertProfile(navigation, {
                userId: item.id,
                title: item.name,
                authUserId: state.authUserId,
                navigate,
              })}
            >
              <Avatar name={item.name} photo={item.photo} size={52} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <VerifiedBadge compact />
                  {isSelf ? <Text style={styles.youPill}>You</Text> : null}
                </View>
                <Text style={styles.profession} numberOfLines={1}>{professionLabel(item)}</Text>
                <Text style={styles.meta}>{item.suburb} · {compactNumber(item.followers)} followers</Text>
              </View>
            </Pressable>
            {isSelf ? null : <FollowButton userId={item.id} size="sm" />}
          </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.caption, color: colors.textMuted, marginTop: 4, lineHeight: 19 },
  rowChips: { paddingHorizontal: spacing.lg, paddingVertical: 6 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadow.card },
  cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  youPill: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  name: { fontWeight: '800', fontSize: font.body, color: colors.text, flexShrink: 1 },
  profession: { color: colors.primary, fontWeight: '700', fontSize: font.caption, marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: font.tiny, marginTop: 2 },
});
