-- Per-post expert identity: badge/card styling only when posted_as_expert is true.
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS posted_as_expert BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.replies
  ADD COLUMN IF NOT EXISTS posted_as_expert BOOLEAN NOT NULL DEFAULT FALSE;
