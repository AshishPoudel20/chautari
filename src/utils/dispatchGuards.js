/** In-flight dedupe key for toggle actions that write unique rows. */
export function inflightKeyForAction(action) {
  if (!action?.type) return null;
  switch (action.type) {
    case 'TOGGLE_UPVOTE_QUESTION':
      return `uv:q:${action.questionId}`;
    case 'TOGGLE_UPVOTE_ANSWER':
      return `uv:a:${action.answerId}`;
    case 'TOGGLE_UPVOTE_REPLY':
      return `uv:r:${action.replyId}`;
    case 'TOGGLE_FOLLOW':
      return `follow:${action.userId}`;
    case 'TOGGLE_SAVE_QUESTION':
      return `save:${action.questionId}`;
    case 'TOGGLE_JOIN_CIRCLE':
      return `join:${action.circleId}`;
    case 'TOGGLE_CHECKLIST_ITEM':
      return `check:${action.itemId}`;
    default:
      return null;
  }
}

/** Postgres unique-violation — duplicate toggle is already applied server-side. */
export function isBenignDuplicateError(error) {
  return error?.code === '23505';
}
