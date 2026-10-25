import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import CircleIcon from './CircleIcon';
import { useTheme } from '../../theme/ThemeContext';

export default function CircleDirectoryRow({
  circle,
  joined,
  activity = 0,
  onPress,
  onToggleJoin,
  showJoinControl = true,
}) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, shadow),
    [colors, spacing, font, radius, shadow],
  );

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
            <View style={styles.official}>
              <Text style={styles.officialText}>Official</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.desc} numberOfLines={1}>{circle.description}</Text>
        <Text style={styles.meta}>
          {circle.memberCount} members
          {activity > 0 ? ` · ${activity} new today` : ''}
        </Text>
      </View>
      {showJoinControl && !circle.isOfficial ? (
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); onToggleJoin?.(); }}
          style={[styles.joinBtn, joined && styles.joinBtnActive]}
          hitSlop={8}
        >
          <Text style={[styles.joinText, joined && styles.joinTextActive]}>{joined ? 'Joined' : 'Join'}</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  rowBody: { flex: 1, marginLeft: spacing.md, marginRight: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: font.body, fontWeight: '800', color: colors.text, flexShrink: 1 },
  official: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.verifiedTint,
    borderWidth: 1,
    borderColor: colors.verified,
  },
  officialText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
    color: colors.verified,
  },
  desc: { fontSize: font.caption, color: colors.textMuted, marginTop: 2 },
  meta: { fontSize: font.tiny, color: colors.textFaint, marginTop: 4, fontWeight: '600' },
  joinBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary },
  joinBtnActive: { backgroundColor: colors.primaryTint, borderColor: colors.primary },
  joinText: { fontSize: font.tiny, fontWeight: '800', color: colors.primary },
  joinTextActive: { color: colors.primaryDark },
});
