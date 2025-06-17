
-- Comprehensive RLS Security Implementation
-- This migration implements all critical security policies

-- Enable RLS on all tables that don't have it yet
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wali_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other visible profiles" ON public.profiles;

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view other visible profiles"
  ON public.profiles
  FOR SELECT
  USING (
    id != auth.uid() AND 
    is_visible = true AND
    (NOT (auth.uid()::text = ANY(blocked_users)) OR blocked_users IS NULL)
  );

-- CONVERSATIONS TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations they are part of" ON public.conversations;

CREATE POLICY "Users can view their conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can insert conversations they are part of"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid()::text = ANY(participants));

CREATE POLICY "Users can update their conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid()::text = ANY(participants));

-- MESSAGES TABLE POLICIES
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can view their messages"
  ON public.messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE auth.uid()::text = ANY(participants)
    )
  );

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE auth.uid()::text = ANY(participants)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (sender_id = auth.uid());

-- COMPATIBILITY RESULTS POLICIES
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

-- CHAT REQUESTS POLICIES
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

-- CONTENT FLAGS POLICIES
CREATE POLICY "Users can view their own content reports"
  ON public.content_flags
  FOR SELECT
  USING (flagged_by = auth.uid());

CREATE POLICY "Users can create content flags"
  ON public.content_flags
  FOR INSERT
  WITH CHECK (flagged_by = auth.uid());

-- VIDEO CALLS POLICIES
CREATE POLICY "Users can view video calls they participate in"
  ON public.video_calls
  FOR SELECT
  USING (
    initiator_id = auth.uid() OR
    receiver_id = auth.uid()
  );

CREATE POLICY "Users can create video calls"
  ON public.video_calls
  FOR INSERT
  WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Users can update video calls they participate in"
  ON public.video_calls
  FOR UPDATE
  USING (
    initiator_id = auth.uid() OR
    receiver_id = auth.uid()
  );

-- WALI PROFILES POLICIES
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

-- MATCH NOTIFICATIONS POLICIES
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

-- SUBSCRIBERS POLICIES
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

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with comprehensive RLS policies for data protection';
COMMENT ON TABLE public.messages IS 'Messages with conversation-based access control';
COMMENT ON TABLE public.conversations IS 'Conversations with participant-based access control';
