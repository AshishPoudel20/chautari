import { DISCOVERY_MIN_SCORE, JOINED_SLOTS_PER_DISCOVERY, score } from './rankingConfig';
import { compareHot, compareNew } from './feedRanking';

/** Future: private circles never surface in discovery (or public feeds). */
export function isCirclePublic(circle) {
  if (!circle) return true;
  if (circle.isPrivate === true) return false;
  return true;
}

function resolveCircleId(question) {
  return question.circleId || question.category;
}

function isOwnPost(question, currentUserId = 'me') {
  const authorId = question.authorId;
  return authorId === currentUserId || authorId === 'me';
}

/** Posts from joined circles (incl. official). Includes the user's own posts. */
export function buildJoinedPool(questions, joinedCircleIds) {
  const joined = new Set(joinedCircleIds);
  return questions.filter((q) => joined.has(resolveCircleId(q)));
}

/** Quality-gated posts from non-joined public circles. Excludes own posts. */
export function buildDiscoveryPool(
  questions,
  { joinedCircleIds, referenceTime, hasExpertAnswer, circleById, currentUserId },
) {
  const joined = new Set(joinedCircleIds);
  const pool = [];

  for (const q of questions) {
    const circleId = resolveCircleId(q);
    if (joined.has(circleId)) continue;
    if (isOwnPost(q, currentUserId)) continue;

    const circle = circleById(circleId);
    if (!isCirclePublic(circle)) continue;

    const hotScore = score(q, referenceTime, hasExpertAnswer(q));
    if (hotScore < DISCOVERY_MIN_SCORE) continue;

    pool.push({ ...q, _hotScore: hotScore });
  }

  return pool;
}

/** Merge sorted pools 4:1 (joined:discovery). Backfill joined; cap discovery at ~20%. */
export function mergeSortedPools(joinedSorted, discoverySorted) {
  const merged = [];
  let ji = 0;
  let di = 0;

  while (ji < joinedSorted.length && di < discoverySorted.length) {
    for (let i = 0; i < JOINED_SLOTS_PER_DISCOVERY && ji < joinedSorted.length; i += 1) {
      merged.push(joinedSorted[ji]);
      ji += 1;
    }
    if (di < discoverySorted.length) {
      merged.push(discoverySorted[di]);
      di += 1;
    }
  }

  while (ji < joinedSorted.length) {
    merged.push(joinedSorted[ji]);
    ji += 1;
  }

  return merged;
}

function sortPool(pool, sortMode, referenceTime, hasExpertAnswer) {
  if (sortMode === 'new') return [...pool].sort(compareNew);
  if (pool.length && pool[0]._hotScore != null) {
    return [...pool].sort(compareHot);
  }
  return pool
    .map((post) => ({
      ...post,
      _hotScore: score(post, referenceTime, hasExpertAnswer(post)),
    }))
    .sort(compareHot);
}

/**
 * Full For You pipeline: compose pools → sort each → merge → fixed snapshot for pagination.
 */
export function composeForYouFeed(
  questions,
  {
    joinedCircleIds,
    circleById,
    currentUserId = 'me',
    referenceTime,
    hasExpertAnswer,
    sortMode = 'hot',
  },
) {
  const joinedPool = buildJoinedPool(questions, joinedCircleIds);
  const discoveryPool = buildDiscoveryPool(questions, {
    joinedCircleIds,
    referenceTime,
    hasExpertAnswer,
    circleById,
    currentUserId,
  });

  const joinedSorted = sortPool(joinedPool, sortMode, referenceTime, hasExpertAnswer);
  const discoverySorted = sortPool(discoveryPool, sortMode, referenceTime, hasExpertAnswer);

  return mergeSortedPools(joinedSorted, discoverySorted);
}
