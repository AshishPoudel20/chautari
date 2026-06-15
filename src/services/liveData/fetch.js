import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapQuestion, mapProfileRow } from './mappers';

export async function fetchLiveBundle(currentUserId) {
  if (!isSupabaseConfigured() || !currentUserId) {
    return { questions: [], users: [], myUpvotes: { questions: [], answers: [], replies: [] }, savedQuestions: [], following: [], joinedCircles: [], checklistDone: [] };
  }

  const [
    questionsRes,
    upvotesRes,
    savedRes,
    followsRes,
    membersRes,
    checklistRes,
  ] = await Promise.all([
    supabase
      .from('questions')
      .select('*, answers(*, replies(*))')
      .order('created_at', { ascending: false }),
    supabase.from('upvotes').select('target_type, target_id').eq('user_id', currentUserId),
    supabase.from('saved_questions').select('question_id').eq('user_id', currentUserId),
    supabase.from('follows').select('following_id').eq('follower_id', currentUserId),
    supabase.from('circle_members').select('circle_id').eq('user_id', currentUserId),
    supabase.from('checklist_progress').select('item_id').eq('user_id', currentUserId),
  ]);

  if (questionsRes.error) throw questionsRes.error;
  if (upvotesRes.error) throw upvotesRes.error;
  if (savedRes.error) throw savedRes.error;
  if (followsRes.error) throw followsRes.error;
  if (membersRes.error) throw membersRes.error;
  if (checklistRes.error) throw checklistRes.error;

  const questions = (questionsRes.data || []).map((row) => mapQuestion(row, currentUserId));

  const profileIds = new Set([currentUserId]);
  for (const row of followsRes.data || []) {
    if (row.following_id) profileIds.add(row.following_id);
  }
  for (const q of questionsRes.data || []) {
    if (q.author_id) profileIds.add(q.author_id);
    for (const a of q.answers || []) {
      if (a.author_id) profileIds.add(a.author_id);
      for (const r of a.replies || []) {
        if (r.author_id) profileIds.add(r.author_id);
      }
    }
  }

  let users = [];
  if (profileIds.size > 0) {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', [...profileIds]);
    if (error) throw error;
    users = (profiles || []).map((p) => mapProfileRow(p, currentUserId)).filter(Boolean);
  }

  const myUpvotes = { questions: [], answers: [], replies: [] };
  for (const row of upvotesRes.data || []) {
    if (row.target_type === 'question') myUpvotes.questions.push(row.target_id);
    else if (row.target_type === 'answer') myUpvotes.answers.push(row.target_id);
    else if (row.target_type === 'reply') myUpvotes.replies.push(row.target_id);
  }

  return {
    questions,
    users,
    myUpvotes,
    savedQuestions: (savedRes.data || []).map((r) => r.question_id),
    following: (followsRes.data || []).map((r) => r.following_id),
    joinedCircles: (membersRes.data || []).map((r) => r.circle_id),
    checklistDone: (checklistRes.data || []).map((r) => r.item_id),
  };
}
