
-- Add madhab (Islamic school of jurisprudence) field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS madhab TEXT;

-- Add document verification fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS document_verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS document_verification_type TEXT,
ADD COLUMN IF NOT EXISTS document_verification_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS document_verification_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS document_verification_reviewed_by UUID,
ADD COLUMN IF NOT EXISTS document_verification_notes TEXT;

-- Add photo blur settings to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photo_blur_settings JSONB DEFAULT '{
  "blur_profile_picture": false,
  "blur_gallery_photos": false,
  "blur_until_approved": false,
  "blur_for_non_matches": true
}'::jsonb;

-- Create document verification table for storing uploaded documents
CREATE TABLE IF NOT EXISTS public.document_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'id_card', 'passport', 'driver_license'
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on document_verifications
ALTER TABLE public.document_verifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own document verifications
CREATE POLICY "Users can view their own document verifications" 
  ON public.document_verifications 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy for users to insert their own document verifications
CREATE POLICY "Users can submit their own document verifications" 
  ON public.document_verifications 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Policy for admins to view all document verifications (will need admin role system)
CREATE POLICY "Admins can view all document verifications" 
  ON public.document_verifications 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add session tracking table for automatic logout
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 minutes'),
  device_info JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own sessions
CREATE POLICY "Users can manage their own sessions" 
  ON public.user_sessions 
  FOR ALL
  USING (user_id = auth.uid());

-- Function to update session activity
CREATE OR REPLACE FUNCTION public.update_session_activity(
  session_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET 
    last_activity = now(),
    expires_at = now() + INTERVAL '30 minutes'
  WHERE session_token = session_token
    AND expires_at > now();
    
  RETURN FOUND;
END;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_sessions 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
