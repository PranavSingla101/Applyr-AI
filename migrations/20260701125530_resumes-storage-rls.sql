-- Path-scoped RLS for the private "resumes" bucket.
-- Keys are written as `{user_id}/resume.pdf`, so ownership is the first path segment.

CREATE POLICY storage_objects_resumes_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY storage_objects_resumes_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY storage_objects_resumes_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  )
  WITH CHECK (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY storage_objects_resumes_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
