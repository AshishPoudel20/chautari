import * as ImageManipulator from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  MEDIA_BUCKET,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
  JPEG_QUALITY,
  UPLOAD_CONTENT_TYPE,
  PICKER_IMAGE_TYPES,
} from '../constants/media';

function storagePath(prefix, userId, entityId, fileName) {
  return `${prefix}/${userId}/${entityId}/${fileName}`;
}

/** Read local image bytes for Supabase upload (RN-safe; never pass a URI string to .upload()). */
async function readFileBytes(uri) {
  if (!uri) throw new Error('Photo file path is missing.');

  if (uri.startsWith('file://')) {
    const file = new File(uri);
    const bytes = await file.bytes();
    if (!bytes.byteLength) throw new Error('Photo file is empty.');
    return bytes;
  }

  const response = await fetch(uri);
  if (!response.ok) throw new Error('Could not read the selected photo.');
  const buffer = await response.arrayBuffer();
  if (!buffer.byteLength) throw new Error('Photo file is empty.');
  return new Uint8Array(buffer);
}

async function fileByteSize(uri) {
  return (await readFileBytes(uri)).byteLength;
}

export function getMediaPublicUrl(path) {
  if (!isSupabaseConfigured()) return null;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Compress, convert HEIC→JPEG, enforce size/type limits. Returns local JPEG uri. */
export async function prepareImageForUpload(asset) {
  const mime = (asset.mimeType || asset.type || '').toLowerCase();
  if (mime && !PICKER_IMAGE_TYPES.some((t) => mime.includes(t.replace('image/', '')))) {
    throw new Error('Use a JPEG, PNG, or HEIC photo.');
  }

  let width = asset.width;
  let height = asset.height;
  const actions = [];
  if (width && height && (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION)) {
    actions.push({
      resize: width >= height
        ? { width: MAX_IMAGE_DIMENSION }
        : { height: MAX_IMAGE_DIMENSION },
    });
  }

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  const size = await fileByteSize(manipulated.uri);
  if (size > MAX_IMAGE_BYTES) {
    throw new Error('Photo is too large — pick an image under 5 MB.');
  }
  if (size === 0) {
    throw new Error('Could not read the selected photo. Try another image.');
  }

  return { uri: manipulated.uri, size, contentType: UPLOAD_CONTENT_TYPE };
}

async function requireAuthUserId() {
  if (!isSupabaseConfigured()) throw new Error('Photo upload requires Supabase — check your .env.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to upload photos.');
  return user.id;
}

/**
 * Upload a prepared JPEG to Supabase Storage.
 * @returns public HTTPS URL
 */
export async function uploadMediaFile({
  prefix,
  entityId,
  localUri,
  fileName = 'photo.jpg',
  upsert = true,
}) {
  const userId = await requireAuthUserId();
  const path = storagePath(prefix, userId, entityId, fileName);
  const body = await readFileBytes(localUri);
  if (!body.byteLength) throw new Error('Photo file is empty — could not read image bytes.');

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: UPLOAD_CONTENT_TYPE,
    upsert,
    cacheControl: '3600',
  });
  if (error) throw error;

  const url = getMediaPublicUrl(path);
  if (!url) throw new Error('Upload succeeded but public URL is missing.');
  return url;
}

export async function uploadPreparedImage(options) {
  const prepared = await prepareImageForUpload(options.asset || options);
  const url = await uploadMediaFile({
    ...options,
    localUri: prepared.uri,
  });
  return url;
}

export async function uploadAvatar(asset) {
  const prepared = await prepareImageForUpload(asset);
  return uploadMediaFile({
    prefix: 'avatars',
    entityId: 'profile',
    localUri: prepared.uri,
    fileName: `avatar-${Date.now()}.jpg`,
    upsert: true,
  });
}

export async function uploadQuestionPhotos(questionId, assets) {
  const urls = [];
  for (let i = 0; i < assets.length; i += 1) {
    const prepared = await prepareImageForUpload(assets[i]);
    const url = await uploadMediaFile({
      prefix: 'questions',
      entityId: questionId,
      localUri: prepared.uri,
      fileName: `${i}.jpg`,
    });
    urls.push(url);
  }
  return urls;
}

export async function uploadCircleImage(circleId, asset) {
  const prepared = await prepareImageForUpload(asset);
  return uploadMediaFile({
    prefix: 'circles',
    entityId: circleId,
    localUri: prepared.uri,
    fileName: 'banner.jpg',
    upsert: true,
  });
}

export async function uploadAnswerPhoto(answerId, asset) {
  const prepared = await prepareImageForUpload(asset);
  return uploadMediaFile({
    prefix: 'answers',
    entityId: answerId,
    localUri: prepared.uri,
    fileName: 'photo.jpg',
  });
}

export async function uploadReplyPhoto(replyId, asset) {
  const prepared = await prepareImageForUpload(asset);
  return uploadMediaFile({
    prefix: 'replies',
    entityId: replyId,
    localUri: prepared.uri,
    fileName: 'photo.jpg',
  });
}
