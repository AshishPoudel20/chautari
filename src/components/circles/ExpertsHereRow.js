import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { useTheme } from '../../theme/ThemeContext';
import { professionLabel } from '../../data/categories';

export default function ExpertsHereRow({ experts, onExpertPress }) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius, shadow), [colors, spacing, font, radius, shadow]);

  if (!experts?.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>EXPERTS HERE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {experts.map((u) => (
          <Pressable
            key={u.id}
            onPress={() => onExpertPress(u.id)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
          >
            <Avatar name={u.name} photo={u.photo} size={40} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{u.name.split(' ')[0]}</Text>
                <VerifiedBadge compact />
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>{professionLabel(u)}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  wrap: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.7,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  scroll: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    paddingRight: spacing.md,
    minWidth: 168,
    ...shadow.card,
  },
  info: { marginLeft: spacing.sm, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontWeight: '800', fontSize: font.small, color: colors.text, flexShrink: 1 },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: colors.bgSunken,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '700', maxWidth: 120 },
});
