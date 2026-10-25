import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

// Low-opacity Nepali geometric lattice for circle banners — quiet, never loud.
export default function MotifOverlay({ color, opacity = 0.1, style }) {
  const rows = 5;
  const cols = 7;
  const size = 10;
  const gap = 18;

  const diamonds = useMemo(() => {
    const items = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        items.push({ key: `${r}-${c}`, r, c });
      }
    }
    return items;
  }, []);

  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      {diamonds.map(({ key, r, c }) => (
        <View
          key={key}
          style={[
            styles.diamond,
            {
              width: size,
              height: size,
              left: c * (size + gap) + (r % 2 ? gap / 2 : 0),
              top: r * (size + gap),
              borderColor: color,
              opacity: (r + c) % 3 === 0 ? opacity : opacity * 0.55,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  diamond: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    borderRadius: 1.5,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
