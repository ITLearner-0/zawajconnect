-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  match_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'matches', 'private')),
  search_distance INTEGER DEFAULT 50 CHECK (search_distance >= 1 AND search_distance <= 500),
  age_min INTEGER DEFAULT 18 CHECK (age_min >= 18 AND age_min <= 100),
  age_max INTEGER DEFAULT 50 CHECK (age_max >= 18 AND age_max <= 100),
  auto_accept_matches BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add phone field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();