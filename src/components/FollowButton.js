import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useData, useSelectors } from '../data/store';
import { useToast } from './Toast';
import { useTheme } from '../theme/ThemeContext';
import { isSelfUserId } from '../utils/navigation';

// One-tap, optimistic follow / unfollow. State lives in the reducer and updates
// synchronously, so the toggle reflects instantly (Build Brief v2). Confirms
// with a toast.
export default function FollowButton({ userId, size = 'md', onChange }) {
  const { dispatch } = useData();
  const { isFollowing, userById, state } = useSelectors();
  const showToast = useToast();
  const { colors, radius, font } = useTheme();
  const styles = useMemo(() => createStyles(colors, radius, font), [colors, radius, font]);

  if (isSelfUserId(userId, state.authUserId)) return null;

  const following = isFollowing(userId);

  const toggle = () => {
    dispatch({ type: 'TOGGLE_FOLLOW', userId });
    const name = userById(userId)?.name || 'this member';
    showToast(following ? `Unfollowed ${name}` : `Following ${name}`, { tone: following ? 'default' : 'success' });
    onChange && onChange(!following);
  };

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        following ? styles.following : styles.follow,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.text, size === 'sm' && styles.textSm, following ? styles.followingText : styles.followText]}>
        {following ? '✓ Following' : '+ Follow'}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors, radius, font) => StyleSheet.create({
  base: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  sm: { paddingHorizontal: 13, paddingVertical: 6 },
  follow: { backgroundColor: colors.primary },
  following: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.borderStrong },
  text: { fontWeight: '800', fontSize: font.caption, letterSpacing: 0.2 },
  textSm: { fontSize: font.tiny },
  followText: { color: colors.onPrimary },
  followingText: { color: colors.textMuted },
});
