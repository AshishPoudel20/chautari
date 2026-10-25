const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when id is a Postgres-compatible UUID string (safe for profiles.id / author_id columns). */
export function isValidUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id);
}

/** Drop non-UUID ids before any Supabase query against a UUID column. */
export function filterValidUuids(ids) {
  return [...new Set((ids || []).filter(isValidUuid))];
}

let idCounter = 1;
export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${idCounter++}`;
}
