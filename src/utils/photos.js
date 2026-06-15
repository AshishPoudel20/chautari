/** Resolve a displayable URL from a string or legacy { id, url, uri } object. */
export function photoUrl(photo) {
  if (!photo) return null;
  if (typeof photo === 'string') return photo;
  return photo.url || photo.uri || photo.remoteUrl || null;
}

export function normalizePhotoUrls(photos) {
  return (photos || []).map(photoUrl).filter(Boolean);
}

export function isLocalPhotoUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return uri.startsWith('file:')
    || uri.startsWith('content:')
    || uri.startsWith('ph://')
    || uri.startsWith('blob:');
}

/** True when the value still needs uploading (local uri or unstaged picker asset). */
export function needsPhotoUpload(photo) {
  const uri = photoUrl(photo);
  if (!uri) return false;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return false;
  return isLocalPhotoUri(uri);
}
