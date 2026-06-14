import { useCallback } from 'react';
import { Alert, InteractionManager, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { prepareImageForUpload } from '../services/mediaStorage';

const LIBRARY_DENIED_MESSAGE = 'Photo access is off. Enable it in Settings to choose from your gallery.';

/** Let a dismissed modal finish animating before presenting the library picker (iOS). */
export function waitForPickerPresentation() {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, Platform.OS === 'ios' ? 400 : 0);
      });
    });
  });
}

async function ensureMediaLibraryPermission() {
  const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (response.granted) return true;

  Alert.alert(
    'Photo access is off',
    LIBRARY_DENIED_MESSAGE,
    response.canAskAgain
      ? [{ text: 'OK' }]
      : [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
  );
  return false;
}

async function ensureCameraPermission() {
  const response = await ImagePicker.requestCameraPermissionsAsync();
  if (response.granted) return true;

  Alert.alert(
    'Permission needed',
    'Camera access is needed to take a photo. Enable it in Settings.',
    response.canAskAgain
      ? [{ text: 'OK' }]
      : [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
  );
  return false;
}

async function prepareAsset(asset) {
  const prepared = await prepareImageForUpload(asset);
  return { asset, ...prepared };
}

export function useImagePicker() {
  const pickFromLibrary = useCallback(async ({
    allowsMultipleSelection = false,
    selectionLimit = 1,
  } = {}) => {
    if (!(await ensureMediaLibraryPermission())) return null;

    const multi = allowsMultipleSelection && selectionLimit > 1;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        exif: false,
        allowsMultipleSelection: multi,
        selectionLimit: multi ? selectionLimit : 1,
      });
      if (result.canceled || !result.assets?.length) return null;

      if (multi && result.assets.length > 1) {
        const prepared = [];
        for (const asset of result.assets) {
          try {
            prepared.push(await prepareAsset(asset));
          } catch (e) {
            Alert.alert('Photo not added', e?.message || 'Could not use that image.');
          }
        }
        return prepared.length ? prepared : null;
      }

      try {
        return await prepareAsset(result.assets[0]);
      } catch (e) {
        Alert.alert('Photo not added', e?.message || 'Could not use that image.');
        return null;
      }
    } catch (e) {
      Alert.alert('Could not open gallery', e?.message || 'Try again.');
      return null;
    }
  }, []);

  const takePhoto = useCallback(async () => {
    if (!(await ensureCameraPermission())) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        exif: false,
        cameraType: ImagePicker.CameraType.back,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      try {
        return await prepareAsset(result.assets[0]);
      } catch (e) {
        Alert.alert('Photo not added', e?.message || 'Could not use that image.');
        return null;
      }
    } catch (e) {
      Alert.alert('Could not open camera', e?.message || 'Try again.');
      return null;
    }
  }, []);

  return { pickFromLibrary, takePhoto };
}
