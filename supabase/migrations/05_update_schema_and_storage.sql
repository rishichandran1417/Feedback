-- Migration 05: Update Schema, Storage Bucket, and Course Programme

-- 1. Add course_programme to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS course_programme TEXT;

-- 2. Storage Bucket setup for private evidence
-- Create bucket 'submission-evidence'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submission-evidence',
  'submission-evidence',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- 3. Storage Policies for 'submission-evidence'
-- Students can upload only to their own submission folders: {student_id}/*
CREATE POLICY "Students can upload evidence for own submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submission-evidence' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can read evidence for their own submissions
CREATE POLICY "Students can read own submission evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-evidence' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
  )
);

-- Admins can view and download all evidence
CREATE POLICY "Admins have full access to evidence"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'submission-evidence' AND
  public.is_admin()
);
