import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View, Text, Animated, StyleSheet, Easing, AccessibilityInfo, Platform,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

const WORDMARK = 'Chautari';
const DELAY_MS = 300;
const DURATION_MS = 1050;

function sheenStops(variant, isDark) {
  if (variant === 'splash') {
    const peak = isDark ? 0.42 : 0.48;
    return [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0)',
      `rgba(255,255,255,${peak})`,
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0)',
    ];
  }
  const peak = isDark ? 0.34 : 0.58;
  return [
    'rgba(255,255,255,0)',
    'rgba(255,255,255,0)',
    `rgba(255,255,255,${peak})`,
    'rgba(255,255,255,0)',
    'rgba(255,255,255,0)',
  ];
}

/**
 * One-shot diagonal sheen across the "Chautari" wordmark.
 * Base text styling is unchanged; highlight is a masked overlay (native only).
 */
export default function ShinyWordmark({ style, variant = 'header', replayKey = 0 }) {
  const { isDark } = useTheme();
  const sheen = useRef(new Animated.Value(0)).current;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [reduceMotion, setReduceMotion] = useState(false);
  const sheenColors = useMemo(() => sheenStops(variant, isDark), [variant, isDark]);
  const maskTextStyle = useMemo(() => [style, styles.maskText], [style]);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => { if (mounted) setReduceMotion(!!enabled); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (size.width <= 0 || Platform.OS === 'web') return undefined;

    sheen.setValue(0);
    const anim = Animated.sequence([
      Animated.delay(reduceMotion ? 0 : DELAY_MS),
      Animated.timing(sheen, {
        toValue: 1,
        duration: reduceMotion ? 120 : DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [replayKey, size.width, reduceMotion, sheen]);

  const bandWidth = Math.max(size.width * 0.5, 40);
  const sweepSpan = size.width + bandWidth * 2;
  const translateX = sheen.interpolate({
    inputRange: [0, 1],
    outputRange: [-bandWidth, size.width + bandWidth],
  });

  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setSize((prev) => (
        prev.width === width && prev.height === height ? prev : { width, height }
      ));
    }
  };

  const showSheen = Platform.OS !== 'web' && size.width > 0;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Text style={style}>{WORDMARK}</Text>
      {showSheen ? (
        <MaskedView
          style={[styles.sheenLayer, { width: size.width, height: size.height }]}
          maskElement={<Text style={maskTextStyle}>{WORDMARK}</Text>}
        >
          <Animated.View
            style={{
              width: sweepSpan,
              height: size.height * 1.35,
              transform: [
                { translateX },
                { translateY: -size.height * 0.12 },
                { rotate: '-20deg' },
              ],
            }}
          >
            <LinearGradient
              colors={sheenColors}
              locations={[0, 0.36, 0.5, 0.64, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: sweepSpan, height: size.height * 1.35 }}
            />
          </Animated.View>
        </MaskedView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', position: 'relative' },
  maskText: { backgroundColor: 'transparent', color: '#000' },
  sheenLayer: { position: 'absolute', left: 0, top: 0, pointerEvents: 'none' },
});
