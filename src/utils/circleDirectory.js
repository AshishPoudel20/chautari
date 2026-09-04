export const CIRCLE_DIR_SECTION_CAP = 5;
export const CIRCLE_DIR_ALL_PAGE_SIZE = 10;
/** Max joined user-circles shown under Your Circles before "See all" (official always shown). */
export const CIRCLE_DIR_YOUR_JOINED_CAP = 5;

export const CIRCLE_DIR_SECTIONS = {
  YOUR: 'your',
  POPULAR: 'popular',
  ALL: 'all',
};

export const CIRCLE_DIR_SECTION_LABELS = {
  [CIRCLE_DIR_SECTIONS.YOUR]: 'Your Circles',
  [CIRCLE_DIR_SECTIONS.POPULAR]: 'Popular',
  [CIRCLE_DIR_SECTIONS.ALL]: 'All',
};

export const CIRCLE_DIR_SEE_ALL_TITLES = {
  [CIRCLE_DIR_SECTIONS.YOUR]: 'Your Circles',
  [CIRCLE_DIR_SECTIONS.POPULAR]: 'Popular Circles',
  [CIRCLE_DIR_SECTIONS.ALL]: 'All Circles',
};

function filterByQuery(circles, query) {
  const q = query.trim().toLowerCase();
  if (!q) return circles;
  return circles.filter(
    (c) => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q),
  );
}

export function scorePopularCircle(circle, activitySince) {
  return (circle.memberCount || 0) + activitySince(circle.id) * 10;
}

/** Official first, then joined user-created circles (deduped). */
export function buildYourCirclesList(officialCircles, joinedUserCircles) {
  const seen = new Set();
  const out = [];
  for (const c of officialCircles || []) {
    if (!c?.id || seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  for (const c of joinedUserCircles || []) {
    if (!c?.id || seen.has(c.id) || c.isOfficial) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}

/** Unjoined user-created circles, ranked by members + recent activity. */
export function buildPopularList(userCircles, joinedSet, activitySince) {
  return (userCircles || [])
    .filter((c) => c && !c.isOfficial && !joinedSet.has(c.id))
    .map((c) => ({ ...c, _popScore: scorePopularCircle(c, activitySince) }))
    .sort((a, b) => b._popScore - a._popScore || (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Remaining joinable circles for All — user-created, not joined, not already
 * claimed by Popular (strict section dedupe).
 */
export function buildAllRemainingList(userCircles, joinedSet, excludeIds = []) {
  const exclude = new Set(excludeIds);
  return (userCircles || [])
    .filter((c) => c && !c.isOfficial && !joinedSet.has(c.id) && !exclude.has(c.id))
    .sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0) || a.name.localeCompare(b.name),
    );
}

/** @deprecated kept for any stray imports — prefer buildAllRemainingList */
export function buildAllList(userCircles) {
  return [...(userCircles || [])]
    .filter((c) => c && !c.isOfficial)
    .sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0) || a.name.localeCompare(b.name),
    );
}

/**
 * Build capped, deduped directory sections: Your Circles → Popular → All.
 */
export function buildDirectorySections({
  joinedUserCircles,
  officialCircles,
  userCircles,
  joinedIds,
  activitySince,
  query = '',
  cap = CIRCLE_DIR_SECTION_CAP,
  yourJoinedCap = CIRCLE_DIR_YOUR_JOINED_CAP,
  allVisibleCount = CIRCLE_DIR_ALL_PAGE_SIZE,
}) {
  const joinedSet = new Set(joinedIds);
  const searching = !!query.trim();

  const officialAll = filterByQuery(officialCircles || [], query);
  const joinedUserAll = filterByQuery(
    (joinedUserCircles || []).filter((c) => c && !c.isOfficial),
    query,
  );
  const yourFull = buildYourCirclesList(officialAll, joinedUserAll);

  const popularFull = filterByQuery(
    buildPopularList(userCircles, joinedSet, activitySince),
    query,
  );
  const popularPreview = popularFull.slice(0, cap);
  const popularPreviewIds = popularPreview.map((c) => c.id);

  const allFull = filterByQuery(
    buildAllRemainingList(userCircles, joinedSet, popularPreviewIds),
    query,
  );
  const allPreview = allFull.slice(0, Math.max(CIRCLE_DIR_ALL_PAGE_SIZE, allVisibleCount));

  // Official always in preview; only cap the joined user-created portion.
  const yourPreview = [
    ...officialAll,
    ...joinedUserAll.slice(0, yourJoinedCap),
  ];
  const yourShowSeeAll = joinedUserAll.length > yourJoinedCap;

  const sections = [];

  if (!searching || yourFull.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.YOUR,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.YOUR],
      data: yourPreview,
      totalCount: yourFull.length,
      showSeeAll: yourShowSeeAll,
      emptyHint: null,
    });
  }

  if (popularFull.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.POPULAR,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.POPULAR],
      data: popularPreview,
      totalCount: popularFull.length,
      showSeeAll: popularFull.length > cap,
    });
  }

  if (!searching || allFull.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.ALL,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.ALL],
      data: allPreview,
      totalCount: allFull.length,
      showSeeAll: false,
      showMore: allFull.length > allPreview.length,
      emptyHint: !searching && allFull.length === 0 ? 'No more circles to browse.' : null,
    });
  }

  return sections;
}

export function getSectionFullList(sectionKey, ctx) {
  const {
    joinedUserCircles,
    officialCircles,
    userCircles,
    joinedIds,
    activitySince,
    query = '',
  } = ctx;
  const joinedSet = new Set(joinedIds);

  switch (sectionKey) {
    case CIRCLE_DIR_SECTIONS.YOUR:
      return filterByQuery(
        buildYourCirclesList(officialCircles, joinedUserCircles),
        query,
      );
    case CIRCLE_DIR_SECTIONS.POPULAR:
      return filterByQuery(
        buildPopularList(userCircles, joinedSet, activitySince),
        query,
      );
    case CIRCLE_DIR_SECTIONS.ALL: {
      // Full All list = every unjoined user circle (complete catalog).
      // Main directory preview excludes Popular's capped rows; See all shows all remaining joinables.
      const popularIds = buildPopularList(userCircles, joinedSet, activitySince)
        .slice(0, CIRCLE_DIR_SECTION_CAP)
        .map((c) => c.id);
      return filterByQuery(
        buildAllRemainingList(userCircles, joinedSet, popularIds),
        query,
      );
    }
    default:
      return [];
  }
}
