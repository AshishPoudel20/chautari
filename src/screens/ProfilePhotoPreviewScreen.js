import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeContext';
import { PROFILE_AVATAR_SIZE } from '../constants/media';

/** Crop confirm only — returns the local cropped URI; upload happens on Edit Profile Save (or onboarding Finish). */
export default function ProfilePhotoPreviewScreen({ navigation, route }) {
  const { localUri, displayName, returnScreen } = route.params || {};
  const { colors, spacing, font, radius, shadow } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, font, radius, shadow),
    [colors, spacing, font, radius, shadow],
  );

  const returnWithParams = (params) => {
    navigation.navigate({
      name: returnScreen,
      params,
      merge: true,
    });
  };

  const usePhoto = () => {
    if (!localUri) return;
    returnWithParams({ confirmedLocalUri: localUri });
  };

  const retake = () => {
    returnWithParams({ retakePhoto: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>HOW IT WILL LOOK</Text>
      <Text style={styles.subtitle}>Your profile photo appears as a circle across Chautari.</Text>

      <View style={styles.previewWrap}>
        <Avatar name={displayName || 'You'} photo={localUri} size={PROFILE_AVATAR_SIZE} />
      </View>

      <View style={styles.actions}>
        <Button title="Use photo" onPress={usePhoto} />
        <Button
          title="Retake / Choose another"
          variant="secondary"
          onPress={retake}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, font, radius, shadow) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textFaint,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: font.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  previewWrap: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  actions: { width: '100%', maxWidth: 320 },
});
