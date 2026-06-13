import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { prepareImageForUpload } from '../services/mediaStorage';

function permissionMessage(kind) {
  if (kind === 'camera') {
    return 'Camera access is needed to take a photo. Enable it in Settings.';
  }
  return 'Photo library access is needed to choose an image. Enable it in Settings.';
}

async function ensurePermission(kind) {
  const request = kind === 'camera'
    ? ImagePicker.requestCameraPermissionsAsync
    : ImagePicker.requestMediaLibraryPermissionsAsync;
  const { status, canAskAgain } = await request();
  if (status === 'granted') return true;

  Alert.alert(
    'Permission needed',
    permissionMessage(kind),
    canAskAgain
      ? [{ text: 'OK' }]
      : [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
  );
  return false;
}

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 1,
  exif: false,
};

export function useImagePicker() {
  const pickFromLibrary = useCallback(async () => {
    if (!(await ensurePermission('library'))) return null;
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (result.canceled || !result.assets?.[0]) return null;
    try {
      const prepared = await prepareImageForUpload(result.assets[0]);
      return { asset: result.assets[0], ...prepared };
    } catch (e) {
      Alert.alert('Photo not added', e?.message || 'Could not use that image.');
      return null;
    }
  }, []);

  const takePhoto = useCallback(async () => {
    if (!(await ensurePermission('camera'))) return null;
    const result = await ImagePicker.launchCameraAsync({
      ...PICKER_OPTIONS,
      cameraType: ImagePicker.CameraType.back,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    try {
      const prepared = await prepareImageForUpload(result.assets[0]);
      return { asset: result.assets[0], ...prepared };
    } catch (e) {
      Alert.alert('Photo not added', e?.message || 'Could not use that image.');
      return null;
    }
  }, []);

  return { pickFromLibrary, takePhoto };
}
