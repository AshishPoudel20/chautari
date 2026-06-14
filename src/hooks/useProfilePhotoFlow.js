import { useCallback, useEffect, useState } from 'react';
import { useImagePicker } from './useImagePicker';

/** Shared profile-photo chooser -> preview -> confirm wiring for Edit Profile and onboarding. */
export function useProfilePhotoFlow(navigation, route, { displayName, onPhotoConfirmed, onPhotoRemoved }) {
  const { pickProfileFromLibrary, takeProfilePhoto } = useImagePicker();
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (route.params?.confirmedPhotoUrl) {
      onPhotoConfirmed?.(route.params.confirmedPhotoUrl);
      navigation.setParams({ confirmedPhotoUrl: undefined });
    }
    if (route.params?.retakePhoto) {
      navigation.setParams({ retakePhoto: undefined });
      setPickerOpen(true);
    }
  }, [navigation, route.params?.confirmedPhotoUrl, route.params?.retakePhoto, onPhotoConfirmed]);

  const openPreview = useCallback((localUri) => {
    navigation.navigate('ProfilePhotoPreview', {
      localUri,
      displayName,
      returnScreen: route.name,
    });
  }, [navigation, displayName, route.name]);

  const pickPhoto = useCallback(async (pickerFn) => {
    const picked = await pickerFn();
    if (picked?.uri) openPreview(picked.uri);
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
