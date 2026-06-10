import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useTheme } from '../theme/ThemeContext';

// Keeps footer actions (submit buttons) above the keyboard on iOS/Android.
export default function KeyboardScreen({
  children,
  footer = null,
  edges = ['bottom'],
  style,
  contentStyle,
  scroll = true,
  keyboardOffset,
  safe = true,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const headerHeight = useHeaderHeight();
  const offset = keyboardOffset ?? (Platform.OS === 'ios' ? headerHeight : 0);

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
  );

  const inner = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.fill}
      keyboardVerticalOffset={offset}
    >
      {body}
      {footer}
    </KeyboardAvoidingView>
  );

  if (!safe) {
    return <View style={[styles.fill, styles.bg, style]}>{inner}</View>;
  }

  return (
    <SafeAreaView style={[styles.fill, styles.bg, style]} edges={edges}>
      {inner}
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  fill: { flex: 1 },
  bg: { backgroundColor: colors.bg },
  content: { flexGrow: 1 },
});
