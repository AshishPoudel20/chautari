import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useImagePicker } from './useImagePicker';

/** Shared profile-photo chooser -> preview -> stage wiring for Edit Profile and onboarding. */
export function useProfilePhotoFlow(navigation, route, { displayName, onPhotoConfirmed, onPhotoRemoved }) {
  const { pickProfileFromLibrary, takeProfilePhoto } = useImagePicker();
  const [pickerOpen, setPickerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const stagedUri = route.params?.confirmedLocalUri;
      if (stagedUri) {
        onPhotoConfirmed?.(stagedUri);
        navigation.setParams({ confirmedLocalUri: undefined });
      }
      if (route.params?.retakePhoto) {
        navigation.setParams({ retakePhoto: undefined });
        setPickerOpen(true);
      }
    }, [navigation, route.params?.confirmedLocalUri, route.params?.retakePhoto, onPhotoConfirmed]),
  );

  const openPreview = useCallback((picked) => {
    navigation.navigate('ProfilePhotoPreview', {
      localUri: picked.uri,
      base64: picked.base64,
      mimeType: picked.mimeType,
      width: picked.width,
      height: picked.height,
      displayName,
      returnScreen: route.name,
    });
  }, [navigation, displayName, route.name]);

  const pickPhoto = useCallback(async (pickerFn) => {
    const picked = await pickerFn();
    if (picked?.uri) openPreview(picked);
  }, [openPreview]);

  return {
    pickerOpen,
    setPickerOpen,
    pickProfileFromLibrary,
    takeProfilePhoto,
    pickPhoto,
    removePhoto: () => onPhotoRemoved?.(),
  };
}
