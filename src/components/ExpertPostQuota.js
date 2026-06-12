import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelectors } from '../data/store';
import { useTheme } from '../theme/ThemeContext';

// Surfaces the verified-expert daily post cap (2/day) wherever experts compose or review posts.
export default function ExpertPostQuota({ variant = 'banner' }) {
  const { me, expertPostsToday, expertPostsRemaining, expertDailyPostLimit } = useSelectors();
  const { colors, spacing, font, radius } = useTheme();
  const user = me();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  if (!user?.verified) return null;

  const used = expertPostsToday();
  const limit = expertDailyPostLimit;
  const remaining = expertPostsRemaining();
  const atLimit = remaining === 0;

  if (variant === 'inline') {
    return (
      <Text style={[styles.inline, atLimit && styles.inlineLimit]}>
        {used}/{limit} posts used today{atLimit ? ' · resets tomorrow' : ` · ${remaining} left`}
      </Text>
    );
  }

  return (
    <View style={[styles.banner, atLimit && styles.bannerLimit]}>
      <View style={styles.bannerTop}>
        <Text style={styles.bannerTitle}>Expert daily posting</Text>
        <Text style={[styles.bannerCount, atLimit && styles.bannerCountLimit]}>
          {used}/{limit}
        </Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: limit }, (_, i) => (
          <View
            key={i}
            style={[styles.slot, i < used ? (atLimit ? styles.slotUsedLimit : styles.slotUsed) : styles.slotEmpty]}
          />
        ))}
      </View>
      <Text style={[styles.bannerSub, atLimit && styles.bannerSubLimit]}>
        {atLimit
          ? 'Daily limit reached — you can post again tomorrow.'
          : `${remaining} post${remaining === 1 ? '' : 's'} remaining today`}
      </Text>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  banner: {
    backgroundColor: colors.verifiedTint,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.expertCardBorder,
    marginBottom: spacing.lg,
  },
  bannerLimit: {
    backgroundColor: colors.dangerTint,
    borderColor: colors.danger,
  },
  bannerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bannerTitle: { fontWeight: '800', color: colors.verified, fontSize: font.small },
  bannerCount: { fontWeight: '900', color: colors.verified, fontSize: font.body },
  bannerCountLimit: { color: colors.danger },
  track: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  slot: { flex: 1, height: 6, borderRadius: 3 },
  slotUsed: { backgroundColor: colors.verified },
  slotUsedLimit: { backgroundColor: colors.danger },
  slotEmpty: { backgroundColor: colors.borderStrong, opacity: 0.45 },
  bannerSub: { marginTop: spacing.sm, fontSize: font.caption, color: colors.textSecondary, lineHeight: 18 },
  bannerSubLimit: { color: colors.danger, fontWeight: '700' },
  inline: { color: colors.verified, fontWeight: '600' },
  inlineLimit: { color: colors.danger },
});
