import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/** Hot | New segmented control — For You tab only. */
export default function FeedSortToggle({ mode, onChange }) {
  const { colors, shadow, spacing, font, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, shadow, spacing, font, radius),
    [colors, shadow, spacing, font, radius],
  );

  return (
    <View style={styles.wrap}>
      {[['hot', 'Hot'], ['new', 'New']].map(([key, label]) => (
        <Pressable
          key={key}
          onPress={() => onChange(key)}
          style={[styles.btn, mode === key && styles.btnActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === key }}
        >
          <Text style={[styles.text, mode === key && styles.textActive]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors, shadow, spacing, font, radius) => StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.bgSunken,
    borderRadius: radius.pill,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: 3,
  },
  btn: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: radius.pill },
  btnActive: { backgroundColor: colors.surface, ...shadow.card },
  text: { fontWeight: '800', color: colors.textMuted, fontSize: font.tiny },
  textActive: { color: colors.primary },
});
