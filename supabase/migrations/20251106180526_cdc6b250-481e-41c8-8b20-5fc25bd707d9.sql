-- Create profile_notes table for private notes on profiles
CREATE TABLE IF NOT EXISTS public.profile_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.profile_notes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notes
CREATE POLICY "Users can manage their own profile notes"
ON public.profile_notes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_profile_notes_user_profile ON public.profile_notes(user_id, profile_id);

-- Trigger for updated_at
CREATE TRIGGER update_profile_notes_updated_at
  BEFORE UPDATE ON public.profile_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();