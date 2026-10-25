import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { useGoBack, useAndroidBackHandler } from '../../hooks/useGoBack';
import { viewerPhotoUrls } from '../../utils/photos';

const DISMISS_DRAG = 100;
const DISMISS_VELOCITY = 0.75;

export default function ImageViewerScreen({ navigation, route }) {
  const { colors, spacing, font } = useTheme();
  const insets = useSafeAreaInsets();
  const goBack = useGoBack(navigation);
  useAndroidBackHandler(goBack);
  const { width, height } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, insets, width),
    [colors, spacing, font, insets, width],
  );

  const { photos = [], index = 0 } = route.params || {};
  const items = viewerPhotoUrls(photos);
  if (__DEV__) {
    console.log('[ImageViewer] input photos:', photos);
    console.log('[ImageViewer] resolved viewer URLs:', items);
  }

  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, height * 0.35],
    outputRange: [1, 0.25],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => (
        gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx)
      ),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_DRAG || gesture.vy > DISMISS_VELOCITY) {
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => goBack());
          return;
        }
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 5,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  return (
    <Animated.View style={[styles.container, { opacity: backdropOpacity }]}>
      <Pressable style={styles.close} onPress={goBack} hitSlop={12} accessibilityLabel="Close">
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No photos to show.</Text>
        </View>
      ) : (
        <Animated.View
          style={[styles.viewer, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: index * width, y: 0 }}
            style={styles.pager}
            scrollEventThrottle={16}
          >
            {items.map((uri, i) => (
              <View key={`${uri}-${i}`} style={styles.page}>
                <Image source={{ uri }} style={styles.image} resizeMode="contain" />
                <Text style={styles.caption}>Photo {i + 1} of {items.length}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors, spacing, font, insets, width) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.imageViewerBg },
  viewer: { flex: 1 },
  pager: { flex: 1 },
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
