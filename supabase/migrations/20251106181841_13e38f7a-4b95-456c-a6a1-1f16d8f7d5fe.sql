-- Create profile_tags table for user-defined tags
CREATE TABLE IF NOT EXISTS public.profile_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, tag_name)
);

-- Create favorite_tags junction table
CREATE TABLE IF NOT EXISTS public.favorite_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  favorite_id UUID NOT NULL REFERENCES public.profile_favorites(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.profile_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(favorite_id, tag_id)
);

-- Create note_tags junction table
CREATE TABLE IF NOT EXISTS public.note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.profile_notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.profile_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(note_id, tag_id)
);

-- Enable RLS on profile_tags
ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;

-- Users can view their own tags
CREATE POLICY "Users can view their own tags"
ON public.profile_tags
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tags
CREATE POLICY "Users can create their own tags"
ON public.profile_tags
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tags
CREATE POLICY "Users can update their own tags"
ON public.profile_tags
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tags
CREATE POLICY "Users can delete their own tags"
ON public.profile_tags
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on favorite_tags
ALTER TABLE public.favorite_tags ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorite tags
CREATE POLICY "Users can view their own favorite tags"
ON public.favorite_tags
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profile_favorites pf
  WHERE pf.id = favorite_tags.favorite_id
  AND pf.user_id = auth.uid()
));

-- Users can manage their own favorite tags
CREATE POLICY "Users can manage their own favorite tags"
ON public.favorite_tags
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profile_favorites pf
  WHERE pf.id = favorite_tags.favorite_id
  AND pf.user_id = auth.uid()
));

-- Enable RLS on note_tags
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- Users can view their own note tags
CREATE POLICY "Users can view their own note tags"
ON public.note_tags
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profile_notes pn
  WHERE pn.id = note_tags.note_id
  AND pn.user_id = auth.uid()
));

-- Users can manage their own note tags
CREATE POLICY "Users can manage their own note tags"
ON public.note_tags
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.profile_notes pn
  WHERE pn.id = note_tags.note_id
  AND pn.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_profile_tags_user_id ON public.profile_tags(user_id);
CREATE INDEX idx_favorite_tags_favorite_id ON public.favorite_tags(favorite_id);
CREATE INDEX idx_favorite_tags_tag_id ON public.favorite_tags(tag_id);
CREATE INDEX idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON public.note_tags(tag_id);