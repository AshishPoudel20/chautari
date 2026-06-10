import React, { useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import QuestionFeedList from '../components/QuestionFeedList';
import { EmptyState } from '../components/ui';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import { circleAccentColor } from '../data/circles';

export default function CircleDetailScreen({ navigation, route }) {
  const circleId = route.params?.circleId;
  const { dispatch } = useData();
  const {
    circleById, isJoinedCircle, questionsInCircle, hasUpvotedQuestion, joinedCirclesList,
  } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius, shadow, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const circle = circleById(circleId);
  const joined = isJoinedCircle(circleId);
  const data = questionsInCircle(circleId);
  const accent = circle ? circleAccentColor(circle, isDark) : null;

  useLayoutEffect(() => {
    navigation.setOptions({ title: circle?.name || 'Circle' });
  }, [navigation, circle?.name]);

  const toggleJoin = () => {
    if (joined && joinedCirclesList().length <= 1) {
      Alert.alert('Keep one circle', 'Stay in at least one circle so your feed never feels empty.');
      return;
    }
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  };

  if (!circle) {
    return (
      <View style={styles.container}>
        <Text style={styles.missing}>This circle is no longer available.</Text>
      </View>
    );
  }

  const header = (
    <View style={[styles.header, { borderBottomColor: accent.color }]}>
      <View style={[styles.accentBar, { backgroundColor: accent.color }]} />
      <View style={styles.headerTop}>
        <Text style={styles.headerIcon}>{circle.icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>{circle.name}</Text>
            {circle.isOfficial ? (
              <View style={[styles.official, { backgroundColor: accent.color }]}>
                <Text style={[styles.officialText, { color: accent.onAccent }]}>Official</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.members}>{circle.memberCount} members</Text>
        </View>
        <Pressable onPress={toggleJoin} style={[styles.joinBtn, joined && { backgroundColor: colors.primaryTint }]}>
          <Text style={[styles.joinText, { color: accent.color }]}>{joined ? 'Joined' : 'Join'}</Text>
        </Pressable>
      </View>
      <Text style={styles.desc}>{circle.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <QuestionFeedList
        data={data}
        navigation={navigation}
        ListHeaderComponent={header}
        onUpvoteToggle={(id) => dispatch({ type: 'TOGGLE_UPVOTE_QUESTION', questionId: id })}
        hasUpvotedQuestion={hasUpvotedQuestion}
        ListEmptyComponent={(
          <EmptyState
            icon={circle.icon}
            title="Be the first to ask"
            subtitle={`Start the conversation in ${circle.name}.`}
            action={{
              label: `Ask in ${circle.name.split(' ')[0]}`,
              onPress: () => navigate('AskComposer', { circleId }),
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 110 }}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, { backgroundColor: accent.color }, pressed && { opacity: 0.9 }]}
        onPress={() => navigate('AskComposer', { circleId })}
      >
        <Text style={[styles.fabText, { color: accent.onAccent }]}>＋ Ask</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  missing: { padding: spacing.xl, color: colors.textMuted, textAlign: 'center' },
  header: { backgroundColor: colors.surface, padding: spacing.lg, borderBottomWidth: 2, marginBottom: spacing.sm },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerIcon: { fontSize: 36 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  headerTitle: { fontSize: font.h2, fontWeight: '800', color: colors.text, flexShrink: 1 },
  official: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  officialText: { fontSize: font.tiny, fontWeight: '900', letterSpacing: 0.3 },
  members: { fontSize: font.caption, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border },
  joinText: { fontWeight: '800', fontSize: font.caption },
  desc: { fontSize: font.body, color: colors.textSecondary, lineHeight: 22, marginTop: spacing.md },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, paddingHorizontal: 22, paddingVertical: 14, borderRadius: radius.pill, ...shadow.floating },
  fabText: { fontWeight: '800', fontSize: font.bodyLg },
});
