import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useData, useSelectors } from '../data/store';
import { useNavigationGuard } from '../utils/navigation';
import { useTheme } from '../theme/ThemeContext';
import { circleAccentColor } from '../data/circles';
import CircleIcon from './CircleIcon';

export default function CirclesRecommendRow({ navigation, limit = 5 }) {
  const { dispatch } = useData();
  const { recommendedCircles, isJoinedCircle } = useSelectors();
  const { navigate } = useNavigationGuard(navigation);
  const { colors, spacing, font, radius, shadow, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  const circles = recommendedCircles(limit).filter((c) => !isJoinedCircle(c.id));
  if (!circles.length) return null;

  const join = (circleId) => {
    dispatch({ type: 'TOGGLE_JOIN_CIRCLE', circleId });
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Circles you might like</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {circles.map((c) => {
          const accent = circleAccentColor(c, isDark);
          return (
            <View key={c.id} style={styles.card}>
              <Pressable onPress={() => navigate('CircleDetail', { circleId: c.id })}>
                <CircleIcon circle={c} size="sm" style={styles.iconWrap} />
                <Text style={styles.name} numberOfLines={2}>{c.name}</Text>
                <Text style={styles.members}>{c.memberCount} members</Text>
                <Text style={styles.desc} numberOfLines={2}>{c.description}</Text>
              </Pressable>
              <Pressable
                onPress={() => join(c.id)}
                style={[styles.joinBtn, { borderColor: accent.color }]}
                hitSlop={4}
              >
                <Text style={[styles.joinText, { color: accent.color }]}>Join</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  wrap: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgSunken,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  scroll: { gap: spacing.sm, paddingRight: spacing.sm },
  card: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadow.card,
  },
  iconWrap: { marginBottom: 6 },
  name: { fontWeight: '800', fontSize: font.small, color: colors.text, lineHeight: 18 },
  members: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  desc: { fontSize: font.tiny, color: colors.textSecondary, lineHeight: 16, marginTop: 4, minHeight: 32 },
  joinBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  joinText: { fontSize: font.tiny, fontWeight: '800' },
});
