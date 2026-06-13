-- Chautari — FULL RESET of the public schema
-- Run this in Supabase Dashboard → SQL Editor (as project owner).
-- WARNING: Destroys ALL tables, views, functions, and data in `public`.
-- Your project URL, anon key, and service_role key are unchanged.

-- ---------------------------------------------------------------------------
-- 1. Drop all public tables (CASCADE handles FKs)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('schema_migrations') -- keep if using CLI migrations table
  ) LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Drop public views
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
  ) LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', r.table_name);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Drop public enum types
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT t.typname
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  ) LOOP
    EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', r.typname);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Drop custom functions in public (except extension-owned)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
  ) LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s) CASCADE', r.proname, r.args);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Optional: remove Realtime publication entries for dropped tables
--    (Supabase recreates these when you re-enable Realtime per table.)
-- ---------------------------------------------------------------------------
-- No-op here; re-enable Realtime on new tables in Dashboard if needed.

SELECT 'public schema reset complete — run 001_chautari_schema.sql next' AS status;
