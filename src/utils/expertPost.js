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

/** Badge title from verification (explicit field, then legacy profession). */
export function resolveExpertBadgeTitle(user) {
  if (!user) return null;
  const explicit = user.expertBadgeTitle?.trim();
  if (explicit && !validateExpertBadgeTitle(explicit)) return explicit;
  const legacy = user.profession?.trim();
  if (legacy && !validateExpertBadgeTitle(legacy)) return legacy;
  return null;
}

/** Professional circle from verification (explicit field, then legacy category). */
export function resolveExpertCircleId(user) {
  if (!user) return null;
  return user.expertCircleId || user.verifiedCategory || null;
}

/** Verified expert can post professionally — badge + circle come from profile, not the composer. */
export function canPostAsProfessional(user) {
  if (!user?.verified) return false;
  return !!(resolveExpertBadgeTitle(user) && resolveExpertCircleId(user));
}

/** @deprecated use canPostAsProfessional */
export function hasExpertProfessionalProfile(user) {
  return canPostAsProfessional(user);
}

/** Snapshot badge title at post time; legacy rows fall back to profession / category. */
export function snapshotProfessionLabel(user) {
  return resolveExpertBadgeTitle(user) || professionLabel(user);
}

export function displayProfessionLabel(item, author) {
  return item?.professionLabel || snapshotProfessionLabel(author);
}
