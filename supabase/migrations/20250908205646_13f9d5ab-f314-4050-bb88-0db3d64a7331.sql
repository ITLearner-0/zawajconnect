-- Create table for saving matching preferences
CREATE TABLE public.matching_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  use_ai_scoring BOOLEAN NOT NULL DEFAULT true,
  weight_islamic INTEGER NOT NULL DEFAULT 40,
  weight_cultural INTEGER NOT NULL DEFAULT 30,
  weight_personality INTEGER NOT NULL DEFAULT 30,
  min_compatibility INTEGER NOT NULL DEFAULT 70,
  family_approval_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for matching history
CREATE TABLE public.matching_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_profiles JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferences_used JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_matches INTEGER NOT NULL DEFAULT 0,
  avg_compatibility_score NUMERIC(5,2),
  search_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matching_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matching_preferences
CREATE POLICY "Users can manage their own matching preferences" 
ON public.matching_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for matching_history
CREATE POLICY "Users can manage their own matching history" 
ON public.matching_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_matching_preferences_updated_at
BEFORE UPDATE ON public.matching_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();