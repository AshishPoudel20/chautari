import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

/** Read-only confirmation — profile values only, never editable in composer. */
export default function ExpertProfessionalConfirm({
  circleName,
  badgeTitle,
  compact = false,
  reply = false,
}) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, compact),
    [colors, spacing, font, radius, compact],
  );

  if (!badgeTitle) return null;
  if (!reply && !circleName) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        {reply ? (
          <>Replying as <Text style={styles.strong}>{badgeTitle}</Text></>
        ) : (
          <>
            Posting to <Text style={styles.strong}>{circleName}</Text>
            {' as '}
            <Text style={styles.strong}>{badgeTitle}</Text>
          </>
        )}
      </Text>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, compact) => StyleSheet.create({
  wrap: {
    backgroundColor: colors.secondaryTint,
    borderRadius: radius.md,
    paddingVertical: compact ? spacing.sm : spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.expertMarkerBorder,
    marginBottom: compact ? spacing.sm : spacing.lg,
  },
  text: { fontSize: font.caption, color: colors.text, lineHeight: 20 },
  strong: { fontWeight: '800', color: colors.secondaryDark },
});
