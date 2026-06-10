import React, { useMemo,  useLayoutEffect  } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import ProfileView from '../components/ProfileView';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { useData, useSelectors } from '../data/store';
import { useTheme } from '../theme/ThemeContext';

// Other User Profile with a follow button.
// Followers count is hidden here (own followers are visible to self only;
// only the following count is public for non-expert users).
export default function UserProfileScreen({ navigation, route }) {
  const { spacing } = useTheme();
  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const { userId } = route.params;
  const { dispatch } = useData();
  const { userById, isFollowing } = useSelectors();
  const showToast = useToast();
  const user = userById(userId);
  const following = isFollowing(userId);

  const toggleFollow = () => {
    dispatch({ type: 'TOGGLE_FOLLOW', userId });
    showToast(following ? `Unfollowed ${user?.name}` : `Following ${user?.name}`, { tone: following ? 'default' : 'success' });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Report', { kind: 'content', targetTitle: user?.name })} hitSlop={10}>
          <Text style={{ fontSize: 18 }}>⋯</Text>
        </Pressable>
      ),
    });
  }, [navigation, user]);

  return (
    <ProfileView
      userId={userId}
      navigation={navigation}
      showFollowers={false}
      actions={
        <View style={styles.actions}>
          <Button
            title={following ? 'Following ✓' : '+ Follow'}
            variant={following ? 'secondary' : 'primary'}
            onPress={toggleFollow}
          />
        </View>
      }
    />
  );
}

const createStyles = (spacing) => StyleSheet.create({
  actions: { alignSelf: 'stretch', marginTop: spacing.md },
});
