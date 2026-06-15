import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelectors } from '../data/store';
import { useTheme } from '../theme/ThemeContext';

function QuotaLine({ text, atLimit, styles }) {
  return (
    <Text style={[styles.line, atLimit && styles.lineLimit]}>{text}</Text>
  );
}

// Surfaces verified-expert daily caps: 2 professional + 5 member posts per day.
export default function ExpertPostQuota({ variant = 'banner' }) {
  const {
    me,
    expertProfessionalPostsToday,
    expertDailyPostLimit,
    memberPostsToday,
    memberDailyPostLimit,
  } = useSelectors();
  const { colors, spacing, font, radius } = useTheme();
  const user = me();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  if (!user?.verified) return null;

  const proUsed = expertProfessionalPostsToday();
  const memberUsed = memberPostsToday();
  const proLimit = expertDailyPostLimit;
  const memberLimit = memberDailyPostLimit;
  const proAtLimit = proUsed >= proLimit;
  const memberAtLimit = memberUsed >= memberLimit;
  const bothAtLimit = proAtLimit && memberAtLimit;

  const proLine = `${proUsed}/${proLimit} professional posts today`;
  const memberLine = `${memberUsed}/${memberLimit} posts today`;

  if (variant === 'inline') {
    return (
      <Text style={[styles.inline, bothAtLimit && styles.inlineLimit]}>
        {proLine} · {memberLine}{bothAtLimit ? ' · resets tomorrow' : ''}
      </Text>
    );
  }

  return (
    <View style={[styles.banner, bothAtLimit && styles.bannerLimit]}>
      <Text style={styles.bannerHeading}>Daily posting limits</Text>
      <QuotaLine text={proLine} atLimit={proAtLimit} styles={styles} />
      <QuotaLine text={memberLine} atLimit={memberAtLimit} styles={styles} />
      {bothAtLimit ? (
        <Text style={styles.bannerSubLimit}>Both limits reached — you can post again tomorrow.</Text>
      ) : null}
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
    gap: spacing.xs,
  },
  bannerLimit: {
    backgroundColor: colors.dangerTint,
    borderColor: colors.danger,
  },
  bannerHeading: { fontWeight: '800', color: colors.verified, fontSize: font.small, marginBottom: spacing.xs },
  line: { fontWeight: '700', color: colors.textSecondary, fontSize: font.caption, lineHeight: 20 },
  lineLimit: { color: colors.danger },
  bannerSubLimit: { marginTop: spacing.xs, fontSize: font.caption, color: colors.danger, fontWeight: '700', lineHeight: 18 },
  inline: { color: colors.verified, fontWeight: '600' },
  inlineLimit: { color: colors.danger },
});
