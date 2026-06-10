// Karma — derived contribution score from upvotes received (not from posting).

export const KARMA = {
  ANSWER_UPVOTE: 10,
  QUESTION_UPVOTE: 2,
  REPLY_UPVOTE: 1,
  EXPERT_BONUS: 25,
};

export function computeKarmaForUser(state, userId) {
  if (!userId) return 0;
  let karma = 0;
  for (const q of state.questions || []) {
    if (q.authorId === userId) karma += (q.upvotes || 0) * KARMA.QUESTION_UPVOTE;
    for (const a of q.answers || []) {
      if (a.authorId === userId) karma += (a.upvotes || 0) * KARMA.ANSWER_UPVOTE;
      for (const r of a.replies || []) {
        if (r.authorId === userId) karma += (r.upvotes || 0) * KARMA.REPLY_UPVOTE;
      }
    }
  }
  const bonuses = state.expertUpvoteBonuses?.[userId] || 0;
  karma += bonuses * KARMA.EXPERT_BONUS;
  return karma;
}

export function computeAllKarma(state) {
  const map = {};
  for (const u of state.users || []) {
    map[u.id] = computeKarmaForUser(state, u.id);
  }
  return map;
}
