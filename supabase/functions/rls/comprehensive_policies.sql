
-- Comprehensive RLS Policies for Security Hardening

-- Enable RLS on all critical tables
ALTER TABLE public.wali_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Wali Profiles Policies
CREATE POLICY "Users can view their own wali profile"
  ON public.wali_profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own wali profile"
  ON public.wali_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wali profile"
  ON public.wali_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Match Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON public.match_notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.match_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.match_notifications
  FOR UPDATE
  USING (user_id = auth.uid());

-- Compatibility Results Policies
CREATE POLICY "Users can view their own compatibility results"
  ON public.compatibility_results
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own compatibility results"
  ON public.compatibility_results
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own compatibility results"
  ON public.compatibility_results
  FOR UPDATE
  USING (user_id = auth.uid());

-- Compatibility Scores Policies
CREATE POLICY "Users can view compatibility scores involving them"
  ON public.compatibility_scores
  FOR SELECT
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "System can create compatibility scores"
  ON public.compatibility_scores
  FOR INSERT
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Chat Requests Policies
CREATE POLICY "Users can view chat requests involving them"
  ON public.chat_requests
  FOR SELECT
  USING (
    requester_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    wali_id = auth.uid()
  );

CREATE POLICY "Users can create chat requests"
  ON public.chat_requests
  FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update chat requests involving them"
  ON public.chat_requests
  FOR UPDATE
  USING (
    requester_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    wali_id = auth.uid()
  );

-- Content Flags Policies
CREATE POLICY "Users can view their own content reports"
  ON public.content_flags
  FOR SELECT
  USING (flagged_by = auth.uid());

CREATE POLICY "Users can create content flags"
  ON public.content_flags
  FOR INSERT
  WITH CHECK (flagged_by = auth.uid());

CREATE POLICY "Moderators can view all content flags"
  ON public.content_flags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Video Calls Policies
CREATE POLICY "Users can view video calls they participate in"
  ON public.video_calls
  FOR SELECT
  USING (
    auth.uid()::text = ANY(participants) OR
    supervisor_id = auth.uid()
  );

CREATE POLICY "Users can create video calls they participate in"
  ON public.video_calls
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = ANY(participants)
  );

CREATE POLICY "Participants can update video calls"
  ON public.video_calls
  FOR UPDATE
  USING (
    auth.uid()::text = ANY(participants) OR
    supervisor_id = auth.uid()
  );

-- Subscribers Policies
CREATE POLICY "Users can view their own subscription data"
  ON public.subscribers
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription data"
  ON public.subscribers
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create subscription records"
  ON public.subscribers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
