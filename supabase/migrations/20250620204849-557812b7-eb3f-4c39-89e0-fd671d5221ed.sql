
-- Create security_events table for logging security-related activities
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  device_fingerprint TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security_events
CREATE POLICY "Users can view their own security events" 
  ON public.security_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security events" 
  ON public.security_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin policy to view all security events
CREATE POLICY "Admins can view all security events" 
  ON public.security_events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
