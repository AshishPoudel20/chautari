import { seedQuestions } from '../../data/seed';

const SEED_QUESTION_IDS = new Set(seedQuestions.map((q) => q.id));

/** Mock seed threads — local only. User-created ids (e.g. q_m4abc) sync to Supabase. */
export function isLiveQuestionId(questionId) {
  return questionId && !SEED_QUESTION_IDS.has(questionId);
}

export function isMockUserId(userId) {
  return !userId || userId === 'me' || String(userId).startsWith('u_') || userId === 'me_seed_anon';
}

let idCounter = 1;
export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${idCounter++}`;
}
