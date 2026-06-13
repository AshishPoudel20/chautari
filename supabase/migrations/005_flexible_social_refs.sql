-- Allow saving seed question ids and following mock/seed user ids (hybrid prototype)
ALTER TABLE public.saved_questions
  DROP CONSTRAINT IF EXISTS saved_questions_question_id_fkey;

ALTER TABLE public.follows
  DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE public.follows
  DROP CONSTRAINT IF EXISTS follows_check;

ALTER TABLE public.follows
  DROP CONSTRAINT IF EXISTS follows_follower_id_following_id_check;

ALTER TABLE public.follows
  ALTER COLUMN following_id TYPE TEXT USING following_id::text;

ALTER TABLE public.follows
  ADD CONSTRAINT follows_no_self_follow CHECK (follower_id::text <> following_id);

SELECT 'Social refs relaxed for hybrid mock + live data' AS status;
