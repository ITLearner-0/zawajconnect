-- Create user verification table
CREATE TABLE public.user_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  id_verified BOOLEAN DEFAULT false,
  family_verified BOOLEAN DEFAULT false,
  verification_score INTEGER DEFAULT 0,
  verification_documents TEXT[],
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family members table
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL CHECK (relationship IN ('father', 'mother', 'brother', 'sister', 'guardian', 'wali')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  can_view_profile BOOLEAN DEFAULT false,
  can_communicate BOOLEAN DEFAULT false,
  is_wali BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy settings table
CREATE TABLE public.privacy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'verified_only', 'private')),
  photo_visibility TEXT DEFAULT 'matches_only' CHECK (photo_visibility IN ('public', 'matches_only', 'verified_only', 'private')),
  contact_visibility TEXT DEFAULT 'matches_only' CHECK (contact_visibility IN ('public', 'matches_only', 'family_only', 'private')),
  last_seen_visibility TEXT DEFAULT 'matches_only' CHECK (last_seen_visibility IN ('everyone', 'matches_only', 'nobody')),
  allow_messages_from TEXT DEFAULT 'matches_only' CHECK (allow_messages_from IN ('everyone', 'verified_only', 'matches_only')),
  allow_profile_views BOOLEAN DEFAULT true,
  allow_family_involvement BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('inappropriate_content', 'fake_profile', 'harassment', 'spam', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Islamic guidance articles table
CREATE TABLE public.islamic_guidance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marriage_prep', 'islamic_values', 'family_life', 'courtship_etiquette', 'wedding_planning')),
  author TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.islamic_guidance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_verifications
CREATE POLICY "Users can view their own verification status" 
ON public.user_verifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification info" 
ON public.user_verifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for family_members
CREATE POLICY "Users can manage their own family members" 
ON public.family_members FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for privacy_settings
CREATE POLICY "Users can manage their own privacy settings" 
ON public.privacy_settings FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports" 
ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for Islamic guidance (public read)
CREATE POLICY "Everyone can read published guidance" 
ON public.islamic_guidance FOR SELECT USING (published = true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_verifications_updated_at
  BEFORE UPDATE ON public.user_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_islamic_guidance_updated_at
  BEFORE UPDATE ON public.islamic_guidance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create verification and privacy settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create verification record
  INSERT INTO public.user_verifications (user_id, email_verified)
  VALUES (NEW.user_id, true); -- Email is verified through Supabase auth
  
  -- Create privacy settings with default values
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create settings when profile is created
CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

-- Insert some sample Islamic guidance articles
INSERT INTO public.islamic_guidance (title, content, category, author, featured) VALUES
('The Islamic Approach to Marriage', 'Marriage in Islam is considered half of faith (nusf al-din). It is a sacred contract that brings two souls together in the sight of Allah...', 'islamic_values', 'Islamic Scholar', true),
('Preparing for Marriage: A Muslim Guide', 'Before entering into marriage, it is important to prepare spiritually, emotionally, and practically. This includes understanding your responsibilities...', 'marriage_prep', 'Marriage Counselor', true),
('The Role of Family in Islamic Matrimony', 'In Islamic culture, marriage is not just between two individuals but between two families. The involvement of family members, especially the wali...', 'family_life', 'Islamic Scholar', false),
('Halal Courtship Guidelines', 'Islamic courtship should be conducted with respect, modesty, and the presence of family. Key principles include maintaining boundaries...', 'courtship_etiquette', 'Islamic Advisor', false),
('Planning an Islamic Wedding', 'An Islamic wedding celebration should reflect Islamic values while bringing joy to the community. Key elements include the nikah ceremony...', 'wedding_planning', 'Wedding Planner', false);