-- Create video_calls table for managing video call sessions
CREATE TABLE public.video_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  meeting_id TEXT NOT NULL,
  meeting_link TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'webrtc', -- 'webrtc', 'google_meet'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NULL,
  scheduled_end_time TIMESTAMP WITH TIME ZONE NULL,
  participants TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'active', 'ended', 'cancelled'
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for video_calls
CREATE POLICY "Users can view their own video calls" ON public.video_calls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = video_calls.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can create video calls for their matches" ON public.video_calls
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = video_calls.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own video calls" ON public.video_calls
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = video_calls.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_video_calls_updated_at
  BEFORE UPDATE ON public.video_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_video_calls_match_id ON public.video_calls(match_id);
CREATE INDEX idx_video_calls_meeting_id ON public.video_calls(meeting_id);
CREATE INDEX idx_video_calls_status ON public.video_calls(status);