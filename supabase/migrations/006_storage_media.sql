-- Chautari — Supabase Storage for user media (photos)
-- Run AFTER 005_flexible_social_refs.sql
--
-- Bucket: public `media` (images are public Q&A / profile content)
-- Path layout (second segment is always auth.uid() for write/delete ownership):
--   avatars/{userId}/{filename}
--   questions/{userId}/{questionId}/{filename}
--   circles/{userId}/{circleId}/{filename}
--   answers/{userId}/{answerId}/{filename}
--   replies/{userId}/{replyId}/{filename}
--
-- Client uses EXPO_PUBLIC_SUPABASE_ANON_KEY only — never a service role key.

-- ---------------------------------------------------------------------------
-- Table columns for persisted public URLs
-- ---------------------------------------------------------------------------
ALTER TABLE public.circles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.replies ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage policies
-- ---------------------------------------------------------------------------

-- Anyone can read (public bucket — cross-account image viewing)
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Authenticated users upload only into their own uid segment
DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
CREATE POLICY "media_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND (storage.foldername(name))[1] IN (
      'avatars', 'questions', 'circles', 'answers', 'replies'
    )
  );

-- Users may update (upsert) their own objects
DROP POLICY IF EXISTS "media_auth_update" ON storage.objects;
CREATE POLICY "media_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users may delete only their own objects
DROP POLICY IF EXISTS "media_auth_delete" ON storage.objects;
CREATE POLICY "media_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
