export function authorToApp(authorId, currentUserId) {
  if (!authorId) return null;
  return authorId === currentUserId ? 'me' : authorId;
}

export function authorToDb(authorId, currentUserId) {
  if (authorId === 'me') return currentUserId;
  return authorId;
}

export function mapReply(row, currentUserId) {
  return {
    id: row.id,
    authorId: authorToApp(row.author_id, currentUserId),
    anonymous: row.anonymous,
    postedAsExpert: !!row.posted_as_expert,
    body: row.body,
    photo: row.photo_url || null,
    createdAt: new Date(row.created_at).getTime(),
    upvotes: row.upvotes ?? 0,
  };
}

export function mapAnswer(row, currentUserId) {
  const replies = (row.replies || [])
    .map((r) => mapReply(r, currentUserId))
    .sort((a, b) => a.createdAt - b.createdAt);
  return {
    id: row.id,
    authorId: authorToApp(row.author_id, currentUserId),
    anonymous: row.anonymous,
    body: row.body,
    photo: row.photo_url || null,
    createdAt: new Date(row.created_at).getTime(),
    upvotes: row.upvotes ?? 0,
    replies,
  };
}

export function mapQuestion(row, currentUserId) {
  const answers = (row.answers || [])
    .map((a) => mapAnswer(a, currentUserId))
    .sort((a, b) => a.createdAt - b.createdAt);
  return {
    id: row.id,
    authorId: authorToApp(row.author_id, currentUserId),
    anonymous: row.anonymous,
    postedAsExpert: !!row.posted_as_expert,
    circleId: row.circle_id,
    title: row.title,
    body: row.body,
    photos: row.photos || [],
    createdAt: new Date(row.created_at).getTime(),
    upvotes: row.upvotes ?? 0,
    views: row.views ?? 0,
    answers,
  };
}

export function mapProfileRow(row, currentUserId) {
  if (!row) return null;
  const id = row.id === currentUserId ? 'me' : row.id;
  return {
    id,
    name: row.name || '',
    suburb: row.suburb || null,
    photo: row.photo_url || null,
    bio: row.bio || '',
    verified: !!row.verified,
    verifiedCategory: row.verified_category || null,
    profession: row.profession || null,
    contact: row.contact || null,
    isFoundingMember: !!row.is_founding_member,
    followers: row.followers_count ?? 0,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}
