/** Resolve a displayable URL from a string or legacy { id, url, uri } object. */
export function photoUrl(photo) {
  if (!photo) return null;
  if (typeof photo === 'string') return photo;
  return photo.url || photo.uri || photo.remoteUrl || null;
}

export function isRemotePhotoUri(uri) {
  return typeof uri === 'string' && (uri.startsWith('https://') || uri.startsWith('http://'));
}

/** URIs that must never be passed to React Native <Image> — blob: triggers fetch() crash. */
export function isUnsafeImageUri(uri) {
  if (!uri || typeof uri !== 'string') return true;
  return uri.startsWith('blob:');
}

export function isLocalPhotoUri(uri) {
  if (!uri || typeof uri !== 'string') return false;
  return uri.startsWith('file:')
    || uri.startsWith('content:')
    || uri.startsWith('ph://')
    || uri.startsWith('blob:');
}

/**
 * Safe URI for <Image>. Remote URLs always; local file:// only when allowLocal (composers).
 * Never returns blob: — those crash RN when scrolling the feed.
 */
export function displayPhotoUrl(photo, { allowLocal = false } = {}) {
  const uri = photoUrl(photo);
  if (!uri || isUnsafeImageUri(uri)) return null;
  if (isRemotePhotoUri(uri)) return uri;
  if (uri.startsWith('data:image/')) return uri;
  if (allowLocal && uri.startsWith('file://')) return uri;
  return null;
}

export function normalizePhotoUrls(photos) {
  return (photos || []).map(photoUrl).filter(Boolean);
}

/** Feed/detail display — remote HTTPS only (no blob/file/content). */
export function normalizeDisplayPhotoUrls(photos) {
  return (photos || []).map((p) => displayPhotoUrl(p)).filter(Boolean);
}

/** Full-screen viewer — public HTTPS first; local only when nothing remote (same-device optimistic). */
export function viewerPhotoUrls(photos) {
  const remote = normalizeDisplayPhotoUrls(photos);
  if (remote.length) return remote;
  return normalizePhotoUrls(photos)
    .map((uri) => displayPhotoUrl(uri, { allowLocal: true }))
    .filter(Boolean);
}

/** Persist only remote URLs — strip ephemeral blob:/file: from storage. */
export function sanitizePhotoUrlsForStorage(photos) {
  return normalizePhotoUrls(photos).filter(isRemotePhotoUri);
}

export function sanitizeProfilePhoto(photo) {
  if (!photo) return null;
  if (typeof photo === 'string') {
    if (isUnsafeImageUri(photo)) return null;
    return isRemotePhotoUri(photo) || photo.startsWith('file://') ? photo : null;
  }
  return photo;
}

/** True when the value still needs uploading (local uri or unstaged picker asset). */
export function needsPhotoUpload(photo) {
  const uri = photoUrl(photo);
  if (!uri) return false;
  if (uri.startsWith('http://') || uri.startsWith('https://')) return false;
  return isLocalPhotoUri(uri);
}
