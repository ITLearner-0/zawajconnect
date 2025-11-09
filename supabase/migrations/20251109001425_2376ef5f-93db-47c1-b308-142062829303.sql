-- Create call_feedback table for post-call quality ratings
CREATE TABLE IF NOT EXISTS public.call_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  audio_quality TEXT CHECK (audio_quality IN ('excellent', 'good', 'fair', 'poor')),
  video_quality TEXT CHECK (video_quality IN ('excellent', 'good', 'fair', 'poor', 'not_applicable')),
  connection_stability TEXT CHECK (connection_stability IN ('excellent', 'good', 'fair', 'poor')),
  technical_issues TEXT[], -- Array of technical issues
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for better query performance
CREATE INDEX idx_call_feedback_call_id ON public.call_feedback(call_id);
CREATE INDEX idx_call_feedback_user_id ON public.call_feedback(user_id);
CREATE INDEX idx_call_feedback_rating ON public.call_feedback(rating);
CREATE INDEX idx_call_feedback_created_at ON public.call_feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.call_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON public.call_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.call_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.call_feedback IS 'Stores user feedback for calls to improve quality';
COMMENT ON COLUMN public.call_feedback.rating IS 'Overall call quality rating from 1 to 5 stars';
COMMENT ON COLUMN public.call_feedback.technical_issues IS 'Array of technical issues encountered during the call';