/** Single source of truth for For You Hot ranking. Tune here only. */

export const GRAVITY = 1.5;
export const AGE_OFFSET_HOURS = 2;

export const WEIGHTS = {
  base: 1,
  upvote: 1,
  answer: 2,
  expertAnswerBonus: 8,
};

export const PAGE_SIZE = 10;

const MS_PER_HOUR = 60 * 60 * 1000;

export function hoursBetween(referenceTime, createdAt) {
  return Math.max(0, (referenceTime - createdAt) / MS_PER_HOUR);
}

export function engagementForPost(post, hasExpertAnswer) {
  const upvotes = post.upvotes || 0;
  const answers = post.answers?.length || 0;
  return (
    WEIGHTS.base
    + upvotes * WEIGHTS.upvote
    + answers * WEIGHTS.answer
    + (hasExpertAnswer ? WEIGHTS.expertAnswerBonus : 0)
  );
}

/** Pure hot score — engagement divided by time-decayed denominator. */
export function score(post, referenceTime, hasExpertAnswer) {
  const engagement = engagementForPost(post, hasExpertAnswer);
  const hours = hoursBetween(referenceTime, post.createdAt);
  const denominator = (hours + AGE_OFFSET_HOURS) ** GRAVITY;
  return engagement / denominator;
}
