-- Chautari — DELETE ALL AUTH USERS (optional, run only if you want a clean auth slate)
-- WARNING: Irreversible. Removes every login from Authentication.
-- Your Supabase URL + anon key + service_role key are NOT affected.
--
-- Run in SQL Editor. Requires sufficient privileges (project owner / postgres role).
-- If this fails with permission denied, use Dashboard instead:
--   Authentication → Users → select all → Delete users

-- Remove identities first (OAuth / phone links)
DELETE FROM auth.identities;

-- Remove all auth users (cascades to public.profiles via FK)
DELETE FROM auth.users;

SELECT 'All auth users deleted' AS status;
