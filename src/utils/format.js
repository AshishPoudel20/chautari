// Small formatting helpers. Relative time is everywhere in the feed — it is the
// single biggest "this place is alive" signal (Build Brief v2).

// "just now", "4 min ago", "2 hr ago", "3 days ago", "2 wks ago"...
export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 45) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w} wk${w === 1 ? '' : 's'} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} mo ago`;
  return `${Math.floor(d / 365)} yr ago`;
}

// Circle "created" line — short month + year, not feed-relative.
export function formatShortDate(ts) {
  return new Date(ts).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
}

// Posted within the last ~24h → eligible for the recency "new" treatment.
export function isRecent(ts, withinMs = 24 * 60 * 60 * 1000) {
  return Date.now() - ts < withinMs;
}

// Local calendar day start — used for expert daily post caps.
export function startOfLocalDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function compactNumber(n) {
  if (n == null) return '0';
  if (n < 1000) return `${n}`;
  if (n < 1000000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1000000).toFixed(1)}M`;
}

// Anonymous display: brief says hide name/photo/suburb.
export function displayAuthor(user, anonymous) {
  if (anonymous || !user) {
    return { name: 'Anonymous', suburb: null, photo: null, verified: false, anon: true, id: user?.id };
  }
  return { ...user, anon: false };
}

// Upvote milestones — moments worth celebrating (Build Brief v2).
export const MILESTONES = [5, 10, 20, 50, 100, 200, 500];

// If `prev` is below a milestone and `next` reaches/passes it, return that
// milestone (the highest one newly crossed), else null.
export function milestoneCrossed(prev, next) {
  if (next <= prev) return null;
  let hit = null;
  for (const m of MILESTONES) {
    if (prev < m && next >= m) hit = m;
  }
  return hit;
}

// How close a count is to the next milestone (for the "almost there" hint).
export function nextMilestone(n) {
  for (const m of MILESTONES) if (n < m) return m;
  return null;
}
