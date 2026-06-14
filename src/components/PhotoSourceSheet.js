import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Modal, Platform, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { waitForPickerPresentation } from '../hooks/useImagePicker';

/** Bottom sheet: camera, library, optional remove. */
export default function PhotoSourceSheet({
  visible,
  onClose,
  onCamera,
  onLibrary,
  onRemove,
  title = 'Add photo',
  showRemove = false,
}) {
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, shadow),
    [colors, spacing, font, radius, shadow],
  );

  // iOS cannot present the image picker while this modal is still up — queue the action
  // and run it only after onDismiss (or after visible=false on Android).
  const pendingRef = useRef(null);
  const flushingRef = useRef(false);

  const flushPending = useCallback(async () => {
    if (flushingRef.current || !pendingRef.current) return;
    flushingRef.current = true;
    const kind = pendingRef.current;
    pendingRef.current = null;
    await waitForPickerPresentation();
    try {
      if (kind === 'camera') await onCamera?.();
      else if (kind === 'library') await onLibrary?.();
      else if (kind === 'remove') await onRemove?.();
    } catch {
      // Parent handlers show alerts for picker/upload failures.
    } finally {
      flushingRef.current = false;
    }
  }, [onCamera, onLibrary, onRemove]);

  const queueAction = useCallback((kind) => {
    pendingRef.current = kind;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (visible || !pendingRef.current) return;
    // Fallback when onDismiss does not fire (some transparent modal configs on iOS).
    const t = setTimeout(flushPending, Platform.OS === 'ios' ? 400 : 0);
    return () => clearTimeout(t);
  }, [visible, flushPending]);

  const handleDismiss = useCallback(() => {
    flushPending();
  }, [flushPending]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Pressable style={styles.row} onPress={() => queueAction('camera')}>
            <Text style={styles.icon}>📸</Text>
            <Text style={styles.label}>Take a photo</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={() => queueAction('library')}>
            <Text style={styles.icon}>🖼</Text>
            <Text style={styles.label}>Choose from library</Text>
          </Pressable>
          {showRemove ? (
            <Pressable style={styles.row} onPress={() => queueAction('remove')}>
              <Text style={styles.icon}>🗑️</Text>
              <Text style={[styles.label, { color: colors.danger }]}>Remove photo</Text>
            </Pressable>
          ) : null}
          <Pressable style={[styles.row, styles.cancel]} onPress={onClose}>
            <Text style={[styles.label, styles.cancelText]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadow.raised,
  },
  title: { fontSize: font.body, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  icon: { fontSize: 20, width: 26, textAlign: 'center' },
  label: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  cancel: { marginTop: spacing.sm, backgroundColor: colors.bgSunken, borderRadius: radius.md, borderTopWidth: 0, justifyContent: 'center' },
  cancelText: { fontWeight: '800', textAlign: 'center', width: '100%' },
});
