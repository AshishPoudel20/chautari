import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// Tasteful entrance: fade in + slight rise. Staggered by `index` so a feed of
// cards cascades in (~250ms each). Never bouncy/childish — just enough to signal
// freshness (Build Brief v2). Respects an optional `disabled` to skip animation.
export function FadeRise({ index = 0, children, style, distance = 12, duration = 220, stagger = 50, disabled, replayKey = 0 }) {
  const v = useRef(new Animated.Value(disabled ? 1 : 0)).current;

  useEffect(() => {
    if (disabled) return;
    v.setValue(0);
    const anim = Animated.timing(v, {
      toValue: 1,
      duration,
      delay: Math.min(index, 8) * stagger, // cap the cascade so later cards aren't slow
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [disabled, replayKey, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// A soft, slow pulsing dot — the quiet "live" texture on the For You tab.
// Subtle, not a casino: gentle opacity + scale breathing.
export function PulseDot({ size = 8, color, style }) {
  const { colors } = useTheme();
  const dotColor = color ?? colors.live;
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColor,
          opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
          transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
        },
        style,
      ]}
    />
  );
}
