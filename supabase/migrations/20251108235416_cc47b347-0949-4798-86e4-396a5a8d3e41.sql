-- Create webrtc_calls table for WebRTC call persistence
CREATE TABLE IF NOT EXISTS public.webrtc_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  callee_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'connecting', 'connected', 'ended', 'rejected', 'failed', 'missed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  connected_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  quality_metrics JSONB DEFAULT '{}'::jsonb,
  family_notified BOOLEAN DEFAULT false,
  end_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webrtc_calls ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_webrtc_calls_match_id ON public.webrtc_calls(match_id);
CREATE INDEX idx_webrtc_calls_caller_id ON public.webrtc_calls(caller_id);
CREATE INDEX idx_webrtc_calls_callee_id ON public.webrtc_calls(callee_id);
CREATE INDEX idx_webrtc_calls_started_at ON public.webrtc_calls(started_at DESC);
CREATE INDEX idx_webrtc_calls_status ON public.webrtc_calls(status);

-- RLS Policies: Match participants can view their calls
CREATE POLICY "Match participants can view their calls"
ON public.webrtc_calls
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = webrtc_calls.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- RLS Policies: Match participants can create calls
CREATE POLICY "Match participants can create calls"
ON public.webrtc_calls
FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = webrtc_calls.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    AND m.is_mutual = true
    AND m.can_communicate = true
  )
);

-- RLS Policies: Call participants can update their calls
CREATE POLICY "Call participants can update their calls"
ON public.webrtc_calls
FOR UPDATE
USING (
  auth.uid() = caller_id OR auth.uid() = callee_id
);

-- RLS Policies: Family members can view supervised calls
CREATE POLICY "Family members can view supervised calls"
ON public.webrtc_calls
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.family_members fm, public.matches m
    WHERE m.id = webrtc_calls.match_id
    AND fm.invited_user_id = auth.uid()
    AND (fm.user_id = m.user1_id OR fm.user_id = m.user2_id)
    AND fm.invitation_status = 'accepted'
    AND fm.can_view_profile = true
  )
);

-- Add to realtime publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.webrtc_calls;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_webrtc_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webrtc_calls_updated_at_trigger
BEFORE UPDATE ON public.webrtc_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_webrtc_calls_updated_at();

COMMENT ON TABLE public.webrtc_calls IS 'Stores metadata for all WebRTC audio and video calls between matched users';