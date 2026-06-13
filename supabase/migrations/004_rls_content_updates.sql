-- Allow authenticated users to update vote counts on Q&A content
CREATE POLICY questions_update_votes ON public.questions FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY answers_update_votes ON public.answers FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY replies_update_votes ON public.replies FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

SELECT 'Content update policies added' AS status;
