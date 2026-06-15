import { CATEGORIES, categoryName } from '../data/categories';

/**
 * Verified category → official circle mapping.
 * Official circle ids match category ids one-to-one (see buildOfficialCircles).
 * If verifiedCategory is not in the 8 official categories, professional posting
 * is unavailable — experts post as member only.
 */
export function verifiedCategoryCircleId(verifiedCategory) {
  if (!verifiedCategory) return null;
  return CATEGORIES.some((c) => c.id === verifiedCategory) ? verifiedCategory : null;
}

export function canPostProfessionallyInCircle(verifiedCategory, circleId) {
  const expertCircle = verifiedCategoryCircleId(verifiedCategory);
  if (!expertCircle || !circleId) return false;
  return expertCircle === circleId;
}

/** Badge / expert-card styling follows the per-post choice, not author.verified alone. */
export function isPostedAsExpert(item) {
  if (!item || item.anonymous) return false;
  return item.postedAsExpert === true;
}

export function showExpertReplyToggle(user, questionCircleId) {
  if (!user?.verified) return false;
  return canPostProfessionallyInCircle(user.verifiedCategory, questionCircleId);
}

export function professionalPostingLabel(user, circleName) {
  const field = categoryName(user?.verifiedCategory);
  return `Posting as a ${field} professional — posted to ${circleName || field} circle`;
}

/** Server-side guard: enforce circle lock + reply trust rule. */
export function resolveQuestionPosting({ author, circleId, anonymous, postedAsExpert }) {
  let nextCircleId = circleId;
  let nextPostedAsExpert = false;
  let nextAnonymous = !!anonymous;

  if (author?.verified && postedAsExpert) {
    const locked = verifiedCategoryCircleId(author.verifiedCategory);
    if (locked) {
      nextCircleId = locked;
      nextPostedAsExpert = true;
      nextAnonymous = false;
    }
  }

  return { circleId: nextCircleId, postedAsExpert: nextPostedAsExpert, anonymous: nextAnonymous };
}

export function resolveReplyPosting({ author, questionCircleId, anonymous, postedAsExpert }) {
  let nextPostedAsExpert = false;
  let nextAnonymous = !!anonymous;

  if (author?.verified && postedAsExpert && canPostProfessionallyInCircle(author.verifiedCategory, questionCircleId)) {
    nextPostedAsExpert = true;
    nextAnonymous = false;
  }

  return { postedAsExpert: nextPostedAsExpert, anonymous: nextAnonymous };
}
