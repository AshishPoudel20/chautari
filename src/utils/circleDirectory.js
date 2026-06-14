export const CIRCLE_DIR_SECTION_CAP = 5;

export const CIRCLE_DIR_SECTIONS = {
  YOUR: 'your',
  OFFICIAL: 'official',
  POPULAR: 'popular',
  NEW: 'new',
  RECOMMENDED: 'recommended',
};

export const CIRCLE_DIR_SECTION_LABELS = {
  [CIRCLE_DIR_SECTIONS.YOUR]: 'Your Circles',
  [CIRCLE_DIR_SECTIONS.OFFICIAL]: 'Official',
  [CIRCLE_DIR_SECTIONS.POPULAR]: 'Popular',
  [CIRCLE_DIR_SECTIONS.NEW]: 'New',
  [CIRCLE_DIR_SECTIONS.RECOMMENDED]: 'Recommended',
};

export const CIRCLE_DIR_SEE_ALL_TITLES = {
  [CIRCLE_DIR_SECTIONS.YOUR]: 'Your Circles',
  [CIRCLE_DIR_SECTIONS.OFFICIAL]: 'Official Circles',
  [CIRCLE_DIR_SECTIONS.POPULAR]: 'Popular Circles',
  [CIRCLE_DIR_SECTIONS.NEW]: 'New Circles',
  [CIRCLE_DIR_SECTIONS.RECOMMENDED]: 'Recommended Circles',
};

function filterByQuery(circles, query) {
  const q = query.trim().toLowerCase();
  if (!q) return circles;
  return circles.filter(
    (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
  );
}

export function scorePopularCircle(circle, activitySince) {
  return (circle.memberCount || 0) + activitySince(circle.id) * 10;
}

export function buildPopularList(userCircles, joinedSet, activitySince) {
  return userCircles
    .filter((c) => !joinedSet.has(c.id))
    .map((c) => ({ ...c, _popScore: scorePopularCircle(c, activitySince) }))
    .sort((a, b) => b._popScore - a._popScore || b.createdAt - a.createdAt);
}

export function buildNewList(userCircles, joinedSet) {
  return userCircles
    .filter((c) => !joinedSet.has(c.id))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function buildRecommendedList(circles, joinedSet, limit = Infinity) {
  const joinedWords = new Set();
  circles
    .filter((c) => joinedSet.has(c.id) && !c.isOfficial)
    .forEach((c) => {
      `${c.name} ${c.description}`.toLowerCase().split(/\W+/).forEach((w) => {
        if (w.length > 3) joinedWords.add(w);
      });
    });

  return circles
    .filter((c) => !c.isOfficial && !joinedSet.has(c.id))
    .map((c) => {
      let score = c.memberCount || 0;
      `${c.name} ${c.description}`.toLowerCase().split(/\W+/).forEach((w) => {
        if (joinedWords.has(w)) score += 45;
      });
      return { c, score };
    })
    .sort((a, b) => b.score - a.score || b.c.createdAt - a.c.createdAt)
    .slice(0, limit)
    .map((x) => x.c);
}

function takeUnique(list, used, max) {
  const out = [];
  for (const c of list) {
    if (used.has(c.id)) continue;
    used.add(c.id);
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Build capped, deduped directory sections for the main Circles screen.
 */
export function buildDirectorySections({
  joinedUserCircles,
  officialCircles,
  userCircles,
  joinedIds,
  activitySince,
  query = '',
  cap = CIRCLE_DIR_SECTION_CAP,
}) {
  const joinedSet = new Set(joinedIds);
  const searching = !!query.trim();

  const yourAll = filterByQuery(joinedUserCircles, query);
  const officialAll = filterByQuery(officialCircles, query);
  const popularAll = filterByQuery(buildPopularList(userCircles, joinedSet, activitySince), query);
  const newAll = filterByQuery(buildNewList(userCircles, joinedSet), query);
  const recommendedAll = filterByQuery(buildRecommendedList(userCircles, joinedSet), query);

  const used = new Set();
  yourAll.forEach((c) => used.add(c.id));
  officialAll.forEach((c) => used.add(c.id));

  const yourPreview = yourAll.slice(0, cap);
  const officialPreview = officialAll;
  const popularPreview = takeUnique(popularAll, used, cap);
  const newPreview = takeUnique(newAll, used, cap);
  const recommendedPreview = takeUnique(recommendedAll, used, cap);

  const sections = [];

  if (!searching || yourAll.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.YOUR,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.YOUR],
      data: yourPreview,
      totalCount: yourAll.length,
      showSeeAll: yourAll.length > cap,
      emptyHint: !searching && yourAll.length === 0 ? 'Join circles to see them here.' : null,
    });
  }

  if (officialAll.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.OFFICIAL,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.OFFICIAL],
      data: officialPreview,
      totalCount: officialAll.length,
      showSeeAll: false,
    });
  }

  if (popularAll.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.POPULAR,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.POPULAR],
      data: popularPreview,
      totalCount: popularAll.length,
      showSeeAll: popularAll.length > cap,
    });
  }

  if (newAll.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.NEW,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.NEW],
      data: newPreview,
      totalCount: newAll.length,
      showSeeAll: newAll.length > cap,
    });
  }

  if (recommendedAll.length) {
    sections.push({
      key: CIRCLE_DIR_SECTIONS.RECOMMENDED,
      title: CIRCLE_DIR_SECTION_LABELS[CIRCLE_DIR_SECTIONS.RECOMMENDED],
      data: recommendedPreview,
      totalCount: recommendedAll.length,
      showSeeAll: recommendedAll.length > cap,
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
      return filterByQuery(joinedUserCircles, query);
    case CIRCLE_DIR_SECTIONS.OFFICIAL:
      return filterByQuery(officialCircles, query);
    case CIRCLE_DIR_SECTIONS.POPULAR:
      return filterByQuery(buildPopularList(userCircles, joinedSet, activitySince), query);
    case CIRCLE_DIR_SECTIONS.NEW:
      return filterByQuery(buildNewList(userCircles, joinedSet), query);
    case CIRCLE_DIR_SECTIONS.RECOMMENDED:
      return filterByQuery(buildRecommendedList(userCircles, joinedSet), query);
    default:
      return [];
  }
}
