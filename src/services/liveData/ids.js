import { seedQuestions } from '../../data/seed';

const SEED_QUESTION_IDS = new Set(seedQuestions.map((q) => q.id));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when id is a Postgres-compatible UUID string (safe for profiles.id / author_id columns). */
export function isValidUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id);
}

/** Drop mock/seed ids before any Supabase query against a UUID column. */
export function filterValidUuids(ids) {
  return [...new Set((ids || []).filter(isValidUuid))];
}

/** Mock seed threads — local only. User-created ids (e.g. q_m4abc) sync to Supabase. */
export function isLiveQuestionId(questionId) {
  return questionId && !SEED_QUESTION_IDS.has(questionId);
}

/** Seed/mock users (u_*) — local display only; never query profiles.id with these. */
export function isMockUserId(userId) {
  return !userId || userId === 'me' || String(userId).startsWith('u_') || userId === 'me_seed_anon';
}

let idCounter = 1;
export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${idCounter++}`;
}
