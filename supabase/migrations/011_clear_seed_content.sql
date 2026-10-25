-- Clear leftover seed-thread pointers and empty seed user circles from 002.
-- Safe to re-run. Never touches official circles or the 10 checklist_items rows
-- (only nulls question_id when the target question does not exist).

UPDATE public.checklist_items
SET question_id = NULL
WHERE question_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.questions q WHERE q.id = checklist_items.question_id
  );

DELETE FROM public.circles
WHERE id IN ('c_footscray', 'c_fhb', 'c_monash', 'c_cricket', 'c_tiny')
  AND is_official = FALSE
  AND NOT EXISTS (SELECT 1 FROM public.questions q WHERE q.circle_id = circles.id)
  AND NOT EXISTS (SELECT 1 FROM public.circle_members m WHERE m.circle_id = circles.id);

SELECT
  (SELECT count(*) FROM public.circles WHERE id IN ('c_footscray', 'c_fhb', 'c_monash', 'c_cricket', 'c_tiny')) AS seed_circles_remaining,
  (SELECT count(*) FROM public.checklist_items WHERE question_id IS NOT NULL) AS checklist_items_with_thread;
