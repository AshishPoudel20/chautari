import { professionLabel, CATEGORIES } from '../data/categories';

export const EXPERT_BADGE_TITLE_MIN = 2;
export const EXPERT_BADGE_TITLE_MAX = 60;

const OFFICIAL_CIRCLE_IDS = new Set(CATEGORIES.map((c) => c.id));

export function verifiedCategoryFromCircle(circleId) {
  return OFFICIAL_CIRCLE_IDS.has(circleId) ? circleId : 'others';
}

/** Whether expert badge/card styling should show on a question or reply. */
export function showsExpertBadge(item, author) {
  if (!author?.verified || item?.anonymous) return false;
  if (item.postedAsExpert === false) return false;
  // true or missing (legacy verified posts) → show badge
  return true;
}

export function validateExpertBadgeTitle(title) {
  const t = (title || '').trim();
  if (t.length < EXPERT_BADGE_TITLE_MIN) {
    return `Enter at least ${EXPERT_BADGE_TITLE_MIN} characters.`;
  }
  if (t.length > EXPERT_BADGE_TITLE_MAX) {
    return `Keep it under ${EXPERT_BADGE_TITLE_MAX} characters.`;
  }
  return null;
}

/** True when a verified expert has declared badge title + circle for professional posting. */
export function hasExpertProfessionalProfile(user) {
  if (!user?.verified) return false;
  return !validateExpertBadgeTitle(user.expertBadgeTitle) && !!user.expertCircleId;
}

/** Snapshot badge title at post time; legacy rows fall back to profession / category. */
export function snapshotProfessionLabel(user) {
  const title = user?.expertBadgeTitle?.trim();
  if (title) return title;
  return professionLabel(user);
}

export function displayProfessionLabel(item, author) {
  return item?.professionLabel || snapshotProfessionLabel(author);
}
