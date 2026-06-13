import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { normalizePhotoUrls, photoUrl } from '../utils/photos';

export default function ImageViewerScreen({ navigation, route }) {
  const { colors, spacing, font } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, insets, width),
    [colors, spacing, font, insets, width],
  );

  const { photos = [], index = 0 } = route.params || {};
  const items = normalizePhotoUrls(photos);

  return (
    <View style={styles.container}>
      <Pressable style={styles.close} onPress={() => navigation.goBack()} hitSlop={12}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No photos to show.</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: index * width, y: 0 }}
          style={{ flex: 1 }}
        >
          {items.map((uri, i) => (
            <View key={`${uri}-${i}`} style={styles.page}>
              <Image source={{ uri: photoUrl(uri) || uri }} style={styles.image} resizeMode="contain" />
              <Text style={styles.caption}>Photo {i + 1} of {items.length}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors, spacing, font, insets, width) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.imageViewerBg },
  close: {
    position: 'absolute',
    top: insets.top + 8,
    right: spacing.lg,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.imageViewerClose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.onPrimary, fontSize: 20, fontWeight: '800' },
  page: { width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  image: { width: width - spacing.xl * 2, height: '80%' },
  caption: { color: colors.imageViewerTextMuted, fontSize: font.caption, marginTop: spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.imageViewerTextMuted, fontSize: font.body },
});
