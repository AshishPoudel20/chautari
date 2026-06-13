# Chautari — Supabase setup

Reuse your **existing Supabase project** (same project URL, anon key, JWT secret). These scripts wipe the old experiment and install the schema that matches the current React Native prototype.

## What stays the same

- Project URL (`https://xxxx.supabase.co`)
- `anon` public key (safe in the mobile app)
- `service_role` key (server-only — never commit or ship in the client)
- Phone auth / Twilio config in Dashboard (if already set up)

## What gets destroyed

- All tables in the `public` schema from the old model
- All rows (questions, users, etc.)
- All **Authentication users** (if you run `003_clear_auth_users.sql`)

## Run order (Supabase Dashboard → SQL Editor)

Run each file **in order**, one at a time. Check the result panel shows success before continuing.

| Step | File | Purpose |
|------|------|---------|
| 1 | `migrations/000_reset_public_schema.sql` | Drop all old public tables/views/types |
| 2 | `migrations/003_clear_auth_users.sql` | **Optional** — delete all login users |
| 3 | `migrations/001_chautari_schema.sql` | Create new tables + RLS |
| 4 | `migrations/002_seed_reference_data.sql` | Official circles + checklist catalog |

### Storage (if you used buckets before)

Dashboard → **Storage** → delete old buckets/files manually, then create new ones when you add photo upload (e.g. `avatars`, `question-photos`, `credentials`).

### Edge Functions / webhooks

Dashboard → **Edge Functions** — delete or redeploy anything from the old experiment.

---

## Environment variables (when you wire the app)

Copy `.env.example` to `.env` in the project root (`.env` is gitignored):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

**Never** put `service_role` in the Expo app.

---

## Schema overview

```
auth.users
    └── profiles (1:1)
circles ← circle_members → profiles
questions → answers → replies
follows · saved_questions · upvotes
notifications · reports · expert_applications
checklist_items · checklist_progress
```

Karma is **computed** from upvotes (same as the prototype) — not stored.

---

## After reset

1. The app uses **hybrid data**: mock feed/users from `seed.js` + **real `profiles` rows** after onboarding.
2. Dashboard → Authentication → **Email** → ON, **Confirm email** → OFF (prototype sign-up uses email under the hood).
3. Default: mock OTP (any 6 digits). Your profile is written to Supabase when you tap **Finish** on onboarding.
4. Set `EXPO_PUBLIC_AUTH_DEV_MODE=false` in `.env` when Twilio SMS is ready for real phone OTP.
5. Test: sign up → finish onboarding → check Table Editor → `profiles`.

---

## CLI alternative (optional)

If you install [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For a one-shot reset on a dev project, the SQL Editor approach above is simpler.
