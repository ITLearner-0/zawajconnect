-- =====================================================
-- CREATE STORAGE BUCKET FOR WALI DOCUMENTS
-- =====================================================

-- Create the documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR WALI DOCUMENTS
-- =====================================================

-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own wali documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'wali-documents'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own wali documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'wali-documents'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow admins to view all wali documents
CREATE POLICY "Admins can view all wali documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'wali-documents'
  AND is_admin(auth.uid())
);

-- Allow users to delete their own documents (only if registration is pending)
CREATE POLICY "Users can delete their own pending wali documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'wali-documents'
  AND auth.uid()::text = (storage.foldername(name))[2]
  AND EXISTS (
    SELECT 1 FROM wali_registrations
    WHERE user_id = auth.uid()
    AND status = 'pending'
  )
);