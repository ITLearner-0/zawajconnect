
-- Enable realtime for the tables we need to monitor
ALTER TABLE public.compatibility_results REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add the tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE compatibility_results;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Create a function to notify when new compatibility results are added
CREATE OR REPLACE FUNCTION notify_new_compatibility_result()
RETURNS trigger AS $$
BEGIN
  -- This will be used by our realtime subscription
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new compatibility results
CREATE TRIGGER on_compatibility_result_insert
  AFTER INSERT ON public.compatibility_results
  FOR EACH ROW EXECUTE FUNCTION notify_new_compatibility_result();

-- Create a function to handle profile updates that might affect compatibility
CREATE OR REPLACE FUNCTION handle_profile_compatibility_update()
RETURNS trigger AS $$
BEGIN
  -- Check if fields that affect compatibility have changed
  IF (OLD.religious_practice_level IS DISTINCT FROM NEW.religious_practice_level) OR
     (OLD.location IS DISTINCT FROM NEW.location) OR
     (OLD.education_level IS DISTINCT FROM NEW.education_level) OR
     (OLD.birth_date IS DISTINCT FROM NEW.birth_date) THEN
    
    -- Mark this profile for compatibility recalculation
    -- This will trigger realtime notifications
    NEW.updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
CREATE TRIGGER on_profile_compatibility_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profile_compatibility_update();

-- Create a table to track match notifications
CREATE TABLE IF NOT EXISTS public.match_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_user_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_match', 'score_update', 'profile_update')),
  score INTEGER,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on match notifications
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for match notifications
CREATE POLICY "Users can view their own notifications" ON public.match_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.match_notifications
  FOR INSERT WITH CHECK (true);

-- Add match notifications to realtime
ALTER TABLE public.match_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE match_notifications;
