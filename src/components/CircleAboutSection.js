import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { formatShortDate } from '../utils/format';

const DESC_COLLAPSE = 120;

export default function CircleAboutSection({ circle, creator, onCreatorPress }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);
  const [expanded, setExpanded] = useState(false);

  const desc = circle.description?.trim() || '';
  const long = desc.length > DESC_COLLAPSE;
  const shown = long && !expanded ? `${desc.slice(0, DESC_COLLAPSE).trim()}…` : desc;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>About</Text>
      {desc ? (
        <Text style={styles.desc}>
          {shown}
          {long ? (
            <Text style={styles.more} onPress={() => setExpanded((v) => !v)}>
              {expanded ? ' less' : ' more'}
            </Text>
          ) : null}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        {creator ? (
          <Pressable onPress={onCreatorPress} hitSlop={6}>
            <Text style={styles.meta}>
              Created by <Text style={styles.link}>{creator.name}</Text>
            </Text>
          </Pressable>
        ) : circle.isOfficial ? (
          <Text style={styles.meta}>Curated by Chautari</Text>
        ) : null}
        {circle.createdAt ? (
          <Text style={styles.metaDot}>· {formatShortDate(circle.createdAt)}</Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { fontSize: font.tiny, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.6, marginBottom: spacing.sm },
  desc: { fontSize: font.body, color: colors.textSecondary, lineHeight: 22 },
  more: { color: colors.primary, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: spacing.sm },
  meta: { fontSize: font.caption, color: colors.textMuted, fontWeight: '600' },
  metaDot: { fontSize: font.caption, color: colors.textMuted, fontWeight: '600' },
  link: { color: colors.primary, fontWeight: '800' },
});
