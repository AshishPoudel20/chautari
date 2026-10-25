import React, { createContext, useContext, useCallback, useRef, useState, useMemo } from 'react';
import { Animated, StyleSheet, Text, View, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// Lightweight global toast for confirmation feedback (post / follow / report /
// profile saved / offline). One at a time; auto-dismisses. No dependencies.
const ToastContext = createContext(() => {});

function ToastView({ toast, anim }) {
  const { colors, spacing, radius, font, shadow, isDark } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, font, shadow, isDark),
    [colors, spacing, radius, font, shadow, isDark],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        },
      ]}
    >
      <View style={[styles.toast, toast.tone === 'danger' && styles.danger, toast.tone === 'success' && styles.success]}>
        {toast.tone === 'success' && <Text style={[styles.icon, styles.iconOnTint]}>✓</Text>}
        {toast.tone === 'danger' && <Text style={[styles.icon, styles.iconOnTint]}>⚠</Text>}
        <Text style={[styles.text, (toast.tone === 'success' || toast.tone === 'danger') && styles.textOnTint]}>
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, tone }
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true })
      .start(() => setToast(null));
  }, [anim]);

  const showToast = useCallback((message, opts = {}) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone: opts.tone || 'default' });
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    timer.current = setTimeout(hide, opts.duration || 2200);
  }, [anim, hide]);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && <ToastView toast={toast} anim={anim} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const createStyles = (colors, spacing, radius, font, shadow, isDark) => StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', paddingHorizontal: spacing.xl, zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: isDark ? colors.surfaceElevated : colors.offlineBanner,
    borderWidth: isDark ? 1 : 0,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    borderRadius: radius.pill,
    maxWidth: '100%',
    ...shadow.raised,
  },
  success: { backgroundColor: colors.toastSuccess, borderWidth: 0 },
  danger: { backgroundColor: colors.danger, borderWidth: 0 },
  icon: { color: isDark ? colors.text : colors.onDark, fontWeight: '900', fontSize: font.body },
  iconOnTint: { color: colors.onDark },
  text: { color: isDark ? colors.text : colors.onDark, fontWeight: '700', fontSize: font.caption, flexShrink: 1 },
  textOnTint: { color: colors.onDark },
});
