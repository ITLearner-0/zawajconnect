-- Create enhanced tables for matrimonial platform

-- Create Islamic preferences table
CREATE TABLE public.islamic_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  prayer_frequency TEXT CHECK (prayer_frequency IN ('5_times_daily', 'sometimes', 'fridays_only', 'occasionally')),
  quran_reading TEXT CHECK (quran_reading IN ('daily', 'weekly', 'monthly', 'occasionally', 'learning')),
  hijab_preference TEXT CHECK (hijab_preference IN ('yes', 'no', 'sometimes', 'prefer_not_to_say')),
  beard_preference TEXT CHECK (beard_preference IN ('yes', 'no', 'sometimes', 'prefer_not_to_say')),
  sect TEXT CHECK (sect IN ('sunni', 'shia', 'other', 'prefer_not_to_say')),
  madhab TEXT,
  halal_diet BOOLEAN DEFAULT true,
  smoking TEXT CHECK (smoking IN ('never', 'occasionally', 'regularly')),
  desired_partner_sect TEXT CHECK (desired_partner_sect IN ('sunni', 'shia', 'any', 'other')),
  importance_of_religion TEXT CHECK (importance_of_religion IN ('very_important', 'important', 'somewhat_important', 'not_important')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  user1_liked BOOLEAN DEFAULT false,
  user2_liked BOOLEAN DEFAULT false,
  is_mutual BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profile views table (for tracking who viewed whose profile)
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(viewer_id, viewed_id)
);

-- Enable RLS on all tables
ALTER TABLE public.islamic_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for islamic_preferences
CREATE POLICY "Users can view all Islamic preferences" 
ON public.islamic_preferences FOR SELECT USING (true);

CREATE POLICY "Users can create their own Islamic preferences" 
ON public.islamic_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Islamic preferences" 
ON public.islamic_preferences FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches" 
ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches" 
ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own matches" 
ON public.matches FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their matches" 
ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches" 
ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    AND matches.is_mutual = true
  )
);

-- RLS Policies for profile_views
CREATE POLICY "Users can view their own profile views" 
ON public.profile_views FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = viewed_id);

CREATE POLICY "Users can create profile views" 
ON public.profile_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Create triggers for updated_at
CREATE TRIGGER update_islamic_preferences_updated_at
  BEFORE UPDATE ON public.islamic_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create Islamic preferences on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.islamic_preferences (user_id)
  VALUES (NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to automatically create Islamic preferences when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();