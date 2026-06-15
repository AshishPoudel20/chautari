import { professionLabel } from '../data/categories';

/** Whether expert badge/card styling should show on a question or reply. */
export function showsExpertBadge(item, author) {
  if (!author?.verified || item?.anonymous) return false;
  if (item.postedAsExpert === false) return false;
  // true or missing (legacy verified posts) → show badge
  return true;
}

/** Snapshot profession at post time; falls back to live profile for legacy rows. */
export function snapshotProfessionLabel(user) {
  return professionLabel(user);
}

export function displayProfessionLabel(item, author) {
  return item?.professionLabel || professionLabel(author);
}
