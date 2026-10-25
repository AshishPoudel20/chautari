import React, { useMemo } from 'react';
import { Text, Pressable, ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// Primary / secondary / ghost / danger button with disabled + loading states.
export default function Button({ title, onPress, variant = 'primary', disabled, loading, style, icon, size = 'md' }) {
  const { colors, radius, spacing, font, shadow } = useTheme();
  const styles = useMemo(() => createStyles(colors, radius, spacing, font, shadow), [colors, radius, spacing, font, shadow]);
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const filled = isPrimary || isDanger;
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        isOutline && styles.outline,
        isDanger && styles.danger,
        filled && !disabled && shadow.card,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? colors.onPrimary : colors.primary} />
      ) : (
        <View style={styles.row}>
          {icon ? <Text style={[styles.icon, !filled && { color: colors.primary }]}>{icon}  </Text> : null}
          <Text
            style={[
              styles.text,
              size === 'sm' && styles.textSm,
              (isGhost || isSecondary || isOutline) && { color: colors.primary },
              isDanger && { color: colors.onPrimary },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const createStyles = (colors, radius, spacing, font, shadow) => StyleSheet.create({
  base: { paddingVertical: 15, paddingHorizontal: spacing.lg, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  sm: { paddingVertical: 10, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryTint },
  ghost: { backgroundColor: 'transparent' },
  outline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  text: { color: colors.onPrimary, fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },
  textSm: { fontSize: font.caption },
  icon: { fontSize: 16, color: colors.onPrimary },
});
