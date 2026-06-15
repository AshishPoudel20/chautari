-- Per-post/reply expert mode (optional; NULL = legacy verified posts keep badging).
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS posted_as_expert BOOLEAN;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS profession_label TEXT;

ALTER TABLE public.replies ADD COLUMN IF NOT EXISTS posted_as_expert BOOLEAN;
ALTER TABLE public.replies ADD COLUMN IF NOT EXISTS profession_label TEXT;
