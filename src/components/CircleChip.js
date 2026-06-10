import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { circleAccentColor } from '../data/circles';

export default function CircleChip({ circle, onPress, compact, showOfficial }) {
  const { isDark, radius, font } = useTheme();
  const accent = circle ? circleAccentColor(circle, isDark) : null;
  const styles = useMemo(() => createStyles(radius, font), [radius, font]);

  if (!circle) return null;

  const inner = (
    <View style={[styles.wrap, compact && styles.wrapCompact, { backgroundColor: `${accent.color}22`, borderColor: `${accent.color}55` }]}>
      {circle.icon ? <Text style={[styles.icon, compact && styles.iconCompact]}>{circle.icon}</Text> : null}
      <Text style={[styles.label, compact && styles.labelCompact, { color: accent.color }]} numberOfLines={1}>
        {circle.name}
      </Text>
      {showOfficial && circle.isOfficial ? (
        <View style={[styles.official, { backgroundColor: accent.color }]}>
          <Text style={[styles.officialText, { color: accent.onAccent }]}>Official</Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const createStyles = (radius, font) => StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, maxWidth: 200,
  },
  wrapCompact: { paddingHorizontal: 8, paddingVertical: 3, maxWidth: 170 },
  icon: { fontSize: 12 },
  iconCompact: { fontSize: 10 },
  label: { fontSize: font.tiny, fontWeight: '800', flexShrink: 1 },
  labelCompact: { fontSize: 10 },
  official: { marginLeft: 2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: radius.pill },
  officialText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
});
