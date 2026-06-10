import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Full-screen viewer opened when a question photo is tapped. Photos are mocked
// placeholders in this prototype, so we present the placeholder enlarged with a
// clear note rather than a broken image — no dead tap.
export default function ImageViewerScreen({ navigation, route }) {
  const { colors, spacing, font, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, font, radius), [colors, spacing, font, radius]);

  const { photos = [], index = 0 } = route.params || {};
  const count = photos.length || 1;
  return (
    <View style={styles.container}>
      <Pressable style={styles.close} onPress={() => navigation.goBack()} hitSlop={12}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: 0, y: 0 }}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {(photos.length ? photos : [{ id: 'ph' }]).map((p, i) => (
          <View key={p.id || i} style={styles.page}>
            <View style={styles.frame}>
              <Text style={styles.frameEmoji}>🖼</Text>
              <Text style={styles.frameLabel}>Photo {i + 1} of {count}</Text>
              <Text style={styles.frameNote}>Image attachments are mocked in this prototype.</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.imageViewerBg },
  close: { position: 'absolute', top: 52, right: spacing.lg, zIndex: 2, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.imageViewerClose, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.onPrimary, fontSize: 20, fontWeight: '800' },
  page: { width: 360, maxWidth: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  frame: { width: '100%', aspectRatio: 1, borderRadius: radius.lg, backgroundColor: colors.imageViewerSurface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.imageViewerBorder },
  frameEmoji: { fontSize: 72, marginBottom: spacing.md },
  frameLabel: { color: colors.onPrimary, fontSize: font.body, fontWeight: '800' },
  frameNote: { color: colors.imageViewerTextMuted, fontSize: font.caption, marginTop: 6 },
});
