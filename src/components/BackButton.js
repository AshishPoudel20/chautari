import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useGoBack } from '../hooks/useGoBack';

/** Screens that must always offer an escape hatch even if the stack is shallow. */
export const ALWAYS_BACK_ROUTES = new Set([
  'QuestionDetail',
  'CircleDetail',
  'CirclesSectionSeeAll',
  'CreateCircle',
  'EditCircle',
  'Search',
  'ExpertProfile',
  'UserProfile',
  'VerifiedApplication',
  'ExpertProfessionalSetup',
  'Notifications',
  'EditProfile',
  'MyPosts',
  'SavedPosts',
  'ArrivalChecklist',
  'Settings',
  'Help',
  'Terms',
  'Privacy',
  'About',
  'DeleteAccount',
  'AskComposer',
  'Report',
  'ImageViewer',
  'CategoryFeed',
]);

/**
 * Shared header back control — uses HeaderBackButton look, safe goBack logic.
 * Drop into stack `headerLeft` or use the compact Pressable variant for custom headers.
 */
export default function BackButton({
  variant = 'header', // 'header' | 'overlay'
  tintColor,
  fallbackTab = 'Home',
  onPress,
  style,
  ...headerProps
}) {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, spacing, font, radius, shadow } = useTheme();
  const goBack = useGoBack(navigation, { fallbackTab });
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, shadow),
    [colors, spacing, font, radius, shadow],
  );

  const handlePress = () => {
    if (onPress) onPress();
    else goBack();
  };

  const canNative = !!headerProps.canGoBack || !!navigation.canGoBack?.();
  const forceShow = ALWAYS_BACK_ROUTES.has(route?.name);
  if (!canNative && !forceShow && variant === 'header') return null;

  if (variant === 'overlay') {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.overlayBtn, style, pressed && { opacity: 0.85 }]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={[styles.overlayIcon, tintColor ? { color: tintColor } : null]}>←</Text>
      </Pressable>
    );
  }

  return (
    <HeaderBackButton
      {...headerProps}
      labelVisible={Platform.OS === 'ios' ? headerProps.labelVisible : false}
      tintColor={tintColor || colors.text}
      onPress={handlePress}
    />
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  overlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  overlayIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
});
