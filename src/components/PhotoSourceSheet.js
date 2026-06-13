import React, { useMemo } from 'react';
import { Modal, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

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

  const runAfterDismiss = (action) => {
    onClose();
    Promise.resolve(action?.()).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Pressable style={styles.row} onPress={() => runAfterDismiss(onCamera)}>
            <Text style={styles.icon}>📸</Text>
            <Text style={styles.label}>Take a photo</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={() => runAfterDismiss(onLibrary)}>
            <Text style={styles.icon}>🖼</Text>
            <Text style={styles.label}>Choose from library</Text>
          </Pressable>
          {showRemove ? (
            <Pressable style={styles.row} onPress={() => runAfterDismiss(onRemove)}>
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
