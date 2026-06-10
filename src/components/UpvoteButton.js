import React, { useRef, useEffect, useMemo } from 'react';
import { Animated, Pressable, Text, StyleSheet, Easing, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { compactNumber, milestoneCrossed } from '../utils/format';

// Instant, tactile upvote — isolated tap target (min 44×44), never bubbles to parent cards.
export default function UpvoteButton({ count = 0, active, onToggle, size = 'md' }) {
  const { colors, radius, font } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const prev = useRef(count);
  const styles = useMemo(() => createStyles(colors, radius, font), [colors, radius, font]);

  useEffect(() => {
    if (milestoneCrossed(prev.current, count)) {
      flash.setValue(0);
      Animated.timing(flash, { toValue: 1, duration: 650, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }
    prev.current = count;
  }, [count, flash]);

  const press = (e) => {
    e?.stopPropagation?.();
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.86, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start();
    onToggle?.();
  };

  const small = size === 'sm';

  return (
    <Pressable
      onPress={press}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.hitArea}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove upvote' : 'Upvote'}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View style={[styles.pill, small && styles.pillSm, active && styles.pillActive]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.flash,
              {
                opacity: flash.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.55, 0] }),
                transform: [{ scale: flash.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.6] }) }],
              },
            ]}
          />
          <Text style={[styles.caret, small && styles.caretSm, active && styles.textActive]}>▲</Text>
          <Text style={[styles.count, small && styles.countSm, active && styles.textActive]}>
            {compactNumber(count)}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const createStyles = (colors, radius, font) => StyleSheet.create({
  hitArea: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'flex-start' },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: colors.borderStrong, backgroundColor: colors.surface,
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: radius.pill, overflow: 'hidden',
  },
  pillSm: { paddingHorizontal: 9, paddingVertical: 4, gap: 4, borderWidth: 1 },
  pillActive: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  flash: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: colors.secondary, borderRadius: radius.pill,
  },
  caret: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  caretSm: { fontSize: 9 },
  count: { color: colors.textMuted, fontSize: font.caption, fontWeight: '800' },
  countSm: { fontSize: font.tiny },
  textActive: { color: colors.primary },
});
