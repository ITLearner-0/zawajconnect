-- Storage bucket for IT certification PDFs

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'it-certification-pdfs',
  'it-certification-pdfs',
  false, -- Private bucket, only admins can access
  52428800, -- 50MB limit per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for PDF bucket

-- Only admins can upload PDFs
CREATE POLICY "Admins can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'it-certification-pdfs'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can view PDFs
CREATE POLICY "Admins can view PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'it-certification-pdfs'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can update PDFs
CREATE POLICY "Admins can update PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'it-certification-pdfs'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can delete PDFs
CREATE POLICY "Admins can delete PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'it-certification-pdfs'
    AND EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
