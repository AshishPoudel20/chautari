import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Linking } from 'react-native';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import KarmaBadge from './KarmaBadge';
import FoundingMemberBadge from './FoundingMemberBadge';
import Button from './Button';
import QuestionCard from './QuestionCard';
import { EmptyState } from './ui';
import { useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { categoryName } from '../data/categories';
import { compactNumber } from '../utils/format';
import { useTheme } from '../theme/ThemeContext';

// Shared profile layout for My / Other / Expert profiles.
// `actions` is rendered under the stats row; `mode` tweaks copy.
export default function ProfileView({ userId, navigation, actions, showFollowers }) {
  const { userById, circleById, questionsByAuthor, answerCount, state, expertAnswerOn, karmaFor } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const { colors, spacing, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font), [colors, spacing, font]);
  const user = userById(userId);
  if (!user) return <EmptyState icon="👻" title="User not found" />;

  const posts = questionsByAuthor(userId);
  const followingCount = userId === 'me' ? state.following.length : Math.round((user.followers || 0) * 0.4);

  const header = (
    <View>
      <View style={styles.top}>
        <Avatar name={user.name} photo={user.photo} size={84} />
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {user.verified ? <VerifiedBadge /> : null}
          {user.isFoundingMember ? <FoundingMemberBadge /> : null}
          <KarmaBadge karma={karmaFor(userId)} />
        </View>
        {user.profession ? <Text style={styles.profession}>{user.profession}{user.verifiedCategory ? ` · ${categoryName(user.verifiedCategory)}` : ''}</Text> : null}
        {user.suburb ? <Text style={styles.suburb}>📍 {user.suburb}</Text> : null}
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          {showFollowers !== false && (
            <View style={styles.stat}>
              <Text style={styles.statNum}>{compactNumber(user.followers || 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statNum}>{compactNumber(followingCount)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {user.verified && user.contact ? (
          <Button
            title="Contact"
            icon="✉️"
            variant="secondary"
            style={{ marginTop: spacing.md }}
            onPress={() => Linking.openURL(user.contact).catch(() => {})}
          />
        ) : null}

        {actions}
      </View>
      <Text style={styles.postsHeading}>{userId === 'me' ? 'Your posts' : 'Posts'}</Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }) => (
      <QuestionCard
        question={item}
        author={user}
        circle={circleById(item.circleId)}
        answerCount={answerCount(item)}
        onCirclePress={() => navigate('CircleDetail', { circleId: item.circleId })}
        expert={expertAnswerOn(item)?.expert || null}
        onPress={() => navigate('QuestionDetail', { questionId: item.id })}
      />
    ),
    [user, circleById, answerCount, expertAnswerOn, navigate],
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={posts}
      keyExtractor={(q) => q.id}
      ListHeaderComponent={header}
      renderItem={renderItem}
      ListEmptyComponent={<EmptyState icon="📝" title="No posts yet" subtitle={userId === 'me' ? 'Questions you ask will show up here.' : 'This person has not posted publicly yet.'} />}
      contentContainerStyle={{ paddingBottom: 40 }}
      initialNumToRender={6}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const createStyles = (colors, spacing, font) => StyleSheet.create({
  top: { backgroundColor: colors.surface, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.md, flexWrap: 'wrap', justifyContent: 'center' },
  name: { fontSize: font.h2, fontWeight: '800', color: colors.text },
  profession: { color: colors.primary, fontWeight: '700', fontSize: font.small, marginTop: 4 },
  suburb: { color: colors.textMuted, fontSize: font.small, marginTop: 4 },
  bio: { color: colors.text, fontSize: font.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20, paddingHorizontal: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.lg },
  stat: { alignItems: 'center', minWidth: 64 },
  statNum: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: font.tiny, color: colors.textMuted, marginTop: 2 },
  postsHeading: { fontSize: font.h3, fontWeight: '700', color: colors.text, padding: spacing.lg, paddingBottom: spacing.sm },
});
