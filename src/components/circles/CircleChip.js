import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { circleChipPresentation, resolveCircleAccent } from '../../data/circles';
import CircleIcon from './CircleIcon';

export default function CircleChip({
  circle, onPress, compact, showOfficial, variant = 'prominent',
}) {
  const { isDark, radius, font, colors } = useTheme();
  const pres = circle ? circleChipPresentation(circle, isDark, colors) : null;
  const accent = circle ? resolveCircleAccent(circle.accentId, isDark, colors.surface) : null;
  const styles = useMemo(() => createStyles(radius, font), [radius, font]);

  if (!circle || !pres) return null;

  const inner = variant === 'muted' ? (
    <View style={[
      styles.wrap,
      styles.wrapMuted,
      compact && styles.wrapCompact,
      { borderColor: colors.border },
    ]}>
      <View style={[styles.dot, { backgroundColor: accent.color }]} />
      <Text style={[styles.labelMuted, compact && styles.labelMutedCompact, { color: colors.textSecondary }]} numberOfLines={1}>
        {circle.name}
      </Text>
    </View>
  ) : (
    <View style={[
      styles.wrap,
      compact && styles.wrapCompact,
      { backgroundColor: pres.chipBackground, borderColor: pres.chipBorder },
    ]}>
      <CircleIcon circle={circle} size="chip" />
      <Text style={[styles.label, compact && styles.labelCompact, { color: pres.labelColor }]} numberOfLines={1}>
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
      <Pressable
        onPress={onPress}
        hitSlop={4}
        style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.85 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const createStyles = (radius, font) => StyleSheet.create({
  pressable: { alignSelf: 'flex-start' },
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, maxWidth: 200,
  },
  wrapMuted: { backgroundColor: 'transparent' },
  wrapCompact: { paddingHorizontal: 6, paddingVertical: 3, maxWidth: 170 },
  dot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  label: { fontSize: font.tiny, fontWeight: '800', flexShrink: 1 },
  labelCompact: { fontSize: 10 },
  labelMuted: { fontSize: 10, fontWeight: '600', flexShrink: 1 },
  labelMutedCompact: { fontSize: 9 },
  official: { marginLeft: 2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: radius.pill },
  officialText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
});
