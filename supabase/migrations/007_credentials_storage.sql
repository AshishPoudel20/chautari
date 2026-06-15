-- Allow expert credential uploads under credentials/{userId}/application/
DROP POLICY IF EXISTS "media_auth_insert" ON storage.objects;
CREATE POLICY "media_auth_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[2] = auth.uid()::text
    AND (storage.foldername(name))[1] IN (
      'avatars', 'questions', 'circles', 'answers', 'replies', 'credentials'
    )
  );
