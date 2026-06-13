import { PAGE_SIZE, score } from './rankingConfig';

/** New feed: createdAt DESC, id DESC. */
export function compareNew(a, b) {
  if (b.createdAt !== a.createdAt) return b.createdAt - a.createdAt;
  return b.id.localeCompare(a.id);
}

/** Hot feed: score DESC, id DESC (score must be precomputed on each row). */
export function compareHot(a, b) {
  if (b._hotScore !== a._hotScore) return b._hotScore - a._hotScore;
  return b.id.localeCompare(a.id);
}

export function buildNewSnapshot(posts) {
  return [...posts].sort(compareNew);
}

/** Fixed Hot snapshot — scores computed once at referenceTime. */
export function buildHotSnapshot(posts, referenceTime, hasExpertAnswer) {
  return posts
    .map((post) => ({
      ...post,
      _hotScore: score(post, referenceTime, hasExpertAnswer(post)),
    }))
    .sort(compareHot);
}

/** Keyset cursor for New: next page starts after (createdAt, id). */
export function newCursorAfter(post) {
  if (!post) return null;
  return { createdAt: post.createdAt, id: post.id };
}

/** Keyset cursor for Hot: next page starts after (score, id). */
export function hotCursorAfter(post) {
  if (!post) return null;
  return { score: post._hotScore, id: post.id };
}

function isBeforeNewCursor(post, cursor) {
  if (post.createdAt < cursor.createdAt) return true;
  if (post.createdAt > cursor.createdAt) return false;
  return post.id.localeCompare(cursor.id) < 0;
}

function isBeforeHotCursor(post, cursor) {
  if (post._hotScore < cursor.score) return true;
  if (post._hotScore > cursor.score) return false;
  return post.id.localeCompare(cursor.id) < 0;
}

/**
 * Return up to pageSize items after cursor (null = first page).
 * Operates on a fixed sorted snapshot — referenceTime must not change between pages.
 */
export function pageFromSnapshot(sortedPosts, { mode, cursor, pageSize = PAGE_SIZE }) {
  let start = 0;
  if (cursor) {
    start = sortedPosts.findIndex((post) => {
      if (mode === 'hot') return isBeforeHotCursor(post, cursor);
      return isBeforeNewCursor(post, cursor);
    });
    if (start < 0) start = sortedPosts.length;
  }
  const items = sortedPosts.slice(start, start + pageSize);
  const last = items[items.length - 1];
  const nextCursor = items.length === pageSize && last
    ? (mode === 'hot' ? hotCursorAfter(last) : newCursorAfter(last))
    : null;
  return { items, nextCursor, hasMore: nextCursor != null };
}

/** Client infinite scroll: expand visible window over a fixed snapshot. */
export function sliceSnapshot(sortedPosts, visibleCount) {
  return sortedPosts.slice(0, visibleCount);
}

export function hasMoreInSnapshot(sortedPosts, visibleCount) {
  return visibleCount < sortedPosts.length;
}
