
-- Create a table to track user sessions and status
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_info JSONB DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can read user sessions
CREATE POLICY "User sessions are viewable by everyone" 
ON public.user_sessions FOR SELECT USING (true);

-- Only the user or admin can update their own session
CREATE POLICY "Users can update own session"
ON public.user_sessions FOR UPDATE USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'role' = 'admin'
);

-- Users can insert their own session
CREATE POLICY "Users can insert own session"
ON public.user_sessions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Create a function to update last_active timestamp
CREATE OR REPLACE FUNCTION public.update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_active = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_active
CREATE TRIGGER update_user_sessions_last_active
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.update_user_last_active();

-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user_session()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_sessions (user_id, status, last_active)
  VALUES (NEW.id, 'offline', now())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create a user session record when a user is created
CREATE TRIGGER on_auth_user_created_session
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_session();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active);
