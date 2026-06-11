import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { circleAccentColor, circleIconPresentation } from '../data/circles';
import CircleIcon from './CircleIcon';

export default function CircleChip({ circle, onPress, compact, showOfficial }) {
  const { isDark, radius, font, colors } = useTheme();
  const accent = circle ? circleAccentColor(circle, isDark) : null;
  const pres = circle ? circleIconPresentation(circle, isDark, colors.borderStrong) : null;
  const styles = useMemo(() => createStyles(radius, font), [radius, font]);

  if (!circle) return null;

  const inner = (
    <View style={[styles.wrap, compact && styles.wrapCompact, { borderColor: pres.labelColor + (isDark ? '66' : '44') }]}>
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
      <Pressable onPress={onPress} hitSlop={6} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const createStyles = (radius, font) => StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, maxWidth: 200,
  },
  wrapCompact: { paddingHorizontal: 6, paddingVertical: 3, maxWidth: 170 },
  label: { fontSize: font.tiny, fontWeight: '800', flexShrink: 1 },
  labelCompact: { fontSize: 10 },
  official: { marginLeft: 2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: radius.pill },
  officialText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.3 },
});
