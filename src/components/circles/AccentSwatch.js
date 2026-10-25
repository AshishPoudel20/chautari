import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { accentSwatchPresentation } from '../../data/circles';

export default function AccentSwatch({ accentId, selected, onPress }) {
  const { isDark, colors } = useTheme();
  const pres = useMemo(
    () => accentSwatchPresentation(accentId, isDark, colors),
    [accentId, isDark, colors],
  );

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.swatch,
        {
          backgroundColor: pres.backgroundColor,
          borderColor: selected ? colors.text : pres.borderColor,
          borderWidth: selected ? 2.5 : pres.borderWidth,
        },
        selected && styles.selected,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  swatch: { width: 36, height: 36, borderRadius: 18 },
  selected: { transform: [{ scale: 1.08 }] },
});
