-- Create user_levels table for tracking user progression
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level TEXT NOT NULL DEFAULT 'bronze',
  total_xp INTEGER NOT NULL DEFAULT 0,
  level_progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_challenge_progress table
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create login_streaks table
CREATE TABLE IF NOT EXISTS public.login_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create leaderboard view for top users
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  ul.user_id,
  p.full_name,
  p.avatar_url,
  ul.current_level,
  ul.total_xp,
  ls.current_streak,
  ls.longest_streak,
  ROW_NUMBER() OVER (ORDER BY ul.total_xp DESC) as rank
FROM public.user_levels ul
JOIN public.profiles p ON p.user_id = ul.user_id
LEFT JOIN public.login_streaks ls ON ls.user_id = ul.user_id
ORDER BY ul.total_xp DESC
LIMIT 100;

-- Enable RLS on all tables
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_levels
CREATE POLICY "Users can view own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level" ON public.user_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level" ON public.user_levels
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for weekly_challenges
CREATE POLICY "Anyone can view active challenges" ON public.weekly_challenges
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_challenge_progress
CREATE POLICY "Users can view own progress" ON public.user_challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for login_streaks
CREATE POLICY "Users can view own streaks" ON public.login_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.login_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.login_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level TEXT;
  xp_for_next_level INTEGER;
BEGIN
  -- Determine level based on XP thresholds
  IF NEW.total_xp >= 10000 THEN
    new_level := 'platine';
    xp_for_next_level := 10000;
  ELSIF NEW.total_xp >= 5000 THEN
    new_level := 'or';
    xp_for_next_level := 5000;
  ELSIF NEW.total_xp >= 2000 THEN
    new_level := 'argent';
    xp_for_next_level := 2000;
  ELSE
    new_level := 'bronze';
    xp_for_next_level := 0;
  END IF;

  -- Update level and progress
  NEW.current_level := new_level;
  NEW.level_progress := ((NEW.total_xp - xp_for_next_level) * 100) / 
    CASE new_level
      WHEN 'bronze' THEN 2000
      WHEN 'argent' THEN 3000
      WHEN 'or' THEN 5000
      ELSE 10000
    END;
  NEW.updated_at := now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update level
CREATE TRIGGER update_level_on_xp_change
  BEFORE UPDATE OF total_xp ON public.user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Function to track login streaks
CREATE OR REPLACE FUNCTION public.update_login_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  streak_record RECORD;
  days_diff INTEGER;
BEGIN
  -- Get current streak record
  SELECT * INTO streak_record
  FROM public.login_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO public.login_streaks (user_id, current_streak, longest_streak, last_login_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
  ELSE
    -- Calculate days difference
    days_diff := CURRENT_DATE - streak_record.last_login_date;

    IF days_diff = 0 THEN
      -- Same day, no update needed
      RETURN;
    ELSIF days_diff = 1 THEN
      -- Consecutive day, increment streak
      UPDATE public.login_streaks
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_login_date = CURRENT_DATE,
        updated_at = now()
      WHERE user_id = p_user_id;
    ELSE
      -- Streak broken, reset
      UPDATE public.login_streaks
      SET 
        current_streak = 1,
        last_login_date = CURRENT_DATE,
        updated_at = now()
      WHERE user_id = p_user_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to add XP and update level
CREATE OR REPLACE FUNCTION public.add_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_levels (user_id, total_xp)
  VALUES (p_user_id, p_xp_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET total_xp = user_levels.total_xp + p_xp_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for performance
CREATE INDEX idx_user_levels_user_id ON public.user_levels(user_id);
CREATE INDEX idx_user_levels_xp ON public.user_levels(total_xp DESC);
CREATE INDEX idx_weekly_challenges_active ON public.weekly_challenges(is_active, week_start, week_end);
CREATE INDEX idx_user_challenge_progress_user ON public.user_challenge_progress(user_id);
CREATE INDEX idx_login_streaks_user ON public.login_streaks(user_id);