-- Allow answers and replies of any length. Only an empty / whitespace-only body is rejected.
-- Run after 001_chautari_schema.sql (and later migrations). Safe to re-run.

ALTER TABLE public.answers DROP CONSTRAINT IF EXISTS answers_body_check;
ALTER TABLE public.answers
  ADD CONSTRAINT answers_body_check CHECK (char_length(btrim(body)) > 0);

ALTER TABLE public.replies DROP CONSTRAINT IF EXISTS replies_body_check;
ALTER TABLE public.replies
  ADD CONSTRAINT replies_body_check CHECK (char_length(btrim(body)) > 0);
