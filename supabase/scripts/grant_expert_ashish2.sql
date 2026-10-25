-- Grant verified-expert status to ashish2 (Cardiologist · Health & Medical).
-- Safe to re-run; targets profile by display name.
-- Requires migration 009 columns (expert_badge_title, expert_circle_id).

UPDATE public.profiles
SET
  verified = TRUE,
  expert_badge_title = 'Cardiologist',
  expert_circle_id = 'health',
  profession = 'Cardiologist',
  verified_category = 'health',
  updated_at = now()
WHERE name ILIKE 'ashish2';
